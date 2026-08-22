mod campaign_manager;
mod protocol;
mod room;
mod state;
mod ws;

use axum::body::Bytes;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::Json;
use axum::routing::{get, post};
use axum::Router;
use protocol::{CreateRoomRequest, CreateRoomResponse, RoomInfo};
use room::Room;
use state::AppState;
use std::collections::HashMap;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

async fn create_room(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateRoomRequest>,
) -> Result<Json<CreateRoomResponse>, StatusCode> {
    let gm_token = uuid::Uuid::new_v4().to_string();
    let max_players = request.max_players.unwrap_or(state::MAX_PARTICIPANTS_PER_ROOM);

    let room = Room::new(
        request.room_name,
        request.gm_name,
        gm_token.clone(),
        request.access_code.clone(),
        max_players,
    );

    let room_id = state.create_room(room).await.map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;
    info!("Room created: {}", room_id);

    Ok(Json(CreateRoomResponse {
        room_id,
        gm_token,
        access_code: request.access_code,
    }))
}

async fn get_room_info(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
) -> Result<Json<RoomInfo>, StatusCode> {
    let room = state.get_room(&room_id).await.ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(room.public_info()))
}

/// Загрузка кампании от GM (ZIP)
async fn upload_campaign(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    body: Bytes,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if state.get_room(&room_id).await.is_none() {
        return Err(StatusCode::NOT_FOUND);
    }

    let campaign_id = room_id.clone(); // Используем room_id как campaign_id

    match state.campaign_manager.update_campaign_from_zip(&campaign_id, body.to_vec()).await {
        Ok(_) => {
            state.set_room_campaign(&room_id, campaign_id.clone()).await.ok();
            info!("Campaign uploaded for room {}", room_id);
            Ok(Json(serde_json::json!({ "success": true, "campaign_id": campaign_id })))
        }
        Err(e) => {
            tracing::error!("Failed to upload campaign: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}

/// Получение данных кампании с фильтрацией по роли
async fn get_campaign_entities(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    axum::extract::Query(params): axum::extract::Query<HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // 1. Проверяем наличие campaign_id у комнаты
    let campaign_id = match state.get_room_campaign_id(&room_id).await {
        Some(id) => id,
        None => {
            tracing::error!("Room {} has no campaign_id attached", room_id);
            return Err(StatusCode::NOT_FOUND);
        }
    };

    // 2. Проверяем существование комнаты и валидацию токена
    let token = params.get("token").cloned().unwrap_or_default();
    let room = match state.get_room(&room_id).await {
        Some(r) => r,
        None => {
            tracing::error!("Room {} not found in memory", room_id);
            return Err(StatusCode::NOT_FOUND);
        }
    };

    let is_gm = room.validate_gm_token(&token);
    tracing::info!("Fetching entities for room {}, is_gm: {}", room_id, is_gm);

    // 3. Получаем данные в зависимости от роли
    let json_value = if is_gm {
        match state.campaign_manager.get_gm_view(&campaign_id).await {
            Ok(v) => {
                serde_json::to_value(v).map_err(|e| {
                    tracing::error!("Failed to serialize GM view: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
            }
            Err(e) => {
                tracing::error!("Failed to get GM view for campaign {}: {}", campaign_id, e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    } else {
        match state.campaign_manager.get_player_view(&campaign_id).await {
            Ok(v) => {
                serde_json::to_value(v).map_err(|e| {
                    tracing::error!("Failed to serialize Player view: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
            }
            Err(e) => {
                tracing::error!("Failed to get Player view for campaign {}: {}", campaign_id, e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    };

    tracing::info!("Successfully serialized campaign view for room {}", room_id);
    Ok(Json(json_value))
}

/// Получение ассета по хэшу (ленивая загрузка)
async fn get_asset(
    State(state): State<Arc<AppState>>,
    Path((room_id, hash)): Path<(String, String)>,
) -> Result<Vec<u8>, StatusCode> {
    let campaign_id = state.get_room_campaign_id(&room_id).await.ok_or(StatusCode::NOT_FOUND)?;

    let asset_path = state.campaign_manager.get_asset_by_hash(&campaign_id, &hash).await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    std::fs::read(&asset_path).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let state = Arc::new(AppState::new());

    let cleanup_state = state.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
        loop {
            interval.tick().await;
            cleanup_state.cleanup_inactive_rooms().await;
        }
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/rooms", post(create_room))
        .route("/api/rooms/:room_id", get(get_room_info))
        .route("/api/rooms/:room_id/campaign", post(upload_campaign))
        .route("/api/rooms/:room_id/entities", get(get_campaign_entities))
        .route("/api/rooms/:room_id/assets/:hash", get(get_asset))
        .route("/ws/:room_id", get(ws::ws_handler))
        .layer(cors)
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3001));
    info!("Relay server starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

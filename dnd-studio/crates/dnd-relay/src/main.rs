mod protocol;
mod room;
mod state;
mod ws;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::Json;
use axum::routing::{get, post};
use axum::Router;
use protocol::{CreateRoomRequest, CreateRoomResponse, RoomInfo};
use room::Room;
use state::AppState;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info};

/// Health check
async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

/// Создание комнаты
async fn create_room(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateRoomRequest>,
) -> Result<Json<CreateRoomResponse>, StatusCode> {
    let gm_token = uuid::Uuid::new_v4().to_string();

    let max_players = request
        .max_players
        .unwrap_or(state::MAX_PARTICIPANTS_PER_ROOM);

    let room = Room::new(
        request.room_name,
        request.gm_name,
        gm_token.clone(),
        request.access_code.clone(),
        max_players,
    );

    let room_id = state
        .create_room(room)
        .await
        .map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;

    info!("Room created: {}", room_id);

    Ok(Json(CreateRoomResponse {
        room_id,
        gm_token,
        access_code: request.access_code,
    }))
}

/// Информация о комнате
async fn get_room_info(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
) -> Result<Json<RoomInfo>, StatusCode> {
    let room = state
        .get_room(&room_id)
        .await
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(room.public_info()))
}

use axum::body::Bytes;

/// Загрузка файла кампании (GM)
async fn upload_campaign(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    body: Bytes,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if state.get_room(&room_id).await.is_none() {
        return Err(StatusCode::NOT_FOUND);
    }

    let body_size = body.len();
    info!(
        "Campaign upload request for room {}: {} bytes",
        room_id, body_size
    );

    if body_size == 0 {
        error!("Empty campaign file received for room {}", room_id);
        return Err(StatusCode::BAD_REQUEST);
    }

    match state.store_campaign_file(&room_id, body.to_vec()).await {
        Ok(size) => {
            info!("Campaign file stored for room {}: {} bytes", room_id, size);
            Ok(Json(serde_json::json!({
                "success": true,
                "file_size": size,
            })))
        }
        Err(e) => {
            error!("Failed to store campaign for room {}: {}", room_id, e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}

/// Скачивание файла кампании (Player)
async fn download_campaign(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
) -> Result<Vec<u8>, StatusCode> {
    info!("Campaign download request for room {}", room_id);

    match state.read_campaign_file(&room_id).await {
        Ok(data) => {
            info!(
                "Campaign file served for room {}: {} bytes",
                room_id,
                data.len()
            );
            Ok(data)
        }
        Err(e) => {
            error!("Failed to serve campaign for room {}: {}", room_id, e);
            Err(StatusCode::NOT_FOUND)
        }
    }
}

/// Информация о файле кампании
async fn campaign_info(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let has_file = state.has_campaign_file(&room_id).await;
    let file_size = state.get_campaign_file_size(&room_id).await;

    Ok(Json(serde_json::json!({
        "has_campaign": has_file,
        "file_size": file_size,
    })))
}

#[tokio::main]
async fn main() {
    // Инициализация логирования
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("dnd_relay=debug,info")),
        )
        .init();

    let state = Arc::new(AppState::new());

    // Фоновая задача очистки неактивных комнат
    let cleanup_state = state.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
        loop {
            interval.tick().await;
            cleanup_state.cleanup_inactive_rooms().await;
        }
    });

    // Настраиваем CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Роутер — используем :param синтаксис для Axum 0.7
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/rooms", post(create_room))
        .route("/api/rooms/:room_id", get(get_room_info))
        // Campaign file endpoints
        .route("/api/rooms/:room_id/campaign", post(upload_campaign))
        .route("/api/rooms/:room_id/campaign", get(download_campaign))
        .route("/api/rooms/:room_id/campaign/info", get(campaign_info))
        // WebSocket
        .route("/ws/:room_id", get(ws::ws_handler))
        .layer(cors)
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3001));

    info!("Relay server starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app).await.unwrap();
}

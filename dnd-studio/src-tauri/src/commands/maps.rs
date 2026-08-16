use crate::{commands::require_db, state::AppPaths};
use crate::state::AppState;
use base64::Engine;
use dnd_core::{AppError, MapSummary};
use std::path::Path;
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_map(
    state: State<'_, AppState>,
    name: String,
    width: i32,
    height: i32,
    grid_size: i32,
) -> Result<MapSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    let world_id = db.default_world_id().await?;

    db.create_map(&world_id, &name, width, height, grid_size)
        .await
}

#[tauri::command]
#[specta::specta]
pub async fn list_maps(state: State<'_, AppState>) -> Result<Vec<MapSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_maps().await
}

#[tauri::command]
#[specta::specta]
pub async fn get_map(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<MapSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_map(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn import_map_image(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    map_id: String,
    source_path: String,
) -> Result<MapSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    // Проверяем, что карта существует
    db.get_map(&map_id).await?.ok_or(AppError::NotFound)?;

    // Импортируем ассет через пайплайн
    let asset =
        crate::commands::assets::import_asset_inner(&db, &paths, &source_path, "map").await?;

    // Привязываем ассет к карте
    db.update_map_asset(&map_id, Some(asset.id.clone())).await?;

    // Обновляем размеры карты из изображения
    if let (Some(w), Some(h)) = (asset.width, asset.height) {
        db.update_map_dimensions(&map_id, w, h).await?;
    }

    db.get_map(&map_id).await?.ok_or(AppError::NotFound)
}

#[tauri::command]
#[specta::specta]
pub async fn read_campaign_asset_data_url(
    state: State<'_, AppState>,
    relative_path: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let path = db.resolve_asset_path(&relative_path)?;

    if !path.exists() {
        return Err(AppError::NotFound);
    }

    let bytes = std::fs::read(&path).map_err(AppError::io)?;

    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_default();

    let mime = match extension.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        _ => "application/octet-stream",
    };

    let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);

    Ok(format!("data:{mime};base64,{encoded}"))
}

#[tauri::command]
#[specta::specta]
pub async fn update_map_fog(
    state: State<'_, AppState>,
    map_id: String,
    fog_data: Option<String>,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_map_fog(&map_id, fog_data).await
}

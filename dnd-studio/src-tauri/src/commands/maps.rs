use crate::commands::require_db;
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
    map_id: String,
    source_path: String,
) -> Result<MapSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_map(&map_id).await?.ok_or(AppError::NotFound)?;

    let source = Path::new(&source_path);

    if !source.exists() {
        return Err(AppError::Validation(
            "Source image file not found".to_string(),
        ));
    }

    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .ok_or_else(|| AppError::Validation("Image extension is required".to_string()))?;

    if !matches!(extension.as_str(), "png" | "jpg" | "jpeg" | "webp" | "gif") {
        return Err(AppError::Validation(
            "Unsupported image type. Use png, jpg, jpeg, webp or gif".to_string(),
        ));
    }

    let maps_dir = db.assets_dir().join("maps");

    std::fs::create_dir_all(&maps_dir).map_err(AppError::io)?;

    let destination = maps_dir.join(format!("{map_id}.{extension}"));

    std::fs::copy(source, &destination).map_err(AppError::io)?;

    let relative_image_path = format!("maps/{map_id}.{extension}");

    db.update_map_image_path(&map_id, &relative_image_path)
        .await
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

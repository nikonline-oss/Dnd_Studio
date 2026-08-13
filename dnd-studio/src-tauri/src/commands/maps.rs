use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, MapSummary};
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
pub async fn list_maps(
    state: State<'_, AppState>,
) -> Result<Vec<MapSummary>, AppError> {
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
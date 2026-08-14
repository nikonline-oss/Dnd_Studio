use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, TokenSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_token(
    state: State<'_, AppState>,
    map_id: String,
    x: f64,
    y: f64,
    character_id: Option<String>,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_token(&map_id, x, y, character_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_tokens(
    state: State<'_, AppState>,
    map_id: String,
) -> Result<Vec<TokenSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_tokens(&map_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn move_token(
    state: State<'_, AppState>,
    token_id: String,
    x: f64,
    y: f64,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.move_token(&token_id, x, y).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_token(
    state: State<'_, AppState>,
    token_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.delete_token(&token_id).await
}
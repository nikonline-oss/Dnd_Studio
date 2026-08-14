use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, CharacterSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_character(
    state: State<'_, AppState>,
    name: String,
    character_type: String,
) -> Result<CharacterSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_character(&name, &character_type).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_characters(
    state: State<'_, AppState>,
) -> Result<Vec<CharacterSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_characters().await
}
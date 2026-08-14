use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, CharacterDetail, CharacterSummary};
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

#[tauri::command]
#[specta::specta]
pub async fn get_character(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<CharacterDetail>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_character(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_character(
    state: State<'_, AppState>,
    id: String,
    name: String,
    character_type: String,
    data_json: String,
) -> Result<CharacterDetail, AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_character(&id, &name, &character_type, &data_json)
        .await
}
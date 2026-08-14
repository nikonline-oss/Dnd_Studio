use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, CompendiumEntrySummary, CompendiumSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn list_compendiums(
    state: State<'_, AppState>,
) -> Result<Vec<CompendiumSummary>, AppError> {
    let db = require_db(&state.campaign).await?;
    db.list_compendiums().await
}

#[tauri::command]
#[specta::specta]
pub async fn list_compendium_entries(
    state: State<'_, AppState>,
    compendium_id: String,
) -> Result<Vec<CompendiumEntrySummary>, AppError> {
    let db = require_db(&state.campaign).await?;
    db.list_compendium_entries(&compendium_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_compendium(
    state: State<'_, AppState>,
    name: String,
    compendium_type: String,
) -> Result<CompendiumSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.create_compendium(&name, &compendium_type).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_compendium_entry(
    state: State<'_, AppState>,
    compendium_id: String,
    entry_key: String,
    name: String,
    data_json: String,
) -> Result<CompendiumEntrySummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.create_compendium_entry(&compendium_id, &entry_key, &name, &data_json)
        .await
}

#[tauri::command]
#[specta::specta]
pub async fn update_compendium(
    state: State<'_, AppState>,
    id: String,
    name: String,
    compendium_type: String,
) -> Result<CompendiumSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.update_compendium(&id, &name, &compendium_type).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_compendium(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;
    db.delete_compendium(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_compendium_entry(
    state: State<'_, AppState>,
    id: String,
    name: String,
    data_json: String,
) -> Result<CompendiumEntrySummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.update_compendium_entry(&id, &name, &data_json).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_compendium_entry(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;
    db.delete_compendium_entry(&id).await
}
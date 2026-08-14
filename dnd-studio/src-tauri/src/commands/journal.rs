use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, JournalEntryDetail, JournalEntrySummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_journal_entry(
    state: State<'_, AppState>,
    title: String,
    folder_path: String,
) -> Result<JournalEntrySummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_journal_entry(&title, &folder_path).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_journal_entries(
    state: State<'_, AppState>,
) -> Result<Vec<JournalEntrySummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_journal_entries().await
}

#[tauri::command]
#[specta::specta]
pub async fn get_journal_entry(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<JournalEntryDetail>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_journal_entry(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_journal_entry(
    state: State<'_, AppState>,
    id: String,
    title: String,
    content_markdown: String,
    folder_path: String,
    is_visible_to_players: bool,
) -> Result<JournalEntryDetail, AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_journal_entry(
        &id,
        &title,
        &content_markdown,
        &folder_path,
        is_visible_to_players,
    )
    .await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_journal_entry(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.delete_journal_entry(&id).await
}
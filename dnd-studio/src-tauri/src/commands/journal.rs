use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, JournalEntryDetail, JournalEntrySummary, JournalLinkSummary};
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
    visibility: String,
    players_can_edit: bool,
) -> Result<JournalEntryDetail, AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_journal_entry(
        &id,
        &title,
        &content_markdown,
        &folder_path,
        &visibility,
        players_can_edit,
    )
    .await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_journal_entry(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.delete_journal_entry(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_journal_links(
    state: State<'_, AppState>,
    entry_id: String,
) -> Result<Vec<JournalLinkSummary>, AppError> {
    let db = require_db(&state.campaign).await?;
    db.list_journal_links(&entry_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_journal_link(
    state: State<'_, AppState>,
    source_entry_id: String,
    target_type: String,
    target_id: String,
    link_type: String,
    is_directed: bool,
    label: Option<String>,
) -> Result<JournalLinkSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_journal_link(
        &source_entry_id,
        &target_type,
        &target_id,
        &link_type,
        is_directed,
        label,
    )
    .await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_journal_link(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;
    db.delete_journal_link(&id).await
}

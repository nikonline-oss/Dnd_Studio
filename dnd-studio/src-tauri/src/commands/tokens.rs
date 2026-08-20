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
    map_id: String,
    token_id: String,
    x: f64,
    y: f64,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.move_token(&map_id, &token_id, x, y).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_token(
    state: State<'_, AppState>,
    map_id: String,
    token_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.delete_token(&map_id, &token_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn assign_token_character(
    state: State<'_, AppState>,
    map_id: String,
    token_id: String,
    character_id: Option<String>,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.assign_token_character(&map_id, &token_id, character_id)
        .await
}

/// Возвращает все токены кампании (для дерева навигатора)
#[tauri::command]
#[specta::specta]
pub async fn list_all_tokens(
    state: State<'_, AppState>,
) -> Result<Vec<TokenSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    let rows = sqlx::query_as::<
        _,
        (
            String,
            String,
            Option<String>,
            Option<String>,
            f64,
            f64,
            f64,
            f64,
            i32,
            String,
            i32,
            Option<String>,
        ),
    >(
        r#"
        SELECT
            t.id, t.map_id, t.character_id, t.asset_id,
            t.x, t.y, t.rotation, t.scale, t.is_visible, t.layer, t.version,
            c.name
        FROM tokens t
        LEFT JOIN characters c ON c.id = t.character_id
        ORDER BY t.map_id, t.rowid
        "#,
    )
    .fetch_all(db.pool())
    .await
    .map_err(AppError::db)?;

    Ok(rows
        .into_iter()
        .map(
            |(
                id,
                map_id,
                character_id,
                asset_id,
                x,
                y,
                rotation,
                scale,
                is_visible,
                layer,
                version,
                character_name,
            )| TokenSummary {
                id,
                map_id,
                character_id,
                asset_id,
                x,
                y,
                rotation,
                scale,
                is_visible: is_visible != 0,
                layer,
                version,
                character_name,
            },
        )
        .collect())
}
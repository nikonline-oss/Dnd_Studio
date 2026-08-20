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

/// Удаляет персонажа. Токены, связанные с ним, останутся (character_id = NULL через FK).
#[tauri::command]
#[specta::specta]
pub async fn delete_character(
    state: State<'_, AppState>,
    character_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    // Получаем персонажа для доступа к портрету
    let character = db
        .get_character(&character_id)
        .await?
        .ok_or(AppError::NotFound)?;

    // Удаляем персонажа
    let result = sqlx::query("DELETE FROM characters WHERE id = ?")
        .bind(&character_id)
        .execute(db.pool())
        .await
        .map_err(AppError::db)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Удаляем связанный портрет (если есть)
    if let Some(portrait_id) = character.portrait_asset_id {
        let assets_dir = db.assets_dir();
        let file_path = assets_dir
            .join("portrait")
            .join(format!("{}.webp", portrait_id));
        let thumb_path = assets_dir
            .join("portrait")
            .join("thumbs")
            .join(format!("{}_thumb.webp", portrait_id));

        if file_path.exists() {
            let _ = std::fs::remove_file(&file_path);
        }

        if thumb_path.exists() {
            let _ = std::fs::remove_file(&thumb_path);
        }

        let _ = db.delete_asset(&portrait_id).await;
    }

    Ok(())
}
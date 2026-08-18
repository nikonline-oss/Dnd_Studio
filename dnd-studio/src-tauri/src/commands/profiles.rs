use crate::state::{AppPaths, AppState};
use dnd_core::AppError;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::State;

/// Информация о профиле
#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ProfileInfo {
    pub id: String,
    pub name: String,
    pub avatar_path: Option<String>,
    pub created_at: i32,
    pub last_active_at: i32,
}

/// Создать новый профиль
#[tauri::command]
#[specta::specta]
pub async fn create_profile(
    paths: State<'_, AppPaths>,
    name: String,
) -> Result<ProfileInfo, AppError> {
    let name = name.trim().to_string();

    if name.is_empty() {
        return Err(AppError::Validation(
            "Profile name is required".to_string(),
        ));
    }

    let profile_id = uuid::Uuid::new_v4().to_string();
    let now = dnd_db::now_unix();

    let profile = ProfileInfo {
        id: profile_id.clone(),
        name,
        avatar_path: None,
        created_at: now,
        last_active_at: now,
    };

    // Создаём директорию профиля
    let profile_dir = paths.profile_dir(&profile_id);
    fs::create_dir_all(&profile_dir).map_err(AppError::io)?;

    // Создаём поддиректории
    fs::create_dir_all(paths.profile_campaigns_dir(&profile_id)).map_err(AppError::io)?;
    fs::create_dir_all(paths.profile_multiplayer_dir(&profile_id)).map_err(AppError::io)?;

    // Сохраняем profile.json
    let meta_path = paths.profile_meta_file(&profile_id);
    fs::write(
        &meta_path,
        serde_json::to_string_pretty(&profile).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(profile)
}

/// Список всех профилей
#[tauri::command]
#[specta::specta]
pub async fn list_profiles(
    paths: State<'_, AppPaths>,
) -> Result<Vec<ProfileInfo>, AppError> {
    let profiles_dir = &paths.profiles_dir;

    if !profiles_dir.exists() {
        return Ok(Vec::new());
    }

    let mut profiles = Vec::new();

    let entries = fs::read_dir(profiles_dir).map_err(AppError::io)?;

    for entry in entries {
        let entry = entry.map_err(AppError::io)?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let meta_path = path.join("profile.json");
        if !meta_path.exists() {
            continue;
        }

        let content = fs::read_to_string(&meta_path).map_err(AppError::io)?;

        match serde_json::from_str::<ProfileInfo>(&content) {
            Ok(profile) => profiles.push(profile),
            Err(_) => continue,
        }
    }

    // Сортируем по last_active_at (последний активный первым)
    profiles.sort_by(|a, b| b.last_active_at.cmp(&a.last_active_at));

    Ok(profiles)
}

/// Удалить профиль
#[tauri::command]
#[specta::specta]
pub async fn delete_profile(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<(), AppError> {
    let profile_dir = paths.profile_dir(&profile_id);

    if !profile_dir.exists() {
        return Err(AppError::NotFound);
    }

    // Закрываем активную кампанию если она из этого профиля
    {
        let mut current = state.campaign.lock().await;
        *current = None;
    }

    // Удаляем директорию профиля
    fs::remove_dir_all(&profile_dir).map_err(AppError::io)?;

    Ok(())
}

/// Обновить last_active_at профиля
#[tauri::command]
#[specta::specta]
pub async fn touch_profile(
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<(), AppError> {
    let meta_path = paths.profile_meta_file(&profile_id);

    if !meta_path.exists() {
        return Err(AppError::NotFound);
    }

    let content = fs::read_to_string(&meta_path).map_err(AppError::io)?;
    let mut profile: ProfileInfo =
        serde_json::from_str(&content).map_err(AppError::io)?;

    profile.last_active_at = dnd_db::now_unix();

    fs::write(
        &meta_path,
        serde_json::to_string_pretty(&profile).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(())
}
use crate::state::{AppPaths, AppState};
use dnd_core::{ActiveCampaign, AppError, CampaignSummary};
use dnd_db::{CampaignDb, CampaignIndexStore};
use std::fs;
use tauri::State;

/// Генерирует slug из имени кампании для использования в имени файла.
fn slugify(input: &str) -> String {
    let slug: String = input
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() {
                c.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect();

    let slug = slug.trim_matches('-').to_string();

    if slug.is_empty() {
        "campaign".to_string()
    } else {
        slug
    }
}

/// Формирует имя файла БД кампании: `{slug}-{short_id}.db`
fn campaign_file_name(name: &str, campaign_id: &str) -> String {
    let slug = slugify(name);
    let short_id = &campaign_id[..8.min(campaign_id.len())];

    format!("{}-{}.db", slug, short_id)
}

/// Создаёт новую кампанию в директории профиля.
#[tauri::command]
#[specta::specta]
pub async fn create_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    name: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    let name = name.trim().to_string();

    if name.is_empty() {
        return Err(AppError::Validation(
            "Campaign name is required".to_string(),
        ));
    }

    // Директория кампаний профиля
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    fs::create_dir_all(&campaigns_dir).map_err(AppError::io)?;

    // Генерируем ID и имя файла
    let campaign_id = uuid::Uuid::new_v4().to_string();
    let file_name = campaign_file_name(&name, &campaign_id);
    let db_path = campaigns_dir.join(&file_name);

    // Проверяем, что файл ещё не существует
    if db_path.exists() {
        return Err(AppError::Validation(format!(
            "Campaign file already exists: {}",
            file_name
        )));
    }

    // Создаём новую БД
    let db = CampaignDb::create(&db_path).await?;

    // Записываем метаданные кампании
    let now = dnd_db::now_unix();

    db.set_meta("id", &campaign_id).await?;
    db.set_meta("name", &name).await?;
    db.set_meta("created_at", &now.to_string()).await?;
    db.set_meta("profile_id", &profile_id).await?;

    // Создаём дефолтный мир для карт
    db.create_default_world().await?;

    // Закрываем БД (будет открыта через open_campaign)
    drop(db);

    // Формируем summary
    let summary = CampaignSummary {
        id: campaign_id.clone(),
        name: name.clone(),
        file_name: file_name.clone(),
        created_at: now,
        last_opened_at: Some(now),
    };

    // Добавляем в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    index_store.upsert(summary.clone())?;

    // Автоматически открываем созданную кампанию
    let db = CampaignDb::open(&db_path).await?;

    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}

/// Возвращает список кампаний профиля.
#[tauri::command]
#[specta::specta]
pub async fn list_campaigns(
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<Vec<CampaignSummary>, AppError> {
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));

    let campaigns = index_store.list()?;

    Ok(campaigns)
}

/// Открывает кампанию по ID.
#[tauri::command]
#[specta::specta]
pub async fn open_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    campaign_id: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    // Ищем кампанию в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    let summary = campaigns
        .iter()
        .find(|c| c.id == campaign_id)
        .cloned()
        .ok_or(AppError::NotFound)?;

    // Формируем путь к файлу БД
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    let db_path = campaigns_dir.join(&summary.file_name);

    if !db_path.exists() {
        return Err(AppError::Validation(format!(
            "Campaign file not found: {}",
            summary.file_name
        )));
    }

    // Закрываем текущую кампанию если есть
    {
        let mut current = state.campaign.lock().await;
        *current = None;
    }

    // Открываем БД
    let db = CampaignDb::open(&db_path).await?;

    // Устанавливаем как активную
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    // Обновляем last_opened_at
    let now = dnd_db::now_unix();
    let updated_summary = CampaignSummary {
        last_opened_at: Some(now),
        ..summary.clone()
    };

    index_store.upsert(updated_summary.clone())?;

    Ok(updated_summary)
}

/// Закрывает активную кампанию.
#[tauri::command]
#[specta::specta]
pub async fn close_campaign(state: State<'_, AppState>) -> Result<(), AppError> {
    let mut current = state.campaign.lock().await;
    *current = None;

    Ok(())
}

/// Возвращает активную кампанию.
#[tauri::command]
#[specta::specta]
pub async fn get_active_campaign(
    state: State<'_, AppState>,
) -> Result<Option<ActiveCampaign>, AppError> {
    let current = state.campaign.lock().await;

    let db = match current.as_ref() {
        Some(db) => db,
        None => return Ok(None),
    };

    let meta = db.meta().await?;
    let path = db.path().to_string_lossy().to_string();

    let id = meta.get("id").cloned().unwrap_or_default();
    let name = meta.get("name").cloned().unwrap_or_default();

    Ok(Some(ActiveCampaign {
        id,
        name,
        path,
        meta,
    }))
}

/// Удаляет кампанию.
#[tauri::command]
#[specta::specta]
pub async fn delete_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    campaign_id: String,
    profile_id: String,
) -> Result<(), AppError> {
    // Ищем кампанию в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    let summary = campaigns
        .iter()
        .find(|c| c.id == campaign_id)
        .cloned()
        .ok_or(AppError::NotFound)?;

    // Закрываем кампанию если она активна
    {
        let mut current = state.campaign.lock().await;

        if let Some(db) = current.as_ref() {
            let meta = db.meta().await?;

            if meta.get("id").map(|id| id == &campaign_id).unwrap_or(false) {
                *current = None;
            }
        }
    }

    // Удаляем файл БД
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    let db_path = campaigns_dir.join(&summary.file_name);

    if db_path.exists() {
        fs::remove_file(&db_path).map_err(AppError::io)?;
    }

    // Удаляем папку с ассетами если есть
    let stem = db_path.file_stem().unwrap_or_default().to_string_lossy().to_string();
    let assets_dir = campaigns_dir.join(format!("{}.assets", stem));

    if assets_dir.exists() && assets_dir.is_dir() {
        fs::remove_dir_all(&assets_dir).map_err(AppError::io)?;
    }

    // Удаляем из index
    index_store.remove(&campaign_id)?;

    Ok(())
}

/// Переименовывает кампанию.
#[tauri::command]
#[specta::specta]
pub async fn rename_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    campaign_id: String,
    new_name: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    let new_name = new_name.trim().to_string();

    if new_name.is_empty() {
        return Err(AppError::Validation(
            "Campaign name is required".to_string(),
        ));
    }

    // Ищем кампанию в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    let summary = campaigns
        .iter()
        .find(|c| c.id == campaign_id)
        .cloned()
        .ok_or(AppError::NotFound)?;

    // Обновляем имя в БД если кампания активна
    {
        let current = state.campaign.lock().await;

        if let Some(db) = current.as_ref() {
            let meta = db.meta().await?;

            if meta.get("id").map(|id| id == &campaign_id).unwrap_or(false) {
                db.set_meta("name", &new_name).await?;
            }
        }
    }

    // Обновляем в index
    let updated_summary = CampaignSummary {
        name: new_name,
        ..summary.clone()
    };

    index_store.upsert(updated_summary.clone())?;

    Ok(updated_summary)
}

/// Возвращает путь к директории ассетов активной кампании.
#[tauri::command]
#[specta::specta]
pub async fn get_campaign_assets_dir(
    state: State<'_, AppState>,
) -> Result<String, AppError> {
    let current = state.campaign.lock().await;

    let db = current.as_ref().ok_or(AppError::NoCampaign)?;

    let assets_dir = db.assets_dir();

    // Создаём директорию если не существует
    if !assets_dir.exists() {
        fs::create_dir_all(&assets_dir).map_err(AppError::io)?;
    }

    Ok(assets_dir.to_string_lossy().to_string())
}
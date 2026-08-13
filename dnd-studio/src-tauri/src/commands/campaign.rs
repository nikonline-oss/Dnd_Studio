use crate::state::{AppPaths, AppState};
use dnd_core::{ActiveCampaign, AppError, CampaignSummary};
use dnd_db::{now_unix, CampaignDb, CampaignIndexStore};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_campaign(
    paths: State<'_, AppPaths>,
    state: State<'_, AppState>,
    name: String,
) -> Result<CampaignSummary, AppError> {
    let name = name.trim().to_string();

    if name.is_empty() {
        return Err(AppError::Validation("Campaign name is required".to_string()));
    }

    if name.len() > 120 {
        return Err(AppError::Validation("Campaign name is too long".to_string()));
    }

    let id = uuid::Uuid::new_v4().to_string();
    let slug = slugify(&name);
    let short_id = &id[..8];
    let file_name = format!("{slug}-{short_id}.db");
    let path = paths.campaigns_dir.join(&file_name);

    let db = CampaignDb::create(&path).await?;
    let created_at = now_unix();

    db.set_meta("id", &id).await?;
    db.set_meta("name", &name).await?;
    db.set_meta("created_at", &created_at.to_string()).await?;

    let summary = CampaignSummary {
        id: id.clone(),
        name,
        file_name,
        created_at,
        last_opened_at: Some(created_at),
    };

    let store = CampaignIndexStore::new(paths.index_file.clone());
    store.upsert(summary.clone())?;

    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}

#[tauri::command]
#[specta::specta]
pub async fn list_campaigns(
    paths: State<'_, AppPaths>,
) -> Result<Vec<CampaignSummary>, AppError> {
    let store = CampaignIndexStore::new(paths.index_file.clone());
    let campaigns = store.load()?;

    Ok(campaigns)
}

#[tauri::command]
#[specta::specta]
pub async fn open_campaign(
    paths: State<'_, AppPaths>,
    state: State<'_, AppState>,
    id: String,
) -> Result<CampaignSummary, AppError> {
    let store = CampaignIndexStore::new(paths.index_file.clone());

    let mut summary = store
        .find(&id)?
        .ok_or(AppError::NotFound)?;

    let path = paths.campaigns_dir.join(&summary.file_name);
    let db = CampaignDb::open(&path).await?;

    summary.last_opened_at = Some(now_unix());
    store.upsert(summary.clone())?;

    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}

#[tauri::command]
#[specta::specta]
pub async fn close_campaign(
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let mut current = state.campaign.lock().await;
    *current = None;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn get_active_campaign(
    state: State<'_, AppState>,
) -> Result<Option<ActiveCampaign>, AppError> {
    let db = {
        let current = state.campaign.lock().await;
        current.clone()
    };

    let Some(db) = db else {
        return Ok(None);
    };

    let meta = db.meta().await?;

    let id = meta.get("id").cloned().unwrap_or_default();
    let name = meta.get("name").cloned().unwrap_or_default();

    Ok(Some(ActiveCampaign {
        id,
        name,
        path: db.path().to_string_lossy().to_string(),
        meta,
    }))
}

fn slugify(input: &str) -> String {
    let mut result = String::new();

    for ch in input.chars() {
        if ch.is_ascii_alphanumeric() {
            result.push(ch.to_ascii_lowercase());
        } else {
            result.push('-');
        }
    }

    let result = result
        .trim_matches('-')
        .to_string();

    if result.is_empty() {
        "campaign".to_string()
    } else {
        result
    }
}
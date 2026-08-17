use crate::state::{AppPaths, AppState};
use dnd_core::{AppError, CampaignSummary};
use dnd_db::CampaignDb;
use std::fs;
use std::io::{Read, Write};
use std::path::Path;
use tauri::State;
use crate::commands::require_db;
use zip::write::SimpleFileOptions;

/// Экспорт активной кампании в файл .dndcampaign (ZIP)
#[tauri::command]
#[specta::specta]
pub async fn export_campaign(
    state: State<'_, AppState>,
    destination_path: String,
) -> Result<(), AppError> {
    let db = {
        let current = state.campaign.lock().await;
        current.clone().ok_or(AppError::NoCampaign)?
    };

    let db_path = db.path().to_path_buf();

    if !db_path.exists() {
        return Err(AppError::Io("Campaign database not found".to_string()));
    }

    // Читаем имя кампании из campaign_meta
    let meta = db.meta().await?;
    let campaign_name = meta.get("name").cloned().unwrap_or_default();
    let campaign_id = meta.get("id").cloned().unwrap_or_default();

    // Формируем campaign_meta.json
    let exported_at = chrono::Utc::now().to_rfc3339();
    let meta_json = serde_json::json!({
        "format_version": "1.0",
        "campaign_id": campaign_id,
        "name": campaign_name,
        "exported_at": exported_at,
    });

    // Создаём ZIP-архив
    let dest = Path::new(&destination_path);
    let file = fs::File::create(dest).map_err(AppError::io)?;

    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default();

    // 1. campaign_meta.json
    zip.start_file("campaign_meta.json", options)
        .map_err(AppError::io)?;
    zip.write_all(meta_json.to_string().as_bytes())
        .map_err(AppError::io)?;

    // 2. db.sqlite
    zip.start_file("db.sqlite", options).map_err(AppError::io)?;

    let mut db_file = fs::File::open(&db_path).map_err(AppError::io)?;
    let mut db_bytes = Vec::new();
    db_file.read_to_end(&mut db_bytes).map_err(AppError::io)?;
    zip.write_all(&db_bytes).map_err(AppError::io)?;

    // 3. assets/ (если папка существует)
    let assets_dir = db.assets_dir();
    if assets_dir.exists() && assets_dir.is_dir() {
        add_dir_to_zip(&mut zip, &assets_dir, "assets", options)?;
    }

    zip.finish().map_err(AppError::io)?;

    Ok(())
}

/// Рекурсивно добавляет директорию в ZIP
fn add_dir_to_zip(
    zip: &mut zip::ZipWriter<fs::File>,
    dir_path: &Path,
    zip_prefix: &str,
    options: SimpleFileOptions,
) -> Result<(), AppError> {
    let entries = fs::read_dir(dir_path).map_err(AppError::io)?;

    for entry in entries {
        let entry = entry.map_err(AppError::io)?;
        let path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();
        let zip_path = format!("{}/{}", zip_prefix, file_name);

        if path.is_dir() {
            add_dir_to_zip(zip, &path, &zip_path, options)?;
        } else {
            zip.start_file(&zip_path, options).map_err(AppError::io)?;

            let mut file = fs::File::open(&path).map_err(AppError::io)?;
            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes).map_err(AppError::io)?;
            zip.write_all(&bytes).map_err(AppError::io)?;
        }
    }

    Ok(())
}

/// Импорт кампании из файла .dndcampaign (ZIP)
#[tauri::command]
#[specta::specta]
pub async fn import_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    source_path: String,
) -> Result<CampaignSummary, AppError> {
    let source = Path::new(&source_path);

    if !source.exists() {
        return Err(AppError::Validation("File not found".to_string()));
    }

    // Открываем ZIP
    let file = fs::File::open(source).map_err(AppError::io)?;
    let mut archive = zip::ZipArchive::new(file).map_err(AppError::io)?;

    // Ищем db.sqlite внутри архива
    let mut db_bytes: Option<Vec<u8>> = None;
    let mut campaign_meta: Option<serde_json::Value> = None;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(AppError::io)?;
        let name = file.name().to_string();

        if name == "db.sqlite" {
            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes).map_err(AppError::io)?;
            db_bytes = Some(bytes);
        } else if name == "campaign_meta.json" {
            let mut content = String::new();
            file.read_to_string(&mut content).map_err(AppError::io)?;
            campaign_meta = serde_json::from_str(&content).ok();
        }
    }

    let db_bytes = db_bytes.ok_or_else(|| {
        AppError::Validation("Invalid .dndcampaign: db.sqlite not found".to_string())
    })?;

    // Генерируем новое имя файла для импортированной кампании
    let import_id = uuid::Uuid::new_v4().to_string();
    let campaign_name = campaign_meta
        .as_ref()
        .and_then(|m| m.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or("Imported Campaign");

    let slug = campaign_name
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() {
                c.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string();

    let slug = if slug.is_empty() {
        "campaign".to_string()
    } else {
        slug
    };
    let file_name = format!("{}-{}.db", slug, &import_id[..8]);
    let dest_db_path = paths.campaigns_dir.join(&file_name);

    // Записываем db.sqlite в campaigns/
    fs::write(&dest_db_path, &db_bytes).map_err(AppError::io)?;

    // Извлекаем assets/ если есть
    let assets_dir = {
        let stem = dest_db_path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        dest_db_path
            .parent()
            .unwrap_or(Path::new(""))
            .join(format!("{}.assets", stem))
    };

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(AppError::io)?;
        let name = file.name().to_string();

        if name.starts_with("assets/") && !file.is_dir() {
            let relative = name.strip_prefix("assets/").unwrap_or(&name);
            let dest_path = assets_dir.join(relative);

            if let Some(parent) = dest_path.parent() {
                fs::create_dir_all(parent).map_err(AppError::io)?;
            }

            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes).map_err(AppError::io)?;
            fs::write(&dest_path, &bytes).map_err(AppError::io)?;
        }
    }

    // Открываем импортированную кампанию и прогоняем миграции
    let db = CampaignDb::open(&dest_db_path).await?;

    // Читаем метаданные
    let meta = db.meta().await?;
    let created_at = meta
        .get("created_at")
        .and_then(|v| v.parse::<i32>().ok())
        .unwrap_or_else(|| dnd_db::now_unix());

    let summary = CampaignSummary {
        id: meta.get("id").cloned().unwrap_or(import_id),
        name: meta
            .get("name")
            .cloned()
            .unwrap_or_else(|| campaign_name.to_string()),
        file_name,
        created_at,
        last_opened_at: Some(dnd_db::now_unix()),
    };

    // Обновляем index
    let index_store = dnd_db::CampaignIndexStore::new(paths.index_file.clone());
    index_store.upsert(summary.clone())?;

    // Устанавливаем как активную
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}

/// Экспортирует текущую кампанию во временный файл и возвращает путь
#[tauri::command]
#[specta::specta]
pub async fn export_campaign_to_temp(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let db_path = db.path().to_path_buf();

    if !db_path.exists() {
        return Err(AppError::Io("Campaign database not found".to_string()));
    }

    // Создаём временный файл
    let temp_path =
        std::env::temp_dir().join(format!("dndstudio_campaign_{}.db", uuid::Uuid::new_v4()));

    std::fs::copy(&db_path, &temp_path).map_err(AppError::io)?;

    Ok(temp_path.to_string_lossy().to_string())
}

/// Читает файл и возвращает его содержимое как массив байтов
#[tauri::command]
#[specta::specta]
pub async fn read_file_bytes(file_path: String) -> Result<Vec<u8>, AppError> {
    std::fs::read(&file_path).map_err(AppError::io)
}

/// Удаляет временный файл
#[tauri::command]
#[specta::specta]
pub async fn delete_temp_file(file_path: String) -> Result<(), AppError> {
    std::fs::remove_file(&file_path).map_err(AppError::io)
}

/// Импортирует кампанию из массива байтов и открывает её
#[tauri::command]
#[specta::specta]
pub async fn import_campaign_from_bytes(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    file_data: Vec<u8>,
) -> Result<String, AppError> {
    // Создаём временный файл
    let temp_path = paths
        .campaigns_dir
        .join(format!("multiplayer_{}.db", uuid::Uuid::new_v4()));

    std::fs::write(&temp_path, &file_data).map_err(AppError::io)?;

    Ok(temp_path.to_string_lossy().to_string())
}

use crate::commands::require_db;
use crate::state::{AppPaths, AppState};
use dnd_core::{AppError, CampaignSummary};
use dnd_db::{CampaignDb, CampaignIndexStore};
use std::fs;
use std::io::{Read, Write};
use std::path::Path;
use tauri::State;
use zip::write::SimpleFileOptions;

/// Экспорт активной кампании в файл .dndcampaign (ZIP)
/// Экспорт активной кампании в файл .dndcampaign (ZIP)
#[tauri::command]
#[specta::specta]
pub async fn export_campaign(
    state: State<'_, AppState>,
    destination_path: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    let db_path = db.path().to_path_buf();

    if !db_path.exists() {
        return Err(AppError::Io("Campaign database not found".to_string()));
    }

    let meta = db.meta().await?;
    let campaign_name = meta.get("name").cloned().unwrap_or_default();
    let campaign_id = meta.get("id").cloned().unwrap_or_default();

    let exported_at = chrono::Utc::now().to_rfc3339();
    let meta_json = serde_json::json!({
        "format_version": "1.0",
        "campaign_id": campaign_id,
        "name": campaign_name,
        "exported_at": exported_at,
    });

    // Создаём временную копию БД через VACUUM INTO
    // Это гарантирует, что все данные из WAL будут включены
    let temp_db_path =
        std::env::temp_dir().join(format!("dndstudio_export_{}.db", uuid::Uuid::new_v4()));

    db.backup_to(&temp_db_path).await?;

    let dest = Path::new(&destination_path);
    let file = fs::File::create(dest).map_err(AppError::io)?;

    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default();

    // 1. campaign_meta.json
    zip.start_file("campaign_meta.json", options)
        .map_err(AppError::io)?;
    zip.write_all(meta_json.to_string().as_bytes())
        .map_err(AppError::io)?;

    // 2. db.sqlite — читаем из временной копии (с WAL данными)
    zip.start_file("db.sqlite", options).map_err(AppError::io)?;

    let mut db_file = fs::File::open(&temp_db_path).map_err(AppError::io)?;
    let mut db_bytes = Vec::new();
    db_file.read_to_end(&mut db_bytes).map_err(AppError::io)?;
    zip.write_all(&db_bytes).map_err(AppError::io)?;

    // Удаляем временный файл
    let _ = fs::remove_file(&temp_db_path);

    // 3. assets/
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

/// Импорт кампании из файла .dndcampaign в профиль
#[tauri::command]
#[specta::specta]
pub async fn import_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    source_path: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    let source = Path::new(&source_path);

    if !source.exists() {
        return Err(AppError::Validation("File not found".to_string()));
    }

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

    // Генерируем имя файла
    let import_id = uuid::Uuid::new_v4().to_string();
    let campaign_name = campaign_meta
        .as_ref()
        .and_then(|m| m.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or("Imported Campaign");

    let slug: String = campaign_name
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
    let slug = if slug.is_empty() {
        "campaign".to_string()
    } else {
        slug
    };

    let file_name = format!("{}-{}.db", slug, &import_id[..8]);

    // Сохраняем в директорию кампаний профиля
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    fs::create_dir_all(&campaigns_dir).map_err(AppError::io)?;

    let dest_db_path = campaigns_dir.join(&file_name);
    fs::write(&dest_db_path, &db_bytes).map_err(AppError::io)?;

    // Извлекаем assets/ в директорию ассетов кампании
    let stem = dest_db_path
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let assets_dir = campaigns_dir.join(format!("{}.assets", stem));

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

    // Открываем кампанию и прогоняем миграции
    let db = CampaignDb::open(&dest_db_path).await?;

    db.checkpoint().await?;

    // Обновляем profile_id в метаданных
    db.set_meta("profile_id", &profile_id).await?;

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

    // Добавляем в index профиля
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    index_store.upsert(summary.clone())?;

    // Устанавливаем как активную
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}

// ============================================
// Мультиплеерные кампании
// ============================================

/// Сохраняет кампанию в изолированную директорию мультиплеера профиля
#[tauri::command]
#[specta::specta]
pub async fn save_multiplayer_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    room_id: String,
    server_url: String,
    role: String,
    display_name: String,
    file_data: Vec<u8>,
    profile_id: String,
) -> Result<String, AppError> {
    // Логируем размер полученных данных
    eprintln!(
        "[save_multiplayer_campaign] room={}, data_size={} bytes",
        room_id,
        file_data.len()
    );

    if file_data.is_empty() {
        return Err(AppError::Validation(
            "Received empty campaign file".to_string(),
        ));
    }

    let dir = paths.session_dir(&profile_id, &room_id);
    fs::create_dir_all(&dir).map_err(AppError::io)?;

    let db_path = paths.session_db_file(&profile_id, &room_id);
    fs::write(&db_path, &file_data).map_err(AppError::io)?;

    // Проверяем что файл записался
    let written_size = fs::metadata(&db_path).map_err(AppError::io)?.len();

    eprintln!(
        "[save_multiplayer_campaign] file written: {} bytes (expected {})",
        written_size,
        file_data.len()
    );

    if written_size != file_data.len() as u64 {
        return Err(AppError::Validation(format!(
            "File size mismatch: wrote {} bytes, expected {}",
            written_size,
            file_data.len()
        )));
    }

    // Открываем БД для обновления метаданных
    let db = CampaignDb::open(&db_path).await?;
    db.set_meta("profile_id", &profile_id).await?;
    db.set_meta("room_id", &room_id).await?;
    db.set_meta("server_url", &server_url).await?;
    db.set_meta("role", &role).await?;
    db.checkpoint().await?;
    drop(db);

    // Сохраняем session.json
    let session_meta = serde_json::json!({
        "room_id": room_id,
        "server_url": server_url,
        "role": role,
        "display_name": display_name,
        "profile_id": profile_id,
        "connected_at": dnd_db::now_unix(),
        "last_sync_at": dnd_db::now_unix(),
    });

    let session_path = paths.session_meta_file(&profile_id, &room_id);
    fs::write(
        &session_path,
        serde_json::to_string_pretty(&session_meta).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(db_path.to_string_lossy().to_string())
}

/// Открывает мультиплеерную кампанию по room_id
#[tauri::command]
#[specta::specta]
pub async fn open_multiplayer_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    room_id: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    let db_path = paths.session_db_file(&profile_id, &room_id);

    if !db_path.exists() {
        return Err(AppError::Validation(
            "Multiplayer campaign not found".to_string(),
        ));
    }

    // Закрываем текущую кампанию
    {
        let mut current = state.campaign.lock().await;
        *current = None;
    }

    // Открываем мультиплеерную кампанию
    let db = CampaignDb::open(&db_path).await?;
    db.checkpoint().await?;
    let meta = db.meta().await?;

    let summary = CampaignSummary {
        id: meta.get("id").cloned().unwrap_or_else(|| room_id.clone()),
        name: meta
            .get("name")
            .cloned()
            .unwrap_or_else(|| format!("Multiplayer ({})", &room_id[..8.min(room_id.len())])),
        file_name: db_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string(),
        created_at: meta
            .get("created_at")
            .and_then(|v| v.parse::<i32>().ok())
            .unwrap_or_else(|| dnd_db::now_unix()),
        last_opened_at: Some(dnd_db::now_unix()),
    };

    // Устанавливаем как активную
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    // Добавляем в index профиля
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    index_store.upsert(summary.clone())?;

    Ok(summary)
}

/// Возвращает список сохранённых мультиплеерных сессий профиля
#[tauri::command]
#[specta::specta]
pub async fn list_multiplayer_sessions(
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<Vec<dnd_core::MultiplayerSessionInfo>, AppError> {
    let mp_dir = paths.profile_multiplayer_dir(&profile_id);

    if !mp_dir.exists() {
        return Ok(Vec::new());
    }

    let mut sessions = Vec::new();

    let entries = fs::read_dir(&mp_dir).map_err(AppError::io)?;

    for entry in entries {
        let entry = entry.map_err(AppError::io)?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let session_path = path.join("session.json");
        let db_path = path.join("campaign.db");

        if !session_path.exists() || !db_path.exists() {
            continue;
        }

        let content = fs::read_to_string(&session_path).map_err(AppError::io)?;

        match serde_json::from_str::<dnd_core::MultiplayerSessionInfo>(&content) {
            Ok(session) => sessions.push(session),
            Err(_) => continue,
        }
    }

    Ok(sessions)
}

/// Удаляет мультиплеерную сессию
#[tauri::command]
#[specta::specta]
pub async fn delete_multiplayer_session(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    room_id: String,
    profile_id: String,
) -> Result<(), AppError> {
    let dir = paths.session_dir(&profile_id, &room_id);

    if !dir.exists() {
        return Err(AppError::NotFound);
    }

    // Закрываем кампанию если она активна
    {
        let mut current = state.campaign.lock().await;

        if let Some(db) = current.as_ref() {
            let db_path = db.path();
            if db_path.starts_with(&dir) {
                *current = None;
            }
        }
    }

    // Удаляем из index если есть
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    for campaign in &campaigns {
        // Удаляем кампании, которые ссылаются на эту сессию
        let db_path = paths.session_db_file(&profile_id, &room_id);
        let file_name = db_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        if campaign.file_name == file_name {
            let _ = index_store.remove(&campaign.id);
        }
    }

    // Удаляем директорию сессии
    fs::remove_dir_all(&dir).map_err(AppError::io)?;

    Ok(())
}

/// Обновляет session.json при переподключении
#[tauri::command]
#[specta::specta]
pub async fn update_multiplayer_session(
    paths: State<'_, AppPaths>,
    room_id: String,
    server_url: String,
    role: String,
    display_name: String,
    profile_id: String,
) -> Result<(), AppError> {
    let session_path = paths.session_meta_file(&profile_id, &room_id);

    if !session_path.exists() {
        return Err(AppError::NotFound);
    }

    let content = fs::read_to_string(&session_path).map_err(AppError::io)?;
    let mut session: serde_json::Value = serde_json::from_str(&content).map_err(AppError::io)?;

    if let Some(obj) = session.as_object_mut() {
        obj.insert(
            "server_url".to_string(),
            serde_json::Value::String(server_url),
        );
        obj.insert("role".to_string(), serde_json::Value::String(role));
        obj.insert(
            "display_name".to_string(),
            serde_json::Value::String(display_name),
        );
        obj.insert(
            "last_sync_at".to_string(),
            serde_json::Value::Number(dnd_db::now_unix().into()),
        );
    }

    fs::write(
        &session_path,
        serde_json::to_string_pretty(&session).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(())
}

// ============================================
// Временные файлы для экспорта/импорта
// ============================================

/// Экспортирует текущую кампанию во временный файл и возвращает путь
#[tauri::command]
#[specta::specta]
pub async fn export_campaign_to_temp(state: State<'_, AppState>) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let db_path = db.path().to_path_buf();

    if !db_path.exists() {
        return Err(AppError::Io("Campaign database not found".to_string()));
    }

    // Логируем размер оригинального файла
    let original_size = std::fs::metadata(&db_path).map_err(AppError::io)?.len();
    eprintln!(
        "[export_campaign_to_temp] original db size: {} bytes",
        original_size
    );

    // Используем VACUUM INTO для полной копии с WAL данными
    let temp_path =
        std::env::temp_dir().join(format!("dndstudio_campaign_{}.db", uuid::Uuid::new_v4()));

    db.backup_to(&temp_path).await?;

    // Логируем размер копии
    let backup_size = std::fs::metadata(&temp_path).map_err(AppError::io)?.len();
    eprintln!(
        "[export_campaign_to_temp] backup size: {} bytes",
        backup_size
    );

    if backup_size == 0 {
        return Err(AppError::Io("Backup file is empty".to_string()));
    }

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

/// Экспортирует активную кампанию как ZIP (db + assets) во временный файл.
/// Используется для загрузки на Relay Server.
#[tauri::command]
#[specta::specta]
pub async fn export_campaign_zip_to_temp(state: State<'_, AppState>) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let db_path = db.path().to_path_buf();

    if !db_path.exists() {
        return Err(AppError::Io("Campaign database not found".to_string()));
    }

    // Создаём временную копию БД через VACUUM INTO (включает WAL данные)
    let temp_db_path =
        std::env::temp_dir().join(format!("dndstudio_mp_db_{}.db", uuid::Uuid::new_v4()));

    db.backup_to(&temp_db_path).await?;

    let temp_db_size = fs::metadata(&temp_db_path).map_err(AppError::io)?.len();

    eprintln!(
        "[export_campaign_zip_to_temp] db backup size: {} bytes",
        temp_db_size
    );

    // Создаём ZIP
    let temp_zip_path =
        std::env::temp_dir().join(format!("dndstudio_mp_{}.dndcampaign", uuid::Uuid::new_v4()));

    let file = fs::File::create(&temp_zip_path).map_err(AppError::io)?;
    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default();

    // 1. db.sqlite
    zip.start_file("db.sqlite", options).map_err(AppError::io)?;

    let mut db_file = fs::File::open(&temp_db_path).map_err(AppError::io)?;
    let mut db_bytes = Vec::new();
    db_file.read_to_end(&mut db_bytes).map_err(AppError::io)?;
    zip.write_all(&db_bytes).map_err(AppError::io)?;

    // Удаляем временный db
    let _ = fs::remove_file(&temp_db_path);

    // 2. assets/
    let assets_dir = db.assets_dir();

    if assets_dir.exists() && assets_dir.is_dir() {
        add_dir_to_zip(&mut zip, &assets_dir, "assets", options)?;
        eprintln!(
            "[export_campaign_zip_to_temp] assets added from: {:?}",
            assets_dir
        );
    } else {
        eprintln!(
            "[export_campaign_zip_to_temp] no assets dir found at: {:?}",
            assets_dir
        );
    }

    zip.finish().map_err(AppError::io)?;

    let zip_size = fs::metadata(&temp_zip_path).map_err(AppError::io)?.len();

    eprintln!(
        "[export_campaign_zip_to_temp] final zip size: {} bytes",
        zip_size
    );

    Ok(temp_zip_path.to_string_lossy().to_string())
}

/// Сохраняет мультиплеерную кампанию из ZIP (db + assets) в директорию профиля.
#[tauri::command]
#[specta::specta]
pub async fn save_multiplayer_campaign_zip(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    room_id: String,
    server_url: String,
    role: String,
    display_name: String,
    zip_data: Vec<u8>,
    profile_id: String,
) -> Result<String, AppError> {
    eprintln!(
        "[save_multiplayer_campaign_zip] room={}, zip_size={} bytes",
        room_id,
        zip_data.len()
    );

    if zip_data.is_empty() {
        return Err(AppError::Validation(
            "Received empty campaign archive".to_string(),
        ));
    }

    let dir = paths.session_dir(&profile_id, &room_id);
    fs::create_dir_all(&dir).map_err(AppError::io)?;

    // Открываем ZIP из памяти
    let cursor = std::io::Cursor::new(zip_data);
    let mut archive = zip::ZipArchive::new(cursor).map_err(AppError::io)?;

    let db_path = paths.session_db_file(&profile_id, &room_id);

    // Папка для ассетов: campaign.assets (рядом с campaign.db)
    let assets_dir = dir.join("campaign.assets");

    // Извлекаем файлы
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(AppError::io)?;
        let name = file.name().to_string();

        // Защита от path traversal
        if name.contains("..") {
            eprintln!("[save_multiplayer_campaign_zip] skipping unsafe path: {}", name);
            continue;
        }

        if file.is_dir() {
            continue;
        }

        if name == "db.sqlite" {
            // Извлекаем БД
            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes).map_err(AppError::io)?;

            eprintln!(
                "[save_multiplayer_campaign_zip] extracting db.sqlite: {} bytes",
                bytes.len()
            );

            fs::write(&db_path, &bytes).map_err(AppError::io)?;
        } else if let Some(relative) = name.strip_prefix("assets/") {
            // Извлекаем ассеты в campaign.assets/
            let dest_path = assets_dir.join(relative);

            if let Some(parent) = dest_path.parent() {
                fs::create_dir_all(parent).map_err(AppError::io)?;
            }

            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes).map_err(AppError::io)?;

            eprintln!(
                "[save_multiplayer_campaign_zip] extracting asset: {} ({} bytes)",
                relative,
                bytes.len()
            );

            fs::write(&dest_path, &bytes).map_err(AppError::io)?;
        }
    }

    // Проверяем что БД извлеклась
    if !db_path.exists() {
        return Err(AppError::Validation(
            "db.sqlite not found in archive".to_string(),
        ));
    }

    // Открываем БД для обновления метаданных
    let db = CampaignDb::open(&db_path).await?;
    db.set_meta("profile_id", &profile_id).await?;
    db.set_meta("room_id", &room_id).await?;
    db.set_meta("server_url", &server_url).await?;
    db.set_meta("role", &role).await?;
    db.checkpoint().await?;
    drop(db);

    // Сохраняем session.json
    let session_meta = serde_json::json!({
        "room_id": room_id,
        "server_url": server_url,
        "role": role,
        "display_name": display_name,
        "profile_id": profile_id,
        "connected_at": dnd_db::now_unix(),
        "last_sync_at": dnd_db::now_unix(),
    });

    let session_path = paths.session_meta_file(&profile_id, &room_id);
    fs::write(
        &session_path,
        serde_json::to_string_pretty(&session_meta).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(db_path.to_string_lossy().to_string())
}
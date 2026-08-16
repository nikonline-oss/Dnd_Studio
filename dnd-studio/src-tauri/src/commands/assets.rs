use crate::commands::require_db;
use crate::state::{AppPaths, AppState};
use dnd_core::{AppError, AssetSummary};
use image::imageops::FilterType;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use tauri::State;

/// Максимальный размер файла (байты)
const MAX_MAP_SIZE_BYTES: u64 = 20 * 1024 * 1024; // 20 MB
const MAX_TOKEN_SIZE_BYTES: u64 = 2 * 1024 * 1024; // 2 MB
const MAX_RESOLUTION_PX: u32 = 8192;
const WEBP_QUALITY_MAP: u8 = 85;
const WEBP_QUALITY_TOKEN: u8 = 90;
const THUMB_SIZE: u32 = 256;

/// Вычисляет SHA-256 хэш файла
fn compute_sha256(path: &Path) -> Result<String, AppError> {
    let mut file = fs::File::open(path).map_err(AppError::io)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];

    loop {
        let bytes_read = file.read(&mut buffer).map_err(AppError::io)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    Ok(format!("{:x}", hasher.finalize()))
}

/// Определяет MIME-тип по расширению
fn mime_from_extension(path: &Path) -> String {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    match ext.as_str() {
        "png" => "image/png".to_string(),
        "jpg" | "jpeg" => "image/jpeg".to_string(),
        "webp" => "image/webp".to_string(),
        "gif" => "image/gif".to_string(),
        "bmp" => "image/bmp".to_string(),
        _ => "application/octet-stream".to_string(),
    }
}

/// Возвращает директорию для хранения ассетов кампании
fn campaign_assets_dir(paths: &AppPaths) -> PathBuf {
    // Используем data_dir/campaign_assets как общую директорию
    // В будущем можно привязать к конкретной кампании
    paths.data_dir.join("campaign_assets")
}

/// Импорт ассета с полным пайплайном
#[tauri::command]
#[specta::specta]
pub async fn import_asset(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    source_path: String,
    asset_type: String,
) -> Result<AssetSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    // Валидация типа
    let valid_types = ["map", "token", "portrait", "audio", "icon"];
    if !valid_types.contains(&asset_type.as_str()) {
        return Err(AppError::Validation(format!(
            "Invalid asset type: {}",
            asset_type
        )));
    }

    let source = Path::new(&source_path);

    if !source.exists() {
        return Err(AppError::Validation("Source file not found".to_string()));
    }

    // Валидация размера
    let metadata = fs::metadata(source).map_err(AppError::io)?;
    let size_bytes = metadata.len();

    let max_size = if asset_type == "map" {
        MAX_MAP_SIZE_BYTES
    } else {
        MAX_TOKEN_SIZE_BYTES
    };

    if size_bytes > max_size {
        return Err(AppError::Validation(format!(
            "File too large: {} bytes (max {} bytes)",
            size_bytes, max_size
        )));
    }

    // Вычисление SHA-256
    let content_hash = compute_sha256(source)?;

    // Дедупликация: проверяем, есть ли уже такой ассет
    if let Some(existing) = db.get_asset_by_hash(&asset_type, &content_hash).await? {
        return Ok(existing);
    }

    // Читаем изображение
    let img = image::open(source)
        .map_err(|e| AppError::Validation(format!("Failed to open image: {}", e)))?;

    // Валидация разрешения
    let (width, height) = (img.width(), img.height());

    if width > MAX_RESOLUTION_PX || height > MAX_RESOLUTION_PX {
        return Err(AppError::Validation(format!(
            "Image too large: {}x{} (max {}x{})",
            width, height, MAX_RESOLUTION_PX, MAX_RESOLUTION_PX
        )));
    }

    // Генерируем ID
    let asset_id = uuid::Uuid::new_v4().to_string();
    let now = dnd_db::now_unix();

    // Создаём директорию
    let assets_dir = campaign_assets_dir(&paths);
    let type_dir = assets_dir.join(&asset_type);
    let thumbs_dir = type_dir.join("thumbs");

    fs::create_dir_all(&thumbs_dir).map_err(AppError::io)?;

    // Конвертируем в WebP
    let quality = if asset_type == "map" {
        WEBP_QUALITY_MAP
    } else {
        WEBP_QUALITY_TOKEN
    };

    let webp_path = type_dir.join(format!("{}.webp", asset_id));

    // Сохраняем как WebP через image crate
    // image crate сохраняет в формате по расширению файла
    img.save_with_format(&webp_path, image::ImageFormat::WebP)
        .map_err(|e| AppError::Io(format!("Failed to save WebP: {}", e)))?;

    // Генерируем thumbnail
    let thumb = img.resize(THUMB_SIZE, THUMB_SIZE, FilterType::Lanczos3);
    let thumb_path = thumbs_dir.join(format!("{}_thumb.webp", asset_id));

    thumb
        .save_with_format(&thumb_path, image::ImageFormat::WebP)
        .map_err(|e| AppError::Io(format!("Failed to save thumbnail: {}", e)))?;

    // Получаем реальный размер WebP файла
    let webp_metadata = fs::metadata(&webp_path).map_err(AppError::io)?;
    let webp_size = webp_metadata.len();

    // Определяем MIME-тип
    let mime_type = mime_from_extension(source);

    // Сохраняем в БД
    let asset = db
        .create_asset(
            &asset_id,
            &asset_type,
            source
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .as_ref(),
            &content_hash,
            &mime_type,
            webp_size as i32,
            Some(width as i32),
            Some(height as i32),
            Some(format!("{}_thumb.webp", asset_id)),
            now,
        )
        .await?;

    Ok(asset)
}

/// Возвращает путь к файлу ассета
#[tauri::command]
#[specta::specta]
pub async fn get_asset_file_path(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    asset_id: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let assets_dir = campaign_assets_dir(&paths);
    let file_path = assets_dir
        .join(&asset.r#type)
        .join(format!("{}.webp", asset_id));

    if !file_path.exists() {
        return Err(AppError::NotFound);
    }

    Ok(file_path.to_string_lossy().to_string())
}

/// Возвращает путь к thumbnail ассета
#[tauri::command]
#[specta::specta]
pub async fn get_asset_thumb_path(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    asset_id: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let assets_dir = campaign_assets_dir(&paths);
    let thumb_path = assets_dir
        .join(&asset.r#type)
        .join("thumbs")
        .join(format!("{}_thumb.webp", asset_id));

    if !thumb_path.exists() {
        return Err(AppError::NotFound);
    }

    Ok(thumb_path.to_string_lossy().to_string())
}

/// Возвращает содержимое ассета как data URL (base64)
#[tauri::command]
#[specta::specta]
pub async fn get_asset_data_url(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    asset_id: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let assets_dir = campaign_assets_dir(&paths);
    let file_path = assets_dir
        .join(&asset.r#type)
        .join(format!("{}.webp", asset_id));

    if !file_path.exists() {
        return Err(AppError::NotFound);
    }

    let bytes = fs::read(&file_path).map_err(AppError::io)?;

    use base64::Engine;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);

    Ok(format!("data:image/webp;base64,{}", encoded))
}

/// Удаляет ассет
#[tauri::command]
#[specta::specta]
pub async fn delete_asset(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    asset_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    // Удаляем файлы
    let assets_dir = campaign_assets_dir(&paths);
    let file_path = assets_dir
        .join(&asset.r#type)
        .join(format!("{}.webp", asset_id));
    let thumb_path = assets_dir
        .join(&asset.r#type)
        .join("thumbs")
        .join(format!("{}_thumb.webp", asset_id));

    if file_path.exists() {
        fs::remove_file(&file_path).map_err(AppError::io)?;
    }

    if thumb_path.exists() {
        fs::remove_file(&thumb_path).map_err(AppError::io)?;
    }

    // Удаляем из БД
    db.delete_asset(&asset_id).await?;

    Ok(())
}

/// Список ассетов по типу
#[tauri::command]
#[specta::specta]
pub async fn list_assets(
    state: State<'_, AppState>,
    asset_type: String,
) -> Result<Vec<AssetSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_assets(&asset_type).await
}

/// Внутренняя функция импорта ассета (без Tauri State)
pub async fn import_asset_inner(
    db: &dnd_db::CampaignDb,
    paths: &AppPaths,
    source_path: &str,
    asset_type: &str,
) -> Result<AssetSummary, AppError> {
    // Валидация типа
    let valid_types = ["map", "token", "portrait", "audio", "icon"];
    if !valid_types.contains(&asset_type) {
        return Err(AppError::Validation(format!(
            "Invalid asset type: {}",
            asset_type
        )));
    }

    let source = Path::new(&source_path);

    if !source.exists() {
        return Err(AppError::Validation("Source file not found".to_string()));
    }

    // Валидация размера
    let metadata = fs::metadata(source).map_err(AppError::io)?;
    let size_bytes = metadata.len();

    let max_size = if asset_type == "map" {
        MAX_MAP_SIZE_BYTES
    } else {
        MAX_TOKEN_SIZE_BYTES
    };

    if size_bytes > max_size {
        return Err(AppError::Validation(format!(
            "File too large: {} bytes (max {} bytes)",
            size_bytes, max_size
        )));
    }

    // Вычисление SHA-256
    let content_hash = compute_sha256(source)?;

    // Дедупликация: проверяем, есть ли уже такой ассет
    if let Some(existing) = db.get_asset_by_hash(&asset_type, &content_hash).await? {
        return Ok(existing);
    }

    // Читаем изображение
    let img = image::open(source)
        .map_err(|e| AppError::Validation(format!("Failed to open image: {}", e)))?;

    // Валидация разрешения
    let (width, height) = (img.width(), img.height());

    if width > MAX_RESOLUTION_PX || height > MAX_RESOLUTION_PX {
        return Err(AppError::Validation(format!(
            "Image too large: {}x{} (max {}x{})",
            width, height, MAX_RESOLUTION_PX, MAX_RESOLUTION_PX
        )));
    }

    // Генерируем ID
    let asset_id = uuid::Uuid::new_v4().to_string();
    let now = dnd_db::now_unix();

    // Создаём директорию
    let assets_dir = campaign_assets_dir(&paths);
    let type_dir = assets_dir.join(&asset_type);
    let thumbs_dir = type_dir.join("thumbs");

    fs::create_dir_all(&thumbs_dir).map_err(AppError::io)?;

    // Конвертируем в WebP
    let quality = if asset_type == "map" {
        WEBP_QUALITY_MAP
    } else {
        WEBP_QUALITY_TOKEN
    };

    let webp_path = type_dir.join(format!("{}.webp", asset_id));

    // Сохраняем как WebP через image crate
    // image crate сохраняет в формате по расширению файла
    img.save_with_format(&webp_path, image::ImageFormat::WebP)
        .map_err(|e| AppError::Io(format!("Failed to save WebP: {}", e)))?;

    // Генерируем thumbnail
    let thumb = img.resize(THUMB_SIZE, THUMB_SIZE, FilterType::Lanczos3);
    let thumb_path = thumbs_dir.join(format!("{}_thumb.webp", asset_id));

    thumb
        .save_with_format(&thumb_path, image::ImageFormat::WebP)
        .map_err(|e| AppError::Io(format!("Failed to save thumbnail: {}", e)))?;

    // Получаем реальный размер WebP файла
    let webp_metadata = fs::metadata(&webp_path).map_err(AppError::io)?;
    let webp_size = webp_metadata.len();

    // Определяем MIME-тип
    let mime_type = mime_from_extension(source);

    // Сохраняем в БД
    let asset = db
        .create_asset(
            &asset_id,
            &asset_type,
            source
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .as_ref(),
            &content_hash,
            &mime_type,
            webp_size as i32,
            Some(width as i32),
            Some(height as i32),
            Some(format!("{}_thumb.webp", asset_id)),
            now,
        )
        .await?;

    Ok(asset)
}

/// Читает произвольный файл (выбранный через диалог) и возвращает data URL.
/// Используется для превью изображения перед импортом.
#[tauri::command]
#[specta::specta]
pub async fn read_file_as_data_url(
    _state: State<'_, AppState>,
    file_path: String,
) -> Result<String, AppError> {
    let path = std::path::Path::new(&file_path);

    if !path.exists() {
        return Err(AppError::Validation("File not found".to_string()));
    }

    let bytes = std::fs::read(path).map_err(AppError::io)?;

    // Определяем MIME-тип по расширению
    let mime = match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .as_deref()
    {
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("gif") => "image/gif",
        Some("bmp") => "image/bmp",
        _ => "application/octet-stream",
    };

    use base64::Engine;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);

    Ok(format!("data:{};base64,{}", mime, encoded))
}

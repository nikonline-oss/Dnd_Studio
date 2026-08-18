use crate::state::AppState;
use crate::{commands::require_db};
use base64::Engine;
use dnd_core::{AppError, MapSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_map(
    state: State<'_, AppState>,
    name: String,
    width: i32,
    height: i32,
    grid_size: i32,
) -> Result<MapSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    let world_id = db.default_world_id().await?;

    db.create_map(&world_id, &name, width, height, grid_size)
        .await
}

#[tauri::command]
#[specta::specta]
pub async fn list_maps(state: State<'_, AppState>) -> Result<Vec<MapSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_maps().await
}

#[tauri::command]
#[specta::specta]
pub async fn get_map(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<MapSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_map(&id).await
}

/// Параметры импорта изображения карты
#[derive(Debug, Clone, serde::Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MapImageImportOptions {
    pub target_width: i32,
    pub target_height: i32,
    pub grid_size: i32,
    pub crop_x: Option<u32>,
    pub crop_y: Option<u32>,
    pub crop_width: Option<u32>,
    pub crop_height: Option<u32>,
}

#[tauri::command]
#[specta::specta]
pub async fn import_map_image(
    state: State<'_, AppState>,
    map_id: String,
    source_path: String,
    options: MapImageImportOptions,
) -> Result<MapSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_map(&map_id).await?.ok_or(AppError::NotFound)?;

    if options.target_width <= 0 || options.target_height <= 0 {
        return Err(AppError::Validation(
            "Target width and height must be positive".to_string(),
        ));
    }

    if options.grid_size <= 0 {
        return Err(AppError::Validation(
            "Grid size must be positive".to_string(),
        ));
    }

    // Открываем изображение
    let mut img = image::open(&source_path)
        .map_err(|e| AppError::Validation(format!("Failed to open image: {}", e)))?;

    // Применяем crop если задан
    if let (Some(cx), Some(cy), Some(cw), Some(ch)) = (
        options.crop_x,
        options.crop_y,
        options.crop_width,
        options.crop_height,
    ) {
        let img_w = img.width();
        let img_h = img.height();

        let cx = cx.min(img_w.saturating_sub(1));
        let cy = cy.min(img_h.saturating_sub(1));
        let cw = cw.min(img_w.saturating_sub(cx));
        let ch = ch.min(img_h.saturating_sub(cy));

        if cw == 0 || ch == 0 {
            return Err(AppError::Validation(
                "Crop region is empty after clamping".to_string(),
            ));
        }

        img = img.crop_imm(cx, cy, cw, ch);
    }

    // Масштабируем до целевого размера
    let img = img.resize_exact(
        options.target_width as u32,
        options.target_height as u32,
        image::imageops::FilterType::Lanczos3,
    );

    // Сохраняем во временный файл
    let temp_dir = std::env::temp_dir();
    let temp_path = temp_dir.join(format!("dndstudio_map_{}.webp", uuid::Uuid::new_v4()));

    img.save_with_format(&temp_path, image::ImageFormat::WebP)
        .map_err(|e| AppError::Io(format!("Failed to save temp image: {}", e)))?;

    // Импортируем через asset pipeline
    // Теперь используем db.assets_dir() вместо общей директории
    let asset =
        crate::commands::assets::import_asset_inner(&db, &temp_path.to_string_lossy(), "map")
            .await?;

    // Удаляем временный файл
    let _ = std::fs::remove_file(&temp_path);

    // Привязываем ассет к карте
    db.update_map_asset(&map_id, Some(asset.id.clone())).await?;

    // Обновляем размеры и сетку карты
    db.update_map_settings(
        &map_id,
        options.target_width,
        options.target_height,
        options.grid_size,
    )
    .await?;

    db.get_map(&map_id).await?.ok_or(AppError::NotFound)
}

#[tauri::command]
#[specta::specta]
pub async fn update_map_fog(
    state: State<'_, AppState>,
    map_id: String,
    fog_data: Option<String>,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_map_fog(&map_id, fog_data).await
}

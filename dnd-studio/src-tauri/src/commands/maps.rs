use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, MapSummary};
use dnd_db::CampaignDb;
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

/// Устанавливает видимость карты для игроков
#[tauri::command]
#[specta::specta]
pub async fn set_map_visible_to_players(
    state: State<'_, AppState>,
    map_id: String,
    is_visible: bool,
) -> Result<MapSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    let visible = if is_visible { 1 } else { 0 };

    let result = sqlx::query(
        r#"
        UPDATE maps
        SET is_visible_to_players = ?, version = version + 1
        WHERE id = ?
        "#,
    )
    .bind(visible)
    .bind(&map_id)
    .execute(db.pool())
    .await
    .map_err(AppError::db)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    db.get_map(&map_id).await?.ok_or(AppError::NotFound)
}

/// Устанавливает активную сцену (карту, которую видят игроки)
#[tauri::command]
#[specta::specta]
pub async fn set_active_scene(state: State<'_, AppState>, map_id: String) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    // Проверяем что карта существует
    db.get_map(&map_id).await?.ok_or(AppError::NotFound)?;

    // Сохраняем в campaign_meta
    db.set_meta("active_scene_map_id", &map_id).await?;

    Ok(())
}

/// Возвращает ID активной сцены
#[tauri::command]
#[specta::specta]
pub async fn get_active_scene(state: State<'_, AppState>) -> Result<Option<String>, AppError> {
    let db = require_db(&state.campaign).await?;

    let meta = db.meta().await?;

    Ok(meta.get("active_scene_map_id").cloned())
}

/// Обновляет видимость карты (используется при синхронизации в мультиплеере)
#[tauri::command]
#[specta::specta]
pub async fn sync_map_visibility(
    state: State<'_, AppState>,
    map_id: String,
    is_visible: bool,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    let visible = if is_visible { 1 } else { 0 };

    let result = sqlx::query(
        r#"
        UPDATE maps
        SET is_visible_to_players = ?
        WHERE id = ?
        "#,
    )
    .bind(visible)
    .bind(&map_id)
    .execute(db.pool())
    .await
    .map_err(AppError::db)?;

    if result.rows_affected() == 0 {
        // Карта не найдена - возможно ещё не синхронизирована
        // Не ошибка, просто игнорируем
        return Ok(());
    }

    Ok(())
}

/// Синхронизирует активную сцену (используется при синхронизации в мультиплеере)
#[tauri::command]
#[specta::specta]
pub async fn sync_active_scene(
    state: State<'_, AppState>,
    map_id: Option<String>,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    if let Some(id) = map_id {
        db.set_meta("active_scene_map_id", &id).await?;
    } else {
        db.set_meta("active_scene_map_id", "").await?;
    }

    Ok(())
}

/// Удаляет карту. Каскадно удалит все токены через FK.
#[tauri::command]
#[specta::specta]
pub async fn delete_map(
    state: State<'_, AppState>,
    map_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    // Получаем карту для доступа к asset_id
    let map = db
        .get_map(&map_id)
        .await?
        .ok_or(AppError::NotFound)?;

    // Удаляем карту (каскадно удалятся токены через ON DELETE CASCADE)
    let result = sqlx::query("DELETE FROM maps WHERE id = ?")
        .bind(&map_id)
        .execute(db.pool())
        .await
        .map_err(AppError::db)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Удаляем связанный ассет (если есть)
    if let Some(asset_id) = map.asset_id {
        let _ = delete_asset_internal(&db, &asset_id).await;
    }

    // Очищаем active_scene_map_id если это была активная сцена
    let meta = db.meta().await?;
    if meta.get("active_scene_map_id").map(|v| v == &map_id).unwrap_or(false) {
        db.set_meta("active_scene_map_id", "").await?;
    }

    Ok(())
}

/// Внутренняя функция удаления ассета (для использования из других команд)
async fn delete_asset_internal(
    db: &dnd_db::CampaignDb,
    asset_id: &str,
) -> Result<(), AppError> {
    // Получаем информацию об ассете
    let asset = db.get_asset_async(asset_id).await?;

    if let Some(asset) = asset {
        // Удаляем файлы
        let assets_dir = db.assets_dir();
        let file_path = assets_dir
            .join(&asset.r#type)
            .join(format!("{}.webp", asset_id));
        let thumb_path = assets_dir
            .join(&asset.r#type)
            .join("thumbs")
            .join(format!("{}_thumb.webp", asset_id));

        if file_path.exists() {
            let _ = std::fs::remove_file(&file_path);
        }

        if thumb_path.exists() {
            let _ = std::fs::remove_file(&thumb_path);
        }

        // Удаляем из БД
        db.delete_asset(asset_id).await?;
    }

    Ok(())
}

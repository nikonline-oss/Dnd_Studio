use crate::commands::require_db;
use crate::state::{AppPaths, AppState};
use dnd_core::{AppError, InstalledPluginSummary, PluginManifest};
use std::fs;
use std::io::Read;
use tauri::State;
use zip::ZipArchive;

fn validate_plugin_id(id: &str) -> Result<(), AppError> {
    if id.is_empty() || id.len() > 64 {
        return Err(AppError::Validation(
            "Plugin id must be between 1 and 64 characters".to_string(),
        ));
    }

    let valid = id
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');

    if !valid {
        return Err(AppError::Validation(
            "Plugin id may contain only letters, numbers, '-' and '_'".to_string(),
        ));
    }

    Ok(())
}

fn validate_plugin_version(version: &str) -> Result<(), AppError> {
    if version.is_empty() || version.len() > 64 {
        return Err(AppError::Validation(
            "Plugin version must be between 1 and 64 characters".to_string(),
        ));
    }

    if version.contains('/') || version.contains('\\') {
        return Err(AppError::Validation(
            "Plugin version contains invalid characters".to_string(),
        ));
    }

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn install_plugin_from_file(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    source_path: String,
) -> Result<InstalledPluginSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    let source = std::path::Path::new(&source_path);

    if !source.exists() {
        return Err(AppError::Validation("Plugin file not found".to_string()));
    }

    let file = fs::File::open(source).map_err(AppError::io)?;

    let mut archive = ZipArchive::new(file)
        .map_err(|_| AppError::Validation("Invalid .dndplugin archive".to_string()))?;

    // Читаем plugin.yaml
    let manifest = {
        let mut manifest_file = archive
            .by_name("plugin.yaml")
            .map_err(|_| AppError::Validation("plugin.yaml not found".to_string()))?;

        let mut manifest_text = String::new();

        manifest_file
            .read_to_string(&mut manifest_text)
            .map_err(AppError::io)?;

        serde_yaml::from_str::<PluginManifest>(&manifest_text)
            .map_err(|e| AppError::Validation(format!("Invalid plugin.yaml: {e}")))?
    };

    validate_plugin_id(&manifest.id)?;
    validate_plugin_version(&manifest.version)?;

    let manifest_json =
        serde_json::to_string(&manifest).map_err(AppError::io)?;

    // Распаковываем плагин в:
    // {app_data}/plugins/{plugin_id}/{version}/
    let plugin_root = paths
        .data_dir
        .join("plugins")
        .join(&manifest.id)
        .join(&manifest.version);

    fs::create_dir_all(&plugin_root).map_err(AppError::io)?;

    for index in 0..archive.len() {
        let mut entry = archive.by_index(index).map_err(AppError::io)?;

        let Some(relative_path) = entry.enclosed_name() else {
            return Err(AppError::Validation(
                "Plugin archive contains unsafe path".to_string(),
            ));
        };

        if relative_path.to_string_lossy().is_empty() {
            continue;
        }

        let destination = plugin_root.join(relative_path);

        if entry.is_dir() {
            fs::create_dir_all(&destination).map_err(AppError::io)?;
            continue;
        }

        if let Some(parent) = destination.parent() {
            fs::create_dir_all(parent).map_err(AppError::io)?;
        }

        let mut bytes = Vec::new();
        entry.read_to_end(&mut bytes).map_err(AppError::io)?;

        fs::write(&destination, &bytes).map_err(AppError::io)?;
    }

    // Сохраняем в installed_plugins текущей кампании
    db.upsert_installed_plugin(
        &manifest.id,
        &manifest.version,
        true,
        &manifest_json,
    )
    .await?;

    db.get_installed_plugin(&manifest.id)
        .await?
        .ok_or(AppError::NotFound)
}

#[tauri::command]
#[specta::specta]
pub async fn list_installed_plugins(
    state: State<'_, AppState>,
) -> Result<Vec<InstalledPluginSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_installed_plugins().await
}

#[tauri::command]
#[specta::specta]
pub async fn set_plugin_active(
    state: State<'_, AppState>,
    plugin_id: String,
    is_active: bool,
) -> Result<InstalledPluginSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.set_plugin_active(&plugin_id, is_active).await
}
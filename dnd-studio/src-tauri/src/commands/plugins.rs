use crate::commands::require_db;
use crate::state::{AppPaths, AppState};
use dnd_core::{
    AppError, InstalledPluginSummary, LinkTypeInfo, PluginCompendiumFile, PluginManifest,
    PluginSheetInfo, PluginThemeInfo,
};
use std::fs;
use std::io::Read;
use std::path::Path;
use tauri::{Manager, State};
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

/// Читает и парсит файл компендия (JSON или YAML) из папки плагина.
fn read_compendium_file(
    plugin_root: &Path,
    relative_path: &str,
) -> Result<PluginCompendiumFile, AppError> {
    let file_path = plugin_root.join(relative_path);

    if !file_path.exists() {
        return Err(AppError::Validation(format!(
            "Compendium file not found: {}",
            relative_path
        )));
    }

    let content = fs::read_to_string(&file_path).map_err(AppError::io)?;

    let extension = file_path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    match extension.as_str() {
        "json" => serde_json::from_str::<PluginCompendiumFile>(&content)
            .map_err(|e| AppError::Validation(format!("Invalid compendium JSON: {e}"))),
        "yaml" | "yml" => serde_yaml::from_str::<PluginCompendiumFile>(&content)
            .map_err(|e| AppError::Validation(format!("Invalid compendium YAML: {e}"))),
        _ => Err(AppError::Validation(format!(
            "Unsupported compendium file extension: {}",
            extension
        ))),
    }
}

/// Импортирует компендии плагина в БД кампании.
async fn import_plugin_compendiums(
    db: &dnd_db::CampaignDb,
    plugin_root: &Path,
    manifest: &PluginManifest,
) -> Result<(), AppError> {
    for compendium_ref in &manifest.compendiums {
        let compendium_file = read_compendium_file(plugin_root, &compendium_ref.file)?;

        let name = compendium_ref
            .name
            .clone()
            .unwrap_or_else(|| compendium_ref.key.clone());

        db.import_compendium_from_plugin(
            &manifest.id,
            &compendium_ref.key,
            &name,
            &compendium_ref.compendium_type,
            &compendium_file.entries,
        )
        .await?;
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

    let source = Path::new(&source_path);

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

    let manifest_json = serde_json::to_string(&manifest).map_err(AppError::io)?;

    // Проверяем зависимости
    let dep_result = crate::commands::plugin_deps::check_dependencies(&db, &manifest).await?;

    let warning = if dep_result.warnings.is_empty() {
        None
    } else {
        Some(dep_result.warnings.join("; "))
    };

    // Активен только если все зависимости удовлетворены
    let should_activate = dep_result.all_satisfied;

    // Распаковываем плагин
    let plugin_root = paths.plugins_dir.join(&manifest.id).join(&manifest.version);

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

    // Импортируем компендии из плагина
    import_plugin_compendiums(&db, &plugin_root, &manifest).await?;

    // Сохраняем в installed_plugins
    db.upsert_installed_plugin(
        &manifest.id,
        &manifest.version,
        should_activate,
        &manifest_json,
    )
    .await?;

    // Устанавливаем compat_warning
    db.set_plugin_compat_warning(&manifest.id, warning).await?;

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

    if is_active {
        // При активации проверяем зависимости
        let plugin = db
            .get_installed_plugin(&plugin_id)
            .await?
            .ok_or(AppError::NotFound)?;

        let manifest: PluginManifest = serde_json::from_str(&plugin.manifest_json)
            .map_err(|e| AppError::Validation(format!("Invalid manifest: {}", e)))?;

        let dep_result = crate::commands::plugin_deps::check_dependencies(&db, &manifest).await?;

        if !dep_result.missing.is_empty() {
            return Err(AppError::Validation(format!(
                "Cannot activate plugin: missing dependencies: {}",
                dep_result.missing.join(", ")
            )));
        }

        if !dep_result.inactive.is_empty() {
            return Err(AppError::Validation(format!(
                "Cannot activate plugin: inactive dependencies: {}",
                dep_result.inactive.join(", ")
            )));
        }
    } else {
        // При деактивации проверяем, не зависит ли кто-то от этого плагина
        let dependents = db.get_dependent_plugins(&plugin_id).await?;

        if !dependents.is_empty() {
            return Err(AppError::Validation(format!(
                "Cannot deactivate plugin: active plugins depend on it: {}",
                dependents.join(", ")
            )));
        }
    }

    db.set_plugin_active(&plugin_id, is_active).await
}

#[tauri::command]
#[specta::specta]
pub async fn uninstall_plugin(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    plugin_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    // Получаем плагин для определения версии
    let plugin = db
        .get_installed_plugin(&plugin_id)
        .await?
        .ok_or(AppError::NotFound)?;

    // Удаляем компендии плагина
    db.delete_compendiums_by_plugin(&plugin_id).await?;

    // Удаляем из installed_plugins
    db.delete_installed_plugin(&plugin_id).await?;

    // Удаляем файлы плагина
    let plugin_dir = paths.plugins_dir.join(&plugin_id);
    if plugin_dir.exists() {
        fs::remove_dir_all(&plugin_dir).map_err(AppError::io)?;
    }

    Ok(())
}

/// Возвращает список всех декларативных листов из активных плагинов.
#[tauri::command]
#[specta::specta]
pub async fn list_plugin_sheets(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
) -> Result<Vec<PluginSheetInfo>, AppError> {
    let db = require_db(&state.campaign).await?;

    let plugins = db.list_installed_plugins().await?;

    let mut sheets: Vec<PluginSheetInfo> = Vec::new();

    for plugin in plugins {
        if !plugin.is_active {
            continue;
        }

        // Парсим манифест для получения sheets
        let manifest: PluginManifest =
            serde_json::from_str(&plugin.manifest_json).map_err(AppError::io)?;

        let plugin_root = paths
            .plugins_dir
            .join(&plugin.plugin_id)
            .join(&plugin.version);

        for sheet_ref in &manifest.sheets {
            let file_path = plugin_root.join(&sheet_ref.file);

            if !file_path.exists() {
                continue;
            }

            let name = sheet_ref
                .label
                .clone()
                .unwrap_or_else(|| sheet_ref.key.clone());

            sheets.push(PluginSheetInfo {
                plugin_id: plugin.plugin_id.clone(),
                sheet_key: sheet_ref.key.clone(),
                name,
                file_path: sheet_ref.file.clone(),
            });
        }
    }

    Ok(sheets)
}

#[tauri::command]
#[specta::specta]
pub async fn get_plugin_sheet(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    plugin_id: String,
    sheet_key: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let plugin = db
        .get_installed_plugin(&plugin_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let manifest: PluginManifest =
        serde_json::from_str(&plugin.manifest_json).map_err(AppError::io)?;

    let sheet_ref = manifest
        .sheets
        .iter()
        .find(|s| s.key == sheet_key)
        .ok_or(AppError::NotFound)?;

    let plugin_root = paths.plugins_dir.join(&plugin_id).join(&plugin.version);

    let file_path = plugin_root.join(&sheet_ref.file);

    if !file_path.exists() {
        return Err(AppError::NotFound);
    }

    let content = fs::read_to_string(&file_path).map_err(AppError::io)?;

    serde_json::from_str::<serde_json::Value>(&content)
        .map_err(|e| AppError::Validation(format!("Invalid sheet JSON: {e}")))?;

    Ok(content)
}

/// Возвращает список всех тем из активных плагинов.
#[tauri::command]
#[specta::specta]
pub async fn list_plugin_themes(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
) -> Result<Vec<PluginThemeInfo>, AppError> {
    let db = require_db(&state.campaign).await?;

    let plugins = db.list_installed_plugins().await?;

    let mut themes: Vec<PluginThemeInfo> = Vec::new();

    for plugin in plugins {
        if !plugin.is_active {
            continue;
        }

        let manifest: PluginManifest =
            serde_json::from_str(&plugin.manifest_json).map_err(AppError::io)?;

        let plugin_root = paths
            .plugins_dir
            .join(&plugin.plugin_id)
            .join(&plugin.version);

        for theme_ref in &manifest.themes {
            let file_path = plugin_root.join(&theme_ref.file);

            if !file_path.exists() {
                continue;
            }

            themes.push(PluginThemeInfo {
                plugin_id: plugin.plugin_id.clone(),
                theme_key: theme_ref.key.clone(),
                file_path: theme_ref.file.clone(),
            });
        }
    }

    Ok(themes)
}

/// Возвращает содержимое CSS-файла темы.
#[tauri::command]
#[specta::specta]
pub async fn get_plugin_theme_css(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    plugin_id: String,
    theme_key: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let plugin = db
        .get_installed_plugin(&plugin_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let manifest: PluginManifest =
        serde_json::from_str(&plugin.manifest_json).map_err(AppError::io)?;

    let theme_ref = manifest
        .themes
        .iter()
        .find(|t| t.key == theme_key)
        .ok_or(AppError::NotFound)?;

    let plugin_root = paths.plugins_dir.join(&plugin_id).join(&plugin.version);

    let file_path = plugin_root.join(&theme_ref.file);

    if !file_path.exists() {
        return Err(AppError::NotFound);
    }

    let content = fs::read_to_string(&file_path).map_err(AppError::io)?;

    Ok(content)
}

/// Возвращает все доступные типы связей: встроенные + из активных плагинов.
#[tauri::command]
#[specta::specta]
pub async fn list_link_types(state: State<'_, AppState>) -> Result<Vec<LinkTypeInfo>, AppError> {
    let db = require_db(&state.campaign).await?;

    // Встроенные типы связей
    let mut link_types: Vec<LinkTypeInfo> = vec![
        LinkTypeInfo {
            key: "reference".to_string(),
            label: "Reference".to_string(),
            directed: true,
            color: None,
            source_plugin_id: None,
        },
        LinkTypeInfo {
            key: "related".to_string(),
            label: "Related".to_string(),
            directed: false,
            color: None,
            source_plugin_id: None,
        },
        LinkTypeInfo {
            key: "parent".to_string(),
            label: "Parent".to_string(),
            directed: true,
            color: None,
            source_plugin_id: None,
        },
        LinkTypeInfo {
            key: "child".to_string(),
            label: "Child".to_string(),
            directed: true,
            color: None,
            source_plugin_id: None,
        },
    ];

    // Типы связей из активных плагинов
    let plugins = db.list_installed_plugins().await?;

    for plugin in plugins {
        if !plugin.is_active {
            continue;
        }

        let manifest: PluginManifest =
            serde_json::from_str(&plugin.manifest_json).map_err(AppError::io)?;

        for lt in &manifest.link_types {
            link_types.push(LinkTypeInfo {
                key: lt.key.clone(),
                label: lt.label.clone().unwrap_or_else(|| lt.key.clone()),
                directed: lt.directed,
                color: lt.color.clone(),
                source_plugin_id: Some(plugin.plugin_id.clone()),
            });
        }
    }

    Ok(link_types)
}

/// Устанавливает встроенный плагин из ресурсов приложения.
#[tauri::command]
#[specta::specta]
pub async fn install_builtin_plugin(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    plugin_name: String,
) -> Result<InstalledPluginSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    if plugin_name.is_empty()
        || plugin_name.contains('/')
        || plugin_name.contains('\\')
        || plugin_name.contains("..")
    {
        return Err(AppError::Validation("Invalid plugin name".to_string()));
    }

    // let resource_dir = app
    //     .path()
    //     .resource_dir()
    //     .map_err(|e| AppError::Io(format!("Failed to get resource dir: {e}")))?;

    // let resource_path = resource_dir
    //     .join("resources")
    //     .join("builtin-plugins")
    //     .join(format!("{}.dndplugin", plugin_name));

    // if !resource_path.exists() {
    //     return Err(AppError::Validation(format!(
    //         "Builtin plugin '{}' not found",
    //         plugin_name
    //     )));
    // }
    let resource_path = if cfg!(debug_assertions) {
        // В dev-режиме читаем из исходников
        std::path::PathBuf::from("resources/builtin-plugins")
            .join(format!("{}.dndplugin", plugin_name))
    } else {
        // В release читаем из bundle
        let resource_dir = app
            .path()
            .resource_dir()
            .map_err(|e| AppError::Io(format!("Failed to get resource dir: {e}")))?;

        resource_dir
            .join("resources")
            .join("builtin-plugins")
            .join(format!("{}.dndplugin", plugin_name))
    };

    let resource_bytes = fs::read(&resource_path).map_err(AppError::io)?;

    let cursor = std::io::Cursor::new(resource_bytes);
    let mut archive = ZipArchive::new(cursor)
        .map_err(|_| AppError::Validation("Invalid builtin plugin archive".to_string()))?;

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

    let manifest_json = serde_json::to_string(&manifest).map_err(AppError::io)?;

    let plugin_root = paths.plugins_dir.join(&manifest.id).join(&manifest.version);

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

    import_plugin_compendiums(&db, &plugin_root, &manifest).await?;

    db.upsert_installed_plugin(&manifest.id, &manifest.version, true, &manifest_json)
        .await?;

    db.get_installed_plugin(&manifest.id)
        .await?
        .ok_or(AppError::NotFound)
}

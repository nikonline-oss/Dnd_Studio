use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, PluginManifest};
use tauri::State;

/// Результат проверки зависимостей
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct DependencyCheckResult {
    pub all_satisfied: bool,
    pub missing: Vec<String>,
    pub inactive: Vec<String>,
    pub warnings: Vec<String>,
}

/// Проверяет зависимости плагина по его манифесту
pub async fn check_dependencies(
    db: &dnd_db::CampaignDb,
    manifest: &PluginManifest,
) -> Result<DependencyCheckResult, AppError> {
    let mut missing = Vec::new();
    let mut inactive = Vec::new();
    let mut warnings = Vec::new();

    for dep in &manifest.dependencies {
        let installed = db.is_plugin_installed(&dep.id).await?;

        if !installed {
            missing.push(dep.id.clone());
            warnings.push(format!(
                "Missing dependency: {} ({})",
                dep.id, dep.version
            ));
            continue;
        }

        let active = db.is_plugin_active(&dep.id).await?;

        if !active {
            inactive.push(dep.id.clone());
            warnings.push(format!(
                "Dependency '{}' is installed but not active",
                dep.id
            ));
        }
    }

    // Проверяем dnd_studio_compat
    if let Some(compat) = &manifest.dnd_studio_compat {
        if !compat.contains("0.1") && !compat.contains(">=0") {
            warnings.push(format!(
                "Plugin requires DndStudio version '{}', current may be incompatible",
                compat
            ));
        }
    }

    Ok(DependencyCheckResult {
        all_satisfied: missing.is_empty() && inactive.is_empty(),
        missing,
        inactive,
        warnings,
    })
}

/// Проверяет зависимости установленного плагина и обновляет compat_warning
#[tauri::command]
#[specta::specta]
pub async fn validate_plugin_dependencies(
    state: State<'_, AppState>,
    plugin_id: String,
) -> Result<DependencyCheckResult, AppError> {
    let db = require_db(&state.campaign).await?;

    let plugin = db
        .get_installed_plugin(&plugin_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let manifest: PluginManifest = serde_json::from_str(&plugin.manifest_json)
        .map_err(|e| AppError::Validation(format!("Invalid manifest: {}", e)))?;

    let result = check_dependencies(&db, &manifest).await?;

    // Обновляем compat_warning
    let warning = if result.warnings.is_empty() {
        None
    } else {
        Some(result.warnings.join("; "))
    };

    db.set_plugin_compat_warning(&plugin_id, warning)
        .await?;

    Ok(result)
}

/// Проверяет, можно ли деактивировать плагин.
/// Возвращает список активных плагинов, которые зависят от указанного.
#[tauri::command]
#[specta::specta]
pub async fn can_deactivate_plugin(
    state: State<'_, AppState>,
    plugin_id: String,
) -> Result<Vec<String>, AppError> {
    let db = require_db(&state.campaign).await?;

    let dependents = db.get_dependent_plugins(&plugin_id).await?;

    Ok(dependents)
}

/// Проверяет, можно ли удалить плагин.
/// Возвращает список плагинов, которые зависят от указанного.
#[tauri::command]
#[specta::specta]
pub async fn can_uninstall_plugin(
    state: State<'_, AppState>,
    plugin_id: String,
) -> Result<Vec<String>, AppError> {
    let db = require_db(&state.campaign).await?;

    let plugins = db.list_installed_plugins().await?;

    let mut dependents = Vec::new();

    for plugin in &plugins {
        if plugin.plugin_id == plugin_id {
            continue;
        }

        let manifest: Result<PluginManifest, _> =
            serde_json::from_str(&plugin.manifest_json);

        if let Ok(manifest) = manifest {
            for dep in &manifest.dependencies {
                if dep.id == plugin_id {
                    dependents.push(plugin.plugin_id.clone());
                    break;
                }
            }
        }
    }

    Ok(dependents)
}
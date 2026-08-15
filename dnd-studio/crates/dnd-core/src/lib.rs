use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CampaignSummary {
    pub id: String,
    pub name: String,
    pub file_name: String,
    pub created_at: i32,
    pub last_opened_at: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ActiveCampaign {
    pub id: String,
    pub name: String,
    pub path: String,
    pub meta: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MapSummary {
    pub id: String,
    pub world_id: String,
    pub name: String,
    pub image_path: String,
    pub grid_size: i32,
    pub width: i32,
    pub height: i32,
    pub fog_data: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TokenSummary {
    pub id: String,
    pub map_id: String,
    pub character_id: Option<String>,
    pub character_name: Option<String>,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
    pub is_visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CharacterSummary {
    pub id: String,
    pub name: String,

    #[serde(rename = "type")]
    pub character_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntrySummary {
    pub id: String,
    pub title: String,
    pub folder_path: String,
    pub is_visible_to_players: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntryDetail {
    pub id: String,
    pub title: String,
    pub content_markdown: String,
    pub folder_path: String,
    pub is_visible_to_players: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CharacterDetail {
    pub id: String,
    pub name: String,

    #[serde(rename = "type")]
    pub character_type: String,

    pub data_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CompendiumSummary {
    pub id: String,
    pub name: String,
    pub source_plugin_id: Option<String>,
    pub r#type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CompendiumEntrySummary {
    pub id: String,
    pub compendium_id: String,
    pub entry_key: String,
    pub name: String,
    pub data_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct InstalledPluginSummary {
    pub plugin_id: String,
    pub version: String,
    pub is_active: bool,
    pub manifest_json: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCompendiumEntry {
    pub key: String,
    pub name: String,

    #[serde(default)]
    pub data: serde_json::Value,
}

/// Файл компендия в плагине
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCompendiumFile {
    #[serde(default)]
    pub entries: Vec<PluginCompendiumEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginDependency {
    pub id: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCompendiumRef {
    pub key: String,
    pub file: String,

    #[serde(rename = "type")]
    pub compendium_type: String,

    #[serde(default)]
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginSheetRef {
    pub key: String,
    pub file: String,

    #[serde(default)]
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginThemeRef {
    pub key: String,
    pub file: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginLinkTypeRef {
    pub key: String,

    #[serde(default)]
    pub label: Option<String>,

    #[serde(default)]
    pub directed: bool,

    #[serde(default)]
    pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,

    #[serde(default)]
    pub author: Option<String>,

    #[serde(default)]
    pub dnd_studio_compat: Option<String>,

    #[serde(default)]
    pub description: Option<String>,

    #[serde(default)]
    pub dependencies: Vec<PluginDependency>,

    #[serde(default)]
    pub sheets: Vec<PluginSheetRef>,

    #[serde(default)]
    pub compendiums: Vec<PluginCompendiumRef>,

    #[serde(default)]
    pub themes: Vec<PluginThemeRef>,

    #[serde(default)]
    pub link_types: Vec<PluginLinkTypeRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct PluginSheetInfo {
    pub plugin_id: String,
    pub sheet_key: String,
    pub name: String,
    pub file_path: String,
}

#[derive(Debug, thiserror::Error, Serialize, specta::Type)]
#[serde(tag = "kind", content = "message")]
pub enum AppError {
    #[error("Database error: {0}")]
    Db(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Campaign not found")]
    NotFound,

    #[error("Campaign is not open")]
    NoCampaign,
}

impl AppError {
    pub fn io(err: impl ToString) -> Self {
        Self::Io(err.to_string())
    }

    pub fn db(err: impl ToString) -> Self {
        Self::Db(err.to_string())
    }
}

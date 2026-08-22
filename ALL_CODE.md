# Структура проекта DnD Studio

## Дерево файлов
```
./.vscode/extensions.json
./README.md
./crates/dnd-core/src/lib.rs
./crates/dnd-db/src/lib.rs
./crates/dnd-dsl/src/lib.rs
./crates/dnd-net/src/lib.rs
./crates/dnd-relay/src/campaign_manager.rs
./crates/dnd-relay/src/main.rs
./crates/dnd-relay/src/protocol.rs
./crates/dnd-relay/src/room.rs
./crates/dnd-relay/src/state.rs
./crates/dnd-relay/src/ws.rs
./eslint.config.js
./index.html
./package-lock.json
./package.json
./src-tauri/build.rs
./src-tauri/capabilities/default.json
./src-tauri/resources/builtin-plugins/srd-monsters/compendiums/monsters.json
./src-tauri/resources/builtin-plugins/srd-monsters/plugin.yaml
./src-tauri/src/commands/assets.rs
./src-tauri/src/commands/campaign.rs
./src-tauri/src/commands/campaign_io.rs
./src-tauri/src/commands/characters.rs
./src-tauri/src/commands/compendiums.rs
./src-tauri/src/commands/journal.rs
./src-tauri/src/commands/maps.rs
./src-tauri/src/commands/mod.rs
./src-tauri/src/commands/plugin_deps.rs
./src-tauri/src/commands/plugins.rs
./src-tauri/src/commands/profiles.rs
./src-tauri/src/commands/tokens.rs
./src-tauri/src/lib.rs
./src-tauri/src/main.rs
./src-tauri/src/state.rs
./src-tauri/tauri.conf.json
./src/app/App.css
./src/app/App.tsx
./src/app/AppShell.tsx
./src/features/campaign-start/StartScreen.tsx
./src/features/character/CharacterTab.tsx
./src/features/character/CreateCharacterModal.tsx
./src/features/chat/ChatPanel.tsx
./src/features/compendium/CompendiumEntryEditor.tsx
./src/features/compendium/CompendiumTab.tsx
./src/features/compendium/CreateCompendiumModal.tsx
./src/features/compendium/MonsterCard.tsx
./src/features/initiative/InitiativePanel.tsx
./src/features/journal/JournalTab.tsx
./src/features/map/CreateMapModal.tsx
./src/features/map/MapCanvas.tsx
./src/features/map/MapImageImportDialog.tsx
./src/features/map/MapTab.tsx
./src/features/multiplayer/ConnectionPanel.tsx
./src/features/multiplayer/WaitingForGM.tsx
./src/features/navigator/CampaignTree.tsx
./src/features/profile/ProfileSelectScreen.tsx
./src/features/sheets/SheetRenderer.tsx
./src/main.tsx
./src/shared/api/bindings.ts
./src/shared/api/client.ts
./src/shared/api/hooks.ts
./src/shared/hooks/useAutoOpenLastCampaign.ts
./src/shared/hooks/useDraggable.ts
./src/shared/hooks/useDropTarget.ts
./src/shared/hooks/useGlobalShortcuts.ts
./src/shared/hooks/useKeyboardShortcuts.ts
./src/shared/hooks/useMultiplayerSync.ts
./src/shared/hooks/usePlayerVisibility.ts
./src/shared/hooks/usePluginDragDrop.ts
./src/shared/hooks/usePluginTheme.ts
./src/shared/hooks/useThemeEffect.ts
./src/shared/hooks/useWorkspaceHydration.ts
./src/shared/lib/debug.ts
./src/shared/lib/dice.ts
./src/shared/services/campaignSharing.ts
./src/shared/services/relayClient.ts
./src/shared/stores/chat.ts
./src/shared/stores/drag.ts
./src/shared/stores/encounter.ts
./src/shared/stores/mapSettings.ts
./src/shared/stores/table.ts
./src/shared/stores/ui.test.ts
./src/shared/stores/ui.ts
./src/shared/stores/workspace.ts
./src/shared/theme/theme.ts
./src/shared/ui/BottomPanel.tsx
./src/shared/ui/CenterArea.tsx
./src/shared/ui/ConfirmDialog.tsx
./src/shared/ui/DragOverlay.tsx
./src/shared/ui/LeftActivityBar.tsx
./src/shared/ui/LeftPanel.tsx
./src/shared/ui/Modal.tsx
./src/shared/ui/RightActivityBar.tsx
./src/shared/ui/RightPanel.tsx
./src/shared/ui/StatusBar.tsx
./src/shared/ui/ThemeSelector.tsx
./src/shared/ui/TopBar.tsx
./src/shared/ui/WorkspaceTabBar.tsx
./src/shared/ui/menu/Menu.tsx
./src/styles/global.css
./src/vite-env.d.ts
./tsconfig.json
./tsconfig.node.json
./vite.config.ts
``\

---
## Файл: ./.vscode/extensions.json
```
{
  "recommendations": ["tauri-apps.tauri-vscode", "rust-lang.rust-analyzer"]
}
```

---
## Файл: ./README.md
```
# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
```

---
## Файл: ./crates/dnd-core/src/lib.rs
```
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================
// Кампании
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CampaignSummary {
    pub id: String,
    pub name: String,
    pub file_name: String,
    pub created_at: i32,
    pub last_opened_at: Option<i32>,
    #[serde(default)]
    pub campaign_type: CampaignType,
    #[serde(default)]
    pub server_config: Option<ServerConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub enum CampaignType {
    Local,
    Server,
}

impl Default for CampaignType {
    fn default() -> Self {
        CampaignType::Local
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfig {
    pub server_url: String,
    pub room_id: String,
    pub token: String,
    pub display_name: String,
    pub role: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ActiveCampaign {
    pub id: String,
    pub name: String,
    pub path: String,
    pub meta: HashMap<String, String>,
}

// ============================================
// Активы
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct AssetSummary {
    pub id: String,
    pub r#type: String,
    pub filename: String,
    pub content_hash: String,
    pub mime_type: String,
    pub size_bytes: i32,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub thumb_filename: Option<String>,
    pub created_at: i32,
}

// ============================================
// Карты
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MapSummary {
    pub id: String,
    pub world_id: String,
    pub name: String,
    pub asset_id: Option<String>,
    pub image_path: Option<String>,
    pub grid_size: i32,
    pub grid_offset_x: f64,
    pub grid_offset_y: f64,
    pub scale: f64,
    pub width: i32,
    pub height: i32,
    pub sort_order: i32,
    pub is_visible_to_players: bool,
    pub version: i32,
    pub fog_data: Option<String>,
}

// ============================================
// Персонажи
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CharacterSummary {
    pub id: String,
    pub name: String,

    #[serde(rename = "type")]
    pub character_type: String,

    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CharacterDetail {
    pub id: String,
    pub name: String,

    #[serde(rename = "type")]
    pub character_type: String,

    pub data_json: String,
    pub status: String,
    pub portrait_asset_id: Option<String>,
    pub created_at: i32,
    pub updated_at: i32,
    pub version: i32,
}

// ============================================
// Токены
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct TokenSummary {
    pub id: String,
    pub map_id: String,
    pub character_id: Option<String>,
    pub asset_id: Option<String>,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
    pub scale: f64,
    pub is_visible: bool,
    pub layer: String,
    pub version: i32,
    pub character_name: Option<String>,
}

// ============================================
// Журнал
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntrySummary {
    pub id: String,
    pub title: String,
    pub folder_path: String,
    pub visibility: String,
    pub players_can_edit: bool,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntryDetail {
    pub id: String,
    pub title: String,
    pub content_markdown: String,
    pub folder_path: String,
    pub visibility: String,
    pub players_can_edit: bool,
    pub sort_order: i32,
    pub created_at: i32,
    pub updated_at: i32,
    pub version: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct JournalLinkSummary {
    pub id: String,
    pub source_entry_id: String,
    pub target_type: String,
    pub target_id: String,
    pub link_type: String,
    pub is_directed: bool,
    pub weight: f64,
    pub label: Option<String>,
    pub is_visible_to_players: bool,
}

// ============================================
// Компендии
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CompendiumSummary {
    pub id: String,
    pub name: String,
    pub source_plugin_id: Option<String>,
    pub r#type: String,
    pub version: String,
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

// ============================================
// Плагины
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct InstalledPluginSummary {
    pub plugin_id: String,
    pub version: String,
    pub is_active: bool,
    pub manifest_json: String,
    pub installed_at: i32,
    pub compat_warning: Option<String>,
}

// ============================================
// Манифесты плагинов
// ============================================

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

// ============================================
// Данные компендиев из плагинов
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCompendiumEntry {
    pub key: String,
    pub name: String,

    #[serde(default)]
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCompendiumFile {
    #[serde(default)]
    pub entries: Vec<PluginCompendiumEntry>,
}

// ============================================
// Листы и темы плагинов
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct PluginSheetInfo {
    pub plugin_id: String,
    pub sheet_key: String,
    pub name: String,
    pub file_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct PluginThemeInfo {
    pub plugin_id: String,
    pub theme_key: String,
    pub file_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct LinkTypeInfo {
    pub key: String,
    pub label: String,
    pub directed: bool,
    pub color: Option<String>,
    pub source_plugin_id: Option<String>,
}

// ============================================
// Ошибки
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct MultiplayerSessionInfo {
    pub room_id: String,
    pub server_url: String,
    pub role: String,
    pub display_name: String,
    pub connected_at: i32,
    pub last_sync_at: i32,
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
```

---
## Файл: ./crates/dnd-db/src/lib.rs
```
use dnd_core::{
    AppError, CampaignSummary, CharacterDetail, CharacterSummary, CompendiumEntrySummary,
    CompendiumSummary, InstalledPluginSummary, JournalEntryDetail, JournalEntrySummary,
    JournalLinkSummary, MapSummary, TokenSummary,
};
use serde::{Deserialize, Serialize};
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous};
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct CampaignDb {
    pool: SqlitePool,
    path: PathBuf,
}

impl CampaignDb {
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
    
    pub async fn create(path: &Path) -> Result<Self, AppError> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(AppError::io)?;
        }

        if path.exists() {
            return Err(AppError::Validation(
                "Campaign file already exists".to_string(),
            ));
        }

        let pool = connect(path, true).await?;

        Ok(Self {
            pool,
            path: path.to_path_buf(),
        })
    }

    pub async fn open(path: &Path) -> Result<Self, AppError> {
        if !path.exists() {
            return Err(AppError::NotFound);
        }

        let pool = connect(path, false).await?;

        Ok(Self {
            pool,
            path: path.to_path_buf(),
        })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    // ============================================
    // campaign_meta
    // ============================================

    pub async fn set_meta(&self, key: &str, value: &str) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO campaign_meta (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            "#,
        )
        .bind(key)
        .bind(value)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(())
    }

    pub async fn meta(&self) -> Result<HashMap<String, String>, AppError> {
        let rows = sqlx::query_as::<_, (String, String)>("SELECT key, value FROM campaign_meta")
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::db)?;

        Ok(rows.into_iter().collect())
    }

    // ============================================
    // worlds
    // ============================================

    pub async fn default_world_id(&self) -> Result<String, AppError> {
        let existing = sqlx::query_scalar::<_, String>(
            "SELECT id FROM worlds ORDER BY sort_order, rowid LIMIT 1",
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        if let Some(id) = existing {
            return Ok(id);
        }

        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query("INSERT INTO worlds (id, name, sort_order, version) VALUES (?, ?, 0, 0)")
            .bind(&id)
            .bind("Default")
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        Ok(id)
    }
    /// Создаёт дефолтный мир для карт (если ещё нет).
    pub async fn create_default_world(&self) -> Result<(), AppError> {
        // Проверяем, есть ли уже миры
        let count = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM worlds")
            .fetch_one(&self.pool)
            .await
            .map_err(AppError::db)?;

        if count > 0 {
            return Ok(());
        }

        // Создаём дефолтный мир
        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO worlds (id, name, description, sort_order, version)
            VALUES (?, 'Default World', 'Default world for maps', 0, 0)
            "#,
        )
        .bind(&id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(())
    }
    // ============================================
    // maps
    // ============================================

    pub async fn create_map(
        &self,
        world_id: &str,
        name: &str,
        width: i32,
        height: i32,
        grid_size: i32,
    ) -> Result<MapSummary, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation("Map name is required".to_string()));
        }

        if width <= 0 || height <= 0 {
            return Err(AppError::Validation(
                "Map width and height must be positive".to_string(),
            ));
        }

        if grid_size <= 0 {
            return Err(AppError::Validation(
                "Grid size must be positive".to_string(),
            ));
        }

        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
        INSERT INTO maps (
            id, world_id, name, asset_id, image_path, grid_size,
            grid_offset_x, grid_offset_y, scale,
            width, height, sort_order, is_visible_to_players, version
        )
        VALUES (?, ?, ?, NULL, NULL, ?, 0, 0, 1.0, ?, ?, 0, 0, 0)
        "#,
        )
        .bind(&id)
        .bind(world_id)
        .bind(&name)
        .bind(grid_size)
        .bind(width)
        .bind(height)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(MapSummary {
            id,
            world_id: world_id.to_string(),
            name,
            asset_id: None,
            image_path: None,
            grid_size,
            grid_offset_x: 0.0,
            grid_offset_y: 0.0,
            scale: 1.0,
            width,
            height,
            sort_order: 0,
            is_visible_to_players: false,
            version: 0,
            fog_data: None,
        })
    }

    pub async fn list_maps(&self) -> Result<Vec<MapSummary>, AppError> {
        let rows = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                Option<String>,
                Option<String>,
                i32,
                f64,
                f64,
                f64,
                i32,
                i32,
                i32,
                i32,
                i32,
                Option<Vec<u8>>,
            ),
        >(
            r#"
        SELECT
            id, world_id, name, asset_id, image_path, grid_size,
            grid_offset_x, grid_offset_y, scale,
            width, height, sort_order, is_visible_to_players, version,
            fog_data
        FROM maps
        ORDER BY sort_order, name
        "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows.into_iter().map(row_to_map).collect())
    }

    pub async fn get_map(&self, id: &str) -> Result<Option<MapSummary>, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                Option<String>,
                Option<String>,
                i32,
                f64,
                f64,
                f64,
                i32,
                i32,
                i32,
                i32,
                i32,
                Option<Vec<u8>>,
            ),
        >(
            r#"
        SELECT
            id, world_id, name, asset_id, image_path, grid_size,
            grid_offset_x, grid_offset_y, scale,
            width, height, sort_order, is_visible_to_players, version,
            fog_data
        FROM maps
        WHERE id = ?
        "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(row_to_map))
    }

    pub async fn update_map_asset(
        &self,
        map_id: &str,
        asset_id: Option<String>,
    ) -> Result<MapSummary, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE maps
            SET asset_id = ?, version = version + 1
            WHERE id = ?
            "#,
        )
        .bind(&asset_id)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.get_map(map_id).await?.ok_or(AppError::NotFound)
    }

    pub async fn update_map_fog(
        &self,
        map_id: &str,
        fog_data: Option<String>,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE maps
            SET fog_data = ?
            WHERE id = ?
            "#,
        )
        .bind(&fog_data)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    pub async fn update_map_image_path(
        &self,
        map_id: &str,
        image_path: &str,
    ) -> Result<MapSummary, AppError> {
        let result = sqlx::query(
            r#"
        UPDATE maps
        SET image_path = ?, version = version + 1
        WHERE id = ?
        "#,
        )
        .bind(image_path)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.get_map(map_id).await?.ok_or(AppError::NotFound)
    }

    pub async fn update_map_dimensions(
        &self,
        map_id: &str,
        width: i32,
        height: i32,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
        UPDATE maps
        SET width = ?, height = ?, version = version + 1
        WHERE id = ?
        "#,
        )
        .bind(width)
        .bind(height)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    pub async fn update_map_settings(
        &self,
        map_id: &str,
        width: i32,
        height: i32,
        grid_size: i32,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
        UPDATE maps
        SET width = ?, height = ?, grid_size = ?, version = version + 1
        WHERE id = ?
        "#,
        )
        .bind(width)
        .bind(height)
        .bind(grid_size)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    // ============================================
    // tokens
    // ============================================

    pub async fn create_token(
        &self,
        map_id: &str,
        x: f64,
        y: f64,
        character_id: Option<String>,
    ) -> Result<TokenSummary, AppError> {
        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO tokens (
                id, map_id, character_id, asset_id,
                x, y, rotation, scale, is_visible, layer, version
            )
            VALUES (?, ?, ?, NULL, ?, ?, 0, 1.0, 1, 'default', 0)
            "#,
        )
        .bind(&id)
        .bind(map_id)
        .bind(&character_id)
        .bind(x)
        .bind(y)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(TokenSummary {
            id,
            map_id: map_id.to_string(),
            character_id,
            asset_id: None,
            x,
            y,
            rotation: 0.0,
            scale: 1.0,
            is_visible: true,
            layer: "default".to_string(),
            version: 0,
            character_name: None,
        })
    }

    pub async fn list_tokens(&self, map_id: &str) -> Result<Vec<TokenSummary>, AppError> {
        let rows = sqlx::query_as::<
            _,
            (
                String,
                String,
                Option<String>,
                Option<String>,
                f64,
                f64,
                f64,
                f64,
                i32,
                String,
                i32,
                Option<String>,
            ),
        >(
            r#"
            SELECT
                t.id, t.map_id, t.character_id, t.asset_id,
                t.x, t.y, t.rotation, t.scale, t.is_visible, t.layer, t.version,
                c.name
            FROM tokens t
            LEFT JOIN characters c ON c.id = t.character_id
            WHERE t.map_id = ?
            ORDER BY t.rowid
            "#,
        )
        .bind(map_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows.into_iter().map(row_to_token).collect())
    }

    /// Возвращает все токены кампании (для использования в CampaignManager)
    pub async fn list_all_tokens(&self) -> Result<Vec<TokenSummary>, AppError> {
        let rows = sqlx::query_as::<
            _,
            (
                String, String, Option<String>, Option<String>, f64, f64, f64, f64, i32, String, i32, Option<String>,
            ),
        >(
            r#"
            SELECT
                t.id, t.map_id, t.character_id, t.asset_id,
                t.x, t.y, t.rotation, t.scale, t.is_visible, t.layer, t.version,
                c.name
            FROM tokens t
            LEFT JOIN characters c ON c.id = t.character_id
            ORDER BY t.map_id, t.rowid
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows.into_iter().map(|row| {
            let (id, map_id, character_id, asset_id, x, y, rotation, scale, is_visible, layer, version, character_name) = row;
            TokenSummary {
                id,
                map_id,
                character_id,
                asset_id,
                x,
                y,
                rotation,
                scale,
                is_visible: is_visible != 0,
                layer,
                version,
                character_name,
            }
        }).collect())
    }

    pub async fn move_token(
        &self,
        map_id: &str,
        token_id: &str,
        x: f64,
        y: f64,
    ) -> Result<TokenSummary, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE tokens
            SET x = ?, y = ?, version = version + 1
            WHERE id = ? AND map_id = ?
            "#,
        )
        .bind(x)
        .bind(y)
        .bind(token_id)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.fetch_token(token_id).await
    }

    pub async fn delete_token(
        &self,
        map_id: &str,
        token_id: &str,
    ) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM tokens WHERE id = ? AND map_id = ?")
            .bind(token_id)
            .bind(map_id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    pub async fn assign_token_character(
        &self,
        map_id: &str,
        token_id: &str,
        character_id: Option<String>,
    ) -> Result<TokenSummary, AppError> {
        if let Some(character_id) = &character_id {
            let character_exists =
                sqlx::query_scalar::<_, String>("SELECT id FROM characters WHERE id = ?")
                    .bind(character_id)
                    .fetch_optional(&self.pool)
                    .await
                    .map_err(AppError::db)?;

            if character_exists.is_none() {
                return Err(AppError::NotFound);
            }
        }

        let result = sqlx::query(
            r#"
            UPDATE tokens
            SET character_id = ?
            WHERE id = ? AND map_id = ?
            "#,
        )
        .bind(&character_id)
        .bind(token_id)
        .bind(map_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.fetch_token(token_id).await
    }

    async fn fetch_token(&self, token_id: &str) -> Result<TokenSummary, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                Option<String>,
                Option<String>,
                f64,
                f64,
                f64,
                f64,
                i32,
                String,
                i32,
                Option<String>,
            ),
        >(
            r#"
            SELECT
                t.id, t.map_id, t.character_id, t.asset_id,
                t.x, t.y, t.rotation, t.scale, t.is_visible, t.layer, t.version,
                c.name
            FROM tokens t
            LEFT JOIN characters c ON c.id = t.character_id
            WHERE t.id = ?
            "#,
        )
        .bind(token_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?
        .ok_or(AppError::NotFound)?;

        Ok(row_to_token(row))
    }

    // ============================================
    // journal_entries
    // ============================================

    pub async fn create_journal_entry(
        &self,
        title: &str,
        folder_path: &str,
    ) -> Result<JournalEntrySummary, AppError> {
        let title = title.trim().to_string();

        if title.is_empty() {
            return Err(AppError::Validation(
                "Journal entry title is required".to_string(),
            ));
        }

        let folder_path = normalize_folder_path(folder_path);
        let id = uuid::Uuid::new_v4().to_string();
        let now = now_unix();

        sqlx::query(
            r#"
            INSERT INTO journal_entries (
                id, title, content_markdown, folder_path, sort_order,
                visibility, players_can_edit, created_at, updated_at, version
            )
            VALUES (?, ?, '', ?, 0, 'gm_only', 0, ?, ?, 0)
            "#,
        )
        .bind(&id)
        .bind(&title)
        .bind(&folder_path)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(JournalEntrySummary {
            id,
            title,
            folder_path,
            visibility: "gm_only".to_string(),
            players_can_edit: false,
            sort_order: 0,
        })
    }

    pub async fn get_journal_entry(
        &self,
        id: &str,
    ) -> Result<Option<JournalEntryDetail>, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                i32,
                String,
                i32,
                i32,
                i32,
                i32,
            ),
        >(
            r#"
            SELECT
                id, title, content_markdown, folder_path, sort_order,
                visibility, players_can_edit, created_at, updated_at, version
            FROM journal_entries
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(
            |(
                id,
                title,
                content_markdown,
                folder_path,
                sort_order,
                visibility,
                players_can_edit,
                created_at,
                updated_at,
                version,
            )| {
                JournalEntryDetail {
                    id,
                    title,
                    content_markdown,
                    folder_path,
                    visibility,
                    players_can_edit: players_can_edit != 0,
                    sort_order,
                    created_at,
                    updated_at,
                    version,
                }
            },
        ))
    }

    pub async fn list_journal_entries(&self) -> Result<Vec<JournalEntrySummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String, String, i32, i32)>(
            r#"
            SELECT id, title, folder_path, visibility, players_can_edit, sort_order
            FROM journal_entries
            ORDER BY folder_path, sort_order, title
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(id, title, folder_path, visibility, players_can_edit, sort_order)| {
                    JournalEntrySummary {
                        id,
                        title,
                        folder_path,
                        visibility,
                        players_can_edit: players_can_edit != 0,
                        sort_order,
                    }
                },
            )
            .collect())
    }

    pub async fn update_journal_entry(
        &self,
        id: &str,
        title: &str,
        content_markdown: &str,
        folder_path: &str,
        visibility: &str,
        players_can_edit: bool,
    ) -> Result<JournalEntryDetail, AppError> {
        let title = title.trim().to_string();

        if title.is_empty() {
            return Err(AppError::Validation(
                "Journal entry title is required".to_string(),
            ));
        }

        if !["gm_only", "players", "public"].contains(&visibility) {
            return Err(AppError::Validation(
                "Visibility must be gm_only, players or public".to_string(),
            ));
        }

        let folder_path = normalize_folder_path(folder_path);
        let editable = if players_can_edit { 1 } else { 0 };
        let now = now_unix();

        let result = sqlx::query(
            r#"
            UPDATE journal_entries
            SET
                title = ?,
                content_markdown = ?,
                folder_path = ?,
                visibility = ?,
                players_can_edit = ?,
                updated_at = ?,
                version = version + 1
            WHERE id = ?
            "#,
        )
        .bind(&title)
        .bind(content_markdown)
        .bind(&folder_path)
        .bind(visibility)
        .bind(editable)
        .bind(now)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.get_journal_entry(id).await?.ok_or(AppError::NotFound)
    }

    pub async fn delete_journal_entry(&self, id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM journal_entries WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    // ============================================
    // characters
    // ============================================

    pub async fn create_character(
        &self,
        name: &str,
        character_type: &str,
    ) -> Result<CharacterSummary, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation(
                "Character name is required".to_string(),
            ));
        }

        if character_type != "pc" && character_type != "npc" && character_type != "monster" {
            return Err(AppError::Validation(
                "Character type must be pc, npc or monster".to_string(),
            ));
        }

        let id = uuid::Uuid::new_v4().to_string();
        let now = now_unix();

        sqlx::query(
            r#"
            INSERT INTO characters (
                id, name, type, data_json, status,
                created_at, updated_at, version
            )
            VALUES (?, ?, ?, ?, 'active', ?, ?, 0)
            "#,
        )
        .bind(&id)
        .bind(&name)
        .bind(character_type)
        .bind("{}")
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(CharacterSummary {
            id,
            name,
            character_type: character_type.to_string(),
            status: "active".to_string(),
        })
    }

    pub async fn update_character(
        &self,
        id: &str,
        name: &str,
        character_type: &str,
        data_json: &str,
    ) -> Result<CharacterDetail, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation(
                "Character name is required".to_string(),
            ));
        }

        serde_json::from_str::<serde_json::Value>(data_json)
            .map_err(|_| AppError::Validation("data_json must be valid JSON".to_string()))?;

        let now = now_unix();

        let result = sqlx::query(
            r#"
            UPDATE characters
            SET name = ?, type = ?, data_json = ?, updated_at = ?, version = version + 1
            WHERE id = ?
            "#,
        )
        .bind(&name)
        .bind(character_type)
        .bind(data_json)
        .bind(now)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.get_character(id).await?.ok_or(AppError::NotFound)
    }

    pub async fn get_character(&self, id: &str) -> Result<Option<CharacterDetail>, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                String,
                Option<String>,
                i32,
                i32,
                i32,
            ),
        >(
            r#"
            SELECT
                id, name, type, data_json, status,
                portrait_asset_id, created_at, updated_at, version
            FROM characters
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(
            |(
                id,
                name,
                character_type,
                data_json,
                status,
                portrait_asset_id,
                created_at,
                updated_at,
                version,
            )| {
                CharacterDetail {
                    id,
                    name,
                    character_type,
                    data_json,
                    status,
                    portrait_asset_id,
                    created_at,
                    updated_at,
                    version,
                }
            },
        ))
    }

    pub async fn list_characters(&self) -> Result<Vec<CharacterSummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String, String)>(
            r#"
            SELECT id, name, type, status
            FROM characters
            ORDER BY name
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(|(id, name, character_type, status)| CharacterSummary {
                id,
                name,
                character_type,
                status,
            })
            .collect())
    }

    // ============================================
    // assets (helpers)
    // ============================================

    pub fn assets_dir(&self) -> PathBuf {
        let stem = self
            .path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        self.path
            .parent()
            .unwrap_or(Path::new("."))
            .join(format!("{}.assets", stem))
    }

    pub fn resolve_asset_path(&self, relative_path: &str) -> Result<PathBuf, AppError> {
        let mut rel = relative_path.trim().trim_start_matches('/');

        if let Some(stripped) = rel.strip_prefix("assets/") {
            rel = stripped;
        }

        if rel.is_empty() || rel.contains("..") {
            return Err(AppError::Validation("Invalid asset path".to_string()));
        }

        Ok(self.assets_dir().join(rel))
    }

    // ============================================
    // compendiums
    // ============================================

    pub async fn list_compendiums(&self) -> Result<Vec<CompendiumSummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, Option<String>, String, String)>(
            r#"
            SELECT id, name, source_plugin_id, type, version
            FROM compendiums
            ORDER BY name
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(id, name, source_plugin_id, r#type, version)| CompendiumSummary {
                    id,
                    name,
                    source_plugin_id,
                    r#type,
                    version,
                },
            )
            .collect())
    }

    pub async fn list_compendium_entries(
        &self,
        compendium_id: &str,
    ) -> Result<Vec<CompendiumEntrySummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String, String, String)>(
            r#"
            SELECT id, compendium_id, entry_key, name, data_json
            FROM compendium_entries
            WHERE compendium_id = ?
            ORDER BY name
            "#,
        )
        .bind(compendium_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(id, compendium_id, entry_key, name, data_json)| CompendiumEntrySummary {
                    id,
                    compendium_id,
                    entry_key,
                    name,
                    data_json,
                },
            )
            .collect())
    }

    pub async fn create_compendium(
        &self,
        name: &str,
        compendium_type: &str,
    ) -> Result<CompendiumSummary, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation(
                "Compendium name is required".to_string(),
            ));
        }

        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO compendiums (id, name, source_plugin_id, type, version)
            VALUES (?, ?, NULL, ?, '1.0.0')
            "#,
        )
        .bind(&id)
        .bind(&name)
        .bind(compendium_type)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(CompendiumSummary {
            id,
            name,
            source_plugin_id: None,
            r#type: compendium_type.to_string(),
            version: "1.0.0".to_string(),
        })
    }

    pub async fn create_compendium_entry(
        &self,
        compendium_id: &str,
        entry_key: &str,
        name: &str,
        data_json: &str,
    ) -> Result<CompendiumEntrySummary, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation("Entry name is required".to_string()));
        }

        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO compendium_entries (id, compendium_id, entry_key, name, data_json)
            VALUES (?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(compendium_id)
        .bind(entry_key)
        .bind(&name)
        .bind(data_json)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(CompendiumEntrySummary {
            id,
            compendium_id: compendium_id.to_string(),
            entry_key: entry_key.to_string(),
            name,
            data_json: data_json.to_string(),
        })
    }

    pub async fn update_compendium(
        &self,
        id: &str,
        name: &str,
        compendium_type: &str,
    ) -> Result<CompendiumSummary, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation(
                "Compendium name is required".to_string(),
            ));
        }

        let result = sqlx::query(
            r#"
            UPDATE compendiums
            SET name = ?, type = ?
            WHERE id = ?
            "#,
        )
        .bind(&name)
        .bind(compendium_type)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        // Возвращаем обновлённый компендий с его текущей версией
        let existing =
            sqlx::query_as::<_, (String,)>("SELECT version FROM compendiums WHERE id = ?")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(AppError::db)?
                .ok_or(AppError::NotFound)?;

        Ok(CompendiumSummary {
            id: id.to_string(),
            name,
            source_plugin_id: None,
            r#type: compendium_type.to_string(),
            version: existing.0,
        })
    }

    pub async fn delete_compendium(&self, id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM compendiums WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    pub async fn update_compendium_entry(
        &self,
        id: &str,
        name: &str,
        data_json: &str,
    ) -> Result<CompendiumEntrySummary, AppError> {
        let name = name.trim().to_string();

        if name.is_empty() {
            return Err(AppError::Validation("Entry name is required".to_string()));
        }

        serde_json::from_str::<serde_json::Value>(data_json)
            .map_err(|_| AppError::Validation("data_json must be valid JSON".to_string()))?;

        let existing = sqlx::query_as::<_, (String, String, String, String, String)>(
            r#"
            SELECT id, compendium_id, entry_key, name, data_json
            FROM compendium_entries
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?
        .ok_or(AppError::NotFound)?;

        sqlx::query(
            r#"
            UPDATE compendium_entries
            SET name = ?, data_json = ?
            WHERE id = ?
            "#,
        )
        .bind(&name)
        .bind(data_json)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(CompendiumEntrySummary {
            id: existing.0,
            compendium_id: existing.1,
            entry_key: existing.2,
            name,
            data_json: data_json.to_string(),
        })
    }

    pub async fn delete_compendium_entry(&self, id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM compendium_entries WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    // ============================================
    // plugins
    // ============================================

    pub async fn upsert_installed_plugin(
        &self,
        plugin_id: &str,
        version: &str,
        is_active: bool,
        manifest_json: &str,
    ) -> Result<(), AppError> {
        let active = if is_active { 1 } else { 0 };
        let now = now_unix();

        sqlx::query(
            r#"
            INSERT INTO installed_plugins (
                plugin_id, version, is_active, config_json, installed_at
            )
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(plugin_id) DO UPDATE SET
                version = excluded.version,
                is_active = excluded.is_active,
                config_json = excluded.config_json
            "#,
        )
        .bind(plugin_id)
        .bind(version)
        .bind(active)
        .bind(manifest_json)
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(())
    }

    pub async fn list_installed_plugins(&self) -> Result<Vec<InstalledPluginSummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, i32, String, i32, Option<String>)>(
            r#"
            SELECT plugin_id, version, is_active, config_json, installed_at, compat_warning
            FROM installed_plugins
            ORDER BY plugin_id
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(plugin_id, version, is_active, manifest_json, installed_at, compat_warning)| {
                    InstalledPluginSummary {
                        plugin_id,
                        version,
                        is_active: is_active != 0,
                        manifest_json,
                        installed_at,
                        compat_warning,
                    }
                },
            )
            .collect())
    }

    pub async fn get_installed_plugin(
        &self,
        plugin_id: &str,
    ) -> Result<Option<InstalledPluginSummary>, AppError> {
        let row = sqlx::query_as::<_, (String, String, i32, String, i32, Option<String>)>(
            r#"
            SELECT plugin_id, version, is_active, config_json, installed_at, compat_warning
            FROM installed_plugins
            WHERE plugin_id = ?
            "#,
        )
        .bind(plugin_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(
            |(plugin_id, version, is_active, manifest_json, installed_at, compat_warning)| {
                InstalledPluginSummary {
                    plugin_id,
                    version,
                    is_active: is_active != 0,
                    manifest_json,
                    installed_at,
                    compat_warning,
                }
            },
        ))
    }

    pub async fn set_plugin_active(
        &self,
        plugin_id: &str,
        is_active: bool,
    ) -> Result<InstalledPluginSummary, AppError> {
        let active = if is_active { 1 } else { 0 };

        let result = sqlx::query(
            r#"
            UPDATE installed_plugins
            SET is_active = ?
            WHERE plugin_id = ?
            "#,
        )
        .bind(active)
        .bind(plugin_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.get_installed_plugin(plugin_id)
            .await?
            .ok_or(AppError::NotFound)
    }

    pub async fn import_compendium_from_plugin(
        &self,
        plugin_id: &str,
        _compendium_key: &str,
        name: &str,
        compendium_type: &str,
        entries: &[dnd_core::PluginCompendiumEntry],
    ) -> Result<CompendiumSummary, AppError> {
        let id = uuid::Uuid::new_v4().to_string();

        // Удаляем старые компендии этого плагина
        sqlx::query(
            r#"
            DELETE FROM compendiums
            WHERE source_plugin_id = ?
            "#,
        )
        .bind(plugin_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        sqlx::query(
            r#"
            INSERT INTO compendiums (id, name, source_plugin_id, type, version)
            VALUES (?, ?, ?, ?, '1.0.0')
            "#,
        )
        .bind(&id)
        .bind(name)
        .bind(plugin_id)
        .bind(compendium_type)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        for entry in entries {
            let entry_id = uuid::Uuid::new_v4().to_string();
            let data_json = serde_json::to_string(&entry.data).unwrap_or_else(|_| "{}".to_string());

            sqlx::query(
                r#"
                INSERT INTO compendium_entries (id, compendium_id, entry_key, name, data_json)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(compendium_id, entry_key) DO UPDATE SET
                    name = excluded.name,
                    data_json = excluded.data_json
                "#,
            )
            .bind(&entry_id)
            .bind(&id)
            .bind(&entry.key)
            .bind(&entry.name)
            .bind(&data_json)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;
        }

        Ok(CompendiumSummary {
            id,
            name: name.to_string(),
            source_plugin_id: Some(plugin_id.to_string()),
            r#type: compendium_type.to_string(),
            version: "1.0.0".to_string(),
        })
    }

    pub async fn delete_compendiums_by_plugin(&self, plugin_id: &str) -> Result<u64, AppError> {
        let result = sqlx::query("DELETE FROM compendiums WHERE source_plugin_id = ?")
            .bind(plugin_id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        Ok(result.rows_affected())
    }

    pub async fn delete_installed_plugin(&self, plugin_id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM installed_plugins WHERE plugin_id = ?")
            .bind(plugin_id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    /// Проверяет, установлен ли плагин с указанным ID
    pub async fn is_plugin_installed(&self, plugin_id: &str) -> Result<bool, AppError> {
        let row = sqlx::query_scalar::<_, i32>(
            "SELECT COUNT(*) FROM installed_plugins WHERE plugin_id = ?",
        )
        .bind(plugin_id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row > 0)
    }

    /// Проверяет, активен ли плагин
    pub async fn is_plugin_active(&self, plugin_id: &str) -> Result<bool, AppError> {
        let row = sqlx::query_scalar::<_, i32>(
            "SELECT COUNT(*) FROM installed_plugins WHERE plugin_id = ? AND is_active = 1",
        )
        .bind(plugin_id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row > 0)
    }

    /// Возвращает список ID активных плагинов, которые зависят от указанного
    pub async fn get_dependent_plugins(&self, plugin_id: &str) -> Result<Vec<String>, AppError> {
        let plugins = self.list_installed_plugins().await?;

        let mut dependents = Vec::new();

        for plugin in plugins {
            if !plugin.is_active {
                continue;
            }

            let manifest: Result<dnd_core::PluginManifest, _> =
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

    /// Обновляет compat_warning для плагина
    pub async fn set_plugin_compat_warning(
        &self,
        plugin_id: &str,
        warning: Option<String>,
    ) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE installed_plugins SET compat_warning = ? WHERE plugin_id = ?")
                .bind(&warning)
                .bind(plugin_id)
                .execute(&self.pool)
                .await
                .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    // ============================================
    // journal_links
    // ============================================

    pub async fn list_journal_links(
        &self,
        entry_id: &str,
    ) -> Result<Vec<JournalLinkSummary>, AppError> {
        let rows = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                String,
                i32,
                f64,
                Option<String>,
                i32,
            ),
        >(
            r#"
            SELECT
                id,
                source_entry_id,
                target_type,
                target_id,
                link_type,
                is_directed,
                weight,
                label,
                is_visible_to_players
            FROM journal_links
            WHERE source_entry_id = ? OR target_id = ?
            ORDER BY link_type, label
            "#,
        )
        .bind(entry_id)
        .bind(entry_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(
                    id,
                    source_entry_id,
                    target_type,
                    target_id,
                    link_type,
                    is_directed,
                    weight,
                    label,
                    is_visible_to_players,
                )| {
                    JournalLinkSummary {
                        id,
                        source_entry_id,
                        target_type,
                        target_id,
                        link_type,
                        is_directed: is_directed != 0,
                        weight,
                        label,
                        is_visible_to_players: is_visible_to_players != 0,
                    }
                },
            )
            .collect())
    }

    pub async fn create_journal_link(
        &self,
        source_entry_id: &str,
        target_type: &str,
        target_id: &str,
        link_type: &str,
        is_directed: bool,
        label: Option<String>,
    ) -> Result<JournalLinkSummary, AppError> {
        let id = uuid::Uuid::new_v4().to_string();
        let directed = if is_directed { 1 } else { 0 };
        let now = now_unix();

        sqlx::query(
            r#"
            INSERT INTO journal_links (
                id, source_entry_id, target_type, target_id,
                link_type, is_directed, weight, label,
                metadata_json, is_visible_to_players,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 1.0, ?, NULL, 0, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(source_entry_id)
        .bind(target_type)
        .bind(target_id)
        .bind(link_type)
        .bind(directed)
        .bind(&label)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(JournalLinkSummary {
            id,
            source_entry_id: source_entry_id.to_string(),
            target_type: target_type.to_string(),
            target_id: target_id.to_string(),
            link_type: link_type.to_string(),
            is_directed,
            weight: 1.0,
            label,
            is_visible_to_players: false,
        })
    }

    pub async fn delete_journal_link(&self, id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM journal_links WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    pub async fn create_asset(
        &self,
        id: &str,
        asset_type: &str,
        filename: &str,
        content_hash: &str,
        mime_type: &str,
        size_bytes: i32,
        width: Option<i32>,
        height: Option<i32>,
        thumb_filename: Option<String>,
        created_at: i32,
    ) -> Result<dnd_core::AssetSummary, AppError> {
        sqlx::query(
            r#"
        INSERT INTO assets (
            id, type, filename, content_hash, mime_type,
            size_bytes, width, height, thumb_filename, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(type, content_hash) DO NOTHING
        "#,
        )
        .bind(id)
        .bind(asset_type)
        .bind(filename)
        .bind(content_hash)
        .bind(mime_type)
        .bind(size_bytes)
        .bind(width)
        .bind(height)
        .bind(&thumb_filename)
        .bind(created_at)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        // Возвращаем либо новый, либо существующий (по хэшу)
        self.get_asset_by_hash(asset_type, content_hash)
            .await?
            .ok_or(AppError::NotFound)
    }

    /// Синхронный метод для получения ассета по ID
    /// Рекомендуется использовать async версию `get_asset_async`
    pub fn get_asset(&self, id: &str) -> Result<Option<dnd_core::AssetSummary>, AppError> {
        // Используем tokio::task::block_in_place для выполнения async кода
        // Это безопасно, так как мы уже в async runtime
        let pool = self.pool.clone();
        let id = id.to_string();

        let handle = tokio::runtime::Handle::current();
        handle.block_on(async {
            let row = sqlx::query_as::<
                _,
                (
                    String,
                    String,
                    String,
                    String,
                    String,
                    i32,
                    Option<i32>,
                    Option<i32>,
                    Option<String>,
                    i32,
                ),
            >(
                r#"
            SELECT
                id, type, filename, content_hash, mime_type,
                size_bytes, width, height, thumb_filename, created_at
            FROM assets
            WHERE id = ?
            "#,
            )
            .bind(&id)
            .fetch_optional(&pool)
            .await
            .map_err(AppError::db)?;

            Ok(row.map(row_to_asset))
        })
    }

    pub async fn get_asset_by_hash(
        &self,
        asset_type: &str,
        content_hash: &str,
    ) -> Result<Option<dnd_core::AssetSummary>, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                String,
                i32,
                Option<i32>,
                Option<i32>,
                Option<String>,
                i32,
            ),
        >(
            r#"
        SELECT
            id, type, filename, content_hash, mime_type,
            size_bytes, width, height, thumb_filename, created_at
        FROM assets
        WHERE type = ? AND content_hash = ?
        "#,
        )
        .bind(asset_type)
        .bind(content_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(row_to_asset))
    }

    pub async fn get_asset_async(
        &self,
        id: &str,
    ) -> Result<Option<dnd_core::AssetSummary>, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                String,
                i32,
                Option<i32>,
                Option<i32>,
                Option<String>,
                i32,
            ),
        >(
            r#"
        SELECT
            id, type, filename, content_hash, mime_type,
            size_bytes, width, height, thumb_filename, created_at
        FROM assets
        WHERE id = ?
        "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(row_to_asset))
    }

    pub async fn list_assets(
        &self,
        asset_type: &str,
    ) -> Result<Vec<dnd_core::AssetSummary>, AppError> {
        let rows = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                String,
                i32,
                Option<i32>,
                Option<i32>,
                Option<String>,
                i32,
            ),
        >(
            r#"
        SELECT
            id, type, filename, content_hash, mime_type,
            size_bytes, width, height, thumb_filename, created_at
        FROM assets
        WHERE type = ?
        ORDER BY created_at DESC
        "#,
        )
        .bind(asset_type)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows.into_iter().map(row_to_asset).collect())
    }

    pub async fn delete_asset(&self, id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM assets WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        Ok(())
    }

    /// Выполняет WAL checkpoint — записывает все данные из WAL в основной файл.
    /// Обязательно вызывать перед копированием/экспортом файла БД.
    pub async fn checkpoint(&self) -> Result<(), AppError> {
        sqlx::query("PRAGMA wal_checkpoint(TRUNCATE)")
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        Ok(())
    }

    /// Создаёт полную копию БД в указанный файл через VACUUM INTO.
    /// Это безопасный способ получить snapshot БД в WAL режиме.
    pub async fn backup_to(&self, dest_path: &Path) -> Result<(), AppError> {
        // VACUUM INTO создаёт полную копию БД в один файл,
        // включая все данные из WAL
        let dest_str = dest_path.to_string_lossy().to_string();

        sqlx::query(&format!("VACUUM INTO '{}'", dest_str.replace('\'', "''")))
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        Ok(())
    }
}

// ============================================
// Вспомогательные функции
// ============================================

async fn connect(path: &Path, create_if_missing: bool) -> Result<SqlitePool, AppError> {
    let options = SqliteConnectOptions::new()
        .filename(path)
        .create_if_missing(create_if_missing)
        .foreign_keys(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal)
        .busy_timeout(Duration::from_secs(5));

    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .acquire_timeout(Duration::from_secs(10))
        .connect_with(options)
        .await
        .map_err(AppError::db)?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(AppError::db)?;

    Ok(pool)
}

fn normalize_folder_path(path: &str) -> String {
    let trimmed = path.trim();

    if trimmed.is_empty() || trimmed == "/" {
        return "/".to_string();
    }

    let mut result = trimmed.replace('\\', "/");

    if !result.starts_with('/') {
        result.insert(0, '/');
    }

    while result.len() > 1 && result.ends_with('/') {
        result.pop();
    }

    result
}

pub fn now_unix() -> i32 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i32
}

fn row_to_map(
    row: (
        String,
        String,
        String,
        Option<String>,
        Option<String>,
        i32,
        f64,
        f64,
        f64,
        i32,
        i32,
        i32,
        i32,
        i32,
        Option<Vec<u8>>,
    ),
) -> MapSummary {
    let (
        id,
        world_id,
        name,
        asset_id,
        image_path,
        grid_size,
        grid_offset_x,
        grid_offset_y,
        scale,
        width,
        height,
        sort_order,
        is_visible_to_players,
        version,
        fog_data,
    ) = row;

    MapSummary {
        id,
        world_id,
        name,
        asset_id,
        image_path,
        grid_size,
        grid_offset_x,
        grid_offset_y,
        scale,
        width,
        height,
        sort_order,
        is_visible_to_players: is_visible_to_players != 0,
        version,
        fog_data: fog_data.map(|_| "binary".to_string()),
    }
}

fn row_to_token(
    row: (
        String,
        String,
        Option<String>,
        Option<String>,
        f64,
        f64,
        f64,
        f64,
        i32,
        String,
        i32,
        Option<String>,
    ),
) -> TokenSummary {
    let (
        id,
        map_id,
        character_id,
        asset_id,
        x,
        y,
        rotation,
        scale,
        is_visible,
        layer,
        version,
        character_name,
    ) = row;

    TokenSummary {
        id,
        map_id,
        character_id,
        asset_id,
        x,
        y,
        rotation,
        scale,
        is_visible: is_visible != 0,
        layer,
        version,
        character_name,
    }
}

fn row_to_asset(
    row: (
        String,
        String,
        String,
        String,
        String,
        i32,
        Option<i32>,
        Option<i32>,
        Option<String>,
        i32,
    ),
) -> dnd_core::AssetSummary {
    let (
        id,
        asset_type,
        filename,
        content_hash,
        mime_type,
        size_bytes,
        width,
        height,
        thumb_filename,
        created_at,
    ) = row;

    dnd_core::AssetSummary {
        id,
        r#type: asset_type,
        filename,
        content_hash,
        mime_type,
        size_bytes,
        width,
        height,
        thumb_filename,
        created_at,
    }
}
// ============================================
// CampaignIndexStore
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct IndexFile {
    campaigns: Vec<CampaignSummary>,
}

#[derive(Debug, Clone)]
pub struct CampaignIndexStore {
    path: PathBuf,
}

impl CampaignIndexStore {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    pub fn load(&self) -> Result<Vec<CampaignSummary>, AppError> {
        if !self.path.exists() {
            return Ok(Vec::new());
        }

        let raw = std::fs::read_to_string(&self.path).map_err(AppError::io)?;

        if raw.trim().is_empty() {
            return Ok(Vec::new());
        }

        let index: IndexFile = serde_json::from_str(&raw).map_err(AppError::io)?;
        Ok(index.campaigns)
    }

    pub fn save(&self, campaigns: &[CampaignSummary]) -> Result<(), AppError> {
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent).map_err(AppError::io)?;
        }

        let index = IndexFile {
            campaigns: campaigns.to_vec(),
        };

        let raw = serde_json::to_string_pretty(&index).map_err(AppError::io)?;
        std::fs::write(&self.path, raw).map_err(AppError::io)?;

        Ok(())
    }

    pub fn find(&self, id: &str) -> Result<Option<CampaignSummary>, AppError> {
        Ok(self.load()?.into_iter().find(|item| item.id == id))
    }

    pub fn upsert(&self, summary: CampaignSummary) -> Result<Vec<CampaignSummary>, AppError> {
        let mut campaigns = self.load()?;

        if let Some(existing) = campaigns.iter_mut().find(|item| item.id == summary.id) {
            *existing = summary;
        } else {
            campaigns.push(summary);
        }

        campaigns.sort_by(|a, b| {
            b.last_opened_at
                .unwrap_or(0)
                .cmp(&a.last_opened_at.unwrap_or(0))
                .then(b.created_at.cmp(&a.created_at))
        });

        self.save(&campaigns)?;

        Ok(campaigns)
    }

    pub fn list(&self) -> Result<Vec<CampaignSummary>, AppError> {
        self.load()
    }

    /// Удаляет кампанию по ID
    pub fn remove(&self, id: &str) -> Result<(), AppError> {
        let mut campaigns = self.load()?;

        let initial_len = campaigns.len();
        campaigns.retain(|c| c.id != id);

        if campaigns.len() == initial_len {
            return Err(AppError::NotFound);
        }

        self.save(&campaigns)?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn create_open_and_read_meta() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("test.db");

        let db = CampaignDb::create(&path).await.unwrap();
        db.set_meta("id", "test-id").await.unwrap();
        db.set_meta("name", "Test Campaign").await.unwrap();

        let meta = db.meta().await.unwrap();
        assert_eq!(meta.get("name").unwrap(), "Test Campaign");

        drop(db);

        let reopened = CampaignDb::open(&path).await.unwrap();
        let meta = reopened.meta().await.unwrap();
        assert_eq!(meta.get("id").unwrap(), "test-id");
    }

    #[tokio::test]
    async fn create_default_world_and_map() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("maps-test.db");

        let db = CampaignDb::create(&path).await.unwrap();

        let world_id = db.default_world_id().await.unwrap();
        assert!(!world_id.is_empty());

        let map = db
            .create_map(&world_id, "Battle Map", 2000, 1500, 50)
            .await
            .unwrap();

        assert_eq!(map.name, "Battle Map");
        assert_eq!(map.width, 2000);
        assert_eq!(map.height, 1500);
        assert_eq!(map.grid_size, 50);

        let maps = db.list_maps().await.unwrap();
        assert_eq!(maps.len(), 1);
        assert_eq!(maps[0].name, "Battle Map");

        let fetched = db.get_map(&map.id).await.unwrap().unwrap();
        assert_eq!(fetched.id, map.id);
        assert_eq!(fetched.name, "Battle Map");
    }
}
```

---
## Файл: ./crates/dnd-dsl/src/lib.rs
```
```

---
## Файл: ./crates/dnd-net/src/lib.rs
```
```

---
## Файл: ./crates/dnd-relay/src/campaign_manager.rs
```
use dnd_db::CampaignDb;
use dnd_core::{JournalEntrySummary, MapSummary, TokenSummary};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::info;

/// Управляет загрузкой и доступом к кампаниям на сервере.
#[derive(Debug)]
pub struct CampaignManager {
    /// Пул соединений для каждой активной кампании: campaign_id -> CampaignDb
    campaigns: RwLock<HashMap<String, Arc<CampaignDb>>>,
    /// Базовая директория для хранения кампаний на сервере
    storage_dir: PathBuf,
}

impl CampaignManager {
    pub fn new(storage_dir: PathBuf) -> Self {
        std::fs::create_dir_all(&storage_dir).ok();
        Self {
            campaigns: RwLock::new(HashMap::new()),
            storage_dir,
        }
    }

    /// Загружает кампанию в память сервера (или подключается к ней)
    pub async fn load_campaign(&self, campaign_id: &str) -> Result<Arc<CampaignDb>, String> {
        let mut campaigns = self.campaigns.write().await;

        if let Some(db) = campaigns.get(campaign_id) {
            return Ok(db.clone());
        }

        // Путь совпадает с тем, куда распаковывает update_campaign_from_zip
        let campaign_dir = self.storage_dir.join(campaign_id);
        let db_path = campaign_dir.join("db.sqlite");

        if !db_path.exists() {
            return Err("Campaign not found on server".to_string());
        }

        let db = CampaignDb::open(&db_path)
            .await
            .map_err(|e| format!("Failed to open campaign DB: {}", e))?;

        let db_arc = Arc::new(db);
        campaigns.insert(campaign_id.to_string(), db_arc.clone());

        info!("Campaign {} loaded into server memory from {}", campaign_id, db_path.display());
        Ok(db_arc)
    }

    /// Возвращает ПОЛНЫЕ данные кампании (для GM)
    pub async fn get_gm_view(
        &self,
        campaign_id: &str,
    ) -> Result<FullCampaignView, String> {
        let db = self.load_campaign(campaign_id).await?;

        let maps = db.list_maps().await.map_err(|e| e.to_string())?;

        // Собираем токены для всех карт
        let mut all_tokens = Vec::new();
        for map in &maps {
            let tokens = db.list_tokens(&map.id).await.map_err(|e| e.to_string())?;
            all_tokens.extend(tokens);
        }

        let journal = db.list_journal_entries().await.map_err(|e| e.to_string())?;

        Ok(FullCampaignView {
            maps,
            tokens: all_tokens,
            journal,
        })
    }

    /// Возвращает отфильтрованные данные кампании для игрока
    pub async fn get_player_view(
        &self,
        campaign_id: &str,
    ) -> Result<PlayerCampaignView, String> {
        let db = self.load_campaign(campaign_id).await?;

        // 1. Только видимые карты
        let all_maps = db.list_maps().await.map_err(|e| e.to_string())?;
        let visible_maps: Vec<_> = all_maps
            .into_iter()
            .filter(|m| m.is_visible_to_players)
            .collect();

        let map_ids: Vec<_> = visible_maps.iter().map(|m| m.id.clone()).collect();

        // 2. Только видимые токены на видимых картах
        let mut visible_tokens = Vec::new();
        for map_id in &map_ids {
            let tokens = db.list_tokens(map_id).await.map_err(|e| e.to_string())?;
            visible_tokens.extend(tokens.into_iter().filter(|t| t.is_visible));
        }

        // 3. Только публичный журнал
        let all_journal = db.list_journal_entries().await.map_err(|e| e.to_string())?;
        let visible_journal: Vec<_> = all_journal
            .into_iter()
            .filter(|e| e.visibility == "players" || e.visibility == "public")
            .collect();

        Ok(PlayerCampaignView {
            maps: visible_maps,
            tokens: visible_tokens,
            journal: visible_journal,
        })
    }

    /// Обновляет кампанию из загруженного ZIP (для GM)
    pub async fn update_campaign_from_zip(
        &self,
        campaign_id: &str,
        zip_data: Vec<u8>,
    ) -> Result<(), String> {
        let campaign_dir = self.storage_dir.join(campaign_id);
        std::fs::create_dir_all(&campaign_dir).map_err(|e| e.to_string())?;

        let cursor = std::io::Cursor::new(zip_data);
        let mut archive = zip::ZipArchive::new(cursor).map_err(|e| e.to_string())?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let name = file.name().to_string();

            if name.contains("..") {
                continue;
            }

            if file.is_dir() {
                continue;
            }

            if name == "db.sqlite" {
                let mut bytes = Vec::new();
                std::io::Read::read_to_end(&mut file, &mut bytes)
                    .map_err(|e| e.to_string())?;
                let target_path = campaign_dir.join("db.sqlite");
                std::fs::write(&target_path, &bytes).map_err(|e| e.to_string())?;
            } else if let Some(relative) = name.strip_prefix("assets/") {
                let dest_path = campaign_dir.join("assets").join(relative);
                if let Some(parent) = dest_path.parent() {
                    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                let mut bytes = Vec::new();
                std::io::Read::read_to_end(&mut file, &mut bytes)
                    .map_err(|e| e.to_string())?;
                std::fs::write(&dest_path, &bytes).map_err(|e| e.to_string())?;
            }
        }

        info!("Campaign {} updated from GM upload", campaign_id);

        // Очищаем кэш, чтобы при следующем запросе открылась свежая БД
        let mut campaigns = self.campaigns.write().await;
        campaigns.remove(campaign_id);

        Ok(())
    }

    /// Возвращает путь к ассету по хэшу
    pub async fn get_asset_by_hash(
        &self,
        campaign_id: &str,
        content_hash: &str,
    ) -> Result<PathBuf, String> {
        let db = self.load_campaign(campaign_id).await?;

        // Ищем ассет в БД по хэшу
        let asset = db
            .get_asset_by_hash("map", content_hash)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Asset not found")?;

        let campaign_dir = self.storage_dir.join(campaign_id);
        let asset_path = campaign_dir
            .join("assets")
            .join(&asset.r#type)
            .join(format!("{}.webp", asset.id));

        if !asset_path.exists() {
            return Err("Asset file not found on disk".to_string());
        }

        Ok(asset_path)
    }
}

/// Полные данные кампании (для GM)
#[derive(serde::Serialize)]
pub struct FullCampaignView {
    pub maps: Vec<MapSummary>,
    pub tokens: Vec<TokenSummary>,
    pub journal: Vec<JournalEntrySummary>,
}

/// Отфильтрованные данные кампании (для Player)
#[derive(serde::Serialize)]
pub struct PlayerCampaignView {
    pub maps: Vec<MapSummary>,
    pub tokens: Vec<TokenSummary>,
    pub journal: Vec<JournalEntrySummary>,
}
```

---
## Файл: ./crates/dnd-relay/src/main.rs
```
mod campaign_manager;
mod protocol;
mod room;
mod state;
mod ws;

use axum::body::Bytes;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::Json;
use axum::routing::{get, post};
use axum::Router;
use protocol::{CreateRoomRequest, CreateRoomResponse, RoomInfo};
use room::Room;
use state::AppState;
use std::collections::HashMap;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

async fn create_room(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateRoomRequest>,
) -> Result<Json<CreateRoomResponse>, StatusCode> {
    let gm_token = uuid::Uuid::new_v4().to_string();
    let max_players = request.max_players.unwrap_or(state::MAX_PARTICIPANTS_PER_ROOM);

    let room = Room::new(
        request.room_name,
        request.gm_name,
        gm_token.clone(),
        request.access_code.clone(),
        max_players,
    );

    let room_id = state.create_room(room).await.map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;
    info!("Room created: {}", room_id);

    Ok(Json(CreateRoomResponse {
        room_id,
        gm_token,
        access_code: request.access_code,
    }))
}

async fn get_room_info(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
) -> Result<Json<RoomInfo>, StatusCode> {
    let room = state.get_room(&room_id).await.ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(room.public_info()))
}

/// Загрузка кампании от GM (ZIP)
async fn upload_campaign(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    body: Bytes,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if state.get_room(&room_id).await.is_none() {
        return Err(StatusCode::NOT_FOUND);
    }

    let campaign_id = room_id.clone(); // Используем room_id как campaign_id

    match state.campaign_manager.update_campaign_from_zip(&campaign_id, body.to_vec()).await {
        Ok(_) => {
            state.set_room_campaign(&room_id, campaign_id.clone()).await.ok();
            info!("Campaign uploaded for room {}", room_id);
            Ok(Json(serde_json::json!({ "success": true, "campaign_id": campaign_id })))
        }
        Err(e) => {
            tracing::error!("Failed to upload campaign: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}

/// Получение данных кампании с фильтрацией по роли
async fn get_campaign_entities(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    axum::extract::Query(params): axum::extract::Query<HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // 1. Проверяем наличие campaign_id у комнаты
    let campaign_id = match state.get_room_campaign_id(&room_id).await {
        Some(id) => id,
        None => {
            tracing::error!("Room {} has no campaign_id attached", room_id);
            return Err(StatusCode::NOT_FOUND);
        }
    };

    // 2. Проверяем существование комнаты и валидацию токена
    let token = params.get("token").cloned().unwrap_or_default();
    let room = match state.get_room(&room_id).await {
        Some(r) => r,
        None => {
            tracing::error!("Room {} not found in memory", room_id);
            return Err(StatusCode::NOT_FOUND);
        }
    };

    let is_gm = room.validate_gm_token(&token);
    tracing::info!("Fetching entities for room {}, is_gm: {}", room_id, is_gm);

    // 3. Получаем данные в зависимости от роли
    let json_value = if is_gm {
        match state.campaign_manager.get_gm_view(&campaign_id).await {
            Ok(v) => {
                serde_json::to_value(v).map_err(|e| {
                    tracing::error!("Failed to serialize GM view: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
            }
            Err(e) => {
                tracing::error!("Failed to get GM view for campaign {}: {}", campaign_id, e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    } else {
        match state.campaign_manager.get_player_view(&campaign_id).await {
            Ok(v) => {
                serde_json::to_value(v).map_err(|e| {
                    tracing::error!("Failed to serialize Player view: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
            }
            Err(e) => {
                tracing::error!("Failed to get Player view for campaign {}: {}", campaign_id, e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    };

    tracing::info!("Successfully serialized campaign view for room {}", room_id);
    Ok(Json(json_value))
}

/// Получение ассета по хэшу (ленивая загрузка)
async fn get_asset(
    State(state): State<Arc<AppState>>,
    Path((room_id, hash)): Path<(String, String)>,
) -> Result<Vec<u8>, StatusCode> {
    let campaign_id = state.get_room_campaign_id(&room_id).await.ok_or(StatusCode::NOT_FOUND)?;

    let asset_path = state.campaign_manager.get_asset_by_hash(&campaign_id, &hash).await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    std::fs::read(&asset_path).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let state = Arc::new(AppState::new());

    let cleanup_state = state.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
        loop {
            interval.tick().await;
            cleanup_state.cleanup_inactive_rooms().await;
        }
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/rooms", post(create_room))
        .route("/api/rooms/:room_id", get(get_room_info))
        .route("/api/rooms/:room_id/campaign", post(upload_campaign))
        .route("/api/rooms/:room_id/entities", get(get_campaign_entities))
        .route("/api/rooms/:room_id/assets/:hash", get(get_asset))
        .route("/ws/:room_id", get(ws::ws_handler))
        .layer(cors)
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3001));
    info!("Relay server starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

---
## Файл: ./crates/dnd-relay/src/protocol.rs
```
use serde::{Deserialize, Serialize};

/// Версия протокола
pub const PROTOCOL_VERSION: u32 = 1;

/// Envelope — обёртка для всех сообщений между клиентом и сервером
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope {
    /// Версия протокола
    pub v: u32,

    /// Уникальный ID сообщения
    pub id: String,

    /// Тип сообщения
    #[serde(rename = "type")]
    pub msg_type: MessageType,

    /// Timestamp (Unix ms)
    pub ts: i64,

    /// Sequence number (для упорядочивания)
    pub seq: u64,

    /// ID сессии/комнаты
    pub session_id: String,

    /// ID отправителя
    pub sender_id: String,

    /// Полезная нагрузка
    pub payload: serde_json::Value,
}

impl Envelope {
    pub fn new(
        msg_type: MessageType,
        session_id: String,
        sender_id: String,
        payload: serde_json::Value,
    ) -> Self {
        Self {
            v: PROTOCOL_VERSION,
            id: uuid::Uuid::new_v4().to_string(),
            msg_type,
            ts: chrono::Utc::now().timestamp_millis(),
            seq: 0, // Будет установлен при отправке
            session_id,
            sender_id,
            payload,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MessageType {
    // Подключение
    Join,
    Leave,
    Heartbeat,
    Error,

    // Роли и права
    RoleAssigned,
    Kick,
    RequestAction,     // Запрос действия у GM
    ActionApproved,    // GM одобрил действие
    ActionDenied,      // GM отклонил действие

    // Игровое состояние
    StateSync,
    StateUpdate,

    // Токены
    TokenMove,
    TokenCreate,
    TokenDelete,
    TokenOwnership,    // Назначение владельца токена

    // Чат
    ChatMessage,

    // Инициатива
    InitiativeUpdate,

    // Туман войны
    FogUpdate,

    // Броски
    DiceRoll,

    // Активы
    AssetRequest,
    AssetResponse,
}

/// Сообщение ошибки
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorMessage {
    pub code: String,
    pub message: String,
}

/// Сообщение при подключении
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JoinPayload {
    pub room_id: String,
    pub token: String,
    pub display_name: String,
}

/// Ответ на подключение
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JoinResponse {
    pub success: bool,
    pub user_id: String,
    pub role: String,
    pub room_id: String,
    pub error: Option<String>,
}

/// Heartbeat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeartbeatPayload {
    pub client_time: i64,
}

/// Перемещение токена
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenMovePayload {
    pub token_id: String,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
}

/// Сообщение чата
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessagePayload {
    pub channel: String,
    pub text: String,
    pub sender_name: String,
}

/// Обновление инициативы
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiativeUpdatePayload {
    pub entries: Vec<InitiativeEntry>,
    pub active_entry_id: Option<String>,
    pub round: i32,
    pub started: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiativeEntry {
    pub id: String,
    pub token_id: String,
    pub label: String,
    pub initiative: i32,
}

/// Обновление тумана войны
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FogUpdatePayload {
    pub map_id: String,
    pub fog_data: String, // base64 или JSON
}

/// Бросок костей
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiceRollPayload {
    pub notation: String,
    pub result: i32,
    pub rolls: Vec<i32>,
    pub modifier: i32,
    pub roller_name: String,
}

/// Создание комнаты
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRoomRequest {
    pub room_name: String,
    pub gm_name: String,
    pub max_players: Option<i32>,
    pub access_code: Option<String>,
}

/// Ответ на создание комнаты
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRoomResponse {
    pub room_id: String,
    pub gm_token: String,
    pub access_code: Option<String>,
}

/// Информация о комнате
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomInfo {
    pub room_id: String,
    pub room_name: String,
    pub gm_name: String,
    pub player_count: i32,
    pub max_players: i32,
    pub is_active: bool,
    pub created_at: i64,
}

/// Назначение роли пользователю
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleAssignedPayload {
    pub target_user_id: String,
    pub role: String,
    pub assigned_by: String,
}

/// Запрос действия от игрока к GM
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestActionPayload {
    pub action_type: String,
    pub payload: serde_json::Value,
    pub requester_name: String,
}

/// Ответ GM на запрос действия
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResponsePayload {
    pub request_id: String,
    pub approved: bool,
    pub original_action: serde_json::Value,
}

/// Назначение владельца токена
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenOwnershipPayload {
    pub token_id: String,
    pub owner_user_id: String,
    pub map_id: String,
}```

---
## Файл: ./crates/dnd-relay/src/room.rs
```
use crate::protocol::RoomInfo;
use std::collections::HashMap;

/// Участник комнаты
#[derive(Debug, Clone)]
pub struct Participant {
    pub user_id: String,
    pub display_name: String,
    pub role: ParticipantRole,
    pub connected_at: i64,
    pub last_heartbeat: i64,
}

/// Роли участников
#[derive(Debug, Clone, PartialEq)]
pub enum ParticipantRole {
    Gm,
    CoGm,
    Player,
    Spectator,
}

impl ParticipantRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            ParticipantRole::Gm => "gm",
            ParticipantRole::CoGm => "co_gm",
            ParticipantRole::Player => "player",
            ParticipantRole::Spectator => "spectator",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "gm" => ParticipantRole::Gm,
            "co_gm" => ParticipantRole::CoGm,
            "player" => ParticipantRole::Player,
            "spectator" => ParticipantRole::Spectator,
            _ => ParticipantRole::Spectator,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Room {
    pub room_id: String,
    pub room_name: String,
    pub gm_token: String,
    pub access_code: Option<String>,
    pub access_code_hash: Option<String>,
    pub max_players: i32,
    pub is_active: bool,
    pub created_at: i64,
    pub participants: HashMap<String, Participant>,
    /// Владельцы токенов: token_id -> user_id
    pub token_owners: HashMap<String, String>,
}

impl Room {
    pub fn new(
        room_name: String,
        gm_name: String,
        gm_token: String,
        access_code: Option<String>,
        max_players: i32,
    ) -> Self {
        let now = chrono::Utc::now().timestamp_millis();

        let access_code_hash = access_code.as_ref().map(|code| {
            use sha2::{Digest, Sha256};
            let mut hasher = Sha256::new();
            hasher.update(code.as_bytes());
            format!("{:x}", hasher.finalize())
        });

        // НЕ создаём автоматического GM-участника
        // Он будет создан при реальном подключении через WebSocket

        Self {
            room_id: uuid::Uuid::new_v4().to_string(),
            room_name,
            gm_token,
            access_code,
            access_code_hash,
            max_players,
            is_active: true,
            created_at: now,
            participants: HashMap::new(), // Пустой HashMap
            token_owners: HashMap::new(), // Пустой HashMap
        }
    }

    /// Проверяет токен GM
    pub fn validate_gm_token(&self, token: &str) -> bool {
        self.gm_token == token
    }

    /// Проверяет access code
    pub fn validate_access_code(&self, code: &str) -> bool {
        match &self.access_code_hash {
            Some(hash) => {
                use sha2::{Digest, Sha256};
                let mut hasher = Sha256::new();
                hasher.update(code.as_bytes());
                let code_hash = format!("{:x}", hasher.finalize());
                &code_hash == hash
            }
            None => true, // Нет кода — свободный вход
        }
    }

    /// Добавляет участника
    pub fn add_participant(&mut self, display_name: String, role: ParticipantRole) -> String {
        let user_id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp_millis();

        self.participants.insert(
            user_id.clone(),
            Participant {
                user_id: user_id.clone(),
                display_name,
                role,
                connected_at: now,
                last_heartbeat: now,
            },
        );

        user_id
    }

    /// Удаляет участника
    pub fn remove_participant(&mut self, user_id: &str) {
        self.participants.remove(user_id);

        // Если участников нет, деактивируем комнату
        if self.participants.is_empty() {
            self.is_active = false;
        }
    }

    /// Обновляет heartbeat
    pub fn update_heartbeat(&mut self, user_id: &str) {
        if let Some(participant) = self.participants.get_mut(user_id) {
            participant.last_heartbeat = chrono::Utc::now().timestamp_millis();
        }
    }

    /// Количество подключённых участников
    pub fn connected_count(&self) -> i32 {
        self.participants.len() as i32
    }

    /// Может ли участник подключиться
    pub fn can_join(&self) -> bool {
        self.is_active && self.connected_count() < self.max_players
    }

    /// Информация о комнате (публичная)
    pub fn public_info(&self) -> RoomInfo {
        RoomInfo {
            room_id: self.room_id.clone(),
            room_name: self.room_name.clone(),
            gm_name: self
                .participants
                .values()
                .find(|p| p.role == ParticipantRole::Gm)
                .map(|p| p.display_name.clone())
                .unwrap_or_default(),
            player_count: self.connected_count(),
            max_players: self.max_players,
            is_active: self.is_active,
            created_at: self.created_at,
        }
    }

    /// Получить роль участника
    pub fn get_role(&self, user_id: &str) -> Option<ParticipantRole> {
        self.participants.get(user_id).map(|p| p.role.clone())
    }

    /// Является ли пользователь GM или Co-GM
    pub fn is_gm(&self, user_id: &str) -> bool {
        matches!(
            self.get_role(user_id),
            Some(ParticipantRole::Gm) | Some(ParticipantRole::CoGm)
        )
    }

    /// Назначить владельца токена
    pub fn set_token_owner(&mut self, token_id: &str, user_id: &str) {
        self.token_owners
            .insert(token_id.to_string(), user_id.to_string());
    }

    /// Проверить, владеет ли пользователь токеном
    pub fn owns_token(&self, user_id: &str, token_id: &str) -> bool {
        self.token_owners
            .get(token_id)
            .map(|owner| owner == user_id)
            .unwrap_or(false)
    }

    /// Изменить роль участника
    pub fn change_role(&mut self, user_id: &str, new_role: ParticipantRole) -> bool {
        if let Some(participant) = self.participants.get_mut(user_id) {
            participant.role = new_role;
            true
        } else {
            false
        }
    }
}
```

---
## Файл: ./crates/dnd-relay/src/state.rs
```
use crate::campaign_manager::CampaignManager;
use crate::protocol::Envelope;
use crate::room::Room;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};

/// Лимиты
pub const MAX_ROOMS: usize = 100;
pub const MAX_PARTICIPANTS_PER_ROOM: i32 = 20;
pub const MAX_MESSAGE_SIZE_BYTES: usize = 64 * 1024;
pub const MAX_CAMPAIGN_FILE_SIZE_BYTES: usize = 100 * 1024 * 1024;
pub const HEARTBEAT_INTERVAL_SECS: u64 = 15;
pub const CONNECTION_TIMEOUT_SECS: u64 = 45;
pub const INACTIVE_ROOM_TTL_SECS: u64 = 3600;

const BROADCAST_CAPACITY: usize = 256;

/// Состояние комнаты
#[derive(Debug, Clone)]
pub struct RoomState {
    pub room: Room,
    pub tx: broadcast::Sender<Envelope>,
    /// ID кампании на сервере (используется для CampaignManager)
    pub campaign_id: Option<String>,
}

/// Глобальное состояние сервера
#[derive(Debug, Clone)]
pub struct AppState {
    pub rooms: Arc<RwLock<HashMap<String, RoomState>>>,
    pub started_at: i64,
    /// Менеджер кампаний — управление загрузкой и фильтрацией данных
    pub campaign_manager: Arc<CampaignManager>,
}

impl AppState {
    pub fn new() -> Self {
        let storage_dir = std::env::temp_dir().join("dnd_relay_campaigns");
        std::fs::create_dir_all(&storage_dir).ok();

        let campaign_manager = Arc::new(CampaignManager::new(storage_dir));

        Self {
            rooms: Arc::new(RwLock::new(HashMap::new())),
            started_at: chrono::Utc::now().timestamp_millis(),
            campaign_manager,
        }
    }

    pub async fn create_room(&self, room: Room) -> Result<String, String> {
        let mut rooms = self.rooms.write().await;

        if rooms.len() >= MAX_ROOMS {
            return Err("Server is full".to_string());
        }

        let room_id = room.room_id.clone();
        let (tx, _rx) = broadcast::channel(BROADCAST_CAPACITY);

        rooms.insert(
            room_id.clone(),
            RoomState {
                room,
                tx,
                campaign_id: None,
            },
        );

        Ok(room_id)
    }

    pub async fn get_room(&self, room_id: &str) -> Option<Room> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).map(|rs| rs.room.clone())
    }

    pub async fn subscribe_room(
        &self,
        room_id: &str,
    ) -> Option<broadcast::Receiver<Envelope>> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).map(|rs| rs.tx.subscribe())
    }

    pub async fn broadcast_to_room(
        &self,
        room_id: &str,
        envelope: Envelope,
    ) -> Result<usize, String> {
        let rooms = self.rooms.read().await;
        let room_state = rooms.get(room_id).ok_or("Room not found")?;
        room_state.tx.send(envelope).map_err(|e| e.to_string())
    }

    /// Назначает кампанию комнате
    pub async fn set_room_campaign(
        &self,
        room_id: &str,
        campaign_id: String,
    ) -> Result<(), String> {
        let mut rooms = self.rooms.write().await;
        let room_state = rooms.get_mut(room_id).ok_or("Room not found")?;
        room_state.campaign_id = Some(campaign_id);
        Ok(())
    }

    /// Возвращает ID кампании для комнаты
    pub async fn get_room_campaign_id(&self, room_id: &str) -> Option<String> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).and_then(|rs| rs.campaign_id.clone())
    }

    pub async fn remove_room(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        rooms.remove(room_id);
    }

    pub async fn cleanup_inactive_rooms(&self) {
        let now = chrono::Utc::now().timestamp_millis();
        let ttl_ms = (INACTIVE_ROOM_TTL_SECS as i64) * 1000;

        let mut rooms_to_remove = Vec::new();

        {
            let rooms = self.rooms.read().await;
            for (room_id, room_state) in rooms.iter() {
                let is_recently_active = room_state.room.participants.values().any(|p| {
                    now - p.last_heartbeat < ttl_ms
                });

                if !room_state.room.is_active || !is_recently_active {
                    rooms_to_remove.push(room_id.clone());
                }
            }
        }

        for room_id in rooms_to_remove {
            self.remove_room(&room_id).await;
        }
    }
}
```

---
## Файл: ./crates/dnd-relay/src/ws.rs
```
use crate::protocol::{Envelope, JoinPayload, JoinResponse, MessageType};
use crate::room::ParticipantRole;
use crate::state::AppState;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::select;
use tokio::sync::broadcast;
use tracing::{debug, error, info, warn};

/// WebSocket handler — инициирует upgrade
pub async fn ws_handler(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    info!("WebSocket upgrade request for room: {}", room_id);
    ws.on_upgrade(move |socket| handle_socket(socket, state, room_id))
}

/// Обработка WebSocket соединения после upgrade
async fn handle_socket(socket: WebSocket, state: Arc<AppState>, room_id: String) {
    info!("New WebSocket connection for room: {}", room_id);

    let (mut sender, mut receiver) = socket.split();

    // Ждём первое сообщение — Join
    let join_msg = match receiver.next().await {
        Some(Ok(Message::Text(text))) => {
            info!("Received join message: {}", &text[..text.len().min(200)]);
            text.to_string()
        }
        Some(Err(e)) => {
            error!("Error receiving join message: {}", e);
            return;
        }
        None => {
            warn!("Connection closed before join");
            return;
        }
        _ => {
            warn!("Received non-text message before join");
            return;
        }
    };

    // Парсим Join
    let envelope: Envelope = match serde_json::from_str(&join_msg) {
        Ok(e) => e,
        Err(e) => {
            error!("Failed to parse join message: {}", e);
            return;
        }
    };

    if envelope.msg_type != MessageType::Join {
        warn!("First message is not Join: {:?}", envelope.msg_type);
        return;
    }

    let join_payload: JoinPayload = match serde_json::from_value(envelope.payload) {
        Ok(p) => p,
        Err(e) => {
            error!("Failed to parse join payload: {}", e);
            return;
        }
    };

    info!(
        "Join request: room={}, display_name={}, token={}...",
        room_id,
        join_payload.display_name,
        &join_payload.token[..join_payload.token.len().min(8)]
    );

    // Проверяем комнату
    let room = match state.get_room(&room_id).await {
        Some(r) => r,
        None => {
            warn!("Room not found: {}", room_id);
            send_error(&mut sender, &room_id, "Room not found").await;
            return;
        }
    };

    // Проверяем токен или access code
    let role = if room.validate_gm_token(&join_payload.token) {
        info!("Token validated as GM");
        ParticipantRole::Gm
    } else if room.validate_access_code(&join_payload.token) {
        info!("Token validated as Player (access code)");
        ParticipantRole::Player
    } else {
        warn!("Invalid token or access code");
        send_error(&mut sender, &room_id, "Invalid token or access code").await;
        return;
    };

    // Добавляем участника
    let user_id = {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(&room_id) {
            if !room_state.room.can_join() {
                warn!("Room is full: {}", room_id);
                send_error(&mut sender, &room_id, "Room is full").await;
                return;
            }

            let uid = room_state
                .room
                .add_participant(join_payload.display_name.clone(), role.clone());

            info!(
                "Participant added: user_id={}, role={}, total_participants={}",
                uid,
                role.as_str(),
                room_state.room.connected_count()
            );

            uid
        } else {
            error!("Room disappeared: {}", room_id);
            send_error(&mut sender, &room_id, "Room disappeared").await;
            return;
        }
    };

    // Подписываемся на broadcast канал комнаты
    let mut broadcast_rx = match state.subscribe_room(&room_id).await {
        Some(rx) => rx,
        None => {
            error!("Failed to subscribe to room: {}", room_id);
            send_error(&mut sender, &room_id, "Failed to subscribe to room").await;
            return;
        }
    };

    // Отправляем успешный Join ответ
    let join_response = JoinResponse {
        success: true,
        user_id: user_id.clone(),
        role: role.as_str().to_string(),
        room_id: room_id.clone(),
        error: None,
    };

    let response_envelope = Envelope::new(
        MessageType::Join,
        room_id.clone(),
        "server".to_string(),
        serde_json::to_value(&join_response).unwrap(),
    );

    if let Err(e) = send_envelope(&mut sender, &response_envelope).await {
        error!("Failed to send join response: {}", e);
        return;
    }

    info!(
        "User '{}' (user_id={}) joined room '{}' as {}",
        join_payload.display_name,
        user_id,
        room_id,
        role.as_str()
    );

    // Уведомляем остальных о новом участнике
    let join_notification = Envelope::new(
        MessageType::Join,
        room_id.clone(),
        user_id.clone(),
        serde_json::json!({
            "user_id": user_id,
            "display_name": join_payload.display_name,
            "role": role.as_str(),
        }),
    );

    if let Err(e) = state.broadcast_to_room(&room_id, join_notification).await {
        warn!("Failed to broadcast join notification: {}", e);
    }

    // Основной цикл: select между входящими сообщениями и broadcast
    loop {
        select! {
            // Входящее сообщение от клиента
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        handle_incoming_message(&state, &room_id, &user_id, &text).await;
                    }
                    Some(Ok(Message::Close(reason))) => {
                        info!("User '{}' sent close frame: {:?}", user_id, reason);
                        break;
                    }
                    Some(Ok(Message::Ping(data))) => {
                        // WebSocket автоматически отвечает на ping
                        debug!("Received ping from user {}", user_id);
                    }
                    Some(Ok(Message::Pong(_))) => {
                        debug!("Received pong from user {}", user_id);
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error for user '{}': {}", user_id, e);
                        break;
                    }
                    None => {
                        info!("Stream ended for user '{}'", user_id);
                        break;
                    }
                    _ => {
                        debug!("Received other message type from user {}", user_id);
                    }
                }
            }

            // Broadcast сообщение от других участников
            result = broadcast_rx.recv() => {
                match result {
                    Ok(envelope) => {
                        // Не пересылаем собственные сообщения обратно
                        if envelope.sender_id != user_id {
                            debug!(
                                "Broadcasting {:?} from {} to user {}",
                                envelope.msg_type, envelope.sender_id, user_id
                            );

                            if let Err(e) = send_envelope(&mut sender, &envelope).await {
                                error!("Failed to send broadcast to user {}: {}", user_id, e);
                                break;
                            }
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(n)) => {
                        warn!("User '{}' lagged by {} messages", user_id, n);
                    }
                    Err(broadcast::error::RecvError::Closed) => {
                        info!("Broadcast channel closed for room '{}'", room_id);
                        break;
                    }
                }
            }
        }
    }

    // Удаляем участника при отключении
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(&room_id) {
            room_state.room.remove_participant(&user_id);
            info!(
                "User '{}' removed from room '{}', remaining participants: {}",
                user_id,
                room_id,
                room_state.room.connected_count()
            );
        }
    }

    // Уведомляем остальных об отключении
    let leave_notification = Envelope::new(
        MessageType::Leave,
        room_id.clone(),
        user_id.clone(),
        serde_json::json!({ "user_id": user_id }),
    );

    if let Err(e) = state.broadcast_to_room(&room_id, leave_notification).await {
        warn!("Failed to broadcast leave notification: {}", e);
    }

    info!(
        "User '{}' fully disconnected from room '{}'",
        user_id, room_id
    );
}
/// Обработка входящего сообщения от клиента
/// Обработка входящего сообщения с проверкой прав
async fn handle_incoming_message(state: &Arc<AppState>, room_id: &str, user_id: &str, text: &str) {
    if text.len() > crate::state::MAX_MESSAGE_SIZE_BYTES {
        warn!("Message too large from user {}", user_id);
        return;
    }

    let mut envelope: Envelope = match serde_json::from_str(text) {
        Ok(e) => e,
        Err(e) => {
            warn!("Failed to parse message from {}: {}", user_id, e);
            return;
        }
    };

    // Перезаписываем sender_id на сервере (не доверяем клиенту)
    envelope.sender_id = user_id.to_string();

    // Обновляем heartbeat
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            room_state.room.update_heartbeat(user_id);
        }
    }

    // Проверяем права перед broadcast
    let is_authorized = check_permission(state, room_id, user_id, &envelope).await;

    if !is_authorized {
        warn!(
            "User {} attempted unauthorized action: {:?}",
            user_id, envelope.msg_type
        );

        // Отправляем ошибку обратно пользователю
        // (нужен доступ к sender — здесь просто логируем)
        return;
    }

    match envelope.msg_type {
        MessageType::Heartbeat => {
            // Heartbeat обрабатывается локально
        }

        MessageType::TokenMove => {
            // Проверяем, что пользователь двигает свой токен (или он GM)
            handle_token_move(state, room_id, user_id, &mut envelope).await;
        }

        MessageType::TokenCreate | MessageType::TokenDelete => {
            // Только GM может создавать/удалять токены
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::FogUpdate => {
            // Только GM может менять туман войны
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::InitiativeUpdate => {
            // Только GM управляет инициативой
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::RoleAssigned => {
            // Только GM может назначать роли
            handle_role_assignment(state, room_id, user_id, &envelope).await;
        }

        MessageType::TokenOwnership => {
            // Только GM может назначать владельцев токенов
            handle_token_ownership(state, room_id, user_id, &envelope).await;
        }
        MessageType::StateUpdate | MessageType::StateSync => {
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::ChatMessage
        | MessageType::DiceRoll
        | MessageType::RequestAction
        | MessageType::ActionApproved
        | MessageType::ActionDenied => {
            // Доступно всем
            if let Err(e) = state.broadcast_to_room(room_id, envelope).await {
                warn!("Broadcast failed for room {}: {}", room_id, e);
            }
        }

        _ => {
            warn!("Unhandled message type: {:?}", envelope.msg_type);
        }
    }
}

/// Проверка прав на выполнение действия
/// Проверка прав на выполнение действия
async fn check_permission(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) -> bool {
    let rooms = state.rooms.read().await;
    let room_state = match rooms.get(room_id) {
        Some(rs) => rs,
        None => return false,
    };

    let room = &room_state.room;

    match envelope.msg_type {
        // GM-only действия
        MessageType::TokenCreate
        | MessageType::TokenDelete
        | MessageType::FogUpdate
        | MessageType::InitiativeUpdate
        | MessageType::RoleAssigned
        | MessageType::TokenOwnership
        | MessageType::Kick
        | MessageType::StateUpdate
        | MessageType::StateSync => room.is_gm(user_id),

        // Перемещение токена — проверка владельца
        MessageType::TokenMove => {
            if room.is_gm(user_id) {
                return true;
            }

            let payload: Result<crate::protocol::TokenMovePayload, _> =
                serde_json::from_value(envelope.payload.clone());

            match payload {
                Ok(p) => room.owns_token(user_id, &p.token_id),
                Err(_) => false,
            }
        }

        // Доступно всем
        MessageType::ChatMessage
        | MessageType::DiceRoll
        | MessageType::Heartbeat
        | MessageType::RequestAction
        | MessageType::Join
        | MessageType::Leave => true,

        // Ответы на запросы — только GM
        MessageType::ActionApproved | MessageType::ActionDenied => room.is_gm(user_id),

        _ => {
            warn!(
                "Unknown message type {:?} from user {} — denied by default",
                envelope.msg_type, user_id
            );
            false
        }
    }
}
/// Обработка перемещения токена
async fn handle_token_move(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &mut Envelope,
) {
    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast token_move failed: {}", e);
    }
}

/// Обработка GM-only действий
async fn handle_gm_only_action(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) {
    let rooms = state.rooms.read().await;
    if let Some(room_state) = rooms.get(room_id) {
        if !room_state.room.is_gm(user_id) {
            warn!(
                "Non-GM user {} attempted {:?} in room {}",
                user_id, envelope.msg_type, room_id
            );
            return;
        }
    }
    drop(rooms);

    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast {:?} failed: {}", envelope.msg_type, e);
    }
}

/// Обработка назначения ролей
async fn handle_role_assignment(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) {
    let payload: crate::protocol::RoleAssignedPayload =
        match serde_json::from_value(envelope.payload.clone()) {
            Ok(p) => p,
            Err(_) => return,
        };

    // Применяем изменение роли на сервере
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            if !room_state.room.is_gm(user_id) {
                return;
            }

            let new_role = crate::room::ParticipantRole::from_str(&payload.role);
            room_state
                .room
                .change_role(&payload.target_user_id, new_role);
        }
    }

    // Рассылаем уведомление
    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast role_assigned failed: {}", e);
    }
}

/// Обработка назначения владельца токена
async fn handle_token_ownership(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) {
    let payload: crate::protocol::TokenOwnershipPayload =
        match serde_json::from_value(envelope.payload.clone()) {
            Ok(p) => p,
            Err(_) => return,
        };

    // Сохраняем владельца на сервере
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            if !room_state.room.is_gm(user_id) {
                return;
            }

            room_state
                .room
                .set_token_owner(&payload.token_id, &payload.owner_user_id);
        }
    }

    // Рассылаем уведомление
    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast token_ownership failed: {}", e);
    }
}
/// Отправка Envelope через WebSocket
async fn send_envelope(
    sender: &mut futures_util::stream::SplitSink<WebSocket, Message>,
    envelope: &Envelope,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let json = serde_json::to_string(envelope)?;
    sender.send(Message::Text(json.into())).await?;
    Ok(())
}

/// Отправка ошибки через WebSocket
async fn send_error(
    sender: &mut futures_util::stream::SplitSink<WebSocket, Message>,
    room_id: &str,
    error_msg: &str,
) {
    let error_response = JoinResponse {
        success: false,
        user_id: String::new(),
        role: String::new(),
        room_id: room_id.to_string(),
        error: Some(error_msg.to_string()),
    };

    let envelope = Envelope::new(
        MessageType::Error,
        room_id.to_string(),
        "server".to_string(),
        serde_json::to_value(&error_response).unwrap(),
    );

    let _ = send_envelope(sender, &envelope).await;
}
```

---
## Файл: ./eslint.config.js
```
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    ignores: ['dist', 'node_modules', 'src-tauri/target'],
  },
];```

---
## Файл: ./index.html
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DndStudio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---
## Файл: ./package-lock.json
```
{
  "name": "dnd-studio",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "dnd-studio",
      "version": "0.1.0",
      "dependencies": {
        "@tanstack/react-query": "^5.62.0",
        "@tauri-apps/api": "^2",
        "@tauri-apps/plugin-dialog": "^2.7.2",
        "@tauri-apps/plugin-opener": "^2",
        "clsx": "^2.1.1",
        "dompurify": "^3.4.13",
        "lucide-react": "^1.31.0",
        "marked": "^18.0.9",
        "react": "^19.1.0",
        "react-dom": "^19.1.0",
        "react-resizable-panels": "2.1.7",
        "zustand": "^5.0.2"
      },
      "devDependencies": {
        "@eslint/js": "^9.17.0",
        "@tauri-apps/cli": "^2",
        "@types/dompurify": "^3.0.5",
        "@types/react": "^19.1.8",
        "@types/react-dom": "^19.1.6",
        "@vitejs/plugin-react": "^4.6.0",
        "eslint": "^9.17.0",
        "eslint-plugin-react-hooks": "^5.1.0",
        "jsdom": "^26.0.0",
        "prettier": "^3.4.2",
        "typescript": "~5.8.3",
        "typescript-eslint": "^8.18.0",
        "vite": "^7.0.4",
        "vitest": "^3.0.0"
      }
    },
    "node_modules/@asamuzakjp/css-color": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-3.2.0.tgz",
      "integrity": "sha512-K1A6z8tS3XsmCMM86xoWdn7Fkdn9m6RSVtocUrJYIwZnFVkng/PvkEoWtOWmP+Scc6saYWHWZYbndEEXxl24jw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@csstools/css-calc": "^2.1.3",
        "@csstools/css-color-parser": "^3.0.9",
        "@csstools/css-parser-algorithms": "^3.0.4",
        "@csstools/css-tokenizer": "^3.0.3",
        "lru-cache": "^10.4.3"
      }
    },
    "node_modules/@asamuzakjp/css-color/node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helpers": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz",
      "integrity": "sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.8",
        "@babel/types": "^7.29.8",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz",
      "integrity": "sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.8.tgz",
      "integrity": "sha512-E8lTAYNB1KW+FH+VGJuZM1ioAx2E6oVlvQFRrf5P8ZZmsiJXYAD9vTFV7yyEURNzgh1dFqMZuO6tUwcARbqFCA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.8"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.29.7.tgz",
      "integrity": "sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.29.7.tgz",
      "integrity": "sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz",
      "integrity": "sha512-I5z7H3bf/41ktsNVLtpN0wAa336HkqIHQ5BuPLEhTkt1jVSyZpeNKIzTgEWmlxjdg81R0IgUCcaE+Ok3NvrfZg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.8",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.8",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.8",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz",
      "integrity": "sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@csstools/color-helpers": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-5.1.0.tgz",
      "integrity": "sha512-S11EXWJyy0Mz5SYvRmY8nJYTFFd1LCNV+7cXyAgQtOOuzb4EsgfqDufL+9esx72/eLhsRdGZwaldu/h+E4t4BA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@csstools/css-calc": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-2.1.4.tgz",
      "integrity": "sha512-3N8oaj+0juUw/1H3YwmDDJXCgTB1gKU6Hc/bB502u9zR0q2vd786XJH9QfrKIEgFlZmhZiq6epXl4rHqhzsIgQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^3.0.5",
        "@csstools/css-tokenizer": "^3.0.4"
      }
    },
    "node_modules/@csstools/css-color-parser": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-3.1.0.tgz",
      "integrity": "sha512-nbtKwh3a6xNVIp/VRuXV64yTKnb1IjTAEEh3irzS+HkKjAOYLTGNb9pmVNntZ8iVBHcWDA2Dof0QtPgFI1BaTA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@csstools/color-helpers": "^5.1.0",
        "@csstools/css-calc": "^2.1.4"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^3.0.5",
        "@csstools/css-tokenizer": "^3.0.4"
      }
    },
    "node_modules/@csstools/css-parser-algorithms": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-3.0.5.tgz",
      "integrity": "sha512-DaDeUkXZKjdGhgYaHNJTV9pV7Y9B3b644jCLs9Upc3VeNGg6LWARAT6O+Q+/COo+2gg/bM5rhpMAtf70WqfBdQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@csstools/css-tokenizer": "^3.0.4"
      }
    },
    "node_modules/@csstools/css-tokenizer": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-3.0.4.tgz",
      "integrity": "sha512-Vd/9EVDiu6PPJt9yAh6roZP6El1xHrdvIVGjyBsHR0RYwNHgL7FJPyIIW4fANJNG6FtyZfvlRPpFI4ZM/lubvw==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.10.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.10.1.tgz",
      "integrity": "sha512-cuadcxVFE8sDK6iWJbs8Sn0av2Nrh2QSGQhVlBW9AaAHqHwjWsZHT8LJ4hFGPh7ASBV2deFdM7H/DPjulmh8rg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.2",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz",
      "integrity": "sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/config-array": {
      "version": "0.21.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.2.tgz",
      "integrity": "sha512-nJl2KGTlrf9GjLimgIru+V/mzgSK0ABCDQRvxw5BjURL7WfH5uoWmizbH7QB6MmnMBd8cIC9uceWnezL1VZWWw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/object-schema": "^2.1.7",
        "debug": "^4.3.1",
        "minimatch": "^3.1.5"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/config-helpers": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.4.2.tgz",
      "integrity": "sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/core": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/@eslint/core/-/core-0.17.0.tgz",
      "integrity": "sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@types/json-schema": "^7.0.15"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "3.3.6",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.6.tgz",
      "integrity": "sha512-l2Ul9PrHsPCKcEY/ac7VgFj9D80C7S68sOKc618SyHDPK36s1XcFebXY0iTzUVn4Yq+YbwvSnDmCz9yxjX+QrA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.14.0",
        "debug": "^4.3.2",
        "espree": "^10.0.1",
        "globals": "^14.0.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.3.0",
        "minimatch": "^3.1.5",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/js": {
      "version": "9.39.5",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-9.39.5.tgz",
      "integrity": "sha512-QywQuszQh77pIXCsq998c8hbhSTI/azTty1Z6N53dmAudKHhy573j3yvRLsX2BSp8YpLtoCEG8E9DJe+8zUh4A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      }
    },
    "node_modules/@eslint/object-schema": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.7.tgz",
      "integrity": "sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/plugin-kit": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.4.1.tgz",
      "integrity": "sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0",
        "levn": "^0.4.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@humanfs/core": {
      "version": "0.19.2",
      "resolved": "https://registry.npmjs.org/@humanfs/core/-/core-0.19.2.tgz",
      "integrity": "sha512-UhXNm+CFMWcbChXywFwkmhqjs3PRCmcSa/hfBgLIb7oQ5HNb1wS0icWsGtSAUNgefHeI+eBrA8I1fxmbHsGdvA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/types": "^0.15.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node": {
      "version": "0.16.8",
      "resolved": "https://registry.npmjs.org/@humanfs/node/-/node-0.16.8.tgz",
      "integrity": "sha512-gE1eQNZ3R++kTzFUpdGlpmy8kDZD/MLyHqDwqjkVQI0JMdI1D51sy1H958PNXYkM2rAac7e5/CnIKZrHtPh3BQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/core": "^0.19.2",
        "@humanfs/types": "^0.15.0",
        "@humanwhocodes/retry": "^0.4.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/types": {
      "version": "0.15.0",
      "resolved": "https://registry.npmjs.org/@humanfs/types/-/types-0.15.0.tgz",
      "integrity": "sha512-ZZ1w0aoQkwuUuC7Yf+7sdeaNfqQiiLcSRbfI08oAxqLtpXQr9AIVX7Ay7HLDuiLYAaFPu8oBYNq/QIi9URHJ3Q==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/retry": {
      "version": "0.4.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz",
      "integrity": "sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@napi-rs/lzma-linux-x64-gnu": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/@napi-rs/lzma-linux-x64-gnu/-/lzma-linux-x64-gnu-1.5.1.tgz",
      "integrity": "sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^22.20 || ^24.12 || >=25"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.4.tgz",
      "integrity": "sha512-RrPokAb7dmbxFoeO3TloqHyOjgye8RkBhSqmp4aJMIex4c9r46ZstPnleDQOq1t46VOVjwIuwNogIqbodV1Vvg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.4.tgz",
      "integrity": "sha512-JKuJc+pnpks2pjy7L/N3v/cAkZxYlnmuZoD840ldbMI5KDbC4iO9NKwPKYdjYFCMAIIlBzYSFHxIJVYzRo2/8A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.4.tgz",
      "integrity": "sha512-krw5uS2STmvJ02x0uTXHbqQNuz+9eZ1iw+qXk9dmW2gvV4jV7O2hEoOnuhFrpOPiel1mBFtqbxYZZtC46hXLOw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.4.tgz",
      "integrity": "sha512-wsTxtgApb4PrOsNJIm0FZ1h3WvCC+k9uxLJ4ad75hgoS4NiRes2SoJFlDAyMwiUY8IssDqGcHbXuN0sx1tfF1A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.4.tgz",
      "integrity": "sha512-GUOnQlyZe3yAXhWOtOMsn5Qkrv5E5mZXa0thbARWi5Ei2szlVXJFQhddZ4HbAzh8q92w5twp+CQvs/eFanz9YQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.4.tgz",
      "integrity": "sha512-/Y7f3QuxjzPKsjA/rfEDa3+0vXqyjmJ50Ln8dPpCmWkKTrUoWHG1cWhTqaAMLob2m2nESWuC7yGrREz019Ztqg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.4.tgz",
      "integrity": "sha512-81wiiX3v7aqy+T+bT61TJ78yJjRquqFFTTbAPt08imfQQzkPIW8t6aJbkTagtCCrXMNc9D66+geqlK7ydLPNqA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.4.tgz",
      "integrity": "sha512-9kmDIvNZqdoHOBZgNtpTBeLWYO/LVipM3H/j62P8848/l/VPEQL6N3uxU9pvP1oZAsXyC2MEnFP3ovRjo7WYNQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.4.tgz",
      "integrity": "sha512-CcnXHWnXg69g+DX5VWL3FHts3qMRN2uVEHX+BZvGLdd07/gXkn3ePjYtO1LDJvxkGKVHMclKBRa1QUTH+6toYQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.4.tgz",
      "integrity": "sha512-iFOibiHnTRuhrWLlRsOQFdZJJIa7S8OwkneJr4ocALP16u5yk6lWLINFwhHaEqBFMsKDUZofLkGos7+CPzGB3g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.4.tgz",
      "integrity": "sha512-XnWYMI7euHlb5a871xPja+Gm7DRCFU+FGRrtS2sMq9N8FvqtpagUy6gD4YOemC5MRk9xbh8+jYMEJbigFQwsgA==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.4.tgz",
      "integrity": "sha512-qGDAlO0U8xedCcsdRm9oaoQY8DAx/QT7uIxJWhCdx0ceIWX783UC9QSYkdpzAe29wNiVfp24+bZdQmn49o45SQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.4.tgz",
      "integrity": "sha512-ru4H6ezD7ysA5EiEK6qkkaEb4modH8CTej6kUy/gQi20u3kB3G7Zn8snXXkeJSCOFKG/rbPPtM/+9Wgas1961w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.4.tgz",
      "integrity": "sha512-2W4MO5WQVJnbJaZdvDb9rhBDuFU1nKIepPFpJUBsTh2k1YY2g+ODViaWuyOAjQ5cOP7NvrvLzt3wvHOoiAvc7w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.4.tgz",
      "integrity": "sha512-+fxjfuoAmVMCYV5QyjoIpu0cp5DOiOTeqYFk1AVaxGr+/ravWLX89XfQmptsoWcaVy/TGf2hexzbUOrCQIL1CQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.4.tgz",
      "integrity": "sha512-jTn8JfHGL4djjFxPuM06LmNUJDsst2jeVlsd9OmIH6zc5sC9K6rIuO4YajXatLUpBmBKl6b35ro1QZocLi+tcA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.4.tgz",
      "integrity": "sha512-oCJCJL4pXsoDcP2QZ+JVlPTIRc6266zsIaeJJsWImmF7HO0W8nb6HuSgZlMWxJwaPf8ehbSw8yo0EUw925hKsA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.4.tgz",
      "integrity": "sha512-W69hukhZ3KKNRCaMIEzKvcFye42hh0FE1+YoYaf5+Ikacuftoco6yO/xouz0hc5d5W/s3yBro5jRiuEE/Q5vUw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.4.tgz",
      "integrity": "sha512-qiXbGG2jkjXhzXpsFZSR2Xpb8DN/UaxYsbb/STbuR/6fpaDgRmmaq1B/LmtF2wQFOFOSsK2jdE0RZ3a0zHn4QA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openbsd-x64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.4.tgz",
      "integrity": "sha512-nWeM//hxv8mIo6jD7Hu4o48DVmV9pbV6gsKaWU+4NFyqHoPKwrkRiZGLKUhOBk8qNmDmpwFtPKg80Bo/Tn4xiQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.4.tgz",
      "integrity": "sha512-s62SQ/vgsRSvMwDkOEfTqfgASF0f26ZNaQuTA6Aok5lrikf89yI2W0gFHvZb2Jpgc6N8JnOKZgCK2iciO3CsxQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.4.tgz",
      "integrity": "sha512-J6wGf8TVGbXJq+HH+ttTvrcfNKPbuZecV6KT1B8I18BC5IURUh5kl4Yl5OEP5eFIUoI5BWxCsyYMhFsDx8kekw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.4.tgz",
      "integrity": "sha512-zmfrQd/0wu6oJs8Vq8KwY/YtsKSsLtKe/HwAP4Wqy8LhWjeT55fHRAkOhYQ12wI3ayS4Tt12d5CDRD7N96SAYQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.4.tgz",
      "integrity": "sha512-qPzHqdj9rfUD+w79dtE07zi/kFwKyCJqplp5K5ygeLTp7jLpAoc16OAH39HSmRC9UpozaecsleI8uAdEj6v2yw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.4.tgz",
      "integrity": "sha512-zD6NdeWEByGE9QF9vCrlJ5YQB4oq9q91kPZS37Jwj5hOkvR1lTBSpsKhKDw4IJtbQ35LsTS1HD9DZYGKIshU1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@tanstack/query-core": {
      "version": "5.101.4",
      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.101.4.tgz",
      "integrity": "sha512-gNwcvOJcRbLWPOLG/2OBm+zM+Yv+MKsXKEOWC57USuZDEsI71hEErQsiEGx5wX9rzWWkfwM0fVSPoiIFSsxfiw==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      }
    },
    "node_modules/@tanstack/react-query": {
      "version": "5.101.4",
      "resolved": "https://registry.npmjs.org/@tanstack/react-query/-/react-query-5.101.4.tgz",
      "integrity": "sha512-yRg2pfOCxIs4ZJW3XYYHU/WgtD04FHSnfHlpRT7h7pR77hwkdRG4wxbKe4aq6P0RvXUTBSQpQeadS1SUYUe+KA==",
      "license": "MIT",
      "dependencies": {
        "@tanstack/query-core": "5.101.4"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      },
      "peerDependencies": {
        "react": "^18 || ^19"
      }
    },
    "node_modules/@tauri-apps/api": {
      "version": "2.11.1",
      "resolved": "https://registry.npmjs.org/@tauri-apps/api/-/api-2.11.1.tgz",
      "integrity": "sha512-M2FPuYND2m+wh5hfW9ZpSdxMPdEJovPBWwoHJmwUpysTYNHaOkVFN419m/K0LIgjb/7KU2vBgsUepJWugQCvAA==",
      "license": "Apache-2.0 OR MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/tauri"
      }
    },
    "node_modules/@tauri-apps/cli": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli/-/cli-2.11.4.tgz",
      "integrity": "sha512-R8xGtMpwyetawSqm9kYOuMmEqkhUbvcUy8n0aNXIxollKBLESUu5f4Fx+64hgASYm1H+jSWq6jCW6zqTnH6hqQ==",
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "bin": {
        "tauri": "tauri.js"
      },
      "engines": {
        "node": ">= 10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/tauri"
      },
      "optionalDependencies": {
        "@tauri-apps/cli-darwin-arm64": "2.11.4",
        "@tauri-apps/cli-darwin-x64": "2.11.4",
        "@tauri-apps/cli-linux-arm-gnueabihf": "2.11.4",
        "@tauri-apps/cli-linux-arm64-gnu": "2.11.4",
        "@tauri-apps/cli-linux-arm64-musl": "2.11.4",
        "@tauri-apps/cli-linux-riscv64-gnu": "2.11.4",
        "@tauri-apps/cli-linux-x64-gnu": "2.11.4",
        "@tauri-apps/cli-linux-x64-musl": "2.11.4",
        "@tauri-apps/cli-win32-arm64-msvc": "2.11.4",
        "@tauri-apps/cli-win32-ia32-msvc": "2.11.4",
        "@tauri-apps/cli-win32-x64-msvc": "2.11.4"
      }
    },
    "node_modules/@tauri-apps/cli-darwin-arm64": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-darwin-arm64/-/cli-darwin-arm64-2.11.4.tgz",
      "integrity": "sha512-1ryOF3ZhpZ/nemHV5zVwBQBz9jDGKmKPvWPADOhc83ig0P4bMc2iER4NbC6r9sjeIZ6RVQ4g3RZIYvezhcl4TQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-darwin-x64": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-darwin-x64/-/cli-darwin-x64-2.11.4.tgz",
      "integrity": "sha512-uFsGQAAfuyz1k/yGLmkWfkBlgKAqZfxqlHmLWx81QU27RJWfmbNHCIq8T8w1e+VClleIuZUjpHWfoE4E3DLo3A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm-gnueabihf": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm-gnueabihf/-/cli-linux-arm-gnueabihf-2.11.4.tgz",
      "integrity": "sha512-IaHZn5CdBL21oUmjiVOS1ctw6Ip1O0pjp70FwOWmYz1myWe0SY96ZIj2FYf7pT0m8bI2h/hrs5ZbEXXh44/MkQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm64-gnu": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm64-gnu/-/cli-linux-arm64-gnu-2.11.4.tgz",
      "integrity": "sha512-N41/ukTRVe6XSuUTESuFdGeOW2i7k62tK+6gHK5Kd5/q5RPvvi19GaWAVPPb9u95HSGmTChSolBfzynUsssFaA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm64-musl": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm64-musl/-/cli-linux-arm64-musl-2.11.4.tgz",
      "integrity": "sha512-v277UnT/fB64xAfSroL5N3Km3tLmvATWqJJw/wRI+g6o+HkeD0slyE7gOhNs1MbjE41R7bQOTxMVoL3aomUJmw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-riscv64-gnu": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-riscv64-gnu/-/cli-linux-riscv64-gnu-2.11.4.tgz",
      "integrity": "sha512-qqgNkQ2u1yZHxjhxsZaxUtRDW8dIqIYm33rx/mzwQv0SfY9x1B+iraj8vWeFiXjjSVVhEMepXSOts1TqPzvXNQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-x64-gnu": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-x64-gnu/-/cli-linux-x64-gnu-2.11.4.tgz",
      "integrity": "sha512-2VRNWl84FOH0m2giiDkO2h0QXlcMJeX+zJDpI5kDIQAx6s+geF3v48F4DXfJez4GS/FdoDGnPnw1C2iYGbQ7bQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-x64-musl": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-x64-musl/-/cli-linux-x64-musl-2.11.4.tgz",
      "integrity": "sha512-o9GyhYor/nc7xarmwDE3ka2szuW3uuZzXjHWh64Q8YX5AtSgxdQkFWzrY4O8KiGtVNvFBI14H3Q49Qj5TOIP/A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-arm64-msvc": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-arm64-msvc/-/cli-win32-arm64-msvc-2.11.4.tgz",
      "integrity": "sha512-ld5Ehb598m0VkYyylRPNeCFsBe/km0jxis6KgMpl3IGY6I/i1RwQXO05I1AsXUXO2WC6AvB/Lw4qTf/asiuEiQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-ia32-msvc": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-ia32-msvc/-/cli-win32-ia32-msvc-2.11.4.tgz",
      "integrity": "sha512-12Hxi0XX/H5VFxO/bGgHkFWhml9VMgEOu9CidjeCeTNQ1l6fpUlbiGgSP7CLI3PFtW9/FfbeHieZ+kyWK5H7CA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-x64-msvc": {
      "version": "2.11.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-x64-msvc/-/cli-win32-x64-msvc-2.11.4.tgz",
      "integrity": "sha512-+vDiqBIU5dMISg/wNvX3sF+ZHfgJGJ5T0AcO+EHNXV9GGAG+P5fzodlDXD3QdKCRgZxMoCm5PPvj3BqLNjBthw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/plugin-dialog": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/@tauri-apps/plugin-dialog/-/plugin-dialog-2.7.2.tgz",
      "integrity": "sha512-pX0IGm1I3I6wc+zeKYcq1GSqogK6okCNX5fOdaNU5ab1AjGS6l1E5wFNjEb7meg7ZFSp0JUs+0jQGQNyOvLrsg==",
      "license": "MIT OR Apache-2.0",
      "dependencies": {
        "@tauri-apps/api": "^2.11.0"
      }
    },
    "node_modules/@tauri-apps/plugin-opener": {
      "version": "2.5.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/plugin-opener/-/plugin-opener-2.5.4.tgz",
      "integrity": "sha512-1HnPkb+AmgO29HBazm4uPLKB+r7zzcTBW1d0fyYp1uP+jwtpoiNDGKMMzz58SFp49nOIrxdE3aUJtT57lfO9CQ==",
      "license": "MIT OR Apache-2.0",
      "dependencies": {
        "@tauri-apps/api": "^2.11.0"
      }
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/chai": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/deep-eql": "*",
        "assertion-error": "^2.0.1"
      }
    },
    "node_modules/@types/deep-eql": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/dompurify": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/@types/dompurify/-/dompurify-3.0.5.tgz",
      "integrity": "sha512-1Wg0g3BtQF7sSb27fJQAKck1HECM6zV1EB66j8JH9i3LCjYabJa0FSdiSgsD5K/RbrsR0SiraKacLB+T8ZVYAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/trusted-types": "*"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "19.2.18",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz",
      "integrity": "sha512-AnzbBERsrLKtk2XSfTbYRLjQPdy116Sty4q+T+Bp3IC4l6jNBvreVPAHmpq9qhXQM7CXZPjLVmGMw9sy+hxQ3w==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.2.4",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.4.tgz",
      "integrity": "sha512-Bsc+QHgp+P/F02XDzNCY9jnZNCUuLki36KT7VKrTXXLdHf+vHMNZnW1rVu5DNW/rCK+fya3DATySbLM4yhtKUw==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.2.0"
      }
    },
    "node_modules/@types/trusted-types": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/@types/trusted-types/-/trusted-types-2.0.7.tgz",
      "integrity": "sha512-ScaPdn1dQczgbl0QFTeTOmVHFULt394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/@typescript-eslint/eslint-plugin": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-8.67.0.tgz",
      "integrity": "sha512-Un7Heoyj65NREbKAyIrFxeM143NZpExWmy1Nep4DLeQOeLlTeumPjoNKnBrU5D5moWXbPJgRa5Uwcdu0faVNGQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/regexpp": "^4.12.2",
        "@typescript-eslint/scope-manager": "8.67.0",
        "@typescript-eslint/type-utils": "8.67.0",
        "@typescript-eslint/utils": "8.67.0",
        "@typescript-eslint/visitor-keys": "8.67.0",
        "ignore": "^7.0.5",
        "natural-compare": "^1.4.0",
        "ts-api-utils": "^2.5.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "@typescript-eslint/parser": "^8.67.0",
        "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/eslint-plugin/node_modules/ignore": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-7.0.6.tgz",
      "integrity": "sha512-BAg6QkE8W+TuQLrrw0Ugr7HegXduRuuj8/ti2kSOc+jz1dmx8/WNcjr6XGnq5YpDWxFwwaavqD0+jIUOKelTsw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/@typescript-eslint/parser": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/parser/-/parser-8.67.0.tgz",
      "integrity": "sha512-fUBfTuuEulWqX6V8+O3PtScV01tzYYRUDTAirHFKoRAt7nOzoGiPt0M/bB47wWNy0coOOcgEwAMUtBpykMxl6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/scope-manager": "8.67.0",
        "@typescript-eslint/types": "8.67.0",
        "@typescript-eslint/typescript-estree": "8.67.0",
        "@typescript-eslint/visitor-keys": "8.67.0",
        "debug": "^4.4.3"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/project-service": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/project-service/-/project-service-8.67.0.tgz",
      "integrity": "sha512-cvE8c7ulYeXN9fYuszhCeCsbzyVEXuhrRCybnBre7TUmqb5nRmBfQAwCj0O3WJFDeyAZt4VYv51vMCC9LHSdYw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/tsconfig-utils": "^8.67.0",
        "@typescript-eslint/types": "^8.67.0",
        "debug": "^4.4.3"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/scope-manager": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.67.0.tgz",
      "integrity": "sha512-EgvsleTwS4E+WzzSvem8fAUubLwatMNF1B5hHSLQxcvs7q2dtRhGyujHwLJSYlG41niJ7GP24Aha2+0mb1b2kg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.67.0",
        "@typescript-eslint/visitor-keys": "8.67.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/tsconfig-utils": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/tsconfig-utils/-/tsconfig-utils-8.67.0.tgz",
      "integrity": "sha512-vV+LUSv5njUWsknE71fqKTlXUva+R76SaeORd6Zojcunk/6DvKFXONU3BrAs2H49mbygUXt6gbYunzwqNwlhdg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/type-utils": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-8.67.0.tgz",
      "integrity": "sha512-aVWDXbRmdXO9siTfX4ditQI1T9+zVcNazT48EJCD0v40/9RIFoUgZ05CmGEq9H2gixRpjUn/iplwvlcvutJW/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.67.0",
        "@typescript-eslint/typescript-estree": "8.67.0",
        "@typescript-eslint/utils": "8.67.0",
        "debug": "^4.4.3",
        "ts-api-utils": "^2.5.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/types": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/types/-/types-8.67.0.tgz",
      "integrity": "sha512-sBtgslww8nsMYUjhdPBiSyUqSzT8uR6g93A2QXnQC8+cGdjz0CyaOdqHDRJb1AtORbZCNUJBBeFA/tNR2uQmww==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-8.67.0.tgz",
      "integrity": "sha512-EKQBCE9yNlRJYm7jdTW5AhDacDUmSwQb0FAJAmK2EKYrNXIsa2vxcSZx6PvJ/dEdI6lS+Y9W+EXckLj0iPFGcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/project-service": "8.67.0",
        "@typescript-eslint/tsconfig-utils": "8.67.0",
        "@typescript-eslint/types": "8.67.0",
        "@typescript-eslint/visitor-keys": "8.67.0",
        "debug": "^4.4.3",
        "minimatch": "^10.2.2",
        "semver": "^7.7.3",
        "tinyglobby": "^0.2.15",
        "ts-api-utils": "^2.5.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/balanced-match": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz",
      "integrity": "sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "18 || 20 || >=22"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion": {
      "version": "5.0.9",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.9.tgz",
      "integrity": "sha512-ScQ4IuvIEF1TMlP7Zt+vjJ//9zlPb2SDcxWxM3bk8s6t6GGdJ7KO1dCcTidOPJKePW30LE/2cT7wCyPho9/Wxg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^4.0.2"
      },
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch": {
      "version": "10.2.6",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz",
      "integrity": "sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "brace-expansion": "^5.0.8"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@typescript-eslint/utils": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/utils/-/utils-8.67.0.tgz",
      "integrity": "sha512-U9D1FdwEWBwok3hxxSdhclMb0twvt9QnjIQ0VfQ1AiX2epnpSgv2ubVDsayOFyY8K6FX+AQ7E0FKWVG3iKsj1A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.9.1",
        "@typescript-eslint/scope-manager": "8.67.0",
        "@typescript-eslint/types": "8.67.0",
        "@typescript-eslint/typescript-estree": "8.67.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.67.0.tgz",
      "integrity": "sha512-fkv8dHRDqfGtTHuJeebdrQ7cX6Ad4WAS00rgHh9UGvMycF1mjBfsxry1XsLIFhWZ6Judlh6UdzK+TYlbpCXgnA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.67.0",
        "eslint-visitor-keys": "^5.0.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys/node_modules/eslint-visitor-keys": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-5.0.1.tgz",
      "integrity": "sha512-tD40eHxA35h0PEIZNeIjkHoDR4YjjJp34biM0mDvplBe//mB+IHCqHDGV7pxF+7MklTvighcCPPZC7ynWyjdTA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^20.19.0 || ^22.13.0 || >=24"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.28.0",
        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.17.0"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
      }
    },
    "node_modules/@vitest/expect": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-3.2.7.tgz",
      "integrity": "sha512-E8eBXaKibuvH2pSZErOjdVb5vF4PbKYcrnluBTYxEk1l/VhhwZg1kZQsdtjq+CsF5CFydf2Rdkz7jDHKSisi3w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/chai": "^5.2.2",
        "@vitest/spy": "3.2.7",
        "@vitest/utils": "3.2.7",
        "chai": "^5.2.0",
        "tinyrainbow": "^2.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/mocker": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-3.2.7.tgz",
      "integrity": "sha512-Trr0hYO9CM3Wj6ksWHRhK9IZpIY6wTMO5u/MqXurMxT57sWBaOPEtP3Oq60ihZuh5JsiagKfz95OcxdEP6dBrA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "3.2.7",
        "estree-walker": "^3.0.3",
        "magic-string": "^0.30.17"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "msw": "^2.4.9",
        "vite": "^5.0.0 || ^6.0.0 || ^7.0.0-0"
      },
      "peerDependenciesMeta": {
        "msw": {
          "optional": true
        },
        "vite": {
          "optional": true
        }
      }
    },
    "node_modules/@vitest/pretty-format": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-3.2.7.tgz",
      "integrity": "sha512-KUHlwqVu0sRlhCdyPdQ/wBoTfRahjUky1MubOmYw9fWfIZy1gNoHpuaaQBPAaMaVYdQYHJLurzj8ECCj5OwTqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyrainbow": "^2.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/runner": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-3.2.7.tgz",
      "integrity": "sha512-sB9y4ovltoQP+WaUPwmSxO9WIg9Ig694Di5PalVPsYHklAdE027mehpWF2SQSVq+k6sFgaivbTjTJwZLSHbedA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "3.2.7",
        "pathe": "^2.0.3",
        "strip-literal": "^3.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-3.2.7.tgz",
      "integrity": "sha512-7C+MwShwtBSI5Buwoyg3s/iY1eHL9PKAf+O1wVh/TdnjXUtkoL/9YQtre90i4MtNXM6edP1wJ2zOBpfCyhIS7g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "3.2.7",
        "magic-string": "^0.30.17",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-3.2.7.tgz",
      "integrity": "sha512-Q2eQGI6d2L/hBtZ0qNuKcAGid68XK6cv1xsoaIma6PaJhHPoqcEJhYpXZ/5myCMqkNgtP6UKuBhbc0nHKnrkuQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyspy": "^4.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-3.2.7.tgz",
      "integrity": "sha512-x6BDOd7dyo3PFLY3I9/HJ25X/6OurhGXk2/B9gOZNPF7XDVjeBK4k01lQE5uvDpbuheErh91qYuE1E2OEjK3Rw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "3.2.7",
        "loupe": "^3.1.4",
        "tinyrainbow": "^2.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/acorn": {
      "version": "8.18.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.18.0.tgz",
      "integrity": "sha512-lGq+9yr1/GuAWaVYIHRjvvySG5/4VfKIvC8EWxStPdcDh/Ka7FG3twP6v4d5BkravUilhIAsG4Qj83t02LWUPQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/ajv": {
      "version": "6.15.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz",
      "integrity": "sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/assertion-error": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.13",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.13.tgz",
      "integrity": "sha512-k9HNuUVMlqVjQ9UHzfPjIqiDbWw7WqT1AoT7GL8VwvF3r0ZfArtgiSPAlmupyNquNgOJHTuH4CKYf8ttMTWBTQ==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/brace-expansion": {
      "version": "1.1.18",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.18.tgz",
      "integrity": "sha512-Edep/X9fGqVNmzKBVsDYIOtD+z1tuezV70LBjdCst9Tqu76lsnvRiZ6oTic1n+/BIwX6QDGAO94PN4N2SADvtw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/browserslist": {
      "version": "4.28.8",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.8.tgz",
      "integrity": "sha512-V2NpofLblG64mfOtSgDhOJESZEGogzDMBv/q+W6oc4LXWP/q75eOXoOaaOu1EOadB9U4Bwx/e0yzbvwKH8zalA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.12",
        "caniuse-lite": "^1.0.30001809",
        "electron-to-chromium": "^1.5.402",
        "node-releases": "^2.0.53",
        "update-browserslist-db": "^1.3.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/cac": {
      "version": "6.7.14",
      "resolved": "https://registry.npmjs.org/cac/-/cac-6.7.14.tgz",
      "integrity": "sha512-b6Ilus+c3RrdDk+JhLKUAQfzzgLEPy6wcXqS7f/xe1EETvsDP6GORG7SFuOs6cID5YkqchW/LXZbX5bc8j7ZcQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001809",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001809.tgz",
      "integrity": "sha512-xxWVywk6a6Arlk+hymeycyn/VgqEfLDxupvhH/xiY5SJ/18kmi9o6MiO320DCUzypORHLtvh0I4i04tUhCNHNQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chai": {
      "version": "5.3.3",
      "resolved": "https://registry.npmjs.org/chai/-/chai-5.3.3.tgz",
      "integrity": "sha512-4zNhdJD/iOjSH0A05ea+Ke6MU5mmpQcbQsSOkgdaUMJ9zTlDTD/GYlwohmIE2u0gaxHYiVHEn1Fw9mZ/ktJWgw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "assertion-error": "^2.0.1",
        "check-error": "^2.1.1",
        "deep-eql": "^5.0.1",
        "loupe": "^3.1.0",
        "pathval": "^2.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/check-error": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/check-error/-/check-error-2.1.3.tgz",
      "integrity": "sha512-PAJdDJusoxnwm1VwW07VWwUN1sl7smmC3OKggvndJFadxxDRyFJBX/ggnu/KE4kQAB7a3Dp8f/YXC1FlUprWmA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 16"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/cssstyle": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/cssstyle/-/cssstyle-4.6.0.tgz",
      "integrity": "sha512-2z+rWdzbbSZv6/rhtvzvqeZQHrBaqgogqt85sqFNbabZOuFbCVFb8kPeEtZjiKkbrm395irpNKiYeFeLiQnFPg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/css-color": "^3.2.0",
        "rrweb-cssom": "^0.8.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/data-urls": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-5.0.0.tgz",
      "integrity": "sha512-ZYP5VBHshaDAiVZxjbRVcFJpc+4xGgT0bK3vzy1HLN8jTO975HEbuYzZJcHoQEY5K1a0z8YayJkyVETa08eNTg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-mimetype": "^4.0.0",
        "whatwg-url": "^14.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/decimal.js": {
      "version": "10.6.0",
      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/deep-eql": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/deep-eql/-/deep-eql-5.0.2.tgz",
      "integrity": "sha512-h5k/5U50IJJFpzfL6nO9jaaumfjO/f2NjK/oYB2Djzm4p9L+3T9qWpZqZ2hAbLPuuYq9wrU08WQyBTL5GbPk5Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/dompurify": {
      "version": "3.4.13",
      "resolved": "https://registry.npmjs.org/dompurify/-/dompurify-3.4.13.tgz",
      "integrity": "sha512-2vmYIoqjze2d+kakP8S/nS5shfsl587kzwEjcGlTdiksUVgFHnFCsLYDVj/JNqJVOQZGSYBTmuycv0PodwmnMQ==",
      "license": "(MPL-2.0 OR Apache-2.0)",
      "optionalDependencies": {
        "@types/trusted-types": "^2.0.7"
      }
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.405",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.405.tgz",
      "integrity": "sha512-bNglH7lPH5l+yHOes7Zr4VqxhOy4BQ9ZBUX4VdoFgxMpzJk7W1ZoO3Vgd9Pxa9PyjQ76sfm2aKH/nzEcCNRlew==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/entities": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/entities/-/entities-6.0.1.tgz",
      "integrity": "sha512-aN97NXWF6AWBTahfVOIrB/NShkzi5H7F9r1s9mD3cDj4Ko5f2qhhVoYMibXF7GlLveb/D2ioWay8lxI97Ven3g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.12"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.7.0.tgz",
      "integrity": "sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/esbuild": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "9.39.5",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-9.39.5.tgz",
      "integrity": "sha512-DgZS62aPLXKlnxILS/AYCoRvHaZeXceIzlXPkkGGzJWSow1aEk0lbTlxUSlyjC8jcaKxAdOnTDz+o1JFSBsyjw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.8.0",
        "@eslint-community/regexpp": "^4.12.1",
        "@eslint/config-array": "^0.21.2",
        "@eslint/config-helpers": "^0.4.2",
        "@eslint/core": "^0.17.0",
        "@eslint/eslintrc": "^3.3.6",
        "@eslint/js": "9.39.5",
        "@eslint/plugin-kit": "^0.4.1",
        "@humanfs/node": "^0.16.6",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@humanwhocodes/retry": "^0.4.2",
        "@types/estree": "^1.0.6",
        "ajv": "^6.14.0",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.6",
        "debug": "^4.3.2",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^8.4.0",
        "eslint-visitor-keys": "^4.2.1",
        "espree": "^10.4.0",
        "esquery": "^1.5.0",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^8.0.0",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.5",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      },
      "peerDependencies": {
        "jiti": "*"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-plugin-react-hooks": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-5.2.0.tgz",
      "integrity": "sha512-+f15FfK64YQwZdJNELETdn5ibXEUQmW1DZL6KXhNnc2heoy/sg9VJJeT7n8TlMWouzWqSWavFkIhHyIbIAEapg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "eslint": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0"
      }
    },
    "node_modules/eslint-scope": {
      "version": "8.4.0",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz",
      "integrity": "sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz",
      "integrity": "sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/espree": {
      "version": "10.4.0",
      "resolved": "https://registry.npmjs.org/espree/-/espree-10.4.0.tgz",
      "integrity": "sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.15.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz",
      "integrity": "sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estree-walker": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/expect-type": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.4.0.tgz",
      "integrity": "sha512-KfYbmpRm0VbLjEvVa9yGwCi9GI34xvi7A/HXYWQO65CSD2u3MczUJSuwXKFIxlGsgBQizV9q5J9NHj4VG0n+pA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/file-entry-cache": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz",
      "integrity": "sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^4.0.0"
      },
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz",
      "integrity": "sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.4"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/flatted": {
      "version": "3.4.4",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.4.4.tgz",
      "integrity": "sha512-5+ybhBZANEJxaH3X5evAFatUxLfEHSr7n6kYJ+1Qd0mUqr4eu9gIf6GDbWHf8RJijHrjjO8G+la14SlL2SeS1Q==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/globals": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-14.0.0.tgz",
      "integrity": "sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/html-encoding-sniffer": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-4.0.0.tgz",
      "integrity": "sha512-Y22oTqIU4uuPgEemfz7NDJz6OeKf12Lsu+QC+s3BVpda64lTiMYCyGwg5ki4vFxkMwQdeZDl2adZoqUgdFuTgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-encoding": "^3.1.1"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/http-proxy-agent": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/http-proxy-agent/-/http-proxy-agent-7.0.2.tgz",
      "integrity": "sha512-T1gkAiYYDWYx3V5Bmyu7HcfcvL7mUrTWiM6yOfa3PIphViJ/gFPbvidQ+veqSOHci/PxBcDabeUNCzpOODJZig==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.6.3.tgz",
      "integrity": "sha512-4fCk79wshMdzMp2rH06qWrJE4iolqLhCUH+OiuIgU++RB0+94NlDL81atO7GX55uUKueo0txHNtvEyI6D7WdMw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/js-yaml": {
      "version": "4.3.1",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.1.tgz",
      "integrity": "sha512-CY6crGq313MX8GkwvB7tzgp99vjQxY1++5y10/BKN/GUfHqWaOGQMNZkBvqSzsZKWk/ijwHlWzzkLulsGHhjWQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodeca"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/jsdom": {
      "version": "26.1.0",
      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-26.1.0.tgz",
      "integrity": "sha512-Cvc9WUhxSMEo4McES3P7oK3QaXldCfNWp7pl2NNeiIFlCoLr3kfq9kb1fxftiwk1FLV7CvpvDfonxtzUDeSOPg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cssstyle": "^4.2.1",
        "data-urls": "^5.0.0",
        "decimal.js": "^10.5.0",
        "html-encoding-sniffer": "^4.0.0",
        "http-proxy-agent": "^7.0.2",
        "https-proxy-agent": "^7.0.6",
        "is-potential-custom-element-name": "^1.0.1",
        "nwsapi": "^2.2.16",
        "parse5": "^7.2.1",
        "rrweb-cssom": "^0.8.0",
        "saxes": "^6.0.0",
        "symbol-tree": "^3.2.4",
        "tough-cookie": "^5.1.1",
        "w3c-xmlserializer": "^5.0.0",
        "webidl-conversions": "^7.0.0",
        "whatwg-encoding": "^3.1.1",
        "whatwg-mimetype": "^4.0.0",
        "whatwg-url": "^14.1.1",
        "ws": "^8.18.0",
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "canvas": "^3.0.0"
      },
      "peerDependenciesMeta": {
        "canvas": {
          "optional": true
        }
      }
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loupe": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/loupe/-/loupe-3.2.1.tgz",
      "integrity": "sha512-CdzqowRJCeLU72bHvWqwRBBlLcMEtIvGrlvef74kMnV2AolS9Y8xUv1I0U/MNAWMhBlKIoyuEgoJ0t/bbwHbLQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/lucide-react": {
      "version": "1.31.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.31.0.tgz",
      "integrity": "sha512-G8u2eEtoHUnUa9f8lbvqDhCiORMnYLdUEo06EEG9MQvHQrInKcX3Pa2TH39MM5qyzRcWETxB0+aOwAPI1g1kEg==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/marked": {
      "version": "18.0.9",
      "resolved": "https://registry.npmjs.org/marked/-/marked-18.0.9.tgz",
      "integrity": "sha512-/Sa4qiiHZxf0/FQdBBowr9q4r10krCwMvpK48FUBdXdUXScDxiQGR9zCPrFgRVR5LU3iySOiIjy09ZQvADir1w==",
      "license": "MIT",
      "bin": {
        "marked": "bin/marked.js"
      },
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.18",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/node-releases": {
      "version": "2.0.53",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.53.tgz",
      "integrity": "sha512-D9UOmYG3UH1V+ENW56t5QXBwJw1YEY18ruVeus89Rw+SyIgjPkCO84bRzO3uNIYosJbNwiabWVn48o3uJLjxFQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/nwsapi": {
      "version": "2.2.24",
      "resolved": "https://registry.npmjs.org/nwsapi/-/nwsapi-2.2.24.tgz",
      "integrity": "sha512-7YRhZ3jS45LwmSCT4b2sVFHt/WuovaktDU07QrtOBY2PXskss5a9jfmR9jptyumwXST+rFjrmppMY1KT/yn35A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/parse5": {
      "version": "7.3.0",
      "resolved": "https://registry.npmjs.org/parse5/-/parse5-7.3.0.tgz",
      "integrity": "sha512-IInvU7fabl34qmi9gY8XOVxhYyMyuH2xUNpb2q8/Y+7552KlejkRvqvD19nMoUW/uQGGbqNpA6Tufu5FL5BZgw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "entities": "^6.0.0"
      },
      "funding": {
        "url": "https://github.com/inikulin/parse5?sponsor=1"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/pathval": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/pathval/-/pathval-2.0.1.tgz",
      "integrity": "sha512-//nshmD55c46FuFw26xV/xFAaB5HF9Xdap7HJBBnrKdAd6/GxDBaNA1870O79+9ueg61cZLSVc+OaFlfmObYVQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14.16"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.5.tgz",
      "integrity": "sha512-RvwwcruNjI1ncT5xRakeyS9Lf8lcItv34KD+aif+VH9kduAyfYBipGh12274xtenIPZ119/R9BdTBa8gAwSh0A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.26",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.17",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/prettier": {
      "version": "3.9.6",
      "resolved": "https://registry.npmjs.org/prettier/-/prettier-3.9.6.tgz",
      "integrity": "sha512-OpN0zzVdiaiAhxpuuj5efpIS4sY9j7bY6uR5mnj5yPzGkdkjNKSJeUThPb60Jw29QuAZgA4o+/iB49kFiaBX6g==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "prettier": "bin/prettier.cjs"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/prettier/prettier?sponsor=1"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/react": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react/-/react-19.2.8.tgz",
      "integrity": "sha512-PWaYA1L/q9u2u7xYQi+Y3L3Yfnie7XyLeaJICV1MGD6LprsBxcAqGjYyr0eY3p+QdsA+x/Irkt4Qif8D63+Sbw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.2.8",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.8.tgz",
      "integrity": "sha512-rVprimfGBG3DR+Tq0IQG2DT5PxKth1WIGDmj5yPmlzr4YBe7uyE+Du4oVqTDXZSHGGGXRtTJEGSSePyQCMBglQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.27.0"
      },
      "peerDependencies": {
        "react": "^19.2.8"
      }
    },
    "node_modules/react-refresh": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-resizable-panels": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/react-resizable-panels/-/react-resizable-panels-2.1.7.tgz",
      "integrity": "sha512-JtT6gI+nURzhMYQYsx8DKkx6bSoOGFp7A3CwMrOb8y5jFHFyqwo9m68UhmXRw57fRVJksFn1TSlm3ywEQ9vMgA==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
        "react-dom": "^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/rollup": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.4.tgz",
      "integrity": "sha512-RXOqwaPsBGjMNMa4sQjDjHieHEZDFoj/Rdr46l2MU5DfEs16wHJPC2RPTPHWhNl+M3aI472LLqFkFKut4SblOg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.9"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",
        "@rollup/rollup-android-arm-eabi": "4.62.4",
        "@rollup/rollup-android-arm64": "4.62.4",
        "@rollup/rollup-darwin-arm64": "4.62.4",
        "@rollup/rollup-darwin-x64": "4.62.4",
        "@rollup/rollup-freebsd-arm64": "4.62.4",
        "@rollup/rollup-freebsd-x64": "4.62.4",
        "@rollup/rollup-linux-arm-gnueabihf": "4.62.4",
        "@rollup/rollup-linux-arm-musleabihf": "4.62.4",
        "@rollup/rollup-linux-arm64-gnu": "4.62.4",
        "@rollup/rollup-linux-arm64-musl": "4.62.4",
        "@rollup/rollup-linux-loong64-gnu": "4.62.4",
        "@rollup/rollup-linux-loong64-musl": "4.62.4",
        "@rollup/rollup-linux-ppc64-gnu": "4.62.4",
        "@rollup/rollup-linux-ppc64-musl": "4.62.4",
        "@rollup/rollup-linux-riscv64-gnu": "4.62.4",
        "@rollup/rollup-linux-riscv64-musl": "4.62.4",
        "@rollup/rollup-linux-s390x-gnu": "4.62.4",
        "@rollup/rollup-linux-x64-gnu": "4.62.4",
        "@rollup/rollup-linux-x64-musl": "4.62.4",
        "@rollup/rollup-openbsd-x64": "4.62.4",
        "@rollup/rollup-openharmony-arm64": "4.62.4",
        "@rollup/rollup-win32-arm64-msvc": "4.62.4",
        "@rollup/rollup-win32-ia32-msvc": "4.62.4",
        "@rollup/rollup-win32-x64-gnu": "4.62.4",
        "@rollup/rollup-win32-x64-msvc": "4.62.4",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/rrweb-cssom": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/rrweb-cssom/-/rrweb-cssom-0.8.0.tgz",
      "integrity": "sha512-guoltQEx+9aMf2gDZ0s62EcV8lsXR+0w8915TC3ITdn2YueuNjdAYh/levpU9nFaoChh9RUS5ZdQMrKfVEN9tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/saxes": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "xmlchars": "^2.2.0"
      },
      "engines": {
        "node": ">=v12.22.7"
      }
    },
    "node_modules/scheduler": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.27.0.tgz",
      "integrity": "sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/siginfo": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/stackback": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
      "integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/std-env": {
      "version": "3.10.0",
      "resolved": "https://registry.npmjs.org/std-env/-/std-env-3.10.0.tgz",
      "integrity": "sha512-5GS12FdOZNliM5mAOxFRg7Ir0pWz8MdpYm6AY6VPkGpbA7ZzmbzNcBJQ0GPvvyWgcY7QAhCgf9Uy89I03faLkg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/strip-literal": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/strip-literal/-/strip-literal-3.1.0.tgz",
      "integrity": "sha512-8r3mkIM/2+PpjHoOtiAW8Rg3jJLHaV7xPwG+YRGrv6FP0wwk/toTpATxWYOW0BKdWwl82VT2tFYi5DlROa0Mxg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^9.0.1"
      },
      "funding": {
        "url": "https://github.com/sponsors/antfu"
      }
    },
    "node_modules/strip-literal/node_modules/js-tokens": {
      "version": "9.0.1",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-9.0.1.tgz",
      "integrity": "sha512-mxa9E9ITFOt0ban3j6L5MpjwegGz6lBQmM1IJkWeBZGcMxto50+eWdjC/52xDbS2vy0k7vIMK0Fe2wfL9OQSpQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/symbol-tree": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinybench": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyexec": {
      "version": "0.3.2",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-0.3.2.tgz",
      "integrity": "sha512-KQQR9yN7R5+OSwaK0XQoj22pwHoTlgYqmUscPYoknOoWCWfj/5/ABTMRi69FrKU5ffPVh5QcFikpWJI/P1ocHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinypool": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/tinypool/-/tinypool-1.1.1.tgz",
      "integrity": "sha512-Zba82s87IFq9A9XmjiX5uZA/ARWDrB03OHlq+Vw1fSdt0I+4/Kutwy8BP4Y/y/aORMo61FQ0vIb5j44vSo5Pkg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      }
    },
    "node_modules/tinyrainbow": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-2.0.0.tgz",
      "integrity": "sha512-op4nsTR47R6p0vMUUoYl/a+ljLFVtlfaXkLQmqfLR1qHma1h/ysYk4hEXZ880bf2CYgTskvTa/e196Vd5dDQXw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tinyspy": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/tinyspy/-/tinyspy-4.0.4.tgz",
      "integrity": "sha512-azl+t0z7pw/z958Gy9svOTuzqIk6xq+NSheJzn5MMWtWTFywIacg2wUlzKFGtt3cthx0r2SxMK0yzJOR0IES7Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tldts": {
      "version": "6.1.86",
      "resolved": "https://registry.npmjs.org/tldts/-/tldts-6.1.86.tgz",
      "integrity": "sha512-WMi/OQ2axVTf/ykqCQgXiIct+mSQDFdH2fkwhPwgEwvJ1kSzZRiinb0zF2Xb8u4+OqPChmyI6MEu4EezNJz+FQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tldts-core": "^6.1.86"
      },
      "bin": {
        "tldts": "bin/cli.js"
      }
    },
    "node_modules/tldts-core": {
      "version": "6.1.86",
      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-6.1.86.tgz",
      "integrity": "sha512-Je6p7pkk+KMzMv2XXKmAE3McmolOQFdxkKw0R8EYNr7sELW46JqnNeTX8ybPiQgvg1ymCoF8LXs5fzFaZvJPTA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tough-cookie": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-5.1.2.tgz",
      "integrity": "sha512-FVDYdxtnj0G6Qm/DhNPSb8Ju59ULcup3tuJxkFb5K8Bv2pUXILbf0xZWU8PX8Ov19OXljbUyveOFwRMwkXzO+A==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "tldts": "^6.1.32"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/tr46": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-5.1.1.tgz",
      "integrity": "sha512-hdF5ZgjTqgAntKkklYw0R03MG2x/bSzTtkxmIRw/sTNV8YXsCJ1tfLAX23lhxhHJlEf3CRCOCGGWw3vI3GaSPw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.3.1"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/ts-api-utils": {
      "version": "2.5.0",
      "resolved": "https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-2.5.0.tgz",
      "integrity": "sha512-OJ/ibxhPlqrMM0UiNHJ/0CKQkoKF243/AEmplt3qpRgkW8VG7IfOS41h7V8TjITqdByHzrjcS/2si+y4lIh8NA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18.12"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4"
      }
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/typescript": {
      "version": "5.8.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.8.3.tgz",
      "integrity": "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/typescript-eslint": {
      "version": "8.67.0",
      "resolved": "https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.67.0.tgz",
      "integrity": "sha512-S2udFs8tCKEKffuJ4TB1idGUZiXdCPGi3IPBGWXarbLQ5UPXORV8QEVzJ4gCRduURMb5EkpNCdjbk0eDIuI8Yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/eslint-plugin": "8.67.0",
        "@typescript-eslint/parser": "8.67.0",
        "@typescript-eslint/typescript-estree": "8.67.0",
        "@typescript-eslint/utils": "8.67.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
        "typescript": ">=4.8.4 <6.1.0"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.1.tgz",
      "integrity": "sha512-ZZ61DsRsOnakl74HAmp3oSN4aXUmEWXf+i/yv0h7tIBfICc3VdrFErQKUUKPgu3AMsTUMbcongALEN4l6GSUrQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/vite": {
      "version": "7.3.6",
      "resolved": "https://registry.npmjs.org/vite/-/vite-7.3.6.tgz",
      "integrity": "sha512-4XP60spRGjSZFf1qYH+dJIkK2znL3zQfl9KkOV9MkkRR/3Dls0dxaBsQPTloEc5BLXWPL9vsOxopxyKoMmDueg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.27.0 || ^0.28.0",
        "fdir": "^6.5.0",
        "picomatch": "^4.0.3",
        "postcss": "^8.5.6",
        "rollup": "^4.43.0",
        "tinyglobby": "^0.2.15"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "lightningcss": "^1.21.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite-node": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/vite-node/-/vite-node-3.2.4.tgz",
      "integrity": "sha512-EbKSKh+bh1E1IFxeO0pg1n4dvoOTt0UDiXMd/qn++r98+jPO1xtJilvXldeuQ8giIB5IkpjCgMleHMNEsGH6pg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cac": "^6.7.14",
        "debug": "^4.4.1",
        "es-module-lexer": "^1.7.0",
        "pathe": "^2.0.3",
        "vite": "^5.0.0 || ^6.0.0 || ^7.0.0-0"
      },
      "bin": {
        "vite-node": "vite-node.mjs"
      },
      "engines": {
        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/vitest": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-3.2.7.tgz",
      "integrity": "sha512-KrxIJ62Fd89gfysR4WotlgZABiz2dqFPgqGzX7s+CwsqLFomRH7777ZcrOD6+WVAh7khPQP41A+BKbpcJFrdEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/chai": "^5.2.2",
        "@vitest/expect": "3.2.7",
        "@vitest/mocker": "3.2.7",
        "@vitest/pretty-format": "^3.2.7",
        "@vitest/runner": "3.2.7",
        "@vitest/snapshot": "3.2.7",
        "@vitest/spy": "3.2.7",
        "@vitest/utils": "3.2.7",
        "chai": "^5.2.0",
        "debug": "^4.4.1",
        "expect-type": "^1.2.1",
        "magic-string": "^0.30.17",
        "pathe": "^2.0.3",
        "picomatch": "^4.0.2",
        "std-env": "^3.9.0",
        "tinybench": "^2.9.0",
        "tinyexec": "^0.3.2",
        "tinyglobby": "^0.2.14",
        "tinypool": "^1.1.1",
        "tinyrainbow": "^2.0.0",
        "vite": "^5.0.0 || ^6.0.0 || ^7.0.0-0",
        "vite-node": "3.2.4",
        "why-is-node-running": "^2.3.0"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@types/debug": "^4.1.12",
        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
        "@vitest/browser": "3.2.7",
        "@vitest/ui": "3.2.7",
        "happy-dom": "*",
        "jsdom": "*"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@types/debug": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser": {
          "optional": true
        },
        "@vitest/ui": {
          "optional": true
        },
        "happy-dom": {
          "optional": true
        },
        "jsdom": {
          "optional": true
        }
      }
    },
    "node_modules/w3c-xmlserializer": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-7.0.0.tgz",
      "integrity": "sha512-VwddBukDzu71offAQR975unBIGqfKZpM+8ZX6ySk8nYhVoo5CYaZyzt3YBvYtRtO+aoGlqxPg/B87NGVZ/fu6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/whatwg-encoding": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/whatwg-encoding/-/whatwg-encoding-3.1.1.tgz",
      "integrity": "sha512-6qN4hJdMwfYBtE3YBTTHhoeuUrDBPZmbQaxWAqSALV/MeEnR5z1xd8UKud2RAkFoPkmB+hli1TZSnyi84xz1vQ==",
      "deprecated": "Use @exodus/bytes instead for a more spec-conformant and faster implementation",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "iconv-lite": "0.6.3"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/whatwg-mimetype": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-4.0.0.tgz",
      "integrity": "sha512-QaKxh0eNIi2mE9p2vEdzfagOKHCcj1pJ56EEHGQOVxp8r9/iszLUUV7v89x9O1p/T+NlTM5W7jW6+cz4Fq1YVg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/whatwg-url": {
      "version": "14.2.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-14.2.0.tgz",
      "integrity": "sha512-De72GdQZzNTUBBChsXueQUnPKDkg/5A5zp7pFDuQAj5UFoENpiACU0wlCvzpAGnTkj++ihpKwKyYewn/XNUbKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tr46": "^5.1.0",
        "webidl-conversions": "^7.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/why-is-node-running": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
      "integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "siginfo": "^2.0.0",
        "stackback": "0.0.2"
      },
      "bin": {
        "why-is-node-running": "cli.js"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/ws": {
      "version": "8.21.3",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.3.tgz",
      "integrity": "sha512-201TZ/kPWxoPr/OKWjquZR1SWKXcvxdH+e1xrx89b3YbmzLMFCLfnaG1HFIgWzJOEWZ7MvpK++odZufgYR50Rw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/xml-name-validator": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/xmlchars": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/zustand": {
      "version": "5.0.14",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-5.0.14.tgz",
      "integrity": "sha512-/8tAspM5LMPr28b3fwLYrtdj77ECpfZviaP75CMTnwO8ISyaE4GDIG/9rDDYq/cH9D2Xw2A2RXglLInmVBQB/g==",
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      },
      "peerDependencies": {
        "@types/react": ">=18.0.0",
        "immer": ">=9.0.6",
        "react": ">=18.0.0",
        "use-sync-external-store": ">=1.2.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "immer": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "use-sync-external-store": {
          "optional": true
        }
      }
    }
  }
}
```

---
## Файл: ./package.json
```
{
  "name": "dnd-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "lint": "eslint src",
    "format": "prettier --write src",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.62.0",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-dialog": "^2.7.2",
    "@tauri-apps/plugin-opener": "^2",
    "clsx": "^2.1.1",
    "dompurify": "^3.4.13",
    "lucide-react": "^1.31.0",
    "marked": "^18.0.9",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-resizable-panels": "2.1.7",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@tauri-apps/cli": "^2",
    "@types/dompurify": "^3.0.5",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "jsdom": "^26.0.0",
    "prettier": "^3.4.2",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.18.0",
    "vite": "^7.0.4",
    "vitest": "^3.0.0"
  }
}
```

---
## Файл: ./src-tauri/build.rs
```
fn main() {
    tauri_build::build()
}
```

---
## Файл: ./src-tauri/capabilities/default.json
```
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for DndStudio MVP foundation",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default"
  ]
}
```

---
## Файл: ./src-tauri/resources/builtin-plugins/srd-monsters/compendiums/monsters.json
```
{
  "entries": [
    {
      "key": "goblin",
      "name": "Goblin",
      "data": {
        "hp": 7,
        "ac": 15,
        "speed": 30,
        "cr": "1/4",
        "size": "Small",
        "type": "Humanoid",
        "alignment": "Neutral Evil",
        "str": 8,
        "dex": 14,
        "con": 10,
        "int": 10,
        "wis": 8,
        "cha": 8,
        "description": "A small, black-eyed, ill-featured humanoid prone to bullying the weak."
      }
    },
    {
      "key": "orc",
      "name": "Orc",
      "data": {
        "hp": 15,
        "ac": 13,
        "speed": 30,
        "cr": "1/2",
        "size": "Medium",
        "type": "Humanoid",
        "alignment": "Chaotic Evil",
        "str": 16,
        "dex": 12,
        "con": 16,
        "int": 7,
        "wis": 11,
        "cha": 10,
        "description": "A brutal raider who revels in close-quarters combat."
      }
    },
    {
      "key": "skeleton",
      "name": "Skeleton",
      "data": {
        "hp": 13,
        "ac": 13,
        "speed": 30,
        "cr": "1/4",
        "size": "Medium",
        "type": "Undead",
        "alignment": "Lawful Evil",
        "str": 10,
        "dex": 14,
        "con": 15,
        "int": 6,
        "wis": 8,
        "cha": 5,
        "description": "Animated bones held together by necromantic magic."
      }
    },
    {
      "key": "zombie",
      "name": "Zombie",
      "data": {
        "hp": 22,
        "ac": 8,
        "speed": 20,
        "cr": "1/4",
        "size": "Medium",
        "type": "Undead",
        "alignment": "Neutral Evil",
        "str": 13,
        "dex": 6,
        "con": 16,
        "int": 3,
        "wis": 6,
        "cha": 5,
        "description": "A rotting corpse animated by dark magic, driven only by hunger."
      }
    },
    {
      "key": "wolf",
      "name": "Wolf",
      "data": {
        "hp": 11,
        "ac": 13,
        "speed": 40,
        "cr": "1/4",
        "size": "Medium",
        "type": "Beast",
        "alignment": "Unaligned",
        "str": 12,
        "dex": 15,
        "con": 12,
        "int": 3,
        "wis": 12,
        "cha": 6,
        "description": "A wild canine that hunts in packs."
      }
    },
    {
      "key": "giant-spider",
      "name": "Giant Spider",
      "data": {
        "hp": 26,
        "ac": 14,
        "speed": 30,
        "cr": "1",
        "size": "Large",
        "type": "Beast",
        "alignment": "Unaligned",
        "str": 14,
        "dex": 16,
        "con": 12,
        "int": 2,
        "wis": 11,
        "cha": 4,
        "description": "A massive arachnid that spins webs to trap its prey."
      }
    },
    {
      "key": "bandit",
      "name": "Bandit",
      "data": {
        "hp": 11,
        "ac": 12,
        "speed": 30,
        "cr": "1/8",
        "size": "Medium",
        "type": "Humanoid",
        "alignment": "Any Non-Lawful",
        "str": 11,
        "dex": 12,
        "con": 12,
        "int": 10,
        "wis": 10,
        "cha": 10,
        "description": "A common criminal who robs travelers on the road."
      }
    },
    {
      "key": "commoner",
      "name": "Commoner",
      "data": {
        "hp": 4,
        "ac": 10,
        "speed": 30,
        "cr": "0",
        "size": "Medium",
        "type": "Humanoid",
        "alignment": "Any",
        "str": 10,
        "dex": 10,
        "con": 10,
        "int": 10,
        "wis": 10,
        "cha": 10,
        "description": "An ordinary person with no special training or abilities."
      }
    }
  ]
}```

---
## Файл: ./src-tauri/resources/builtin-plugins/srd-monsters/plugin.yaml
```
id: "srd-monsters"
name: "SRD Monsters"
version: "1.0.0"
author: "DndStudio"
dnd_studio_compat: ">=0.1.0"
description: "Базовый набор монстров из SRD (System Reference Document)"
dependencies: []
sheets: []
compendiums:
  - key: "srd-monsters"
    file: "compendiums/monsters.json"
    type: "monster"
    name: "SRD Monsters"
themes: []
link_types: []```

---
## Файл: ./src-tauri/src/commands/assets.rs
```
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

/// Возвращает директорию для хранения ассетов активной кампании.
/// Ассеты хранятся рядом с файлом кампании: {campaign_stem}.assets/
fn campaign_assets_dir(db: &dnd_db::CampaignDb) -> PathBuf {
    db.assets_dir()
}

/// Внутренняя функция импорта ассета
pub async fn import_asset_inner(
    db: &dnd_db::CampaignDb,
    source_path: &str,
    asset_type: &str,
) -> Result<AssetSummary, AppError> {
    let valid_types = ["map", "token", "portrait", "audio", "icon"];
    if !valid_types.contains(&asset_type) {
        return Err(AppError::Validation(format!(
            "Invalid asset type: {}",
            asset_type
        )));
    }

    let source = Path::new(source_path);

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

    // Дедупликация
    if let Some(existing) = db.get_asset_by_hash(asset_type, &content_hash).await? {
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

    let asset_id = uuid::Uuid::new_v4().to_string();
    let now = dnd_db::now_unix();

    // Создаём директорию ассетов кампании
    let assets_dir = campaign_assets_dir(db);
    let type_dir = assets_dir.join(asset_type);
    let thumbs_dir = type_dir.join("thumbs");

    fs::create_dir_all(&thumbs_dir).map_err(AppError::io)?;

    // Конвертируем в WebP
    let webp_path = type_dir.join(format!("{}.webp", asset_id));

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

    let mime_type = mime_from_extension(source);

    // Сохраняем в БД
    let asset = db
        .create_asset(
            &asset_id,
            asset_type,
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

/// Импорт ассета с полным пайплайном
#[tauri::command]
#[specta::specta]
pub async fn import_asset(
    state: State<'_, AppState>,
    source_path: String,
    asset_type: String,
) -> Result<AssetSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    import_asset_inner(&db, &source_path, &asset_type).await
}

/// Возвращает путь к файлу ассета
#[tauri::command]
#[specta::specta]
pub async fn get_asset_file_path(
    state: State<'_, AppState>,
    asset_id: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let assets_dir = campaign_assets_dir(&db);
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
    asset_id: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let assets_dir = campaign_assets_dir(&db);
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
/// Возвращает содержимое ассета как data URL (base64)
#[tauri::command]
#[specta::specta]
pub async fn get_asset_data_url(
    state: State<'_, AppState>,
    asset_id: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let assets_dir = campaign_assets_dir(&db);
    let file_path = assets_dir
        .join(&asset.r#type)
        .join(format!("{}.webp", asset_id));

    // Логирование для отладки
    eprintln!("[get_asset_data_url] asset_id: {}", asset_id);
    eprintln!("[get_asset_data_url] db.path(): {:?}", db.path());
    eprintln!("[get_asset_data_url] assets_dir: {:?}", assets_dir);
    eprintln!("[get_asset_data_url] file_path: {:?}", file_path);
    eprintln!("[get_asset_data_url] file exists: {}", file_path.exists());

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
pub async fn delete_asset(state: State<'_, AppState>, asset_id: String) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    let asset = db
        .get_asset_async(&asset_id)
        .await?
        .ok_or(AppError::NotFound)?;

    // Удаляем файлы
    let assets_dir = campaign_assets_dir(&db);
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

/// Читает произвольный файл (выбранный через диалог) и возвращает data URL.
/// Используется для превью изображения перед импортом.
#[tauri::command]
#[specta::specta]
pub async fn read_file_as_data_url(
    _state: State<'_, AppState>,
    file_path: String,
) -> Result<String, AppError> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(AppError::Validation("File not found".to_string()));
    }

    let bytes = std::fs::read(path).map_err(AppError::io)?;

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

/// Читает файл кампании из директории профиля и возвращает как data URL
#[tauri::command]
#[specta::specta]
pub async fn read_campaign_asset_data_url(
    state: State<'_, AppState>,
    relative_path: String,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;

    let file_path = db.resolve_asset_path(&relative_path)?;

    if !file_path.exists() {
        return Err(AppError::NotFound);
    }

    let bytes = fs::read(&file_path).map_err(AppError::io)?;

    let mime = match file_path
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
```

---
## Файл: ./src-tauri/src/commands/campaign.rs
```
use crate::state::{AppPaths, AppState};
use dnd_core::{ActiveCampaign, AppError, CampaignSummary, CampaignType, ServerConfig};
use dnd_db::{CampaignDb, CampaignIndexStore};
use std::fs;
use tauri::State;

/// Генерирует slug из имени кампании для использования в имени файла.
fn slugify(input: &str) -> String {
    let slug: String = input
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

    if slug.is_empty() {
        "campaign".to_string()
    } else {
        slug
    }
}

/// Формирует имя файла БД кампании: `{slug}-{short_id}.db`
fn campaign_file_name(name: &str, campaign_id: &str) -> String {
    let slug = slugify(name);
    let short_id = &campaign_id[..8.min(campaign_id.len())];

    format!("{}-{}.db", slug, short_id)
}

/// Создаёт новую кампанию в директории профиля.
#[tauri::command]
#[specta::specta]
pub async fn create_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    name: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    let name = name.trim().to_string();

    if name.is_empty() {
        return Err(AppError::Validation(
            "Campaign name is required".to_string(),
        ));
    }

    // Директория кампаний профиля
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    fs::create_dir_all(&campaigns_dir).map_err(AppError::io)?;

    // Генерируем ID и имя файла
    let campaign_id = uuid::Uuid::new_v4().to_string();
    let file_name = campaign_file_name(&name, &campaign_id);
    let db_path = campaigns_dir.join(&file_name);

    // Проверяем, что файл ещё не существует
    if db_path.exists() {
        return Err(AppError::Validation(format!(
            "Campaign file already exists: {}",
            file_name
        )));
    }

    // Создаём новую БД
    let db = CampaignDb::create(&db_path).await?;

    // Записываем метаданные кампании
    let now = dnd_db::now_unix();

    db.set_meta("id", &campaign_id).await?;
    db.set_meta("name", &name).await?;
    db.set_meta("created_at", &now.to_string()).await?;
    db.set_meta("profile_id", &profile_id).await?;

    // Создаём дефолтный мир для карт
    db.create_default_world().await?;

    // Закрываем БД (будет открыта через open_campaign)
    drop(db);

    // Формируем summary
    let summary = CampaignSummary {
        id: campaign_id.clone(),
        name: name.clone(),
        file_name: file_name.clone(),
        created_at: now,
        last_opened_at: Some(now),
        campaign_type: CampaignType::Local,
        server_config: None,
    };

    // Добавляем в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    index_store.upsert(summary.clone())?;

    // Автоматически открываем созданную кампанию
    let db = CampaignDb::open(&db_path).await?;

    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}

/// Возвращает список кампаний профиля.
#[tauri::command]
#[specta::specta]
pub async fn list_campaigns(
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<Vec<CampaignSummary>, AppError> {
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));

    let campaigns = index_store.list()?;

    Ok(campaigns)
}

/// Открывает кампанию по ID.
#[tauri::command]
#[specta::specta]
pub async fn open_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    campaign_id: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    // Ищем кампанию в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    let summary = campaigns
        .iter()
        .find(|c| c.id == campaign_id)
        .cloned()
        .ok_or(AppError::NotFound)?;

    // Формируем путь к файлу БД
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    let db_path = campaigns_dir.join(&summary.file_name);

    if !db_path.exists() {
        return Err(AppError::Validation(format!(
            "Campaign file not found: {}",
            summary.file_name
        )));
    }

    // Закрываем текущую кампанию если есть
    {
        let mut current = state.campaign.lock().await;
        *current = None;
    }

    // Открываем БД
    let db = CampaignDb::open(&db_path).await?;


    db.checkpoint().await?;
    // Устанавливаем как активную
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    // Обновляем last_opened_at
    let now = dnd_db::now_unix();
    let mut updated_summary = summary.clone();
    updated_summary.last_opened_at = Some(now);
    index_store.upsert(updated_summary.clone())?;

    Ok(updated_summary)
}

/// Закрывает активную кампанию.
#[tauri::command]
#[specta::specta]
pub async fn close_campaign(state: State<'_, AppState>) -> Result<(), AppError> {
    let mut current = state.campaign.lock().await;
    *current = None;

    Ok(())
}

/// Возвращает активную кампанию.
#[tauri::command]
#[specta::specta]
pub async fn get_active_campaign(
    state: State<'_, AppState>,
) -> Result<Option<ActiveCampaign>, AppError> {
    let current = state.campaign.lock().await;

    let db = match current.as_ref() {
        Some(db) => db,
        None => return Ok(None),
    };

    let meta = db.meta().await?;
    let path = db.path().to_string_lossy().to_string();

    let id = meta.get("id").cloned().unwrap_or_default();
    let name = meta.get("name").cloned().unwrap_or_default();

    Ok(Some(ActiveCampaign {
        id,
        name,
        path,
        meta,
    }))
}

/// Удаляет кампанию.
#[tauri::command]
#[specta::specta]
pub async fn delete_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    campaign_id: String,
    profile_id: String,
) -> Result<(), AppError> {
    // Ищем кампанию в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    let summary = campaigns
        .iter()
        .find(|c| c.id == campaign_id)
        .cloned()
        .ok_or(AppError::NotFound)?;

    // Закрываем кампанию если она активна
    {
        let mut current = state.campaign.lock().await;

        if let Some(db) = current.as_ref() {
            let meta = db.meta().await?;

            if meta.get("id").map(|id| id == &campaign_id).unwrap_or(false) {
                *current = None;
            }
        }
    }

    // Удаляем файл БД
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    let db_path = campaigns_dir.join(&summary.file_name);

    if db_path.exists() {
        fs::remove_file(&db_path).map_err(AppError::io)?;
    }

    // Удаляем папку с ассетами если есть
    let stem = db_path.file_stem().unwrap_or_default().to_string_lossy().to_string();
    let assets_dir = campaigns_dir.join(format!("{}.assets", stem));

    if assets_dir.exists() && assets_dir.is_dir() {
        fs::remove_dir_all(&assets_dir).map_err(AppError::io)?;
    }

    // Удаляем из index
    index_store.remove(&campaign_id)?;

    Ok(())
}

/// Переименовывает кампанию.
#[tauri::command]
#[specta::specta]
pub async fn rename_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    campaign_id: String,
    new_name: String,
    profile_id: String,
) -> Result<CampaignSummary, AppError> {
    let new_name = new_name.trim().to_string();

    if new_name.is_empty() {
        return Err(AppError::Validation(
            "Campaign name is required".to_string(),
        ));
    }

    // Ищем кампанию в index
    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    let campaigns = index_store.list()?;

    let summary = campaigns
        .iter()
        .find(|c| c.id == campaign_id)
        .cloned()
        .ok_or(AppError::NotFound)?;

    // Обновляем имя в БД если кампания активна
    {
        let current = state.campaign.lock().await;

        if let Some(db) = current.as_ref() {
            let meta = db.meta().await?;

            if meta.get("id").map(|id| id == &campaign_id).unwrap_or(false) {
                db.set_meta("name", &new_name).await?;
            }
        }
    }

    // Обновляем в index
    let mut updated_summary = summary.clone();
    updated_summary.name = new_name;

    index_store.upsert(updated_summary.clone())?;

    Ok(updated_summary)
}

/// Возвращает путь к директории ассетов активной кампании.
#[tauri::command]
#[specta::specta]
pub async fn get_campaign_assets_dir(
    state: State<'_, AppState>,
) -> Result<String, AppError> {
    let current = state.campaign.lock().await;

    let db = current.as_ref().ok_or(AppError::NoCampaign)?;

    let assets_dir = db.assets_dir();

    // Создаём директорию если не существует
    if !assets_dir.exists() {
        fs::create_dir_all(&assets_dir).map_err(AppError::io)?;
    }

    Ok(assets_dir.to_string_lossy().to_string())
}

/// Создание серверной кампании ГМ-ом (создаёт локально + загружает на сервер)
#[tauri::command]
#[specta::specta]
pub async fn create_server_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    name: String,
    profile_id: String,
    server_url: String,
    room_name: String,
    access_code: Option<String>,
) -> Result<CampaignSummary, AppError> {
    use dnd_db::CampaignIndexStore;
    use std::fs;

    // 1. Создаём обычную локальную кампанию
    let name = name.trim().to_string();
    if name.is_empty() {
        return Err(AppError::Validation("Campaign name is required".to_string()));
    }

    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    fs::create_dir_all(&campaigns_dir).map_err(AppError::io)?;

    let campaign_id = uuid::Uuid::new_v4().to_string();
    let file_name = campaign_file_name(&name, &campaign_id);
    let db_path = campaigns_dir.join(&file_name);

    if db_path.exists() {
        return Err(AppError::Validation(format!(
            "Campaign file already exists: {}",
            file_name
        )));
    }

    let db = CampaignDb::create(&db_path).await?;
    let now = dnd_db::now_unix();

    db.set_meta("id", &campaign_id).await?;
    db.set_meta("name", &name).await?;
    db.set_meta("created_at", &now.to_string()).await?;
    db.set_meta("profile_id", &profile_id).await?;
    db.create_default_world().await?;
    drop(db);

    let summary = CampaignSummary {
        id: campaign_id.clone(),
        name: name.clone(),
        file_name: file_name.clone(),
        created_at: now,
        last_opened_at: Some(now),
        campaign_type: CampaignType::Local,
        server_config: None,
    };

    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    index_store.upsert(summary.clone())?;

    // Открываем созданную кампанию и помещаем в state (нужно для экспорта)
    let db = CampaignDb::open(&db_path).await?;
    let db_path_str = db_path.to_string_lossy().to_string();
    println!("[create_server_campaign] Opening DB: {}", db_path_str);
    
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
        println!("[create_server_campaign] DB stored in state");
    }

    // 2. Экспортируем её в ZIP
    println!("[create_server_campaign] Exporting to ZIP...");
    let temp_zip_path = crate::commands::campaign_io::export_campaign_zip_to_temp_internal(&state).await?;
    println!("[create_server_campaign] ZIP created at: {}", temp_zip_path);
    let zip_data = fs::read(&temp_zip_path).map_err(AppError::io)?;
    println!("[create_server_campaign] ZIP size: {} bytes", zip_data.len());
    let _ = fs::remove_file(&temp_zip_path);
    println!("[create_server_campaign] Temporary ZIP deleted");

    // 3. Создаём комнату на Relay Server
    let http_url = server_url.trim_start_matches("ws://").trim_start_matches("wss://");
    let create_room_url = format!("http://{}/api/rooms", http_url);

    let client = reqwest::Client::new();
    let response = client.post(&create_room_url)
        .json(&serde_json::json!({
            "room_name": room_name,
            "gm_name": "GM",
            "max_players": 10,
            "access_code": access_code
        }))
        .send()
        .await
        .map_err(|e| AppError::Validation(format!("Failed to create room: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(AppError::Validation(format!("Failed to create room: {} {}", status, text)));
    }

    let room_data: serde_json::Value = response.json().await.map_err(|_| {
        AppError::Validation("Invalid server response".to_string())
    })?;
    let room_id = room_data["room_id"].as_str().unwrap_or("").to_string();
    let gm_token = room_data["gm_token"].as_str().unwrap_or("").to_string();

    if room_id.is_empty() || gm_token.is_empty() {
        return Err(AppError::Validation("Invalid server response: missing room_id or gm_token".to_string()));
    }

    // 4. Загружаем ZIP кампании на сервер
    let upload_url = format!("http://{}/api/rooms/{}/campaign", http_url, room_id);
    let upload_response = client.post(&upload_url)
        .body(zip_data)
        .header("Content-Type", "application/octet-stream")
        .send()
        .await
        .map_err(|e| AppError::Validation(format!("Failed to upload campaign: {}", e)))?;

    if !upload_response.status().is_success() {
        let status = upload_response.status();
        let text = upload_response.text().await.unwrap_or_default();
        return Err(AppError::Validation(format!("Failed to upload campaign: {} {}", status, text)));
    }

    // 5. Обновляем метаданные кампании (открываем заново, т.к. db была перемещена в state)
    let mut db = CampaignDb::open(&db_path).await?;
    let server_config = ServerConfig {
        server_url: server_url.clone(),
        room_id: room_id.clone(),
        token: gm_token.clone(),
        display_name: "GM".to_string(),
        role: "gm".to_string(),
    };

    db.set_meta("campaign_type", "server").await?;
    db.set_meta("server_config", &serde_json::to_string(&server_config).unwrap()).await?;
    drop(db);

    // Обновляем в индексе
    let mut updated_summary = summary.clone();
    updated_summary.campaign_type = CampaignType::Server;
    updated_summary.server_config = Some(server_config.clone());
    index_store.upsert(updated_summary.clone())?;

    Ok(updated_summary)
}

/// Присоединение игрока к серверной кампании
#[tauri::command]
#[specta::specta]
pub async fn join_server_campaign(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    profile_id: String,
    server_url: String,
    room_id: String,
    token: String,
    display_name: String,
) -> Result<CampaignSummary, AppError> {
    use dnd_db::CampaignIndexStore;
    use std::fs;

    let http_url = server_url.trim_start_matches("ws://").trim_start_matches("wss://");

    // 1. Получаем отфильтрованные данные с сервера
    let entities_url = format!("http://{}/api/rooms/{}/entities?token={}", http_url, room_id, token);
    let client = reqwest::Client::new();
    let response = client.get(&entities_url)
        .send()
        .await
        .map_err(|e| AppError::Validation(format!("Failed to connect to server: {}", e)))?;

    if response.status() == 404 {
        return Err(AppError::Validation("Комната не найдена или кампания не загружена ГМ-ом".to_string()));
    }
    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(AppError::Validation(format!("Server error: {} {}", status, text)));
    }

    let _entities: serde_json::Value = response.json().await.map_err(|_| {
        AppError::Validation("Invalid server data".to_string())
    })?;

    // 2. Создаём новую локальную БД для этой сессии
    let campaign_id = uuid::Uuid::new_v4().to_string();
    let file_name = format!("server_{}.db", &campaign_id[..8]);
    let campaigns_dir = paths.profile_campaigns_dir(&profile_id);
    fs::create_dir_all(&campaigns_dir).map_err(AppError::io)?;

    let db_path = campaigns_dir.join(&file_name);
    let db = CampaignDb::create(&db_path).await?;

    // 3. Заполняем метаданные
    let now = dnd_db::now_unix();
    let server_config = ServerConfig {
        server_url: server_url.clone(),
        room_id: room_id.clone(),
        token: token.clone(),
        display_name: display_name.clone(),
        role: "player".to_string(),
    };

    db.set_meta("id", &campaign_id).await?;
    db.set_meta("name", &format!("Multiplayer: {}", room_id)).await?;
    db.set_meta("created_at", &now.to_string()).await?;
    db.set_meta("profile_id", &profile_id).await?;
    db.set_meta("campaign_type", "server").await?;
    db.set_meta("server_config", &serde_json::to_string(&server_config).unwrap()).await?;
    db.create_default_world().await?;

    // 4. Сохраняем в индекс
    let summary = CampaignSummary {
        id: campaign_id.clone(),
        name: format!("Multiplayer: {}", room_id),
        file_name: file_name.clone(),
        created_at: now,
        last_opened_at: Some(now),
        campaign_type: CampaignType::Server,
        server_config: Some(server_config.clone()),
    };

    let index_store = CampaignIndexStore::new(paths.profile_index_file(&profile_id));
    index_store.upsert(summary.clone())?;

    // 5. Открываем кампанию
    {
        let mut current = state.campaign.lock().await;
        *current = Some(db);
    }

    Ok(summary)
}```

---
## Файл: ./src-tauri/src/commands/campaign_io.rs
```
use crate::commands::require_db;
use crate::state::{AppPaths, AppState};
use dnd_core::{AppError, CampaignSummary, CampaignType};
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
        campaign_type: CampaignType::Local,
        server_config: None,
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

/// Внутренняя версия для экспорта ZIP без State (для create_server_campaign)
pub async fn export_campaign_zip_to_temp_internal(
    state: &crate::state::AppState,
) -> Result<String, AppError> {
    let db = require_db(&state.campaign).await?;
    println!("[export_campaign_zip_to_temp_internal] DB obtained from state");

    let db_path = db.path().to_path_buf();
    let db_path_str = db_path.to_string_lossy().to_string();
    println!("[export_campaign_zip_to_temp_internal] DB path: {}", db_path_str);

    if !db_path.exists() {
        return Err(AppError::Io(format!("Campaign database not found at: {}", db_path_str)));
    }

    // Backup DB to temp file
    let temp_db_path =
        std::env::temp_dir().join(format!("dndstudio_mp_db_{}.db", uuid::Uuid::new_v4()));

    println!("[export_campaign_zip_to_temp_internal] Backing up DB to temp...");
    db.backup_to(&temp_db_path).await?;
    println!("[export_campaign_zip_to_temp_internal] Backup created");

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

    let _ = fs::remove_file(&temp_db_path);

    // 2. assets/
    let assets_dir = db.assets_dir();

    if assets_dir.exists() && assets_dir.is_dir() {
        for entry in fs::read_dir(&assets_dir).map_err(AppError::io)? {
            let entry = entry.map_err(AppError::io)?;
            let path = entry.path();

            if path.is_file() {
                if let Some(relative) = path.strip_prefix(&assets_dir).ok() {
                    let zip_path = format!("assets/{}", relative.display());
                    zip.start_file(&zip_path, options).map_err(AppError::io)?;

                    let mut file = fs::File::open(&path).map_err(AppError::io)?;
                    let mut bytes = Vec::new();
                    file.read_to_end(&mut bytes).map_err(AppError::io)?;
                    zip.write_all(&bytes).map_err(AppError::io)?;
                }
            }
        }
    }

    zip.finish().map_err(AppError::io)?;

    Ok(temp_zip_path.to_string_lossy().to_string())
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
        campaign_type: CampaignType::Local,
        server_config: None,
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
}```

---
## Файл: ./src-tauri/src/commands/characters.rs
```
use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, CharacterDetail, CharacterSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_character(
    state: State<'_, AppState>,
    name: String,
    character_type: String,
) -> Result<CharacterSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_character(&name, &character_type).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_characters(
    state: State<'_, AppState>,
) -> Result<Vec<CharacterSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_characters().await
}

#[tauri::command]
#[specta::specta]
pub async fn get_character(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<CharacterDetail>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_character(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_character(
    state: State<'_, AppState>,
    id: String,
    name: String,
    character_type: String,
    data_json: String,
) -> Result<CharacterDetail, AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_character(&id, &name, &character_type, &data_json)
        .await
}

/// Удаляет персонажа. Токены, связанные с ним, останутся (character_id = NULL через FK).
#[tauri::command]
#[specta::specta]
pub async fn delete_character(
    state: State<'_, AppState>,
    character_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    // Получаем персонажа для доступа к портрету
    let character = db
        .get_character(&character_id)
        .await?
        .ok_or(AppError::NotFound)?;

    // Удаляем персонажа
    let result = sqlx::query("DELETE FROM characters WHERE id = ?")
        .bind(&character_id)
        .execute(db.pool())
        .await
        .map_err(AppError::db)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Удаляем связанный портрет (если есть)
    if let Some(portrait_id) = character.portrait_asset_id {
        let assets_dir = db.assets_dir();
        let file_path = assets_dir
            .join("portrait")
            .join(format!("{}.webp", portrait_id));
        let thumb_path = assets_dir
            .join("portrait")
            .join("thumbs")
            .join(format!("{}_thumb.webp", portrait_id));

        if file_path.exists() {
            let _ = std::fs::remove_file(&file_path);
        }

        if thumb_path.exists() {
            let _ = std::fs::remove_file(&thumb_path);
        }

        let _ = db.delete_asset(&portrait_id).await;
    }

    Ok(())
}```

---
## Файл: ./src-tauri/src/commands/compendiums.rs
```
use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, CompendiumEntrySummary, CompendiumSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn list_compendiums(
    state: State<'_, AppState>,
) -> Result<Vec<CompendiumSummary>, AppError> {
    let db = require_db(&state.campaign).await?;
    db.list_compendiums().await
}

#[tauri::command]
#[specta::specta]
pub async fn list_compendium_entries(
    state: State<'_, AppState>,
    compendium_id: String,
) -> Result<Vec<CompendiumEntrySummary>, AppError> {
    let db = require_db(&state.campaign).await?;
    db.list_compendium_entries(&compendium_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_compendium(
    state: State<'_, AppState>,
    name: String,
    compendium_type: String,
) -> Result<CompendiumSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.create_compendium(&name, &compendium_type).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_compendium_entry(
    state: State<'_, AppState>,
    compendium_id: String,
    entry_key: String,
    name: String,
    data_json: String,
) -> Result<CompendiumEntrySummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.create_compendium_entry(&compendium_id, &entry_key, &name, &data_json)
        .await
}

#[tauri::command]
#[specta::specta]
pub async fn update_compendium(
    state: State<'_, AppState>,
    id: String,
    name: String,
    compendium_type: String,
) -> Result<CompendiumSummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.update_compendium(&id, &name, &compendium_type).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_compendium(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;
    db.delete_compendium(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_compendium_entry(
    state: State<'_, AppState>,
    id: String,
    name: String,
    data_json: String,
) -> Result<CompendiumEntrySummary, AppError> {
    let db = require_db(&state.campaign).await?;
    db.update_compendium_entry(&id, &name, &data_json).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_compendium_entry(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;
    db.delete_compendium_entry(&id).await
}```

---
## Файл: ./src-tauri/src/commands/journal.rs
```
use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, JournalEntryDetail, JournalEntrySummary, JournalLinkSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_journal_entry(
    state: State<'_, AppState>,
    title: String,
    folder_path: String,
) -> Result<JournalEntrySummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_journal_entry(&title, &folder_path).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_journal_entries(
    state: State<'_, AppState>,
) -> Result<Vec<JournalEntrySummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_journal_entries().await
}

#[tauri::command]
#[specta::specta]
pub async fn get_journal_entry(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<JournalEntryDetail>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.get_journal_entry(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_journal_entry(
    state: State<'_, AppState>,
    id: String,
    title: String,
    content_markdown: String,
    folder_path: String,
    visibility: String,
    players_can_edit: bool,
) -> Result<JournalEntryDetail, AppError> {
    let db = require_db(&state.campaign).await?;

    db.update_journal_entry(
        &id,
        &title,
        &content_markdown,
        &folder_path,
        &visibility,
        players_can_edit,
    )
    .await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_journal_entry(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.delete_journal_entry(&id).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_journal_links(
    state: State<'_, AppState>,
    entry_id: String,
) -> Result<Vec<JournalLinkSummary>, AppError> {
    let db = require_db(&state.campaign).await?;
    db.list_journal_links(&entry_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn create_journal_link(
    state: State<'_, AppState>,
    source_entry_id: String,
    target_type: String,
    target_id: String,
    link_type: String,
    is_directed: bool,
    label: Option<String>,
) -> Result<JournalLinkSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_journal_link(
        &source_entry_id,
        &target_type,
        &target_id,
        &link_type,
        is_directed,
        label,
    )
    .await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_journal_link(state: State<'_, AppState>, id: String) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;
    db.delete_journal_link(&id).await
}
```

---
## Файл: ./src-tauri/src/commands/maps.rs
```
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
```

---
## Файл: ./src-tauri/src/commands/mod.rs
```
pub mod campaign;
pub mod tokens;
pub mod maps;
pub mod characters;
pub mod journal;
pub mod compendiums;
pub mod campaign_io;
pub mod plugins;
pub mod assets;
pub mod plugin_deps;
pub mod profiles;

use dnd_core::AppError;
use dnd_db::CampaignDb;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn require_db(
    campaign: &Arc<Mutex<Option<CampaignDb>>>,
) -> Result<CampaignDb, AppError> {
    let current = campaign.lock().await;

    current.clone().ok_or(AppError::NoCampaign)
}```

---
## Файл: ./src-tauri/src/commands/plugin_deps.rs
```
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
}```

---
## Файл: ./src-tauri/src/commands/plugins.rs
```
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
```

---
## Файл: ./src-tauri/src/commands/profiles.rs
```
use crate::state::{AppPaths, AppState};
use dnd_core::AppError;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::State;

/// Информация о профиле
#[derive(Debug, Clone, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ProfileInfo {
    pub id: String,
    pub name: String,
    pub avatar_path: Option<String>,
    pub created_at: i32,
    pub last_active_at: i32,
}

/// Создать новый профиль
#[tauri::command]
#[specta::specta]
pub async fn create_profile(
    paths: State<'_, AppPaths>,
    name: String,
) -> Result<ProfileInfo, AppError> {
    let name = name.trim().to_string();

    if name.is_empty() {
        return Err(AppError::Validation(
            "Profile name is required".to_string(),
        ));
    }

    let profile_id = uuid::Uuid::new_v4().to_string();
    let now = dnd_db::now_unix();

    let profile = ProfileInfo {
        id: profile_id.clone(),
        name,
        avatar_path: None,
        created_at: now,
        last_active_at: now,
    };

    // Создаём директорию профиля
    let profile_dir = paths.profile_dir(&profile_id);
    fs::create_dir_all(&profile_dir).map_err(AppError::io)?;

    // Создаём поддиректории
    fs::create_dir_all(paths.profile_campaigns_dir(&profile_id)).map_err(AppError::io)?;
    fs::create_dir_all(paths.profile_multiplayer_dir(&profile_id)).map_err(AppError::io)?;

    // Сохраняем profile.json
    let meta_path = paths.profile_meta_file(&profile_id);
    fs::write(
        &meta_path,
        serde_json::to_string_pretty(&profile).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(profile)
}

/// Список всех профилей
#[tauri::command]
#[specta::specta]
pub async fn list_profiles(
    paths: State<'_, AppPaths>,
) -> Result<Vec<ProfileInfo>, AppError> {
    let profiles_dir = &paths.profiles_dir;

    if !profiles_dir.exists() {
        return Ok(Vec::new());
    }

    let mut profiles = Vec::new();

    let entries = fs::read_dir(profiles_dir).map_err(AppError::io)?;

    for entry in entries {
        let entry = entry.map_err(AppError::io)?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let meta_path = path.join("profile.json");
        if !meta_path.exists() {
            continue;
        }

        let content = fs::read_to_string(&meta_path).map_err(AppError::io)?;

        match serde_json::from_str::<ProfileInfo>(&content) {
            Ok(profile) => profiles.push(profile),
            Err(_) => continue,
        }
    }

    // Сортируем по last_active_at (последний активный первым)
    profiles.sort_by(|a, b| b.last_active_at.cmp(&a.last_active_at));

    Ok(profiles)
}

/// Удалить профиль
#[tauri::command]
#[specta::specta]
pub async fn delete_profile(
    state: State<'_, AppState>,
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<(), AppError> {
    let profile_dir = paths.profile_dir(&profile_id);

    if !profile_dir.exists() {
        return Err(AppError::NotFound);
    }

    // Закрываем активную кампанию если она из этого профиля
    {
        let mut current = state.campaign.lock().await;
        *current = None;
    }

    // Удаляем директорию профиля
    fs::remove_dir_all(&profile_dir).map_err(AppError::io)?;

    Ok(())
}

/// Обновить last_active_at профиля
#[tauri::command]
#[specta::specta]
pub async fn touch_profile(
    paths: State<'_, AppPaths>,
    profile_id: String,
) -> Result<(), AppError> {
    let meta_path = paths.profile_meta_file(&profile_id);

    if !meta_path.exists() {
        return Err(AppError::NotFound);
    }

    let content = fs::read_to_string(&meta_path).map_err(AppError::io)?;
    let mut profile: ProfileInfo =
        serde_json::from_str(&content).map_err(AppError::io)?;

    profile.last_active_at = dnd_db::now_unix();

    fs::write(
        &meta_path,
        serde_json::to_string_pretty(&profile).map_err(AppError::io)?,
    )
    .map_err(AppError::io)?;

    Ok(())
}```

---
## Файл: ./src-tauri/src/commands/tokens.rs
```
use crate::commands::require_db;
use crate::state::AppState;
use dnd_core::{AppError, TokenSummary};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn create_token(
    state: State<'_, AppState>,
    map_id: String,
    x: f64,
    y: f64,
    character_id: Option<String>,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.create_token(&map_id, x, y, character_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_tokens(
    state: State<'_, AppState>,
    map_id: String,
) -> Result<Vec<TokenSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    db.list_tokens(&map_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn move_token(
    state: State<'_, AppState>,
    map_id: String,
    token_id: String,
    x: f64,
    y: f64,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.move_token(&map_id, &token_id, x, y).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_token(
    state: State<'_, AppState>,
    map_id: String,
    token_id: String,
) -> Result<(), AppError> {
    let db = require_db(&state.campaign).await?;

    db.delete_token(&map_id, &token_id).await
}

#[tauri::command]
#[specta::specta]
pub async fn assign_token_character(
    state: State<'_, AppState>,
    map_id: String,
    token_id: String,
    character_id: Option<String>,
) -> Result<TokenSummary, AppError> {
    let db = require_db(&state.campaign).await?;

    db.assign_token_character(&map_id, &token_id, character_id)
        .await
}

/// Возвращает все токены кампании (для дерева навигатора)
#[tauri::command]
#[specta::specta]
pub async fn list_all_tokens(
    state: State<'_, AppState>,
) -> Result<Vec<TokenSummary>, AppError> {
    let db = require_db(&state.campaign).await?;

    let rows = sqlx::query_as::<
        _,
        (
            String,
            String,
            Option<String>,
            Option<String>,
            f64,
            f64,
            f64,
            f64,
            i32,
            String,
            i32,
            Option<String>,
        ),
    >(
        r#"
        SELECT
            t.id, t.map_id, t.character_id, t.asset_id,
            t.x, t.y, t.rotation, t.scale, t.is_visible, t.layer, t.version,
            c.name
        FROM tokens t
        LEFT JOIN characters c ON c.id = t.character_id
        ORDER BY t.map_id, t.rowid
        "#,
    )
    .fetch_all(db.pool())
    .await
    .map_err(AppError::db)?;

    Ok(rows
        .into_iter()
        .map(
            |(
                id,
                map_id,
                character_id,
                asset_id,
                x,
                y,
                rotation,
                scale,
                is_visible,
                layer,
                version,
                character_name,
            )| TokenSummary {
                id,
                map_id,
                character_id,
                asset_id,
                x,
                y,
                rotation,
                scale,
                is_visible: is_visible != 0,
                layer,
                version,
                character_name,
            },
        )
        .collect())
}```

---
## Файл: ./src-tauri/src/lib.rs
```
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---
## Файл: ./src-tauri/src/main.rs
```
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use commands::assets::{
    delete_asset, get_asset_data_url, get_asset_file_path, get_asset_thumb_path, import_asset,
    list_assets, read_campaign_asset_data_url, read_file_as_data_url,
};
use commands::campaign::{
    close_campaign, create_campaign, create_server_campaign, delete_campaign, get_active_campaign,
    get_campaign_assets_dir, join_server_campaign, list_campaigns, open_campaign, rename_campaign,
};
use commands::campaign_io::{
    delete_multiplayer_session, delete_temp_file, export_campaign, export_campaign_to_temp,
    export_campaign_zip_to_temp, import_campaign, list_multiplayer_sessions,
    open_multiplayer_campaign, read_file_bytes, save_multiplayer_campaign,
    save_multiplayer_campaign_zip, update_multiplayer_session,
};
use commands::characters::{
    create_character, delete_character, get_character, list_characters, update_character,
};
use commands::compendiums::{
    create_compendium, create_compendium_entry, delete_compendium, delete_compendium_entry,
    list_compendium_entries, list_compendiums, update_compendium, update_compendium_entry,
};
use commands::journal::{
    create_journal_entry, create_journal_link, delete_journal_entry, delete_journal_link,
    get_journal_entry, list_journal_entries, list_journal_links, update_journal_entry,
};
use commands::maps::{
    create_map, delete_map, get_active_scene, get_map, import_map_image, list_maps, set_active_scene,
    set_map_visible_to_players, sync_active_scene, sync_map_visibility, update_map_fog,
};
use commands::plugin_deps::{
    can_deactivate_plugin, can_uninstall_plugin, validate_plugin_dependencies,
};
use commands::plugins::{
    get_plugin_sheet, get_plugin_theme_css, install_builtin_plugin, install_plugin_from_file,
    list_installed_plugins, list_link_types, list_plugin_sheets, list_plugin_themes,
    set_plugin_active, uninstall_plugin,
};
use commands::profiles::{create_profile, delete_profile, list_profiles, touch_profile};
use commands::tokens::{
    assign_token_character, create_token, delete_token, list_all_tokens, list_tokens, move_token,
};
use specta_typescript::Typescript;
use state::{AppPaths, AppState};
use tauri::Manager;

pub struct Commands;

fn main() {
    let builder =
        tauri_specta::Builder::<tauri::Wry>::new().commands(tauri_specta::collect_commands![
            create_campaign,
            list_campaigns,
            open_campaign,
            close_campaign,
            get_active_campaign,
            create_map,
            list_maps,
            get_map,
            create_token,
            list_tokens,
            move_token,
            delete_token,
            assign_token_character,
            list_all_tokens,
            create_character,
            list_characters,
            create_journal_entry,
            list_journal_entries,
            get_journal_entry,
            update_journal_entry,
            delete_journal_entry,
            get_character,
            update_character,
            delete_character,
            import_map_image,
            read_campaign_asset_data_url,
            update_map_fog,
            list_compendiums,
            list_compendium_entries,
            create_compendium,
            create_compendium_entry,
            update_compendium,
            delete_compendium,
            update_compendium_entry,
            delete_compendium_entry,
            export_campaign,
            import_campaign,
            install_plugin_from_file,
            list_installed_plugins,
            set_plugin_active,
            uninstall_plugin,
            get_plugin_sheet,
            list_plugin_sheets,
            list_plugin_themes,
            get_plugin_theme_css,
            list_link_types,
            list_journal_links,
            create_journal_link,
            delete_journal_link,
            install_builtin_plugin,
            import_asset,
            get_asset_file_path,
            get_asset_thumb_path,
            get_asset_data_url,
            delete_asset,
            list_assets,
            read_file_as_data_url,
            validate_plugin_dependencies,
            can_deactivate_plugin,
            can_uninstall_plugin,
            export_campaign_to_temp,
            read_file_bytes,
            delete_temp_file,
            delete_multiplayer_session,
            list_multiplayer_sessions,
            update_multiplayer_session,
            save_multiplayer_campaign,
            open_multiplayer_campaign,
            create_profile,
            delete_profile,
            list_profiles,
            touch_profile,
            get_campaign_assets_dir,
            rename_campaign,
            delete_campaign,
            export_campaign_zip_to_temp,
            save_multiplayer_campaign_zip,
            create_server_campaign,
            join_server_campaign,
            set_map_visible_to_players,
            set_active_scene,
            delete_map,
            get_active_scene,
            sync_map_visibility,
            sync_active_scene,
        ]);

    #[cfg(debug_assertions)]
    {
        let export_path =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../src/shared/api/bindings.ts");

        if let Err(err) = builder.export(Typescript::default(), &export_path) {
            eprintln!("Failed to export specta types: {err}");
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(builder.invoke_handler())
        .manage(AppState::default())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;

            let paths = AppPaths::new(data_dir);

            app.manage(paths);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DndStudio");
}
```

---
## Файл: ./src-tauri/src/state.rs
```
use dnd_db::CampaignDb;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub campaign: Arc<Mutex<Option<CampaignDb>>>,
}

/// Пути к данным приложения
#[derive(Debug, Clone)]
pub struct AppPaths {
    /// Корневая директория данных приложения
    pub data_dir: PathBuf,
    /// Директория профилей
    pub profiles_dir: PathBuf,
    /// Директория плагинов (общая для всех профилей)
    pub plugins_dir: PathBuf,
}

impl AppPaths {
    pub fn new(data_dir: PathBuf) -> Self {
        let profiles_dir = data_dir.join("profiles");
        let plugins_dir = data_dir.join("plugins");

        std::fs::create_dir_all(&profiles_dir).ok();
        std::fs::create_dir_all(&plugins_dir).ok();

        Self {
            data_dir,
            profiles_dir,
            plugins_dir,
        }
    }

    // ============================================
    // Профили
    // ============================================

    /// Директория конкретного профиля
    pub fn profile_dir(&self, profile_id: &str) -> PathBuf {
        self.profiles_dir.join(profile_id)
    }

    /// Файл profile.json
    pub fn profile_meta_file(&self, profile_id: &str) -> PathBuf {
        self.profile_dir(profile_id).join("profile.json")
    }

    // ============================================
    // Кампании профиля
    // ============================================

    /// Директория кампаний профиля
    pub fn profile_campaigns_dir(&self, profile_id: &str) -> PathBuf {
        self.profile_dir(profile_id).join("campaigns")
    }

    /// Файл индекса кампаний профиля
    pub fn profile_index_file(&self, profile_id: &str) -> PathBuf {
        self.profile_dir(profile_id).join("campaign-index.json")
    }

    // ============================================
    // Мультиплеер профиля
    // ============================================

    /// Директория мультиплеерных сессий профиля
    pub fn profile_multiplayer_dir(&self, profile_id: &str) -> PathBuf {
        self.profile_dir(profile_id).join("multiplayer")
    }

    /// Директория конкретной мультиплеерной сессии
    pub fn session_dir(&self, profile_id: &str, room_id: &str) -> PathBuf {
        self.profile_multiplayer_dir(profile_id).join(room_id)
    }

    /// Файл session.json
    pub fn session_meta_file(&self, profile_id: &str, room_id: &str) -> PathBuf {
        self.session_dir(profile_id, room_id).join("session.json")
    }

    /// Файл campaign.db сессии
    pub fn session_db_file(&self, profile_id: &str, room_id: &str) -> PathBuf {
        self.session_dir(profile_id, room_id).join("campaign.db")
    }
}```

---
## Файл: ./src-tauri/tauri.conf.json
```
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "DndStudio",
  "version": "0.1.0",
  "identifier": "com.nik1line.dnd-studio",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "DndStudio",
        "width": 1440,
        "height": 900,
        "minWidth": 1024,
        "minHeight": 640,
        "center": true,
        "dragDropEnabled": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "resources": [
      "resources/**/*"
    ]
  }
}```

---
## Файл: ./src/app/App.css
```
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafb);
}
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

#greet-input {
  margin-right: 5px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}
```

---
## Файл: ./src/app/App.tsx
```
import { useEffect } from 'react';

import { AppShell } from './AppShell';

import { useAutoOpenLastCampaign } from '../shared/hooks/useAutoOpenLastCampaign';
import { useGlobalShortcuts } from '../shared/hooks/useGlobalShortcuts';
import { usePluginDragDrop } from '../shared/hooks/usePluginDragDrop';
import { useThemeEffect } from '../shared/hooks/useThemeEffect';
import { logDebug } from '../shared/lib/debug';
import { useWorkspaceStore } from '../shared/stores/workspace';
import { usePluginTheme } from '../shared/hooks/usePluginTheme';
import { useMultiplayerSync } from '../shared/hooks/useMultiplayerSync';
import { useUiStore } from '../shared/stores/ui';
import { ProfileSelectScreen } from '../features/profile/ProfileSelectScreen';
import { StartScreen } from '../features/campaign-start/StartScreen';
import { DragOverlay } from '../shared/ui/DragOverlay';

export default function App() {
  const workspaceReady = useWorkspaceStore.persist.hasHydrated();
  const activeProfileId = useUiStore((state) => state.activeProfileId);
  const activeCampaign = useUiStore((state) => state.activeCampaign);

  useThemeEffect();
  usePluginTheme();
  useGlobalShortcuts();
  useMultiplayerSync();
  useAutoOpenLastCampaign(workspaceReady);


  const {
    isDragging,
    isInstalling,
    dropMessage,
    canInstall,
  } = usePluginDragDrop();

  useEffect(() => {
    if (!workspaceReady) {
      return;
    }

    const state = useWorkspaceStore.getState();

    logDebug('app', 'workspace ready', {
      campaignId: state.campaignId,
      lastCampaignId: state.lastCampaignId,
      tabsCount: state.tabs.length,
      activeTabId: state.activeTabId,
    });

    (window as any).__DND_STUDIO_DEBUG__ = {
      getWorkspaceState: () => useWorkspaceStore.getState(),
      getWorkspaceStorage: () => {
        try {
          return JSON.parse(
            localStorage.getItem('dndstudio.workspace') ?? 'null',
          );
        } catch (error) {
          return {
            error: String(error),
          };
        }
      },
      clearWorkspaceStorage: () => {
        localStorage.removeItem('dndstudio.workspace');
      },
      setDebugEnabled: (value: boolean) => {
        localStorage.setItem('dndstudio.debug', value ? '1' : '0');
      },
    };
  }, [workspaceReady]);

  if (!activeProfileId) {
    return <ProfileSelectScreen />;
  }
  if (!workspaceReady) {
    return (
      <main className="center-area">
        <div className="empty-state">Restoring workspace…</div>
      </main>
    );
  }

  return (
    <>
      <AppShell />

      {isDragging && (
        <div className="plugin-drop-overlay">
          <div className="plugin-drop-card">
            {canInstall
              ? 'Drop .dndplugin to install'
              : 'Open a campaign before installing plugins'}
          </div>
        </div>
      )}

      {dropMessage && (
        <div className="plugin-drop-toast">
          {dropMessage}
        </div>
      )}

      <DragOverlay />
    </>
  );
}```

---
## Файл: ./src/app/AppShell.tsx
```
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from 'react-resizable-panels';

import { BottomPanel } from '../shared/ui/BottomPanel';
import { CenterArea } from '../shared/ui/CenterArea';
import { LeftActivityBar } from '../shared/ui/LeftActivityBar';
import { LeftPanel } from '../shared/ui/LeftPanel';
import { RightActivityBar } from '../shared/ui/RightActivityBar';
import { RightPanel } from '../shared/ui/RightPanel';
import { StatusBar } from '../shared/ui/StatusBar';
import { TopBar } from '../shared/ui/TopBar';

import { useUiStore } from '../shared/stores/ui';

export function AppShell() {
  const leftVisible = useUiStore((state) => state.leftVisible);
  const rightVisible = useUiStore((state) => state.rightVisible);
  const bottomVisible = useUiStore((state) => state.bottomVisible);

  const setLeftVisible = useUiStore((state) => state.setLeftVisible);
  const setRightVisible = useUiStore((state) => state.setRightVisible);
  const setBottomVisible = useUiStore((state) => state.setBottomVisible);

  const leftPanelRef = useRef<ImperativePanelHandle | null>(null);
  const rightPanelRef = useRef<ImperativePanelHandle | null>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle | null>(null);

  useEffect(() => {
    const panel = leftPanelRef.current;

    if (!panel) {
      return;
    }

    if (leftVisible) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
    } else {
      if (!panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [leftVisible]);

  useEffect(() => {
    const panel = rightPanelRef.current;

    if (!panel) {
      return;
    }

    if (rightVisible) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
    } else {
      if (!panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [rightVisible]);

  useEffect(() => {
    const panel = bottomPanelRef.current;

    if (!panel) {
      return;
    }

    if (bottomVisible) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
    } else {
      if (!panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [bottomVisible]);

  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <LeftActivityBar />

        <PanelGroup
          direction="horizontal"
          autoSaveId="dndstudio.layout.main.v2"
          className="main-panels"
        >
          <Panel
            ref={leftPanelRef}
            id="left"
            order={1}
            defaultSize={18}
            minSize={12}
            maxSize={32}
            collapsible
            collapsedSize={0}
            onCollapse={() => {
              if (useUiStore.getState().leftVisible) {
                setLeftVisible(false);
              }
            }}
            onExpand={() => {
              if (!useUiStore.getState().leftVisible) {
                setLeftVisible(true);
              }
            }}
          >
            <LeftPanel />
          </Panel>

          <PanelResizeHandle
            disabled={!leftVisible}
            className={clsx(
              'resize-handle',
              'resize-handle-horizontal',
              {
                'resize-handle-hidden': !leftVisible,
              },
            )}
          />

          <Panel
            id="center-wrapper"
            order={2}
            minSize={35}
          >
            <PanelGroup
              direction="vertical"
              autoSaveId="dndstudio.layout.center.v2"
            >
              <Panel
                id="center"
                order={1}
                minSize={30}
              >
                <CenterArea />
              </Panel>

              <PanelResizeHandle
                disabled={!bottomVisible}
                className={clsx(
                  'resize-handle',
                  'resize-handle-vertical',
                  {
                    'resize-handle-hidden': !bottomVisible,
                  },
                )}
              />

              <Panel
                ref={bottomPanelRef}
                id="bottom"
                order={2}
                defaultSize={28}
                minSize={12}
                collapsible
                collapsedSize={0}
                onCollapse={() => {
                  if (useUiStore.getState().bottomVisible) {
                    setBottomVisible(false);
                  }
                }}
                onExpand={() => {
                  if (!useUiStore.getState().bottomVisible) {
                    setBottomVisible(true);
                  }
                }}
              >
                <BottomPanel />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle
            disabled={!rightVisible}
            className={clsx(
              'resize-handle',
              'resize-handle-horizontal',
              {
                'resize-handle-hidden': !rightVisible,
              },
            )}
          />

          <Panel
            ref={rightPanelRef}
            id="right"
            order={3}
            defaultSize={18}
            minSize={12}
            maxSize={32}
            collapsible
            collapsedSize={0}
            onCollapse={() => {
              if (useUiStore.getState().rightVisible) {
                setRightVisible(false);
              }
            }}
            onExpand={() => {
              if (!useUiStore.getState().rightVisible) {
                setRightVisible(true);
              }
            }}
          >
            <RightPanel />
          </Panel>
        </PanelGroup>

        <RightActivityBar />
      </div>

      <StatusBar />
    </div>
  );
}```

---
## Файл: ./src/features/campaign-start/StartScreen.tsx
```
import { FormEvent, useState } from 'react';
import { useCampaigns, useCreateCampaign, useCreateServerCampaign, useDeleteCampaign, useOpenCampaign } from '../../shared/api/hooks';
import { open } from '@tauri-apps/plugin-dialog';
import { useImportCampaign } from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';

export function StartScreen() {
  const [campaignType, setCampaignType] = useState<'local' | 'server'>('local');
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:3001');
  const [roomName, setRoomName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const activeProfileId = useUiStore((state) => state.activeProfileId);

  const { data: campaigns = [], isLoading } = useCampaigns(activeProfileId!);
  const createCampaign = useCreateCampaign();
  const createServerCampaign = useCreateServerCampaign();
  const deleteCampaign = useDeleteCampaign(activeProfileId!);
  const openCampaign = useOpenCampaign(activeProfileId!);

  const importCampaign = useImportCampaign();

  const handleDeleteCampaign = async () => {
    if (!pendingDelete) return;

    deleteCampaign.mutate(
      { campaignId: pendingDelete.id, profileId: activeProfileId! },
      {
        onSuccess: () => {
          setPendingDelete(null);
        },
      },
    );
  };

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Kампания DndStudio',
            extensions: ['dndcampaign'],
          },
        ],
      });

      if (typeof selected === 'string') {
        importCampaign.mutate({
          sourcePath: selected,
          profileId: activeProfileId!,
        });
      }
    } catch (error) {
      console.error('Import failed', error);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (campaignType === 'local') {
      createCampaign.mutate({ name: name.trim(), profileId: activeProfileId! });
    } else {
      if (!serverUrl.trim()) {
        alert('Введите адрес Relay Server');
        return;
      }
      if (!roomName.trim()) {
        alert('Введите название комнаты');
        return;
      }
      createServerCampaign.mutate({
        name: name.trim(),
        profileId: activeProfileId!,
        serverUrl: serverUrl.trim(),
        roomName: roomName.trim(),
        accessCode: accessCode || undefined,
      });
    }
    setName('');
  };

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1>DndStudio</h1>
        <p>Создайте или откройте кампанию для начала работы.</p>

        <form className="start-form" onSubmit={onSubmit}>
          {/* Переключатель типа кампании */}
          <div className="form-field">
            <label>Тип кампании</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="local"
                  checked={campaignType === 'local'}
                  onChange={() => setCampaignType('local')}
                />
                Локальная (офлайн)
              </label>
              <label>
                <input
                  type="radio"
                  value="server"
                  checked={campaignType === 'server'}
                  onChange={() => setCampaignType('server')}
                />
                Серверная (мультиплеер)
              </label>
            </div>
          </div>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название кампании"
          />

          {campaignType === 'server' && (
            <>
              <input
                value={serverUrl}
                onChange={(event) => setServerUrl(event.target.value)}
                placeholder="Адрес Relay Server (ws://localhost:3001)"
              />
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Название комнаты"
              />
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Код доступа (опционально)"
                type="password"
              />
            </>
          )}

          <button
            type="submit"
            disabled={
              (createCampaign.isPending || createServerCampaign.isPending) ||
              !name.trim() ||
              (campaignType === 'server' && (!serverUrl.trim() || !roomName.trim()))
            }
          >
            {createCampaign.isPending
              ? 'Создание…'
              : createServerCampaign.isPending
              ? 'Создание и загрузка…'
              : campaignType === 'local'
              ? 'Создать кампанию'
              : 'Создать серверную кампанию'}
          </button>
        </form>

        <div className="start-import">
          <button
            type="button"
            onClick={handleImport}
            disabled={importCampaign.isPending}
          >
            {importCampaign.isPending ? 'Импорт…' : 'Импортировать кампанию (.dndcampaign)'}
          </button>
        </div>

        {createCampaign.isError && (
          <div className="error-text">
            Не удалось создать кампанию.
          </div>
        )}

        {createServerCampaign.isError && (
          <div className="error-text">
            Не удалось создать серверную кампанию. Проверьте соединение с сервером.
          </div>
        )}

        <div className="start-join-server">
          <a
            href="#"
            className="link-button"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Открыть модальное окно присоединения
              alert('Функция присоединения к серверной кампании будет доступна в следующем обновлении');
            }}
          >
            👥 Присоединиться к игре
          </a>
        </div>

        <section className="recent-campaigns">
          <h2>Последние кампании</h2>

          {isLoading && <p>Загрузка…</p>}

          {!isLoading && campaigns.length === 0 && (
            <p>Кампаний пока нет.</p>
          )}

          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="navigator-item-row">
                  <span className="navigator-item-grow">
                    <button
                      type="button"
                      onClick={() => openCampaign.mutate(campaign.id)}
                      disabled={openCampaign.isPending}
                    >
                      {campaign.name}
                    </button>
                  </span>
                  {activeProfileId && (
                    <span className="navigator-item-delete-wrapper">
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger navigator-item-delete"
                        title="Удалить кампанию"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDelete({ id: campaign.id, name: campaign.name });
                        }}
                      >
                        🗑️
                      </button>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ConfirmDialog
          open={pendingDelete !== null}
          title="Удаление кампании"
          message={`Вы уверены, что хотите удалить "${pendingDelete?.name}"? Это действие необратимо. Все карты, персонажи и ресурсы будут удалены навсегда.`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          destructive
          onConfirm={handleDeleteCampaign}
          onCancel={() => setPendingDelete(null)}
        />
      </div>
    </div>
  );
}```

---
## Файл: ./src/features/character/CharacterTab.tsx
```
import { useEffect, useState } from 'react';

import {
  useCharacter,
  usePluginSheet,
  usePluginSheets,
  useUpdateCharacter,
} from '../../shared/api/hooks';
import { useWorkspaceStore } from '../../shared/stores/workspace';

import { SheetRenderer } from '../sheets/SheetRenderer';

type CharacterType = 'pc' | 'npc' | 'monster';

interface CharacterFormData {
  hp: { current: number; max: number; temp: number };
  ac: number;
  initiativeMod: number;
  speed: number;
  notes: string;
  [key: string]: unknown;
}

const DEFAULT_DATA: CharacterFormData = {
  hp: { current: 0, max: 0, temp: 0 },
  ac: 10,
  initiativeMod: 0,
  speed: 30,
  notes: '',
};

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCharacterData(rawJson: string): CharacterFormData {
  try {
    const parsed = JSON.parse(rawJson);

    return {
      ...DEFAULT_DATA,
      ...parsed,
      hp: {
        current: toNumber(parsed?.hp?.current, 0),
        max: toNumber(parsed?.hp?.max, 0),
        temp: toNumber(parsed?.hp?.temp, 0),
      },
      ac: toNumber(parsed?.ac, 10),
      initiativeMod: toNumber(parsed?.initiativeMod, 0),
      speed: toNumber(parsed?.speed, 30),
      notes: typeof parsed?.notes === 'string' ? parsed.notes : '',
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function CharacterTab({ characterId }: { characterId?: string }) {
  const { data: character, isLoading } = useCharacter(characterId);
  const updateCharacter = useUpdateCharacter();
  const { data: availableSheets = [] } = usePluginSheets(Boolean(characterId));

  const renameTabByEntity = useWorkspaceStore(
    (state) => state.renameTabByEntity,
  );

  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>('pc');
  const [data, setData] = useState<CharacterFormData>(DEFAULT_DATA);
  const [selectedSheetKey, setSelectedSheetKey] = useState<string | null>(null);
  const [selectedSheetPluginId, setSelectedSheetPluginId] = useState<string | null>(null);

  // Загруженный sheet JSON
  const { data: sheetJson } = usePluginSheet(
    selectedSheetPluginId ?? undefined,
    selectedSheetKey ?? undefined,
  );

  useEffect(() => {
    if (!character || character.id === initializedFor) {
      return;
    }

    setName(character.name);
    setCharacterType(character.type as CharacterType);
    setData(parseCharacterData(character.dataJson));

    // Восстанавливаем выбранный шаблон из data
    try {
      const parsed = JSON.parse(character.dataJson);
      if (parsed._sheetPluginId && parsed._sheetKey) {
        setSelectedSheetPluginId(parsed._sheetPluginId);
        setSelectedSheetKey(parsed._sheetKey);
      }
    } catch {
      // ignore
    }

    setInitializedFor(character.id);
  }, [character, initializedFor]);

  if (!characterId) {
    return (
      <div className="workspace-empty">
        Character tab is broken: missing character id.
      </div>
    );
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading character…</div>;
  }

  if (!character) {
    return <div className="workspace-empty">Character not found.</div>;
  }

  const handleSave = () => {
    const safeName = name.trim() || 'Unnamed';

    // Сохраняем выбранный шаблон в data
    const dataToSave = {
      ...data,
      _sheetPluginId: selectedSheetPluginId,
      _sheetKey: selectedSheetKey,
    };

    const dataJson = JSON.stringify(dataToSave);

    updateCharacter.mutate(
      {
        id: character.id,
        name: safeName,
        characterType,
        dataJson,
      },
      {
        onSuccess: () => {
          renameTabByEntity('character', character.id, safeName);
        },
      },
    );
  };

  const handleSheetChange = (value: string) => {
    if (!value) {
      setSelectedSheetPluginId(null);
      setSelectedSheetKey(null);
      return;
    }

    const [pluginId, sheetKey] = value.split('::');
    setSelectedSheetPluginId(pluginId);
    setSelectedSheetKey(sheetKey);
  };

  const currentSheetValue =
    selectedSheetPluginId && selectedSheetKey
      ? `${selectedSheetPluginId}::${selectedSheetKey}`
      : '';

  return (
    <div className="character-tab">
      <div className="character-toolbar">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Character name"
        />

        <select
          value={characterType}
          onChange={(event) =>
            setCharacterType(event.target.value as CharacterType)
          }
        >
          <option value="pc">PC</option>
          <option value="npc">NPC</option>
          <option value="monster">Monster</option>
        </select>

        {/* Выбор шаблона листа */}
        <select
          value={currentSheetValue}
          onChange={(event) => handleSheetChange(event.target.value)}
          title="Sheet template"
        >
          <option value="">Default form</option>
          {availableSheets.map((sheet) => (
            <option
              key={`${sheet.pluginId}::${sheet.sheetKey}`}
              value={`${sheet.pluginId}::${sheet.sheetKey}`}
            >
              {sheet.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateCharacter.isPending}
        >
          {updateCharacter.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="character-content">
        {sheetJson ? (
          /* Декларативный лист из плагина */
          <SheetRenderer
            sheetJson={sheetJson}
            data={data as Record<string, unknown>}
            onChange={(newData) =>
              setData(newData as CharacterFormData)
            }
          />
        ) : (
          /* Хардкод-форма по умолчанию */
          <>
            <section className="character-section">
              <h3>Combat</h3>

              <div className="character-grid">
                <label>
                  HP current
                  <input
                    type="number"
                    value={data.hp.current}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        hp: {
                          ...prev.hp,
                          current: Number(event.target.value) || 0,
                        },
                      }))
                    }
                  />
                </label>

                <label>
                  HP max
                  <input
                    type="number"
                    value={data.hp.max}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        hp: {
                          ...prev.hp,
                          max: Number(event.target.value) || 0,
                        },
                      }))
                    }
                  />
                </label>

                <label>
                  HP temp
                  <input
                    type="number"
                    value={data.hp.temp}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        hp: {
                          ...prev.hp,
                          temp: Number(event.target.value) || 0,
                        },
                      }))
                    }
                  />
                </label>

                <label>
                  AC
                  <input
                    type="number"
                    value={data.ac}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        ac: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </label>

                <label>
                  Initiative mod
                  <input
                    type="number"
                    value={data.initiativeMod}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        initiativeMod: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </label>

                <label>
                  Speed
                  <input
                    type="number"
                    value={data.speed}
                    onChange={(event) =>
                      setData((prev) => ({
                        ...prev,
                        speed: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </label>
              </div>
            </section>

            <section className="character-section">
              <h3>Notes</h3>

              <textarea
                className="character-notes"
                value={data.notes}
                onChange={(event) =>
                  setData((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Character notes…"
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}```

---
## Файл: ./src/features/character/CreateCharacterModal.tsx
```
import { useState, type FormEvent } from 'react';

import { useCreateCharacter } from '../../shared/api/hooks';
import { Modal } from '../../shared/ui/Modal';

interface CreateCharacterModalProps {
  open: boolean;
  onClose: () => void;
}

type CharacterType = 'pc' | 'npc' | 'monster';

const CHARACTER_TYPES: Array<{
  value: CharacterType;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: 'pc',
    label: 'Player Character',
    icon: '🧙',
    description: 'A hero controlled by a player',
  },
  {
    value: 'npc',
    label: 'Non-Player Character',
    icon: '🧑‍🌾',
    description: 'An ally, merchant, or quest giver',
  },
  {
    value: 'monster',
    label: 'Monster',
    icon: '👹',
    description: 'An enemy or creature',
  },
];

export function CreateCharacterModal({
  open,
  onClose,
}: CreateCharacterModalProps) {
  const createCharacter = useCreateCharacter();

  const [name, setName] = useState('');
  const [type, setType] = useState<CharacterType>('pc');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createCharacter.mutate(
      {
        name: name.trim(),
        characterType: type,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      },
    );
  };

  const handleClose = () => {
    if (!createCharacter.isPending) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setType('pc');
  };

  return (
    <Modal
      open={open}
      title="Create New Character"
      onClose={handleClose}
      width={440}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={createCharacter.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-character-form"
            className="btn-primary"
            disabled={!name.trim() || createCharacter.isPending}
          >
            {createCharacter.isPending ? 'Creating…' : 'Create Character'}
          </button>
        </>
      }
    >
      <form id="create-character-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="character-name">Name</label>
          <input
            id="character-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thorin Ironfist"
            autoFocus
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label>Type</label>
          <div className="character-type-selector">
            {CHARACTER_TYPES.map((ct) => (
              <label
                key={ct.value}
                className={`character-type-option ${
                  type === ct.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="character-type"
                  value={ct.value}
                  checked={type === ct.value}
                  onChange={() => setType(ct.value)}
                />
                <span className="character-type-icon">{ct.icon}</span>
                <span className="character-type-label">{ct.label}</span>
                <span className="character-type-description">
                  {ct.description}
                </span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
```

---
## Файл: ./src/features/chat/ChatPanel.tsx
```
import { FormEvent, useEffect, useRef, useState } from 'react';

import { relayClient } from '../../shared/services/relayClient';
import { useChatStore } from '../../shared/stores/chat';
import { useUiStore } from '../../shared/stores/ui';

/** Парсинг команды из текста сообщения */
function parseCommand(text: string): { command: string; args: string[] } | null {
  if (!text.startsWith('/')) return null;

  const parts = text.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

/** Простой бросок костей (для /roll) */
function rollDiceNotation(notation: string): { rolls: number[]; total: number } | null {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return null;

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || '0', 10);

  if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;

  return { rolls, total };
}

export function ChatPanel() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const addSystemMessage = useChatStore((state) => state.addSystemMessage);
  const addDiceMessage = useChatStore((state) => state.addDiceMessage);
  const connectionStatus = useUiStore((state) => state.connectionStatus);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isConnected = connectionStatus === 'connected';

  const handleSend = (event: FormEvent) => {
    event.preventDefault();

    const text = inputText.trim();
    if (!text) return;

    // Проверяем, является ли текст командой
    const cmd = parseCommand(text);

    if (cmd) {
      handleCommand(cmd.command, cmd.args);
      setInputText('');
      return;
    }

    // Определяем имя отправителя
    const senderName = isConnected
      ? relayClient.displayName
      : 'You';

    // Добавляем в локальный store
    addMessage({
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      text,
      senderId: relayClient.connectedUserId || 'local',
      senderName,
      timestamp: Date.now(),
      type: 'user',
    });

    // Отправляем через Relay
    if (isConnected) {
      relayClient.send('chat_message', {
        channel: 'general',
        text,
        sender_name: senderName,
      });
    }

    setInputText('');
  };

  const handleCommand = (command: string, args: string[]) => {
    switch (command) {
      case 'help': {
        addSystemMessage(
          'Commands: /roll <dice> (e.g. /roll 1d20), /help',
        );
        break;
      }

      case 'roll': {
        const notation = args[0] || '1d20';
        const result = rollDiceNotation(notation);

        if (!result) {
          addSystemMessage(`Invalid dice notation: ${notation}`);
          return;
        }

        const senderName = isConnected ? relayClient.displayName : 'You';

        // Добавляем локально
        addDiceMessage(senderName, notation, result.total);

        // Отправляем через Relay
        if (isConnected) {
          relayClient.send('dice_roll', {
            notation,
            result: result.total,
            rolls: result.rolls,
            modifier: 0,
            roller_name: senderName,
          });
        }
        break;
      }

      default: {
        addSystemMessage(`Unknown command: /${command}. Type /help for list.`);
        break;
      }
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet. Type /help for commands.</div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message chat-message-${message.type}`}
          >
            {message.type === 'system' ? (
              <span className="chat-system-text">{message.text}</span>
            ) : message.type === 'dice' ? (
              <>
                <span className="chat-sender">{message.senderName}</span>
                <span className="chat-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="chat-dice-text">
                  🎲 {message.diceNotation} → <strong>{message.diceResult}</strong>
                </span>
              </>
            ) : (
              <>
                <span className="chat-sender">{message.senderName}</span>
                <span className="chat-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="chat-text">{message.text}</span>
              </>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder={
            isConnected
              ? 'Type a message or /roll 1d20…'
              : 'Type a message or /roll 1d20…'
          }
        />
        <button type="submit" disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}```

---
## Файл: ./src/features/compendium/CompendiumEntryEditor.tsx
```
import { useState, useEffect } from 'react';

import { useUpdateCompendiumEntry } from '../../shared/api/hooks';
import type { CompendiumEntrySummary } from '../../shared/api/bindings';
import { MonsterCard } from './MonsterCard';

interface CompendiumEntryEditorProps {
  entry: CompendiumEntrySummary;
  onClose: () => void;
  onDelete?: () => void;
}

export function CompendiumEntryEditor({
  entry,
  onClose,
  onDelete,
}: CompendiumEntryEditorProps) {
  const updateEntry = useUpdateCompendiumEntry();

  // Определяем, является ли запись частью плагина (тогда редактирование запрещено)
  const isReadonly = Boolean(entry.sourcePluginId);

  const [viewMode, setViewMode] = useState<'card' | 'json'>('card');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Инициализация JSON при открытии
  useEffect(() => {
    try {
      const parsed = JSON.parse(entry.dataJson);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      setJsonText(entry.dataJson);
      setJsonError('Исходный JSON невалиден');
    }
  }, [entry.dataJson]);

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      JSON.parse(text);
      setJsonError(null);
    } catch (e) {
      setJsonError('Некорректный JSON: ' + (e instanceof Error ? e.message : 'Syntax Error'));
    }
  };

  const handleSave = () => {
    if (jsonError || isReadonly) return;

    updateEntry.mutate(
      {
        id: entry.id,
        name: entry.name,
        dataJson: jsonText,
      },
      {
        onSuccess: () => {
          setViewMode('card'); // Возвращаемся к просмотру после сохранения
        },
      }
    );
  };

  return (
    <div className="compendium-editor">
      {/* Шапка редактора */}
      <div className="compendium-editor-header">
        <h3>{entry.name}</h3>
        
        <div className="compendium-editor-controls">
          {!isReadonly && (
            <div className="view-toggle">
              <button
                type="button"
                className={viewMode === 'card' ? 'active' : ''}
                onClick={() => setViewMode('card')}
              >
                📄 Карточка
              </button>
              <button
                type="button"
                className={viewMode === 'json' ? 'active' : ''}
                onClick={() => setViewMode('json')}
              >
                {`{ }`} JSON
              </button>
            </div>
          )}

          {isReadonly && (
            <span className="readonly-badge" title="Эта запись импортирована из плагина и не может быть изменена">
              🔒 Только чтение (Плагин)
            </span>
          )}

          <button type="button" className="icon-btn" onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>
      </div>

      {/* Тело редактора */}
      <div className="compendium-editor-body">
        {viewMode === 'card' ? (
          <MonsterCard entry={entry} />
        ) : (
          <div className="json-editor-wrapper">
            <textarea
              className="json-textarea"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
            />
            {jsonError && <div className="json-error">{jsonError}</div>}
          </div>
        )}
      </div>

      {/* Футер с кнопками */}
      {!isReadonly && (
        <div className="compendium-editor-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!!jsonError || updateEntry.isPending}
            onClick={handleSave}
          >
            {updateEntry.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          
          {onDelete && (
            <button
              type="button"
              className="btn-danger"
              onClick={onDelete}
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---
## Файл: ./src/features/compendium/CompendiumTab.tsx
```
import { useMemo, useState } from 'react';

import {
  useCompendiumEntries,
  useCreateCompendiumEntry,
  useDeleteCompendiumEntry,
} from '../../shared/api/hooks';
import { CompendiumEntryEditor } from './CompendiumEntryEditor';
import type { CompendiumEntrySummary } from '../../shared/api/bindings';

export function CompendiumTab({ compendiumId }: { compendiumId?: string }) {
  const { data: entries = [], isLoading } = useCompendiumEntries(compendiumId);
  const createEntry = useCreateCompendiumEntry();
  const deleteEntry = useDeleteCompendiumEntry();

  const [selectedEntry, setSelectedEntry] = useState<CompendiumEntrySummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntryName, setNewEntryName] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return entries;
    }

    const query = searchQuery.toLowerCase();

    return entries.filter((entry) =>
      entry.name.toLowerCase().includes(query),
    );
  }, [entries, searchQuery]);

  if (!compendiumId) {
    return <div className="workspace-empty">Missing compendium id.</div>;
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading compendium…</div>;
  }

  const handleAddEntry = () => {
    const name = newEntryName.trim();
    if (!name) return;

    createEntry.mutate(
      {
        compendiumId,
        entryKey: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        dataJson: JSON.stringify({ description: '' }),
      },
      {
        onSuccess: () => setNewEntryName(''),
      },
    );
  };

  const handleDeleteEntry = () => {
    if (!selectedEntry) return;

    if (!window.confirm(`Delete entry "${selectedEntry.name}"?`)) {
      return;
    }

    deleteEntry.mutate(
      {
        id: selectedEntry.id,
        compendiumId,
      },
      {
        onSuccess: () => {
          setSelectedEntry(null);
        },
      },
    );
  };

  return (
    <div className="compendium-tab">
      {/* Левая панель: список записей */}
      <div className="compendium-sidebar">
        <div className="compendium-add">
          <input
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            placeholder="New entry name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddEntry();
            }}
          />
          <button
            type="button"
            onClick={handleAddEntry}
            disabled={!newEntryName.trim() || createEntry.isPending}
          >
            Add
          </button>
        </div>

        <div className="compendium-search">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries…"
          />
        </div>

        <div className="compendium-list">
          {filteredEntries.length === 0 && (
            <div className="empty-state">
              {entries.length === 0 ? 'No entries yet.' : 'No matches found.'}
            </div>
          )}

          {filteredEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={
                selectedEntry?.id === entry.id
                  ? 'compendium-item active'
                  : 'compendium-item'
              }
              onClick={() => setSelectedEntry(entry)}
            >
              {entry.name}
              {entry.sourcePluginId && <span className="plugin-badge">Plugin</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Правая панель: редактор записи */}
      <div className="compendium-content">
        {selectedEntry ? (
          <CompendiumEntryEditor
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onDelete={handleDeleteEntry}
          />
        ) : (
          <div className="empty-state">
            Select an entry to view and edit.
          </div>
        )}
      </div>
    </div>
  );
}```

---
## Файл: ./src/features/compendium/CreateCompendiumModal.tsx
```
import { useState, type FormEvent } from 'react';

import { useCreateCompendium } from '../../shared/api/hooks';
import { Modal } from '../../shared/ui/Modal';

interface CreateCompendiumModalProps {
  open: boolean;
  onClose: () => void;
}

type CompendiumType = 'monster' | 'item' | 'spell' | 'feat' | 'race' | 'class' | 'other';

const COMPENDIUM_TYPES: Array<{ value: CompendiumType; label: string; icon: string }> = [
  { value: 'monster', label: 'Monsters', icon: '👹' },
  { value: 'item', label: 'Items', icon: '🗡️' },
  { value: 'spell', label: 'Spells', icon: '✨' },
  { value: 'feat', label: 'Feats', icon: '🎯' },
  { value: 'race', label: 'Races', icon: '🧝' },
  { value: 'class', label: 'Classes', icon: '⚔️' },
  { value: 'other', label: 'Other', icon: '📚' },
];

export function CreateCompendiumModal({
  open,
  onClose,
}: CreateCompendiumModalProps) {
  const createCompendium = useCreateCompendium();

  const [name, setName] = useState('');
  const [type, setType] = useState<CompendiumType>('monster');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createCompendium.mutate(
      {
        name: name.trim(),
        compendiumType: type,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      },
    );
  };

  const handleClose = () => {
    if (!createCompendium.isPending) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setType('monster');
  };

  return (
    <Modal
      open={open}
      title="Create New Compendium"
      onClose={handleClose}
      width={440}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={createCompendium.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-compendium-form"
            className="btn-primary"
            disabled={!name.trim() || createCompendium.isPending}
          >
            {createCompendium.isPending ? 'Creating…' : 'Create Compendium'}
          </button>
        </>
      }
    >
      <form id="create-compendium-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="compendium-name">Name</label>
          <input
            id="compendium-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Homebrew Monsters"
            autoFocus
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label>Type</label>
          <div className="compendium-type-selector">
            {COMPENDIUM_TYPES.map((ct) => (
              <label
                key={ct.value}
                className={`compendium-type-option ${
                  type === ct.value ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="compendium-type"
                  value={ct.value}
                  checked={type === ct.value}
                  onChange={() => setType(ct.value)}
                />
                <span className="compendium-type-icon">{ct.icon}</span>
                <span className="compendium-type-label">{ct.label}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
```

---
## Файл: ./src/features/compendium/MonsterCard.tsx
```
import type { CompendiumEntrySummary } from '../../shared/api/bindings';

interface MonsterCardProps {
  entry: CompendiumEntrySummary;
}

export function MonsterCard({ entry }: MonsterCardProps) {
  // Безопасный парсинг JSON
  let data: any = {};
  try {
    data = JSON.parse(entry.dataJson);
  } catch {
    return (
      <div className="compendium-error">
        Ошибка: некорректный формат JSON для записи "{entry.name}"
      </div>
    );
  }

  const {
    size = 'Средний',
    type = 'Гуманоид',
    alignment = 'нейтрально-злой',
    armor_class = 15,
    hit_points = 7,
    speed = '30 фт.',
    stats = { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    description = '',
    actions = [],
  } = data;

  // Хелпер для модификатора характеристики
  const getMod = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="monster-card">
      <div className="monster-header">
        <h2 className="monster-name">{entry.name}</h2>
        <p className="monster-meta">
          {size} {type}, {alignment}
        </p>
      </div>

      <div className="monster-stats-block">
        <div className="stat-row">
          <span className="stat-label">Класс Доспеха:</span>
          <span className="stat-value">{armor_class}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Хиты:</span>
          <span className="stat-value">{hit_points}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Скорость:</span>
          <span className="stat-value">{speed}</span>
        </div>
      </div>

      <div className="monster-abilities">
        {Object.entries(stats as Record<string, number>).map(([key, val]) => (
          <div key={key} className="ability-box">
            <div className="ability-abbr">{key.toUpperCase()}</div>
            <div className="ability-val">{val}</div>
            <div className="ability-mod">({getMod(val)})</div>
          </div>
        ))}
      </div>

      {description && (
        <div className="monster-section">
          <h3>Описание</h3>
          <p className="monster-text">{description}</p>
        </div>
      )}

      {actions.length > 0 && (
        <div className="monster-section">
          <h3>Действия</h3>
          {actions.map((action: any, idx: number) => (
            <div key={idx} className="monster-action">
              <strong>{action.name}. </strong>
              <span>{action.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---
## Файл: ./src/features/initiative/InitiativePanel.tsx
```
import { useEffect } from 'react';

import {
  useActiveCampaign,
  useMaps,
  useTokens,
  getCharacterDetail,
} from '../../shared/api/hooks';
import { useEncounterStore, type EncounterEntry } from '../../shared/stores/encounter';
import { useWorkspaceStore } from '../../shared/stores/workspace';
import { rollExpression } from '../../shared/lib/dice';
import { useChatStore } from '../../shared/stores/chat';

export function InitiativePanel() {
  const { data: activeCampaign } = useActiveCampaign();
  const { data: maps = [], isLoading: areMapsLoading } = useMaps(
    Boolean(activeCampaign),
  );

  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);

  const selectedMapId = useEncounterStore((state) => state.selectedMapId);
  const setSelectedMapId = useEncounterStore((state) => state.setSelectedMapId);

  const encounters = useEncounterStore((state) => state.encounters);

  const addTokens = useEncounterStore((state) => state.addTokens);
  const removeEntry = useEncounterStore((state) => state.removeEntry);
  const setInitiative = useEncounterStore((state) => state.setInitiative);
  const toggleStarted = useEncounterStore((state) => state.toggleStarted);
  const nextTurn = useEncounterStore((state) => state.nextTurn);
  const resetTurn = useEncounterStore((state) => state.resetTurn);
  const clearEncounter = useEncounterStore((state) => state.clearEncounter);
  const pruneMissingTokens = useEncounterStore(
    (state) => state.pruneMissingTokens,
  );

  const addDiceRoll = useChatStore((state) => state.addDiceRoll);

  const activeMapTab = tabs.find(
    (tab) => tab.id === activeTabId && tab.kind === 'map',
  );

  const fallbackMapId =
    selectedMapId && maps.some((map) => map.id === selectedMapId)
      ? selectedMapId
      : activeMapTab?.entityId ?? maps[0]?.id ?? null;

  useEffect(() => {
    if (fallbackMapId && fallbackMapId !== selectedMapId) {
      setSelectedMapId(fallbackMapId);
    }
  }, [fallbackMapId, selectedMapId, setSelectedMapId]);

  const effectiveMapId = fallbackMapId;

  const { data: tokens = [], isLoading: areTokensLoading } = useTokens(
    effectiveMapId ?? undefined,
  );

  const encounter = effectiveMapId
    ? encounters[effectiveMapId]
    : undefined;

  const entries = encounter?.entries ?? [];
  const started = encounter?.started ?? false;
  const round = encounter?.round ?? 1;
  const activeEntryId = encounter?.activeEntryId ?? null;

  const sortedEntries = [...entries].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }

    return a.label.localeCompare(b.label);
  });

  // Удаляем участников, если их токены были удалены с карты.
  useEffect(() => {
    if (!effectiveMapId || areTokensLoading) {
      return;
    }

    pruneMissingTokens(
      effectiveMapId,
      tokens.map((token) => token.id),
    );
  }, [effectiveMapId, areTokensLoading, tokens, pruneMissingTokens]);

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to use initiative tracker.
      </div>
    );
  }

  if (areMapsLoading) {
    return <div className="empty-state">Loading maps…</div>;
  }

  if (!effectiveMapId) {
    return (
      <div className="empty-state">
        Create or open a map to use initiative tracker.
      </div>
    );
  }

  const handleAddTokens = async () => {
    const existingTokenIds = new Set(entries.map((entry) => entry.tokenId));

    const tokensToAdd = tokens.filter(
      (token) => !existingTokenIds.has(token.id),
    );

    // Обогащаем данные персонажами для получения модификатора инициативы
    const enrichedTokens = await Promise.all(
      tokensToAdd.map(async (token, index) => {
        let label = token.characterName ?? `Token ${index + 1}`;
        let initiativeMod = 0;
        const characterId = token.characterId ?? null;

        if (token.characterId) {
          try {
            const character = await getCharacterDetail(token.characterId);
            if (character) {
              label = character.name;
              try {
                const data = JSON.parse(character.dataJson || '{}');
                initiativeMod = Number(data.initiativeMod) || 0;
              } catch {
                // ignore invalid json
              }
            }
          } catch (error) {
            console.error('Failed to load character for initiative', error);
          }
        }

        return {
          tokenId: token.id,
          label,
          initiative: 0,
          initiativeMod,
          characterId,
        };
      }),
    );

    addTokens(effectiveMapId, enrichedTokens);
  };

  const rollInitiativeForEntry = (entry: EncounterEntry) => {
    const modStr =
      entry.initiativeMod >= 0
        ? `+${entry.initiativeMod}`
        : `${entry.initiativeMod}`;
    
    const roll = rollExpression(`1d20${modStr}`);

    if (roll) {
      setInitiative(effectiveMapId, entry.id, roll.total);
      
      // Отправляем результат в чат
      addDiceRoll(activeCampaign.id, {
        ...roll,
        input: `${entry.label}: 1d20${modStr}`,
      });
    }
  };

  const rollAllInitiative = () => {
    sortedEntries.forEach((entry) => {
      rollInitiativeForEntry(entry);
    });
  };

  return (
    <div className="initiative">
      <div className="initiative-toolbar">
        <select
          value={effectiveMapId}
          onChange={(event) => setSelectedMapId(event.target.value)}
        >
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>

        <span className="initiative-round">Round {round}</span>

        <div className="initiative-actions">
          <button
            type="button"
            onClick={handleAddTokens}
            disabled={areTokensLoading || tokens.length === 0}
          >
            Add tokens
          </button>

          <button
            type="button"
            onClick={rollAllInitiative}
            disabled={entries.length === 0}
          >
            Roll All
          </button>

          <button
            type="button"
            onClick={() => toggleStarted(effectiveMapId)}
            disabled={entries.length === 0}
          >
            {started ? 'Pause' : 'Start'}
          </button>

          <button
            type="button"
            onClick={() => nextTurn(effectiveMapId)}
            disabled={!started || entries.length === 0}
          >
            Next turn
          </button>

          <button
            type="button"
            onClick={() => resetTurn(effectiveMapId)}
            disabled={entries.length === 0}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => clearEncounter(effectiveMapId)}
            disabled={entries.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="initiative-content">
        {sortedEntries.length === 0 && (
          <div className="empty-state">
            Add tokens from the current map to start combat.
          </div>
        )}

        {sortedEntries.length > 0 && (
          <div className="initiative-table">
            <div className="initiative-row initiative-row-header">
              <span>Combatant</span>
              <span>Mod</span>
              <span>Initiative</span>
              <span>Active</span>
              <span />
            </div>

            {sortedEntries.map((entry) => {
              const isActive = entry.id === activeEntryId;

              return (
                <div
                  key={entry.id}
                  className={
                    isActive
                      ? 'initiative-row initiative-row-active'
                      : 'initiative-row'
                  }
                >
                  <span>{entry.label}</span>

                  <span className="initiative-mod">
                    {entry.initiativeMod >= 0
                      ? `+${entry.initiativeMod}`
                      : entry.initiativeMod}
                  </span>

                  <div className="initiative-value">
                    <input
                      type="number"
                      value={entry.initiative}
                      onChange={(event) =>
                        setInitiative(
                          effectiveMapId,
                          entry.id,
                          Number(event.target.value) || 0,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="initiative-roll-btn"
                      onClick={() => rollInitiativeForEntry(entry)}
                      title={`Roll initiative (${entry.initiativeMod >= 0 ? '+' : ''}${entry.initiativeMod})`}
                    >
                      🎲
                    </button>
                  </div>

                  <span>{isActive ? '▶' : ''}</span>

                  <button
                    type="button"
                    onClick={() => removeEntry(effectiveMapId, entry.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}```

---
## Файл: ./src/features/journal/JournalTab.tsx
```
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import {
  useCreateJournalLink,
  useDeleteJournalEntry,
  useDeleteJournalLink,
  useJournalEntries,
  useJournalEntry,
  useJournalLinks,
  useLinkTypes,
  useUpdateJournalEntry,
} from '../../shared/api/hooks';
import { useWorkspaceStore } from '../../shared/stores/workspace';
import { usePlayerVisibility } from '../../shared/hooks/usePlayerVisibility';

function MarkdownPreview({ content }: { content: string }) {
  const html = (() => {
    const rawHtml = marked.parse(content || '', {
      async: false,
    }) as string;

    return DOMPurify.sanitize(rawHtml);
  })();

  return (
    <div
      className="journal-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function JournalTab({ entryId }: { entryId?: string }) {
  const { data: entry, isLoading } = useJournalEntry(entryId);
  const { data: allEntries = [] } = useJournalEntries(true);
  const { data: links = [] } = useJournalLinks(entryId);
  const { data: linkTypes = [] } = useLinkTypes(true);

  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();
  const createLink = useCreateJournalLink();
  const deleteLink = useDeleteJournalLink();

  const {
    isGM,
    canSeeJournalEntry,
    canEditJournalEntry,
  } = usePlayerVisibility();

  const visibleEntries = allEntries.filter(canSeeJournalEntry);

  const closeActiveTab = useWorkspaceStore((state) => state.closeActiveTab);
  const renameTabByEntity = useWorkspaceStore(
    (state) => state.renameTabByEntity,
  );

  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [folderPath, setFolderPath] = useState('/');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [isVisibleToPlayers, setIsVisibleToPlayers] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Форма создания связи
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkTargetId, setLinkTargetId] = useState('');
  const [linkType, setLinkType] = useState('reference');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkDirected, setLinkDirected] = useState(true);

  // Определяем, может ли текущий пользователь редактировать эту запись
  const canEdit = entry ? (isGM || canEditJournalEntry(entry)) : false;

  useEffect(() => {
    if (!entry || entry.id === initializedFor) {
      return;
    }

    setTitle(entry.title);
    setFolderPath(entry.folderPath);
    setContentMarkdown(entry.contentMarkdown);
    setIsVisibleToPlayers(entry.visibility === 'players' || entry.visibility === 'public');
    setInitializedFor(entry.id);
  }, [entry, initializedFor]);

  if (!entryId) {
    return (
      <div className="workspace-empty">
        Journal tab is broken: missing entry id.
      </div>
    );
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading journal entry…</div>;
  }

  if (!entry) {
    return <div className="workspace-empty">Journal entry not found.</div>;
  }

  // Проверка видимости (если игрок открыл скрытую запись — показываем ошибку)
  if (!isGM && !canSeeJournalEntry(entry)) {
    return (
      <div className="workspace-empty">
        You don't have permission to view this entry.
      </div>
    );
  }

  const handleSave = () => {
    if (!canEdit) return;

    updateEntry.mutate(
      {
        id: entry.id,
        title: title.trim() || 'Untitled',
        contentMarkdown,
        folderPath,
        visibility: isVisibleToPlayers ? 'players' : 'gm_only',
        playersCanEdit: false,
      },
      {
        onSuccess: () => {
          renameTabByEntity('journal', entry.id, title.trim() || 'Untitled');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!canEdit) return;

    if (!window.confirm('Delete this journal entry?')) {
      return;
    }

    deleteEntry.mutate(
      {
        id: entry.id,
      },
      {
        onSuccess: () => {
          closeActiveTab();
        },
      },
    );
  };

  const handleCreateLink = () => {
    if (!entryId || !linkTargetId) return;
    if (!isGM) return; // Связи может создавать только GM (MVP)

    createLink.mutate(
      {
        sourceEntryId: entryId,
        targetType: 'journal_entry',
        targetId: linkTargetId,
        linkType,
        isDirected: linkDirected,
        label: linkLabel.trim() || null,
      },
      {
        onSuccess: () => {
          setShowLinkForm(false);
          setLinkTargetId('');
          setLinkLabel('');
        },
      },
    );
  };

  const handleDeleteLink = (linkId: string) => {
    if (!isGM) return;

    if (!window.confirm('Delete this link?')) return;

    deleteLink.mutate({
      id: linkId,
      entryId: entry.id,
    });
  };

  const getLinkTypeLabel = (key: string): string => {
    const lt = linkTypes.find((t) => t.key === key);
    return lt?.label ?? key;
  };

  const getEntryName = (id: string): string => {
    const e = visibleEntries.find((x) => x.id === id);
    return e?.title ?? 'Unknown';
  };

  // Записи, которые можно линковать (исключая текущую)
  const linkableEntries = visibleEntries.filter((e) => e.id !== entry.id);

  return (
    <div className="journal-tab">
      <div className="journal-toolbar">
        {/* Заголовок: редактируемый только для тех, кто может редактировать */}
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={!canEdit}
          placeholder="Entry title"
          readOnly={!canEdit}
        />

        {/* Путь к папке: только для GM */}
        {isGM && (
          <input
            type="text"
            value={folderPath}
            onChange={(event) => setFolderPath(event.target.value)}
            placeholder="/folder"
          />
        )}

        {/* Checkbox видимости: только для GM */}
        {isGM && (
          <label className="journal-visible-label">
            <input
              type="checkbox"
              checked={isVisibleToPlayers}
              onChange={(event) =>
                setIsVisibleToPlayers(event.target.checked)
              }
            />
            Visible to players
          </label>
        )}

        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
        >
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>

        {/* Кнопка сохранения: только для тех, кто может редактировать */}
        {canEdit && (
          <button
            type="button"
            onClick={handleSave}
            disabled={updateEntry.isPending}
          >
            {updateEntry.isPending ? 'Saving…' : 'Save'}
          </button>
        )}

        {/* Кнопка удаления: только для GM */}
        {isGM && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteEntry.isPending}
          >
            {deleteEntry.isPending ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>

      <div
        className={
          showPreview
            ? 'journal-editor journal-editor-with-preview'
            : 'journal-editor'
        }
      >
        {/* Textarea: read-only если не может редактировать */}
        <textarea
          className="journal-textarea"
          value={contentMarkdown}
          onChange={(event) => setContentMarkdown(event.target.value)}
          placeholder="# Heading

Write markdown here…"
          readOnly={!canEdit}
        />

        {showPreview && <MarkdownPreview content={contentMarkdown} />}
      </div>

      {/* Секция связей */}
      <div className="journal-links-section">
        <div className="journal-links-header">
          <h4>Links ({links.length})</h4>
          {/* Кнопка добавления связи — только для GM */}
          {isGM && (
            <button
              type="button"
              onClick={() => setShowLinkForm(!showLinkForm)}
            >
              {showLinkForm ? 'Cancel' : '+ Link'}
            </button>
          )}
        </div>

        {showLinkForm && isGM && (
          <div className="journal-link-form">
            <select
              value={linkTargetId}
              onChange={(e) => setLinkTargetId(e.target.value)}
            >
              <option value="">Select target entry…</option>
              {linkableEntries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
            >
              {linkTypes.map((lt) => (
                <option key={lt.key} value={lt.key}>
                  {lt.label}
                  {lt.sourcePluginId ? ' (plugin)' : ''}
                </option>
              ))}
            </select>

            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Label (optional)"
            />

            <label className="journal-link-directed">
              <input
                type="checkbox"
                checked={linkDirected}
                onChange={(e) => setLinkDirected(e.target.checked)}
              />
              Directed
            </label>

            <button
              type="button"
              onClick={handleCreateLink}
              disabled={!linkTargetId || createLink.isPending}
            >
              {createLink.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        )}

        <div className="journal-links-list">
          {links.length === 0 && !showLinkForm && (
            <div className="empty-state">No links yet.</div>
          )}

          {links
            .filter((link) => isGM || link.isVisibleToPlayers)
            .map((link) => {
              const isOutgoing = link.sourceEntryId === entry.id;
              const otherEntryId = isOutgoing
                ? link.targetId
                : link.sourceEntryId;

              return (
                <div key={link.id} className="journal-link-item">
                  <span className="journal-link-direction">
                    {isOutgoing ? '→' : '←'}
                  </span>

                  <span className="journal-link-type">
                    {getLinkTypeLabel(link.linkType)}
                  </span>

                  <span className="journal-link-target">
                    {getEntryName(otherEntryId)}
                  </span>

                  {link.label && (
                    <span className="journal-link-label">
                      ({link.label})
                    </span>
                  )}

                  {!link.isDirected && (
                    <span className="journal-link-undirected">↔</span>
                  )}

                  {/* Кнопка удаления — только для GM */}
                  {isGM && (
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleDeleteLink(link.id)}
                      title="Delete link"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}```

---
## Файл: ./src/features/map/CreateMapModal.tsx
```
import { useState, type FormEvent } from 'react';

import { useCreateMap } from '../../shared/api/hooks';
import { Modal } from '../../shared/ui/Modal';

interface CreateMapModalProps {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
}

export function CreateMapModal({
  open,
  onClose,
  defaultName = '',
}: CreateMapModalProps) {
  const createMap = useCreateMap();

  const [name, setName] = useState(defaultName);
  const [width, setWidth] = useState(2000);
  const [height, setHeight] = useState(1500);
  const [gridSize, setGridSize] = useState(50);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;
    if (width < 100 || width > 16384) return;
    if (height < 100 || height > 16384) return;
    if (gridSize < 5 || gridSize > 500) return;

    createMap.mutate(
      {
        name: name.trim(),
        width,
        height,
        grid_size: gridSize,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      },
    );
  };

  const handleClose = () => {
    if (!createMap.isPending) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setWidth(2000);
    setHeight(1500);
    setGridSize(50);
  };

  const isValid =
    name.trim().length > 0 &&
    width >= 100 &&
    width <= 16384 &&
    height >= 100 &&
    height <= 16384 &&
    gridSize >= 5 &&
    gridSize <= 500;

  return (
    <Modal
      open={open}
      title="Create New Map"
      onClose={handleClose}
      width={440}
      footer={
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={createMap.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-map-form"
            className="btn-primary"
            disabled={!isValid || createMap.isPending}
          >
            {createMap.isPending ? 'Creating…' : 'Create Map'}
          </button>
        </>
      }
    >
      <form id="create-map-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="map-name">Name</label>
          <input
            id="map-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Battle of the Bridge"
            autoFocus
            maxLength={100}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="map-width">Width (px)</label>
            <input
              id="map-width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={100}
              max={16384}
            />
            {width < 100 && (
              <span className="form-error">Min 100px</span>
            )}
            {width > 16384 && (
              <span className="form-error">Max 16384px</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="map-height">Height (px)</label>
            <input
              id="map-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={100}
              max={16384}
            />
            {height < 100 && (
              <span className="form-error">Min 100px</span>
            )}
            {height > 16384 && (
              <span className="form-error">Max 16384px</span>
            )}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="map-grid">Grid Size (px)</label>
          <input
            id="map-grid"
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            min={5}
            max={500}
          />
          <span className="form-hint">
            Tokens are sized relative to grid size. Recommended: width / 30.
          </span>
          {gridSize < 5 && (
            <span className="form-error">Min 5px</span>
          )}
          {gridSize > 500 && (
            <span className="form-error">Max 500px</span>
          )}
        </div>

        <div className="form-preview">
          <div
            className="form-preview-ratio"
            style={{
              aspectRatio: `${width} / ${height}`,
            }}
          >
            <span>
              {width} × {height}
            </span>
          </div>
          <span className="form-hint">
            ~{Math.round(width / gridSize)}×{Math.round(height / gridSize)} cells
          </span>
        </div>
      </form>
    </Modal>
  );
}
```

---
## Файл: ./src/features/map/MapCanvas.tsx
```
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useAssetDataUrl } from '../../shared/api/hooks';
import type { MapSummary, TokenSummary } from '../../shared/api/bindings';
import { useDropTarget } from '../../shared/hooks/useDropTarget';
import { useDragStore } from '../../shared/stores/drag';

interface Viewport {
    x: number;
    y: number;
    scale: number;
}

export type FogMode = 'none' | 'add' | 'remove';

interface MapCanvasProps {
    map: MapSummary;
    tokens?: TokenSummary[];
    selectedTokenId?: string | null;
    onSelectToken?: (tokenId: string | null) => void;
    onMoveToken?: (tokenId: string, x: number, y: number) => Promise<void>;
    showGrid?: boolean;

    fogCells?: Set<string>; // Формат "x,y"
    fogMode?: FogMode;
    hpFormatter?: (current: number, max: number, isMonster: boolean) => string;
    onFogChange?: (cells: Set<string>) => void;
    onCreateTokenWithCharacter?: (x: number, y: number, characterId: string) => void;
}

type DragState =
    | {
        kind: 'pan';
        pointerId: number;
        startX: number;
        startY: number;
        origin: Viewport;
    }
    | {
        kind: 'token';
        pointerId: number;
        tokenId: string;
        offsetX: number;
        offsetY: number;
        sessionId: number;
    };

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;

function clampScale(scale: number): number {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function getCssVar(name: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    return value || fallback;
}

function hashString(input: string): number {
    let hash = 0;

    for (let index = 0; index < input.length; index += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
}

function tokenColor(tokenId: string): string {
    const hue = hashString(tokenId) % 360;

    return `hsl(${hue}, 70%, 52%)`;
}

function characterInitials(name: string): string {
    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
        return (
            (parts[0][0] ?? '') + (parts[1][0] ?? '')
        ).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
}

export function MapCanvas({
    map,
    tokens = [],
    selectedTokenId = null,
    onSelectToken,
    onMoveToken,
    showGrid = true,
    fogCells = new Set(),
    fogMode = 'none',
    onFogChange,
    onCreateTokenWithCharacter
}: MapCanvasProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const dragSessionRef = useRef(0);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    const [viewport, setViewport] = useState<Viewport | null>(null);
    const [themeVersion, setThemeVersion] = useState(0);
    const [imageVersion, setImageVersion] = useState(0);

    const [dragTokenPosition, setDragTokenPosition] = useState<{
        tokenId: string;
        x: number;
        y: number;
    } | null>(null);

    const dragRef = useRef<DragState | null>(null);
    const fittedMapIdRef = useRef<string | null>(null);
    const fogDragRef = useRef<{
        pointerId: number;
        mode: 'add' | 'remove';
        modified: Set<string>;
    } | null>(null);

    const { data: assetDataUrl } = useAssetDataUrl(map.assetId ?? undefined);
    const tokenRadius = Math.max(10, (map.gridSize || 50) * 0.45);


    const { ref: dropRef, isOver, isAccepting } = useDropTarget({
        target: { kind: 'map-canvas', id: map.id },
        accepts: (item) => item.kind === 'character' && Boolean(onCreateTokenWithCharacter),
        onDrop: (item, target) => {
            if (!onCreateTokenWithCharacter || !containerRef.current || !viewport) return;

            // Получаем pointer из DragStore для точных координат
            const pointer = useDragStore.getState().pointer;
            if (!pointer) return;

            const rect = containerRef.current.getBoundingClientRect();
            const pointerX = pointer.x - rect.left;
            const pointerY = pointer.y - rect.top;

            const worldX = (pointerX - viewport.x) / viewport.scale;
            const worldY = (pointerY - viewport.y) / viewport.scale;

            onCreateTokenWithCharacter(worldX, worldY, item.id);
        },
    });

    // Объединяем ref'ы (containerRef + dropRef)
    const setContainerRef = useCallback(
        (el: HTMLDivElement | null) => {
            containerRef.current = el;
            dropRef(el);
        },
        [dropRef],
    );

    const fit = useCallback(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) {
            return;
        }

        const scale = clampScale(
            Math.min(width / map.width, height / map.height) * 0.9,
        );

        setViewport({
            scale,
            x: (width - map.width * scale) / 2,
            y: (height - map.height * scale) / 2,
        });
    }, [map.width, map.height]);

    const zoomAt = useCallback(
        (clientX: number, clientY: number, factor: number) => {
            const container = containerRef.current;

            if (!container) {
                return;
            }

            const rect = container.getBoundingClientRect();

            const pointerX = clientX - rect.left;
            const pointerY = clientY - rect.top;

            setViewport((prev) => {
                if (!prev) {
                    return prev;
                }

                const scale = clampScale(prev.scale * factor);

                const worldX = (pointerX - prev.x) / prev.scale;
                const worldY = (pointerY - prev.y) / prev.scale;

                return {
                    scale,
                    x: pointerX - worldX * scale,
                    y: pointerY - worldY * scale,
                };
            });
        },
        [],
    );

    const zoomCenter = useCallback(
        (factor: number) => {
            const container = containerRef.current;

            if (!container) {
                return;
            }

            const rect = container.getBoundingClientRect();

            zoomAt(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                factor,
            );
        },
        [zoomAt],
    );

    const screenToWorld = useCallback(
        (clientX: number, clientY: number) => {
            const container = containerRef.current;

            if (!container || !viewport) {
                return {
                    x: 0,
                    y: 0,
                };
            }

            const rect = container.getBoundingClientRect();

            const pointerX = clientX - rect.left;
            const pointerY = clientY - rect.top;

            return {
                x: (pointerX - viewport.x) / viewport.scale,
                y: (pointerY - viewport.y) / viewport.scale,
            };
        },
        [viewport],
    );

    const getTokenPosition = useCallback(
        (token: TokenSummary) => {
            if (dragTokenPosition?.tokenId === token.id) {
                return {
                    x: dragTokenPosition.x,
                    y: dragTokenPosition.y,
                };
            }

            return {
                x: token.x,
                y: token.y,
            };
        },
        [dragTokenPosition],
    );

    const findTokenAt = useCallback(
        (worldX: number, worldY: number): TokenSummary | null => {
            const reversed = [...tokens].reverse();

            for (const token of reversed) {
                const position = getTokenPosition(token);

                const dx = worldX - (position.x != null ? position.x : 0);
                const dy = worldY - (position.y != null ? position.y : 0);

                if (dx * dx + dy * dy <= tokenRadius * tokenRadius) {
                    return token;
                }
            }

            return null;
        },
        [tokens, tokenRadius, getTokenPosition],
    );

    // Отслеживаем размер контейнера.
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];

            if (!entry) {
                return;
            }

            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    // Первичный fit для текущей карты.
    useEffect(() => {
        if (
            size.width > 0 &&
            size.height > 0 &&
            fittedMapIdRef.current !== map.id
        ) {
            fittedMapIdRef.current = map.id;
            fit();
        }
    }, [size.width, size.height, map.id, fit]);

    // Wheel zoom.
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();

            const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

            zoomAt(event.clientX, event.clientY, factor);
        };

        container.addEventListener('wheel', onWheel, {
            passive: false,
        });

        return () => {
            container.removeEventListener('wheel', onWheel);
        };
    }, [zoomAt]);

    // Перерисовка при смене темы.
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setThemeVersion((version) => version + 1);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    // Загрузка изображения карты.
    useEffect(() => {
        let cancelled = false;

        imageRef.current = null;
        setImageVersion((version) => version + 1);

        if (!assetDataUrl) {
            return;
        }

        const image = new Image();

        image.onload = () => {
            if (cancelled) return;
            imageRef.current = image;
            setImageVersion((version) => version + 1);
        };

        image.onerror = () => {
            if (cancelled) return;
            imageRef.current = null;
            setImageVersion((version) => version + 1);
        };

        image.src = assetDataUrl;

        return () => {
            cancelled = true;
        };
    }, [assetDataUrl]);

    // Отрисовка.
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        if (!size.width || !size.height || !viewport) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(size.width * dpr));
        canvas.height = Math.max(1, Math.floor(size.height * dpr));

        canvas.style.width = `${size.width}px`;
        canvas.style.height = `${size.height}px`;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size.width, size.height);

        const gridColor = getCssVar(
            '--border-gold',
            'rgba(212, 175, 55, 0.25)',
        );

        const borderColor = getCssVar(
            '--border-gold-strong',
            'rgba(212, 175, 55, 0.55)',
        );

        const selectedColor = getCssVar('--accent', '#7c5cff');

        ctx.save();

        ctx.translate(viewport.x, viewport.y);
        ctx.scale(viewport.scale, viewport.scale);

        // Область карты.
        const mapImage = imageRef.current;

        if (mapImage && mapImage.complete && mapImage.naturalWidth > 0) {
            ctx.drawImage(mapImage, 0, 0, map.width, map.height);
        } else {
            ctx.fillStyle = 'rgba(128, 128, 160, 0.06)';
            ctx.fillRect(0, 0, map.width, map.height);
        }

        // Сетка.
        if (showGrid) {
            const gridSize = map.gridSize > 0 ? map.gridSize : 50;

            let gridStep = gridSize;
            const screenStep = gridStep * viewport.scale;

            if (screenStep < 8) {
                gridStep *= Math.ceil(8 / screenStep);
            }

            ctx.beginPath();
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1 / viewport.scale;

            for (let x = 0; x <= map.width; x += gridStep) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, map.height);
            }

            for (let y = 0; y <= map.height; y += gridStep) {
                ctx.moveTo(0, y);
                ctx.lineTo(map.width, y);
            }

            ctx.stroke();
        }

        // Граница карты.
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2 / viewport.scale;
        ctx.strokeRect(0, 0, map.width, map.height);

        // Токены.
        const labelByTokenId = new Map<string, string>();

        tokens.forEach((token, index) => {
            const label = token.characterName
                ? characterInitials(token.characterName)
                : String(index + 1);

            labelByTokenId.set(token.id, label);
        });

        const normalTokens = tokens.filter(
            (token) => token.id !== dragTokenPosition?.tokenId,
        );

        const draggingToken = tokens.find(
            (token) => token.id === dragTokenPosition?.tokenId,
        );

        const drawToken = (token: TokenSummary) => {
            const position = getTokenPosition(token);
            const isSelected = token.id === selectedTokenId;
            const label = labelByTokenId.get(token.id) ?? '';

            ctx.beginPath();
            ctx.arc((position.x != null ? position.x : 0), (position.y != null ? position.y : 0), tokenRadius, 0, Math.PI * 2);

            ctx.fillStyle = tokenColor(token.id);
            ctx.globalAlpha = token.isVisible ? 0.92 : 0.35;
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.strokeStyle = isSelected
                ? selectedColor
                : 'rgba(0, 0, 0, 0.55)';

            ctx.lineWidth = (isSelected ? 3 : 1.5) / viewport.scale;
            ctx.stroke();

            ctx.font = `${tokenRadius * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';

            ctx.fillText(label, (position.x != null ? position.x : 0), (position.y != null ? position.y : 0));
        };

        for (const token of normalTokens) {
            drawToken(token);
        }

        if (draggingToken) {
            drawToken(draggingToken);
        }

        // Туман войны
        if (fogCells.size > 0) {
            ctx.fillStyle = 'rgba(10, 12, 18, 0.85)';

            ctx.beginPath();

            const gridSize = map.gridSize > 0 ? map.gridSize : 50;

            fogCells.forEach((cellKey) => {
                const [xStr, yStr] = cellKey.split(',');
                const cellX = Number.parseInt(xStr, 10);
                const cellY = Number.parseInt(yStr, 10);

                ctx.rect(
                    cellX * gridSize,
                    cellY * gridSize,
                    gridSize,
                    gridSize
                );
            });

            ctx.fill();

            // Обводка для красоты (опционально)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1 / viewport.scale;
            ctx.stroke();
        }

        ctx.restore();
    }, [
        size.width,
        size.height,
        viewport,
        map.id,
        map.width,
        map.height,
        map.gridSize,
        tokens,
        selectedTokenId,
        dragTokenPosition,
        tokenRadius,
        themeVersion,
        imageVersion,
        getTokenPosition,
        showGrid,
        fogCells,
    ]);
    const getCellKey = (worldX: number, worldY: number): string => {
        const gridSize = map.gridSize > 0 ? map.gridSize : 50;
        const cellX = Math.floor(worldX / gridSize);
        const cellY = Math.floor(worldY / gridSize);
        return `${cellX},${cellY}`;
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 && event.button !== 1 && event.button !== 2) return;
        if (!viewport) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        const world = screenToWorld(event.clientX, event.clientY);

        // РЕЖИМ ТУМАНА
        if (fogMode !== 'none' && event.button === 0) {
            event.preventDefault();
            const key = getCellKey(world.x, world.y);
            const newCells = new Set(fogCells);

            if (fogMode === 'add') {
                newCells.add(key);
            } else {
                newCells.delete(key);
            }

            fogDragRef.current = {
                pointerId: event.pointerId,
                mode: fogMode,
                modified: newCells,
            };

            // Мгновенно обновляем UI
            onFogChange?.(newCells);
            return;
        }

        // ОБЫЧНЫЙ РЕЖИМ (Токены и Панорамирование)
        if (event.button === 1) event.preventDefault();

        const hitToken = findTokenAt(world.x, world.y);

        if (hitToken && event.button === 0) {
            onSelectToken?.(hitToken.id);
            const position = getTokenPosition(hitToken);
            const sessionId = ++dragSessionRef.current;

            dragRef.current = {
                kind: 'token',
                pointerId: event.pointerId,
                tokenId: hitToken.id,
                offsetX: world.x - (position.x != null ? position.x : 0),
                offsetY: world.y - (position.y != null ? position.y : 0),
                sessionId,
            };
            return;
        }

        onSelectToken?.(null);

        dragRef.current = {
            kind: 'pan',
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            origin: viewport,
        };
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        // ТУМАН
        const fogDrag = fogDragRef.current;
        if (fogDrag && fogDrag.pointerId === event.pointerId) {
            const world = screenToWorld(event.clientX, event.clientY);
            const key = getCellKey(world.x, world.y);

            if (fogDrag.mode === 'add') {
                fogDrag.modified.add(key);
            } else {
                fogDrag.modified.delete(key);
            }

            onFogChange?.(fogDrag.modified);
            return;
        }

        // ТОКЕНЫ И ПАНОРАМИРОВАНИЕ
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        if (drag.kind === 'pan') {
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            setViewport({ ...drag.origin, x: drag.origin.x + dx, y: drag.origin.y + dy });
            return;
        }

        if (drag.kind === 'token') {
            const world = screenToWorld(event.clientX, event.clientY);
            const x = clampNumber(world.x - drag.offsetX, 0, map.width);
            const y = clampNumber(world.y - drag.offsetY, 0, map.height);
            setDragTokenPosition({ tokenId: drag.tokenId, x, y });
        }
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        // ТУМАН
        if (fogDragRef.current?.pointerId === event.pointerId) {
            fogDragRef.current = null;
            // onFogChange уже вызывался, сохранение в БД сделает MapTab через debounce
            return;
        }

        // ТОКЕНЫ
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        if (drag.kind === 'token') {
            const world = screenToWorld(event.clientX, event.clientY);
            const x = clampNumber(world.x - drag.offsetX, 0, map.width);
            const y = clampNumber(world.y - drag.offsetY, 0, map.height);

            const session = drag.sessionId;

            if (onMoveToken) {
                onMoveToken(drag.tokenId, x, y)
                    .catch(() => { })
                    .finally(() => {
                        if (dragSessionRef.current === session) {
                            setDragTokenPosition(null);
                        }
                    });
            } else {
                setDragTokenPosition(null);
            }
        }

        dragRef.current = null;
    };

    return (
        <div className="map-canvas-wrapper">
            <div
                ref={setContainerRef}
                className={`map-canvas-container ${isOver && isAccepting ? 'drop-target' : ''
                    }`}
                style={{
                    cursor: fogMode !== 'none' ? 'crosshair' : undefined,
                }}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <canvas ref={canvasRef} className="map-canvas" />
            </div>

            <div className="map-canvas-controls">
                <button
                    type="button"
                    onClick={() => zoomCenter(1 / 1.2)}
                    title="Zoom out"
                >
                    −
                </button>

                <span className="map-canvas-zoom">
                    {Math.round((viewport?.scale ?? 1) * 100)}%
                </span>

                <button
                    type="button"
                    onClick={() => zoomCenter(1.2)}
                    title="Zoom in"
                >
                    +
                </button>

                <button type="button" onClick={fit} title="Fit map">
                    Fit
                </button>
            </div>
        </div>
    );
}```

---
## Файл: ./src/features/map/MapImageImportDialog.tsx
```
import { useCallback, useEffect, useRef, useState } from 'react';

import { useReadFileAsDataUrl } from '../../shared/api/hooks';
import type { MapImageImportOptions } from '../../shared/api/hooks';

interface MapImageImportDialogProps {
    sourcePath: string;
    onConfirm: (options: MapImageImportOptions) => void;
    onCancel: () => void;
    isImporting: boolean;
}

export function MapImageImportDialog({
    sourcePath,
    onConfirm,
    onCancel,
    isImporting,
}: MapImageImportDialogProps) {
    const readFile = useReadFileAsDataUrl();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Оригинальные размеры изображения
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);

    // Целевые размеры карты
    const [targetWidth, setTargetWidth] = useState(2000);
    const [targetHeight, setTargetHeight] = useState(1500);

    // Размер сетки
    const [gridSize, setGridSize] = useState(50);

    // Crop
    const [cropEnabled, setCropEnabled] = useState(false);
    const [cropX, setCropX] = useState(0);
    const [cropY, setCropY] = useState(0);
    const [cropWidth, setCropWidth] = useState(0);
    const [cropHeight, setCropHeight] = useState(0);

    // Показ тестовых токенов
    const [showTokens, setShowTokens] = useState(true);

    // Масштаб превью (для расчётов)
    const previewScaleRef = useRef(1);

    // Drag state для crop
    const dragRef = useRef<{
        mode: 'move' | 'resize';
        startX: number;
        startY: number;
        startCropX: number;
        startCropY: number;
        startCropW: number;
        startCropH: number;
    } | null>(null);

    // Загрузка превью
    useEffect(() => {
        readFile.mutate(sourcePath, {
            onSuccess: (dataUrl) => {
                const img = new Image();
                img.onload = () => {
                    imageRef.current = img;
                    setOriginalWidth(img.width);
                    setOriginalHeight(img.height);

                    setTargetWidth(img.width);
                    setTargetHeight(img.height);

                    setCropX(0);
                    setCropY(0);
                    setCropWidth(img.width);
                    setCropHeight(img.height);

                    drawPreview(img);
                };
                img.src = dataUrl;
            },
        });
    }, [sourcePath]);

    const drawPreview = useCallback(
        (img: HTMLImageElement) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const maxPreviewWidth = 640;
            const maxPreviewHeight = 440;

            const scale = Math.min(
                maxPreviewWidth / img.width,
                maxPreviewHeight / img.height,
                1,
            );

            previewScaleRef.current = scale;

            const previewWidth = Math.floor(img.width * scale);
            const previewHeight = Math.floor(img.height * scale);

            canvas.width = previewWidth;
            canvas.height = previewHeight;

            // Фон
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, previewWidth, previewHeight);

            // Изображение
            ctx.drawImage(img, 0, 0, previewWidth, previewHeight);

            // Затемнение вне crop
            if (cropEnabled) {
                const sx = cropX * scale;
                const sy = cropY * scale;
                const sw = cropWidth * scale;
                const sh = cropHeight * scale;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

                ctx.fillRect(0, 0, previewWidth, sy);
                ctx.fillRect(0, sy + sh, previewWidth, previewHeight - sy - sh);
                ctx.fillRect(0, sy, sx, sh);
                ctx.fillRect(sx + sw, sy, previewWidth - sx - sw, sh);
            }

            // Сетка (только в области crop или по всему изображению)
            const gridStep = gridSize * scale;

            if (gridStep > 3) {
                // Minor grid lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.5;

                const startX = cropEnabled ? cropX * scale : 0;
                const startY = cropEnabled ? cropY * scale : 0;
                const endX = cropEnabled ? (cropX + cropWidth) * scale : previewWidth;
                const endY = cropEnabled ? (cropY + cropHeight) * scale : previewHeight;

                for (let x = startX; x <= endX; x += gridStep) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }

                for (let y = startY; y <= endY; y += gridStep) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }

                // Major grid lines (каждая 5-я)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.lineWidth = 1;

                const majorStep = gridStep * 5;

                for (let x = startX; x <= endX; x += majorStep) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }

                for (let y = startY; y <= endY; y += majorStep) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }
            }

            // Тестовые токены
            if (showTokens && gridStep > 4) {
                const tokenRadius = gridStep * 0.4;

                const effectiveW = cropEnabled ? cropWidth * scale : previewWidth;
                const effectiveH = cropEnabled ? cropHeight * scale : previewHeight;
                const offsetX = cropEnabled ? cropX * scale : 0;
                const offsetY = cropEnabled ? cropY * scale : 0;

                // Позиции токенов (относительно области)
                const tokenPositions = [
                    { x: 0.25, y: 0.25, color: '#4FC3F7' },
                    { x: 0.5, y: 0.5, color: '#EF5350' },
                    { x: 0.75, y: 0.25, color: '#66BB6A' },
                    { x: 0.25, y: 0.75, color: '#FFA726' },
                    { x: 0.75, y: 0.75, color: '#AB47BC' },
                ];

                tokenPositions.forEach((pos) => {
                    const tx = offsetX + effectiveW * pos.x;
                    const ty = offsetY + effectiveH * pos.y;

                    // Тень
                    ctx.beginPath();
                    ctx.arc(tx + 2, ty + 2, tokenRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fill();

                    // Токен
                    ctx.beginPath();
                    ctx.arc(tx, ty, tokenRadius, 0, Math.PI * 2);
                    ctx.fillStyle = pos.color;
                    ctx.fill();

                    // Обводка
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Блик
                    ctx.beginPath();
                    ctx.arc(tx - tokenRadius * 0.3, ty - tokenRadius * 0.3, tokenRadius * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fill();
                });
            }

            // Рамка crop
            if (cropEnabled) {
                const sx = cropX * scale;
                const sy = cropY * scale;
                const sw = cropWidth * scale;
                const sh = cropHeight * scale;

                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 3]);
                ctx.strokeRect(sx, sy, sw, sh);
                ctx.setLineDash([]);

                // Уголки для resize
                const cornerSize = 8;
                ctx.fillStyle = '#FFD700';

                // Top-left
                ctx.fillRect(sx - cornerSize / 2, sy - cornerSize / 2, cornerSize, cornerSize);
                // Top-right
                ctx.fillRect(sx + sw - cornerSize / 2, sy - cornerSize / 2, cornerSize, cornerSize);
                // Bottom-left
                ctx.fillRect(sx - cornerSize / 2, sy + sh - cornerSize / 2, cornerSize, cornerSize);
                // Bottom-right
                ctx.fillRect(sx + sw - cornerSize / 2, sy + sh - cornerSize / 2, cornerSize, cornerSize);
            }

            // Легенда
            const legendY = previewHeight - 30;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, legendY, previewWidth, 30);

            ctx.fillStyle = '#ffffff';
            ctx.font = '11px sans-serif';
            ctx.textBaseline = 'middle';

            const effectiveW = cropEnabled ? cropWidth : img.width;
            const effectiveH = cropEnabled ? cropHeight : img.height;
            const cols = Math.floor(effectiveW / gridSize);
            const rows = Math.floor(effectiveH / gridSize);

            ctx.fillText(
                `Grid: ${gridSize}px | Cells: ${cols}×${rows} | Token ≈ ${gridSize}px | Target: ${targetWidth}×${targetHeight}`,
                10,
                legendY + 15,
            );
        },
        [
            gridSize,
            cropEnabled,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            showTokens,
            targetWidth,
            targetHeight,
        ],
    );

    // Перерисовка
    useEffect(() => {
        if (imageRef.current) {
            drawPreview(imageRef.current);
        }
    }, [drawPreview]);

    // Mouse handlers для crop drag
    const getCanvasCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / previewScaleRef.current,
            y: (e.clientY - rect.top) / previewScaleRef.current,
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!cropEnabled) return;

        const { x, y } = getCanvasCoords(e);

        // Проверяем, попали ли в область crop
        const inCrop =
            x >= cropX && x <= cropX + cropWidth &&
            y >= cropY && y <= cropY + cropHeight;

        // Проверяем уголки для resize
        const cornerThreshold = 12 / previewScaleRef.current;
        const nearCorner =
            Math.abs(x - cropX) < cornerThreshold && Math.abs(y - cropY) < cornerThreshold ||
            Math.abs(x - (cropX + cropWidth)) < cornerThreshold && Math.abs(y - cropY) < cornerThreshold ||
            Math.abs(x - cropX) < cornerThreshold && Math.abs(y - (cropY + cropHeight)) < cornerThreshold ||
            Math.abs(x - (cropX + cropWidth)) < cornerThreshold && Math.abs(y - (cropY + cropHeight)) < cornerThreshold;

        if (nearCorner) {
            dragRef.current = {
                mode: 'resize',
                startX: x,
                startY: y,
                startCropX: cropX,
                startCropY: cropY,
                startCropW: cropWidth,
                startCropH: cropHeight,
            };
        } else if (inCrop) {
            dragRef.current = {
                mode: 'move',
                startX: x,
                startY: y,
                startCropX: cropX,
                startCropY: cropY,
                startCropW: cropWidth,
                startCropH: cropHeight,
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragRef.current || !cropEnabled) return;

        const { x, y } = getCanvasCoords(e);
        const drag = dragRef.current;

        const dx = x - drag.startX;
        const dy = y - drag.startY;

        if (drag.mode === 'move') {
            const newX = Math.max(0, Math.min(drag.startCropX + dx, originalWidth - cropWidth));
            const newY = Math.max(0, Math.min(drag.startCropY + dy, originalHeight - cropHeight));
            setCropX(Math.round(newX));
            setCropY(Math.round(newY));
        } else if (drag.mode === 'resize') {
            const newW = Math.max(50, Math.min(drag.startCropW + dx, originalWidth - cropX));
            const newH = Math.max(50, Math.min(drag.startCropH + dy, originalHeight - cropY));
            setCropWidth(Math.round(newW));
            setCropHeight(Math.round(newH));
        }
    };

    const handleMouseUp = () => {
        if (dragRef.current && cropEnabled) {
            setCropX((prev) => {
                const clamped = Math.max(0, Math.min(prev, originalWidth - 1));
                setCropWidth((prevW) => Math.min(prevW, originalWidth - clamped));
                return clamped;
            });
            setCropY((prev) => {
                const clamped = Math.max(0, Math.min(prev, originalHeight - 1));
                setCropHeight((prevH) => Math.min(prevH, originalHeight - clamped));
                return clamped;
            });
        }
    };

    const handleConfirm = () => {
        const options: MapImageImportOptions = {
            targetWidth,
            targetHeight,
            gridSize,
            cropX: null,
            cropY: null,
            cropWidth: null,
            cropHeight: null
        };

        if (cropEnabled) {
            // Финальный clamp перед отправкой
            const safeCropX = Math.max(0, Math.min(cropX, originalWidth - 1));
            const safeCropY = Math.max(0, Math.min(cropY, originalHeight - 1));
            const safeCropW = Math.max(1, Math.min(cropWidth, originalWidth - safeCropX));
            const safeCropH = Math.max(1, Math.min(cropHeight, originalHeight - safeCropY));

            options.cropX = safeCropX;
            options.cropY = safeCropY;
            options.cropWidth = safeCropW;
            options.cropHeight = safeCropH;
        }

        onConfirm(options);
    };

    const handleAutoFitGrid = () => {
        const effectiveWidth = cropEnabled ? cropWidth : originalWidth;
        const suggestedGrid = Math.round(effectiveWidth / 30);
        setGridSize(Math.max(10, suggestedGrid));
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-content dialog-map-import">
                <div className="dialog-header">
                    <h3>Import Map Image</h3>
                    <button type="button" className="icon-btn" onClick={onCancel}>
                        ×
                    </button>
                </div>

                <div className="dialog-body">
                    {/* Превью */}
                    <div className="map-import-preview">
                        {readFile.isPending ? (
                            <div className="empty-state">Loading preview…</div>
                        ) : (
                            <canvas
                                ref={canvasRef}
                                className="map-import-canvas"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{
                                    cursor: cropEnabled ? (dragRef.current ? 'grabbing' : 'grab') : 'default',
                                }}
                            />
                        )}
                    </div>

                    {/* Информация */}
                    <div className="map-import-info">
                        <span>
                            Original: {originalWidth} × {originalHeight}px
                        </span>
                        {cropEnabled && (
                            <span>
                                Crop: {cropWidth} × {cropHeight}px at ({cropX}, {cropY})
                            </span>
                        )}
                    </div>

                    {/* Настройки */}
                    <div className="map-import-settings">
                        <div className="map-import-row">
                            <label>
                                Map Width (px)
                                <input
                                    type="number"
                                    value={targetWidth}
                                    min={100}
                                    max={16384}
                                    onChange={(e) => setTargetWidth(Number(e.target.value) || 100)}
                                />
                            </label>

                            <label>
                                Map Height (px)
                                <input
                                    type="number"
                                    value={targetHeight}
                                    min={100}
                                    max={16384}
                                    onChange={(e) => setTargetHeight(Number(e.target.value) || 100)}
                                />
                            </label>
                        </div>

                        <div className="map-import-row">
                            <label>
                                Grid Size (px)
                                <input
                                    type="number"
                                    value={gridSize}
                                    min={5}
                                    max={500}
                                    onChange={(e) => setGridSize(Number(e.target.value) || 50)}
                                />
                            </label>

                            <button type="button" onClick={handleAutoFitGrid}>
                                Auto-fit
                            </button>

                            <label className="map-import-checkbox">
                                <input
                                    type="checkbox"
                                    checked={showTokens}
                                    onChange={(e) => setShowTokens(e.target.checked)}
                                />
                                Show test tokens
                            </label>
                        </div>

                        {/* Crop */}
                        <div className="map-import-row">
                            <label className="map-import-checkbox">
                                <input
                                    type="checkbox"
                                    checked={cropEnabled}
                                    onChange={(e) => setCropEnabled(e.target.checked)}
                                />
                                Crop image
                            </label>

                            {cropEnabled && (
                                <span className="map-import-hint-inline">
                                    Drag to move, corners to resize
                                </span>
                            )}
                        </div>

                        {cropEnabled && (
                            <div className="map-import-row map-import-crop-fields">
                                <label>
                                    X
                                    <input
                                        type="number"
                                        value={cropX}
                                        min={0}
                                        max={originalWidth - 1}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(Number(e.target.value) || 0, originalWidth - 1));
                                            setCropX(val);
                                            // Уменьшаем ширину если выходим за границы
                                            if (val + cropWidth > originalWidth) {
                                                setCropWidth(originalWidth - val);
                                            }
                                        }}
                                    />
                                </label>
                                <label>
                                    Y
                                    <input
                                        type="number"
                                        value={cropY}
                                        min={0}
                                        max={originalHeight - 1}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(Number(e.target.value) || 0, originalHeight - 1));
                                            setCropY(val);
                                            if (val + cropHeight > originalHeight) {
                                                setCropHeight(originalHeight - val);
                                            }
                                        }}
                                    />
                                </label>
                                <label>
                                    Width
                                    <input
                                        type="number"
                                        value={cropWidth}
                                        min={50}
                                        max={originalWidth - cropX}
                                        onChange={(e) => {
                                            const val = Math.max(50, Math.min(Number(e.target.value) || 50, originalWidth - cropX));
                                            setCropWidth(val);
                                        }}
                                    />
                                </label>
                                <label>
                                    Height
                                    <input
                                        type="number"
                                        value={cropHeight}
                                        min={50}
                                        max={originalHeight - cropY}
                                        onChange={(e) => {
                                            const val = Math.max(50, Math.min(Number(e.target.value) || 50, originalHeight - cropY));
                                            setCropHeight(val);
                                        }}
                                    />
                                </label>
                            </div>
                        )}

                        {/* Подсказка */}
                        <div className="map-import-hint">
                            Tokens are sized relative to grid_size. Recommended: grid_size ≈
                            map_width / 30 for ~30 cells across. Test tokens show approximate
                            token size on the map.
                        </div>
                    </div>
                </div>

                <div className="dialog-footer">
                    <button type="button" onClick={onCancel} disabled={isImporting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isImporting || readFile.isPending}
                    >
                        {isImporting ? 'Importing…' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}```

---
## Файл: ./src/features/map/MapTab.tsx
```
import { useCallback, useEffect, useRef, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

import {
  useActiveScene,
  useCharacters,
  useCreateToken,
  useDeleteToken,
  useImportMapImage,
  useMap,
  useMoveToken,
  useSetActiveScene,
  useSetMapVisibleToPlayers,
  useTokens,
} from '../../shared/api/hooks';
import { useMapSettingsStore } from '../../shared/stores/mapSettings';
import { useTableStore } from '../../shared/stores/table';
import { relayClient } from '../../shared/services/relayClient';

import { MapCanvas } from './MapCanvas';
import { MapImageImportDialog } from './MapImageImportDialog';
import type { MapImageImportOptions } from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';
import { usePlayerVisibility } from '../../shared/hooks/usePlayerVisibility';


export function MapTab({ mapId }: { mapId?: string }) {
  const { data: map, isLoading } = useMap(mapId);
  const { data: tokens = [] } = useTokens(mapId);
  const { data: characters = [] } = useCharacters(Boolean(mapId));

  const createToken = useCreateToken();
  const moveToken = useMoveToken();
  const deleteToken = useDeleteToken();
  const importMapImage = useImportMapImage();
  const { canSeeToken } = usePlayerVisibility();

  const showGridByMap = useMapSettingsStore((state) => state.showGridByMap);
  const toggleGrid = useMapSettingsStore((state) => state.toggleGrid);


  const setSelectedMapId = useTableStore((state) => state.setSelectedMapId);
  const setSelectedTokenIdGlobal = useTableStore(
    (state) => state.setSelectedTokenId,
  );

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [pendingDeleteTokenIds, setPendingDeleteTokenIds] = useState<string[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null);

  const globalSelectedTokenId = useTableStore((state) => state.selectedTokenId);
  const setGlobalSelectedTokenId = useTableStore((state) => state.setSelectedTokenId);
  // ВСЕ ХУКИ useEffect И useCallback ДОЛЖНЫ БЫТЬ ЗДЕСЬ, ДО УСЛОВНЫХ ВОЗВРАТОВ

  useEffect(() => {
    if (map) {
      setSelectedMapId(map.id);
    } else {
      setSelectedMapId(null);
    }

    return () => {
      setSelectedMapId(null);
      setSelectedTokenIdGlobal(null);
    };
  }, [map?.id, setSelectedMapId, setSelectedTokenIdGlobal]);

  useEffect(() => {
    if (globalSelectedTokenId && globalSelectedTokenId !== selectedTokenId) {
      setSelectedTokenId(globalSelectedTokenId);
    }
  }, [globalSelectedTokenId, selectedTokenId]);

  const { isGM, isLocalMode } = usePlayerVisibility();
  const setMapVisible = useSetMapVisibleToPlayers();
  const setActiveScene = useSetActiveScene();
  const { data: activeSceneId } = useActiveScene(Boolean(map));

  const isActiveScene = !map || !isGM ? false : activeSceneId === map.id;


  // GM: переключить видимость карты
  const handleToggleVisibility = () => {
    if (!map || !isGM) return;
    if (!isGM) return;

    const newVisibility = !map.isVisibleToPlayers;

    setMapVisible.mutate(
      { mapId: map.id, isVisible: newVisibility },
      {
        onSuccess: () => {
          // Уведомляем игроков через Relay
          if (relayClient.status === 'connected') {
            relayClient.send('state_update', {
              map_visibility: { [map.id]: newVisibility },
            });
          }
        },
      },
    );
  };

  // GM: сделать активной сценой
  const handleSetActiveScene = () => {
    if (!map || !isGM) return;
    if (!isGM) return;

    setActiveScene.mutate(map.id, {
      onSuccess: () => {
        // Уведомляем игроков через Relay
        if (relayClient.status === 'connected') {
          relayClient.send('state_update', {
            active_scene_map_id: map.id,
          });
        }
      },
    });
  };

  // Перемещение токена с отправкой в Relay
  const handleMoveToken = useCallback(
    async (tokenId: string, x: number, y: number) => {
      if (!map) return;

      try {
        await moveToken.mutateAsync({
          mapId: map.id,
          tokenId,
          x,
          y,
        });

        // Отправляем уведомление другим клиентам
        if (relayClient.status === 'connected') {
          relayClient.send('token_move', {
            token_id: tokenId,
            map_id: map.id,   // <-- map_id обязателен
            x,
            y,
            rotation: 0,
          });
        }
      } catch {
        // Rollback уже есть в useMoveToken
      }
    },
    [map, moveToken],
  );

  // Обновление тумана войны с отправкой в Relay
  const handleFogChange = useCallback(
    (newFogCells: Set<string>) => {
      if (!map) return;

      // Сохранение в БД будет через debounce в MapTab
      // Здесь только отправляем в Relay

      if (relayClient.status === 'connected') {
        const fogData = JSON.stringify(Array.from(newFogCells));
        relayClient.send('fog_update', {
          map_id: map.id,
          fog_data: fogData,
        });
      }
    },
    [map],
  );

  const showGrid = map ? (showGridByMap[map.id] ?? true) : true;

  // ТЕПЕРЬ УСЛОВНЫЕ ВОЗВРАТЫ
  if (!mapId) {
    return (
      <div className="workspace-empty">
        Map tab is broken: missing map id.
      </div>
    );
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading map…</div>;
  }

  if (!map) {
    return <div className="workspace-empty">Map not found.</div>;
  }

  const visibleTokens = tokens
    .filter((token) => !pendingDeleteTokenIds.includes(token.id))
    .filter((token) => canSeeToken(token));

  // Создание токена с отправкой в Relay
  const handleAddToken = () => {
    const jitterX = (Math.random() - 0.5) * map.gridSize * 2;
    const jitterY = (Math.random() - 0.5) * map.gridSize * 2;

    createToken.mutate(
      {
        mapId: map.id,
        x: map.width / 2 + jitterX,
        y: map.height / 2 + jitterY,
        characterId: selectedCharacterId || null,
      },
      {
        onSuccess: (newToken) => {
          setSelectedTokenId(newToken.id);

          // Отправляем уведомление другим клиентам
          if (relayClient.status === 'connected') {
            relayClient.send('token_create', {
              token_id: newToken.id,
              map_id: map.id,
              character_id: selectedCharacterId || null,
              x: newToken.x,
              y: newToken.y,
            });
          }
        },
      },
    );
  };

  // Удаление токена с отправкой в Relay
  const handleDeleteSelected = () => {
    if (!selectedTokenId) {
      return;
    }

    const tokenId = selectedTokenId;

    setSelectedTokenId(null);

    setPendingDeleteTokenIds((prev) =>
      prev.includes(tokenId) ? prev : [...prev, tokenId],
    );

    deleteToken.mutate(
      {
        mapId: map.id,
        tokenId,
      },
      {
        onSuccess: () => {
          // Отправляем уведомление другим клиентам
          if (relayClient.status === 'connected') {
            relayClient.send('token_delete', {
              token_id: tokenId,
              map_id: map.id,
            });
          }
        },
        onSettled: () => {
          setPendingDeleteTokenIds((prev) =>
            prev.filter((id) => id !== tokenId),
          );
        },
      },
    );
  };

  const handleLoadImage = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Images',
            extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
          },
        ],
      });

      if (typeof selected === 'string') {
        setPendingImagePath(selected);
      }
    } catch (error) {
      console.error('Failed to select image', error);
    }
  };

  const handleImportConfirm = (options: MapImageImportOptions) => {
    if (!pendingImagePath) return;

    importMapImage.mutate(
      {
        mapId: map.id,
        sourcePath: pendingImagePath,
        options,
      },
      {
        onSuccess: () => {
          setPendingImagePath(null);
        },
        onError: () => {
          setPendingImagePath(null);
        },
      },
    );
  };

  const handleImportCancel = () => {
    setPendingImagePath(null);
  };

  const handleCreateTokenWithCharacter = (
    x: number,
    y: number,
    characterId: string,
  ) => {
    createToken.mutate({
      mapId: map.id,
      x,
      y,
      characterId,
    });
  };

  return (
    <div className="map-tab">
      <div className="map-tab-header">
        <span>{map.name}</span>

        {/* GM-only: управление видимостью */}
        {isGM && (
          <div className="map-scene-controls">
            <label className="map-visibility-toggle" title="Visible to players">
              <input
                type="checkbox"
                checked={map.isVisibleToPlayers}
                onChange={handleToggleVisibility}
                disabled={setMapVisible.isPending}
              />
              👁️
            </label>

            <button
              type="button"
              className={isActiveScene ? 'scene-active-btn active' : 'scene-active-btn'}
              onClick={handleSetActiveScene}
              disabled={setActiveScene.isPending}
              title="Set as active scene for players"
            >
              {isActiveScene ? '🎬 Active Scene' : 'Set Active'}
            </button>
          </div>
        )}

        {/* Индикатор для Player: карта видна или нет */}
        {!isGM && !isLocalMode && (
          <span className="map-player-indicator">
            {map.isVisibleToPlayers ? '👁️ Visible' : '🔒 Hidden'}
          </span>
        )}

        <div className="map-tab-actions">
          {/* Load image и Grid — только GM или локальный режим */}
          {isGM && (
            <>
              <button
                type="button"
                onClick={handleLoadImage}
                disabled={importMapImage.isPending}
              >
                {importMapImage.isPending ? 'Loading…' : 'Load image'}
              </button>

              <label className="map-grid-toggle">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={() => toggleGrid(map.id)}
                />
                Grid
              </label>
            </>
          )}

          {/* Токены — только GM или локальный режим */}
          {isGM && (
            <>
              <select
                value={selectedCharacterId}
                onChange={(event) => setSelectedCharacterId(event.target.value)}
                title="Character for new token"
              >
                <option value="">No character</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name} ({character.type.toUpperCase()})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddToken}
                disabled={createToken.isPending}
              >
                {createToken.isPending ? 'Adding…' : 'Add token'}
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={!selectedTokenId || deleteToken.isPending}
              >
                {deleteToken.isPending ? 'Deleting…' : 'Delete token'}
              </button>
            </>
          )}
        </div>

        <span>
          {map.width} × {map.height} · grid {map.gridSize}px
        </span>
      </div>

      <MapCanvas
        map={map}
        tokens={visibleTokens}
        selectedTokenId={selectedTokenId}
        onSelectToken={setSelectedTokenId}
        onMoveToken={handleMoveToken}
        showGrid={showGrid}
        fogCells={new Set()} // Здесь должен быть реальный fogCells из состояния
        fogMode="none"
        onFogChange={handleFogChange}
        onCreateTokenWithCharacter={handleCreateTokenWithCharacter}
      />

      {pendingImagePath && (
        <MapImageImportDialog
          sourcePath={pendingImagePath}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
          isImporting={importMapImage.isPending}
        />
      )}
    </div>
  );
}```

---
## Файл: ./src/features/multiplayer/ConnectionPanel.tsx
```
import { useEffect, useRef, useState } from 'react';

import { relayClient } from '../../shared/services/relayClient';
import { useUiStore } from '../../shared/stores/ui';
import {
    deleteMultiplayerSession,
    fetchCampaignEntities,
    getMultiplayerSessions,
    uploadCampaignToRelay,
} from '../../shared/services/campaignSharing';
import { MultiplayerSessionInfo } from '../../shared/api/bindings';
import { useOpenMultiplayerCampaign } from '../../shared/api/hooks';

export function ConnectionPanel() {
    const connectionStatus = useUiStore((state) => state.connectionStatus);

    const [mode, setMode] = useState<'create' | 'join'>('join');
    const [serverUrl, setServerUrl] = useState('ws://localhost:3001');
    const [roomId, setRoomId] = useState('');
    const [token, setToken] = useState('');

    const activeProfileName = useUiStore((state) => state.activeProfileName);
    const [displayName, setDisplayName] = useState(activeProfileName || '');
    const [roomName, setRoomName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [savedSessions, setSavedSessions] = useState<MultiplayerSessionInfo[]>([]);
    const [createdRoom, setCreatedRoom] = useState<{
        room_id: string;
        gm_token: string;
        access_code?: string;
    } | null>(null);
    const activeProfileId = useUiStore((state) => state.activeProfileId);
    const openMultiplayerCampaign = useOpenMultiplayerCampaign();

    const isConnected = connectionStatus === 'connected';
    const isConnecting = connectionStatus === 'connecting';


    // Состояние для прогресса
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const isCancelling = useRef(false);

    // Инициализация displayName из профиля

    useEffect(() => {
        getMultiplayerSessions(activeProfileId!)
            .then(setSavedSessions)
            .catch(console.error);
    }, []);

    const handleDeleteSession = async (roomId: string) => {
        if (!window.confirm('Delete this saved session?')) return;

        try {
            await deleteMultiplayerSession(roomId, activeProfileId!);
            setSavedSessions((prev) => prev.filter((s) => s.roomId !== roomId));
        } catch (e) {
            console.error('Failed to delete session', e);
        }
    };

    const handleJoinRoom = async () => {
        setError(null);
        setDownloadProgress(null);
        isCancelling.current = false;

        if (!activeProfileId) {
            setError('No active profile. Please select a profile first.');
            return;
        }

        try {
            // 1. Запрашиваем отфильтрованные данные кампании с сервера
            const entities = await fetchCampaignEntities(serverUrl, roomId, token);
            console.log('[ConnectionPanel] Campaign entities:', entities);

            // Проверяем, не отменил ли пользователь
            if (isCancelling.current) {
                return;
            }

            // 2. Подключаемся через WebSocket
            await relayClient.connect({
                serverUrl,
                roomId,
                token,
                displayName: displayName || 'Player',
            });
        } catch (e) {
            if (!isCancelling.current) {
                setDownloadProgress(null);
                setError(e instanceof Error ? e.message : 'Connection failed');
            }
        }
    };

    const handleCreateRoom = async () => {
        setError(null);
        setUploadProgress(null);

        if (!activeProfileId) {
            setError('No active profile. Please select a profile first.');
            return;
        }

        try {
            // 1. Создаём комнату на сервере
            const response = await fetch(`${serverUrl.replace(/^ws/, 'http')}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_name: roomName || 'New Campaign',
                    gm_name: displayName || 'GM',
                    max_players: 6,
                    access_code: accessCode || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create room: ${response.statusText}`);
            }

            const data = await response.json();
            setCreatedRoom(data);

            // 2. Загружаем кампанию на сервер (ZIP)
            setUploadProgress(0);
            await uploadCampaignToRelay(
                {
                    serverUrl,
                    roomId: data.room_id,
                    gmToken: data.gm_token,
                    displayName: displayName || 'GM',
                },
                (percent) => setUploadProgress(percent),
            );
            setUploadProgress(null);

            // 3. Подключаемся как GM через WebSocket
            await relayClient.connect({
                serverUrl,
                roomId: data.room_id,
                token: data.gm_token,
                displayName: displayName || 'GM',
            });
        } catch (e) {
            setUploadProgress(null);
            setError(e instanceof Error ? e.message : 'Unknown error');
        }
    };


    const handleDisconnect = () => {
        relayClient.disconnect();
        setCreatedRoom(null);
        setError(null);
    };

    const handleCancelConnection = () => {
        isCancelling.current = true;
        relayClient.disconnect();
        setError(null);
    };

    if (isConnected) {
        return (
            <div className="connection-panel">
                <div className="connection-status connected">
                    🟢 Connected
                </div>

                <div className="connection-info">
                    <div>
                        User ID: {relayClient.connectedUserId
                            ? `${relayClient.connectedUserId.slice(0, 8)}…`
                            : 'Unknown'}
                    </div>
                    <div>
                        Role: {relayClient.connectedRole === 'gm'
                            ? '👑 Game Master'
                            : relayClient.connectedRole === 'player'
                                ? '🎮 Player'
                                : relayClient.connectedRole || 'Unknown'}
                    </div>
                </div>

                {uploadProgress !== null && (
                    <div className="connection-progress">
                        <div className="connection-progress-bar">
                            <div
                                className="connection-progress-fill"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <span>Uploading campaign… {uploadProgress}%</span>
                    </div>
                )}

                {downloadProgress !== null && (
                    <div className="connection-progress">
                        <div className="connection-progress-bar">
                            <div
                                className="connection-progress-fill"
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                        <span>Downloading campaign… {downloadProgress}%</span>
                    </div>
                )}

                {createdRoom && (
                    <div className="connection-room-info">
                        <h4>Room Created Successfully!</h4>

                        <div className="connection-info-row">
                            <label>Room ID:</label>
                            <div className="connection-info-value">
                                <code>{createdRoom.room_id}</code>
                                <button
                                    type="button"
                                    className="copy-button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdRoom.room_id);
                                        // Можно добавить toast уведомление
                                    }}
                                    title="Copy Room ID"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        <div className="connection-info-row">
                            <label>GM Token:</label>
                            <div className="connection-info-value">
                                <code>{createdRoom.gm_token}</code>
                                <button
                                    type="button"
                                    className="copy-button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdRoom.gm_token);
                                    }}
                                    title="Copy GM Token"
                                >
                                    📋
                                </button>
                            </div>
                        </div>

                        {createdRoom.access_code && (
                            <div className="connection-info-row">
                                <label>Access Code:</label>
                                <div className="connection-info-value">
                                    <code>{createdRoom.access_code}</code>
                                    <button
                                        type="button"
                                        className="copy-button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdRoom.access_code!);
                                        }}
                                        title="Copy Access Code"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="connection-info-hint">
                            <p><strong>Для игроков:</strong></p>
                            <p>1. Дайте им <strong>Room ID</strong> и <strong>Access Code</strong></p>
                            <p>2. Они выбирают "Join Room" и вводят эти данные</p>
                        </div>
                    </div>
                )}

                <button type="button" onClick={handleDisconnect}>
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="connection-panel">
            <div className={`connection-status ${connectionStatus}`}>
                {connectionStatus === 'connecting' && '🟡 Connecting…'}
                {connectionStatus === 'disconnected' && '⚪ Disconnected'}
                {connectionStatus === 'error' && '🔴 Error'}
            </div>

            {error && <div className="connection-error">{error}</div>}

            <div className="connection-mode-tabs">
                <button
                    type="button"
                    className={mode === 'join' ? 'active' : ''}
                    onClick={() => setMode('join')}
                >
                    Join Room
                </button>
                <button
                    type="button"
                    className={mode === 'create' ? 'active' : ''}
                    onClick={() => setMode('create')}
                >
                    Create Room
                </button>
            </div>

            <label>
                Server URL
                <input
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="ws://localhost:3001"
                />
            </label>

            <label>
                Display Name
                <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                />
            </label>

            {mode === 'join' ? (
                <>
                    <label>
                        Room ID
                        <input
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Room ID"
                            disabled={isConnecting}
                        />
                    </label>

                    <label>
                        Token / Access Code
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="GM token or access code"
                            type="password"
                            disabled={isConnecting}
                        />
                    </label>

                    <div className="connection-buttons">
                        {isConnecting ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancelConnection}
                                    className="btn-danger"
                                >
                                    Cancel
                                </button>
                                <span className="connection-status-text">Connecting...</span>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleJoinRoom}
                                disabled={!roomId || !token}
                                className="btn-primary"
                            >
                                Join
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <label>
                        Room Name
                        <input
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="My Campaign"
                        />
                    </label>

                    <label>
                        Access Code (optional)
                        <input
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="Secret code for players"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={handleCreateRoom}
                        disabled={isConnecting || !displayName}
                    >
                        {isConnecting ? 'Creating…' : 'Create & Join'}
                    </button>
                </>
            )}
            {savedSessions.length > 0 && (
                <div className="saved-sessions">
                    <h4>Saved Sessions</h4>
                    {savedSessions.map((session) => (
                        <div key={session.roomId} className="saved-session-item">
                            <div className="saved-session-info">
                                <span className="saved-session-name">
                                    Room: {session.roomId.slice(0, 8)}…
                                </span>
                                <span className="saved-session-meta">
                                    {session.role} · {new Date(session.lastSyncAt * 1000).toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="icon-btn icon-btn-danger"
                                onClick={() => handleDeleteSession(session.roomId)}
                                title="Delete session"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

---
## Файл: ./src/features/multiplayer/WaitingForGM.tsx
```
export function WaitingForGM() {
  return (
    <div className="waiting-for-gm">
      <div className="waiting-for-gm-icon">⏳</div>
      <h3>Waiting for GM</h3>
      <p>
        The Game Master hasn't shown any content yet.
        <br />
        You'll see maps and scenes once the GM makes them visible.
      </p>
    </div>
  );
}```

---
## Файл: ./src/features/navigator/CampaignTree.tsx
```
import { useMemo, useState, useEffect } from 'react';

import {
  useActiveCampaign,
  useAllTokens,
  useCharacters,
  useCreateCharacter,
  useCreateMap,
  useCreateToken,
  useDeleteCharacter,
  useDeleteMap,
  useDeleteToken,
  useMaps,
} from '../../shared/api/hooks';
import { useTableStore } from '../../shared/stores/table';
import { useWorkspaceStore } from '../../shared/stores/workspace';
import { useDragStore } from '../../shared/stores/drag';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { CreateMapModal } from '../map/CreateMapModal';
import { CreateCharacterModal } from '../character/CreateCharacterModal';

import type { MapSummary, TokenSummary, CharacterSummary } from '../../shared/api/bindings';

import { useDraggable } from '../../shared/hooks/useDraggable';
import { useDropTarget } from '../../shared/hooks/useDropTarget';

type TreeTab = 'maps' | 'characters';

type AddAction = 'add-map' | 'add-character-pc' | 'add-character-npc' | 'add-character-monster' | 'add-token';

interface PendingDelete {
  kind: 'map' | 'token' | 'character';
  id: string;
  name: string;
  mapId?: string;
}

interface PendingAdd {
  kind: AddAction;
  mapId?: string;
}

const CHARACTER_TYPE_ICONS: Record<string, string> = {
  pc: '🧙',
  npc: '🧑‍🌾',
  monster: '👹',
};

export function CampaignTree() {
  const { data: activeCampaign } = useActiveCampaign();
  const { data: maps = [] } = useMaps(Boolean(activeCampaign));
  const { data: allTokens = [] } = useAllTokens(Boolean(activeCampaign));
  const { data: characters = [] } = useCharacters(Boolean(activeCampaign));

  const deleteMap = useDeleteMap();
  const deleteToken = useDeleteToken();
  const deleteCharacter = useDeleteCharacter();
  const createToken = useCreateToken();
  const createMap = useCreateMap();
  const createCharacter = useCreateCharacter();

  const openTab = useWorkspaceStore((state) => state.openTab);
  const setSelectedTokenId = useTableStore((state) => state.setSelectedTokenId);
  const selectedTokenId = useTableStore((state) => state.selectedTokenId);

  const [activeTab, setActiveTab] = useState<TreeTab>('maps');
  const [isCreateMapOpen, setIsCreateMapOpen] = useState(false);
  const [isCreateCharacterOpen, setIsCreateCharacterOpen] = useState(false);
  
  // Получаем функции и состояние из drag store
  const dragging = useDragStore((s) => s.dragging);
  const setPreviousTab = useDragStore((s) => s.setPreviousTab);
  const clearPreviousTab = useDragStore((s) => s.clearPreviousTab);

  // Эффект для автопереключения вкладок при перетаскивании
  useEffect(() => {
    if (dragging) {
      // Начинается перетаскивание: запоминаем текущую вкладку и переключаемся на карты
      setPreviousTab(activeTab);
      setActiveTab('maps');
    } else {
      // Перетаскивание закончилось: восстанавливаем предыдущую вкладку
      const prevTab = useDragStore.getState().previousTab;
      if (prevTab) {
        setActiveTab(prevTab as TreeTab);
        clearPreviousTab();
      }
    }
  }, [dragging, activeTab, setPreviousTab, clearPreviousTab]);

  const [expandedMapIds, setExpandedMapIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
  const [newName, setNewName] = useState('');

  // Группируем токены по map_id
  const tokensByMapId = useMemo(() => {
    const grouped = new Map<string, TokenSummary[]>();

    for (const token of allTokens) {
      const list = grouped.get(token.mapId) ?? [];
      list.push(token);
      grouped.set(token.mapId, list);
    }

    return grouped;
  }, [allTokens]);

  const handleToggleMap = (mapId: string) => {
    setExpandedMapIds((prev) => {
      const next = new Set(prev);
      if (next.has(mapId)) {
        next.delete(mapId);
      } else {
        next.add(mapId);
      }
      return next;
    });
  };

  const handleOpenMap = (map: MapSummary) => {
    openTab({
      id: `map:${map.id}`,
      kind: 'map',
      title: map.name,
      entityId: map.id,
    });
  };

  const handleSelectToken = (token: TokenSummary) => {
    // Открываем карту токена если не открыта
    const map = maps.find((m) => m.id === token.mapId);
    if (map) {
      handleOpenMap(map);
    }

    // Выделяем токен
    setSelectedTokenId(token.id);
  };

  const handleAddTokenToMap = (map: MapSummary) => {
    const jitterX = (Math.random() - 0.5) * map.gridSize * 2;
    const jitterY = (Math.random() - 0.5) * map.gridSize * 2;

    createToken.mutate({
      mapId: map.id,
      x: map.width / 2 + jitterX,
      y: map.height / 2 + jitterY,
      characterId: null,
    });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    switch (pendingDelete.kind) {
      case 'map':
        deleteMap.mutate(pendingDelete.id);
        break;

      case 'token':
        if (pendingDelete.mapId) {
          deleteToken.mutate({
            mapId: pendingDelete.mapId,
            tokenId: pendingDelete.id,
          });
        }
        break;

      case 'character':
        deleteCharacter.mutate(pendingDelete.id);
        break;
    }

    setPendingDelete(null);
  };

  const handleAdd = () => {
    if (!pendingAdd || !newName.trim()) return;
    const name = newName.trim();

    switch (pendingAdd.kind) {
      case 'add-map':
        createMap.mutate({
          name,
          width: 2000,
          height: 1500,
          grid_size: 50,
        });
        break;

      case 'add-character-pc':
      case 'add-character-npc':
      case 'add-character-monster':
        createCharacter.mutate({
          name,
          characterType: pendingAdd.kind.replace('add-character-', '') as 'pc' | 'npc' | 'monster',
        });
        break;

      case 'add-token':
        if (pendingAdd.mapId) {
          const map = maps.find((m) => m.id === pendingAdd.mapId);
          if (map) {
            const jitterX = (Math.random() - 0.5) * map.gridSize * 2;
            const jitterY = (Math.random() - 0.5) * map.gridSize * 2;
            createToken.mutate({
              mapId: map.id,
              x: map.width / 2 + jitterX,
              y: map.height / 2 + jitterY,
              characterId: null,
            });
          }
        }
        break;
    }

    setPendingAdd(null);
    setNewName('');
  };

  const openAddDialog = (kind: AddAction, mapId?: string) => {
    setPendingAdd({ kind, mapId });
    setNewName('');
  };

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to see its contents.
      </div>
    );
  }

  return (
    <div className="campaign-tree">
      {/* Вкладки */}
      <div className="campaign-tree-tabs">
        <button
          type="button"
          className={activeTab === 'maps' ? 'active' : ''}
          onClick={() => setActiveTab('maps')}
        >
          Maps
        </button>
        <button
          type="button"
          className="campaign-tree-tab-add"
          title="Create new map"
          onClick={() => setIsCreateMapOpen(true)}
        >
          ＋
        </button>

        <button
          type="button"
          className={activeTab === 'characters' ? 'active' : ''}
          onClick={() => setActiveTab('characters')}
        >
          Characters
        </button>
        <button
          type="button"
          className="campaign-tree-tab-add"
          title="Create new character"
          onClick={() => setIsCreateCharacterOpen(true)}
        >
          ＋
        </button>
      </div>

      {/* Контент */}
      <div className="campaign-tree-content">
        {activeTab === 'maps' && (
          <MapsTree
            maps={maps}
            tokensByMapId={tokensByMapId}
            expandedMapIds={expandedMapIds}
            selectedTokenId={selectedTokenId}
            onToggleMap={handleToggleMap}
            onOpenMap={handleOpenMap}
            onSelectToken={handleSelectToken}
            onAddToken={handleAddTokenToMap}
            onAddMap={() => openAddDialog('add-map')}
            onDeleteMap={(map) =>
              setPendingDelete({ kind: 'map', id: map.id, name: map.name })
            }
            onDeleteToken={(token) =>
              setPendingDelete({
                kind: 'token',
                id: token.id,
                name: token.characterName ?? 'Token',
                mapId: token.mapId,
              })
            }
            onCreateToken={(mapId, x, y, characterId) => {
              createToken.mutate({ mapId, x, y, characterId });
            }}
          />
        )}

        {activeTab === 'characters' && (
          <CharactersList
            characters={characters}
            onAddCharacter={(type) => openAddDialog(`add-character-${type}` as AddAction)}
            onDeleteCharacter={(character) =>
              setPendingDelete({
                kind: 'character',
                id: character.id,
                name: character.name,
              })
            }
          />
      )}

      {/* Модалки */}
      <CreateMapModal
        open={isCreateMapOpen}
        onClose={() => setIsCreateMapOpen(false)}
      />

      <CreateCharacterModal
        open={isCreateCharacterOpen}
        onClose={() => setIsCreateCharacterOpen(false)}
      />
    </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.kind ?? ''}`}
        message={getDeleteMessage(pendingDelete)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Диалог добавления */}
      {pendingAdd && (
        <div className="confirm-dialog-overlay" onClick={() => setPendingAdd(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-header">
              <h3>{getAddTitle(pendingAdd)}</h3>
            </div>
            <div className="confirm-dialog-body">
              <input
                className="add-dialog-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setPendingAdd(null);
                }}
              />
            </div>
            <div className="confirm-dialog-footer">
              <button className="btn-secondary" onClick={() => setPendingAdd(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAdd}
                disabled={!newName.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Формирует заголовок для диалога добавления */
function getAddTitle(add: PendingAdd | null): string {
  if (!add) return '';
  switch (add.kind) {
    case 'add-map':
      return 'New map';
    case 'add-character-pc':
      return 'New PC';
    case 'add-character-npc':
      return 'New NPC';
    case 'add-character-monster':
      return 'New monster';
    case 'add-token':
      return 'New token';
    default:
      return '';
  }
}

/** Формирует сообщение для диалога удаления */
function getDeleteMessage(pending: PendingDelete | null): string {
  if (!pending) return '';

  switch (pending.kind) {
    case 'map':
      return `Delete map "${pending.name}"? All tokens on this map will be permanently deleted.`;
    case 'token':
      return `Delete token "${pending.name}"? This action cannot be undone.`;
    case 'character':
      return `Delete character "${pending.name}"? Tokens linked to this character will remain but lose their link.`;
    default:
      return '';
  }
}

// ============================================
// Дерево карт
// ============================================

interface MapsTreeProps {
  maps: MapSummary[];
  tokensByMapId: Map<string, TokenSummary[]>;
  expandedMapIds: Set<string>;
  selectedTokenId: string | null;
  onToggleMap: (mapId: string) => void;
  onOpenMap: (map: MapSummary) => void;
  onSelectToken: (token: TokenSummary) => void;
  onAddToken: (map: MapSummary) => void;
  onAddMap: () => void;
  onDeleteMap: (map: MapSummary) => void;
  onDeleteToken: (token: TokenSummary) => void;
  onCreateToken: (mapId: string, x: number, y: number, characterId: string) => void;
}

function MapsTree({
  maps,
  tokensByMapId,
  expandedMapIds,
  selectedTokenId,
  onToggleMap,
  onOpenMap,
  onSelectToken,
  onAddToken,
  onAddMap,
  onDeleteMap,
  onDeleteToken,
  onCreateToken,
}: MapsTreeProps) {
  if (maps.length === 0) {
    return (
      <div className="empty-state">
        No maps yet.
        <button
          type="button"
          className="btn-primary"
          onClick={onAddMap}
        >
          + New map
        </button>
      </div>
    );
  }

  return (
    <div className="tree">
      {/* Кнопка "New map" */}
      <div className="tree-node-header">
        <div className="tree-node-label" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="tree-node-icon">📋</span>
          <span className="tree-node-name">Maps</span>
        </div>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn"
            title="Add map"
            onClick={onAddMap}
          >
            ＋
          </button>
        </div>
      </div>

      {maps.map((map) => {
        const tokens = tokensByMapId.get(map.id) ?? [];
        const isExpanded = expandedMapIds.has(map.id);

        return (
          <MapRow
            key={map.id}
            map={map}
            tokens={tokens}
            isExpanded={isExpanded}
            selectedTokenId={selectedTokenId}
            onToggle={() => onToggleMap(map.id)}
            onOpen={() => onOpenMap(map)}
            onSelectToken={onSelectToken}
            onAddToken={() => onAddToken(map)}
            onDropCharacter={(characterId) => {
              onCreateToken(map.id, map.width / 2, map.height / 2, characterId);
            }}
            onDeleteMap={() => onDeleteMap(map)}
            onDeleteToken={onDeleteToken}
          />
        );
      })}
    </div>
  );
}

function MapRow({
  map,
  tokens,
  isExpanded,
  selectedTokenId,
  onToggle,
  onOpen,
  onSelectToken,
  onAddToken,
  onDropCharacter,
  onDeleteMap,
  onDeleteToken,
}: {
  map: MapSummary;
  tokens: TokenSummary[];
  isExpanded: boolean;
  selectedTokenId: string | null;
  onToggle: () => void;
  onOpen: () => void;
  onSelectToken: (token: TokenSummary) => void;
  onAddToken: () => void;
  onDropCharacter: (characterId: string) => void;
  onDeleteMap: () => void;
  onDeleteToken: (token: TokenSummary) => void;
}) {
  const { ref, isOver, isAccepting } = useDropTarget({
    target: { kind: 'map', id: map.id },
    accepts: (item) => item.kind === 'character',
    onDrop: (item) => {
      if (item.kind === 'character') {
        onDropCharacter(item.id);
      }
    },
  });

  return (
    <div className="tree-node">
      <div
        ref={ref}
        className={`tree-node-header ${isOver && isAccepting ? 'drop-target' : ''}`}
      >
        <button
          type="button"
          className="tree-node-toggle"
          onClick={onToggle}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        <button
          type="button"
          className="tree-node-label"
          onClick={onOpen}
          title="Open map"
        >
          <span className="tree-node-icon">🗺️</span>
          <span className="tree-node-name">{map.name}</span>
          <span className="tree-node-badge">{tokens.length}</span>
        </button>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn"
            title="Add token"
            onClick={onAddToken}
          >
            ＋
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            title="Delete map"
            onClick={onDeleteMap}
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="tree-children">
          {tokens.length === 0 ? (
            <div className="tree-empty">No tokens</div>
          ) : (
            tokens.map((token, index) => (
              <div
                key={token.id}
                className={`tree-node-header tree-token ${
                  token.id === selectedTokenId ? 'selected' : ''
                }`}
              >
                <button
                  type="button"
                  className="tree-node-label tree-token-label"
                  onClick={() => onSelectToken(token)}
                  title="Select token on map"
                >
                  <span className="tree-node-icon">
                    {token.characterName ? '👤' : '⬤'}
                  </span>
                  <span className="tree-node-name">
                    {token.characterName ?? `Token ${index + 1}`}
                  </span>
                  {!token.isVisible && (
                    <span
                      className="tree-token-hidden"
                      title="Hidden from players"
                    >
                      🚫
                    </span>
                  )}
                </button>

                <div className="tree-node-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Delete token"
                    onClick={() => onDeleteToken(token)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Список персонажей
// ============================================

interface CharactersListProps {
  characters: CharacterSummary[];
  onAddCharacter: (type: 'pc' | 'npc' | 'monster') => void;
  onDeleteCharacter: (character: CharacterSummary) => void;
}

function CharacterRow({
  character,
  type,
  onDeleteCharacter,
}: {
  character: CharacterSummary;
  type: string;
  onDeleteCharacter: (character: CharacterSummary) => void;
}) {
  const { handlers, isDragging } = useDraggable({
    item: {
      kind: 'character',
      id: character.id,
      name: character.name,
      icon: CHARACTER_TYPE_ICONS[type] ?? '👤',
    },
  });

  return (
    <div
      className={`tree-node ${isDragging ? 'is-dragging' : ''}`}
      {...handlers}
    >
      <div className="tree-node-header tree-character-draggable">
        <button type="button" className="tree-node-label">
          <span className="tree-node-icon">
            {CHARACTER_TYPE_ICONS[type] ?? '❓'}
          </span>
          <span className="tree-node-name">{character.name}</span>
          <span className="tree-node-status">{character.status}</span>
        </button>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            title="Delete character"
            onClick={() => onDeleteCharacter(character)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function CharactersList({ characters, onAddCharacter, onDeleteCharacter }: CharactersListProps) {
  if (characters.length === 0) {
    return (
      <div className="empty-state">
        No characters yet.
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          <button className="btn-primary" onClick={() => onAddCharacter('pc')}>+ PC</button>
          <button className="btn-secondary" onClick={() => onAddCharacter('npc')}>+ NPC</button>
          <button className="btn-secondary" onClick={() => onAddCharacter('monster')}>+ Monster</button>
        </div>
      </div>
    );
  }

  // Группируем по типу
  const grouped = useMemo(() => {
    const groups = new Map<string, CharacterSummary[]>();

    for (const character of characters) {
      const list = groups.get(character.type) ?? [];
      list.push(character);
      groups.set(character.type, list);
    }

    return groups;
  }, [characters]);

  const typeOrder = ['pc', 'npc', 'monster'];
  const typeLabels: Record<string, string> = {
    pc: 'Player Characters',
    npc: 'NPCs',
    monster: 'Monsters',
  };

  return (
    <div className="tree">
      {/* Заголовок с кнопкой добавления */}
      <div className="tree-node-header">
        <div className="tree-node-label" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="tree-node-icon">👥</span>
          <span className="tree-node-name">Characters</span>
        </div>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn"
            title="Add character"
            onClick={() => onAddCharacter('pc')}
          >
            ＋
          </button>
        </div>
      </div>

      {typeOrder.map((type) => {
        const list = grouped.get(type) ?? [];
        if (list.length === 0) return null;

        return (
          <div key={type} className="tree-section">
            <div className="tree-section-title">{typeLabels[type]}</div>

            {list.map((character) => (
              <CharacterRow
                key={character.id}
                character={character}
                type={type}
                onDeleteCharacter={onDeleteCharacter}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}```

---
## Файл: ./src/features/profile/ProfileSelectScreen.tsx
```
import { useState } from 'react';

import {
  useCreateProfile,
  useDeleteProfile,
  useProfiles,
} from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';

export function ProfileSelectScreen() {
  const { data: profiles = [], isLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();

  const setActiveProfile = useUiStore((state) => state.setActiveProfile);

  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectProfile = (profileId: string, profileName: string) => {
    setActiveProfile(profileId, profileName);
  };

  const handleCreateProfile = async () => {
    const name = newProfileName.trim();
    if (!name) return;

    createProfile.mutate(name, {
      onSuccess: (profile) => {
        setNewProfileName('');
        setIsCreating(false);
        // Автоматически выбираем созданный профиль
        setActiveProfile(profile.id, profile.name);
      },
    });
  };

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    if (!window.confirm(`Delete profile "${profileName}" and all its campaigns?`)) {
      return;
    }

    deleteProfile.mutate(profileId);
  };

  return (
    <div className="profile-select-screen">
      <div className="profile-select-content">
        <h1 className="profile-select-title">DndStudio</h1>
        <p className="profile-select-subtitle">Select a profile to continue</p>

        {isLoading && (
          <div className="empty-state">Loading profiles…</div>
        )}

        {!isLoading && profiles.length === 0 && !isCreating && (
          <div className="empty-state">
            No profiles yet. Create one to get started.
          </div>
        )}

        {/* Список профилей */}
        <div className="profile-grid">
          {profiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <button
                type="button"
                className="profile-card-select"
                onClick={() => handleSelectProfile(profile.id, profile.name)}
              >
                <div className="profile-avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-name">{profile.name}</div>
                <div className="profile-meta">
                  Last active:{' '}
                  {new Date(profile.lastActiveAt * 1000).toLocaleDateString()}
                </div>
              </button>

              <button
                type="button"
                className="profile-card-delete"
                onClick={() => handleDeleteProfile(profile.id, profile.name)}
                title="Delete profile"
              >
                🗑️
              </button>
            </div>
          ))}

          {/* Кнопка создания нового профиля */}
          {!isCreating && (
            <button
              type="button"
              className="profile-card profile-card-new"
              onClick={() => setIsCreating(true)}
            >
              <div className="profile-avatar profile-avatar-new">+</div>
              <div className="profile-name">New Profile</div>
            </button>
          )}
        </div>

        {/* Форма создания профиля */}
        {isCreating && (
          <div className="profile-create-form">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Profile name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProfile();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />

            <div className="profile-create-actions">
              <button
                type="button"
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim() || createProfile.isPending}
              >
                {createProfile.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}```

---
## Файл: ./src/features/sheets/SheetRenderer.tsx
```
import { useCallback, useMemo } from 'react';

/* ========================================= */
/* Типы декларативного листа                 */
/* ========================================= */

export interface SheetField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  path: string;
  options?: Array<{ value: string; label: string }>;
}

export interface SheetSection {
  key: string;
  title?: string;
  fields: SheetField[];
}

export interface SheetDefinition {
  schema_version: string;
  name?: string;
  sections: SheetSection[];
}

/* ========================================= */
/* Утилиты для dot-notation                  */
/* ========================================= */

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split('.');
  const result = { ...obj };

  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (
      current[key] === null ||
      current[key] === undefined ||
      typeof current[key] !== 'object'
    ) {
      current[key] = {};
    }

    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;

  return result;
}

/* ========================================= */
/* Компоненты полей                          */
/* ========================================= */

function SheetTextField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field">
      <span className="sheet-field-label">{field.label}</span>
      <input
        type="text"
        className="sheet-field-input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SheetNumberField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field">
      <span className="sheet-field-label">{field.label}</span>
      <input
        type="number"
        className="sheet-field-input"
        value={typeof value === 'number' ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

function SheetTextareaField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field sheet-field-full">
      <span className="sheet-field-label">{field.label}</span>
      <textarea
        className="sheet-field-textarea"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </label>
  );
}

function SheetSelectField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field">
      <span className="sheet-field-label">{field.label}</span>
      <select
        className="sheet-field-input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SheetFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return <SheetTextField field={field} value={value} onChange={onChange} />;
    case 'number':
      return <SheetNumberField field={field} value={value} onChange={onChange} />;
    case 'textarea':
      return <SheetTextareaField field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SheetSelectField field={field} value={value} onChange={onChange} />;
    default:
      return (
        <div className="sheet-field-unknown">
          Unknown field type: {field.type}
        </div>
      );
  }
}

/* ========================================= */
/* Основной компонент SheetRenderer          */
/* ========================================= */

interface SheetRendererProps {
  sheetJson: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function SheetRenderer({ sheetJson, data, onChange }: SheetRendererProps) {
  const sheet: SheetDefinition | null = useMemo(() => {
    try {
      return JSON.parse(sheetJson) as SheetDefinition;
    } catch {
      return null;
    }
  }, [sheetJson]);

  const handleFieldChange = useCallback(
    (path: string, value: unknown) => {
      const updated = setNestedValue(data, path, value);
      onChange(updated);
    },
    [data, onChange],
  );

  if (!sheet) {
    return <div className="empty-state">Failed to parse sheet definition.</div>;
  }

  if (!sheet.sections || sheet.sections.length === 0) {
    return <div className="empty-state">Sheet has no sections.</div>;
  }

  return (
    <div className="sheet-renderer">
      {sheet.sections.map((section) => (
        <section key={section.key} className="sheet-section">
          {section.title && (
            <h3 className="sheet-section-title">{section.title}</h3>
          )}

          <div className="sheet-section-fields">
            {section.fields.map((field) => {
              const value = getNestedValue(data, field.path);

              return (
                <SheetFieldRenderer
                  key={field.key}
                  field={field}
                  value={value}
                  onChange={(newValue) =>
                    handleFieldChange(field.path, newValue)
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}```

---
## Файл: ./src/main.tsx
```
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './app/App';
import { useUiStore } from './shared/stores/ui';
import { applyThemeMode } from './shared/theme/theme';

import './styles/global.css';

applyThemeMode(useUiStore.getState().themeMode);

useUiStore.persist.onFinishHydration(() => {
  applyThemeMode(useUiStore.getState().themeMode);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);```

---
## Файл: ./src/shared/api/bindings.ts
```
// This file has been generated by Tauri Specta. Do not edit this file manually.

import { invoke as __TAURI_INVOKE } from "@tauri-apps/api/core";

/** Commands */
export const commands = {
	/**  Создаёт новую кампанию в директории профиля. */
	createCampaign: (name: string, profileId: string) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("create_campaign", { name, profileId })),
	/**  Возвращает список кампаний профиля. */
	listCampaigns: (profileId: string) => typedError<CampaignSummary[], AppError>(__TAURI_INVOKE("list_campaigns", { profileId })),
	/**  Открывает кампанию по ID. */
	openCampaign: (campaignId: string, profileId: string) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("open_campaign", { campaignId, profileId })),
	/**  Закрывает активную кампанию. */
	closeCampaign: () => typedError<null, AppError>(__TAURI_INVOKE("close_campaign")),
	/**  Возвращает активную кампанию. */
	getActiveCampaign: () => typedError<{
	id: string,
	name: string,
	path: string,
	meta: { [key in string]: string },
} | null, AppError>(__TAURI_INVOKE("get_active_campaign")),
	createMap: (name: string, width: number, height: number, gridSize: number) => typedError<MapSummary, AppError>(__TAURI_INVOKE("create_map", { name, width, height, gridSize })),
	listMaps: () => typedError<MapSummary[], AppError>(__TAURI_INVOKE("list_maps")),
	getMap: (id: string) => typedError<{
	id: string,
	worldId: string,
	name: string,
	assetId: string | null,
	imagePath: string | null,
	gridSize: number,
	gridOffsetX: number | null,
	gridOffsetY: number | null,
	scale: number | null,
	width: number,
	height: number,
	sortOrder: number,
	isVisibleToPlayers: boolean,
	version: number,
	fogData: string | null,
} | null, AppError>(__TAURI_INVOKE("get_map", { id })),
	createToken: (mapId: string, x: number | null, y: number | null, characterId: string | null) => typedError<TokenSummary, AppError>(__TAURI_INVOKE("create_token", { mapId, x, y, characterId })),
	listTokens: (mapId: string) => typedError<TokenSummary[], AppError>(__TAURI_INVOKE("list_tokens", { mapId })),
	moveToken: (mapId: string, tokenId: string, x: number | null, y: number | null) => typedError<TokenSummary, AppError>(__TAURI_INVOKE("move_token", { mapId, tokenId, x, y })),
	deleteToken: (mapId: string, tokenId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_token", { mapId, tokenId })),
	assignTokenCharacter: (mapId: string, tokenId: string, characterId: string | null) => typedError<TokenSummary, AppError>(__TAURI_INVOKE("assign_token_character", { mapId, tokenId, characterId })),
	/**  Возвращает все токены кампании (для дерева навигатора) */
	listAllTokens: () => typedError<TokenSummary[], AppError>(__TAURI_INVOKE("list_all_tokens")),
	createCharacter: (name: string, characterType: string) => typedError<CharacterSummary, AppError>(__TAURI_INVOKE("create_character", { name, characterType })),
	listCharacters: () => typedError<CharacterSummary[], AppError>(__TAURI_INVOKE("list_characters")),
	createJournalEntry: (title: string, folderPath: string) => typedError<JournalEntrySummary, AppError>(__TAURI_INVOKE("create_journal_entry", { title, folderPath })),
	listJournalEntries: () => typedError<JournalEntrySummary[], AppError>(__TAURI_INVOKE("list_journal_entries")),
	getJournalEntry: (id: string) => typedError<{
	id: string,
	title: string,
	contentMarkdown: string,
	folderPath: string,
	visibility: string,
	playersCanEdit: boolean,
	sortOrder: number,
	createdAt: number,
	updatedAt: number,
	version: number,
} | null, AppError>(__TAURI_INVOKE("get_journal_entry", { id })),
	updateJournalEntry: (id: string, title: string, contentMarkdown: string, folderPath: string, visibility: string, playersCanEdit: boolean) => typedError<JournalEntryDetail, AppError>(__TAURI_INVOKE("update_journal_entry", { id, title, contentMarkdown, folderPath, visibility, playersCanEdit })),
	deleteJournalEntry: (id: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_journal_entry", { id })),
	getCharacter: (id: string) => typedError<{
	id: string,
	name: string,
	type: string,
	dataJson: string,
	status: string,
	portraitAssetId: string | null,
	createdAt: number,
	updatedAt: number,
	version: number,
} | null, AppError>(__TAURI_INVOKE("get_character", { id })),
	updateCharacter: (id: string, name: string, characterType: string, dataJson: string) => typedError<CharacterDetail, AppError>(__TAURI_INVOKE("update_character", { id, name, characterType, dataJson })),
	/**  Удаляет персонажа. Токены, связанные с ним, останутся (character_id = NULL через FK). */
	deleteCharacter: (characterId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_character", { characterId })),
	importMapImage: (mapId: string, sourcePath: string, options: MapImageImportOptions) => typedError<MapSummary, AppError>(__TAURI_INVOKE("import_map_image", { mapId, sourcePath, options })),
	/**  Читает файл кампании из директории профиля и возвращает как data URL */
	readCampaignAssetDataUrl: (relativePath: string) => typedError<string, AppError>(__TAURI_INVOKE("read_campaign_asset_data_url", { relativePath })),
	updateMapFog: (mapId: string, fogData: string | null) => typedError<null, AppError>(__TAURI_INVOKE("update_map_fog", { mapId, fogData })),
	listCompendiums: () => typedError<CompendiumSummary[], AppError>(__TAURI_INVOKE("list_compendiums")),
	listCompendiumEntries: (compendiumId: string) => typedError<CompendiumEntrySummary[], AppError>(__TAURI_INVOKE("list_compendium_entries", { compendiumId })),
	createCompendium: (name: string, compendiumType: string) => typedError<CompendiumSummary, AppError>(__TAURI_INVOKE("create_compendium", { name, compendiumType })),
	createCompendiumEntry: (compendiumId: string, entryKey: string, name: string, dataJson: string) => typedError<CompendiumEntrySummary, AppError>(__TAURI_INVOKE("create_compendium_entry", { compendiumId, entryKey, name, dataJson })),
	updateCompendium: (id: string, name: string, compendiumType: string) => typedError<CompendiumSummary, AppError>(__TAURI_INVOKE("update_compendium", { id, name, compendiumType })),
	deleteCompendium: (id: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_compendium", { id })),
	updateCompendiumEntry: (id: string, name: string, dataJson: string) => typedError<CompendiumEntrySummary, AppError>(__TAURI_INVOKE("update_compendium_entry", { id, name, dataJson })),
	deleteCompendiumEntry: (id: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_compendium_entry", { id })),
	/**
	 *  Экспорт активной кампании в файл .dndcampaign (ZIP)
	 *  Экспорт активной кампании в файл .dndcampaign (ZIP)
	 */
	exportCampaign: (destinationPath: string) => typedError<null, AppError>(__TAURI_INVOKE("export_campaign", { destinationPath })),
	/**  Импорт кампании из файла .dndcampaign в профиль */
	importCampaign: (sourcePath: string, profileId: string) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("import_campaign", { sourcePath, profileId })),
	installPluginFromFile: (sourcePath: string) => typedError<InstalledPluginSummary, AppError>(__TAURI_INVOKE("install_plugin_from_file", { sourcePath })),
	listInstalledPlugins: () => typedError<InstalledPluginSummary[], AppError>(__TAURI_INVOKE("list_installed_plugins")),
	setPluginActive: (pluginId: string, isActive: boolean) => typedError<InstalledPluginSummary, AppError>(__TAURI_INVOKE("set_plugin_active", { pluginId, isActive })),
	uninstallPlugin: (pluginId: string) => typedError<null, AppError>(__TAURI_INVOKE("uninstall_plugin", { pluginId })),
	getPluginSheet: (pluginId: string, sheetKey: string) => typedError<string, AppError>(__TAURI_INVOKE("get_plugin_sheet", { pluginId, sheetKey })),
	/**  Возвращает список всех декларативных листов из активных плагинов. */
	listPluginSheets: () => typedError<PluginSheetInfo[], AppError>(__TAURI_INVOKE("list_plugin_sheets")),
	/**  Возвращает список всех тем из активных плагинов. */
	listPluginThemes: () => typedError<PluginThemeInfo[], AppError>(__TAURI_INVOKE("list_plugin_themes")),
	/**  Возвращает содержимое CSS-файла темы. */
	getPluginThemeCss: (pluginId: string, themeKey: string) => typedError<string, AppError>(__TAURI_INVOKE("get_plugin_theme_css", { pluginId, themeKey })),
	/**  Возвращает все доступные типы связей: встроенные + из активных плагинов. */
	listLinkTypes: () => typedError<LinkTypeInfo[], AppError>(__TAURI_INVOKE("list_link_types")),
	listJournalLinks: (entryId: string) => typedError<JournalLinkSummary[], AppError>(__TAURI_INVOKE("list_journal_links", { entryId })),
	createJournalLink: (sourceEntryId: string, targetType: string, targetId: string, linkType: string, isDirected: boolean, label: string | null) => typedError<JournalLinkSummary, AppError>(__TAURI_INVOKE("create_journal_link", { sourceEntryId, targetType, targetId, linkType, isDirected, label })),
	deleteJournalLink: (id: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_journal_link", { id })),
	/**  Устанавливает встроенный плагин из ресурсов приложения. */
	installBuiltinPlugin: (pluginName: string) => typedError<InstalledPluginSummary, AppError>(__TAURI_INVOKE("install_builtin_plugin", { pluginName })),
	/**  Импорт ассета с полным пайплайном */
	importAsset: (sourcePath: string, assetType: string) => typedError<AssetSummary, AppError>(__TAURI_INVOKE("import_asset", { sourcePath, assetType })),
	/**  Возвращает путь к файлу ассета */
	getAssetFilePath: (assetId: string) => typedError<string, AppError>(__TAURI_INVOKE("get_asset_file_path", { assetId })),
	/**  Возвращает путь к thumbnail ассета */
	getAssetThumbPath: (assetId: string) => typedError<string, AppError>(__TAURI_INVOKE("get_asset_thumb_path", { assetId })),
	/**
	 *  Возвращает содержимое ассета как data URL (base64)
	 *  Возвращает содержимое ассета как data URL (base64)
	 */
	getAssetDataUrl: (assetId: string) => typedError<string, AppError>(__TAURI_INVOKE("get_asset_data_url", { assetId })),
	/**  Удаляет ассет */
	deleteAsset: (assetId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_asset", { assetId })),
	/**  Список ассетов по типу */
	listAssets: (assetType: string) => typedError<AssetSummary[], AppError>(__TAURI_INVOKE("list_assets", { assetType })),
	/**
	 *  Читает произвольный файл (выбранный через диалог) и возвращает data URL.
	 *  Используется для превью изображения перед импортом.
	 */
	readFileAsDataUrl: (filePath: string) => typedError<string, AppError>(__TAURI_INVOKE("read_file_as_data_url", { filePath })),
	/**  Проверяет зависимости установленного плагина и обновляет compat_warning */
	validatePluginDependencies: (pluginId: string) => typedError<DependencyCheckResult, AppError>(__TAURI_INVOKE("validate_plugin_dependencies", { pluginId })),
	/**
	 *  Проверяет, можно ли деактивировать плагин.
	 *  Возвращает список активных плагинов, которые зависят от указанного.
	 */
	canDeactivatePlugin: (pluginId: string) => typedError<string[], AppError>(__TAURI_INVOKE("can_deactivate_plugin", { pluginId })),
	/**
	 *  Проверяет, можно ли удалить плагин.
	 *  Возвращает список плагинов, которые зависят от указанного.
	 */
	canUninstallPlugin: (pluginId: string) => typedError<string[], AppError>(__TAURI_INVOKE("can_uninstall_plugin", { pluginId })),
	/**  Экспортирует текущую кампанию во временный файл и возвращает путь */
	exportCampaignToTemp: () => typedError<string, AppError>(__TAURI_INVOKE("export_campaign_to_temp")),
	/**  Читает файл и возвращает его содержимое как массив байтов */
	readFileBytes: (filePath: string) => typedError<number[], AppError>(__TAURI_INVOKE("read_file_bytes", { filePath })),
	/**  Удаляет временный файл */
	deleteTempFile: (filePath: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_temp_file", { filePath })),
	/**  Удаляет мультиплеерную сессию */
	deleteMultiplayerSession: (roomId: string, profileId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_multiplayer_session", { roomId, profileId })),
	/**  Возвращает список сохранённых мультиплеерных сессий профиля */
	listMultiplayerSessions: (profileId: string) => typedError<MultiplayerSessionInfo[], AppError>(__TAURI_INVOKE("list_multiplayer_sessions", { profileId })),
	/**  Обновляет session.json при переподключении */
	updateMultiplayerSession: (roomId: string, serverUrl: string, role: string, displayName: string, profileId: string) => typedError<null, AppError>(__TAURI_INVOKE("update_multiplayer_session", { roomId, serverUrl, role, displayName, profileId })),
	/**  Сохраняет кампанию в изолированную директорию мультиплеера профиля */
	saveMultiplayerCampaign: (roomId: string, serverUrl: string, role: string, displayName: string, fileData: number[], profileId: string) => typedError<string, AppError>(__TAURI_INVOKE("save_multiplayer_campaign", { roomId, serverUrl, role, displayName, fileData, profileId })),
	/**  Открывает мультиплеерную кампанию по room_id */
	openMultiplayerCampaign: (roomId: string, profileId: string) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("open_multiplayer_campaign", { roomId, profileId })),
	/**  Создать новый профиль */
	createProfile: (name: string) => typedError<ProfileInfo, AppError>(__TAURI_INVOKE("create_profile", { name })),
	/**  Удалить профиль */
	deleteProfile: (profileId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_profile", { profileId })),
	/**  Список всех профилей */
	listProfiles: () => typedError<ProfileInfo[], AppError>(__TAURI_INVOKE("list_profiles")),
	/**  Обновить last_active_at профиля */
	touchProfile: (profileId: string) => typedError<null, AppError>(__TAURI_INVOKE("touch_profile", { profileId })),
	/**  Возвращает путь к директории ассетов активной кампании. */
	getCampaignAssetsDir: () => typedError<string, AppError>(__TAURI_INVOKE("get_campaign_assets_dir")),
	/**  Переименовывает кампанию. */
	renameCampaign: (campaignId: string, newName: string, profileId: string) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("rename_campaign", { campaignId, newName, profileId })),
	/**  Удаляет кампанию. */
	deleteCampaign: (campaignId: string, profileId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_campaign", { campaignId, profileId })),
	/**
	 *  Экспортирует активную кампанию как ZIP (db + assets) во временный файл.
	 *  Используется для загрузки на Relay Server.
	 */
	exportCampaignZipToTemp: () => typedError<string, AppError>(__TAURI_INVOKE("export_campaign_zip_to_temp")),
	/**  Сохраняет мультиплеерную кампанию из ZIP (db + assets) в директорию профиля. */
	saveMultiplayerCampaignZip: (roomId: string, serverUrl: string, role: string, displayName: string, zipData: number[], profileId: string) => typedError<string, AppError>(__TAURI_INVOKE("save_multiplayer_campaign_zip", { roomId, serverUrl, role, displayName, zipData, profileId })),
	/**  Создание серверной кампании ГМ-ом (создаёт локально + загружает на сервер) */
	createServerCampaign: (name: string, profileId: string, serverUrl: string, roomName: string, accessCode: string | null) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("create_server_campaign", { name, profileId, serverUrl, roomName, accessCode })),
	/**  Присоединение игрока к серверной кампании */
	joinServerCampaign: (profileId: string, serverUrl: string, roomId: string, token: string, displayName: string) => typedError<CampaignSummary, AppError>(__TAURI_INVOKE("join_server_campaign", { profileId, serverUrl, roomId, token, displayName })),
	/**  Устанавливает видимость карты для игроков */
	setMapVisibleToPlayers: (mapId: string, isVisible: boolean) => typedError<MapSummary, AppError>(__TAURI_INVOKE("set_map_visible_to_players", { mapId, isVisible })),
	/**  Устанавливает активную сцену (карту, которую видят игроки) */
	setActiveScene: (mapId: string) => typedError<null, AppError>(__TAURI_INVOKE("set_active_scene", { mapId })),
	/**  Удаляет карту. Каскадно удалит все токены через FK. */
	deleteMap: (mapId: string) => typedError<null, AppError>(__TAURI_INVOKE("delete_map", { mapId })),
	/**  Возвращает ID активной сцены */
	getActiveScene: () => typedError<string | null, AppError>(__TAURI_INVOKE("get_active_scene")),
	/**  Обновляет видимость карты (используется при синхронизации в мультиплеере) */
	syncMapVisibility: (mapId: string, isVisible: boolean) => typedError<null, AppError>(__TAURI_INVOKE("sync_map_visibility", { mapId, isVisible })),
	/**  Синхронизирует активную сцену (используется при синхронизации в мультиплеере) */
	syncActiveScene: (mapId: string | null) => typedError<null, AppError>(__TAURI_INVOKE("sync_active_scene", { mapId })),
};

/* Types */
export type ActiveCampaign = {
	id: string,
	name: string,
	path: string,
	meta: { [key in string]: string },
};

export type AppError = { kind: "Db"; message: string } | { kind: "Io"; message: string } | { kind: "Validation"; message: string } | { kind: "NotFound" } | { kind: "NoCampaign" };

export type AssetSummary = {
	id: string,
	type: string,
	filename: string,
	contentHash: string,
	mimeType: string,
	sizeBytes: number,
	width: number | null,
	height: number | null,
	thumbFilename: string | null,
	createdAt: number,
};

export type CampaignSummary = {
	id: string,
	name: string,
	fileName: string,
	createdAt: number,
	lastOpenedAt: number | null,
	campaignType?: CampaignType,
	serverConfig?: ServerConfig | null,
};

export type CampaignType = "local" | "server";

export type CharacterDetail = {
	id: string,
	name: string,
	type: string,
	dataJson: string,
	status: string,
	portraitAssetId: string | null,
	createdAt: number,
	updatedAt: number,
	version: number,
};

export type CharacterSummary = {
	id: string,
	name: string,
	type: string,
	status: string,
};

export type CompendiumEntrySummary = {
	id: string,
	compendiumId: string,
	entryKey: string,
	name: string,
	dataJson: string,
};

export type CompendiumSummary = {
	id: string,
	name: string,
	sourcePluginId: string | null,
	type: string,
	version: string,
};

/**  Результат проверки зависимостей */
export type DependencyCheckResult = {
	allSatisfied: boolean,
	missing: string[],
	inactive: string[],
	warnings: string[],
};

export type InstalledPluginSummary = {
	pluginId: string,
	version: string,
	isActive: boolean,
	manifestJson: string,
	installedAt: number,
	compatWarning: string | null,
};

export type JournalEntryDetail = {
	id: string,
	title: string,
	contentMarkdown: string,
	folderPath: string,
	visibility: string,
	playersCanEdit: boolean,
	sortOrder: number,
	createdAt: number,
	updatedAt: number,
	version: number,
};

export type JournalEntrySummary = {
	id: string,
	title: string,
	folderPath: string,
	visibility: string,
	playersCanEdit: boolean,
	sortOrder: number,
};

export type JournalLinkSummary = {
	id: string,
	sourceEntryId: string,
	targetType: string,
	targetId: string,
	linkType: string,
	isDirected: boolean,
	weight: number | null,
	label: string | null,
	isVisibleToPlayers: boolean,
};

export type LinkTypeInfo = {
	key: string,
	label: string,
	directed: boolean,
	color: string | null,
	sourcePluginId: string | null,
};

/**  Параметры импорта изображения карты */
export type MapImageImportOptions = {
	targetWidth: number,
	targetHeight: number,
	gridSize: number,
	cropX: number | null,
	cropY: number | null,
	cropWidth: number | null,
	cropHeight: number | null,
};

export type MapSummary = {
	id: string,
	worldId: string,
	name: string,
	assetId: string | null,
	imagePath: string | null,
	gridSize: number,
	gridOffsetX: number | null,
	gridOffsetY: number | null,
	scale: number | null,
	width: number,
	height: number,
	sortOrder: number,
	isVisibleToPlayers: boolean,
	version: number,
	fogData: string | null,
};

export type MultiplayerSessionInfo = {
	roomId: string,
	serverUrl: string,
	role: string,
	displayName: string,
	connectedAt: number,
	lastSyncAt: number,
};

export type PluginSheetInfo = {
	pluginId: string,
	sheetKey: string,
	name: string,
	filePath: string,
};

export type PluginThemeInfo = {
	pluginId: string,
	themeKey: string,
	filePath: string,
};

/**  Информация о профиле */
export type ProfileInfo = {
	id: string,
	name: string,
	avatarPath: string | null,
	createdAt: number,
	lastActiveAt: number,
};

export type ServerConfig = {
	serverUrl: string,
	roomId: string,
	token: string,
	displayName: string,
	role: string,
};

export type TokenSummary = {
	id: string,
	mapId: string,
	characterId: string | null,
	assetId: string | null,
	x: number | null,
	y: number | null,
	rotation: number | null,
	scale: number | null,
	isVisible: boolean,
	layer: string,
	version: number,
	characterName: string | null,
};

/* Tauri Specta runtime */
async function typedError<T, E>(result: Promise<T>): Promise<{ status: "ok"; data: T } | { status: "error"; error: E }> {
    try {
        return { status: "ok", data: await result };
    } catch (e) {
        if (e instanceof Error) throw e;
        return { status: "error", error: e as any };
    }
}

```

---
## Файл: ./src/shared/api/client.ts
```
import { commands, type ActiveCampaign, type CampaignSummary } from './bindings';

async function unwrap<T, E>(
    promise: Promise<{ status: "ok"; data: T } | { status: "error"; error: E }>
): Promise<T> {
    const result = await promise;

    if (result.status === "ok") {
        return result.data;
    }

    throw result.error;
}

export async function createCampaign(name: string): Promise<CampaignSummary> {
    return unwrap(commands.createCampaign(name));
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
    return unwrap(commands.listCampaigns());
}

export async function openCampaign(id: string): Promise<CampaignSummary> {
    return unwrap(commands.openCampaign(id));
}

export async function closeCampaign(): Promise<void> {
    unwrap(commands.closeCampaign());
}

export async function getActiveCampaign(): Promise<ActiveCampaign | null> {
    return unwrap(commands.getActiveCampaign());
}```

---
## Файл: ./src/shared/api/hooks.ts
```
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commands, TokenSummary } from './bindings';
import { useWorkspaceStore } from '../stores/workspace';
import { logError } from '../lib/debug';
import type { QueryClient } from '@tanstack/react-query';
import { useUiStore } from '../stores/ui';

function invalidatePluginRelatedData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['plugins'] });

  // Темы плагинов
  queryClient.invalidateQueries({ queryKey: ['pluginThemes'] });
  queryClient.invalidateQueries({ queryKey: ['pluginThemeCss'] });

  // Листы плагинов
  queryClient.invalidateQueries({ queryKey: ['pluginSheets'] });
  queryClient.invalidateQueries({ queryKey: ['pluginSheet'] });

  // Компендии, которые могли прийти из плагинов
  queryClient.invalidateQueries({ queryKey: ['compendiums'] });
  queryClient.invalidateQueries({ queryKey: ['compendiumEntries'] });

  queryClient.invalidateQueries({ queryKey: ['linkTypes'] });
}

export async function unwrap<T, E extends { kind: string; message?: string }>(
  promise: Promise<{ status: "ok"; data: T } | { status: "error"; error: E }>
): Promise<T> {
  const result = await promise;

  if (result.status === "ok") {
    return result.data;
  }

  const error = result.error;
  const message = 'message' in error ? error.message : 'Unknown error';

  throw new Error(`[${error.kind}] ${message}`);
}

export function useActiveCampaign() {
  return useQuery({
    queryKey: ['activeCampaign'],
    queryFn: () => unwrap(commands.getActiveCampaign()),
    retry: false,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, profileId }: { name: string; profileId: string }) => unwrap(commands.createCampaign(name, profileId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create campaign:', error.message);
    },
  });
}

export function useDeleteCampaign(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, profileId: pid }: { campaignId: string; profileId: string }) =>
      unwrap(commands.deleteCampaign(campaignId, pid)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', profileId] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },

    onError: (error) => {
      logError('api', 'delete campaign failed', error);
    },
  });
}

export function useOpenCampaign(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unwrap(commands.openCampaign(id, profileId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', profileId] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },
    onError: (error: Error) => {
      console.error('Failed to open campaign:', error.message);
    },
  });
}

export function useCloseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unwrap(commands.closeCampaign()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });

      useWorkspaceStore.getState().clearLastCampaign();
    },
  });
}

export function useMaps(enabled: boolean) {
  return useQuery({
    queryKey: ['maps'],
    queryFn: () => unwrap(commands.listMaps()),
    enabled,
    retry: false,
  });
}

export function useMap(id?: string) {
  return useQuery({
    queryKey: ['map', id],
    queryFn: () => unwrap(commands.getMap(id!)),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, width, height, grid_size }: { name: string; width: number; height: number; grid_size: number }) => unwrap(commands.createMap(name, width, height, grid_size)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
  });
}


export function useTokens(mapId?: string) {
  return useQuery({
    queryKey: ['tokens', mapId],
    queryFn: () => unwrap(commands.listTokens(mapId!)),
    enabled: Boolean(mapId),
    retry: false,
  });
}

type CreateTokenVars = {
  mapId: string;
  x: number;
  y: number;
  characterId?: string | null;
};

type MoveTokenVars = {
  mapId: string;
  tokenId: string;
  x: number;
  y: number;
};

type DeleteTokenVars = {
  mapId: string;
  tokenId: string;
};

export function useCreateToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mapId, x, y, characterId }: CreateTokenVars) =>
      unwrap(commands.createToken(mapId, x, y, characterId ?? null)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });

      queryClient.invalidateQueries({
        queryKey: ['allTokens'],
      });
    },

    onError: (error) => {
      logError('api', 'create token failed', error);
    },
  });
}

export function useMoveToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      tokenId,
      x,
      y,
    }: MoveTokenVars) =>
      unwrap(commands.moveToken(mapId, tokenId, x, y)),

    onSuccess: (_data, variables) => {
      // Обновляем кэш карты in-place
      queryClient.setQueryData(
        ['tokens', variables.mapId],
        (oldTokens: TokenSummary[]) => {
          if (!oldTokens) return oldTokens;

          return oldTokens.map((token) => {
            if (token.id === variables.tokenId) {
              return { ...token, x: variables.x, y: variables.y };
            }
            return token;
          });
        },
      );

      // Обновляем кэш дерева in-place
      queryClient.setQueryData(
        ['allTokens'],
        (oldTokens: TokenSummary[]) => {
          if (!oldTokens) return oldTokens;

          return oldTokens.map((token) => {
            if (token.id === variables.tokenId) {
              return { ...token, x: variables.x, y: variables.y };
            }
            return token;
          });
        },
      );
    },

    onError: (error) => {
      logError('api', 'move token failed', error);
    },
  });
}

export function useDeleteToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      tokenId,
    }: DeleteTokenVars) =>
      unwrap(commands.deleteToken(mapId, tokenId)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });

      queryClient.invalidateQueries({
        queryKey: ['allTokens'],
      });
    },

    onError: (error) => {
      logError('api', 'delete token failed', error);
    },
  });
}

export function useAllTokens(enabled: boolean = true) {
  return useQuery({
    queryKey: ['allTokens'],
    queryFn: () => unwrap(commands.listAllTokens()),
    enabled,
    retry: false,
  });
}

export function useCharacters(enabled: boolean = true) {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => unwrap(commands.listCharacters()),
    enabled,
    retry: false,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      characterType,
    }: {
      name: string;
      characterType: 'pc' | 'npc' | 'monster';
    }) => unwrap(commands.createCharacter(name, characterType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },

    onError: (error) => {
      logError('api', 'create character failed', error);
    },
  });
}


export function useJournalEntries(enabled: boolean = true) {
  return useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => unwrap(commands.listJournalEntries()),
    enabled,
    retry: false,
  });
}

export function useJournalEntry(id?: string) {
  return useQuery({
    queryKey: ['journalEntry', id],
    queryFn: () => unwrap(commands.getJournalEntry(id!)),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      folderPath,
    }: {
      title: string;
      folderPath: string;
    }) => unwrap(commands.createJournalEntry(title, folderPath)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },

    onError: (error) => {
      logError('api', 'create journal entry failed', error);
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
      contentMarkdown,
      folderPath,
      visibility,
      playersCanEdit,
    }: {
      id: string;
      title: string;
      contentMarkdown: string;
      folderPath: string;
      visibility: string;
      playersCanEdit: boolean;
    }) =>
      unwrap(
        commands.updateJournalEntry(
          id,
          title,
          contentMarkdown,
          folderPath,
          visibility,
          playersCanEdit,
        ),
      ),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({
        queryKey: ['journalEntry', variables.id],
      });
    },

    onError: (error) => {
      logError('api', 'update journal entry failed', error);
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      unwrap(commands.deleteJournalEntry(id)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.removeQueries({
        queryKey: ['journalEntry', variables.id],
      });
    },

    onError: (error) => {
      logError('api', 'delete journal entry failed', error);
    },
  });
}

export function useCharacter(id?: string) {
  return useQuery({
    queryKey: ['character', id],
    queryFn: () => unwrap(commands.getCharacter(id!)),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      characterType,
      dataJson,
    }: {
      id: string;
      name: string;
      characterType: 'pc' | 'npc' | 'monster';
      dataJson: string;
    }) =>
      unwrap(
        commands.updateCharacter(id, name, characterType, dataJson),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({
        queryKey: ['character', variables.id],
      });

      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },

    onError: (error) => {
      logError('api', 'update character failed', error);
    },
  });
}

export async function readCampaignAssetDataUrl(
  relativePath: string,
): Promise<string> {
  return unwrap(commands.readCampaignAssetDataUrl(relativePath));
}

// export function useImportMapImage() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       mapId,
//       sourcePath,
//     }: {
//       mapId: string;
//       sourcePath: string;
//     }) => unwrap(commands.importMapImage(mapId, sourcePath)),

//     onSuccess: (_data, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: ['map', variables.mapId],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ['maps'],
//       });
//     },

//     onError: (error) => {
//       logError('api', 'import map image failed', error);
//     },
//   });
// }

export function useAssignTokenCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      tokenId,
      characterId,
    }: {
      mapId: string;
      tokenId: string;
      characterId: string | null;
    }) => unwrap(commands.assignTokenCharacter(mapId, tokenId, characterId)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });

      queryClient.invalidateQueries({
        queryKey: ['allTokens'],
      });

      queryClient.invalidateQueries({
        queryKey: ['characters'],
      });
    },

    onError: (error) => {
      logError('api', 'assign token character failed', error);
    },
  });
}

export function useUpdateMapFog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      fogData,
    }: {
      mapId: string;
      fogData: string | null;
    }) => unwrap(commands.updateMapFog(mapId, fogData)),

    onSuccess: (_data, variables) => {
      // Обновляем кэш карты, чтобы при переключении вкладок туман не пропадал
      queryClient.setQueryData(['map', variables.mapId], (old: any) => {
        if (!old) return old;
        return { ...old, fogData: variables.fogData };
      });
    },

    onError: (error) => {
      logError('api', 'update map fog failed', error);
    },
  });
}

export async function getCharacterDetail(id: string) {
  return unwrap(commands.getCharacter(id));
}

export function useCompendiums(enabled: boolean = true) {
  return useQuery({
    queryKey: ['compendiums'],
    queryFn: () => unwrap(commands.listCompendiums()),
    enabled,
    retry: false,
  });
}

export function useCompendiumEntries(compendiumId?: string) {
  return useQuery({
    queryKey: ['compendiumEntries', compendiumId],
    queryFn: () => unwrap(commands.listCompendiumEntries(compendiumId!)),
    enabled: Boolean(compendiumId),
    retry: false,
  });
}

export function useCreateCompendium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      compendiumType,
    }: {
      name: string;
      compendiumType: string;
    }) => unwrap(commands.createCompendium(name, compendiumType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'create compendium failed', error);
    },
  });
}

export function useCreateCompendiumEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      compendiumId,
      entryKey,
      name,
      dataJson,
    }: {
      compendiumId: string;
      entryKey: string;
      name: string;
      dataJson: string;
    }) =>
      unwrap(
        commands.createCompendiumEntry(compendiumId, entryKey, name, dataJson),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['compendiumEntries', variables.compendiumId],
      });
    },

    onError: (error) => {
      logError('api', 'create compendium entry failed', error);
    },
  });
}

export function useUpdateCompendium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      compendiumType,
    }: {
      id: string;
      name: string;
      compendiumType: string;
    }) => unwrap(commands.updateCompendium(id, name, compendiumType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'update compendium failed', error);
    },
  });
}

export function useDeleteCompendium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      unwrap(commands.deleteCompendium(id)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'delete compendium failed', error);
    },
  });
}

export function useUpdateCompendiumEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      dataJson,
    }: {
      id: string;
      name: string;
      dataJson: string;
    }) => unwrap(commands.updateCompendiumEntry(id, name, dataJson)),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['compendiumEntries', data.compendiumId],
      });
    },

    onError: (error) => {
      logError('api', 'update compendium entry failed', error);
    },
  });
}

export function useDeleteCompendiumEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, compendiumId }: { id: string; compendiumId: string }) =>
      unwrap(commands.deleteCompendiumEntry(id)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['compendiumEntries', variables.compendiumId],
      });
    },

    onError: (error) => {
      logError('api', 'delete compendium entry failed', error);
    },
  });
}

export function useExportCampaign() {
  return useMutation({
    mutationFn: (destinationPath: string) =>
      unwrap(commands.exportCampaign(destinationPath)),

    onError: (error) => {
      logError('api', 'export campaign failed', error);
    },
  });
}

export function useImportCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourcePath,
      profileId,
    }: {
      sourcePath: string;
      profileId: string;
    }) => unwrap(commands.importCampaign(sourcePath, profileId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },

    onError: (error) => {
      logError('api', 'import campaign failed', error);
    },
  });
}

export function useCampaigns(profileId: string | null) {
  return useQuery({
    queryKey: ['campaigns', profileId],
    queryFn: () => unwrap(commands.listCampaigns(profileId!)),
    enabled: Boolean(profileId),
    retry: false,
  });
}

export function useMultiplayerSessions(profileId: string | null) {
  return useQuery({
    queryKey: ['multiplayerSessions', profileId],
    queryFn: () => unwrap(commands.listMultiplayerSessions(profileId!)),
    enabled: Boolean(profileId),
    retry: false,
  });
}

export function useInstalledPlugins(enabled: boolean = true) {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: () => unwrap(commands.listInstalledPlugins()),
    enabled,
    retry: false,
  });
}

export function useInstallPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourcePath: string) =>
      unwrap(commands.installPluginFromFile(sourcePath)),

    onSuccess: () => {
      invalidatePluginRelatedData(queryClient);
    },

    onError: (error) => {
      logError('api', 'install plugin failed', error);
    },
  });
}

export function useSetPluginActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pluginId,
      isActive,
    }: {
      pluginId: string;
      isActive: boolean;
    }) => unwrap(commands.setPluginActive(pluginId, isActive)),

    onSuccess: () => {
      invalidatePluginRelatedData(queryClient);
    },

    onError: (error) => {
      logError('api', 'set plugin active failed', error);
    },
  });
}

export function useUninstallPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pluginId: string) =>
      unwrap(commands.uninstallPlugin(pluginId)),

    onSuccess: () => {
      invalidatePluginRelatedData(queryClient);
    },

    onError: (error) => {
      logError('api', 'uninstall plugin failed', error);
    },
  });
}

export function usePluginSheets(enabled: boolean = true) {
  return useQuery({
    queryKey: ['pluginSheets'],
    queryFn: () => unwrap(commands.listPluginSheets()),
    enabled,
    retry: false,
  });
}

export function usePluginSheet(pluginId?: string, sheetKey?: string) {
  return useQuery({
    queryKey: ['pluginSheet', pluginId, sheetKey],
    queryFn: () => unwrap(commands.getPluginSheet(pluginId!, sheetKey!)),
    enabled: Boolean(pluginId && sheetKey),
    retry: false,
  });
}

export function usePluginThemes(enabled: boolean = true) {
  return useQuery({
    queryKey: ['pluginThemes'],
    queryFn: () => unwrap(commands.listPluginThemes()),
    enabled,
    retry: false,
  });
}

export function usePluginThemeCss(pluginId?: string, themeKey?: string) {
  return useQuery({
    queryKey: ['pluginThemeCss', pluginId, themeKey],
    queryFn: () => unwrap(commands.getPluginThemeCss(pluginId!, themeKey!)),
    enabled: Boolean(pluginId && themeKey),
    retry: false,
  });
}

export function useJournalLinks(entryId?: string) {
  return useQuery({
    queryKey: ['journalLinks', entryId],
    queryFn: () => unwrap(commands.listJournalLinks(entryId!)),
    enabled: Boolean(entryId),
    retry: false,
  });
}

export function useCreateJournalLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceEntryId,
      targetType,
      targetId,
      linkType,
      isDirected,
      label,
    }: {
      sourceEntryId: string;
      targetType: string;
      targetId: string;
      linkType: string;
      isDirected: boolean;
      label?: string | null;
    }) =>
      unwrap(
        commands.createJournalLink(
          sourceEntryId,
          targetType,
          targetId,
          linkType,
          isDirected,
          label ?? null,
        ),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['journalLinks', variables.sourceEntryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['journalLinks', variables.targetId],
      });
    },

    onError: (error) => {
      logError('api', 'create journal link failed', error);
    },
  });
}

export function useDeleteJournalLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, entryId }: { id: string; entryId: string }) =>
      unwrap(commands.deleteJournalLink(id)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['journalLinks', variables.entryId],
      });
    },

    onError: (error) => {
      logError('api', 'delete journal link failed', error);
    },
  });
}

export function useLinkTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ['linkTypes'],
    queryFn: () => unwrap(commands.listLinkTypes()),
    enabled,
    retry: false,
  });
}

export function useInstallBuiltinPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pluginName: string) =>
      unwrap(commands.installBuiltinPlugin(pluginName)),

    onSuccess: () => {
      invalidatePluginRelatedData(queryClient);
    },

    onError: (error) => {
      logError('api', 'install builtin plugin failed', error);
    },
  });
}

export function useImportAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourcePath,
      assetType,
    }: {
      sourcePath: string;
      assetType: string;
    }) => unwrap(commands.importAsset(sourcePath, assetType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },

    onError: (error) => {
      logError('api', 'import asset failed', error);
    },
  });
}

export interface MapImageImportOptions {
  targetWidth: number;
  targetHeight: number;
  gridSize: number;
  cropX: number | null;
  cropY: number | null;
  cropWidth: number | null;
  cropHeight: number | null;
}

export function useImportMapImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      sourcePath,
      options,
    }: {
      mapId: string;
      sourcePath: string;
      options: MapImageImportOptions;
    }) => unwrap(commands.importMapImage(mapId, sourcePath, options)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['map', variables.mapId],
      });
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },

    onError: (error) => {
      logError('api', 'import map image failed', error);
    },
  });
}

export function useReadFileAsDataUrl() {
  return useMutation({
    mutationFn: (filePath: string) =>
      unwrap(commands.readFileAsDataUrl(filePath)),

    onError: (error) => {
      logError('api', 'read file as data url failed', error);
    },
  });
}
export function useAssetDataUrl(assetId?: string) {
  return useQuery({
    queryKey: ['assetDataUrl', assetId],
    queryFn: () => unwrap(commands.getAssetDataUrl(assetId!)),
    enabled: Boolean(assetId),
    retry: false,
    staleTime: Infinity,
  });
}

export interface DependencyCheckResult {
  allSatisfied: boolean;
  missing: string[];
  inactive: string[];
  warnings: string[];
}

export function useValidatePluginDependencies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pluginId: string) =>
      unwrap(commands.validatePluginDependencies(pluginId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },

    onError: (error) => {
      logError('api', 'validate plugin dependencies failed', error);
    },
  });
}

export function useCanDeactivatePlugin() {
  return useMutation({
    mutationFn: (pluginId: string) =>
      unwrap(commands.canDeactivatePlugin(pluginId)),

    onError: (error) => {
      logError('api', 'can deactivate plugin check failed', error);
    },
  });
}

export function useCanUninstallPlugin() {
  return useMutation({
    mutationFn: (pluginId: string) =>
      unwrap(commands.canUninstallPlugin(pluginId)),

    onError: (error) => {
      logError('api', 'can uninstall plugin check failed', error);
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => unwrap(commands.listProfiles()),
    retry: false,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => unwrap(commands.createProfile(name)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },

    onError: (error) => {
      logError('api', 'create profile failed', error);
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => unwrap(commands.deleteProfile(profileId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },

    onError: (error) => {
      logError('api', 'delete profile failed', error);
    },
  });
}

export function useTouchProfile() {
  return useMutation({
    mutationFn: (profileId: string) => unwrap(commands.touchProfile(profileId)),

    onError: (error) => {
      logError('api', 'touch profile failed', error);
    },
  });
}

export function useOpenMultiplayerCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, profileId }: { roomId: string; profileId: string }) =>
      unwrap(commands.openMultiplayerCampaign(roomId, profileId)),

    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });

      // Обновляем Zustand store
      useUiStore.getState().setActiveCampaign(campaign);
    },

    onError: (error) => {
      logError('api', 'open multiplayer campaign failed', error);
    },
  });
}

export function useSetMapVisibleToPlayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      isVisible,
    }: {
      mapId: string;
      isVisible: boolean;
    }) => unwrap(commands.setMapVisibleToPlayers(mapId, isVisible)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      queryClient.invalidateQueries({
        queryKey: ['map', variables.mapId],
      });
    },

    onError: (error) => {
      logError('api', 'set map visibility failed', error);
    },
  });
}

export function useSetActiveScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mapId: string) => unwrap(commands.setActiveScene(mapId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeScene'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },

    onError: (error) => {
      logError('api', 'set active scene failed', error);
    },
  });
}

export function useActiveScene(enabled: boolean = true) {
  return useQuery({
    queryKey: ['activeScene'],
    queryFn: () => unwrap(commands.getActiveScene()),
    enabled,
    retry: false,
  });
}

export function useDeleteMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mapId: string) => unwrap(commands.deleteMap(mapId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      queryClient.invalidateQueries({ queryKey: ['activeScene'] });
    },

    onError: (error) => {
      logError('api', 'delete map failed', error);
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (characterId: string) =>
      unwrap(commands.deleteCharacter(characterId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },

    onError: (error) => {
      logError('api', 'delete character failed', error);
    },
  });
}

export function useCreateServerCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      profileId,
      serverUrl,
      roomName,
      accessCode,
    }: {
      name: string;
      profileId: string;
      serverUrl: string;
      roomName: string;
      accessCode?: string;
    }) =>
      unwrap(
        commands.createServerCampaign(
          name,
          profileId,
          serverUrl,
          roomName,
          accessCode ?? null,
        ),
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },

    onError: (error) => {
      console.error('Failed to create server campaign:', error.message);
    },
  });
}

export function useJoinServerCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileId,
      serverUrl,
      roomId,
      token,
      displayName,
    }: {
      profileId: string;
      serverUrl: string;
      roomId: string;
      token: string;
      displayName: string;
    }) =>
      unwrap(
        commands.joinServerCampaign(
          profileId,
          serverUrl,
          roomId,
          token,
          displayName,
        ),
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },

    onError: (error) => {
      console.error('Failed to join server campaign:', error.message);
    },
  });
}```

---
## Файл: ./src/shared/hooks/useAutoOpenLastCampaign.ts
```
import { useEffect, useRef } from 'react';

import {
  useActiveCampaign,
  useCampaigns,
  useOpenCampaign,
} from '../api/hooks';
import { logDebug, logError } from '../lib/debug';
import { useWorkspaceStore } from '../stores/workspace';

export function useAutoOpenLastCampaign(enabled: boolean) {
  const { data: activeCampaign, isLoading: isActiveLoading } =
    useActiveCampaign();

  const { data: campaigns, isLoading: areCampaignsLoading } =
    useCampaigns();

  const lastCampaignId = useWorkspaceStore((state) => state.lastCampaignId);
  const clearLastCampaign = useWorkspaceStore(
    (state) => state.clearLastCampaign,
  );

  const openCampaign = useOpenCampaign();

  const attempted = useRef(false);

  useEffect(() => {
    if (!enabled) {
      logDebug('auto-open', 'disabled, workspace not hydrated yet');
      return;
    }

    if (attempted.current) {
      return;
    }

    logDebug('auto-open', 'checking session restore', {
      isActiveLoading,
      areCampaignsLoading,
      activeCampaignId: activeCampaign?.id ?? null,
      lastCampaignId,
      campaignsCount: campaigns?.length ?? 0,
    });

    if (isActiveLoading || areCampaignsLoading) {
      return;
    }

    attempted.current = true;

    if (activeCampaign) {
      logDebug('auto-open', 'campaign already active, nothing to restore');
      return;
    }

    if (!lastCampaignId) {
      logDebug('auto-open', 'no lastCampaignId, showing campaign picker');
      return;
    }

    const exists = campaigns?.some(
      (campaign) => campaign.id === lastCampaignId,
    );

    if (!exists) {
      logDebug(
        'auto-open',
        'lastCampaignId not found in campaign list, clearing',
        {
          lastCampaignId,
        },
      );

      clearLastCampaign();
      return;
    }

    logDebug('auto-open', 'opening last campaign', lastCampaignId);

    openCampaign.mutate(lastCampaignId, {
      onError: (error) => {
        logError('auto-open', 'failed to open last campaign', error);
        clearLastCampaign();
      },
    });
  }, [
    enabled,
    isActiveLoading,
    areCampaignsLoading,
    activeCampaign,
    campaigns,
    lastCampaignId,
    clearLastCampaign,
    openCampaign,
  ]);
}```

---
## Файл: ./src/shared/hooks/useDraggable.ts
```
import { useCallback } from 'react';

import { useDragStore, type DragItem } from '../stores/drag';

interface UseDraggableOptions {
  item: DragItem;
  disabled?: boolean;
}

interface UseDraggableResult {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
  isDragging: boolean;
}

export function useDraggable({
  item,
  disabled = false,
}: UseDraggableOptions): UseDraggableResult {
  const startDrag = useDragStore((s) => s.startDrag);
  const updatePointer = useDragStore((s) => s.updatePointer);
  const endDrag = useDragStore((s) => s.endDrag);
  const dragging = useDragStore((s) => s.dragging);

  const isDragging = dragging?.id === item.id && dragging?.kind === item.kind;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.button !== 0) return; // Только ЛКМ

      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      let started = false;

      const handlePointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!started && dx * dx + dy * dy < 25) {
          // Меньше 5px движения — ещё не drag
          return;
        }

        if (!started) {
          started = true;
          startDrag(item);
        }

        updatePointer({ x: ev.clientX, y: ev.clientY });
      };

      const handlePointerUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (!started) {
          return; // Это был обычный клик
        }

        // НАДЕЖНЫЙ СПОСОБ: ищем элемент под курсором в момент отпускания
        // Скрываем drag-overlay на мгновение, чтобы elementFromPoint не попал в него
        const overlay = document.querySelector('.drag-overlay') as HTMLElement;
        const wasHidden = overlay ? overlay.style.display === 'none' : false;
        
        if (overlay) overlay.style.display = 'none';
        
        const dropElement = document.elementFromPoint(ev.clientX, ev.clientY);
        
        if (overlay && !wasHidden) overlay.style.display = ''; // Возвращаем как было

        if (dropElement) {
          // Ищем ближайший родительский элемент с нашими data-атрибутами
          // (на случай, если курсор оказался над иконкой или текстом внутри drop-зоны)
          const targetElement = dropElement.closest('[data-dnd-kind]') as HTMLElement | null;

          if (targetElement) {
            const kind = targetElement.dataset.dndKind as 'map' | 'map-canvas';
            const id = targetElement.dataset.dndId;

            if (kind && id) {
              window.dispatchEvent(
                new CustomEvent('dndstudio:drop', {
                  detail: {
                    item,
                    target: { kind, id },
                    pointer: { x: ev.clientX, y: ev.clientY },
                  },
                })
              );
            }
          }
        }

        endDrag();
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [disabled, item, startDrag, updatePointer, endDrag],
  );

  return {
    handlers: { onPointerDown: handlePointerDown },
    isDragging,
  };
}```

---
## Файл: ./src/shared/hooks/useDropTarget.ts
```
import { useCallback, useEffect, useRef, useState } from 'react';

import { useDragStore, type DragItem, type DropTarget } from '../stores/drag';

interface UseDropTargetOptions<TTarget extends DropTarget> {
  target: TTarget;
  accepts: (item: DragItem) => boolean;
  onDrop: (item: DragItem, target: TTarget) => void;
}

interface UseDropTargetResult {
  ref: React.RefCallback<HTMLElement>;
  isOver: boolean;
  isAccepting: boolean;
}

export function useDropTarget<TTarget extends DropTarget>({
  target,
  accepts,
  onDrop,
}: UseDropTargetOptions<TTarget>): UseDropTargetResult {
  const dragging = useDragStore((s) => s.dragging);
  const setActiveTarget = useDragStore((s) => s.setActiveTarget);

  const [isOver, setIsOver] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const isAccepting = dragging !== null && accepts(dragging);

  // Обработчик drop события
  useEffect(() => {
    const handleDrop = (event: Event) => {
      const custom = event as CustomEvent<{
        item: DragItem;
        target: DropTarget;
        pointer: { x: number; y: number };
      }>;

      // Сравниваем по kind и id
      if (
        custom.detail.target.kind === target.kind &&
        custom.detail.target.id === target.id &&
        accepts(custom.detail.item)
      ) {
        onDrop(custom.detail.item, custom.detail.target as TTarget);
      }
    };

    window.addEventListener('dndstudio:drop', handleDrop);
    return () => window.removeEventListener('dndstudio:drop', handleDrop);
  }, [target, accepts, onDrop]);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('pointerenter', handleEnter);
        elementRef.current.removeEventListener('pointerleave', handleLeave);
        // Очищаем data-атрибуты при размонтировании
        delete elementRef.current.dataset.dndKind;
        delete elementRef.current.dataset.dndId;
      }

      elementRef.current = element;

      if (!element) return;

      // Сохраняем данные прямо в DOM для elementFromPoint
      element.dataset.dndKind = target.kind;
      element.dataset.dndId = target.id;

      element.addEventListener('pointerenter', handleEnter);
      element.addEventListener('pointerleave', handleLeave);

      function handleEnter() {
        if (!dragging || !accepts(dragging)) return;
        setIsOver(true);
        setActiveTarget(target);
      }

      function handleLeave() {
        setIsOver(false);
        if (
          useDragStore.getState().activeTarget?.id === target.id &&
          useDragStore.getState().activeTarget?.kind === target.kind
        ) {
          setActiveTarget(null);
        }
      }
    },
    [dragging, accepts, target, setActiveTarget],
  );

  return { ref, isOver, isAccepting };
}```

---
## Файл: ./src/shared/hooks/useGlobalShortcuts.ts
```
import { useEffect } from 'react';

import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

export function useGlobalShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      if (!mod) {
        return;
      }

      const ui = useUiStore.getState();
      const workspace = useWorkspaceStore.getState();

      // Ctrl+B / Cmd+B — left panel
      if (event.code === 'KeyB' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        ui.toggleLeft();
        return;
      }

      // Ctrl+Shift+B / Cmd+Shift+B — right panel
      if (event.code === 'KeyB' && event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        ui.toggleRight();
        return;
      }

      // Ctrl+J / Cmd+J — bottom panel
      if (event.code === 'KeyJ') {
        event.preventDefault();
        event.stopPropagation();
        ui.toggleBottom();
        return;
      }

      // Ctrl+W / Cmd+W — close active tab
      if (event.code === 'KeyW') {
        event.preventDefault();
        event.stopPropagation();
        workspace.closeActiveTab();
        return;
      }

      // Ctrl+T / Cmd+T — new placeholder tab, если открыта кампания
      if (event.code === 'KeyT') {
        event.preventDefault();
        event.stopPropagation();

        if (workspace.campaignId) {
          workspace.openTab({
            id: `placeholder:${Date.now()}`,
            kind: 'placeholder',
            title: 'New Tab',
          });
        }

        return;
      }
    };

    window.addEventListener('keydown', onKeyDown, {
      capture: true,
      passive: false,
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown, {
        capture: true,
      });
    };
  }, []);
}```

---
## Файл: ./src/shared/hooks/useKeyboardShortcuts.ts
```
import { useEffect, useRef } from 'react';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  /** Если true — shortcut срабатывает даже в input/textarea */
  global?: boolean;
  /** Описание для UI (отображается в меню) */
  label?: string;
}

/**
 * Регистрирует глобальные keyboard shortcuts.
 * Автоматически отписывается при unmount.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        // Используем event.code вместо event.key — он не зависит от раскладки
        if (
          e.code === shortcut.key &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          // Пропускаем shortcut если фокус в input, кроме global
          if (isEditable && !shortcut.global) {
            continue;
          }

          e.preventDefault();
          e.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    };

    // capture: true — слушаем раньше других обработчиков
    // passive: false — позволяем вызывать preventDefault/stopPropagation
    window.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false,
    });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);
}

/** Форматирует shortcut для отображения в меню */
export function formatShortcut(shortcut: Omit<Shortcut, 'handler' | 'label'>): string {
  const parts: string[] = [];

  const isMac = navigator.platform.toLowerCase().includes('mac');
  const mod = isMac ? '⌘' : 'Ctrl';

  if (shortcut.ctrl) parts.push(mod);
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');

  // Извлекаем букву из формата "KeyN" → "N", "KeyB" → "B"
  let keyLabel = shortcut.key;

  const keyMap: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Escape: 'Esc',
    Enter: '↵',
    Backspace: '⌫',
    Delete: 'Del',
    Space: 'Space',
  };

  if (keyMap[keyLabel]) {
    keyLabel = keyMap[keyLabel];
  } else if (keyLabel.startsWith('Key')) {
    keyLabel = keyLabel.slice(3);
  } else if (keyLabel.startsWith('Digit')) {
    keyLabel = keyLabel.slice(5);
  } else if (keyLabel.startsWith('Numpad')) {
    keyLabel = keyLabel.slice(6);
  }

  parts.push(keyLabel);

  return parts.join(isMac ? '' : '+');
}
```

---
## Файл: ./src/shared/hooks/useMultiplayerSync.ts
```
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { relayClient } from '../services/relayClient';
import type { Envelope } from '../services/relayClient';
import { useUiStore } from '../stores/ui';
import { useChatStore } from '../stores/chat';
import { commands } from '../api/bindings';

export function useMultiplayerSync() {
    const queryClient = useQueryClient();
    const connectionStatus = useUiStore((state) => state.connectionStatus);

    useEffect(() => {
        if (connectionStatus !== 'connected') {
            return;
        }

        console.log('[MultiplayerSync] Subscribing to relay events');

        const unsubscribers: Array<() => void> = [];

        // === ЧАТ ===
        unsubscribers.push(
            relayClient.on('chat_message', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    channel: string;
                    text: string;
                    sender_name: string;
                };

                console.log('[MultiplayerSync] chat_message received:', payload);

                // Добавляем в chat store
                useChatStore.getState().addMessage({
                    id: envelope.id, // Используем ID envelope для дедупликации
                    text: payload.text,
                    senderId: envelope.sender_id,
                    senderName: payload.sender_name,
                    timestamp: envelope.ts,
                    type: 'user',
                });
            }),
        );

        // === JOIN/LEAVE — системные сообщения ===
        unsubscribers.push(
            relayClient.on('join', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    display_name?: string;
                    role?: string;
                    user_id?: string;
                };

                // Только уведомления о других пользователях (не о себе)
                if (payload.display_name && envelope.sender_id !== relayClient.connectedUserId) {
                    useChatStore.getState().addSystemMessage(
                        `${payload.display_name} joined the room (${payload.role})`,
                    );
                }
            }),
        );

        unsubscribers.push(
            relayClient.on('leave', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    user_id?: string;
                };

                if (payload.user_id && payload.user_id !== relayClient.connectedUserId) {
                    useChatStore.getState().addSystemMessage(
                        `A player left the room`,
                    );
                }
            }),
        );

        // === БРОСКИ КОСТЕЙ ===
        unsubscribers.push(
            relayClient.on('dice_roll', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    notation: string;
                    result: number;
                    roller_name: string;
                };

                if (envelope.sender_id === relayClient.connectedUserId) {
                    return;
                }

                console.log('[MultiplayerSync] dice_roll:', payload);

                useChatStore.getState().addDiceMessage(
                    payload.roller_name,
                    payload.notation,
                    payload.result,
                );
            }),
        );

        // === ПЕРЕМЕЩЕНИЕ ТОКЕНОВ ===
        unsubscribers.push(
            relayClient.on('token_move', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    map_id: string;
                    x: number;
                    y: number;
                    rotation?: number;
                };

                // Обновляем кэш карты
                queryClient.setQueryData(
                    ['tokens', payload.map_id],
                    (oldTokens: any[]) => {
                        if (!oldTokens) return oldTokens;

                        return oldTokens.map((token) => {
                            if (token.id === payload.token_id) {
                                return {
                                    ...token,
                                    x: payload.x,
                                    y: payload.y,
                                    rotation: payload.rotation ?? token.rotation,
                                };
                            }
                            return token;
                        });
                    },
                );

                // Обновляем кэш дерева
                queryClient.setQueryData(
                    ['allTokens'],
                    (oldTokens: any[]) => {
                        if (!oldTokens) return oldTokens;

                        return oldTokens.map((token) => {
                            if (token.id === payload.token_id) {
                                return {
                                    ...token,
                                    x: payload.x,
                                    y: payload.y,
                                    rotation: payload.rotation ?? token.rotation,
                                };
                            }
                            return token;
                        });
                    },
                );
            }),
        );

        // === СОЗДАНИЕ ТОКЕНОВ ===
        unsubscribers.push(
            relayClient.on('token_create', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    map_id: string;
                };

                queryClient.invalidateQueries({
                    queryKey: ['tokens', payload.map_id],
                });

                queryClient.invalidateQueries({
                    queryKey: ['allTokens'],
                });
            }),
        );

        // === УДАЛЕНИЕ ТОКЕНОВ ===
        unsubscribers.push(
            relayClient.on('token_delete', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    map_id: string;
                };

                // Удаляем из кэша карты
                queryClient.setQueryData(
                    ['tokens', payload.map_id],
                    (oldTokens: any[]) => {
                        if (!oldTokens) return oldTokens;
                        return oldTokens.filter((token) => token.id !== payload.token_id);
                    },
                );

                // Удаляем из кэша дерева
                queryClient.setQueryData(
                    ['allTokens'],
                    (oldTokens: any[]) => {
                        if (!oldTokens) return oldTokens;
                        return oldTokens.filter((token) => token.id !== payload.token_id);
                    },
                );
            }),
        );

        // === ТУМАН ВОЙНЫ ===
        unsubscribers.push(
            relayClient.on('fog_update', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    map_id: string;
                    fog_data: string;
                };

                queryClient.invalidateQueries({ queryKey: ['map', payload.map_id] });
            }),
        );

        // === ИНИЦИАТИВА ===
        unsubscribers.push(
            relayClient.on('initiative_update', (envelope: Envelope) => {
                queryClient.invalidateQueries({ queryKey: ['initiative'] });
            }),
        );

        // === НАЗНАЧЕНИЕ РОЛЕЙ ===
        unsubscribers.push(
            relayClient.on('role_assigned', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    target_user_id: string;
                    role: string;
                    assigned_by: string;
                };

                if (payload.target_user_id === relayClient.connectedUserId) {
                    useUiStore.getState().setUserRole(payload.role as any);
                    useChatStore.getState().addSystemMessage(
                        `Your role has been changed to ${payload.role}`,
                    );
                }
            }),
        );

        // === ВЛАДЕЛЬЦЫ ТОКЕНОВ ===
        unsubscribers.push(
            relayClient.on('token_ownership', (envelope: Envelope) => {
                console.log('[MultiplayerSync] token_ownership:', envelope.payload);
            }),
        );

        // === СМЕНА АКТИВНОЙ СЦЕНЫ ===
        unsubscribers.push(
            relayClient.on('state_update', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    active_scene_map_id?: string;
                    map_visibility?: Record<string, boolean>;
                };

                console.log('[MultiplayerSync] state_update received:', payload);

                // Обновляем видимость карт в локальной БД
                if (payload.map_visibility) {
                    for (const [mapId, isVisible] of Object.entries(payload.map_visibility)) {
                        commands.syncMapVisibility(mapId, isVisible).catch((err) => {
                            console.error('[MultiplayerSync] Failed to sync map visibility:', err);
                        });
                    }
                }

                // Обновляем активную сцену в локальной БД
                if (payload.active_scene_map_id !== undefined) {
                    commands.syncActiveScene(payload.active_scene_map_id).catch((err) => {
                        console.error('[MultiplayerSync] Failed to sync active scene:', err);
                    });
                }

                // Инвалидируем кэш после обновления БД
                queryClient.invalidateQueries({ queryKey: ['maps'] });
                queryClient.invalidateQueries({ queryKey: ['activeScene'] });
            }),
        );

        return () => {
            console.log('[MultiplayerSync] Unsubscribing from relay events');
            unsubscribers.forEach((unsub) => unsub());
        };
    }, [connectionStatus, queryClient]);
}```

---
## Файл: ./src/shared/hooks/usePlayerVisibility.ts
```
import { useMemo } from 'react';

import { useUiStore } from '../stores/ui';
import type { MapSummary, TokenSummary, JournalEntrySummary } from '../api/bindings';

/** Пороги качественных HP (настраиваемые в будущем) */
const HP_THRESHOLDS = {
  healthy: 0.75,   // > 75%
  wounded: 0.25,   // > 25%
  critical: 0,     // > 0%
};

/** Качественное состояние HP */
export type HpQuality = 'healthy' | 'wounded' | 'critical' | 'dead';

/** Цвета для качественных HP */
export const HP_COLORS: Record<HpQuality, string> = {
  healthy: '#66bb6a',
  wounded: '#ffa726',
  critical: '#ef5350',
  dead: '#757575',
};

/**
 * Хук для определения видимости элементов по роли пользователя.
 * GM видит всё, Player — только разрешённое.
 */
export function usePlayerVisibility() {
  const userRole = useUiStore((state) => state.userRole);
  const connectionStatus = useUiStore((state) => state.connectionStatus);

  return useMemo(() => {
    // В локальном режиме (без подключения) — все действия разрешены
    const isLocalMode = connectionStatus !== 'connected';
    const isGM = isLocalMode || userRole === 'gm' || userRole === 'co_gm';
    const isSpectator = !isLocalMode && userRole === 'spectator';

    /** Может ли пользователь видеть карту */
    const canSeeMap = (map: MapSummary): boolean => {
      if (isGM) return true;
      return map.isVisibleToPlayers;
    };

    /** Может ли пользователь видеть токен */
    const canSeeToken = (token: TokenSummary): boolean => {
      if (isGM) return true;
      return token.isVisible;
    };

    /** Может ли пользователь видеть запись журнала */
    const canSeeJournalEntry = (entry: JournalEntrySummary): boolean => {
      if (isGM) return true;
      return entry.visibility === 'players' || entry.visibility === 'public';
    };

    /** Может ли пользователь редактировать запись журнала */
    const canEditJournalEntry = (entry: JournalEntrySummary): boolean => {
      if (isGM) return true;
      return entry.playersCanEdit;
    };

    /** Может ли пользователь двигать токен */
    const canMoveToken = (tokenId: string, ownerId: string | null): boolean => {
      if (isGM) return true;
      if (isSpectator) return false;
      // Player может двигать только свои токены
      // ownerId определяется через token_owners на сервере
      // Для MVP: GM решает через назначение владельца
      return true; // Упрощённо для MVP
    };

    /** Форматирует HP: точные цифры для GM, качественные для Player */
    const formatHP = (
      current: number,
      max: number,
      isMonster: boolean = false,
    ): string => {
      if (isGM || !isMonster) {
        return `${current}/${max}`;
      }

      const quality = getHpQuality(current, max);

      switch (quality) {
        case 'healthy':
          return 'Healthy';
        case 'wounded':
          return 'Wounded';
        case 'critical':
          return 'Critical';
        case 'dead':
          return 'Dead';
      }
    };

    /** Возвращает цвет для качественного HP */
    const getHpColor = (current: number, max: number): string => {
      const quality = getHpQuality(current, max);
      return HP_COLORS[quality];
    };

    return {
      isGM,
      isLocalMode,
      isSpectator,
      canSeeMap,
      canSeeToken,
      canSeeJournalEntry,
      canEditJournalEntry,
      canMoveToken,
      formatHP,
      getHpColor,
    };
  }, [userRole, connectionStatus]);
}

/** Определяет качественное состояние HP */
export function getHpQuality(current: number, max: number): HpQuality {
  if (current <= 0) return 'dead';

  const percent = current / max;

  if (percent > HP_THRESHOLDS.healthy) return 'healthy';
  if (percent > HP_THRESHOLDS.wounded) return 'wounded';
  return 'critical';
}```

---
## Файл: ./src/shared/hooks/usePluginDragDrop.ts
```
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useActiveCampaign,
  useInstallPlugin,
} from '../api/hooks';

interface DragDropPayload {
  type: 'enter' | 'over' | 'drop' | 'leave';
  paths?: string[];
}

export function usePluginDragDrop() {
  const { data: activeCampaign } = useActiveCampaign();
  const installPlugin = useInstallPlugin();

  const [isDragging, setIsDragging] = useState(false);
  const [dropMessage, setDropMessage] = useState<string | null>(null);

  const activeCampaignRef = useRef(activeCampaign);
  const messageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    activeCampaignRef.current = activeCampaign;
  }, [activeCampaign]);

  const showMessage = useCallback((message: string) => {
    setDropMessage(message);

    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setDropMessage(null);
    }, 3500);
  }, []);

  const handleDropPaths = useCallback(
    async (paths: string[]) => {
      const pluginPaths = paths.filter((path) =>
        path.toLowerCase().endsWith('.dndplugin'),
      );

      if (pluginPaths.length === 0) {
        showMessage('No .dndplugin files found');
        return;
      }

      if (!activeCampaignRef.current) {
        showMessage('Open a campaign before installing plugins');
        return;
      }

      try {
        for (const pluginPath of pluginPaths) {
          await installPlugin.mutateAsync(pluginPath);
        }

        showMessage(
          pluginPaths.length === 1
            ? 'Plugin installed'
            : `${pluginPaths.length} plugins installed`,
        );
      } catch (error) {
        console.error('Failed to install plugin from drag-and-drop', error);
        showMessage('Plugin installation failed');
      }
    },
    [installPlugin.mutateAsync, showMessage],
  );

  // Запрещаем браузерное поведение drag-and-drop.
  useEffect(() => {
    const prevent = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);

    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  // Подписка на Tauri drag-and-drop события.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    const windowInstance = getCurrentWindow();

    const api = windowInstance as unknown as {
      onDragDropEvent?: (
        handler: (event: { payload: DragDropPayload }) => void,
      ) => Promise<() => void>;
    };

    if (typeof api.onDragDropEvent !== 'function') {
      return;
    }

    const setup = async () => {
      const dispose = await api.onDragDropEvent!((event) => {
        const payload = event.payload;

        if (!payload) {
          return;
        }

        if (payload.type === 'enter') {
          setIsDragging(true);
          return;
        }

        if (payload.type === 'leave') {
          setIsDragging(false);
          return;
        }

        if (payload.type === 'drop') {
          setIsDragging(false);

          const paths = payload.paths ?? [];

          void handleDropPaths(paths);
        }
      });

      if (cancelled) {
        dispose();
      } else {
        unlisten = dispose;
      }
    };

    void setup();

    return () => {
      cancelled = true;

      if (unlisten) {
        unlisten();
      }
    };
  }, [handleDropPaths]);

  return {
    isDragging,
    isInstalling: installPlugin.isPending,
    dropMessage,
    canInstall: Boolean(activeCampaign),
  };
}```

---
## Файл: ./src/shared/hooks/usePluginTheme.ts
```
import { useEffect } from 'react';

import { usePluginThemeCss } from '../api/hooks';
import { useUiStore } from '../stores/ui';

const STYLE_ELEMENT_ID = 'dndstudio-plugin-theme';

export function usePluginTheme() {
  const themeMode = useUiStore((state) => state.themeMode);
  const pluginThemeId = useUiStore((state) => state.pluginThemeId);

  const [pluginId, themeKey] = pluginThemeId
    ? pluginThemeId.split('::')
    : [null, null];

  const isActivePluginTheme = themeMode === 'plugin' && Boolean(pluginId && themeKey);

  const { data: themeCss } = usePluginThemeCss(
    isActivePluginTheme ? pluginId! : undefined,
    isActivePluginTheme ? themeKey! : undefined,
  );

  useEffect(() => {
    // Удаляем старый style-элемент
    const existing = document.getElementById(STYLE_ELEMENT_ID);
    if (existing) {
      existing.remove();
    }

    if (!isActivePluginTheme || !themeCss) {
      return;
    }

    // Создаём новый style-элемент с CSS темы
    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = themeCss;
    document.head.appendChild(style);

    // Устанавливаем data-theme
    document.documentElement.dataset.theme = `plugin:${themeKey}`;
  }, [isActivePluginTheme, themeCss, themeKey]);

  return { isActivePluginTheme };
}```

---
## Файл: ./src/shared/hooks/useThemeEffect.ts
```
import { useEffect } from 'react';

import { useUiStore } from '../stores/ui';

function applyTheme() {
  const themeMode = useUiStore.getState().themeMode;
  const pluginThemeId = useUiStore.getState().pluginThemeId;

  if (themeMode === 'plugin' && pluginThemeId) {
    return;
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const resolved =
    themeMode === 'system' ? (media.matches ? 'dark' : 'light') : themeMode;

  document.documentElement.dataset.theme = resolved;
}

export function useThemeEffect() {
  useEffect(() => {
    applyTheme();

    const unsubscribe = useUiStore.subscribe(() => {
      applyTheme();
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = () => {
      applyTheme();
    };

    media.addEventListener('change', listener);

    return () => {
      unsubscribe();
      media.removeEventListener('change', listener);
    };
  }, []);
}```

---
## Файл: ./src/shared/hooks/useWorkspaceHydration.ts
```
import { useEffect, useState } from 'react';

import { logDebug, logError } from '../lib/debug';
import { useWorkspaceStore } from '../stores/workspace';

export function useWorkspaceHydration(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() =>
    useWorkspaceStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hydrated) {
      return;
    }

    logDebug('workspace', 'waiting for persist hydration');

    const unsubscribe = useWorkspaceStore.persist.onFinishHydration(() => {
      logDebug('workspace', 'persist hydration finished');
      setHydrated(true);
    });

    const timeout = window.setTimeout(() => {
      if (!useWorkspaceStore.persist.hasHydrated()) {
        logError(
          'workspace',
          'persist hydration timeout, continuing without waiting',
        );
        setHydrated(true);
      }
    }, 700);

    if (useWorkspaceStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [hydrated]);

  return hydrated;
}```

---
## Файл: ./src/shared/lib/debug.ts
```
const DEBUG_STORAGE_KEY = 'dndstudio.debug';

function isDebugEnabled(): boolean {
  try {
    return (
      import.meta.env.DEV ||
      localStorage.getItem(DEBUG_STORAGE_KEY) === '1'
    );
  } catch {
    return false;
  }
}

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

export function logDebug(
  scope: string,
  message: string,
  payload?: unknown,
): void {
  if (!isDebugEnabled()) {
    return;
  }

  if (payload === undefined) {
    console.log(`[${timestamp()}][DndStudio:${scope}] ${message}`);
  } else {
    console.log(
      `[${timestamp()}][DndStudio:${scope}] ${message}`,
      payload,
    );
  }
}

export function logError(
  scope: string,
  message: string,
  payload?: unknown,
): void {
  if (payload === undefined) {
    console.error(`[${timestamp()}][DndStudio:${scope}] ${message}`);
  } else {
    console.error(
      `[${timestamp()}][DndStudio:${scope}] ${message}`,
      payload,
    );
  }
}```

---
## Файл: ./src/shared/lib/dice.ts
```
export interface DicePart {
  notation: string;
  count: number;
  sides: number;
  rolls: number[];
  sum: number;
}

export interface RollResult {
  input: string;
  breakdown: string;
  total: number;
  dice: DicePart[];
  natural20: boolean;
  natural1: boolean;
}

type Operator = '+' | '-' | '*' | '/';

type Token =
  | {
      type: 'number';
      value: number;
    }
  | {
      type: 'dice';
      count: number;
      sides: number;
    }
  | {
      type: 'op';
      value: Operator;
    }
  | {
      type: 'lparen';
    }
  | {
      type: 'rparen';
    };

type AstNode =
  | {
      kind: 'number';
      value: number;
    }
  | {
      kind: 'dice';
      count: number;
      sides: number;
    }
  | {
      kind: 'unary';
      op: '+' | '-';
      operand: AstNode;
    }
  | {
      kind: 'binary';
      op: Operator;
      left: AstNode;
      right: AstNode;
    };

export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Math.round(value * 100) / 100);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  let index = 0;

  while (index < input.length) {
    const remaining = input.slice(index);

    const diceMatch = remaining.match(/^((\d*)d(\d+))/);

    if (diceMatch) {
      const rawCount = diceMatch[2];
      const rawSides = diceMatch[3];

      const count = rawCount ? Number.parseInt(rawCount, 10) : 1;
      const sides = Number.parseInt(rawSides, 10);

      if (!Number.isFinite(count) || !Number.isFinite(sides)) {
        throw new Error('Invalid dice notation');
      }

      if (count < 1 || count > 100) {
        throw new Error('Dice count must be between 1 and 100');
      }

      if (sides < 2 || sides > 1000) {
        throw new Error('Dice sides must be between 2 and 1000');
      }

      tokens.push({
        type: 'dice',
        count,
        sides,
      });

      index += diceMatch[1].length;
      continue;
    }

    const numberMatch = remaining.match(/^\d+(\.\d+)?/);

    if (numberMatch) {
      const value = Number.parseFloat(numberMatch[0]);

      if (!Number.isFinite(value)) {
        throw new Error('Invalid number');
      }

      tokens.push({
        type: 'number',
        value,
      });

      index += numberMatch[0].length;
      continue;
    }

    const opMatch = remaining.match(/^[+\-*/]/);

    if (opMatch) {
      tokens.push({
        type: 'op',
        value: opMatch[0] as Operator,
      });

      index += 1;
      continue;
    }

    if (remaining.startsWith('(')) {
      tokens.push({
        type: 'lparen',
      });

      index += 1;
      continue;
    }

    if (remaining.startsWith(')')) {
      tokens.push({
        type: 'rparen',
      });

      index += 1;
      continue;
    }

    throw new Error(`Unexpected character: ${remaining[0]}`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private position = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): AstNode {
    const node = this.parseExpression();

    if (!this.isAtEnd()) {
      throw new Error('Unexpected token');
    }

    return node;
  }

  private parseExpression(): AstNode {
    return this.parseAdditive();
  }

  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();

    for (;;) {
      const token = this.peek();

      if (
        token &&
        token.type === 'op' &&
        (token.value === '+' || token.value === '-')
      ) {
        this.consume();

        const right = this.parseMultiplicative();

        left = {
          kind: 'binary',
          op: token.value,
          left,
          right,
        };

        continue;
      }

      break;
    }

    return left;
  }

  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();

    for (;;) {
      const token = this.peek();

      if (
        token &&
        token.type === 'op' &&
        (token.value === '*' || token.value === '/')
      ) {
        this.consume();

        const right = this.parseUnary();

        left = {
          kind: 'binary',
          op: token.value,
          left,
          right,
        };

        continue;
      }

      break;
    }

    return left;
  }

  private parseUnary(): AstNode {
    const token = this.peek();

    if (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
      this.consume();

      const operand = this.parseUnary();

      return {
        kind: 'unary',
        op: token.value,
        operand,
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): AstNode {
    const token = this.peek();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'number') {
      this.consume();

      return {
        kind: 'number',
        value: token.value,
      };
    }

    if (token.type === 'dice') {
      this.consume();

      return {
        kind: 'dice',
        count: token.count,
        sides: token.sides,
      };
    }

    if (token.type === 'lparen') {
      this.consume();

      const expression = this.parseExpression();

      const closing = this.consume();

      if (!closing || closing.type !== 'rparen') {
        throw new Error('Expected closing parenthesis');
      }

      return expression;
    }

    throw new Error('Unexpected token');
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private consume(): Token | undefined {
    const token = this.tokens[this.position];
    this.position += 1;
    return token;
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length;
  }
}

function operatorPrecedence(op: Operator): number {
  if (op === '+' || op === '-') {
    return 1;
  }

  return 2;
}

function needsParentheses(
  child: AstNode,
  parentOp: Operator,
  side: 'left' | 'right',
): boolean {
  if (child.kind === 'unary') {
    return child.op === '-' && (parentOp === '*' || parentOp === '/');
  }

  if (child.kind !== 'binary') {
    return false;
  }

  const childPrecedence = operatorPrecedence(child.op);
  const parentPrecedence = operatorPrecedence(parentOp);

  if (childPrecedence < parentPrecedence) {
    return true;
  }

  if (
    childPrecedence === parentPrecedence &&
    side === 'right' &&
    (parentOp === '-' || parentOp === '/')
  ) {
    return true;
  }

  return false;
}

function evaluateNode(
  node: AstNode,
  diceParts: DicePart[],
): {
  value: number;
  text: string;
} {
  if (node.kind === 'number') {
    return {
      value: node.value,
      text: formatNumber(node.value),
    };
  }

  if (node.kind === 'dice') {
    const rolls: number[] = [];

    for (let index = 0; index < node.count; index += 1) {
      rolls.push(randomInt(1, node.sides));
    }

    const sum = rolls.reduce((acc, value) => acc + value, 0);

    diceParts.push({
      notation: `${node.count}d${node.sides}`,
      count: node.count,
      sides: node.sides,
      rolls,
      sum,
    });

    return {
      value: sum,
      text: `${node.count}d${node.sides}[${rolls.join('+')}]`,
    };
  }

  if (node.kind === 'unary') {
    const operand = evaluateNode(node.operand, diceParts);

    const value = node.op === '-' ? -operand.value : operand.value;

    let text = operand.text;

    if (
      node.operand.kind === 'binary' ||
      (node.operand.kind === 'unary' && node.operand.op === '-')
    ) {
      text = `(${operand.text})`;
    }

    if (node.op === '-') {
      text = `-${text}`;
    }

    return {
      value,
      text,
    };
  }

  const left = evaluateNode(node.left, diceParts);
  const right = evaluateNode(node.right, diceParts);

  let value = 0;

  if (node.op === '+') {
    value = left.value + right.value;
  }

  if (node.op === '-') {
    value = left.value - right.value;
  }

  if (node.op === '*') {
    value = left.value * right.value;
  }

  if (node.op === '/') {
    if (right.value === 0) {
      throw new Error('Division by zero');
    }

    value = left.value / right.value;
  }

  const leftText = needsParentheses(node.left, node.op, 'left')
    ? `(${left.text})`
    : left.text;

  const rightText = needsParentheses(node.right, node.op, 'right')
    ? `(${right.text})`
    : right.text;

  return {
    value,
    text: `${leftText} ${node.op} ${rightText}`,
  };
}

function expandShorthand(
  compactInput: string,
): string | null {
  const shorthandMatch = compactInput.match(/^(\d+)d(\d+)\*(\d+)$/);

  if (!shorthandMatch) {
    return null;
  }

  const count = Number.parseInt(shorthandMatch[1], 10);
  const sides = Number.parseInt(shorthandMatch[2], 10);
  const modifier = Number.parseInt(shorthandMatch[3], 10);

  if (!Number.isFinite(count) || !Number.isFinite(sides) || !Number.isFinite(modifier)) {
    return null;
  }

  if (count < 1 || count > 20) {
    return null;
  }

  const repeated = Array.from({ length: count })
    .map(() => `(1d${sides}+${modifier})`)
    .join(' + ');

  return repeated;
}

export function rollExpression(rawInput: string): RollResult | null {
  const input = rawInput.trim();

  if (!input) {
    return null;
  }

  const compact = input
    .toLowerCase()
    .replace(/\s+/g, '');

  const expanded = expandShorthand(compact);

  if (expanded) {
    const expandedResult = rollExpression(expanded);

    if (expandedResult) {
      expandedResult.input = input;
    }

    return expandedResult;
  }

  if (!/[d]/.test(compact)) {
    return null;
  }

  try {
    const tokens = tokenize(compact);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const diceParts: DicePart[] = [];

    const evaluated = evaluateNode(ast, diceParts);

    if (diceParts.length === 0) {
      return null;
    }

    const total = Math.round(evaluated.value * 100) / 100;

    const singleD20 =
      diceParts.length === 1 &&
      diceParts[0].count === 1 &&
      diceParts[0].sides === 20;

    const natural20 =
      singleD20 && diceParts[0].rolls[0] === 20;

    const natural1 =
      singleD20 && diceParts[0].rolls[0] === 1;

    return {
      input,
      breakdown: evaluated.text,
      total,
      dice: diceParts,
      natural20,
      natural1,
    };
  } catch {
    return null;
  }
}```

---
## Файл: ./src/shared/services/campaignSharing.ts
```
import { unwrap } from '../api/hooks';
import { commands } from '../api/bindings';

export interface CampaignSharingConfig {
    serverUrl: string;
    roomId: string;
    gmToken: string;
    displayName: string;
}

/**
 * GM: Экспортирует кампанию как ZIP и загружает на сервер.
 */
export async function uploadCampaignToRelay(
    config: CampaignSharingConfig,
    onProgress?: (percent: number) => void,
): Promise<void> {
    const tempZipPath = await unwrap(commands.exportCampaignZipToTemp());
    console.log('[CampaignSharing] ZIP created:', tempZipPath);

    const zipData = await unwrap(commands.readFileBytes(tempZipPath));
    console.log('[CampaignSharing] ZIP read, size:', zipData.length, 'bytes');

    if (!zipData || zipData.length === 0) {
        throw new Error('Exported campaign archive is empty');
    }

    const httpUrl = config.serverUrl.replace(/^ws/, 'http');
    const uploadUrl = `${httpUrl}/api/rooms/${config.roomId}/campaign`;

    console.log('[CampaignSharing] Uploading ZIP to:', uploadUrl);
    onProgress?.(10);

    const body = new Uint8Array(zipData);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body,
    });

    onProgress?.(100);

    if (!response.ok) {
        throw new Error(`Failed to upload campaign: ${response.statusText}`);
    }

    await unwrap(commands.deleteTempFile(tempZipPath));
}

/**
 * Player: Запрашивает отфильтрованные данные кампании с сервера.
 * НЕ скачивает ZIP — работает через REST API.
 */
export async function fetchCampaignEntities(
    serverUrl: string,
    roomId: string,
    token: string,
): Promise<any> {
    const httpUrl = serverUrl.replace(/^ws/, 'http');
    const entitiesUrl = `${httpUrl}/api/rooms/${roomId}/entities?token=${encodeURIComponent(token)}`;

    console.log('[CampaignSharing] Fetching entities from:', entitiesUrl);

    const response = await fetch(entitiesUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch campaign entities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[CampaignSharing] Entities received:', data);

    return data;
}

/**
 * Player: Загружает ассет по хэшу (ленивая загрузка).
 */
export async function fetchAssetByHash(
    serverUrl: string,
    roomId: string,
    hash: string,
): Promise<Uint8Array> {
    const httpUrl = serverUrl.replace(/^ws/, 'http');
    const assetUrl = `${httpUrl}/api/rooms/${roomId}/assets/${hash}`;

    const response = await fetch(assetUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

export async function getMultiplayerSessions(
    profileId: string,
): Promise<any[]> {
    return unwrap(commands.listMultiplayerSessions(profileId));
}

export async function deleteMultiplayerSession(
    roomId: string,
    profileId: string,
): Promise<void> {
    await unwrap(commands.deleteMultiplayerSession(roomId, profileId));
}
```

---
## Файл: ./src/shared/services/relayClient.ts
```
import { useUiStore } from '../stores/ui';

/** Типы сообщений протокола */
export type MessageType =
    | 'join'
    | 'leave'
    | 'heartbeat'
    | 'error'
    | 'role_assigned'
    | 'kick'
    | 'state_sync'
    | 'state_update'
    | 'token_move'
    | 'token_create'
    | 'token_delete'
    | 'chat_message'
    | 'initiative_update'
    | 'fog_update'
    | 'dice_roll'
    | 'asset_request'
    | 'asset_response'
    | 'token_ownership'
    | 'request_action';

/** Envelope — обёртка для всех сообщений */
export interface Envelope {
    v: number;
    id: string;
    type: MessageType;
    ts: number;
    seq: number;
    session_id: string;
    sender_id: string;
    payload: Record<string, unknown>;
}

/** Конфигурация подключения */
export interface ConnectionConfig {
    serverUrl: string;
    roomId: string;
    token: string;
    displayName: string;
}

/** Статус подключения */
export type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error';

/** Callback для входящих сообщений */
export type MessageHandler = (envelope: Envelope) => void;

let seqCounter = 0;

function generateId(): string {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function nextSeq(): number {
    return ++seqCounter;
}

/** Создаёт Envelope для отправки */
export function createEnvelope(
    type: MessageType,
    sessionId: string,
    senderId: string,
    payload: Record<string, unknown>,
): Envelope {
    return {
        v: 1,
        id: generateId(),
        type,
        ts: Date.now(),
        seq: nextSeq(),
        session_id: sessionId,
        sender_id: senderId,
        payload,
    };
}

/**
 * Relay Client — управляет WebSocket соединением с Relay Server
 */
// ... существующий код до класса RelayClient без изменений ...

class RelayClient {
    private ws: WebSocket | null = null;
    private config: ConnectionConfig | null = null;
    private handlers: Map<MessageType, MessageHandler[]> = new Map();
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private userId: string = '';
    private role: string = '';
    private _displayName: string = '';
    private _status: ConnectionStatus = 'disconnected';
    private shouldReconnect = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    get displayName(): string {
        return this._displayName || 'Unknown';
    }

    get status(): ConnectionStatus {
        return this._status;
    }

    get connectedUserId(): string {
        return this.userId;
    }

    get connectedRole(): string {
        return this.role;
    }

    /** Подключиться к комнате */
    connect(config: ConnectionConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            // Закрываем существующее соединение
            if (this.ws) {
                this.ws.onopen = null;
                this.ws.onmessage = null;
                this.ws.onerror = null;
                this.ws.onclose = null;
                this.ws.close();
                this.ws = null;
            }

            this.config = config;
            this.shouldReconnect = true;
            this.reconnectAttempts = 0;
            this.setStatus('connecting');

            try {
                const wsUrl = `${config.serverUrl.replace(/^http/, 'ws')}/ws/${config.roomId}`;
                const ws = new WebSocket(wsUrl);
                this.ws = ws;

                ws.onopen = () => {
                    // Проверяем, что это всё ещё актуальный сокет
                    if (this.ws !== ws) return;

                    const joinEnvelope = createEnvelope(
                        'join',
                        config.roomId,
                        '',
                        {
                            room_id: config.roomId,
                            token: config.token,
                            display_name: config.displayName,
                        },
                    );

                    ws.send(JSON.stringify(joinEnvelope));
                };

                ws.onmessage = (event) => {
                    if (this.ws !== ws) return;

                    try {
                        const envelope: Envelope = JSON.parse(event.data);
                        this.handleMessage(envelope, resolve, reject);
                    } catch (e) {
                        console.error('Failed to parse message:', e);
                    }
                };

                ws.onerror = (error) => {
                    if (this.ws !== ws) return;
                    console.error('WebSocket error:', error);
                    this.setStatus('error');
                    reject(new Error('WebSocket connection failed'));
                };

                ws.onclose = () => {
                    if (this.ws !== ws) return;

                    this.stopHeartbeat();
                    this.setStatus('disconnected');

                    if (this.shouldReconnect) {
                        this.scheduleReconnect();
                    }
                };
            } catch (e) {
                this.setStatus('error');
                reject(e);
            }
        });
    }

    /** Отключиться */
    disconnect(): void {
        this.shouldReconnect = false;
        this.stopHeartbeat();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }

        this.setStatus('disconnected');
        this.userId = '';
        this.role = '';
        this._displayName = '';

        useUiStore.getState().setUserRole(null);
    }

    /** Отправить сообщение */
    send(type: MessageType, payload: Record<string, unknown>): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.config) {
            return;
        }

        const envelope = createEnvelope(
            type,
            this.config.roomId,
            this.userId,
            payload,
        );

        this.ws.send(JSON.stringify(envelope));
    }

    /** Зарегистрировать обработчик сообщений */
    on(type: MessageType, handler: MessageHandler): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }

        this.handlers.get(type)!.push(handler);

        return () => {
            const handlers = this.handlers.get(type);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }

    /** Обработка входящего сообщения */
    private handleMessage(
        envelope: Envelope,
        resolveOnJoin: (value: void) => void,
        rejectOnJoin: (reason: Error) => void,
    ): void {
        switch (envelope.type) {
            case 'join': {
                const payload = envelope.payload as {
                    success?: boolean;
                    user_id?: string;
                    role?: string;
                    error?: string;
                    display_name?: string;
                };

                // Проверяем, есть ли поле `success` — это определяет,
                // является ли сообщение ОТВЕТОМ на наш join или УВЕДОМЛЕНИЕМ о другом пользователе
                if ('success' in payload) {
                    // Это ОТВЕТ на наш запрос подключения
                    if (payload.success) {
                        this.userId = payload.user_id ?? '';
                        this.role = payload.role ?? '';
                        this._displayName = this.config?.displayName ?? 'Unknown';
                        this.reconnectAttempts = 0;
                        this.setStatus('connected');
                        this.startHeartbeat();

                        useUiStore.getState().setUserRole(this.role as any);
                        resolveOnJoin();
                    } else {
                        this.shouldReconnect = false;
                        this.setStatus('error');
                        const errorMsg = payload.error ?? 'Join failed';
                        rejectOnJoin(new Error(errorMsg));
                    }
                } else {
                    // Это УВЕДОМЛЕНИЕ о подключении другого пользователя
                    // Передаём его в обработчики событий (например, для обновления списка участников)
                    console.log(
                        `[Relay] User '${payload.display_name}' (${payload.role}) joined the room`,
                    );

                    const handlers = this.handlers.get('join');
                    if (handlers) {
                        handlers.forEach((handler) => {
                            try {
                                handler(envelope);
                            } catch (e) {
                                console.error('Handler error for join notification:', e);
                            }
                        });
                    }
                }
                break;
            }
            case 'leave': {
                const payload = envelope.payload as {
                    user_id?: string;
                };

                console.log(`[Relay] User '${payload.user_id}' left the room`);

                const handlers = this.handlers.get('leave');
                if (handlers) {
                    handlers.forEach((handler) => {
                        try {
                            handler(envelope);
                        } catch (e) {
                            console.error('Handler error for leave notification:', e);
                        }
                    });
                }
                break;
            }

            case 'error': {
                const payload = envelope.payload as {
                    error?: string;
                    success?: boolean;
                    room_id?: string;
                };

                console.error('Server error:', payload);

                // Если комната не найдена — останавливаем переподключение
                if (payload.error === 'Room not found') {
                    this.shouldReconnect = false;
                    this.stopHeartbeat();
                    this.setStatus('disconnected');
                    this.disconnect();
                    return;
                }

                // Если это ответ на Join с ошибкой
                if (payload.success === false) {
                    this.shouldReconnect = false;
                    this.setStatus('error');
                    rejectOnJoin(new Error(payload.error ?? 'Connection rejected'));
                }
                break;
            }

            case 'heartbeat': {
                break;
            }

            default: {
                if (envelope.sender_id === this.userId) {
                    break;
                }

                const handlers = this.handlers.get(envelope.type);
                if (handlers) {
                    handlers.forEach((handler) => {
                        try {
                            handler(envelope);
                        } catch (e) {
                            console.error(`Handler error for ${envelope.type}:`, e);
                        }
                    });
                }
                break;
            }
        }
    }

    /** Запуск heartbeat */
    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            this.send('heartbeat', { client_time: Date.now() });
        }, 15000);
    }

    /** Остановка heartbeat */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /** Планирование переподключения */
    private scheduleReconnect(): void {
        if (!this.shouldReconnect || !this.config) return;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnection attempts reached, giving up');
            this.shouldReconnect = false;
            this.setStatus('disconnected');
            return;
        }

        this.reconnectAttempts++;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

        console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            if (this.config && this.shouldReconnect) {
                this.connect(this.config).catch(() => {
                    // Ошибка переподключения — scheduleReconnect вызовется через onclose
                });
            }
        }, delay);
    }

    /** Обновление статуса */
    private setStatus(status: ConnectionStatus): void {
        this._status = status;
        useUiStore.getState().setConnectionStatus(status);
    }

    /** Является ли текущий пользователь GM */
    get isGM(): boolean {
        return this.role === 'gm' || this.role === 'co_gm';
    }

    /** Является ли текущий пользователь Player */
    get isPlayer(): boolean {
        return this.role === 'player';
    }

    /** Является ли текущий пользователь Spectator */
    get isSpectator(): boolean {
        return this.role === 'spectator';
    }

    /** Назначить роль пользователю (только GM) */
    assignRole(targetUserId: string, role: string): void {
        if (!this.isGM) {
            console.warn('Only GM can assign roles');
            return;
        }

        this.send('role_assigned', {
            target_user_id: targetUserId,
            role,
            assigned_by: this.userId,
        });
    }

    /** Назначить владельца токена (только GM) */
    assignTokenOwner(tokenId: string, ownerUserId: string, mapId: string): void {
        if (!this.isGM) {
            console.warn('Only GM can assign token owners');
            return;
        }

        this.send('token_ownership', {
            token_id: tokenId,
            owner_user_id: ownerUserId,
            map_id: mapId,
        });
    }

    /** Запросить действие у GM (для игроков) */
    requestAction(actionType: string, payload: Record<string, unknown>): void {
        this.send('request_action', {
            action_type: actionType,
            payload,
            requester_name: this.connectedUserId,
        });
    }
}

export const relayClient = new RelayClient();```

---
## Файл: ./src/shared/stores/chat.ts
```
import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  type: 'user' | 'system' | 'dice';
  /** Для dice-сообщений */
  diceNotation?: string;
  diceResult?: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  addSystemMessage: (text: string) => void;
  addDiceMessage: (
    senderName: string,
    notation: string,
    result: number,
  ) => void;
  clearMessages: () => void;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addSystemMessage: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          text,
          senderId: 'system',
          senderName: 'System',
          timestamp: Date.now(),
          type: 'system',
        },
      ],
    })),

  addDiceMessage: (senderName, notation, result) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          text: `rolled ${notation} → ${result}`,
          senderId: 'dice',
          senderName,
          timestamp: Date.now(),
          type: 'dice',
          diceNotation: notation,
          diceResult: result,
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),
}));```

---
## Файл: ./src/shared/stores/drag.ts
```
import { create } from 'zustand';

export type DragKind = 'character';

export interface DragItem {
  kind: DragKind;
  id: string;
  name: string;
  icon?: string;
}

export interface DragPointer {
  x: number;
  y: number;
}

export interface DropTarget {
  kind: 'map' | 'map-canvas';
  id: string;
  worldX?: number;
  worldY?: number;
}

interface DragState {
  dragging: DragItem | null;
  pointer: DragPointer | null;
  activeTarget: DropTarget | null;
  previousTab: string | null; // <-- Добавляем

  startDrag: (item: DragItem) => void;
  updatePointer: (pointer: DragPointer) => void;
  setActiveTarget: (target: DropTarget | null) => void;
  endDrag: () => void;
  setPreviousTab: (tab: string) => void; // <-- Добавляем
  clearPreviousTab: () => void;           // <-- Добавляем
}

export const useDragStore = create<DragState>()((set) => ({
  dragging: null,
  pointer: null,
  activeTarget: null,
  previousTab: null, // <-- Инициализация

  startDrag: (dragging) =>
    set({
      dragging,
      pointer: null,
      activeTarget: null,
    }),

  updatePointer: (pointer) => set({ pointer }),

  setActiveTarget: (activeTarget) => set({ activeTarget }),

  endDrag: () =>
    set({
      dragging: null,
      pointer: null,
      activeTarget: null,
    }),

  setPreviousTab: (previousTab) => set({ previousTab }),
  clearPreviousTab: () => set({ previousTab: null }),
}));```

---
## Файл: ./src/shared/stores/encounter.ts
```
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface EncounterEntry {
    id: string;
    tokenId: string;
    label: string;
    initiative: number;
    initiativeMod: number;
    characterId?: string | null;
}

export interface EncounterMapState {
    entries: EncounterEntry[];
    activeEntryId: string | null;
    round: number;
    started: boolean;
}

interface EncounterState {
    selectedMapId: string | null;
    encounters: Record<string, EncounterMapState>;

    setSelectedMapId: (mapId: string | null) => void;

    addTokens: (
        mapId: string,
        tokensToAdd: Array<{
            tokenId: string;
            label: string;
            initiative?: number;
            initiativeMod?: number;
            characterId?: string | null;
        }>,
    ) => void;

    removeEntry: (mapId: string, entryId: string) => void;

    setInitiative: (
        mapId: string,
        entryId: string,
        initiative: number,
    ) => void;

    toggleStarted: (mapId: string) => void;
    nextTurn: (mapId: string) => void;
    resetTurn: (mapId: string) => void;
    clearEncounter: (mapId: string) => void;

    pruneMissingTokens: (mapId: string, validTokenIds: string[]) => void;
}

function createId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return Math.random().toString(36).slice(2);
    }
}

function emptyEncounter(): EncounterMapState {
    return {
        entries: [],
        activeEntryId: null,
        round: 1,
        started: false,
    };
}

function sortEntries(entries: EncounterEntry[]): EncounterEntry[] {
    return [...entries].sort((a, b) => {
        if (b.initiative !== a.initiative) {
            return b.initiative - a.initiative;
        }

        return a.label.localeCompare(b.label);
    });
}

export const useEncounterStore = create<EncounterState>()(
    persist(
        (set) => ({
            selectedMapId: null,
            encounters: {},

            setSelectedMapId: (mapId) =>
                set({
                    selectedMapId: mapId,
                }),

            addTokens: (mapId, tokensToAdd) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    const existingTokenIds = new Set(
                        current.entries.map((entry) => entry.tokenId),
                    );

                    const newEntries = tokensToAdd
                        .filter((token) => !existingTokenIds.has(token.tokenId))
                        .map((token) => ({
                            id: createId(),
                            tokenId: token.tokenId,
                            label: token.label,
                            initiative: token.initiative ?? 0,
                            initiativeMod: token.initiativeMod ?? 0,
                            characterId: token.characterId ?? null,
                        }));

                    if (newEntries.length === 0) {
                        return {};
                    }

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries: [...current.entries, ...newEntries],
                            },
                        },
                    };
                }),

            removeEntry: (mapId, entryId) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    const entries = current.entries.filter(
                        (entry) => entry.id !== entryId,
                    );

                    let activeEntryId = current.activeEntryId;

                    if (activeEntryId === entryId) {
                        activeEntryId = sortEntries(entries)[0]?.id ?? null;
                    }

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries,
                                activeEntryId,
                            },
                        },
                    };
                }),

            setInitiative: (mapId, entryId, initiative) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    const entries = current.entries.map((entry) => {
                        if (entry.id !== entryId) {
                            return entry;
                        }

                        return {
                            ...entry,
                            initiative,
                        };
                    });

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries,
                            },
                        },
                    };
                }),

            toggleStarted: (mapId) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    if (current.started) {
                        return {
                            encounters: {
                                ...state.encounters,
                                [mapId]: {
                                    ...current,
                                    started: false,
                                },
                            },
                        };
                    }

                    if (current.entries.length === 0) {
                        return {};
                    }

                    const entries = sortEntries(current.entries);

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries,
                                started: true,
                                round: 1,
                                activeEntryId: entries[0]?.id ?? null,
                            },
                        },
                    };
                }),

            nextTurn: (mapId) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    if (!current.started || current.entries.length === 0) {
                        return {};
                    }

                    const entries = sortEntries(current.entries);

                    const currentIndex = entries.findIndex(
                        (entry) => entry.id === current.activeEntryId,
                    );

                    const nextIndex = currentIndex + 1;

                    if (nextIndex >= entries.length) {
                        return {
                            encounters: {
                                ...state.encounters,
                                [mapId]: {
                                    ...current,
                                    entries,
                                    round: current.round + 1,
                                    activeEntryId: entries[0]?.id ?? null,
                                },
                            },
                        };
                    }

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries,
                                activeEntryId: entries[nextIndex]?.id ?? null,
                            },
                        },
                    };
                }),

            resetTurn: (mapId) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    if (current.entries.length === 0) {
                        return {};
                    }

                    const entries = sortEntries(current.entries);

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries,
                                round: 1,
                                activeEntryId: entries[0]?.id ?? null,
                            },
                        },
                    };
                }),

            clearEncounter: (mapId) =>
                set((state) => {
                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: emptyEncounter(),
                        },
                    };
                }),

            pruneMissingTokens: (mapId, validTokenIds) =>
                set((state) => {
                    const current =
                        state.encounters[mapId] ?? emptyEncounter();

                    const validIds = new Set(validTokenIds);

                    const entries = current.entries.filter((entry) =>
                        validIds.has(entry.tokenId),
                    );

                    if (entries.length === current.entries.length) {
                        return {};
                    }

                    let activeEntryId = current.activeEntryId;

                    if (
                        activeEntryId &&
                        !entries.some((entry) => entry.id === activeEntryId)
                    ) {
                        activeEntryId = sortEntries(entries)[0]?.id ?? null;
                    }

                    return {
                        encounters: {
                            ...state.encounters,
                            [mapId]: {
                                ...current,
                                entries,
                                activeEntryId,
                            },
                        },
                    };
                }),
        }),
        {
            name: 'dndstudio.encounter',
            partialize: (state) => ({
                selectedMapId: state.selectedMapId,
                encounters: state.encounters,
            }),
        },
    ),
);```

---
## Файл: ./src/shared/stores/mapSettings.ts
```
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MapSettingsState {
  showGridByMap: Record<string, boolean>;

  setShowGrid: (mapId: string, visible: boolean) => void;
  toggleGrid: (mapId: string) => void;
}

export const useMapSettingsStore = create<MapSettingsState>()(
  persist(
    (set) => ({
      showGridByMap: {},

      setShowGrid: (mapId, visible) =>
        set((state) => ({
          showGridByMap: {
            ...state.showGridByMap,
            [mapId]: visible,
          },
        })),

      toggleGrid: (mapId) =>
        set((state) => {
          const current = state.showGridByMap[mapId] ?? true;

          return {
            showGridByMap: {
              ...state.showGridByMap,
              [mapId]: !current,
            },
          };
        }),
    }),
    {
      name: 'dndstudio.map-settings',
      partialize: (state) => ({
        showGridByMap: state.showGridByMap,
      }),
    },
  ),
);```

---
## Файл: ./src/shared/stores/table.ts
```
import { create } from 'zustand';

interface TableState {
  selectedMapId: string | null;
  selectedTokenId: string | null;

  setSelectedMapId: (mapId: string | null) => void;
  setSelectedTokenId: (tokenId: string | null) => void;
}

export const useTableStore = create<TableState>()((set) => ({
  selectedMapId: null,
  selectedTokenId: null,

  setSelectedMapId: (mapId) =>
    set({
      selectedMapId: mapId,
    }),

  setSelectedTokenId: (tokenId) =>
    set({
      selectedTokenId: tokenId,
    }),
}));```

---
## Файл: ./src/shared/stores/ui.test.ts
```
import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui';

describe('ui store', () => {
  beforeEach(() => {
    useUiStore.setState({
      themeMode: 'system',
      leftVisible: true,
      rightVisible: true,
      bottomVisible: true,
      activeLeftTab: 'navigator',
      activeRightTab: 'inspector',
      activeBottomTab: 'chat',
    });
  });

  it('toggles left panel', () => {
    useUiStore.getState().toggleLeft();
    expect(useUiStore.getState().leftVisible).toBe(false);

    useUiStore.getState().toggleLeft();
    expect(useUiStore.getState().leftVisible).toBe(true);
  });

  it('toggles right panel', () => {
    useUiStore.getState().toggleRight();
    expect(useUiStore.getState().rightVisible).toBe(false);
  });

  it('toggles bottom panel', () => {
    useUiStore.getState().toggleBottom();
    expect(useUiStore.getState().bottomVisible).toBe(false);
  });

  it('changes theme mode', () => {
    useUiStore.getState().setThemeMode('dark');
    expect(useUiStore.getState().themeMode).toBe('dark');
  });
});```

---
## Файл: ./src/shared/stores/ui.ts
```
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { applyThemeMode, type ThemeMode } from '../theme/theme';
import { CampaignSummary } from '../api/bindings';


export type LeftTab = 'navigator' | 'plugins' | 'compendiums';
export type RightTab = 'inspector' | 'journalToc';
export type BottomTab = 'chat' | 'logs' | 'dslTerminal' | 'initiative' | 'multiplayer';

interface UiState {
  themeMode: ThemeMode;

  leftVisible: boolean;
  rightVisible: boolean;
  bottomVisible: boolean;

  activeLeftTab: LeftTab;
  activeRightTab: RightTab;
  activeBottomTab: BottomTab;

  pluginThemeId: string | null;
  setPluginThemeId: (id: string | null) => void;

  setThemeMode: (mode: ThemeMode) => void;

  toggleLeft: () => void;
  toggleRight: () => void;
  toggleBottom: () => void;

  setActiveLeftTab: (tab: LeftTab) => void;
  setActiveRightTab: (tab: RightTab) => void;
  setActiveBottomTab: (tab: BottomTab) => void;

  toggleLeftTab: (tab: LeftTab) => void;
  toggleRightTab: (tab: RightTab) => void;

  setLeftVisible: (visible: boolean) => void;
  setRightVisible: (visible: boolean) => void;
  setBottomVisible: (visible: boolean) => void;

  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;

  userRole: 'gm' | 'co_gm' | 'player' | 'spectator' | null;
  setUserRole: (role: 'gm' | 'co_gm' | 'player' | 'spectator' | null) => void;

  activeProfileId: string | null;
  activeProfileName: string | null;
  setActiveProfile: (id: string | null, name: string | null) => void;

  activeCampaign: CampaignSummary | null;
  setActiveCampaign: (campaign: CampaignSummary | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({

      themeMode: 'system',

      leftVisible: true,
      rightVisible: true,
      bottomVisible: true,

      activeLeftTab: 'navigator',
      activeRightTab: 'inspector',
      activeBottomTab: 'chat',

      setThemeMode: (mode) => {
        set({ themeMode: mode });

        applyThemeMode(mode);
      },

      toggleLeft: () =>
        set((state) => ({ leftVisible: !state.leftVisible })),

      toggleRight: () =>
        set((state) => ({ rightVisible: !state.rightVisible })),

      toggleBottom: () =>
        set((state) => ({ bottomVisible: !state.bottomVisible })),

      setActiveLeftTab: (activeLeftTab) => set({ activeLeftTab }),
      setActiveRightTab: (activeRightTab) => set({ activeRightTab }),
      setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),

      setLeftVisible: (leftVisible) => set({ leftVisible }),
      setRightVisible: (rightVisible) => set({ rightVisible }),
      setBottomVisible: (bottomVisible) => set({ bottomVisible }),
      toggleLeftTab: (tab) =>
        set((state) => {
          // Если левая панель скрыта — открываем её и выбираем таб.
          if (!state.leftVisible) {
            return {
              leftVisible: true,
              activeLeftTab: tab,
            };
          }

          // Если панель открыта и клик по тому же табу — скрываем панель.
          if (state.activeLeftTab === tab) {
            return {
              leftVisible: false,
            };
          }

          // Если панель открыта и клик по другому табу — переключаем таб.
          return {
            activeLeftTab: tab,
          };
        }),

      toggleRightTab: (tab) =>
        set((state) => {
          // Если правая панель скрыта — открываем её и выбираем таб.
          if (!state.rightVisible) {
            return {
              rightVisible: true,
              activeRightTab: tab,
            };
          }

          // Если панель открыта и клик по тому же табу — скрываем панель.
          if (state.activeRightTab === tab) {
            return {
              rightVisible: false,
            };
          }

          // Если панель открыта и клик по другому табу — переключаем таб.
          return {
            activeRightTab: tab,
          };
        }),

      pluginThemeId: null,

      setPluginThemeId: (pluginThemeId) => set({ pluginThemeId }),

      connectionStatus: 'disconnected',
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

      userRole: null,
      setUserRole: (userRole) => set({ userRole }),

      activeProfileId: null,
      activeProfileName: null,
      setActiveProfile: (activeProfileId, activeProfileName) =>
        set({ activeProfileId, activeProfileName }),

      activeCampaign: null,
      setActiveCampaign(activeCampaign) {
        set({activeCampaign})
      },

    }),
    {
      name: 'dndstudio.ui',
    },
  ),
);```

---
## Файл: ./src/shared/stores/workspace.ts
```
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logDebug, logError } from '../lib/debug';

export type WorkspaceTabKind =
  | 'map'
  | 'journal'
  | 'character'
  | 'compendium'
  | 'placeholder';

export interface WorkspaceTab {
  id: string;
  kind: WorkspaceTabKind;
  title: string;
  entityId?: string;
}

interface WorkspaceState {
  campaignId: string | null;
  lastCampaignId: string | null;

  tabs: WorkspaceTab[];
  activeTabId: string | null;

  bindCampaign: (campaignId: string | null) => void;

  setLastCampaignId: (campaignId: string) => void;
  clearLastCampaign: () => void;

  openTab: (tab: WorkspaceTab) => void;
  closeTab: (tabId: string) => void;
  closeActiveTab: () => void;
  setActiveTab: (tabId: string) => void;

  openMapTab: (map: { id: string; name: string }) => void;

  openJournalTab: (entry: { id: string; title: string }) => void;
  renameTabByEntity: (
    kind: WorkspaceTabKind,
    entityId: string,
    title: string,
  ) => void;

  openCharacterTab: (character: { id: string; name: string }) => void;

  openCompendiumTab: (compendium: { id: string; name: string }) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      campaignId: null,
      lastCampaignId: null,

      tabs: [],
      activeTabId: null,

      bindCampaign: (campaignId) =>
        set((state) => {
          logDebug('workspace', 'bindCampaign request', {
            from: state.campaignId,
            to: campaignId,
            lastCampaignId: state.lastCampaignId,
            tabsCount: state.tabs.length,
          });

          if (state.campaignId === campaignId) {
            logDebug('workspace', 'bindCampaign skipped, already same');
            return {};
          }

          logDebug('workspace', 'bindCampaign resets tabs', {
            from: state.campaignId,
            to: campaignId,
          });

          return {
            campaignId,
            tabs: [],
            activeTabId: null,
          };
        }),

      setLastCampaignId: (campaignId) => {
        logDebug('workspace', 'setLastCampaignId', campaignId);

        set({
          lastCampaignId: campaignId,
        });

        window.setTimeout(() => {
          try {
            logDebug(
              'workspace',
              'storage after setLastCampaignId',
              localStorage.getItem('dndstudio.workspace'),
            );
          } catch (error) {
            logError('workspace', 'failed to read workspace storage', error);
          }
        }, 0);
      },

      clearLastCampaign: () => {
        logDebug('workspace', 'clearLastCampaign');

        set({
          lastCampaignId: null,
        });

        window.setTimeout(() => {
          try {
            logDebug(
              'workspace',
              'storage after clearLastCampaign',
              localStorage.getItem('dndstudio.workspace'),
            );
          } catch (error) {
            logError('workspace', 'failed to read workspace storage', error);
          }
        }, 0);
      },

      openTab: (tab) =>
        set((state) => {
          const alreadyExists = state.tabs.some((item) => item.id === tab.id);

          logDebug('workspace', 'openTab', {
            tabId: tab.id,
            title: tab.title,
            alreadyExists,
            tabsCount: state.tabs.length,
          });

          if (alreadyExists) {
            return {
              activeTabId: tab.id,
            };
          }

          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      closeTab: (tabId) =>
        set((state) => {
          const index = state.tabs.findIndex((tab) => tab.id === tabId);

          logDebug('workspace', 'closeTab', {
            tabId,
            index,
            tabsCount: state.tabs.length,
          });

          if (index === -1) {
            return {};
          }

          const tabs = state.tabs.filter((tab) => tab.id !== tabId);

          let activeTabId = state.activeTabId;

          if (state.activeTabId === tabId) {
            activeTabId =
              tabs[index]?.id ??
              tabs[index - 1]?.id ??
              null;
          }

          return {
            tabs,
            activeTabId,
          };
        }),

      closeActiveTab: () => {
        const { activeTabId, closeTab } = get();

        logDebug('workspace', 'closeActiveTab', {
          activeTabId,
        });

        if (activeTabId) {
          closeTab(activeTabId);
        }
      },

      setActiveTab: (tabId) => {
        logDebug('workspace', 'setActiveTab', {
          tabId,
        });

        set({
          activeTabId: tabId,
        });
      },

      openMapTab: (map) => {
        logDebug('workspace', 'openMapTab', map);

        get().openTab({
          id: `map:${map.id}`,
          kind: 'map',
          title: map.name,
          entityId: map.id,
        });
      },

      openJournalTab: (entry) => {
        logDebug('workspace', 'openJournalTab', entry);

        get().openTab({
          id: `journal:${entry.id}`,
          kind: 'journal',
          title: entry.title || 'Journal',
          entityId: entry.id,
        });
      },

      renameTabByEntity: (kind, entityId, title) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.kind === kind && tab.entityId === entityId) {
              return {
                ...tab,
                title,
              };
            }

            return tab;
          }),
        })),

      openCharacterTab: (character) => {
        logDebug('workspace', 'openCharacterTab', character);

        get().openTab({
          id: `character:${character.id}`,
          kind: 'character',
          title: character.name || 'Character',
          entityId: character.id,
        });
      },

      openCompendiumTab: (compendium) => {
        logDebug('workspace', 'openCompendiumTab', compendium);

        get().openTab({
          id: `compendium:${compendium.id}`,
          kind: 'compendium',
          title: compendium.name || 'Compendium',
          entityId: compendium.id,
        });
      },
    }),
    {
      name: 'dndstudio.workspace',
      partialize: (state) => ({
        campaignId: state.campaignId,
        lastCampaignId: state.lastCampaignId,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    },
  ),
);```

---
## Файл: ./src/shared/theme/theme.ts
```
export type ThemeMode = 'system' | 'light' | 'dark' | 'plugin';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light') {
    return 'light';
  }

  if (mode === 'dark') {
    return 'dark';
  }

  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyThemeMode(mode: ThemeMode): void {
  const resolved = resolveTheme(mode);

  const root = document.documentElement;

  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
}```

---
## Файл: ./src/shared/ui/BottomPanel.tsx
```
import clsx from 'clsx';

import { ChatPanel } from '../../features/chat/ChatPanel';
import { InitiativePanel } from '../../features/initiative/InitiativePanel';
import { useUiStore, type BottomTab } from '../stores/ui';
import { ConnectionPanel } from '../../features/multiplayer/ConnectionPanel';

const tabs: Array<{
  id: BottomTab;
  label: string;
}> = [
    {
      id: 'initiative',
      label: 'Initiative',
    },
    {
      id: 'chat',
      label: 'Chat',
    },
    {
      id: 'logs',
      label: 'Logs',
    },
    {
      id: 'dslTerminal',
      label: 'DSL Terminal',
    },
    {
      id: 'multiplayer',
      label: 'Multiplayer'
    },
  ];

export function BottomPanel() {
  const activeBottomTab = useUiStore((state) => state.activeBottomTab);
  const setActiveBottomTab = useUiStore(
    (state) => state.setActiveBottomTab,
  );

  return (
    <section className="panel bottom-panel">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx('panel-tab', {
              active: activeBottomTab === tab.id,
            })}
            onClick={() => setActiveBottomTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeBottomTab === 'initiative' && <InitiativePanel />}

        {activeBottomTab === 'chat' && <ChatPanel />}

        {activeBottomTab === 'logs' && (
          <div className="empty-state">Logs will appear here.</div>
        )}

        {activeBottomTab === 'dslTerminal' && (
          <div className="empty-state">
            DSL terminal is planned for Phase 2+.
          </div>
        )}

        {activeBottomTab === 'multiplayer' && <ConnectionPanel />}
      </div>
    </section>
  );
}```

---
## Файл: ./src/shared/ui/CenterArea.tsx
```
import { useEffect, useRef } from 'react';

import { useActiveCampaign, useActiveScene } from '../api/hooks';
import { StartScreen } from '../../features/campaign-start/StartScreen';
import { JournalTab } from '../../features/journal/JournalTab';
import { CharacterTab } from '../../features/character/CharacterTab';
import { MapTab } from '../../features/map/MapTab';
import { logDebug } from '../lib/debug';
import { useWorkspaceStore } from '../stores/workspace';
import { CompendiumTab } from '../../features/compendium/CompendiumTab';
import { usePlayerVisibility } from '../../shared/hooks/usePlayerVisibility';
import { WaitingForGM } from '../../features/multiplayer/WaitingForGM';
import { useMaps } from '../../shared/api/hooks';

import { WorkspaceTabBar } from './WorkspaceTabBar';

function WorkspaceEmpty() {
  return (
    <div className="workspace-empty">
      <div className="workspace-placeholder">
        <h2>Workspace</h2>
        <p>Open a map from the Navigator panel.</p>
      </div>
    </div>
  );
}

function ActiveTabContent() {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const activeCampaign = useActiveCampaign();

  const { data: maps = [] } = useMaps(Boolean(activeCampaign));
  const { canSeeMap, isGM } = usePlayerVisibility();

  const visibleMaps = maps.filter(canSeeMap);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return <WorkspaceEmpty />;
  }
  if (!isGM && visibleMaps.length === 0 && tabs.length === 0) {
    return <WaitingForGM />;
  }

  if (activeTab.kind === 'map') {
    return <MapTab mapId={activeTab.entityId} />;
  }

  if (activeTab.kind === 'journal') {
    return <JournalTab entryId={activeTab.entityId} />;
  }

  if (activeTab.kind === 'character') {
    return <CharacterTab characterId={activeTab.entityId} />;
  }

  if (activeTab.kind === 'compendium') {
    return <CompendiumTab compendiumId={activeTab.entityId} />;
  }

  return (
    <div className="workspace-empty">
      This tab type will be implemented later.
    </div>
  );
}

export function CenterArea() {
  const { data: activeCampaign, isLoading } = useActiveCampaign();

  const bindCampaign = useWorkspaceStore((state) => state.bindCampaign);
  const lastCampaignId = useWorkspaceStore((state) => state.lastCampaignId);
  const setLastCampaignId = useWorkspaceStore(
    (state) => state.setLastCampaignId,
  );
  const { data: maps = [] } = useMaps(Boolean(activeCampaign));
  const { data: activeSceneId } = useActiveScene(Boolean(activeCampaign));
  const { isGM, isLocalMode, canSeeMap } = usePlayerVisibility();

  const openTab = useWorkspaceStore((state) => state.openTab);

  const previousActiveCampaignIdRef = useRef<string | null>(null);


  useEffect(() => {
    const currentActiveCampaignId = activeCampaign?.id ?? null;

    logDebug('center', 'session sync effect', {
      isLoading,
      currentActiveCampaignId,
      lastCampaignId,
      previousActiveCampaignId: previousActiveCampaignIdRef.current,
    });

    if (isLoading) {
      return;
    }

    if (currentActiveCampaignId) {
      // Сохраняем lastCampaignId только когда активная кампания реально сменилась.
      // Это важно, чтобы не восстановить lastCampaignId обратно во время
      // закрытия кампании через кнопку Switch campaign.
      if (previousActiveCampaignIdRef.current !== currentActiveCampaignId) {
        logDebug(
          'center',
          'new active campaign detected, saving lastCampaignId',
          currentActiveCampaignId,
        );

        setLastCampaignId(currentActiveCampaignId);
      }

      previousActiveCampaignIdRef.current = currentActiveCampaignId;

      bindCampaign(currentActiveCampaignId);
      return;
    }

    previousActiveCampaignIdRef.current = null;

    if (!lastCampaignId) {
      logDebug(
        'center',
        'no active campaign and no last campaign, resetting workspace',
      );

      bindCampaign(null);
      return;
    }

    logDebug(
      'center',
      'no active campaign yet, but lastCampaignId exists, waiting for restore',
      {
        lastCampaignId,
      },
    );
  }, [
    activeCampaign?.id,
    isLoading,
    lastCampaignId,
    bindCampaign,
    setLastCampaignId,
  ]);

  useEffect(() => {
    if (isGM || isLocalMode) return;
    if (!activeSceneId) return;

    const sceneMap = maps.find((m) => m.id === activeSceneId);

    if (sceneMap && sceneMap.isVisibleToPlayers) {
      // Открываем вкладку карты если ещё не открыта
      const tabId = `map:${sceneMap.id}`;
      openTab({
        id: tabId,
        kind: 'map',
        title: sceneMap.name,
        entityId: sceneMap.id,
      });
    }
  }, [activeSceneId, maps, isGM, isLocalMode, openTab]);

  if (isLoading) {
    return (
      <main className="center-area">
        <div className="empty-state">Loading workspace…</div>
      </main>
    );
  }

  if (!activeCampaign) {
    return (
      <main className="center-area">
        <StartScreen />
      </main>
    );
  }

  return (
    <main className="center-area workspace-center">
      <div className="workspace-shell">
        <WorkspaceTabBar />

        <div className="workspace-content">
          <ActiveTabContent />
        </div>
      </div>
    </main>
  );
}```

---
## Файл: ./src/shared/ui/ConfirmDialog.tsx
```
import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>

        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>

        <div className="confirm-dialog-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={destructive ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---
## Файл: ./src/shared/ui/DragOverlay.tsx
```
import { useDragStore } from '../stores/drag';

export function DragOverlay() {
  const dragging = useDragStore((s) => s.dragging);
  const pointer = useDragStore((s) => s.pointer);
  const activeTarget = useDragStore((s) => s.activeTarget);

  if (!dragging || !pointer) return null;

  return (
    <div
      className="drag-overlay"
      style={{
        left: pointer.x + 16,
        top: pointer.y + 16,
      }}
    >
      <span className="drag-overlay-icon">{dragging.icon ?? '👤'}</span>
      <span className="drag-overlay-name">{dragging.name}</span>
      {activeTarget && <span className="drag-overlay-badge">Drop!</span>}
    </div>
  );
}```

---
## Файл: ./src/shared/ui/LeftActivityBar.tsx
```
import clsx from 'clsx';
import { Book, Folder, Puzzle, type LucideIcon } from 'lucide-react';

import { useUiStore, type LeftTab } from '../stores/ui';

const items: Array<{
  id: LeftTab;
  label: string;
  Icon: LucideIcon;
}> = [
  {
    id: 'navigator',
    label: 'Campaign Navigator',
    Icon: Folder,
  },
  {
    id: 'plugins',
    label: 'Plugins',
    Icon: Puzzle,
  },
  {
    id: 'compendiums',
    label: 'Compendiums',
    Icon: Book,
  },
];

export function LeftActivityBar() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);
  const leftVisible = useUiStore((state) => state.leftVisible);
  const toggleLeftTab = useUiStore((state) => state.toggleLeftTab);

  return (
    <nav className="activity-bar activity-bar-left" aria-label="Left panel tabs">
      {items.map(({ id, label, Icon }) => {
        const selected = activeLeftTab === id;
        const open = leftVisible && selected;

        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={open}
            className={clsx('activity-bar-button', {
              selected,
              open,
            })}
            onClick={() => toggleLeftTab(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}```

---
## Файл: ./src/shared/ui/LeftPanel.tsx
```
import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import {
  DependencyCheckResult,
  useActiveCampaign,
  useCompendiums,
  useDeleteCompendium,
  useInstallBuiltinPlugin,
  useInstalledPlugins,
  useInstallPlugin,
  useSetPluginActive,
  useUninstallPlugin,
  useUpdateCompendium,
  useValidatePluginDependencies,
} from '../api/hooks';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';
import { CampaignTree } from '../../features/navigator/CampaignTree';
import { CreateCompendiumModal } from '../../features/compendium/CreateCompendiumModal';


function parsePluginManifest(rawJson: string): {
  name?: string;
  description?: string;
  author?: string;
  dependencies?: Array<{ id: string; version: string }>;
} | null {
  try {
    return JSON.parse(rawJson);
  } catch {
    return null;
  }
}

function PluginsPanel() {
  const { data: activeCampaign } = useActiveCampaign();

  const { data: plugins = [], isLoading } = useInstalledPlugins(
    Boolean(activeCampaign),
  );

  const installPlugin = useInstallPlugin();
  const installBuiltinPlugin = useInstallBuiltinPlugin();
  const setPluginActive = useSetPluginActive();
  const uninstallPlugin = useUninstallPlugin();
  const validateDeps = useValidatePluginDependencies();

  // Состояние для отображения результата проверки зависимостей
  const [depCheckResult, setDepCheckResult] = useState<{
    pluginId: string;
    result: DependencyCheckResult;
  } | null>(null);

  if (!activeCampaign) {
  return (
    <div className="empty-state">
      Откройте кампанию для управления плагинами.
    </div>
  );
  }

  const handleInstallPlugin = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Плагин DndStudio',
            extensions: ['dndplugin'],
          },
        ],
      });

      if (typeof selected === 'string') {
        installPlugin.mutate(selected);
      }
    } catch (error) {
      console.error('Failed to install plugin', error);
    }
  };

  const handleInstallBuiltin = (pluginName: string) => {
    installBuiltinPlugin.mutate(pluginName);
  };

  const handleToggleActive = (pluginId: string, isActive: boolean) => {
    setPluginActive.mutate(
      { pluginId, isActive },
      {
        onError: (error: Error) => {
          alert(
            `Не удалось ${isActive ? 'активировать' : 'деактивировать'} плагин:\n${error.message}`,
          );
        },
      },
    );
  };

  const handleValidateDeps = (pluginId: string) => {
    validateDeps.mutate(pluginId, {
      onSuccess: (result) => {
        setDepCheckResult({ pluginId, result });
      },
    });
  };

  const handleUninstall = (pluginId: string, pluginName: string) => {
    // Проверяем зависимости перед удалением
    const dependents = plugins.filter((p) => {
      const manifest = parsePluginManifest(p.manifestJson);
      return manifest?.dependencies?.some((d) => d.id === pluginId);
    });

    if (dependents.length > 0) {
      const depNames = dependents
        .map((d) => {
          const m = parsePluginManifest(d.manifestJson);
          return m?.name ?? d.pluginId;
        })
        .join(', ');

      alert(
        `Cannot uninstall "${pluginName}".\nDependent plugins: ${depNames}`,
      );
      return;
    }

    if (
      window.confirm(
        `Удалить плагин "${pluginName}"? Его компендиумы будут удалены.`,
      )
    ) {
      uninstallPlugin.mutate(pluginId);
    }
  };

  const hasSrdPlugin = plugins.some((p) => p.pluginId === 'srd-monsters');

  return (
    <div className="navigator">
      {/* Built-in plugins */}
      <div className="navigator-section">
        <div className="navigator-section-title">Встроенные плагины</div>

        <div className="builtin-plugin-card">
          <div className="builtin-plugin-info">
            <div className="builtin-plugin-name">SRD Монстры</div>
            <div className="builtin-plugin-description">
              Базовый набор монстров из SRD (8 монстров)
            </div>
          </div>

          {hasSrdPlugin ? (
            <span className="builtin-plugin-installed">✓ Установлен</span>
          ) : (
            <button
              type="button"
              onClick={() => handleInstallBuiltin('srd-monsters')}
              disabled={installBuiltinPlugin.isPending}
            >
              {installBuiltinPlugin.isPending ? 'Установка…' : 'Установить'}
            </button>
          )}
        </div>
      </div>

      {/* Installed plugins */}
      <div className="navigator-section">
        <div className="navigator-section-title">Установленные плагины</div>

        <button
          type="button"
          onClick={handleInstallPlugin}
          disabled={installPlugin.isPending}
        >
          {installPlugin.isPending ? 'Установка…' : 'Установить .dndplugin'}
        </button>

        {isLoading && <div className="empty-state">Загрузка плагинов…</div>}

        {!isLoading && plugins.length === 0 && (
          <div className="empty-state">Плагины не установлены.</div>
        )}

        <div className="plugin-list">
          {plugins.map((plugin) => {
            const manifest = parsePluginManifest(plugin.manifestJson);
            const deps = manifest?.dependencies ?? [];

            return (
              <div key={plugin.pluginId} className="plugin-item">
                <label className="plugin-active-label">
                  <input
                    type="checkbox"
                    checked={plugin.isActive}
                    disabled={setPluginActive.isPending}
                    onChange={(event) =>
                      handleToggleActive(plugin.pluginId, event.target.checked)
                    }
                  />

                  <div className="plugin-info">
                    <div className="plugin-name">
                      {manifest?.name ?? plugin.pluginId}
                    </div>

                    <div className="plugin-meta">
                      v{plugin.version}
                      {manifest?.author ? ` · ${manifest.author}` : ''}
                    </div>

                    {manifest?.description && (
                      <div className="plugin-description">
                        {manifest.description}
                      </div>
                    )}

                    {/* Зависимости */}
                    {deps.length > 0 && (
                      <div className="plugin-deps">
                        <span className="plugin-deps-label">Deps:</span>
                        {deps.map((dep) => {
                          const depInstalled = plugins.some(
                            (p) => p.pluginId === dep.id,
                          );
                          const depActive = plugins.some(
                            (p) => p.pluginId === dep.id && p.isActive,
                          );

                          return (
                            <span
                              key={dep.id}
                              className={
                                depActive
                                  ? 'plugin-dep-ok'
                                  : depInstalled
                                    ? 'plugin-dep-inactive'
                                    : 'plugin-dep-missing'
                              }
                              title={`${dep.id} ${dep.version}`}
                            >
                              {dep.id}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Предупреждение о совместимости */}
                    {plugin.compatWarning && (
                      <div className="plugin-warning">
                        ⚠️ {plugin.compatWarning}
                      </div>
                    )}

                    {/* Результат проверки зависимостей */}
                    {depCheckResult?.pluginId === plugin.pluginId && (
                      <div className="plugin-dep-check">
                        {depCheckResult.result.allSatisfied ? (
                          <span className="plugin-dep-ok">
                            ✓ Все зависимости выполнены
                          </span>
                        ) : (
                          <div>
                            {depCheckResult.result.missing.length > 0 && (
                              <div className="plugin-dep-missing">
                                Отсутствуют: {depCheckResult.result.missing.join(', ')}
                              </div>
                            )}
                            {depCheckResult.result.inactive.length > 0 && (
                              <div className="plugin-dep-inactive">
                                Неактивны: {depCheckResult.result.inactive.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                <div className="plugin-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Проверить зависимости"
                      onClick={() => handleValidateDeps(plugin.pluginId)}
                      disabled={validateDeps.isPending}
                    >
                      🔍
                    </button>

                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      title="Удалить плагин"
                      disabled={uninstallPlugin.isPending}
                      onClick={() =>
                        handleUninstall(
                          plugin.pluginId,
                          manifest?.name ?? plugin.pluginId,
                        )
                      }
                    >
                      🗑️
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================================= */
/* Панель Компендиев                         */
/* ========================================= */
function CompendiumsPanel() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateCompendiumOpen, setIsCreateCompendiumOpen] = useState(false);

  const { data: activeCampaign } = useActiveCampaign();
  const { data: compendiums = [], isLoading } = useCompendiums(
    Boolean(activeCampaign),
  );

  const updateCompendium = useUpdateCompendium();
  const deleteCompendium = useDeleteCompendium();
  const openCompendiumTab = useWorkspaceStore(
    (state) => state.openCompendiumTab,
  );

  if (!activeCampaign) {
  return (
    <div className="empty-state">
      Откройте кампанию, чтобы увидеть компендиумы.
    </div>
  );
  }

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEditing = () => {
    if (!editingId) return;

    const name = editName.trim();
    if (!name) return;

    const compendium = compendiums.find((c) => c.id === editingId);
    if (!compendium) return;

    updateCompendium.mutate(
      {
        id: editingId,
        name,
        compendiumType: compendium.type,
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName('');
        },
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Удалить компендиум "${name}" и все его записи?`)) {
      return;
    }

    deleteCompendium.mutate({ id });
  };

  return (
    <div className="navigator">
        <div className="navigator-section">
          <div className="navigator-section-header">
            <span className="navigator-section-title">Compendiums</span>
            <button
              type="button"
              className="icon-btn"
              title="Create new compendium"
              onClick={() => setIsCreateCompendiumOpen(true)}
            >
              ＋
            </button>
          </div>

          {isLoading && (
            <div className="empty-state">Загрузка компендиумов…</div>
          )}

          {!isLoading && compendiums.length === 0 && (
            <div className="empty-state">Компендиумов пока нет.</div>
          )}

        <ul className="navigator-list">
          {compendiums.map((compendium) => {
            const isEditing = editingId === compendium.id;
            const isFromPlugin = Boolean(compendium.sourcePluginId);

            return (
              <li key={compendium.id}>
                {isEditing ? (
                  <div className="navigator-item-edit">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveEditing();
                        if (event.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveEditing}
                      disabled={updateCompendium.isPending}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="navigator-item-row">
                    <button
                      type="button"
                      className="navigator-item navigator-item-grow"
                      onClick={() => openCompendiumTab(compendium)}
                    >
                      <span>{compendium.name}</span>
                      <small>
                        {compendium.type}
                        {isFromPlugin && ' 🔌'}
                      </small>
                    </button>

                    {!isFromPlugin && (
                      <div className="navigator-item-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Переименовать"
                      onClick={() =>
                        startEditing(compendium.id, compendium.name)
                      }
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      title="Удалить"
                      onClick={() =>
                        handleDelete(compendium.id, compendium.name)
                      }
                    >
                      🗑️
                    </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <CreateCompendiumModal
        open={isCreateCompendiumOpen}
        onClose={() => setIsCreateCompendiumOpen(false)}
      />
    </div>
  );
}

/* ========================================= */
/* Панель Навигатора (дерево кампании)       */
/* ========================================= */

function NavigatorPanel() {
  return <CampaignTree />;
}

/* ========================================= */
/* Левая панель (контейнер вкладок)          */
/* ========================================= */

/* ========================================= */
/* Левая панель (контейнер вкладок)          */
/* ========================================= */

export function LeftPanel() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);

  return (
    <aside className="panel left-panel" aria-label="Left panel content">
      <div className="panel-content">
        {activeLeftTab === 'navigator' && <NavigatorPanel />}

        {activeLeftTab === 'plugins' && <PluginsPanel />}

        {activeLeftTab === 'compendiums' && <CompendiumsPanel />}
      </div>
    </aside>
  );
}```

---
## Файл: ./src/shared/ui/Modal.tsx
```
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 440,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Всегда держим актуальную ссылку на onClose
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Эффект открытия: срабатывает ТОЛЬКО при изменении `open`
  useEffect(() => {
    if (!open) return;

    // Сохраняем элемент, который был в фокусе ДО открытия модалки
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Фокус на первый фокусируемый элемент
    const frameId = requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [open]); // ← Только `open`, никаких callback'ов

  // Эффект закрытия: возвращаем фокус при закрытии
  useEffect(() => {
    if (open) return;

    // Возвращаем фокус на элемент, который был активен до открытия
    if (previousActiveElement.current) {
      requestAnimationFrame(() => {
        previousActiveElement.current?.focus();
        previousActiveElement.current = null;
      });
    }
  }, [open]);

  // Escape: используем ref, чтобы не добавлять onClose в зависимости
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]); // ← Только `open`

  // Блокировка скролла body
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}```

---
## Файл: ./src/shared/ui/RightActivityBar.tsx
```
import clsx from 'clsx';
import { List, Search, type LucideIcon } from 'lucide-react';

import { useUiStore, type RightTab } from '../stores/ui';

const items: Array<{
  id: RightTab;
  label: string;
  Icon: LucideIcon;
}> = [
  {
    id: 'inspector',
    label: 'Inspector',
    Icon: Search,
  },
  {
    id: 'journalToc',
    label: 'Journal Table of Contents',
    Icon: List,
  },
];

export function RightActivityBar() {
  const activeRightTab = useUiStore((state) => state.activeRightTab);
  const rightVisible = useUiStore((state) => state.rightVisible);
  const toggleRightTab = useUiStore((state) => state.toggleRightTab);

  return (
    <nav className="activity-bar activity-bar-right" aria-label="Right panel tabs">
      {items.map(({ id, label, Icon }) => {
        const selected = activeRightTab === id;
        const open = rightVisible && selected;

        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={open}
            className={clsx('activity-bar-button', {
              selected,
              open,
            })}
            onClick={() => toggleRightTab(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}```

---
## Файл: ./src/shared/ui/RightPanel.tsx
```
import {
  useActiveCampaign,
  useAssignTokenCharacter,
  useCharacters,
  useCreateJournalEntry,
  useJournalEntries,
  useTokens,
} from '../api/hooks';
import { useTableStore } from '../stores/table';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

function InspectorPanel() {
  const selectedMapId = useTableStore((state) => state.selectedMapId);
  const selectedTokenId = useTableStore((state) => state.selectedTokenId);

  const { data: tokens = [], isLoading: areTokensLoading } = useTokens(
    selectedMapId ?? undefined,
  );

  const token = tokens.find((item) => item.id === selectedTokenId);

  const { data: characters = [] } = useCharacters(Boolean(selectedMapId));

  const assignTokenCharacter = useAssignTokenCharacter();

  const openCharacterTab = useWorkspaceStore(
    (state) => state.openCharacterTab,
  );

  if (!selectedMapId || !selectedTokenId) {
    return (
      <div className="empty-state">
        Select a token on the map.
      </div>
    );
  }

  if (areTokensLoading) {
    return <div className="empty-state">Loading token…</div>;
  }

  if (!token) {
    return <div className="empty-state">Token not found.</div>;
  }

  const assignedCharacter = characters.find(
    (character) => character.id === token.characterId,
  );

  return (
    <div className="inspector">
      <div className="inspector-section">Token</div>

      <div className="inspector-row">
        <span>ID</span>
        <code>{token.id.slice(0, 8)}</code>
      </div>

      <div className="inspector-row">
        <span>Position</span>
        <span>
          {Math.round(token.x ?? 0)}, {Math.round(token.y ?? 0)}
        </span>
      </div>

      <div className="inspector-row">
        <span>Visible</span>
        <span>{token.isVisible ? 'Yes' : 'No'}</span>
      </div>

      <div className="inspector-section">Character</div>

      <select
        value={token.characterId ?? ''}
        disabled={assignTokenCharacter.isPending}
        onChange={(event) => {
          assignTokenCharacter.mutate({
            mapId: selectedMapId,
            tokenId: token.id,
            characterId: event.target.value || null,
          });
        }}
      >
        <option value="">No character</option>

        {characters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.name} ({character.type.toUpperCase()})
          </option>
        ))}
      </select>

      {assignedCharacter && (
        <button
          type="button"
          onClick={() => openCharacterTab(assignedCharacter)}
        >
          Open character
        </button>
      )}
    </div>
  );
}

function JournalToc() {
  const { data: activeCampaign } = useActiveCampaign();

  const { data: entries = [], isLoading } = useJournalEntries(
    Boolean(activeCampaign),
  );

  const createJournalEntry = useCreateJournalEntry();
  const openJournalTab = useWorkspaceStore((state) => state.openJournalTab);

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to see the journal.
      </div>
    );
  }

  const onCreateEntry = () => {
    createJournalEntry.mutate(
      {
        title: 'New entry',
        folderPath: '/',
      },
      {
        onSuccess: (entry) => {
          openJournalTab(entry);
        },
      },
    );
  };

  return (
    <div className="journal-toc">
      <div className="journal-toc-header">
        <span>Journal</span>

        <button
          type="button"
          onClick={onCreateEntry}
          disabled={createJournalEntry.isPending}
        >
          {createJournalEntry.isPending ? '…' : '+ Entry'}
        </button>
      </div>

      {isLoading && <div className="empty-state">Loading entries…</div>}

      {!isLoading && entries.length === 0 && (
        <div className="empty-state">No journal entries yet.</div>
      )}

      <ul className="journal-toc-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="journal-toc-item"
              onClick={() => openJournalTab(entry)}
            >
              <span>{entry.title}</span>
              <small>{entry.folderPath}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RightPanel() {
  const activeRightTab = useUiStore((state) => state.activeRightTab);

  return (
    <aside className="panel right-panel" aria-label="Right panel content">
      <div className="panel-content">
        {activeRightTab === 'inspector' && <InspectorPanel />}

        {activeRightTab === 'journalToc' && <JournalToc />}
      </div>
    </aside>
  );
}```

---
## Файл: ./src/shared/ui/StatusBar.tsx
```
import { useActiveCampaign } from '../api/hooks';
import { useUiStore } from '../stores/ui';

export function StatusBar() {
  const { data: activeCampaign } = useActiveCampaign();

  const connectionStatus = useUiStore((state) => state.connectionStatus);


  return (
    <footer className="statusbar">
      <div className="statusbar-left">
        <span>🎲 {activeCampaign ? activeCampaign.name : 'No campaign'}</span>
      </div>

      <div className="statusbar-center">
        <span className={`status-connection status-${connectionStatus}`}>
          {connectionStatus === 'connected' && '🟢 Connected'}
          {connectionStatus === 'connecting' && '🟡 Connecting…'}
          {connectionStatus === 'disconnected' && '⚪ Offline'}
          {connectionStatus === 'error' && '🔴 Error'}
        </span>
      </div>

      <div className="statusbar-right">
        <span>🔌 0 plugins</span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}```

---
## Файл: ./src/shared/ui/ThemeSelector.tsx
```
import { useMemo } from 'react';

import type { ThemeMode } from '../theme/theme';
import type { PluginThemeInfo } from '../api/bindings';

interface ThemeSelectorProps {
  currentMode: ThemeMode;
  currentPluginThemeId: string | null;
  pluginThemes: PluginThemeInfo[];
  onModeChange: (mode: ThemeMode) => void;
  onPluginThemeChange: (pluginThemeId: string | null) => void;
}

export function ThemeSelector({
  currentMode,
  currentPluginThemeId,
  pluginThemes,
  onModeChange,
  onPluginThemeChange,
}: ThemeSelectorProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, PluginThemeInfo[]>();

    for (const pt of pluginThemes) {
      const list = groups.get(pt.pluginId) ?? [];
      list.push(pt);
      groups.set(pt.pluginId, list);
    }

    return groups;
  }, [pluginThemes]);

  return (
    <>
      <BaseThemeOption
        value="system"
        label="System"
        isActive={currentMode === 'system'}
        onClick={() => {
          onModeChange('system');
          onPluginThemeChange(null);
        }}
      />
      <BaseThemeOption
        value="light"
        label="Light"
        isActive={currentMode === 'light'}
        onClick={() => {
          onModeChange('light');
          onPluginThemeChange(null);
        }}
      />
      <BaseThemeOption
        value="dark"
        label="Dark"
        isActive={currentMode === 'dark'}
        onClick={() => {
          onModeChange('dark');
          onPluginThemeChange(null);
        }}
      />

      <BaseThemeOption
        value="plugin"
        label="Plugin"
        isActive={currentMode === 'plugin'}
        onClick={() => {
          onModeChange('plugin');
        }}
      />

      {grouped.size > 0 && (
        <div className="menu-group" style={{ borderTop: '1px solid var(--border-gold-strong)', margin: '4px 0', paddingTop: '4px' }}>
          {Array.from(grouped.entries()).map(([pluginId, themes]) => (
            <div key={pluginId} className="menu-group" style={{ marginLeft: '8px' }}>
              <div className="menu-group-label">{pluginId}</div>
              {themes.map((pt) => {
                const pluginThemeId = `${pt.pluginId}::${pt.themeKey}`;
                const isActive = currentMode === 'plugin' && currentPluginThemeId === pluginThemeId;

                return (
                  <BaseThemeOption
                    key={pt.themeKey}
                    value={pt.themeKey}
                    label={pt.themeKey}
                    isActive={isActive}
                    onClick={() => {
                      onPluginThemeChange(pluginThemeId);
                      if (currentMode !== 'plugin') {
                        onModeChange('plugin');
                      }
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

interface BaseThemeOptionProps {
  value: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function BaseThemeOption({ label, isActive, onClick }: BaseThemeOptionProps) {
  return (
    <button
      type="button"
      className={`menu-item ${isActive ? 'selected' : ''}`}
      role="menuitem"
      onClick={onClick}
    >
      <span className="menu-item-label">{label}</span>
      {isActive && <span className="menu-item-check">✓</span>}
    </button>
  );
}
```

---
## Файл: ./src/shared/ui/TopBar.tsx
```
import { useState } from 'react';

import { useActiveCampaign, useCloseCampaign, useCreateCampaign, useExportCampaign, useImportCampaign, usePluginThemes } from '../api/hooks';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

import { Menu, MenuBar, MenuDivider, MenuItem } from './menu/Menu';
import { ThemeSelector } from './ThemeSelector';
import { ConfirmDialog } from './ConfirmDialog';
import { CreateMapModal } from '../../features/map/CreateMapModal';
import { CreateCharacterModal } from '../../features/character/CreateCharacterModal';

export function TopBar() {
  const { data: activeCampaign } = useActiveCampaign();
  const activeProfileId = useUiStore((state) => state.activeProfileId);
  const activeProfileName = useUiStore((state) => state.activeProfileName);

  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);
  const pluginThemeId = useUiStore((state) => state.pluginThemeId);
  const setPluginThemeId = useUiStore((state) => state.setPluginThemeId);

  const toggleLeftPanel = useUiStore((state) => state.toggleLeft);
  const toggleRightPanel = useUiStore((state) => state.toggleRight);
  const toggleBottomPanel = useUiStore((state) => state.toggleBottom);

  const closeActiveTab = useWorkspaceStore((state) => state.closeActiveTab);
  const tabs = useWorkspaceStore((state) => state.tabs);

  const createCampaign = useCreateCampaign();
  const exportCampaign = useExportCampaign();
  const importCampaign = useImportCampaign();
  const closeCampaign = useCloseCampaign();
  const { data: pluginThemes = [] } = usePluginThemes(true);

  // Модалки
  const [isCreateMapOpen, setIsCreateMapOpen] = useState(false);
  const [isCreateCharacterOpen, setIsCreateCharacterOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // ============================================
  // Handlers
  // ============================================

  const handleNewCampaign = () => {
    const name = window.prompt('Campaign name:');
    if (name && activeProfileId) {
      createCampaign.mutate({ name, profileId: activeProfileId });
    }
  };

  const handleExportCampaign = async () => {
    if (!activeCampaign) return;

    // TODO: использовать showSaveDialog из Tauri
    const defaultName = `${activeCampaign.name}.dndcampaign`;
    const path = window.prompt('Export to (path):', defaultName);
    if (path) {
      try {
        await exportCampaign.mutateAsync(path);
        alert('Campaign exported successfully');
      } catch (e) {
        alert(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const handleImportCampaign = async () => {
    // TODO: использовать showOpenDialog из Tauri
    const path = window.prompt('Import from (path to .dndcampaign):');
    if (path && activeProfileId) {
      try {
        await importCampaign.mutateAsync({
          sourcePath: path,
          profileId: activeProfileId,
        });
      } catch (e) {
        alert(`Import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const handleNewMap = () => setIsCreateMapOpen(true);
  const handleNewCharacter = () => setIsCreateCharacterOpen(true);

  // ============================================
  // Logout
  // ============================================

  const setActiveProfile = useUiStore((state) => state.setActiveProfile);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    // Закрываем текущую кампанию
    closeCampaign.mutate();

    // Сбрасываем профиль
    setActiveProfile(null, null);

    // Закрываем все вкладки
    const workspaceStore = useWorkspaceStore.getState();
    workspaceStore.tabs.forEach((tab) => {
      workspaceStore.closeTab(tab.id);
    });

    setIsLogoutDialogOpen(false);
  };

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  useKeyboardShortcuts([
    // File
    { key: 'KeyN', ctrl: true, handler: handleNewCampaign, label: 'New Campaign' },
    { key: 'KeyE', ctrl: true, shift: true, handler: handleExportCampaign, label: 'Export Campaign' },
    { key: 'KeyI', ctrl: true, shift: true, handler: handleImportCampaign, label: 'Import Campaign' },

    // View
    { key: 'KeyB', ctrl: true, handler: toggleLeftPanel, label: 'Toggle Left Panel' },
    { key: 'KeyB', ctrl: true, shift: true, handler: toggleRightPanel, label: 'Toggle Right Panel' },
    { key: 'KeyJ', ctrl: true, handler: toggleBottomPanel, label: 'Toggle Bottom Panel' },

    // Tabs
    { key: 'KeyT', ctrl: true, handler: () => {}, label: 'New Tab' },
    { key: 'KeyW', ctrl: true, handler: closeActiveTab, label: 'Close Tab' },

    // Create
    { key: 'KeyM', ctrl: true, shift: true, handler: handleNewMap, label: 'New Map' },
    { key: 'KeyC', ctrl: true, shift: true, handler: handleNewCharacter, label: 'New Character' },
  ]);

  // ============================================
  // Breadcrumbs
  // ============================================

  const breadcrumbs = [
    activeProfileName ?? 'No profile',
    activeCampaign?.name,
    tabs.length > 0 ? tabs[0].title : null,
  ].filter(Boolean) as string[];

  // ============================================
  // Render
  // ============================================

  return (
    <div className="topbar">
      <MenuBar>
        <Menu id="file" label="File">
          <MenuItem
            label="New Campaign"
            shortcut={{ ctrl: true, key: 'n' }}
            onClick={handleNewCampaign}
          />
          <MenuDivider />
          <MenuItem
            label="New Map"
            shortcut={{ ctrl: true, shift: true, key: 'm' }}
            onClick={handleNewMap}
            disabled={!activeCampaign}
          />
          <MenuItem
            label="New Character"
            shortcut={{ ctrl: true, shift: true, key: 'c' }}
            onClick={handleNewCharacter}
            disabled={!activeCampaign}
          />
          <MenuDivider />
          <MenuItem
            label="Export Campaign"
            shortcut={{ ctrl: true, shift: true, key: 'e' }}
            onClick={handleExportCampaign}
            disabled={!activeCampaign}
          />
          <MenuItem
            label="Import Campaign"
            shortcut={{ ctrl: true, shift: true, key: 'i' }}
            onClick={handleImportCampaign}
          />
          <MenuDivider />
          <MenuItem
            label="Close Campaign"
            onClick={() => closeCampaign.mutate()}
            disabled={closeCampaign.isPending}
          />
        </Menu>

        <Menu id="view" label="View">
          <MenuItem
            label="Toggle Left Panel"
            shortcut={{ ctrl: true, key: 'b' }}
            onClick={toggleLeftPanel}
          />
          <MenuItem
            label="Toggle Right Panel"
            shortcut={{ ctrl: true, shift: true, key: 'b' }}
            onClick={toggleRightPanel}
          />
          <MenuItem
            label="Toggle Bottom Panel"
            shortcut={{ ctrl: true, key: 'j' }}
            onClick={toggleBottomPanel}
          />
          <MenuDivider />
          <MenuItem
            label={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
            submenu={
              <ThemeSelector
                currentMode={themeMode}
                currentPluginThemeId={pluginThemeId}
                pluginThemes={pluginThemes}
                onModeChange={setThemeMode}
                onPluginThemeChange={setPluginThemeId}
              />
            }
          />
        </Menu>

        <Menu id="tools" label="Tools">
          <MenuItem label="Dice Roller" onClick={() => {}} disabled />
          <MenuItem label="Initiative Tracker" onClick={() => {}} disabled />
          <MenuDivider />
          <MenuItem label="Plugins" onClick={() => {}} disabled />
          <MenuItem label="Connection" onClick={() => {}} disabled />
        </Menu>

        <Menu id="help" label="Help">
          <MenuItem label="About DndStudio" onClick={() => {}} />
          <MenuItem label="Documentation" onClick={() => {}} disabled />
          <MenuItem label="Report Issue" onClick={() => {}} disabled />
        </Menu>
      </MenuBar>

      {/* Breadcrumbs */}
      <div className="topbar-breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="topbar-breadcrumb">
            {i > 0 && <span className="topbar-breadcrumb-sep">›</span>}
            <span className="topbar-breadcrumb-text">{crumb}</span>
          </span>
        ))}

        {/* Кнопка выхода из профиля */}
        {activeProfileId && (
          <button
            type="button"
            className="topbar-logout-btn"
            onClick={handleLogout}
            title="Выйти из профиля"
          >
            🚪
          </button>
        )}
      </div>

      {/* Диалог подтверждения выхода */}
      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="Выйти из профиля?"
        message="Все несохранённые изменения будут потеряны. Вы уверены?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />

      {/* Модалки */}
      <CreateMapModal
        open={isCreateMapOpen}
        onClose={() => setIsCreateMapOpen(false)}
      />
      <CreateCharacterModal
        open={isCreateCharacterOpen}
        onClose={() => setIsCreateCharacterOpen(false)}
      />
    </div>
  );
}
```

---
## Файл: ./src/shared/ui/WorkspaceTabBar.tsx
```
import clsx from 'clsx';

import { useWorkspaceStore } from '../stores/workspace';

export function WorkspaceTabBar() {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);

  if (tabs.length === 0) {
    return <div className="workspace-tabbar workspace-tabbar-empty" />;
  }

  return (
    <div className="workspace-tabbar">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={clsx('workspace-tab', {
              active,
            })}
            onClick={() => setActiveTab(tab.id)}
            onMouseDown={(event) => {
              if (event.button === 1) {
                event.preventDefault();
                event.stopPropagation();
                closeTab(tab.id);
              }
            }}
            role="tab"
            aria-selected={active}
          >
            <span className="workspace-tab-title">{tab.title}</span>

            <button
              type="button"
              className="workspace-tab-close"
              aria-label={`Close ${tab.title}`}
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}```

---
## Файл: ./src/shared/ui/menu/Menu.tsx
```
import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import { formatShortcut, type Shortcut } from '../../hooks/useKeyboardShortcuts';

// ============================================
// Context для меню
// ============================================

interface MenuContextValue {
  closeAll: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('Menu components must be used inside <MenuBar>');
  return ctx;
}

// ============================================
// MenuBar — контейнер меню верхнего уровня
// ============================================

interface MenuBarProps {
  children: ReactNode;
}

export function MenuBar({ children }: MenuBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const closeAll = () => setOpenMenuId(null);

  // Закрытие по клику вне
  const handleDocumentClick = (e: MouseEvent) => {
    if (!barRef.current?.contains(e.target as Node)) {
      closeAll();
    }
  };

  // Используем useEffect для document listener
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  return (
    <MenuContext.Provider value={{ closeAll }}>
      <div
        ref={barRef}
        className="menu-bar"
      >
        {Array.isArray(children)
          ? children.map((child, i) => {
              if (!child) return null;
              const menuChild = child as React.ReactElement<MenuProps>;
              const id = menuChild.props.id ?? `menu-${i}`;
              return (
                <MenuTrigger
                  key={id}
                  id={id}
                  label={menuChild.props.label}
                  isOpen={openMenuId === id}
                  onToggle={() =>
                    setOpenMenuId((prev) => (prev === id ? null : id))
                  }
                >
                  {menuChild.props.children}
                </MenuTrigger>
              );
            })
          : children}
      </div>
    </MenuContext.Provider>
  );
}

// ============================================
// MenuTrigger — кнопка меню + dropdown
// ============================================

interface MenuTriggerProps {
  id: string;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function MenuTrigger({
  label,
  isOpen,
  onToggle,
  children,
}: MenuTriggerProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="menu-trigger-wrapper"
      onMouseLeave={(e) => {
        if (isOpen && dropdownRef.current?.contains(e.relatedTarget as Node)) return;
        if (isOpen) onToggle();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`menu-trigger ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        onMouseEnter={() => {
          // При наведении на другой trigger — переключаемся
          if (isOpen) return;
          const anyOpen = document.querySelector('.menu-trigger.open');
          if (anyOpen) onToggle();
        }}
      >
        {label}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="menu-dropdown"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MenuList>{children}</MenuList>
        </div>
      )}
    </div>
  );
}

// ============================================
// Menu — контейнер элементов меню
// ============================================

interface MenuProps {
  id?: string;
  label: string;
  children: ReactNode;
}

export function Menu({ children }: MenuProps) {
  return <>{children}</>;
}

// ============================================
// MenuList — список элементов
// ============================================

interface MenuListProps {
  children: ReactNode;
}

function MenuList({ children }: MenuListProps) {
  return (
    <div className="menu-list" role="menu">
      {children}
    </div>
  );
}

// ============================================
// MenuItem — элемент меню
// ============================================

interface MenuItemProps {
  label: string;
  shortcut?: Omit<Shortcut, 'handler' | 'label'>;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  /** Если true — показывает индикатор текущего выбора */
  selected?: boolean;
  /** Подменю, которое показывается при наведении */
  submenu?: ReactNode;
}

export function MenuItem({
  label,
  shortcut,
  icon,
  disabled = false,
  destructive = false,
  onClick,
  selected,
  submenu,
}: MenuItemProps) {
  const { closeAll } = useMenuContext();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    closeAll();
  };

  return (
    <div
      className={`menu-item-wrapper ${isSubmenuOpen ? 'open' : ''}`}
      onMouseEnter={() => setIsSubmenuOpen(true)}
      onMouseLeave={() => setIsSubmenuOpen(false)}
    >
      <button
        type="button"
        className={`menu-item ${disabled ? 'disabled' : ''} ${
          destructive ? 'destructive' : ''
        } ${selected ? 'selected' : ''}`}
        role="menuitem"
        disabled={disabled}
        onClick={handleClick}
      >
        {icon && <span className="menu-item-icon">{icon}</span>}
        <span className="menu-item-label">{label}</span>
        {selected && <span className="menu-item-check">✓</span>}
        {submenu && <span className="menu-item-arrow">›</span>}
        {shortcut && !submenu && (
          <span className="menu-item-shortcut">{formatShortcut(shortcut)}</span>
        )}
      </button>

      {isSubmenuOpen && submenu && (
        <div
          className="menu-submenu"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="menu-list" role="menu">{submenu}</div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MenuDivider — разделитель
// ============================================

export function MenuDivider() {
  return <div className="menu-divider" role="separator" />;
}

// ============================================
// MenuGroup — заголовок группы
// ============================================

interface MenuGroupProps {
  label: string;
  children: ReactNode;
}

export function MenuGroup({ label, children }: MenuGroupProps) {
  return (
    <div className="menu-group">
      <div className="menu-group-label">{label}</div>
      {children}
    </div>
  );
}
```

---
## Файл: ./src/styles/global.css
```
:root {
  color-scheme: dark;

  --font-ui: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif;

  /* Dark fallback */
  --bg: #0d0f14;
  --bg-top: #12151d;

  --panel: #141824;
  --panel-2: #1a2130;
  --panel-overlay: rgba(20, 24, 36, 0.88);

  --border: #2a3244;

  --text: #e8ecf5;
  --muted: #98a4ba;

  --accent: #7c5cff;
  --accent-hover: #8f73ff;
  --accent-contrast: #ffffff;
  --danger: #ef4444;

  --gold: #e3c26d;
  --gold-strong: #d4af37;

  --gold-soft: rgba(212, 175, 55, 0.16);
  --gold-softer: rgba(212, 175, 55, 0.08);

  --border-gold: rgba(212, 175, 55, 0.28);
  --border-gold-strong: rgba(212, 175, 55, 0.55);

  --bg-glow-1: rgba(124, 92, 255, 0.12);
  --bg-glow-2: rgba(212, 175, 55, 0.1);
  --bg-glow-3: rgba(59, 130, 246, 0.08);

  --surface-sheen: rgba(255, 255, 255, 0.03);
  --grid-line: rgba(255, 255, 255, 0.035);
  --shadow: rgba(0, 0, 0, 0.35);
}

:root[data-theme='dark'] {
  color-scheme: dark;

  --bg: #0d0f14;
  --bg-top: #12151d;

  --panel: #141824;
  --panel-2: #1a2130;
  --panel-overlay: rgba(20, 24, 36, 0.88);

  --border: #2a3244;

  --text: #e8ecf5;
  --muted: #98a4ba;

  --accent: #7c5cff;
  --accent-hover: #8f73ff;
  --accent-contrast: #ffffff;
  --danger: #ef4444;

  --gold: #e3c26d;
  --gold-strong: #d4af37;

  --gold-soft: rgba(212, 175, 55, 0.16);
  --gold-softer: rgba(212, 175, 55, 0.08);

  --border-gold: rgba(212, 175, 55, 0.28);
  --border-gold-strong: rgba(212, 175, 55, 0.55);

  --bg-glow-1: rgba(124, 92, 255, 0.12);
  --bg-glow-2: rgba(212, 175, 55, 0.1);
  --bg-glow-3: rgba(59, 130, 246, 0.08);

  --surface-sheen: rgba(255, 255, 255, 0.03);
  --grid-line: rgba(255, 255, 255, 0.035);
  --shadow: rgba(0, 0, 0, 0.35);
}

:root[data-theme='light'] {
  color-scheme: light;

  --bg: #f3f1e3;
  --bg-top: #fbf9ef;

  --panel: #fffdf7;
  --panel-2: #f3ecda;
  --panel-overlay: rgba(255, 253, 247, 0.92);

  --border: #d7cdb4;

  --text: #23262e;
  --muted: #6f6752;

  --accent: #6c4cf1;
  --accent-hover: #5d3de4;
  --accent-contrast: #ffffff;
  --danger: #dc2626;

  --gold: #9a9812;
  --gold-strong: #8a780f;

  --gold-soft: rgba(164, 119, 20, 0.16);
  --gold-softer: rgba(164, 119, 20, 0.08);

  --border-gold: rgba(164, 119, 20, 0.3);
  --border-gold-strong: rgba(164, 119, 20, 0.58);

  --bg-glow-1: rgba(125, 92, 255, 0.308);
  --bg-glow-2: rgba(164, 162, 20, 0.178);
  --bg-glow-3: rgba(59, 131, 246, 0.164);

  --surface-sheen: rgba(255, 255, 255, 0.5);
  --grid-line: rgba(97, 85, 15, 0.055);
  --shadow: rgba(39, 49, 6, 0.12);
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--text);

  background-image:
    radial-gradient(1100px 700px at 12% 14%,
      var(--bg-glow-1),
      transparent 55%),
    radial-gradient(900px 650px at 88% 18%,
      var(--bg-glow-2),
      transparent 50%),
    radial-gradient(1100px 800px at 50% 115%,
      var(--bg-glow-3),
      transparent 60%),
    linear-gradient(180deg,
      var(--bg-top),
      var(--bg) 38%,
      var(--bg));

  background-color: var(--bg);
  background-attachment: fixed;
  overflow: hidden;
}

/* Очень лёгкая сетка, чтобы фон не был однотонным */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  opacity: 0.18;

  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);

  background-size: 32px 32px;
}

#root {
  position: relative;
  z-index: 1;
}

button {
  font: inherit;
  border: 1px solid var(--border-gold);
  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel-2);
  color: var(--text);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

button:hover:not(:disabled) {
  border-color: var(--border-gold-strong);
  background:
    linear-gradient(180deg,
      var(--gold-softer),
      transparent 40%),
    var(--panel-2);
}

button:disabled {
  opacity: 0.6;
  cursor: default;
}

input,
select {
  font: inherit;
  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 24%),
    var(--panel);
  color: var(--text);
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--border-gold-strong);
  outline-offset: 2px;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--panel-2);
  border: 1px solid var(--border-gold);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  border-color: var(--border-gold-strong);
}

.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.topbar {
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 22%),
    var(--panel);

  border-bottom: 1px solid var(--border-gold-strong);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.12),
    inset 0 -1px 0 var(--gold-softer);
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-brand {
  font-weight: 700;
  color: var(--text);
}

.topbar-menu {
  display: flex;
  gap: 4px;
}

.menu-item {
  border: none;
  background: transparent;
  color: var(--muted);
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: none;
}

.menu-item:hover {
  color: var(--text);
  background: var(--gold-softer);
}

.topbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.breadcrumb {
  color: var(--muted);
}

.topbar-right button {
  padding: 5px 8px;
}

.app-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
}

/* ========================================= */
/* Activity Bar: вертикальные иконки панелей */
/* ========================================= */

.activity-bar {
  width: 46px;
  flex: 0 0 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 0;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 22%),
    var(--panel);

  z-index: 5;
}

.activity-bar-left {
  border-right: 1px solid var(--border-gold-strong);
  box-shadow: inset -1px 0 0 var(--gold-softer);
}

.activity-bar-right {
  border-left: 1px solid var(--border-gold-strong);
  box-shadow: inset 1px 0 0 var(--gold-softer);
}

.activity-bar-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 8px;

  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  box-shadow: none;
}

.activity-bar-button:hover {
  color: var(--text);
  border-color: var(--border-gold);
  background: var(--gold-softer);
}

.activity-bar-button.selected {
  color: var(--gold);
  border-color: var(--border-gold);
  background: var(--gold-softer);
}

.activity-bar-button.open {
  border-color: var(--border-gold-strong);
  background: var(--gold-soft);
  box-shadow:
    0 0 0 1px var(--gold-softer),
    0 0 18px rgba(212, 175, 55, 0.12);
}

.activity-bar-button.selected:not(.open) {
  opacity: 0.78;
  border-style: dashed;
  box-shadow: none;
}

.activity-bar-button svg {
  display: block;
}

/* ========================================= */
/* Panels                                    */
/* ========================================= */

.main-panels {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.panel {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 18%),
    var(--panel);
}

.left-panel {
  border-right: 1px solid var(--border-gold-strong);
  box-shadow: inset -1px 0 0 var(--gold-softer);
}

.right-panel {
  border-left: 1px solid var(--border-gold-strong);
  box-shadow: inset 1px 0 0 var(--gold-softer);
}

.bottom-panel {
  border-top: 1px solid var(--border-gold-strong);
  box-shadow: inset 0 1px 0 var(--gold-softer);
}

.panel-header {
  padding: 9px 10px;
  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);

  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--border-gold);
  overflow-x: auto;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);
}

.panel-tab {
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  padding: 5px 8px;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: none;
}

.panel-tab:hover {
  color: var(--text);
  border-color: var(--border-gold);
  background: var(--gold-softer);
}

.panel-tab.active {
  color: var(--text);
  border-color: var(--border-gold-strong);
  background: var(--panel);
  box-shadow: 0 0 0 1px var(--gold-softer);
}

.panel-content {
  flex: 1;
  min-height: 0;
  padding: 10px;
  overflow: auto;
}

.center-area {
  height: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.empty-state {
  color: var(--muted);
}

.workspace-placeholder {
  max-width: 720px;
  padding: 24px;

  border: 1px dashed var(--border-gold-strong);
  border-radius: 12px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 20%),
    var(--panel-overlay);

  box-shadow:
    0 20px 40px var(--shadow),
    0 0 0 1px var(--gold-softer);

  text-align: center;
}

.workspace-placeholder code {
  display: inline-block;
  margin-top: 10px;
  color: var(--muted);
  word-break: break-all;
}

.start-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.start-card {
  width: min(720px, 100%);
  padding: 24px;

  border: 1px solid var(--border-gold-strong);
  border-radius: 14px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 18%),
    var(--panel-overlay);

  box-shadow:
    0 24px 50px var(--shadow),
    0 0 0 1px var(--gold-softer);
}

.start-form {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

.start-form input {
  flex: 1;
}

.recent-campaigns {
  margin-top: 20px;
}

.recent-campaigns ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-campaigns button {
  width: 100%;
  text-align: left;
}

.error-text {
  color: var(--danger);
  margin-top: 10px;
}

.statusbar {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel);

  border-top: 1px solid var(--border-gold-strong);
  color: var(--muted);
  box-shadow: inset 0 1px 0 var(--gold-softer);
}

.statusbar-left,
.statusbar-center,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resize-handle {
  background: var(--border-gold);
  transition: background 120ms ease;
}

.resize-handle:hover {
  background: var(--gold-strong);
}

.resize-handle-horizontal {
  width: 3px;
}

.resize-handle-vertical {
  height: 3px;
}

.resize-handle-hidden {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  pointer-events: none !important;
}

.resize-handle-hidden.resize-handle-horizontal {
  width: 0 !important;
}

.resize-handle-hidden.resize-handle-vertical {
  height: 0 !important;
}

.navigator {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.navigator-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.navigator-section-title {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.navigator-form {
  display: flex;
  gap: 6px;
}

.navigator-form input {
  flex: 1;
  min-width: 0;
}

.navigator-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.navigator-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.navigator-item small {
  color: var(--muted);
}

/* Workspace tabs */

.center-area.workspace-center {
  align-items: stretch;
  justify-content: stretch;
}

.workspace-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.workspace-tabbar {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 8px 8px 0;
  overflow-x: auto;

  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);
}

.workspace-tabbar-empty {
  min-height: 38px;
}

.workspace-tab {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 6px 10px;

  border: 1px solid var(--border-gold);
  border-bottom: none;
  border-radius: 8px 8px 0 0;

  background: var(--panel-2);
  color: var(--muted);

  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.workspace-tab:hover {
  color: var(--text);
  border-color: var(--border-gold-strong);
}

.workspace-tab.active {
  background: var(--panel);
  color: var(--text);
  border-color: var(--border-gold-strong);
  box-shadow: inset 0 1px 0 var(--gold-softer);
}

.workspace-tab-title {
  font-size: 13px;
}

.workspace-tab-close {
  border: none;
  background: transparent;
  color: var(--muted);
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  border-radius: 4px;
  box-shadow: none;
}

.workspace-tab-close:hover {
  color: var(--danger);
  background: transparent;
  border: none;
}

.workspace-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: transparent;
}

.workspace-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

/* Map placeholder */

.map-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.map-placeholder-card {
  max-width: 640px;
  padding: 24px;

  border: 1px dashed var(--border-gold-strong);
  border-radius: 12px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 20%),
    var(--panel-overlay);

  box-shadow:
    0 20px 40px var(--shadow),
    0 0 0 1px var(--gold-softer);

  text-align: center;
}

.map-placeholder-card code {
  display: inline-block;
  margin-top: 10px;
  color: var(--muted);
  word-break: break-all;
}

.topbar-campaign {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Map tab */

.map-tab {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.map-tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 8px 10px;

  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);

  color: var(--muted);
  font-size: 12px;
}

.map-canvas-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
}

.map-canvas-container {
  position: absolute;
  inset: 0;

  overflow: hidden;

  cursor: grab;
  user-select: none;
  touch-action: none;

  background:
    radial-gradient(circle at 18% 22%,
      var(--gold-softer),
      transparent 42%),
    var(--bg);
}

.map-canvas-container:active {
  cursor: grabbing;
}

.map-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.map-canvas-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px;

  border: 1px solid var(--border-gold);
  border-radius: 8px;

  background: var(--panel-overlay);
  backdrop-filter: blur(4px);
}

.map-canvas-controls button {
  padding: 4px 8px;
}

.map-canvas-zoom {
  min-width: 48px;
  text-align: center;

  color: var(--muted);
  font-size: 12px;
}

.map-tab-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.navigator-item-static {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 6px 10px;

  border: 1px solid var(--border-gold);
  border-radius: 8px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel-2);
}

.navigator-item-static small {
  color: var(--muted);
}

.map-tab-actions select {
  min-width: 160px;
}

/* Initiative tracker */

.initiative {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.initiative-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  padding: 8px;

  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);
}

.initiative-toolbar select {
  min-width: 160px;
}

.initiative-round {
  color: var(--gold);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.initiative-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.initiative-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
}

.initiative-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.initiative-row {
  display: grid;
  grid-template-columns: 1fr 60px 140px 60px 40px;
  align-items: center;
  gap: 10px;

  padding: 6px 8px;

  border: 1px solid var(--border-gold);
  border-radius: 8px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel-2);
}

.initiative-row-header {
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.initiative-row input {
  width: 100%;
}

.initiative-row-active {
  border-color: var(--border-gold-strong);
  box-shadow:
    0 0 0 1px var(--gold-softer),
    0 0 16px rgba(212, 175, 55, 0.14);
}

.initiative-mod {
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}

.initiative-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.initiative-value input {
  flex: 1;
  min-width: 0;
}

.initiative-roll-btn {
  padding: 4px 8px;
  font-size: 14px;
  line-height: 1;
  border-radius: 6px;
}

.initiative-row-header {
  grid-template-columns: 1fr 60px 140px 60px 40px;
}

/* Chat */

.chat {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;

  padding: 8px;

  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);
}

.chat-quick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-message {
  border: 1px solid var(--border-gold);
  border-radius: 8px;

  padding: 8px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 28%),
    var(--panel-2);
}

.chat-message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  color: var(--muted);
  font-size: 11px;
  margin-bottom: 4px;
}

.chat-message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message-system {
  border-style: dashed;
  color: var(--muted);
}

.chat-message-dice {
  border-color: var(--border-gold-strong);
}

.chat-dice-result {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  font-weight: 600;
}

.chat-dice-total-crit {
  color: var(--gold);
}

.chat-dice-total-fumble {
  color: var(--danger);
}

.chat-dice-badge {
  padding: 2px 6px;

  border: 1px solid var(--border-gold-strong);
  border-radius: 999px;

  color: var(--gold);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.chat-input {
  display: flex;
  gap: 8px;

  padding: 8px;

  border-top: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel);
}

.chat-input input {
  flex: 1;
  min-width: 0;
}

.chat-dice-breakdown {
  color: var(--muted);
  font-size: 12px;
}

/* Journal TOC */

.journal-toc {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.journal-toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.journal-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.journal-toc-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.journal-toc-item small {
  color: var(--muted);
}

/* Journal editor */

.journal-tab {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.journal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  padding: 8px;

  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);
}

.journal-toolbar input[type='text'] {
  min-width: 120px;
}

.journal-toolbar input[type='text']:first-child {
  flex: 2;
}

.journal-toolbar input[type='text']:nth-child(2) {
  flex: 1;
}

.journal-visible-label {
  display: flex;
  align-items: center;
  gap: 6px;

  color: var(--muted);
  font-size: 12px;
  user-select: none;
}

.journal-editor {
  flex: 1;
  min-height: 0;

  display: grid;
  grid-template-columns: 1fr;
}

.journal-editor-with-preview {
  grid-template-columns: 1fr 1fr;
}

.journal-textarea {
  width: 100%;
  height: 100%;
  min-height: 0;

  resize: none;

  border: none;
  outline: none;

  padding: 10px;

  background: var(--panel);
  color: var(--text);

  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;

  font-size: 13px;
  line-height: 1.5;
}

.journal-preview {
  height: 100%;
  min-height: 0;
  overflow: auto;

  padding: 10px 14px;

  border-left: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 25%),
    var(--panel);
}

.journal-preview h1,
.journal-preview h2,
.journal-preview h3,
.journal-preview h4 {
  color: var(--text);
  margin: 14px 0 8px;
}

.journal-preview h1 {
  border-bottom: 1px solid var(--border-gold);
  padding-bottom: 6px;
}

.journal-preview h2 {
  border-bottom: 1px solid var(--border-gold);
  padding-bottom: 4px;
}

.journal-preview p {
  margin: 8px 0;
  line-height: 1.6;
}

.journal-preview ul,
.journal-preview ol {
  margin: 8px 0;
  padding-left: 22px;
}

.journal-preview code {
  padding: 2px 4px;
  border-radius: 4px;

  background: var(--panel-2);
  border: 1px solid var(--border-gold);
}

.journal-preview pre {
  padding: 10px;
  border-radius: 8px;
  overflow: auto;

  background: var(--panel-2);
  border: 1px solid var(--border-gold);
}

.journal-preview pre code {
  border: none;
  background: transparent;
  padding: 0;
}

.journal-preview blockquote {
  margin: 10px 0;
  padding: 8px 12px;

  border-left: 3px solid var(--border-gold-strong);
  background: var(--gold-softer);
}

/* Character editor */

.character-tab {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.character-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  padding: 8px;

  border-bottom: 1px solid var(--border-gold);

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 35%),
    var(--panel-2);
}

.character-toolbar input[type='text'] {
  flex: 2;
  min-width: 160px;
}

.character-toolbar select {
  min-width: 110px;
}

.character-content {
  flex: 1;
  min-height: 0;
  overflow: auto;

  padding: 12px;

  display: flex;
  flex-direction: column;
  gap: 16px;
}

.character-section {
  border: 1px solid var(--border-gold);
  border-radius: 10px;

  padding: 12px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 28%),
    var(--panel);
}

.character-section h3 {
  margin: 0 0 10px;

  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.character-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;

  color: var(--muted);
  font-size: 12px;
}

.character-grid input {
  width: 100%;
}

.character-notes {
  width: 100%;
  min-height: 180px;

  resize: vertical;

  padding: 10px;

  border: 1px solid var(--border-gold);
  border-radius: 8px;

  background: var(--panel-2);
  color: var(--text);

  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
}

.map-grid-toggle {
  display: flex;
  align-items: center;
  gap: 6px;

  color: var(--muted);
  font-size: 12px;
  user-select: none;
  white-space: nowrap;
}

.map-grid-toggle input {
  margin: 0;
}

/* Inspector */

.inspector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inspector-section {
  margin-top: 6px;

  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  border-bottom: 1px solid var(--border-gold);
  padding-bottom: 4px;
}

.inspector-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  font-size: 12px;
}

.inspector-row span:first-child {
  color: var(--muted);
}

.inspector-row code {
  color: var(--muted);
}

.inspector select,
.inspector button {
  width: 100%;
}

.map-fog-controls {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--panel);
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  margin-right: 8px;
}

.map-fog-controls button {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  background: transparent;
  color: var(--muted);
  border-radius: 4px;
}

.map-fog-controls button:hover {
  background: var(--gold-softer);
  color: var(--text);
}

.map-fog-controls button.active {
  background: var(--gold-soft);
  color: var(--gold);
  font-weight: bold;
}

/* Compendium Tab */

.compendium-tab {
  display: flex;
  height: 100%;
  min-height: 0;
}

.compendium-sidebar {
  width: 260px;
  border-right: 1px solid var(--border-gold);
  display: flex;
  flex-direction: column;
  background: var(--panel);
}

.compendium-add {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid var(--border-gold);
}

.compendium-add input {
  flex: 1;
  min-width: 0;
}

.compendium-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compendium-item {
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.compendium-item:hover {
  background: var(--panel-2);
}

.compendium-item.active {
  background: var(--panel-2);
  border-color: var(--border-gold);
  color: var(--gold);
}

.compendium-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.compendium-content-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-gold);
  background: var(--panel);
}

.compendium-content-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.compendium-content-header code {
  color: var(--muted);
  font-size: 12px;
}

.compendium-json {
  flex: 1;
  margin: 0;
  padding: 16px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text);
  background: var(--panel);
}

/* Navigator item delete button */

/* Navigator item actions */

.navigator-item-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navigator-item-grow {
  flex: 1;
  min-width: 0;
}

.navigator-item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.navigator-item-row:hover .navigator-item-actions {
  opacity: 1;
}

.icon-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 4px;
  font-size: 12px;
}

.icon-btn-danger:hover {
  border-color: var(--danger);
}

.navigator-item-edit {
  display: flex;
  gap: 4px;
  align-items: center;
}

.navigator-item-edit input {
  flex: 1;
  min-width: 0;
}

.navigator-item-edit button {
  padding: 4px 8px;
}

/* Compendium search */

.compendium-search {
  padding: 8px 10px 0;
}

.compendium-search input {
  width: 100%;
}

/* Compendium editor */

.compendium-editor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-gold);
  background: var(--panel);
}

.compendium-name-input {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
}

.compendium-editor-actions {
  display: flex;
  gap: 6px;
}

.btn-danger {
  border-color: var(--danger);
  color: var(--danger);
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}

.compendium-editor-meta {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-gold);
  background: var(--panel-2);
}

.compendium-editor-meta code {
  color: var(--muted);
  font-size: 12px;
}

.compendium-json-error {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border-bottom: 1px solid var(--danger);
  color: var(--danger);
  font-size: 12px;
}

.compendium-json-editor {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 16px;
  resize: none;
  border: none;
  outline: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text);
  background: var(--panel);
}

.start-import {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-gold);
}

/* Plugins panel */

.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plugin-item {
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 8px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel-2);
}

.plugin-active-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.plugin-active-label input {
  margin-top: 3px;
}

.plugin-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plugin-name {
  font-weight: 600;
}

.plugin-meta {
  color: var(--muted);
  font-size: 11px;
}

.plugin-description {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}

.plugin-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  justify-content: flex-end;
}

/* Sheet Renderer */

.sheet-renderer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.sheet-section {
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  padding: 12px;
  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 28%),
    var(--panel);
}

.sheet-section-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--border-gold);
  padding-bottom: 6px;
}

.sheet-section-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.sheet-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sheet-field-full {
  grid-column: 1 / -1;
}

.sheet-field-label {
  font-size: 11px;
  color: var(--muted);
}

.sheet-field-input {
  width: 100%;
}

.sheet-field-textarea {
  width: 100%;
  resize: vertical;
  font-family: inherit;
  font-size: 13px;
}

.sheet-field-unknown {
  color: var(--danger);
  font-size: 12px;
  grid-column: 1 / -1;
}

/* Plugin drag-and-drop */

.plugin-drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(8, 10, 16, 0.6);
  backdrop-filter: blur(3px);
}

.plugin-drop-card {
  padding: 20px 28px;

  border: 2px dashed var(--border-gold-strong);
  border-radius: 12px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel-overlay);

  color: var(--text);
  font-size: 14px;
  font-weight: 600;

  box-shadow:
    0 24px 60px var(--shadow),
    0 0 0 1px var(--gold-softer);
}

.plugin-drop-toast {
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 1001;

  padding: 10px 14px;

  border: 1px solid var(--border-gold-strong);
  border-radius: 8px;

  background: var(--panel-overlay);
  color: var(--text);
  font-size: 13px;

  box-shadow: 0 12px 30px var(--shadow);
}

/* Journal Links */

.journal-links-section {
  border-top: 1px solid var(--border-gold);
  padding: 12px 16px;
  background: var(--panel-2);
}

.journal-links-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.journal-links-header h4 {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.journal-link-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  background: var(--panel);
  margin-bottom: 10px;
}

.journal-link-form select,
.journal-link-form input {
  min-width: 120px;
}

.journal-link-directed {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--muted);
}

.journal-links-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.journal-link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel);
  font-size: 13px;
}

.journal-link-direction {
  font-weight: bold;
  color: var(--accent);
}

.journal-link-type {
  color: var(--muted);
  font-size: 12px;
}

.journal-link-target {
  font-weight: 500;
}

.journal-link-label {
  color: var(--muted);
  font-size: 12px;
}

.journal-link-undirected {
  color: var(--muted);
}

.journal-link-item .icon-btn {
  margin-left: auto;
}

/* Built-in plugins */

.builtin-plugin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 12px;

  border: 1px solid var(--border-gold);
  border-radius: 8px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel-2);
}

.builtin-plugin-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.builtin-plugin-name {
  font-weight: 600;
  font-size: 13px;
}

.builtin-plugin-description {
  color: var(--muted);
  font-size: 11px;
}

.builtin-plugin-installed {
  color: var(--gold);
  font-size: 12px;
  font-weight: 600;
}

/* Dialog overlay */

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.dialog-content {
  min-width: 480px;
  max-width: 90vw;
  max-height: 90vh;

  display: flex;
  flex-direction: column;

  border: 1px solid var(--border-gold-strong);
  border-radius: 12px;

  background:
    linear-gradient(180deg,
      var(--surface-sheen),
      transparent 30%),
    var(--panel);

  box-shadow: 0 24px 60px var(--shadow);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 16px;

  border-bottom: 1px solid var(--border-gold);
}

.dialog-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  padding: 12px 16px;

  border-top: 1px solid var(--border-gold);
}

/* Map import dialog */

.dialog-map-import {
  width: 680px;
}

.map-import-preview {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 200px;
  max-height: 420px;

  margin-bottom: 12px;

  border: 1px solid var(--border-gold);
  border-radius: 8px;

  background: var(--panel-2);
  overflow: hidden;
}

.map-import-canvas {
  max-width: 100%;
  max-height: 400px;
  display: block;
}

.map-import-info {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 12px;
}

.map-import-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-import-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map-import-row label {
  display: flex;
  flex-direction: column;
  gap: 4px;

  color: var(--muted);
  font-size: 12px;
}

.map-import-row input[type='number'] {
  width: 100px;
}

.map-import-checkbox {
  flex-direction: row !important;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.map-import-crop-fields {
  padding-left: 24px;
}

.map-import-hint {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;

  padding: 8px;

  border: 1px dashed var(--border-gold);
  border-radius: 6px;

  background: var(--gold-softer);
}

.map-import-canvas {
  max-width: 100%;
  max-height: 440px;
  display: block;
  border-radius: 4px;
}

.map-import-info {
  display: flex;
  gap: 16px;
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 12px;
}

.map-import-checkbox {
  flex-direction: row !important;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.map-import-hint-inline {
  color: var(--muted);
  font-size: 11px;
  font-style: italic;
}

/* Plugin dependencies */

.plugin-deps {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.plugin-deps-label {
  color: var(--muted);
  font-size: 10px;
  text-transform: uppercase;
}

.plugin-dep-ok {
  color: #66bb6a;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(102, 187, 106, 0.1);
}

.plugin-dep-inactive {
  color: #ffa726;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(255, 167, 38, 0.1);
}

.plugin-dep-missing {
  color: #ef5350;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(239, 83, 80, 0.1);
}

.plugin-warning {
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 170, 0, 0.4);
  border-radius: 6px;
  background: rgba(255, 170, 0, 0.08);
  color: #ffaa00;
  font-size: 11px;
  line-height: 1.4;
}

.plugin-dep-check {
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel-2);
  font-size: 11px;
}

/* Connection Panel */

.connection-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
}

.connection-status {
  font-weight: 600;
  font-size: 14px;
}

.connection-status.connected {
  color: #66bb6a;
}

.connection-status.connecting {
  color: #ffa726;
}

.connection-status.disconnected {
  color: var(--muted);
}

.connection-status.error {
  color: #ef5350;
}

.connection-error {
  padding: 8px 12px;
  border: 1px solid rgba(239, 83, 80, 0.4);
  border-radius: 6px;
  background: rgba(239, 83, 80, 0.08);
  color: #ef5350;
  font-size: 12px;
}

.connection-mode-tabs {
  display: flex;
  gap: 4px;
}

.connection-mode-tabs button {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel-2);
  color: var(--muted);
  cursor: pointer;
}

.connection-mode-tabs button.active {
  background: var(--gold-soft);
  color: var(--gold);
  border-color: var(--border-gold-strong);
}

.connection-panel label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--muted);
}

.connection-panel input {
  width: 100%;
}

.connection-info,
.connection-room-info {
  font-size: 12px;
  color: var(--muted);
}

.connection-room-info code {
  color: var(--text);
  word-break: break-all;
}

/* Status Bar connection indicator */

.status-connection {
  font-size: 12px;
}

.status-connected {
  color: #66bb6a;
}

.status-connecting {
  color: #ffa726;
}

.status-disconnected {
  color: var(--muted);
}

.status-error {
  color: #ef5350;
}

.connection-room-info {
  margin-top: 16px;
  padding: 16px;
  background: var(--surface-2, #2a2a2a);
  border-radius: 8px;
  border: 1px solid var(--border, #3a3a3a);
}

.connection-room-info h4 {
  margin: 0 0 12px 0;
  color: var(--success, #4caf50);
  font-size: 14px;
}

.connection-info-row {
  margin-bottom: 12px;
}

.connection-info-row label {
  display: block;
  font-size: 12px;
  color: var(--text-muted, #888);
  margin-bottom: 4px;
}

.connection-info-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.connection-info-value code {
  flex: 1;
  padding: 8px 12px;
  background: var(--surface-1, #1a1a1a);
  border: 1px solid var(--border, #3a3a3a);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  word-break: break-all;
}

.copy-button {
  padding: 8px 12px;
  background: var(--primary, #2196f3);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.copy-button:hover {
  background: var(--primary-dark, #1976d2);
}

.copy-button:active {
  transform: scale(0.95);
}

.connection-info-hint {
  margin-top: 16px;
  padding: 12px;
  background: var(--info-bg, rgba(33, 150, 243, 0.1));
  border-left: 3px solid var(--info, #2196f3);
  border-radius: 4px;
}

.connection-info-hint p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.5;
}

.connection-info-hint strong {
  color: var(--text, #fff);
}

.connection-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.connection-progress-bar {
  width: 100%;
  height: 6px;
  background: var(--surface-2, #2a2a2a);
  border-radius: 3px;
  overflow: hidden;
}

.connection-progress-fill {
  height: 100%;
  background: var(--primary, #2196f3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.connection-progress span {
  font-size: 12px;
  color: var(--text-muted, #888);
}

/* Chat Panel */

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-empty {
  color: var(--muted);
  font-size: 12px;
  text-align: center;
  padding: 20px;
}

.chat-message {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.4;
}

.chat-message-system {
  justify-content: center;
}

.chat-system-text {
  color: var(--muted);
  font-size: 11px;
  font-style: italic;
}

.chat-message-dice {
  color: var(--gold);
}

.chat-sender {
  font-weight: 600;
  color: var(--accent);
}

.chat-time {
  color: var(--muted);
  font-size: 10px;
}

.chat-text {
  color: var(--text);
  word-break: break-word;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--border-gold);
}

.chat-input input {
  flex: 1;
  min-width: 0;
}

.chat-dice-text {
  color: var(--gold);
}

.chat-dice-text strong {
  color: var(--gold-strong);
  font-weight: 700;
}

.saved-sessions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-gold);
}

.saved-sessions h4 {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
}

.saved-session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  margin-bottom: 4px;
  background: var(--panel-2);
}

.saved-session-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.saved-session-name {
  font-size: 12px;
  font-weight: 500;
}

.saved-session-meta {
  font-size: 10px;
  color: var(--muted);
}

/* Profile Select Screen */

.profile-select-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 20%, var(--bg-glow-1), transparent 50%),
    radial-gradient(ellipse at 80% 80%, var(--bg-glow-2), transparent 50%),
    var(--bg);
}

.profile-select-content {
  max-width: 600px;
  width: 100%;
  padding: 40px;
}

.profile-select-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 8px;
}

.profile-select-subtitle {
  text-align: center;
  color: var(--muted);
  margin-bottom: 32px;
}

.profile-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: nowrap;
  justify-content: center;
}

.profile-card {
  position: relative;
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  background:
    linear-gradient(180deg, var(--surface-sheen), transparent 30%),
    var(--panel);
  transition: border-color 0.2s, transform 0.2s;
}

.profile-card:hover {
  border-color: var(--border-gold-strong);
  transform: translateY(-2px);
}

.profile-card-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
}

.profile-card-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border-style: dashed;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  background: var(--gold-soft);
  color: var(--gold);
}

.profile-avatar-new {
  font-size: 28px;
  background: var(--panel-2);
  color: var(--muted);
}

.profile-name {
  font-weight: 600;
  font-size: 14px;
}

.profile-meta {
  font-size: 11px;
  color: var(--muted);
}

.profile-card-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-card:hover .profile-card-delete {
  opacity: 1;
}

.profile-create-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  background: var(--panel);
}

.profile-create-actions {
  display: flex;
  gap: 8px;
}

/* TopBar profile */

.topbar-profile {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding-right: 12px;
}

.topbar-profile-name {
  font-size: 12px;
  color: var(--muted);
}

.waiting-for-gm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  color: var(--muted);
}

.waiting-for-gm-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.waiting-for-gm h3 {
  margin: 0 0 8px;
  color: var(--text);
}

.waiting-for-gm p {
  font-size: 13px;
  line-height: 1.6;
}

/* Scene management controls */

.map-scene-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border-gold);
}

.map-visibility-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
}

.map-visibility-toggle input {
  cursor: pointer;
}

.scene-active-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel-2);
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.scene-active-btn:hover {
  border-color: var(--border-gold-strong);
  color: var(--text);
}

.scene-active-btn.active {
  background: var(--gold-soft);
  border-color: var(--border-gold-strong);
  color: var(--gold);
  font-weight: 600;
}

.map-player-indicator {
  font-size: 12px;
  color: var(--muted);
  margin-left: 8px;
}

/* Confirm Dialog */

.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.confirm-dialog {
  min-width: 360px;
  max-width: 480px;
  border: 1px solid var(--border-gold-strong);
  border-radius: 12px;
  background:
    linear-gradient(180deg, var(--surface-sheen), transparent 30%),
    var(--panel);
  box-shadow: 0 24px 60px var(--shadow);
  overflow: hidden;
}

.confirm-dialog-header {
  padding: 16px 20px 8px;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.confirm-dialog-body {
  padding: 8px 20px 16px;
}

.confirm-dialog-body p {
  margin: 0;
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-gold);
  background: var(--panel-2);
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--gold);
  color: #1a1a1a;
}

.btn-primary:hover {
  background: var(--gold-strong);
}

.btn-secondary {
  background: var(--panel);
  color: var(--text);
  border-color: var(--border-gold);
}

.btn-secondary:hover {
  background: var(--panel-2);
  border-color: var(--border-gold-strong);
}

.btn-danger {
  background: #ef5350;
  color: white;
}

.btn-danger:hover {
  background: #e53935;
}

/* Map items in navigator */

.map-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.map-item:hover {
  background: var(--surface-hover);
}

.map-item-name {
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px 0;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-item-menu {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.map-item:hover .map-item-menu {
  opacity: 1;
}

/* Icon button */

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: var(--surface-hover);
}

.icon-btn-danger:hover {
  background: rgba(239, 83, 80, 0.15);
  color: #ef5350;
}

/* Campaign card actions */

.campaign-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* Navigator item delete button */

.navigator-item-delete-wrapper {
  display: inline-flex;
  max-width: 0;
  overflow: hidden;
  transition: max-width 0.25s ease;
}

.navigator-item-row:hover .navigator-item-delete-wrapper {
  max-width: 36px;
}

/* Add dialog */

.add-dialog-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel);
  color: var(--text);
  font-size: 13px;
  box-sizing: border-box;
}

.add-dialog-input:focus {
  outline: none;
  border-color: var(--border-gold-strong);
}

.icon-btn-add {
  font-size: 14px;
  font-weight: 600;
  color: var(--gold);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-state .btn-primary,
.empty-state .btn-secondary {
  margin-top: 4px;
}

/* Campaign Tree */

.campaign-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.campaign-tree-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  border-bottom: 1px solid var(--border-gold);
}

.campaign-tree-tabs button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.campaign-tree-tabs button:hover {
  color: var(--text);
}

.campaign-tree-tabs button.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.campaign-tree-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
}

/* Tree nodes */

.tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tree-node {
  display: flex;
  flex-direction: column;
}

.tree-node-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  border-radius: 6px;
  transition: background 0.15s;
}

.tree-node-header:hover {
  background: var(--surface-hover);
}

.tree-node-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  padding: 3px 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.tree-node-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.tree-node-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-badge {
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--panel-2);
  border: 1px solid var(--border-gold);
  color: var(--muted);
  font-size: 10px;
  flex-shrink: 0;
}

.tree-node-status {
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--panel-2);
  color: var(--muted);
  font-size: 9px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.tree-node-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.tree-node-header:hover .tree-node-actions {
  opacity: 1;
}

.tree-children {
  margin-left: 20px;
  padding-left: 8px;
  border-left: 1px solid var(--border-gold);
}

.tree-empty {
  padding: 4px 8px;
  color: var(--muted);
  font-size: 11px;
  font-style: italic;
}

.tree-token.selected {
  background: var(--gold-softer);
  outline: 1px solid var(--border-gold-strong);
}

.tree-token-label {
  font-size: 12px;
}

.tree-token-hidden {
  font-size: 10px;
  opacity: 0.7;
}

.tree-section {
  margin-bottom: 12px;
}

.tree-section-title {
  padding: 4px 8px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Drag overlay */

.drag-overlay {
  position: fixed;
  z-index: 10000;
  pointer-events: none;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;
  border: 1px solid var(--border-gold-strong);
  border-radius: 8px;

  background: var(--panel);
  box-shadow: 0 8px 24px var(--shadow);

  font-size: 13px;
  font-weight: 500;
  color: var(--text);

  transform: translate(-50%, -50%);
}

.drag-overlay-icon {
  font-size: 16px;
}

.drag-overlay-name {
  white-space: nowrap;
}

.drag-overlay-badge {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--gold-soft);
  color: var(--gold);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

/* Draggable source states */

.tree-character-draggable {
  cursor: grab;
  user-select: none;
}

.tree-node.is-dragging {
  opacity: 0.4;
}

/* Drop target highlight */

.tree-node-header.drop-target {
  background: var(--gold-softer);
  outline: 2px dashed var(--border-gold-strong);
  outline-offset: -2px;
}

.map-canvas-container.drop-target {
  outline: 3px dashed var(--border-gold-strong);
  outline-offset: -3px;
}

/* ============================================
   Modal
   ============================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  animation: modal-overlay-in 0.15s ease-out;
}

@keyframes modal-overlay-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-dialog {
  border: 1px solid var(--border-gold-strong);
  border-radius: 12px;
  background:
    linear-gradient(180deg, var(--surface-sheen), transparent 30%),
    var(--panel);
  box-shadow: 0 24px 60px var(--shadow);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: modal-dialog-in 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes modal-dialog-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-gold);
}

.modal-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.modal-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-gold);
  background: var(--panel-2);
}

/* ============================================
   Form Fields
   ============================================ */

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-field label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-field input[type='text'],
.form-field input[type='number'],
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel-2);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: var(--border-gold-strong);
  background: var(--panel);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-hint {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
}

.form-error {
  font-size: 11px;
  color: #ef5350;
}

.form-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px dashed var(--border-gold);
  border-radius: 6px;
  background: var(--panel-2);
  margin-top: 4px;
}

.form-preview-ratio {
  width: 60px;
  max-height: 60px;
  border: 1px solid var(--border-gold-strong);
  border-radius: 4px;
  background: var(--gold-softer);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--muted);
  flex-shrink: 0;
}

/* ============================================
   Character Type Selector
   ============================================ */

.character-type-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.character-type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  background: var(--panel-2);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.character-type-option:hover {
  border-color: var(--border-gold-strong);
}

.character-type-option.selected {
  border-color: var(--gold);
  background: var(--gold-softer);
}

.character-type-option input[type='radio'] {
  display: none;
}

.character-type-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.character-type-label {
  font-size: 13px;
  font-weight: 500;
}

.character-type-description {
  margin-left: auto;
  font-size: 11px;
  color: var(--muted);
}

/* ============================================
   Compendium Type Selector
   ============================================ */

.compendium-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.compendium-type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  background: var(--panel-2);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.compendium-type-option:hover {
  border-color: var(--border-gold-strong);
}

.compendium-type-option.selected {
  border-color: var(--gold);
  background: var(--gold-softer);
}

.compendium-type-option input[type='radio'] {
  display: none;
}

.compendium-type-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.compendium-type-label {
  font-size: 12px;
  font-weight: 500;
}

/* ============================================
   Campaign Tree Tab Add Button
   ============================================ */

.campaign-tree-tab-add {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 2px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.campaign-tree-tab-add:hover {
  background: var(--surface-hover);
  color: var(--gold);
}

.navigator-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 4px;
}

.navigator-section-header .navigator-section-title {
  margin: 0;
}

/* ============================================
   TopBar
   ============================================ */

.topbar {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--border-gold);
  user-select: none;
  -webkit-app-region: drag;
  /* Tauri: drag для перемещения окна */
}

/* ============================================
   MenuBar
   ============================================ */

.menu-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
}

.menu-trigger-wrapper {
  position: relative;
}

.menu-trigger {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.1s;
}

.menu-trigger:hover,
.menu-trigger.open {
  background: var(--surface-hover);
}

.menu-trigger.open {
  background: var(--gold-softer);
  color: var(--gold);
}

/* ============================================
   Menu Dropdown
   ============================================ */

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 2000;
  min-width: 220px;
  padding: 4px 0;
  margin-top: 2px;
  border: 1px solid var(--border-gold-strong);
  border-radius: 8px;
  background: var(--panel);
  box-shadow: 0 8px 24px var(--shadow);
  animation: menu-dropdown-in 0.1s ease-out;
}

@keyframes menu-dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  width: 100%;
}

.menu-item:hover:not(.disabled) {
  background: var(--gold-softer);
}

.menu-item.disabled {
  color: var(--muted);
  cursor: default;
  opacity: 0.5;
}

.menu-item.destructive {
  color: #ef5350;
}

.menu-item.destructive:hover {
  background: rgba(239, 83, 80, 0.1);
}

.menu-item-icon {
  width: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-item-label {
  flex: 1;
  white-space: nowrap;
}

.menu-item-shortcut {
  margin-left: auto;
  padding-left: 16px;
  color: var(--muted);
  font-size: 11px;
  font-family: ui-monospace, monospace;
}

.menu-divider {
  height: 1px;
  margin: 4px 8px;
  background: var(--border-gold);
}

.menu-group {
  padding: 4px 0;
}

.menu-group-label {
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ============================================
   Breadcrumbs
   ============================================ */

.topbar-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border-gold);
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.topbar-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.topbar-breadcrumb-sep {
  color: var(--muted);
  opacity: 0.5;
}

.topbar-breadcrumb-text {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* ============================================
   Menu Submenu
   ============================================ */

.menu-item-wrapper {
  position: relative;
}

.menu-item-wrapper.open .menu-submenu {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.menu-submenu {
  position: absolute;
  left: 100%;
  top: -4px;
  z-index: 2001;
  min-width: 180px;
  padding: 4px 0;
  border: 1px solid var(--border-gold-strong);
  border-radius: 8px;
  background: var(--panel);
  box-shadow: 0 8px 24px var(--shadow);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-4px);
  transition: opacity 0.1s, transform 0.1s;
}

.menu-item.selected {
  background: var(--gold-softer);
}

.menu-item-check {
  margin-left: auto;
  color: var(--gold);
  font-size: 11px;
}

.menu-item-arrow {
  margin-left: 8px;
  color: var(--muted);
  font-size: 10px;
}

.menu-item-shortcut {
  margin-left: auto;
  color: var(--muted);
  font-size: 11px;
}

/* ============================================
   Nested Menu Groups (plugin themes)
   ============================================ */

.menu-submenu .menu-group {
  border: none;
  margin: 0;
  padding: 0;
}

.menu-submenu .menu-group .menu-group-label {
  font-size: 11px;
  padding: 4px 12px;
  opacity: 0.7;
}

/* ============================================
   Compendium Card (Monster)
   ============================================ */
.monster-card {
  padding: 16px;
  background: var(--panel);
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  color: var(--text);
}

.monster-header {
  border-bottom: 2px solid var(--border-gold);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.monster-name {
  margin: 0;
  font-size: 20px;
  color: var(--gold);
}

.monster-meta {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
  font-style: italic;
}

.monster-stats-block {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 13px;
}

.stat-label {
  color: var(--muted);
}

.stat-value {
  font-weight: 600;
  color: var(--text);
}

.monster-abilities {
  display: flex;
  justify-content: space-between;
  background: var(--panel-2);
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.ability-box {
  text-align: center;
  flex: 1;
}

.ability-abbr {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

.ability-val {
  font-size: 16px;
  font-weight: 600;
}

.ability-mod {
  font-size: 12px;
  color: var(--gold);
}

.monster-section {
  margin-bottom: 16px;
}

.monster-section h3 {
  font-size: 14px;
  text-transform: uppercase;
  color: var(--gold);
  border-bottom: 1px solid var(--border-gold);
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.monster-text {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.monster-action {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.monster-action strong {
  color: var(--text);
}

/* ============================================
   Compendium Editor & JSON Mode
   ============================================ */
.compendium-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.compendium-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-gold);
  background: var(--panel-2);
}

.compendium-editor-header h3 {
  margin: 0;
  font-size: 15px;
}

.compendium-editor-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-toggle {
  display: flex;
  background: var(--panel);
  border-radius: 6px;
  padding: 2px;
  border: 1px solid var(--border-gold);
}

.view-toggle button {
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.view-toggle button.active {
  background: var(--gold-softer);
  color: var(--gold);
  font-weight: 600;
}

.readonly-badge {
  font-size: 11px;
  color: #ef5350;
  background: rgba(239, 83, 80, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(239, 83, 80, 0.3);
}

.compendium-editor-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.json-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.json-textarea {
  flex: 1;
  width: 100%;
  padding: 12px;
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.json-textarea:focus {
  border-color: var(--border-gold-strong);
}

.json-error {
  margin-top: 8px;
  padding: 8px;
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  border: 1px solid rgba(239, 83, 80, 0.3);
  border-radius: 6px;
  font-size: 12px;
}

.compendium-editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-gold);
  background: var(--panel-2);
}

.compendium-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.compendium-list-item:hover {
  background: var(--surface-hover);
}

.plugin-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--gold-softer);
  color: var(--gold);
  border-radius: 4px;
  text-transform: uppercase;
}

.topbar-logout-btn {
  margin-left: auto;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.topbar-logout-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.connection-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.connection-status-text {
  color: var(--muted);
  font-size: 12px;
  font-style: italic;
}

/* ============================================
   Серверная кампания
   ============================================ */

.start-join-server {
  margin-top: 16px;
  text-align: center;
}

.link-button {
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.15s;
}

.link-button:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* ============================================
   Диалог создания серверной кампании
   ============================================ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface);
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}```

---
## Файл: ./src/vite-env.d.ts
```
/// <reference types="vite/client" />
```

---
## Файл: ./tsconfig.json
```
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}```

---
## Файл: ./tsconfig.node.json
```
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---
## Файл: ./vite.config.ts
```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1",
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**", '**/target/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
}));```

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

    pub async fn move_token(
        &self,
        token_id: &str,
        x: f64,
        y: f64,
    ) -> Result<TokenSummary, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE tokens
            SET x = ?, y = ?, version = version + 1
            WHERE id = ?
            "#,
        )
        .bind(x)
        .bind(y)
        .bind(token_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.fetch_token(token_id).await
    }

    pub async fn delete_token(&self, token_id: &str) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM tokens WHERE id = ?")
            .bind(token_id)
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
            WHERE id = ?
            "#,
        )
        .bind(&character_id)
        .bind(token_id)
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

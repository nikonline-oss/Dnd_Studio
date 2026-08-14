use dnd_core::{
    AppError, CampaignSummary, CharacterDetail, CharacterSummary, JournalEntryDetail,
    JournalEntrySummary, MapSummary, TokenSummary,
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

        sqlx::query("INSERT INTO worlds (id, name, sort_order) VALUES (?, ?, 0)")
            .bind(&id)
            .bind("Default")
            .execute(&self.pool)
            .await
            .map_err(AppError::db)?;

        Ok(id)
    }

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
        let image_path = format!("assets/maps/{id}.png");

        sqlx::query(
            r#"
        INSERT INTO maps (
            id,
            world_id,
            name,
            image_path,
            grid_size,
            width,
            height
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
        )
        .bind(&id)
        .bind(world_id)
        .bind(&name)
        .bind(&image_path)
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
            image_path,
            grid_size,
            width,
            height,
            fog_data: None,
        })
    }

    pub async fn list_maps(&self) -> Result<Vec<MapSummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String, String, i32, i32, i32)>(
            r#"
        SELECT
            id, world_id, name, image_path, grid_size, width, height
        FROM maps
        ORDER BY name
        "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(id, world_id, name, image_path, grid_size, width, height)| MapSummary {
                    id,
                    world_id,
                    name,
                    image_path,
                    grid_size,
                    width,
                    height,
                    fog_data: None,
                },
            )
            .collect())
    }

    pub async fn get_map(&self, id: &str) -> Result<Option<MapSummary>, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                String,
                String,
                i32,
                i32,
                i32,
                Option<String>,
            ),
        >(
            r#"
        SELECT
            id, world_id, name, image_path, grid_size, width, height, fog_data
        FROM maps
        WHERE id = ?
        "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(
            |(id, world_id, name, image_path, grid_size, width, height, fog_data)| MapSummary {
                id,
                world_id,
                name,
                image_path,
                grid_size,
                width,
                height,
                fog_data,
            },
        ))
    }

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
            id,
            map_id,
            character_id,
            x,
            y,
            rotation,
            is_visible
        )
        VALUES (?, ?, ?, ?, ?, 0, 1)
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
            x,
            y,
            rotation: 0.0,
            is_visible: true,
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
                f64,
                f64,
                f64,
                i32,
                Option<String>,
            ),
        >(
            r#"
        SELECT
            t.id,
            t.map_id,
            t.character_id,
            t.x,
            t.y,
            t.rotation,
            t.is_visible,
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
        SET x = ?, y = ?
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

    async fn fetch_token(&self, token_id: &str) -> Result<TokenSummary, AppError> {
        let row = sqlx::query_as::<
            _,
            (
                String,
                String,
                Option<String>,
                f64,
                f64,
                f64,
                i32,
                Option<String>,
            ),
        >(
            r#"
        SELECT
            t.id,
            t.map_id,
            t.character_id,
            t.x,
            t.y,
            t.rotation,
            t.is_visible,
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

        sqlx::query(
            r#"
        INSERT INTO characters (
            id,
            name,
            type,
            data_json
        )
        VALUES (?, ?, ?, ?)
        "#,
        )
        .bind(&id)
        .bind(&name)
        .bind(character_type)
        .bind("{}")
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(CharacterSummary {
            id,
            name,
            character_type: character_type.to_string(),
        })
    }

    pub async fn list_characters(&self) -> Result<Vec<CharacterSummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String)>(
            r#"
        SELECT
            id,
            name,
            type
        FROM characters
        ORDER BY name
        "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(|(id, name, character_type)| CharacterSummary {
                id,
                name,
                character_type,
            })
            .collect())
    }

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

        sqlx::query(
            r#"
        INSERT INTO journal_entries (
            id,
            title,
            content_markdown,
            folder_path,
            is_visible_to_players
        )
        VALUES (?, ?, ?, ?, ?)
        "#,
        )
        .bind(&id)
        .bind(&title)
        .bind("")
        .bind(&folder_path)
        .bind(0)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(JournalEntrySummary {
            id,
            title,
            folder_path,
            is_visible_to_players: false,
        })
    }

    pub async fn list_journal_entries(&self) -> Result<Vec<JournalEntrySummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String, i32)>(
            r#"
        SELECT
            id,
            title,
            folder_path,
            is_visible_to_players
        FROM journal_entries
        ORDER BY folder_path, title
        "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(rows
            .into_iter()
            .map(
                |(id, title, folder_path, is_visible_to_players)| JournalEntrySummary {
                    id,
                    title,
                    folder_path,
                    is_visible_to_players: is_visible_to_players != 0,
                },
            )
            .collect())
    }

    pub async fn get_journal_entry(
        &self,
        id: &str,
    ) -> Result<Option<JournalEntryDetail>, AppError> {
        let row = sqlx::query_as::<_, (String, String, String, String, i32)>(
            r#"
        SELECT
            id,
            title,
            content_markdown,
            folder_path,
            is_visible_to_players
        FROM journal_entries
        WHERE id = ?
        "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(row.map(
            |(id, title, content_markdown, folder_path, is_visible_to_players)| {
                JournalEntryDetail {
                    id,
                    title,
                    content_markdown,
                    folder_path,
                    is_visible_to_players: is_visible_to_players != 0,
                }
            },
        ))
    }

    pub async fn update_journal_entry(
        &self,
        id: &str,
        title: &str,
        content_markdown: &str,
        folder_path: &str,
        is_visible_to_players: bool,
    ) -> Result<JournalEntryDetail, AppError> {
        let title = title.trim().to_string();

        if title.is_empty() {
            return Err(AppError::Validation(
                "Journal entry title is required".to_string(),
            ));
        }

        let folder_path = normalize_folder_path(folder_path);
        let visible = if is_visible_to_players { 1 } else { 0 };

        let result = sqlx::query(
            r#"
        UPDATE journal_entries
        SET
            title = ?,
            content_markdown = ?,
            folder_path = ?,
            is_visible_to_players = ?
        WHERE id = ?
        "#,
        )
        .bind(&title)
        .bind(content_markdown)
        .bind(&folder_path)
        .bind(visible)
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

    pub async fn get_character(&self, id: &str) -> Result<Option<CharacterDetail>, AppError> {
        let row = sqlx::query_as::<_, (String, String, String, String)>(
            r#"
        SELECT
            id,
            name,
            type,
            data_json
        FROM characters
        WHERE id = ?
        "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::db)?;

        Ok(
            row.map(|(id, name, character_type, data_json)| CharacterDetail {
                id,
                name,
                character_type,
                data_json,
            }),
        )
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

        if character_type != "pc" && character_type != "npc" && character_type != "monster" {
            return Err(AppError::Validation(
                "Character type must be pc, npc or monster".to_string(),
            ));
        }

        let data_json = if data_json.trim().is_empty() {
            "{}".to_string()
        } else {
            data_json.to_string()
        };

        serde_json::from_str::<serde_json::Value>(&data_json)
            .map_err(|_| AppError::Validation("data_json must be valid JSON".to_string()))?;

        let result = sqlx::query(
            r#"
        UPDATE characters
        SET
            name = ?,
            type = ?,
            data_json = ?
        WHERE id = ?
        "#,
        )
        .bind(&name)
        .bind(character_type)
        .bind(&data_json)
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::db)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }

        self.get_character(id).await?.ok_or(AppError::NotFound)
    }

    pub fn assets_dir(&self) -> std::path::PathBuf {
        let parent = self
            .path
            .parent()
            .unwrap_or_else(|| std::path::Path::new(""));

        let stem = self
            .path
            .file_stem()
            .and_then(|value| value.to_str())
            .unwrap_or("campaign");

        parent.join(format!("{stem}.assets"))
    }

    pub fn resolve_asset_path(&self, relative_path: &str) -> Result<std::path::PathBuf, AppError> {
        let mut rel = relative_path.trim().trim_start_matches('/');

        if let Some(stripped) = rel.strip_prefix("assets/") {
            rel = stripped;
        }

        if rel.is_empty() || rel.contains("..") {
            return Err(AppError::Validation("Invalid asset path".to_string()));
        }

        Ok(self.assets_dir().join(rel))
    }

    pub async fn update_map_image_path(
        &self,
        map_id: &str,
        image_path: &str,
    ) -> Result<MapSummary, AppError> {
        let result = sqlx::query(
            r#"
        UPDATE maps
        SET image_path = ?
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
}

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

fn row_to_token(
    row: (
        String,
        String,
        Option<String>,
        f64,
        f64,
        f64,
        i32,
        Option<String>,
    ),
) -> TokenSummary {
    let (id, map_id, character_id, x, y, rotation, is_visible, character_name) = row;

    TokenSummary {
        id,
        map_id,
        character_id,
        x,
        y,
        rotation,
        is_visible: is_visible != 0,
        character_name,
    }
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

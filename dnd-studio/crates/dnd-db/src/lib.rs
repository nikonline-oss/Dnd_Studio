use dnd_core::{AppError, CampaignSummary, MapSummary};
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
        })
    }

    pub async fn list_maps(&self) -> Result<Vec<MapSummary>, AppError> {
        let rows = sqlx::query_as::<_, (String, String, String, String, i32, i32, i32)>(
            r#"
            SELECT
                id,
                world_id,
                name,
                image_path,
                grid_size,
                width,
                height
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
                },
            )
            .collect())
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
    }
}

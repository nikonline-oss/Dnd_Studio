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

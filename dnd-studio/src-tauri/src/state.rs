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
}
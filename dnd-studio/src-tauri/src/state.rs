use dnd_db::CampaignDb;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub campaign: Arc<Mutex<Option<CampaignDb>>>,
}

pub struct AppPaths {
    #[allow(dead_code)]
    pub data_dir: PathBuf,
    pub campaigns_dir: PathBuf,
    pub index_file: PathBuf,
}
pub mod campaign;
pub mod tokens;
pub mod maps;
pub mod characters;
pub mod journal;
pub mod compendiums;
pub mod campaign_io;

use dnd_core::AppError;
use dnd_db::CampaignDb;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn require_db(
    campaign: &Arc<Mutex<Option<CampaignDb>>>,
) -> Result<CampaignDb, AppError> {
    let current = campaign.lock().await;

    current.clone().ok_or(AppError::NoCampaign)
}
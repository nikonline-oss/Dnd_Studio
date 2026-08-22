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

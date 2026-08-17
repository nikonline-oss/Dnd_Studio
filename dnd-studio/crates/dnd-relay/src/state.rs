use crate::protocol::{Envelope, RoomInfo};
use crate::room::Room;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};

/// Лимиты
pub const MAX_ROOMS: usize = 100;
pub const MAX_PARTICIPANTS_PER_ROOM: i32 = 20;
pub const MAX_MESSAGE_SIZE_BYTES: usize = 64 * 1024;
pub const MAX_CAMPAIGN_FILE_SIZE_BYTES: usize = 100 * 1024 * 1024; // 100 MB
pub const HEARTBEAT_INTERVAL_SECS: u64 = 15;
pub const CONNECTION_TIMEOUT_SECS: u64 = 45;
pub const INACTIVE_ROOM_TTL_SECS: u64 = 3600;
pub const RATE_LIMIT_CONNECTIONS_PER_MIN: u32 = 10;
pub const RATE_LIMIT_MESSAGES_PER_MIN: u32 = 100;

const BROADCAST_CAPACITY: usize = 256;

/// Состояние комнаты
#[derive(Debug, Clone)]
pub struct RoomState {
    pub room: Room,
    pub tx: broadcast::Sender<Envelope>,
    /// Путь к файлу кампании (если загружен)
    pub campaign_file_path: Option<PathBuf>,
    /// Размер файла кампании в байтах
    pub campaign_file_size: Option<u64>,
}

/// Глобальное состояние сервера
#[derive(Debug, Clone)]
pub struct AppState {
    pub rooms: Arc<RwLock<HashMap<String, RoomState>>>,
    pub started_at: i64,
    /// Директория для хранения файлов кампаний
    pub campaign_storage_dir: PathBuf,
}

impl AppState {
    pub fn new() -> Self {
        // Создаём директорию для хранения кампаний
        let storage_dir = std::env::temp_dir().join("dnd_relay_campaigns");
        std::fs::create_dir_all(&storage_dir).ok();

        Self {
            rooms: Arc::new(RwLock::new(HashMap::new())),
            started_at: chrono::Utc::now().timestamp_millis(),
            campaign_storage_dir: storage_dir,
        }
    }

    pub async fn create_room(&self, room: Room) -> Result<String, String> {
        let mut rooms = self.rooms.write().await;

        if rooms.len() >= MAX_ROOMS {
            return Err("Server is full: maximum number of rooms reached".to_string());
        }

        let room_id = room.room_id.clone();
        let (tx, _rx) = broadcast::channel(BROADCAST_CAPACITY);

        rooms.insert(
            room_id.clone(),
            RoomState {
                room,
                tx,
                campaign_file_path: None,
                campaign_file_size: None,
            },
        );

        Ok(room_id)
    }

    pub async fn get_room(&self, room_id: &str) -> Option<Room> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).map(|rs| rs.room.clone())
    }

    pub async fn subscribe_room(&self, room_id: &str) -> Option<broadcast::Receiver<Envelope>> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).map(|rs| rs.tx.subscribe())
    }

    pub async fn broadcast_to_room(&self, room_id: &str, envelope: Envelope) -> Result<usize, String> {
        let rooms = self.rooms.read().await;
        let room_state = rooms
            .get(room_id)
            .ok_or_else(|| "Room not found".to_string())?;

        room_state
            .tx
            .send(envelope)
            .map_err(|e| format!("Broadcast failed: {}", e))
    }

    pub async fn remove_room(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;

        // Удаляем файл кампании если есть
        if let Some(room_state) = rooms.get(room_id) {
            if let Some(path) = &room_state.campaign_file_path {
                std::fs::remove_file(path).ok();
            }
        }

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

    /// Сохраняет файл кампании для комнаты
    pub async fn store_campaign_file(
        &self,
        room_id: &str,
        data: Vec<u8>,
    ) -> Result<u64, String> {
        if data.len() > MAX_CAMPAIGN_FILE_SIZE_BYTES {
            return Err(format!(
                "Campaign file too large: {} bytes (max {} bytes)",
                data.len(),
                MAX_CAMPAIGN_FILE_SIZE_BYTES
            ));
        }

        let file_path = self.campaign_storage_dir.join(format!("{}.db", room_id));

        std::fs::write(&file_path, &data)
            .map_err(|e| format!("Failed to write campaign file: {}", e))?;

        let file_size = data.len() as u64;

        let mut rooms = self.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            room_state.campaign_file_path = Some(file_path);
            room_state.campaign_file_size = Some(file_size);
        }

        Ok(file_size)
    }

    /// Читает файл кампании для комнаты
    pub async fn read_campaign_file(&self, room_id: &str) -> Result<Vec<u8>, String> {
        let rooms = self.rooms.read().await;
        let room_state = rooms
            .get(room_id)
            .ok_or_else(|| "Room not found".to_string())?;

        let file_path = room_state
            .campaign_file_path
            .as_ref()
            .ok_or_else(|| "Campaign file not uploaded".to_string())?;

        std::fs::read(file_path)
            .map_err(|e| format!("Failed to read campaign file: {}", e))
    }

    /// Проверяет, есть ли файл кампании
    pub async fn has_campaign_file(&self, room_id: &str) -> bool {
        let rooms = self.rooms.read().await;
        rooms
            .get(room_id)
            .map(|rs| rs.campaign_file_path.is_some())
            .unwrap_or(false)
    }

    /// Возвращает размер файла кампании
    pub async fn get_campaign_file_size(&self, room_id: &str) -> Option<u64> {
        let rooms = self.rooms.read().await;
        rooms
            .get(room_id)
            .and_then(|rs| rs.campaign_file_size)
    }
}
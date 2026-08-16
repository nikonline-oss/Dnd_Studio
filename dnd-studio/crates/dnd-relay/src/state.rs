use crate::protocol::{Envelope, RoomInfo};
use crate::room::Room;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};

/// Лимиты по ТЗ v1.0
pub const MAX_ROOMS: usize = 100;
pub const MAX_PARTICIPANTS_PER_ROOM: i32 = 20;
pub const MAX_MESSAGE_SIZE_BYTES: usize = 64 * 1024; // 64 KB
pub const HEARTBEAT_INTERVAL_SECS: u64 = 15;
pub const CONNECTION_TIMEOUT_SECS: u64 = 45;
pub const INACTIVE_ROOM_TTL_SECS: u64 = 3600; // 1 час
pub const RATE_LIMIT_CONNECTIONS_PER_MIN: u32 = 10;
pub const RATE_LIMIT_MESSAGES_PER_MIN: u32 = 100;

/// Размер буфера broadcast канала
const BROADCAST_CAPACITY: usize = 256;

/// Глобальное состояние сервера
#[derive(Debug, Clone)]
pub struct AppState {
    /// Комнаты: room_id -> RoomState
    pub rooms: Arc<RwLock<HashMap<String, RoomState>>>,

    /// Время запуска сервера
    pub started_at: i64,
}

/// Состояние одной комнаты (данные + канал)
#[derive(Debug, Clone)]
pub struct RoomState {
    pub room: Room,
    /// Broadcast канал для рассылки сообщений всем участникам комнаты
    pub tx: broadcast::Sender<Envelope>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            rooms: Arc::new(RwLock::new(HashMap::new())),
            started_at: chrono::Utc::now().timestamp_millis(),
        }
    }

    /// Создаёт новую комнату с broadcast каналом
    pub async fn create_room(&self, room: Room) -> Result<String, String> {
        let mut rooms = self.rooms.write().await;

        if rooms.len() >= MAX_ROOMS {
            return Err("Server is full: maximum number of rooms reached".to_string());
        }

        let room_id = room.room_id.clone();
        let (tx, _rx) = broadcast::channel(BROADCAST_CAPACITY);

        rooms.insert(
            room_id.clone(),
            RoomState { room, tx },
        );

        Ok(room_id)
    }

    /// Получает копию комнаты
    pub async fn get_room(&self, room_id: &str) -> Option<Room> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).map(|rs| rs.room.clone())
    }

    /// Подписывается на broadcast канал комнаты
    pub async fn subscribe_room(&self, room_id: &str) -> Option<broadcast::Receiver<Envelope>> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).map(|rs| rs.tx.subscribe())
    }

    /// Отправляет сообщение в broadcast канал комнаты
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

    /// Удаляет комнату
    pub async fn remove_room(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        rooms.remove(room_id);
    }

    /// Очищает неактивные комнаты
    pub async fn cleanup_inactive_rooms(&self) {
        let now = chrono::Utc::now().timestamp_millis();
        let ttl_ms = (INACTIVE_ROOM_TTL_SECS as i64) * 1000;

        let mut rooms = self.rooms.write().await;

        rooms.retain(|_, room_state| {
            let is_recently_active = room_state.room.participants.values().any(|p| {
                now - p.last_heartbeat < ttl_ms
            });

            room_state.room.is_active && is_recently_active
        });
    }
}
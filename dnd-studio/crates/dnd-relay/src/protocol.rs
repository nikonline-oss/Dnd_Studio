use serde::{Deserialize, Serialize};

/// Версия протокола
pub const PROTOCOL_VERSION: u32 = 1;

/// Envelope — обёртка для всех сообщений между клиентом и сервером
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope {
    /// Версия протокола
    pub v: u32,

    /// Уникальный ID сообщения
    pub id: String,

    /// Тип сообщения
    #[serde(rename = "type")]
    pub msg_type: MessageType,

    /// Timestamp (Unix ms)
    pub ts: i64,

    /// Sequence number (для упорядочивания)
    pub seq: u64,

    /// ID сессии/комнаты
    pub session_id: String,

    /// ID отправителя
    pub sender_id: String,

    /// Полезная нагрузка
    pub payload: serde_json::Value,
}

impl Envelope {
    pub fn new(
        msg_type: MessageType,
        session_id: String,
        sender_id: String,
        payload: serde_json::Value,
    ) -> Self {
        Self {
            v: PROTOCOL_VERSION,
            id: uuid::Uuid::new_v4().to_string(),
            msg_type,
            ts: chrono::Utc::now().timestamp_millis(),
            seq: 0, // Будет установлен при отправке
            session_id,
            sender_id,
            payload,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MessageType {
    // Подключение
    Join,
    Leave,
    Heartbeat,
    Error,

    // Роли и права
    RoleAssigned,
    Kick,
    RequestAction,     // Запрос действия у GM
    ActionApproved,    // GM одобрил действие
    ActionDenied,      // GM отклонил действие

    // Игровое состояние
    StateSync,
    StateUpdate,

    // Токены
    TokenMove,
    TokenCreate,
    TokenDelete,
    TokenOwnership,    // Назначение владельца токена

    // Чат
    ChatMessage,

    // Инициатива
    InitiativeUpdate,

    // Туман войны
    FogUpdate,

    // Броски
    DiceRoll,

    // Активы
    AssetRequest,
    AssetResponse,
}

/// Сообщение ошибки
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorMessage {
    pub code: String,
    pub message: String,
}

/// Сообщение при подключении
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JoinPayload {
    pub room_id: String,
    pub token: String,
    pub display_name: String,
}

/// Ответ на подключение
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JoinResponse {
    pub success: bool,
    pub user_id: String,
    pub role: String,
    pub room_id: String,
    pub error: Option<String>,
}

/// Heartbeat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeartbeatPayload {
    pub client_time: i64,
}

/// Перемещение токена
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenMovePayload {
    pub token_id: String,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
}

/// Сообщение чата
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessagePayload {
    pub channel: String,
    pub text: String,
    pub sender_name: String,
}

/// Обновление инициативы
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiativeUpdatePayload {
    pub entries: Vec<InitiativeEntry>,
    pub active_entry_id: Option<String>,
    pub round: i32,
    pub started: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiativeEntry {
    pub id: String,
    pub token_id: String,
    pub label: String,
    pub initiative: i32,
}

/// Обновление тумана войны
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FogUpdatePayload {
    pub map_id: String,
    pub fog_data: String, // base64 или JSON
}

/// Бросок костей
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiceRollPayload {
    pub notation: String,
    pub result: i32,
    pub rolls: Vec<i32>,
    pub modifier: i32,
    pub roller_name: String,
}

/// Создание комнаты
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRoomRequest {
    pub room_name: String,
    pub gm_name: String,
    pub max_players: Option<i32>,
    pub access_code: Option<String>,
}

/// Ответ на создание комнаты
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRoomResponse {
    pub room_id: String,
    pub gm_token: String,
    pub access_code: Option<String>,
}

/// Информация о комнате
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomInfo {
    pub room_id: String,
    pub room_name: String,
    pub gm_name: String,
    pub player_count: i32,
    pub max_players: i32,
    pub is_active: bool,
    pub created_at: i64,
}

/// Назначение роли пользователю
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleAssignedPayload {
    pub target_user_id: String,
    pub role: String,
    pub assigned_by: String,
}

/// Запрос действия от игрока к GM
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestActionPayload {
    pub action_type: String,
    pub payload: serde_json::Value,
    pub requester_name: String,
}

/// Ответ GM на запрос действия
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResponsePayload {
    pub request_id: String,
    pub approved: bool,
    pub original_action: serde_json::Value,
}

/// Назначение владельца токена
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenOwnershipPayload {
    pub token_id: String,
    pub owner_user_id: String,
    pub map_id: String,
}
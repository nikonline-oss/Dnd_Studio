use crate::protocol::RoomInfo;
use std::collections::HashMap;

/// Участник комнаты
#[derive(Debug, Clone)]
pub struct Participant {
    pub user_id: String,
    pub display_name: String,
    pub role: ParticipantRole,
    pub connected_at: i64,
    pub last_heartbeat: i64,
}

/// Роли участников
#[derive(Debug, Clone, PartialEq)]
pub enum ParticipantRole {
    Gm,
    CoGm,
    Player,
    Spectator,
}

impl ParticipantRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            ParticipantRole::Gm => "gm",
            ParticipantRole::CoGm => "co_gm",
            ParticipantRole::Player => "player",
            ParticipantRole::Spectator => "spectator",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "gm" => ParticipantRole::Gm,
            "co_gm" => ParticipantRole::CoGm,
            "player" => ParticipantRole::Player,
            "spectator" => ParticipantRole::Spectator,
            _ => ParticipantRole::Spectator,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Room {
    pub room_id: String,
    pub room_name: String,
    pub gm_token: String,
    pub access_code: Option<String>,
    pub access_code_hash: Option<String>,
    pub max_players: i32,
    pub is_active: bool,
    pub created_at: i64,
    pub participants: HashMap<String, Participant>,
    /// Владельцы токенов: token_id -> user_id
    pub token_owners: HashMap<String, String>,
}

impl Room {
    pub fn new(
        room_name: String,
        gm_name: String,
        gm_token: String,
        access_code: Option<String>,
        max_players: i32,
    ) -> Self {
        let now = chrono::Utc::now().timestamp_millis();

        let access_code_hash = access_code.as_ref().map(|code| {
            use sha2::{Digest, Sha256};
            let mut hasher = Sha256::new();
            hasher.update(code.as_bytes());
            format!("{:x}", hasher.finalize())
        });

        // НЕ создаём автоматического GM-участника
        // Он будет создан при реальном подключении через WebSocket

        Self {
            room_id: uuid::Uuid::new_v4().to_string(),
            room_name,
            gm_token,
            access_code,
            access_code_hash,
            max_players,
            is_active: true,
            created_at: now,
            participants: HashMap::new(), // Пустой HashMap
            token_owners: HashMap::new(), // Пустой HashMap
        }
    }

    /// Проверяет токен GM
    pub fn validate_gm_token(&self, token: &str) -> bool {
        self.gm_token == token
    }

    /// Проверяет access code
    pub fn validate_access_code(&self, code: &str) -> bool {
        match &self.access_code_hash {
            Some(hash) => {
                use sha2::{Digest, Sha256};
                let mut hasher = Sha256::new();
                hasher.update(code.as_bytes());
                let code_hash = format!("{:x}", hasher.finalize());
                &code_hash == hash
            }
            None => true, // Нет кода — свободный вход
        }
    }

    /// Добавляет участника
    pub fn add_participant(&mut self, display_name: String, role: ParticipantRole) -> String {
        let user_id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp_millis();

        self.participants.insert(
            user_id.clone(),
            Participant {
                user_id: user_id.clone(),
                display_name,
                role,
                connected_at: now,
                last_heartbeat: now,
            },
        );

        user_id
    }

    /// Удаляет участника
    pub fn remove_participant(&mut self, user_id: &str) {
        self.participants.remove(user_id);

        // Если участников нет, деактивируем комнату
        if self.participants.is_empty() {
            self.is_active = false;
        }
    }

    /// Обновляет heartbeat
    pub fn update_heartbeat(&mut self, user_id: &str) {
        if let Some(participant) = self.participants.get_mut(user_id) {
            participant.last_heartbeat = chrono::Utc::now().timestamp_millis();
        }
    }

    /// Количество подключённых участников
    pub fn connected_count(&self) -> i32 {
        self.participants.len() as i32
    }

    /// Может ли участник подключиться
    pub fn can_join(&self) -> bool {
        self.is_active && self.connected_count() < self.max_players
    }

    /// Информация о комнате (публичная)
    pub fn public_info(&self) -> RoomInfo {
        RoomInfo {
            room_id: self.room_id.clone(),
            room_name: self.room_name.clone(),
            gm_name: self
                .participants
                .values()
                .find(|p| p.role == ParticipantRole::Gm)
                .map(|p| p.display_name.clone())
                .unwrap_or_default(),
            player_count: self.connected_count(),
            max_players: self.max_players,
            is_active: self.is_active,
            created_at: self.created_at,
        }
    }

    /// Получить роль участника
    pub fn get_role(&self, user_id: &str) -> Option<ParticipantRole> {
        self.participants.get(user_id).map(|p| p.role.clone())
    }

    /// Является ли пользователь GM или Co-GM
    pub fn is_gm(&self, user_id: &str) -> bool {
        matches!(
            self.get_role(user_id),
            Some(ParticipantRole::Gm) | Some(ParticipantRole::CoGm)
        )
    }

    /// Назначить владельца токена
    pub fn set_token_owner(&mut self, token_id: &str, user_id: &str) {
        self.token_owners
            .insert(token_id.to_string(), user_id.to_string());
    }

    /// Проверить, владеет ли пользователь токеном
    pub fn owns_token(&self, user_id: &str, token_id: &str) -> bool {
        self.token_owners
            .get(token_id)
            .map(|owner| owner == user_id)
            .unwrap_or(false)
    }

    /// Изменить роль участника
    pub fn change_role(&mut self, user_id: &str, new_role: ParticipantRole) -> bool {
        if let Some(participant) = self.participants.get_mut(user_id) {
            participant.role = new_role;
            true
        } else {
            false
        }
    }
}

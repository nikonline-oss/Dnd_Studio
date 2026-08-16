use crate::protocol::{Envelope, JoinPayload, JoinResponse, MessageType};
use crate::room::ParticipantRole;
use crate::state::AppState;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::select;
use tracing::{error, info, warn};

/// WebSocket handler — инициирует upgrade
pub async fn ws_handler(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    info!("WebSocket upgrade request for room: {}", room_id);
    ws.on_upgrade(move |socket| handle_socket(socket, state, room_id))
}

/// Обработка WebSocket соединения после upgrade
async fn handle_socket(
    socket: WebSocket,
    state: Arc<AppState>,
    room_id: String,
) {
    info!("New WebSocket connection for room: {}", room_id);

    let (mut sender, mut receiver) = socket.split();

    // Ждём первое сообщение — Join
    let join_msg = match receiver.next().await {
        Some(Ok(Message::Text(text))) => text.to_string(),
        _ => {
            warn!("Connection closed before join");
            return;
        }
    };

    // Парсим Join
    let envelope: Envelope = match serde_json::from_str(&join_msg) {
        Ok(e) => e,
        Err(e) => {
            warn!("Failed to parse join message: {}", e);
            return;
        }
    };

    if envelope.msg_type != MessageType::Join {
        warn!("First message is not Join");
        return;
    }

    let join_payload: JoinPayload = match serde_json::from_value(envelope.payload) {
        Ok(p) => p,
        Err(e) => {
            warn!("Failed to parse join payload: {}", e);
            return;
        }
    };

    // Проверяем комнату
    let room = match state.get_room(&room_id).await {
        Some(r) => r,
        None => {
            send_error(&mut sender, &room_id, "Room not found").await;
            return;
        }
    };

    // Проверяем токен или access code
    let role = if room.validate_gm_token(&join_payload.token) {
        ParticipantRole::Gm
    } else if room.validate_access_code(&join_payload.token) {
        ParticipantRole::Player
    } else {
        send_error(&mut sender, &room_id, "Invalid token or access code").await;
        return;
    };

    // Добавляем участника
    let user_id = {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(&room_id) {
            if !room_state.room.can_join() {
                send_error(&mut sender, &room_id, "Room is full").await;
                return;
            }

            room_state
                .room
                .add_participant(join_payload.display_name.clone(), role.clone())
        } else {
            send_error(&mut sender, &room_id, "Room disappeared").await;
            return;
        }
    };

    // Подписываемся на broadcast канал комнаты
    let mut broadcast_rx = match state.subscribe_room(&room_id).await {
        Some(rx) => rx,
        None => {
            send_error(&mut sender, &room_id, "Failed to subscribe to room").await;
            return;
        }
    };

    // Отправляем успешный Join ответ
    let join_response = JoinResponse {
        success: true,
        user_id: user_id.clone(),
        role: role.as_str().to_string(),
        room_id: room_id.clone(),
        error: None,
    };

    let response_envelope = Envelope::new(
        MessageType::Join,
        room_id.clone(),
        "server".to_string(),
        serde_json::to_value(&join_response).unwrap(),
    );

    if send_envelope(&mut sender, &response_envelope).await.is_err() {
        return;
    }

    info!(
        "User '{}' joined room '{}' as {}",
        join_payload.display_name, room_id, role.as_str()
    );

    // Уведомляем остальных о новом участнике
    let join_notification = Envelope::new(
        MessageType::Join,
        room_id.clone(),
        user_id.clone(),
        serde_json::json!({
            "user_id": user_id,
            "display_name": join_payload.display_name,
            "role": role.as_str(),
        }),
    );
    let _ = state.broadcast_to_room(&room_id, join_notification).await;

    // Основной цикл: select между входящими сообщениями и broadcast
    loop {
        select! {
            // Входящее сообщение от клиента
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        handle_incoming_message(&state, &room_id, &user_id, &text).await;
                    }
                    Some(Ok(Message::Close(_))) => {
                        info!("User '{}' disconnected from room '{}'", user_id, room_id);
                        break;
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error for user '{}': {}", user_id, e);
                        break;
                    }
                    None => {
                        info!("Stream ended for user '{}'", user_id);
                        break;
                    }
                    _ => {}
                }
            }

            // Broadcast сообщение от других участников
            result = broadcast_rx.recv() => {
                match result {
                    Ok(envelope) => {
                        // Не пересылаем собственные сообщения обратно
                        if envelope.sender_id != user_id {
                            if send_envelope(&mut sender, &envelope).await.is_err() {
                                break;
                            }
                        }
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                        warn!("User '{}' lagged by {} messages", user_id, n);
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                        info!("Broadcast channel closed for room '{}'", room_id);
                        break;
                    }
                }
            }
        }
    }

    // Удаляем участника при отключении
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(&room_id) {
            room_state.room.remove_participant(&user_id);
        }
    }

    // Уведомляем остальных об отключении
    let leave_notification = Envelope::new(
        MessageType::Leave,
        room_id.clone(),
        user_id.clone(),
        serde_json::json!({ "user_id": user_id }),
    );
    let _ = state.broadcast_to_room(&room_id, leave_notification).await;

    info!("User '{}' fully disconnected from room '{}'", user_id, room_id);
}

/// Обработка входящего сообщения от клиента
async fn handle_incoming_message(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    text: &str,
) {
    if text.len() > crate::state::MAX_MESSAGE_SIZE_BYTES {
        warn!("Message too large from user {}", user_id);
        return;
    }

    let mut envelope: Envelope = match serde_json::from_str(text) {
        Ok(e) => e,
        Err(e) => {
            warn!("Failed to parse message from {}: {}", user_id, e);
            return;
        }
    };

    // Перезаписываем sender_id на сервере (не доверяем клиенту)
    envelope.sender_id = user_id.to_string();

    // Обновляем heartbeat
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            room_state.room.update_heartbeat(user_id);
        }
    }

    match envelope.msg_type {
        MessageType::Heartbeat => {
            // Heartbeat обрабатывается локально, не.broadcast-им
        }
        MessageType::ChatMessage
        | MessageType::TokenMove
        | MessageType::TokenCreate
        | MessageType::TokenDelete
        | MessageType::InitiativeUpdate
        | MessageType::FogUpdate
        | MessageType::DiceRoll
        | MessageType::StateSync
        | MessageType::StateUpdate
        | MessageType::RoleAssigned
        | MessageType::Kick => {
            // Broadcast всем участникам комнаты
            if let Err(e) = state.broadcast_to_room(room_id, envelope).await {
                warn!("Broadcast failed for room {}: {}", room_id, e);
            }
        }
        _ => {
            warn!("Unhandled message type: {:?}", envelope.msg_type);
        }
    }
}

/// Отправка Envelope через WebSocket
async fn send_envelope(
    sender: &mut futures_util::stream::SplitSink<WebSocket, Message>,
    envelope: &Envelope,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let json = serde_json::to_string(envelope)?;
    sender.send(Message::Text(json.into())).await?;
    Ok(())
}

/// Отправка ошибки через WebSocket
async fn send_error(
    sender: &mut futures_util::stream::SplitSink<WebSocket, Message>,
    room_id: &str,
    error_msg: &str,
) {
    let error_response = JoinResponse {
        success: false,
        user_id: String::new(),
        role: String::new(),
        room_id: room_id.to_string(),
        error: Some(error_msg.to_string()),
    };

    let envelope = Envelope::new(
        MessageType::Error,
        room_id.to_string(),
        "server".to_string(),
        serde_json::to_value(&error_response).unwrap(),
    );

    let _ = send_envelope(sender, &envelope).await;
}
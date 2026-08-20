use crate::protocol::{Envelope, JoinPayload, JoinResponse, MessageType};
use crate::room::ParticipantRole;
use crate::state::AppState;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::select;
use tokio::sync::broadcast;
use tracing::{debug, error, info, warn};

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
async fn handle_socket(socket: WebSocket, state: Arc<AppState>, room_id: String) {
    info!("New WebSocket connection for room: {}", room_id);

    let (mut sender, mut receiver) = socket.split();

    // Ждём первое сообщение — Join
    let join_msg = match receiver.next().await {
        Some(Ok(Message::Text(text))) => {
            info!("Received join message: {}", &text[..text.len().min(200)]);
            text.to_string()
        }
        Some(Err(e)) => {
            error!("Error receiving join message: {}", e);
            return;
        }
        None => {
            warn!("Connection closed before join");
            return;
        }
        _ => {
            warn!("Received non-text message before join");
            return;
        }
    };

    // Парсим Join
    let envelope: Envelope = match serde_json::from_str(&join_msg) {
        Ok(e) => e,
        Err(e) => {
            error!("Failed to parse join message: {}", e);
            return;
        }
    };

    if envelope.msg_type != MessageType::Join {
        warn!("First message is not Join: {:?}", envelope.msg_type);
        return;
    }

    let join_payload: JoinPayload = match serde_json::from_value(envelope.payload) {
        Ok(p) => p,
        Err(e) => {
            error!("Failed to parse join payload: {}", e);
            return;
        }
    };

    info!(
        "Join request: room={}, display_name={}, token={}...",
        room_id,
        join_payload.display_name,
        &join_payload.token[..join_payload.token.len().min(8)]
    );

    // Проверяем комнату
    let room = match state.get_room(&room_id).await {
        Some(r) => r,
        None => {
            warn!("Room not found: {}", room_id);
            send_error(&mut sender, &room_id, "Room not found").await;
            return;
        }
    };

    // Проверяем токен или access code
    let role = if room.validate_gm_token(&join_payload.token) {
        info!("Token validated as GM");
        ParticipantRole::Gm
    } else if room.validate_access_code(&join_payload.token) {
        info!("Token validated as Player (access code)");
        ParticipantRole::Player
    } else {
        warn!("Invalid token or access code");
        send_error(&mut sender, &room_id, "Invalid token or access code").await;
        return;
    };

    // Добавляем участника
    let user_id = {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(&room_id) {
            if !room_state.room.can_join() {
                warn!("Room is full: {}", room_id);
                send_error(&mut sender, &room_id, "Room is full").await;
                return;
            }

            let uid = room_state
                .room
                .add_participant(join_payload.display_name.clone(), role.clone());

            info!(
                "Participant added: user_id={}, role={}, total_participants={}",
                uid,
                role.as_str(),
                room_state.room.connected_count()
            );

            uid
        } else {
            error!("Room disappeared: {}", room_id);
            send_error(&mut sender, &room_id, "Room disappeared").await;
            return;
        }
    };

    // Подписываемся на broadcast канал комнаты
    let mut broadcast_rx = match state.subscribe_room(&room_id).await {
        Some(rx) => rx,
        None => {
            error!("Failed to subscribe to room: {}", room_id);
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

    if let Err(e) = send_envelope(&mut sender, &response_envelope).await {
        error!("Failed to send join response: {}", e);
        return;
    }

    info!(
        "User '{}' (user_id={}) joined room '{}' as {}",
        join_payload.display_name,
        user_id,
        room_id,
        role.as_str()
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

    if let Err(e) = state.broadcast_to_room(&room_id, join_notification).await {
        warn!("Failed to broadcast join notification: {}", e);
    }

    // Основной цикл: select между входящими сообщениями и broadcast
    loop {
        select! {
            // Входящее сообщение от клиента
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        handle_incoming_message(&state, &room_id, &user_id, &text).await;
                    }
                    Some(Ok(Message::Close(reason))) => {
                        info!("User '{}' sent close frame: {:?}", user_id, reason);
                        break;
                    }
                    Some(Ok(Message::Ping(data))) => {
                        // WebSocket автоматически отвечает на ping
                        debug!("Received ping from user {}", user_id);
                    }
                    Some(Ok(Message::Pong(_))) => {
                        debug!("Received pong from user {}", user_id);
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error for user '{}': {}", user_id, e);
                        break;
                    }
                    None => {
                        info!("Stream ended for user '{}'", user_id);
                        break;
                    }
                    _ => {
                        debug!("Received other message type from user {}", user_id);
                    }
                }
            }

            // Broadcast сообщение от других участников
            result = broadcast_rx.recv() => {
                match result {
                    Ok(envelope) => {
                        // Не пересылаем собственные сообщения обратно
                        if envelope.sender_id != user_id {
                            debug!(
                                "Broadcasting {:?} from {} to user {}",
                                envelope.msg_type, envelope.sender_id, user_id
                            );

                            if let Err(e) = send_envelope(&mut sender, &envelope).await {
                                error!("Failed to send broadcast to user {}: {}", user_id, e);
                                break;
                            }
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(n)) => {
                        warn!("User '{}' lagged by {} messages", user_id, n);
                    }
                    Err(broadcast::error::RecvError::Closed) => {
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
            info!(
                "User '{}' removed from room '{}', remaining participants: {}",
                user_id,
                room_id,
                room_state.room.connected_count()
            );
        }
    }

    // Уведомляем остальных об отключении
    let leave_notification = Envelope::new(
        MessageType::Leave,
        room_id.clone(),
        user_id.clone(),
        serde_json::json!({ "user_id": user_id }),
    );

    if let Err(e) = state.broadcast_to_room(&room_id, leave_notification).await {
        warn!("Failed to broadcast leave notification: {}", e);
    }

    info!(
        "User '{}' fully disconnected from room '{}'",
        user_id, room_id
    );
}
/// Обработка входящего сообщения от клиента
/// Обработка входящего сообщения с проверкой прав
async fn handle_incoming_message(state: &Arc<AppState>, room_id: &str, user_id: &str, text: &str) {
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

    // Проверяем права перед broadcast
    let is_authorized = check_permission(state, room_id, user_id, &envelope).await;

    if !is_authorized {
        warn!(
            "User {} attempted unauthorized action: {:?}",
            user_id, envelope.msg_type
        );

        // Отправляем ошибку обратно пользователю
        // (нужен доступ к sender — здесь просто логируем)
        return;
    }

    match envelope.msg_type {
        MessageType::Heartbeat => {
            // Heartbeat обрабатывается локально
        }

        MessageType::TokenMove => {
            // Проверяем, что пользователь двигает свой токен (или он GM)
            handle_token_move(state, room_id, user_id, &mut envelope).await;
        }

        MessageType::TokenCreate | MessageType::TokenDelete => {
            // Только GM может создавать/удалять токены
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::FogUpdate => {
            // Только GM может менять туман войны
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::InitiativeUpdate => {
            // Только GM управляет инициативой
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::RoleAssigned => {
            // Только GM может назначать роли
            handle_role_assignment(state, room_id, user_id, &envelope).await;
        }

        MessageType::TokenOwnership => {
            // Только GM может назначать владельцев токенов
            handle_token_ownership(state, room_id, user_id, &envelope).await;
        }
        MessageType::StateUpdate | MessageType::StateSync => {
            handle_gm_only_action(state, room_id, user_id, &envelope).await;
        }

        MessageType::ChatMessage
        | MessageType::DiceRoll
        | MessageType::RequestAction
        | MessageType::ActionApproved
        | MessageType::ActionDenied => {
            // Доступно всем
            if let Err(e) = state.broadcast_to_room(room_id, envelope).await {
                warn!("Broadcast failed for room {}: {}", room_id, e);
            }
        }

        _ => {
            warn!("Unhandled message type: {:?}", envelope.msg_type);
        }
    }
}

/// Проверка прав на выполнение действия
/// Проверка прав на выполнение действия
async fn check_permission(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) -> bool {
    let rooms = state.rooms.read().await;
    let room_state = match rooms.get(room_id) {
        Some(rs) => rs,
        None => return false,
    };

    let room = &room_state.room;

    match envelope.msg_type {
        // GM-only действия
        MessageType::TokenCreate
        | MessageType::TokenDelete
        | MessageType::FogUpdate
        | MessageType::InitiativeUpdate
        | MessageType::RoleAssigned
        | MessageType::TokenOwnership
        | MessageType::Kick
        | MessageType::StateUpdate
        | MessageType::StateSync => room.is_gm(user_id),

        // Перемещение токена — проверка владельца
        MessageType::TokenMove => {
            if room.is_gm(user_id) {
                return true;
            }

            let payload: Result<crate::protocol::TokenMovePayload, _> =
                serde_json::from_value(envelope.payload.clone());

            match payload {
                Ok(p) => room.owns_token(user_id, &p.token_id),
                Err(_) => false,
            }
        }

        // Доступно всем
        MessageType::ChatMessage
        | MessageType::DiceRoll
        | MessageType::Heartbeat
        | MessageType::RequestAction
        | MessageType::Join
        | MessageType::Leave => true,

        // Ответы на запросы — только GM
        MessageType::ActionApproved | MessageType::ActionDenied => room.is_gm(user_id),

        _ => {
            warn!(
                "Unknown message type {:?} from user {} — denied by default",
                envelope.msg_type, user_id
            );
            false
        }
    }
}
/// Обработка перемещения токена
async fn handle_token_move(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &mut Envelope,
) {
    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast token_move failed: {}", e);
    }
}

/// Обработка GM-only действий
async fn handle_gm_only_action(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) {
    let rooms = state.rooms.read().await;
    if let Some(room_state) = rooms.get(room_id) {
        if !room_state.room.is_gm(user_id) {
            warn!(
                "Non-GM user {} attempted {:?} in room {}",
                user_id, envelope.msg_type, room_id
            );
            return;
        }
    }
    drop(rooms);

    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast {:?} failed: {}", envelope.msg_type, e);
    }
}

/// Обработка назначения ролей
async fn handle_role_assignment(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) {
    let payload: crate::protocol::RoleAssignedPayload =
        match serde_json::from_value(envelope.payload.clone()) {
            Ok(p) => p,
            Err(_) => return,
        };

    // Применяем изменение роли на сервере
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            if !room_state.room.is_gm(user_id) {
                return;
            }

            let new_role = crate::room::ParticipantRole::from_str(&payload.role);
            room_state
                .room
                .change_role(&payload.target_user_id, new_role);
        }
    }

    // Рассылаем уведомление
    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast role_assigned failed: {}", e);
    }
}

/// Обработка назначения владельца токена
async fn handle_token_ownership(
    state: &Arc<AppState>,
    room_id: &str,
    user_id: &str,
    envelope: &Envelope,
) {
    let payload: crate::protocol::TokenOwnershipPayload =
        match serde_json::from_value(envelope.payload.clone()) {
            Ok(p) => p,
            Err(_) => return,
        };

    // Сохраняем владельца на сервере
    {
        let mut rooms = state.rooms.write().await;
        if let Some(room_state) = rooms.get_mut(room_id) {
            if !room_state.room.is_gm(user_id) {
                return;
            }

            room_state
                .room
                .set_token_owner(&payload.token_id, &payload.owner_user_id);
        }
    }

    // Рассылаем уведомление
    if let Err(e) = state.broadcast_to_room(room_id, envelope.clone()).await {
        warn!("Broadcast token_ownership failed: {}", e);
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

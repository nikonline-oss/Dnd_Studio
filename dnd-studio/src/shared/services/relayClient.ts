import { useUiStore } from '../stores/ui';

/** Типы сообщений протокола */
export type MessageType =
    | 'join'
    | 'leave'
    | 'heartbeat'
    | 'error'
    | 'role_assigned'
    | 'kick'
    | 'state_sync'
    | 'state_update'
    | 'token_move'
    | 'token_create'
    | 'token_delete'
    | 'chat_message'
    | 'initiative_update'
    | 'fog_update'
    | 'dice_roll'
    | 'asset_request'
    | 'asset_response'
    | 'token_ownership'
    | 'request_action';

/** Envelope — обёртка для всех сообщений */
export interface Envelope {
    v: number;
    id: string;
    type: MessageType;
    ts: number;
    seq: number;
    session_id: string;
    sender_id: string;
    payload: Record<string, unknown>;
}

/** Конфигурация подключения */
export interface ConnectionConfig {
    serverUrl: string;
    roomId: string;
    token: string;
    displayName: string;
}

/** Статус подключения */
export type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error';

/** Callback для входящих сообщений */
export type MessageHandler = (envelope: Envelope) => void;

let seqCounter = 0;

function generateId(): string {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function nextSeq(): number {
    return ++seqCounter;
}

/** Создаёт Envelope для отправки */
export function createEnvelope(
    type: MessageType,
    sessionId: string,
    senderId: string,
    payload: Record<string, unknown>,
): Envelope {
    return {
        v: 1,
        id: generateId(),
        type,
        ts: Date.now(),
        seq: nextSeq(),
        session_id: sessionId,
        sender_id: senderId,
        payload,
    };
}

/**
 * Relay Client — управляет WebSocket соединением с Relay Server
 */
// ... существующий код до класса RelayClient без изменений ...

class RelayClient {
    private ws: WebSocket | null = null;
    private config: ConnectionConfig | null = null;
    private handlers: Map<MessageType, MessageHandler[]> = new Map();
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private userId: string = '';
    private role: string = '';
    private _status: ConnectionStatus = 'disconnected';
    private shouldReconnect = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    get status(): ConnectionStatus {
        return this._status;
    }

    get connectedUserId(): string {
        return this.userId;
    }

    get connectedRole(): string {
        return this.role;
    }

    /** Подключиться к комнате */
    connect(config: ConnectionConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            // Закрываем существующее соединение
            if (this.ws) {
                this.ws.onopen = null;
                this.ws.onmessage = null;
                this.ws.onerror = null;
                this.ws.onclose = null;
                this.ws.close();
                this.ws = null;
            }

            this.config = config;
            this.shouldReconnect = true;
            this.reconnectAttempts = 0;
            this.setStatus('connecting');

            try {
                const wsUrl = `${config.serverUrl.replace(/^http/, 'ws')}/ws/${config.roomId}`;
                const ws = new WebSocket(wsUrl);
                this.ws = ws;

                ws.onopen = () => {
                    // Проверяем, что это всё ещё актуальный сокет
                    if (this.ws !== ws) return;

                    const joinEnvelope = createEnvelope(
                        'join',
                        config.roomId,
                        '',
                        {
                            room_id: config.roomId,
                            token: config.token,
                            display_name: config.displayName,
                        },
                    );

                    ws.send(JSON.stringify(joinEnvelope));
                };

                ws.onmessage = (event) => {
                    if (this.ws !== ws) return;

                    try {
                        const envelope: Envelope = JSON.parse(event.data);
                        this.handleMessage(envelope, resolve, reject);
                    } catch (e) {
                        console.error('Failed to parse message:', e);
                    }
                };

                ws.onerror = (error) => {
                    if (this.ws !== ws) return;
                    console.error('WebSocket error:', error);
                    this.setStatus('error');
                    reject(new Error('WebSocket connection failed'));
                };

                ws.onclose = () => {
                    if (this.ws !== ws) return;

                    this.stopHeartbeat();
                    this.setStatus('disconnected');

                    if (this.shouldReconnect) {
                        this.scheduleReconnect();
                    }
                };
            } catch (e) {
                this.setStatus('error');
                reject(e);
            }
        });
    }

    /** Отключиться */
    disconnect(): void {
        this.shouldReconnect = false;
        this.stopHeartbeat();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }

        this.setStatus('disconnected');
        this.userId = '';
        this.role = '';

        useUiStore.getState().setUserRole(null);
    }

    /** Отправить сообщение */
    send(type: MessageType, payload: Record<string, unknown>): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.config) {
            return;
        }

        const envelope = createEnvelope(
            type,
            this.config.roomId,
            this.userId,
            payload,
        );

        this.ws.send(JSON.stringify(envelope));
    }

    /** Зарегистрировать обработчик сообщений */
    on(type: MessageType, handler: MessageHandler): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }

        this.handlers.get(type)!.push(handler);

        return () => {
            const handlers = this.handlers.get(type);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }

    /** Обработка входящего сообщения */
    private handleMessage(
        envelope: Envelope,
        resolveOnJoin: (value: void) => void,
        rejectOnJoin: (reason: Error) => void,
    ): void {
        switch (envelope.type) {
            case 'join': {
                const payload = envelope.payload as {
                    success?: boolean;
                    user_id?: string;
                    role?: string;
                    error?: string;
                    display_name?: string;
                };

                // Проверяем, есть ли поле `success` — это определяет,
                // является ли сообщение ОТВЕТОМ на наш join или УВЕДОМЛЕНИЕМ о другом пользователе
                if ('success' in payload) {
                    // Это ОТВЕТ на наш запрос подключения
                    if (payload.success) {
                        this.userId = payload.user_id ?? '';
                        this.role = payload.role ?? '';
                        this.reconnectAttempts = 0;
                        this.setStatus('connected');
                        this.startHeartbeat();

                        useUiStore.getState().setUserRole(this.role as any);
                        resolveOnJoin();
                    } else {
                        this.shouldReconnect = false;
                        this.setStatus('error');
                        const errorMsg = payload.error ?? 'Join failed';
                        rejectOnJoin(new Error(errorMsg));
                    }
                } else {
                    // Это УВЕДОМЛЕНИЕ о подключении другого пользователя
                    // Передаём его в обработчики событий (например, для обновления списка участников)
                    console.log(
                        `[Relay] User '${payload.display_name}' (${payload.role}) joined the room`,
                    );

                    const handlers = this.handlers.get('join');
                    if (handlers) {
                        handlers.forEach((handler) => {
                            try {
                                handler(envelope);
                            } catch (e) {
                                console.error('Handler error for join notification:', e);
                            }
                        });
                    }
                }
                break;
            }
            case 'leave': {
                const payload = envelope.payload as {
                    user_id?: string;
                };

                console.log(`[Relay] User '${payload.user_id}' left the room`);

                const handlers = this.handlers.get('leave');
                if (handlers) {
                    handlers.forEach((handler) => {
                        try {
                            handler(envelope);
                        } catch (e) {
                            console.error('Handler error for leave notification:', e);
                        }
                    });
                }
                break;
            }

            case 'error': {
                const payload = envelope.payload as {
                    error?: string;
                    success?: boolean;
                    room_id?: string;
                };

                console.error('Server error:', payload);

                // Если комната не найдена — останавливаем переподключение
                if (payload.error === 'Room not found') {
                    this.shouldReconnect = false;
                    this.stopHeartbeat();
                    this.setStatus('disconnected');
                    this.disconnect();
                    return;
                }

                // Если это ответ на Join с ошибкой
                if (payload.success === false) {
                    this.shouldReconnect = false;
                    this.setStatus('error');
                    rejectOnJoin(new Error(payload.error ?? 'Connection rejected'));
                }
                break;
            }

            case 'heartbeat': {
                break;
            }

            default: {
                const handlers = this.handlers.get(envelope.type);
                if (handlers) {
                    handlers.forEach((handler) => {
                        try {
                            handler(envelope);
                        } catch (e) {
                            console.error(`Handler error for ${envelope.type}:`, e);
                        }
                    });
                }
                break;
            }
        }
    }

    /** Запуск heartbeat */
    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            this.send('heartbeat', { client_time: Date.now() });
        }, 15000);
    }

    /** Остановка heartbeat */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /** Планирование переподключения */
    private scheduleReconnect(): void {
        if (!this.shouldReconnect || !this.config) return;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnection attempts reached, giving up');
            this.shouldReconnect = false;
            this.setStatus('disconnected');
            return;
        }

        this.reconnectAttempts++;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

        console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            if (this.config && this.shouldReconnect) {
                this.connect(this.config).catch(() => {
                    // Ошибка переподключения — scheduleReconnect вызовется через onclose
                });
            }
        }, delay);
    }

    /** Обновление статуса */
    private setStatus(status: ConnectionStatus): void {
        this._status = status;
        useUiStore.getState().setConnectionStatus(status);
    }

    /** Является ли текущий пользователь GM */
    get isGM(): boolean {
        return this.role === 'gm' || this.role === 'co_gm';
    }

    /** Является ли текущий пользователь Player */
    get isPlayer(): boolean {
        return this.role === 'player';
    }

    /** Является ли текущий пользователь Spectator */
    get isSpectator(): boolean {
        return this.role === 'spectator';
    }

    /** Назначить роль пользователю (только GM) */
    assignRole(targetUserId: string, role: string): void {
        if (!this.isGM) {
            console.warn('Only GM can assign roles');
            return;
        }

        this.send('role_assigned', {
            target_user_id: targetUserId,
            role,
            assigned_by: this.userId,
        });
    }

    /** Назначить владельца токена (только GM) */
    assignTokenOwner(tokenId: string, ownerUserId: string, mapId: string): void {
        if (!this.isGM) {
            console.warn('Only GM can assign token owners');
            return;
        }

        this.send('token_ownership', {
            token_id: tokenId,
            owner_user_id: ownerUserId,
            map_id: mapId,
        });
    }

    /** Запросить действие у GM (для игроков) */
    requestAction(actionType: string, payload: Record<string, unknown>): void {
        this.send('request_action', {
            action_type: actionType,
            payload,
            requester_name: this.connectedUserId,
        });
    }
}

export const relayClient = new RelayClient();
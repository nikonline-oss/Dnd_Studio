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
  | 'asset_response';

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
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.config = config;
      this.shouldReconnect = true;
      this.setStatus('connecting');

      try {
        const wsUrl = `${config.serverUrl.replace(/^http/, 'ws')}/ws/${config.roomId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          // Отправляем Join
          const joinEnvelope = createEnvelope(
            'join',
            config.roomId,
            '', // sender_id будет установлен сервером
            {
              room_id: config.roomId,
              token: config.token,
              display_name: config.displayName,
            },
          );

          this.ws!.send(JSON.stringify(joinEnvelope));
        };

        this.ws.onmessage = (event) => {
          try {
            const envelope: Envelope = JSON.parse(event.data);
            this.handleMessage(envelope, resolve, reject);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.setStatus('error');
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
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
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
    this.userId = '';
    this.role = '';
  }

  /** Отправить сообщение */
  send(type: MessageType, payload: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.config) {
      console.warn('Cannot send: not connected');
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

    // Возвращаем функцию отписки
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
        };

        if (payload.success) {
          this.userId = payload.user_id ?? '';
          this.role = payload.role ?? '';
          this.setStatus('connected');
          this.startHeartbeat();
          resolveOnJoin();
        } else {
          this.shouldReconnect = false;
          this.setStatus('error');
          rejectOnJoin(new Error(payload.error ?? 'Join failed'));
        }
        break;
      }

      case 'error': {
        console.error('Server error:', envelope.payload);
        break;
      }

      case 'heartbeat': {
        // Сервер ответил на heartbeat — соединение живо
        break;
      }

      default: {
        // Вызываем зарегистрированные обработчики
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
    }, 15000); // 15 секунд по ТЗ
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
    if (this.reconnectTimeout) return;

    // Exponential backoff: 1s, 2s, 4s, 8s, ... max 30s
    const delay = Math.min(1000 * Math.pow(2, Math.floor(Math.random() * 5)), 30000);

    console.log(`Reconnecting in ${delay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.config && this.shouldReconnect) {
        this.connect(this.config).catch(() => {
          // Ошибка переподключения — попробуем снова
        });
      }
    }, delay);
  }

  /** Обновление статуса */
  private setStatus(status: ConnectionStatus): void {
    this._status = status;
    // Обновляем Zustand store
    useUiStore.getState().setConnectionStatus(status);
  }
}

/** Синглтон-экземпляр клиента */
export const relayClient = new RelayClient();
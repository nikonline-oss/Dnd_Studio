import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { relayClient } from '../services/relayClient';
import type { Envelope } from '../services/relayClient';
import { useUiStore } from '../stores/ui';

/**
 * Хук для синхронизации игрового состояния через Relay Server.
 * Подписывается на входящие сообщения и обновляет локальное состояние.
 */
export function useMultiplayerSync() {
    const queryClient = useQueryClient();
    const connectionStatus = useUiStore((state) => state.connectionStatus);

    useEffect(() => {
        if (connectionStatus !== 'connected') {
            return;
        }

        console.log('[MultiplayerSync] Subscribing to relay events');

        const unsubscribers: Array<() => void> = [];

        // Синхронизация перемещения токенов
        unsubscribers.push(
            relayClient.on('token_move', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    map_id: string;
                    x: number;
                    y: number;
                    rotation?: number;
                };

                console.log('[MultiplayerSync] token_move received:', payload);

                // Обновляем массив токенов в кэше по mapId
                queryClient.setQueryData(
                    ['tokens', payload.map_id],
                    (oldTokens: any[]) => {
                        if (!oldTokens) return oldTokens;

                        return oldTokens.map((token) => {
                            if (token.id === payload.token_id) {
                                return {
                                    ...token,
                                    x: payload.x,
                                    y: payload.y,
                                    rotation: payload.rotation ?? token.rotation,
                                };
                            }
                            return token;
                        });
                    },
                );
            }),
        );

        // Синхронизация создания токенов
        unsubscribers.push(
            relayClient.on('token_create', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    map_id: string;
                };

                console.log('[MultiplayerSync] token_create received:', payload);

                // Инвалидируем список токенов для карты
                queryClient.invalidateQueries({
                    queryKey: ['tokens', payload.map_id],
                });
            }),
        );

        // Синхронизация удаления токенов
        unsubscribers.push(
            relayClient.on('token_delete', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    map_id: string;
                };

                console.log('[MultiplayerSync] token_delete received:', payload);

                // Удаляем токен из кэша
                queryClient.setQueryData(
                    ['tokens', payload.map_id],
                    (oldTokens: any[]) => {
                        if (!oldTokens) return oldTokens;
                        return oldTokens.filter((token) => token.id !== payload.token_id);
                    },
                );
            }),
        );

        // Синхронизация сообщений чата
        unsubscribers.push(
            relayClient.on('chat_message', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    channel: string;
                    text: string;
                    sender_name: string;
                };

                console.log('[MultiplayerSync] chat_message received:', payload);
            }),
        );

        // Синхронизация инициативы
        unsubscribers.push(
            relayClient.on('initiative_update', (envelope: Envelope) => {
                console.log('[MultiplayerSync] initiative_update received');
                queryClient.invalidateQueries({ queryKey: ['initiative'] });
            }),
        );

        // Синхронизация тумана войны
        unsubscribers.push(
            relayClient.on('fog_update', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    map_id: string;
                    fog_data: string;
                };

                console.log('[MultiplayerSync] fog_update received:', payload.map_id);
                queryClient.invalidateQueries({ queryKey: ['map', payload.map_id] });
            }),
        );

        // Синхронизация бросков костей
        unsubscribers.push(
            relayClient.on('dice_roll', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    notation: string;
                    result: number;
                    roller_name: string;
                };

                console.log(
                    '[MultiplayerSync] dice_roll:',
                    payload.roller_name,
                    payload.notation,
                    '=',
                    payload.result,
                );
            }),
        );

        // Назначение роли
        unsubscribers.push(
            relayClient.on('role_assigned', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    target_user_id: string;
                    role: string;
                    assigned_by: string;
                };

                console.log('[MultiplayerSync] Role assigned:', payload);

                // Если роль назначили нам — обновляем store
                if (payload.target_user_id === relayClient.connectedUserId) {
                    useUiStore.getState().setUserRole(payload.role as any);
                }
            }),
        );

        // Назначение владельца токена
        unsubscribers.push(
            relayClient.on('token_ownership', (envelope: Envelope) => {
                const payload = envelope.payload as {
                    token_id: string;
                    owner_user_id: string;
                    map_id: string;
                };

                console.log('[MultiplayerSync] Token ownership:', payload);
                // Здесь можно обновить локальное состояние владельцев токенов
            }),
        );

        // Очистка подписок при размонтировании
        return () => {
            console.log('[MultiplayerSync] Unsubscribing from relay events');
            unsubscribers.forEach((unsub) => unsub());
        };
    }, [connectionStatus, queryClient]);
}
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { relayClient } from '../services/relayClient';
import type { Envelope } from '../services/relayClient';
import { useUiStore } from '../stores/ui';
import { useChatStore } from '../stores/chat';

export function useMultiplayerSync() {
  const queryClient = useQueryClient();
  const connectionStatus = useUiStore((state) => state.connectionStatus);

  useEffect(() => {
    if (connectionStatus !== 'connected') {
      return;
    }

    console.log('[MultiplayerSync] Subscribing to relay events');

    const unsubscribers: Array<() => void> = [];

    // === ЧАТ ===
    unsubscribers.push(
      relayClient.on('chat_message', (envelope: Envelope) => {
        const payload = envelope.payload as {
          channel: string;
          text: string;
          sender_name: string;
        };

        console.log('[MultiplayerSync] chat_message received:', payload);

        // Добавляем в chat store
        useChatStore.getState().addMessage({
          id: envelope.id, // Используем ID envelope для дедупликации
          text: payload.text,
          senderId: envelope.sender_id,
          senderName: payload.sender_name,
          timestamp: envelope.ts,
          type: 'user',
        });
      }),
    );

    // === JOIN/LEAVE — системные сообщения ===
    unsubscribers.push(
      relayClient.on('join', (envelope: Envelope) => {
        const payload = envelope.payload as {
          display_name?: string;
          role?: string;
          user_id?: string;
        };

        // Только уведомления о других пользователях (не о себе)
        if (payload.display_name && envelope.sender_id !== relayClient.connectedUserId) {
          useChatStore.getState().addSystemMessage(
            `${payload.display_name} joined the room (${payload.role})`,
          );
        }
      }),
    );

    unsubscribers.push(
      relayClient.on('leave', (envelope: Envelope) => {
        const payload = envelope.payload as {
          user_id?: string;
        };

        if (payload.user_id && payload.user_id !== relayClient.connectedUserId) {
          useChatStore.getState().addSystemMessage(
            `A player left the room`,
          );
        }
      }),
    );

    // === БРОСКИ КОСТЕЙ ===
    unsubscribers.push(
      relayClient.on('dice_roll', (envelope: Envelope) => {
        const payload = envelope.payload as {
          notation: string;
          result: number;
          roller_name: string;
        };

        console.log('[MultiplayerSync] dice_roll:', payload);

        useChatStore.getState().addDiceMessage(
          payload.roller_name,
          payload.notation,
          payload.result,
        );
      }),
    );

    // === ПЕРЕМЕЩЕНИЕ ТОКЕНОВ ===
    unsubscribers.push(
      relayClient.on('token_move', (envelope: Envelope) => {
        const payload = envelope.payload as {
          token_id: string;
          map_id: string;
          x: number;
          y: number;
          rotation?: number;
        };

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

    // === СОЗДАНИЕ ТОКЕНОВ ===
    unsubscribers.push(
      relayClient.on('token_create', (envelope: Envelope) => {
        const payload = envelope.payload as {
          token_id: string;
          map_id: string;
        };

        queryClient.invalidateQueries({
          queryKey: ['tokens', payload.map_id],
        });
      }),
    );

    // === УДАЛЕНИЕ ТОКЕНОВ ===
    unsubscribers.push(
      relayClient.on('token_delete', (envelope: Envelope) => {
        const payload = envelope.payload as {
          token_id: string;
          map_id: string;
        };

        queryClient.setQueryData(
          ['tokens', payload.map_id],
          (oldTokens: any[]) => {
            if (!oldTokens) return oldTokens;
            return oldTokens.filter((token) => token.id !== payload.token_id);
          },
        );
      }),
    );

    // === ТУМАН ВОЙНЫ ===
    unsubscribers.push(
      relayClient.on('fog_update', (envelope: Envelope) => {
        const payload = envelope.payload as {
          map_id: string;
          fog_data: string;
        };

        queryClient.invalidateQueries({ queryKey: ['map', payload.map_id] });
      }),
    );

    // === ИНИЦИАТИВА ===
    unsubscribers.push(
      relayClient.on('initiative_update', (envelope: Envelope) => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] });
      }),
    );

    // === НАЗНАЧЕНИЕ РОЛЕЙ ===
    unsubscribers.push(
      relayClient.on('role_assigned', (envelope: Envelope) => {
        const payload = envelope.payload as {
          target_user_id: string;
          role: string;
          assigned_by: string;
        };

        if (payload.target_user_id === relayClient.connectedUserId) {
          useUiStore.getState().setUserRole(payload.role as any);
          useChatStore.getState().addSystemMessage(
            `Your role has been changed to ${payload.role}`,
          );
        }
      }),
    );

    // === ВЛАДЕЛЬЦЫ ТОКЕНОВ ===
    unsubscribers.push(
      relayClient.on('token_ownership', (envelope: Envelope) => {
        console.log('[MultiplayerSync] token_ownership:', envelope.payload);
      }),
    );

    return () => {
      console.log('[MultiplayerSync] Unsubscribing from relay events');
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [connectionStatus, queryClient]);
}
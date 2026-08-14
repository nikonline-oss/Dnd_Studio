import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RollResult } from '../lib/dice';

export type ChatMessageKind = 'user' | 'system' | 'dice';

export interface ChatMessage {
  id: string;
  kind: ChatMessageKind;
  author: string;
  text: string;
  createdAt: number;
  roll?: RollResult;
}

interface ChatState {
  messagesByCampaign: Record<string, ChatMessage[]>;

  addUserMessage: (campaignId: string, text: string) => void;
  addSystemMessage: (campaignId: string, text: string) => void;
  addDiceRoll: (campaignId: string, roll: RollResult) => void;
  clearChat: (campaignId: string) => void;
}

const MESSAGE_LIMIT = 500;

function createId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function pushMessage(
  state: ChatState,
  campaignId: string,
  message: ChatMessage,
): Partial<ChatState> {
  const current = state.messagesByCampaign[campaignId] ?? [];
  const next = [...current, message].slice(-MESSAGE_LIMIT);

  return {
    messagesByCampaign: {
      ...state.messagesByCampaign,
      [campaignId]: next,
    },
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messagesByCampaign: {},

      addUserMessage: (campaignId, text) =>
        set((state) =>
          pushMessage(state, campaignId, {
            id: createId(),
            kind: 'user',
            author: 'GM',
            text,
            createdAt: Date.now(),
          }),
        ),

      addSystemMessage: (campaignId, text) =>
        set((state) =>
          pushMessage(state, campaignId, {
            id: createId(),
            kind: 'system',
            author: 'System',
            text,
            createdAt: Date.now(),
          }),
        ),

      addDiceRoll: (campaignId, roll) =>
        set((state) =>
          pushMessage(state, campaignId, {
            id: createId(),
            kind: 'dice',
            author: 'GM',
            text: `rolled ${roll.input}`,
            createdAt: Date.now(),
            roll,
          }),
        ),

      clearChat: (campaignId) =>
        set((state) => ({
          messagesByCampaign: {
            ...state.messagesByCampaign,
            [campaignId]: [],
          },
        })),
    }),
    {
      name: 'dndstudio.chat.v2',
      partialize: (state) => ({
        messagesByCampaign: state.messagesByCampaign,
      }),
    },
  ),
);
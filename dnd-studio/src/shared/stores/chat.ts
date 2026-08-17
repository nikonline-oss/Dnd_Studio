import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  type: 'user' | 'system' | 'dice';
  /** Для dice-сообщений */
  diceNotation?: string;
  diceResult?: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  addSystemMessage: (text: string) => void;
  addDiceMessage: (
    senderName: string,
    notation: string,
    result: number,
  ) => void;
  clearMessages: () => void;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addSystemMessage: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          text,
          senderId: 'system',
          senderName: 'System',
          timestamp: Date.now(),
          type: 'system',
        },
      ],
    })),

  addDiceMessage: (senderName, notation, result) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          text: `rolled ${notation} → ${result}`,
          senderId: 'dice',
          senderName,
          timestamp: Date.now(),
          type: 'dice',
          diceNotation: notation,
          diceResult: result,
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),
}));
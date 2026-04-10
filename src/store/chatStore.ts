import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  type: 'general' | 'guild' | 'private';
  sender: string;
  receiver?: string;
  message: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  getMessages: (type: ChatMessage['type']) => ChatMessage[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set(s => ({ messages: [...s.messages, newMsg] }));
      },

      getMessages: (type) => {
        const state = get();
        return state.messages.filter(m => m.type === type).slice(-50);
      },
    }),
    { name: 'quest-forge-chat' }
  )
);
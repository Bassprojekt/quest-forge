import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  name: string;
  level: number;
  class: string;
  status: 'online' | 'offline';
  lastSeen: number;
}

interface FriendsState {
  friends: Friend[];
  addFriend: (name: string, level: number, playerClass: string) => void;
  removeFriend: (name: string) => void;
  setOnline: (name: string, online: boolean) => void;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set) => ({
      friends: [],

      addFriend: (name, level, playerClass) => set((state) => {
        if (state.friends.some(f => f.name === name)) return state;
        return { friends: [...state.friends, { name, level, class: playerClass, status: 'offline', lastSeen: Date.now() }] };
      }),

      removeFriend: (name) => set((state) => ({
        friends: state.friends.filter(f => f.name !== name)
      })),

      setOnline: (name, online) => set((state) => ({
        friends: state.friends.map(f => f.name === name ? { ...f, status: online ? 'online' : 'offline', lastSeen: Date.now() } : f)
      })),
    }),
    { name: 'quest-forge-friends' }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Character {
  id: string;
  name: string;
  class: 'warrior' | 'mage' | 'archer' | null;
  level: number;
  createdAt: number;
}

interface UserAccount {
  username: string;
  password: string;
  createdAt: number;
  characters: (Character | null)[];
}

interface AccountState {
  users: UserAccount[];
  currentUser: string | null;
  currentCharacterSlot: number;
  register: (username: string, password: string) => boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: () => boolean;
  getCurrentUsername: () => string | null;
  createCharacter: (name: string, charClass: 'warrior' | 'mage' | 'archer') => boolean;
  selectCharacter: (slot: number) => void;
  getCurrentCharacter: () => Character | null;
  resetCharacters: () => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      currentCharacterSlot: 0,

      register: (username: string, password: string) => {
        const state = get();
        if (state.users.find(u => u.username === username)) {
          return false;
        }
        set({ users: [...state.users, { username, password, createdAt: Date.now(), characters: [null, null, null] }] });
        return true;
      },

      login: (username: string, password: string) => {
        const state = get();
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
          set({ currentUser: username, currentCharacterSlot: 0 });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null, currentCharacterSlot: 0 }),

      isLoggedIn: () => get().currentUser !== null,
      getCurrentUsername: () => get().currentUser,

      createCharacter: (name: string, charClass: 'warrior' | 'mage' | 'archer') => {
        const state = get();
        const userIndex = state.users.findIndex(u => u.username === state.currentUser);
        if (userIndex === -1) return false;
        
        const user = state.users[userIndex];
        if (!user.characters || !Array.isArray(user.characters)) return false;
        const emptySlot = user.characters.findIndex(c => c === null);
        if (emptySlot === -1) return false;
        
        const newChars = [...user.characters];
        newChars[emptySlot] = {
          id: `char-${Date.now()}`,
          name,
          class: charClass,
          level: 1,
          createdAt: Date.now()
        };
        
        const newUsers = [...state.users];
        newUsers[userIndex] = { ...user, characters: newChars };
        set({ users: newUsers, currentCharacterSlot: emptySlot });
        return true;
      },

      selectCharacter: (slot: number) => {
        set({ currentCharacterSlot: slot });
      },

      getCurrentCharacter: () => {
        const state = get();
        if (!state.currentUser) return null;
        const user = state.users.find(u => u.username === state.currentUser);
        if (!user) return null;
        return user.characters[state.currentCharacterSlot] || null;
      },

      resetCharacters: () => {
        const state = get();
        const userIndex = state.users.findIndex(u => u.username === state.currentUser);
        if (userIndex === -1) return;
        const newUsers = [...state.users];
        newUsers[userIndex] = { ...newUsers[userIndex], characters: [null, null, null] };
        set({ users: newUsers });
      },
    }),
    { name: 'quest-forge-accounts' }
  )
);

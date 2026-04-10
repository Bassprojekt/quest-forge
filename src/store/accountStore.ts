import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserAccount {
  username: string;
  password: string;
  createdAt: number;
}

interface AccountState {
  users: UserAccount[];
  currentUser: string | null;
  register: (username: string, password: string) => boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: () => boolean;
  getCurrentUsername: () => string | null;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      register: (username: string, password: string) => {
        const state = get();
        if (state.users.find(u => u.username === username)) {
          return false;
        }
        set({ users: [...state.users, { username, password, createdAt: Date.now() }] });
        return true;
      },

      login: (username: string, password: string) => {
        const state = get();
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
          set({ currentUser: username });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null }),
      isLoggedIn: () => get().currentUser !== null,
      getCurrentUsername: () => get().currentUser,
    }),
    { name: 'quest-forge-accounts' }
  )
);
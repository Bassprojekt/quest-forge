import { create } from 'zustand';

export interface BankItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  stat: string;
  value: number;
  quantity: number;
  rarity: string;
}

interface BankState {
  bankGold: number;
  bankItems: BankItem[];
  pin: string | null;
  isPinSet: boolean;
  isUnlocked: boolean;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  unlock: () => void;
  lock: () => void;
  depositGold: (amount: number) => boolean;
  withdrawGold: (amount: number) => boolean;
  depositItem: (item: BankItem) => void;
  withdrawItem: (itemId: string, quantity: number) => boolean;
}

export const useBankStore = create<BankState>((set, get) => ({
  bankGold: 0,
  bankItems: [],
  pin: null,
  isPinSet: false,
  isUnlocked: false,

  setPin: (pin) => {
    if (pin.length === 4 && /^\d+$/.test(pin)) {
      set({ pin, isPinSet: true });
    }
  },

  verifyPin: (pin) => {
    return get().pin === pin;
  },

  unlock: () => {
    set({ isUnlocked: true });
  },

  lock: () => {
    set({ isUnlocked: false });
  },

  depositGold: (amount) => {
    const { bankGold } = get();
    set({ bankGold: bankGold + amount });
    return true;
  },

  withdrawGold: (amount) => {
    const { bankGold } = get();
    if (bankGold >= amount) {
      set({ bankGold: bankGold - amount });
      return true;
    }
    return false;
  },

  depositItem: (item) => {
    const { bankItems } = get();
    const existing = bankItems.find(i => i.id === item.id);
    if (existing) {
      set({
        bankItems: bankItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ bankItems: [...bankItems, item] });
    }
  },

  withdrawItem: (itemId, quantity) => {
    const { bankItems } = get();
    const item = bankItems.find(i => i.id === itemId);
    if (item && item.quantity >= quantity) {
      if (item.quantity === quantity) {
        set({ bankItems: bankItems.filter(i => i.id !== itemId) });
      } else {
        set({
          bankItems: bankItems.map(i =>
            i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
          ),
        });
      }
      return true;
    }
    return false;
  },
}));
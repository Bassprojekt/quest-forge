import { create } from 'zustand';

export interface Companion {
  id: string;
  name: string;
  type: 'tank' | 'healer' | 'dps';
  hp: number;
  maxHp: number;
  attackPower: number;
  attackSpeed: number;
  icon: string;
  color: string;
  skill: string;
  skillCooldown: number;
  lastSkillUse: number;
  position: [number, number, number];
  unlocked: boolean;
  active: boolean;
  level: number;
  healPower?: number;
  healCooldown?: number;
}

interface CompanionState {
  companions: Companion[];
  maxPartySize: number;
  unlockCompanion: (id: string) => void;
  toggleCompanion: (id: string) => void;
  updateCompanionPosition: (id: string, pos: [number, number, number]) => void;
  damageCompanion: (id: string, amount: number) => void;
  healCompanions: (amount: number) => void;
  getActiveCompanions: () => Companion[];
}

const INITIAL_COMPANIONS: Companion[] = [];

export const useCompanionStore = create<CompanionState>((set, get) => ({
  companions: INITIAL_COMPANIONS.map(c => ({ ...c })),
  maxPartySize: 2,

  unlockCompanion: (id) => set(s => ({
    companions: s.companions.map(c => c.id === id ? { ...c, unlocked: true, active: true } : c),
  })),

  toggleCompanion: (id) => {
    const state = get();
    const comp = state.companions.find(c => c.id === id);
    if (!comp || !comp.unlocked) return;
    const activeCount = state.companions.filter(c => c.active && c.id !== id).length;
    if (!comp.active && activeCount >= state.maxPartySize) return;
    set(s => ({
      companions: s.companions.map(c => c.id === id ? { ...c, active: !c.active } : c),
    }));
  },

  updateCompanionPosition: (id, pos) => set(s => ({
    companions: s.companions.map(c => c.id === id ? { ...c, position: pos } : c),
  })),

  damageCompanion: (id, amount) => set(s => ({
    companions: s.companions.map(c => c.id === id ? { ...c, hp: Math.max(0, c.hp - amount) } : c),
  })),

  healCompanions: (amount) => set(s => ({
    companions: s.companions.map(c => c.active ? { ...c, hp: Math.min(c.maxHp, c.hp + amount) } : c),
  })),

  getActiveCompanions: () => get().companions.filter(c => c.active && c.hp > 0),
}));

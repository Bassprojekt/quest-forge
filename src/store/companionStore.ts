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

const INITIAL_COMPANIONS: Companion[] = [
  {
    id: 'knight', name: 'Ritter Baldur', type: 'tank',
    hp: 200, maxHp: 200, attackPower: 8, attackSpeed: 1.5,
    icon: '🛡️', color: '#4169E1', skill: 'Provozieren', skillCooldown: 10, lastSkillUse: -999,
    position: [0, 0, 0], unlocked: true, active: false, level: 1,
  },
  {
    id: 'priestess', name: 'Priesterin Aria', type: 'healer',
    hp: 100, maxHp: 100, attackPower: 5, attackSpeed: 2,
    icon: '✨', color: '#FF69B4', skill: 'Heilung', skillCooldown: 8, lastSkillUse: -999,
    position: [0, 0, 0], unlocked: true, active: false, level: 1,
    healPower: 20, healCooldown: 5,
  },
  {
    id: 'ranger', name: 'Waldläufer Finn', type: 'dps',
    hp: 120, maxHp: 120, attackPower: 15, attackSpeed: 0.8,
    icon: '🏹', color: '#4CAF50', skill: 'Giftpfeil', skillCooldown: 6, lastSkillUse: -999,
    position: [0, 0, 0], unlocked: false, active: false, level: 1,
  },
  {
    id: 'wizard', name: 'Zauberer Merlin', type: 'dps',
    hp: 80, maxHp: 80, attackPower: 20, attackSpeed: 1.2,
    icon: '🔮', color: '#9C27B0', skill: 'Meteorregen', skillCooldown: 12, lastSkillUse: -999,
    position: [0, 0, 0], unlocked: false, active: false, level: 1,
  },
];

export const useCompanionStore = create<CompanionState>((set, get) => ({
  companions: INITIAL_COMPANIONS.map(c => ({ ...c })),
  maxPartySize: 2,

  unlockCompanion: (id) => set(s => ({
    companions: s.companions.map(c => c.id === id ? { ...c, unlocked: true } : c),
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

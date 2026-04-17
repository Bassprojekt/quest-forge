import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore } from './gameStore';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  cost: number;
  requires: string | null;
  category: 'offense' | 'defense' | 'utility';
  effect: string;
  bonusPerLevel: number;
}

interface SkillTreeState {
  skillPoints: number;
  nodes: SkillNode[];
  addSkillPoints: (amount: number) => void;
  upgradeNode: (nodeId: string) => boolean;
  getBonus: (nodeId: string) => number;
  getAllBonuses: () => { attackBonus: number; defenseBonus: number; hpBonus: number; manaBonus: number; speedBonus: number };
  resetTree: () => void;
}

const INITIAL_NODES: SkillNode[] = [
  // Offense
  { id: 'atk_boost', name: 'Angriffskraft', description: 'Erhöht ATK', icon: '⚔️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'offense', effect: '+5 ATK pro Level', bonusPerLevel: 5 },
  { id: 'crit_rate', name: 'Kritische Rate', description: '+3% Crit pro Lv', icon: '💥', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'atk_boost', category: 'offense', effect: '+3% Crit', bonusPerLevel: 3 },
  { id: 'atk_speed', name: 'Angriffsgeschw.', description: '-5% CD pro Lv', icon: '⚡', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'atk_boost', category: 'offense', effect: '-5% Cooldown', bonusPerLevel: 5 },
  { id: 'crit_dmg', name: 'Krit-Schaden', description: '+15% Krit-DMG', icon: '🔥', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'crit_rate', category: 'offense', effect: '+15% Krit-Multiplikator', bonusPerLevel: 15 },
  // Defense
  { id: 'hp_boost', name: 'Lebenspunkte', description: '+20 Max-HP', icon: '❤️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+20 Max-HP pro Level', bonusPerLevel: 20 },
  { id: 'def_boost', name: 'Verteidigung', description: '+3 DEF pro Lv', icon: '🛡️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+3 DEF pro Level', bonusPerLevel: 3 },
  { id: 'regen', name: 'Regeneration', description: '+1 HP/s', icon: '💚', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'hp_boost', category: 'defense', effect: '+1 HP/s Regeneration', bonusPerLevel: 1 },
  { id: 'block', name: 'Blocken', description: '+5% Block', icon: '🧱', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'def_boost', category: 'defense', effect: '+5% Blockchance', bonusPerLevel: 5 },
  // Utility
  { id: 'speed_boost', name: 'Bewegungssp.', description: '+5% Speed', icon: '🦶', maxLevel: 5, currentLevel: 0, cost: 1, requires: null, category: 'utility', effect: '+5% Bewegungsspeed', bonusPerLevel: 5 },
  { id: 'gold_boost', name: 'Goldbonus', description: '+10% Gold', icon: '💰', maxLevel: 5, currentLevel: 0, cost: 1, requires: null, category: 'utility', effect: '+10% Gold pro Kill', bonusPerLevel: 10 },
  { id: 'xp_boost', name: 'XP-Bonus', description: '+10% XP', icon: '⭐', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'gold_boost', category: 'utility', effect: '+10% XP pro Kill', bonusPerLevel: 10 },
  { id: 'potion_eff', name: 'Trank-Effizienz', description: '+20% Heilung', icon: '🧪', maxLevel: 3, currentLevel: 0, cost: 2, requires: 'speed_boost', category: 'utility', effect: '+20% Trank-Effizienz', bonusPerLevel: 20 },
];

export const useSkillTreeStore = create<SkillTreeState>()(
  persist(
    (set, get) => ({
      skillPoints: 0,
      nodes: INITIAL_NODES.map(n => ({ ...n })),

      addSkillPoints: (amount) => set(s => ({ skillPoints: s.skillPoints + amount })),

      upgradeNode: (nodeId) => {
        const state = get();
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) return false;
        if (node.currentLevel >= node.maxLevel) return false;
        if (state.skillPoints < node.cost) return false;
        if (node.requires) {
          const req = state.nodes.find(n => n.id === node.requires);
          if (!req || req.currentLevel === 0) return false;
        }
        set(s => ({
          skillPoints: s.skillPoints - node.cost,
          nodes: s.nodes.map(n => n.id === nodeId ? { ...n, currentLevel: n.currentLevel + 1 } : n),
        }));
        applySkillBonuses();
        return true;
      },

      getBonus: (nodeId) => {
        const node = get().nodes.find(n => n.id === nodeId);
        return node ? node.currentLevel * node.bonusPerLevel : 0;
      },

      getAllBonuses: () => {
        const state = get();
        let attackBonus = 0;
        let defenseBonus = 0;
        let hpBonus = 0;
        let manaBonus = 0;
        let speedBonus = 0;
        state.nodes.forEach(n => {
          if (n.currentLevel > 0) {
            if (n.id === 'atk_boost') attackBonus += n.currentLevel * n.bonusPerLevel;
            if (n.id === 'crit_rate' || n.id === 'crit_dmg') attackBonus += n.currentLevel * n.bonusPerLevel;
            if (n.id === 'hp_boost') hpBonus += n.currentLevel * n.bonusPerLevel;
            if (n.id === 'def_boost') defenseBonus += n.currentLevel * n.bonusPerLevel;
            if (n.id === 'speed_boost') speedBonus += (n.currentLevel * n.bonusPerLevel);
          }
        });
        return { attackBonus, defenseBonus, hpBonus, manaBonus, speedBonus };
      },

      resetTree: () => {
        const state = get();
        const spent = state.nodes.reduce((a, n) => a + n.currentLevel * n.cost, 0);
        set({
          skillPoints: state.skillPoints + spent,
          nodes: state.nodes.map(n => ({ ...n, currentLevel: 0 })),
        });
        applySkillBonuses();
      },
    }),
    {
      name: 'quest-forge-skilltree',
    }
  )
);

function applySkillBonuses() {
  const skillStore = useSkillTreeStore.getState();
  const bonuses = skillStore.getAllBonuses();
  const gameState = useGameStore.getState();
  
  const baseAttack = 15 + (gameState.playerLevel - 1) * 3;
  const baseMaxHp = 100 + (gameState.playerLevel - 1) * 20;
  const baseMaxMana = 50 + (gameState.playerLevel - 1) * 10;
  
  let itemAttackBonus = 0;
  let itemDefenseBonus = 0;
  let itemHpBonus = 0;
  let itemManaBonus = 0;
  let itemSpeedBonus = 0;
  gameState.inventory.forEach(i => {
    if (i.equipped) {
      itemAttackBonus += i.attackBonus || 0;
      itemDefenseBonus += i.defenseBonus || 0;
      itemHpBonus += i.maxHpBonus || 0;
      itemManaBonus += i.maxManaBonus || 0;
      itemSpeedBonus += i.speedBonus || 0;
    }
  });
  
  useGameStore.setState({
    playerAttackPower: baseAttack + itemAttackBonus + bonuses.attackBonus,
    playerDefense: gameState.playerLevel > 1 ? Math.floor(gameState.playerLevel / 2) + itemDefenseBonus + bonuses.defenseBonus : itemDefenseBonus + bonuses.defenseBonus,
    playerMaxHp: baseMaxHp + itemHpBonus + bonuses.hpBonus,
    playerMaxMana: baseMaxMana + itemManaBonus + bonuses.manaBonus,
    playerSpeed: 5 + itemSpeedBonus + bonuses.speedBonus,
    playerHp: Math.min(gameState.playerHp, baseMaxHp + itemHpBonus + bonuses.hpBonus),
  });
}

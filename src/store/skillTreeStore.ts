import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore, PlayerClass } from './gameStore';

interface SkillNode {
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
  resetTreeFully: () => void;
}

const WARRIOR_NODES: SkillNode[] = [
  { id: 'war_slash', name: 'Schwertschlag', description: '+10 ATK', icon: '⚔️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'offense', effect: '+10 ATK', bonusPerLevel: 10 },
  { id: 'war_crit', name: 'Kampfeswut', description: '+5% Crit', icon: '💥', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'war_slash', category: 'offense', effect: '+5% Crit', bonusPerLevel: 5 },
  { id: 'war_whirlwind', name: 'Wirbelschlag', description: 'AoE Schaden', icon: '🌪️', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'war_crit', category: 'offense', effect: '+20% AoE', bonusPerLevel: 20 },
  { id: 'war_armor', name: 'Rüstung', description: '+15 DEF', icon: '🛡️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+15 DEF', bonusPerLevel: 15 },
  { id: 'war_shield', name: 'Schildblock', description: '+10% Block', icon: '🔰', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'war_armor', category: 'defense', effect: '+10% Block', bonusPerLevel: 10 },
  { id: 'war_hp', name: 'Kampfgeist', description: '+50 Max-HP', icon: '❤️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+50 HP', bonusPerLevel: 50 },
  { id: 'war_regen', name: 'Wundenheilung', description: '+2 HP/s', icon: '💚', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'war_hp', category: 'defense', effect: '+2 HP/s', bonusPerLevel: 2 },
  { id: 'war_rage', name: 'Kriegsraserei', description: 'Schaden unter 30%', icon: '😡', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'war_whirlwind', category: 'offense', effect: '+30% Schaden', bonusPerLevel: 30 },
  { id: 'war_speed', name: 'Sturmangriff', description: '+10% Speed', icon: '🦵', maxLevel: 5, currentLevel: 0, cost: 1, requires: null, category: 'utility', effect: '+10% Speed', bonusPerLevel: 10 },
  { id: 'war_gold', name: 'Plünderer', description: '+15% Gold', icon: '💰', maxLevel: 5, currentLevel: 0, cost: 2, requires: null, category: 'utility', effect: '+15% Gold', bonusPerLevel: 15 },
];

const MAGE_NODES: SkillNode[] = [
  { id: 'mag_fire', name: 'Feuerball', description: '+12 ATK', icon: '🔥', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'offense', effect: '+12 ATK', bonusPerLevel: 12 },
  { id: 'mag_burn', name: 'Verbrennung', description: 'DoT Schaden', icon: '🔥', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'mag_fire', category: 'offense', effect: '+10 DoT', bonusPerLevel: 10 },
  { id: 'mag_meteor', name: 'Meteor', description: 'Großer Schaden', icon: '☄️', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'mag_burn', category: 'offense', effect: '+50% Schaden', bonusPerLevel: 50 },
  { id: 'mag_ice', name: 'Eis', description: '+8 DEF', icon: '❄️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+8 DEF', bonusPerLevel: 8 },
  { id: 'mag_frost', name: 'Frostschild', description: '+10% CC', icon: '🧊', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'mag_ice', category: 'defense', effect: '+10% Verlangsamung', bonusPerLevel: 10 },
  { id: 'mag_mana', name: 'Manareserven', description: '+30 Max-Mana', icon: '💙', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+30 Mana', bonusPerLevel: 30 },
  { id: 'mag_regen', name: 'Meditation', description: '+3 Mana/s', icon: '🧘', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'mag_mana', category: 'defense', effect: '+3 Mana/s', bonusPerLevel: 3 },
  { id: 'mag_teleport', name: 'Teleport', description: 'Schnelle Bewegung', icon: '✨', maxLevel: 1, currentLevel: 0, cost: 3, requires: 'mag_meteor', category: 'utility', effect: 'Teleport', bonusPerLevel: 100 },
  { id: 'mag_crit', name: 'Fokus', description: '+8% Crit', icon: '👁️', maxLevel: 5, currentLevel: 0, cost: 2, requires: null, category: 'offense', effect: '+8% Crit', bonusPerLevel: 8 },
  { id: 'mag_xp', name: 'Studium', description: '+15% XP', icon: '📚', maxLevel: 5, currentLevel: 0, cost: 2, requires: null, category: 'utility', effect: '+15% XP', bonusPerLevel: 15 },
];

const ARCHER_NODES: SkillNode[] = [
  { id: 'arc_shot', name: 'Bogenschuss', description: '+10 ATK', icon: '🏹', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'offense', effect: '+10 ATK', bonusPerLevel: 10 },
  { id: 'arc_crit', name: 'Scharfschütze', description: '+5% Crit', icon: '🎯', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'arc_shot', category: 'offense', effect: '+5% Crit', bonusPerLevel: 5 },
  { id: 'arc_multi', name: 'Mehrfachschuss', description: '3 Pfeile', icon: '⬇️', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'arc_crit', category: 'offense', effect: '+2 Pfeile', bonusPerLevel: 2 },
  { id: 'arc_speed', name: 'Schnellläufer', description: '+8% Speed', icon: '🦅', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'utility', effect: '+8% Speed', bonusPerLevel: 8 },
  { id: 'arc_dodge', name: 'Ausweichen', description: '+5% Ausweichen', icon: '💨', maxLevel: 5, currentLevel: 0, cost: 2, requires: 'arc_speed', category: 'defense', effect: '+5% Ausweichen', bonusPerLevel: 5 },
  { id: 'arc_hp', name: 'Ausdauer', description: '+30 Max-HP', icon: '❤️', maxLevel: 10, currentLevel: 0, cost: 1, requires: null, category: 'defense', effect: '+30 HP', bonusPerLevel: 30 },
  { id: 'arc_evade', name: 'Schatten', description: 'Unsichtbar', icon: '👻', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'arc_dodge', category: 'defense', effect: '+20% DMG Red', bonusPerLevel: 20 },
  { id: 'arc_range', name: 'Fernsicht', description: '+3 Range', icon: '🔭', maxLevel: 5, currentLevel: 0, cost: 2, requires: null, category: 'offense', effect: '+3 Range', bonusPerLevel: 3 },
  { id: 'arc_gold', name: 'Jagdprämie', description: '+20% Gold', icon: '💰', maxLevel: 5, currentLevel: 0, cost: 2, requires: null, category: 'utility', effect: '+20% Gold', bonusPerLevel: 20 },
  { id: 'arc_crit_dmg', name: 'Kopfschuss', description: '+20% Crit DMG', icon: '💀', maxLevel: 3, currentLevel: 0, cost: 3, requires: 'arc_multi', category: 'offense', effect: '+20% Crit', bonusPerLevel: 20 },
];

function getNodesForClass(playerClass: PlayerClass | null): SkillNode[] {
  switch (playerClass) {
    case 'warrior': return WARRIOR_NODES.map(n => ({ ...n }));
    case 'mage': return MAGE_NODES.map(n => ({ ...n }));
    case 'archer': return ARCHER_NODES.map(n => ({ ...n }));
    default: return WARRIOR_NODES.map(n => ({ ...n }));
  }
}

export const useSkillTreeStore = create<SkillTreeState>()(
  persist(
    (set, get) => ({
      skillPoints: 0,
      nodes: getNodesForClass(null),

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
            if (n.category === 'offense') attackBonus += n.currentLevel * n.bonusPerLevel;
            if (n.category === 'defense') {
              if (n.id.includes('mana')) manaBonus += n.currentLevel * n.bonusPerLevel;
              else hpBonus += n.currentLevel * n.bonusPerLevel;
              defenseBonus += n.currentLevel * n.bonusPerLevel;
            }
            if (n.category === 'utility') speedBonus += n.currentLevel * n.bonusPerLevel;
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

      resetTreeFully: () => {
        set({
          skillPoints: 0,
          nodes: get().nodes.map(n => ({ ...n, currentLevel: 0 })),
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

export function initSkillTreeForClass(playerClass: PlayerClass) {
  const newNodes = getNodesForClass(playerClass);
  useSkillTreeStore.setState({
    skillPoints: 0,
    nodes: newNodes,
  });
  applySkillBonuses();
}

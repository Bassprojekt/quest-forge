import { create } from 'zustand';
import { playSwordSlash, playMagicCast, playArrowShoot, playLevelUp, playHitSound, playPotionDrink } from '@/hooks/useSound';
import { useSkillTreeStore } from './skillTreeStore';

export type ZoneType = 'hub' | 'grasslands' | 'mushroom_forest' | 'frozen_peaks' | 'lava_caverns' | 'coral_reef' | 'shadow_swamp' | 'crystal_highlands' | 'void_nexus';
export type PlayerClass = 'warrior' | 'mage' | 'archer' | null;

export interface Enemy {
  id: string;
  position: [number, number, number];
  hp: number;
  maxHp: number;
  alive: boolean;
  name: string;
  xpReward: number;
  goldReward: number;
  zone: ZoneType;
}

export interface Skill {
  id: string;
  name: string;
  key: string;
  cooldown: number;
  lastUsed: number;
  manaCost: number;
  description: string;
  icon: string;
}

export interface Pet {
  id: string;
  name: string;
  bonus: string;
  bonusValue: number;
  bonusType: 'damage' | 'speed' | 'defense' | 'heal';
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
  equipped: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  stat: string;
  value: number;
  price: number;
  owned: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  icon: string;
  stat: string;
  value: number;
  equipped: boolean;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DamagePopup {
  id: string;
  position: [number, number, number];
  amount: number;
  type: 'damage' | 'heal' | 'xp' | 'gold' | 'crit';
  timestamp: number;
}

export interface ZoneInfo {
  id: ZoneType;
  name: string;
  requiredLevel: number;
  color: string;
  center: [number, number];
  radius: number;
  skyColor: string;
  groundColor: string;
}

export const ZONES: ZoneInfo[] = [
  { id: 'grasslands', name: 'Grüne Wiesen', requiredLevel: 1, color: '#4caf50', center: [120, 0], radius: 100, skyColor: '#87CEEB', groundColor: '#6DBE6D' },
  { id: 'mushroom_forest', name: 'Pilzwald', requiredLevel: 10, color: '#9C27B0', center: [280, 100], radius: 120, skyColor: '#9966CC', groundColor: '#4A3728' },
  { id: 'frozen_peaks', name: 'Frostgipfel', requiredLevel: 20, color: '#00BCD4', center: [480, 0], radius: 140, skyColor: '#B0E0E6', groundColor: '#E8F4F8' },
  { id: 'lava_caverns', name: 'Lavahöhlen', requiredLevel: 30, color: '#FF5722', center: [680, 120], radius: 150, skyColor: '#FF4500', groundColor: '#2D1B1B' },
  { id: 'coral_reef', name: 'Korallenriff', requiredLevel: 40, color: '#E91E63', center: [900, 0], radius: 140, skyColor: '#87CEEB', groundColor: '#2F4F4F' },
  { id: 'shadow_swamp', name: 'Schattensumpf', requiredLevel: 50, color: '#607D8B', center: [1150, 150], radius: 160, skyColor: '#4A5568', groundColor: '#2D3436' },
  { id: 'crystal_highlands', name: 'Kristallhochland', requiredLevel: 60, color: '#00E5FF', center: [1400, 0], radius: 180, skyColor: '#E0FFFF', groundColor: '#B0C4DE' },
  { id: 'void_nexus', name: 'Void Nexus', requiredLevel: 70, color: '#7B1FA2', center: [1700, 200], radius: 200, skyColor: '#1A0A2E', groundColor: '#0D0221' },
];

const CLASS_SKILLS: Record<string, Skill[]> = {
  warrior: [
    { id: 'whirlwind', name: 'Wirbelschlag', key: 'Q', cooldown: 4, lastUsed: -999, manaCost: 15, description: 'AoE-Schwertangriff', icon: '🌪️' },
    { id: 'shield', name: 'Eisenschild', key: 'E', cooldown: 10, lastUsed: -999, manaCost: 20, description: '3 Sek. Schutzschild', icon: '🛡️' },
    { id: 'dash', name: 'Sturmangriff', key: 'SHIFT', cooldown: 5, lastUsed: -999, manaCost: 10, description: 'Schneller Vorstoß', icon: '⚔️' },
  ],
  mage: [
    { id: 'fireball', name: 'Feuerball', key: 'Q', cooldown: 2, lastUsed: -999, manaCost: 12, description: 'Fernkampf-Feuerball', icon: '🔥' },
    { id: 'icewall', name: 'Eisschild', key: 'E', cooldown: 12, lastUsed: -999, manaCost: 25, description: '3 Sek. Frostbarriere', icon: '❄️' },
    { id: 'blink', name: 'Teleport', key: 'SHIFT', cooldown: 6, lastUsed: -999, manaCost: 18, description: 'Kurze Teleportation', icon: '✨' },
  ],
  archer: [
    { id: 'multishot', name: 'Mehrfachschuss', key: 'Q', cooldown: 3, lastUsed: -999, manaCost: 10, description: '3 Pfeile auf einmal', icon: '🏹' },
    { id: 'dodge', name: 'Ausweichen', key: 'E', cooldown: 8, lastUsed: -999, manaCost: 15, description: '2 Sek. Unverwundbar', icon: '💨' },
    { id: 'dash', name: 'Schnellschritt', key: 'SHIFT', cooldown: 4, lastUsed: -999, manaCost: 8, description: 'Schneller Rückzug', icon: '🦅' },
  ],
};

function generateEnemies(zone: ZoneType, baseLv: number): Enemy[] {
  const zoneInfo = ZONES.find(z => z.id === zone);
  if (!zoneInfo) return [];
  
  const zoneEnemyDefs: Record<string, { names: string[]; hpMult: number[] }> = {
    grasslands: { names: ['Zombie', 'Pilzling', 'Blauer Schleim', 'Riesenbiene', 'Haustier Schnecke'], hpMult: [0.8, 1, 1.6, 2.4, 0.5] },
    mushroom_forest: { names: ['Sporenpilz', 'Giftwurm', 'Pilzgolem'], hpMult: [1, 1.5, 2.5] },
    frozen_peaks: { names: ['Eiskobold', 'Frostwolf', 'Eisriese'], hpMult: [1, 1.5, 3] },
    lava_caverns: { names: ['Magmaschleimer', 'Feuerdämon', 'Lavawurm'], hpMult: [1, 1.8, 3] },
    coral_reef: { names: ['Quallenfisch', 'Krabbenkrieger', 'Tiefseeschlange'], hpMult: [1, 1.6, 2.8] },
    shadow_swamp: { names: ['Zombie', 'Skelett', 'Creeper', 'Enderman', 'Sumpfkröte', 'Nebelwandler'], hpMult: [0.7, 0.8, 0.9, 1.0, 1.5, 3] },
    crystal_highlands: { names: ['Kristallgolem', 'Prismadrache', 'Edelsteinkäfer'], hpMult: [1, 2, 3.5] },
    void_nexus: { names: ['Voidwalker', 'Chaosphantom', 'Nihilschlund'], hpMult: [1.5, 2.5, 4] },
  };
  const def = zoneEnemyDefs[zone];
  if (!def) return [];
  const enemies: Enemy[] = [];
  const baseHp = 20 + baseLv * 8;
  const baseXp = 10 + baseLv * 5;
  const baseGold = 5 + baseLv * 3;
  def.names.forEach((name, ni) => {
    const count = ni === 2 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 12;
      const worldX = Math.cos(angle) * radius;
      const worldZ = Math.sin(angle) * radius;
      enemies.push({
        id: `${zone}-${name}-${i}-${Date.now()}-${Math.random()}`,
        position: [worldX, 0.5, worldZ],
        hp: Math.floor(baseHp * def.hpMult[ni]),
        maxHp: Math.floor(baseHp * def.hpMult[ni]),
        alive: true,
        name,
        xpReward: Math.floor(baseXp * def.hpMult[ni]),
        goldReward: Math.floor(baseGold * def.hpMult[ni]),
        zone,
      });
    }
  });
  return enemies;
}

const ALL_ENEMIES: Enemy[] = ZONES.flatMap(z => generateEnemies(z.id, z.requiredLevel));

export interface GameState {
  playerClass: PlayerClass;
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  playerMaxMana: number;
  playerXp: number;
  playerXpToLevel: number;
  playerLevel: number;
  playerPosition: [number, number, number];
  playerAttackPower: number;
  playerGold: number;
  playerDefense: number;
  playerSpeed: number;
  skills: Skill[];
  activeSkill: string | null;
  shieldActive: boolean;
  dashActive: boolean;
  laserTarget: [number, number, number] | null;
  enemies: Enemy[];
  isAttacking: boolean;
  targetEnemyId: string | null;
  autoMoveTarget: [number, number, number] | null;
  autoMoveEnemyId: string | null;
  currentZone: ZoneType;
  autoFight: boolean;
  autoRespawn: boolean;
  isUIOpen: boolean;
  showSaveIndicator: boolean;
  weather: 'sunny' | 'rainy' | 'foggy';
  shopItems: ShopItem[];
  pets: Pet[];
  inventory: InventoryItem[];
  damagePopups: DamagePopup[];
  levelUpEffect: boolean;
  hitEffectPos: [number, number, number] | null;
  comboCount: number;
  comboTimer: number;
  timeOfDay: number;
  achievements: string[];
  totalKills: number;
  totalGoldEarned: number;
  totalDamageDealt: number;

  setPlayerClass: (c: PlayerClass) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  attackEnemy: (id: string) => void;
  takeDamage: (amount: number) => void;
  setPlayerHp: (amount: number) => void;
  setPlayerMana: (amount: number) => void;
  respawnEnemies: () => void;
  setTargetEnemy: (id: string | null) => void;
  setIsAttacking: (v: boolean) => void;
  setAutoMoveTarget: (pos: [number, number, number] | null, enemyId: string | null) => void;
  useSkill: (skillId: string) => void;
  setActiveSkill: (id: string | null) => void;
  setShieldActive: (v: boolean) => void;
  setDashActive: (v: boolean) => void;
  setLaserTarget: (pos: [number, number, number] | null) => void;
  setCurrentZone: (zone: ZoneType) => void;
  advanceToNextZone: () => void;
  respawnPlayer: () => void;
  resetGame: () => void;
  buyItem: (itemId: string) => boolean;
  buyPet: (petId: string) => boolean;
  equipPet: (petId: string) => void;
  addGold: (amount: number) => void;
  equipItem: (itemId: string) => void;
  usePotion: (itemId: string) => void;
  addToInventory: (item: Omit<InventoryItem, 'equipped'>) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  removeDamagePopup: (id: string) => void;
  addDamagePopup: (popup: Omit<DamagePopup, 'timestamp'>) => void;
  clearHitEffect: () => void;
  recalcStats: () => void;
  setAutoFight: (v: boolean) => void;
  setAutoRespawn: (v: boolean) => void;
  setUIOpen: (v: boolean) => void;
  setShowSaveIndicator: (v: boolean) => void;
  setWeather: (weather: 'sunny' | 'rainy' | 'foggy') => void;
  setTimeOfDay: (time: number) => void;
  unlockAchievement: (id: string) => void;
}

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'wpn-1', name: 'Holzschwert', type: 'weapon', stat: '+5 ATK', value: 5, price: 50, owned: false },
  { id: 'wpn-2', name: 'Dolch', type: 'weapon', stat: '+8 ATK', value: 8, price: 80, owned: false },
  { id: 'wpn-3', name: 'Eisenklinge', type: 'weapon', stat: '+12 ATK', value: 12, price: 120, owned: false },
  { id: 'wpn-4', name: 'Kampfaxt', type: 'weapon', stat: '+18 ATK', value: 18, price: 200, owned: false },
  { id: 'wpn-5', name: 'Flammenbrecher', type: 'weapon', stat: '+25 ATK', value: 25, price: 300, owned: false },
  { id: 'wpn-6', name: 'Frostklinge', type: 'weapon', stat: '+35 ATK', value: 35, price: 500, owned: false },
  { id: 'wpn-7', name: 'Blitzschwert', type: 'weapon', stat: '+45 ATK', value: 45, price: 650, owned: false },
  { id: 'wpn-8', name: 'Kristallschwert', type: 'weapon', stat: '+50 ATK', value: 50, price: 800, owned: false },
  { id: 'wpn-9', name: 'Schattenklinge', type: 'weapon', stat: '+70 ATK', value: 70, price: 1200, owned: false },
  { id: 'wpn-10', name: 'Drachenklinge', type: 'weapon', stat: '+85 ATK', value: 85, price: 1500, owned: false },
  { id: 'wpn-11', name: 'Voidklinge', type: 'weapon', stat: '+100 ATK', value: 100, price: 2000, owned: false },
  { id: 'arm-1', name: 'Lederrüstung', type: 'armor', stat: '+5 DEF', value: 5, price: 40, owned: false },
  { id: 'arm-2', name: 'Kettenhemd', type: 'armor', stat: '+10 DEF', value: 10, price: 80, owned: false },
  { id: 'arm-3', name: 'Plattenrüstung', type: 'armor', stat: '+15 DEF', value: 15, price: 150, owned: false },
  { id: 'arm-4', name: 'Sturmrüstung', type: 'armor', stat: '+22 DEF', value: 22, price: 300, owned: false },
  { id: 'arm-5', name: 'Frostrüstung', type: 'armor', stat: '+28 DEF', value: 28, price: 450, owned: false },
  { id: 'arm-6', name: 'Drachenrüstung', type: 'armor', stat: '+35 DEF', value: 35, price: 600, owned: false },
  { id: 'arm-7', name: 'Schattenrüstung', type: 'armor', stat: '+50 DEF', value: 50, price: 1000, owned: false },
  { id: 'arm-8', name: 'Voidrüstung', type: 'armor', stat: '+70 DEF', value: 70, price: 1500, owned: false },
  { id: 'arm-9', name: 'Legendäre Rüstung', type: 'armor', stat: '+100 DEF', value: 100, price: 2500, owned: false },
  { id: 'pot-1', name: 'Kleiner HP-Trank', type: 'potion', stat: '+30 HP', value: 30, price: 25, owned: false },
  { id: 'pot-2', name: 'Mittlerer HP-Trank', type: 'potion', stat: '+80 HP', value: 80, price: 60, owned: false },
  { id: 'pot-3', name: 'Großer HP-Trank', type: 'potion', stat: '+150 HP', value: 150, price: 120, owned: false },
  { id: 'pot-4', name: 'Kleiner MP-Trank', type: 'potion', stat: '+20 MP', value: 20, price: 30, owned: false },
  { id: 'pot-5', name: 'Mittlerer MP-Trank', type: 'potion', stat: '+50 MP', value: 50, price: 75, owned: false },
];

const INITIAL_PETS: Pet[] = [
  { id: 'pet-wolf', name: 'Baby Wolf', bonus: '+10% Schaden', bonusValue: 0.1, bonusType: 'damage', price: 80, rarity: 'common', owned: false, equipped: false },
  { id: 'pet-cat', name: 'Flauschkatze', bonus: '+15% Speed', bonusValue: 0.15, bonusType: 'speed', price: 100, rarity: 'rare', owned: false, equipped: false },
  { id: 'pet-dragon', name: 'Mini Drache', bonus: '+20% Schaden', bonusValue: 0.2, bonusType: 'damage', price: 250, rarity: 'epic', owned: false, equipped: false },
  { id: 'pet-phoenix', name: 'Goldener Phönix', bonus: '+25% Defense', bonusValue: 0.25, bonusType: 'defense', price: 500, rarity: 'legendary', owned: false, equipped: false },
  { id: 'pet-knight', name: 'Ritter Baldur', bonus: '+30% Defense', bonusValue: 0.3, bonusType: 'defense', price: 1500, rarity: 'epic', owned: false, equipped: false },
  { id: 'pet-priestess', name: 'Priesterin Aria', bonus: '+20 HP/5s', bonusValue: 20, bonusType: 'heal', price: 1200, rarity: 'epic', owned: false, equipped: false },
  { id: 'pet-ranger', name: 'Waldläufer Finn', bonus: '+35% Schaden', bonusValue: 0.35, bonusType: 'damage', price: 2000, rarity: 'legendary', owned: false, equipped: false },
  { id: 'pet-wizard', name: 'Zauberer Merlin', bonus: '+40% Schaden', bonusValue: 0.4, bonusType: 'damage', price: 3000, rarity: 'legendary', owned: false, equipped: false },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'pot-hp-small', name: 'Kleiner HP Trank', type: 'potion', icon: '🧪', stat: '+30 HP', value: 30, equipped: false, quantity: 3, rarity: 'common' },
  { id: 'pot-hp-medium', name: 'Mittlerer HP Trank', type: 'potion', icon: '🧪', stat: '+80 HP', value: 80, equipped: false, quantity: 2, rarity: 'rare' },
  { id: 'pot-hp-large', name: 'Großer HP Trank', type: 'potion', icon: '🧪', stat: '+150 HP', value: 150, equipped: false, quantity: 1, rarity: 'epic' },
  { id: 'pot-mana-small', name: 'Kleiner MP Trank', type: 'potion', icon: '💧', stat: '+25 MP', value: 25, equipped: false, quantity: 2, rarity: 'common' },
  { id: 'pot-mana-medium', name: 'Mittlerer MP Trank', type: 'potion', icon: '💧', stat: '+50 MP', value: 50, equipped: false, quantity: 1, rarity: 'rare' },
  { id: 'pot-speed', name: 'Speed Trank', type: 'potion', icon: '⚡', stat: '+20% Speed 30s', value: 20, equipped: false, quantity: 1, rarity: 'rare' },
  { id: 'starter-sword', name: 'Rostiges Schwert', type: 'weapon', icon: '⚔️', stat: '+3 ATK', value: 3, equipped: true, quantity: 1, rarity: 'common' },
  { id: 'starter-armor', name: 'Leinentuch', type: 'armor', icon: '🛡️', stat: '+2 DEF', value: 2, equipped: true, quantity: 1, rarity: 'common' },
];

let popupIdCounter = 0;

export const useGameStore = create<GameState>((set, get) => ({
  playerClass: null,
  playerHp: 100,
  playerMaxHp: 100,
  playerMana: 50,
  playerMaxMana: 50,
  playerXp: 0,
  playerXpToLevel: 100,
  playerLevel: 1,
  playerPosition: [0, 0, 0],
  playerAttackPower: 15,
  playerGold: 50,
  playerDefense: 0,
  playerSpeed: 8,
  skills: [],
  activeSkill: null,
  shieldActive: false,
  dashActive: false,
  laserTarget: null,
  enemies: ALL_ENEMIES.map(e => ({ ...e })),
  isAttacking: false,
  targetEnemyId: null,
  autoMoveTarget: null,
  autoMoveEnemyId: null,
  currentZone: 'hub',
  shopItems: INITIAL_SHOP_ITEMS.map(i => ({ ...i })),
  pets: INITIAL_PETS.map(p => ({ ...p })),
  inventory: INITIAL_INVENTORY.map(i => ({ ...i })),
  damagePopups: [],
  levelUpEffect: false,
  hitEffectPos: null,
  autoFight: false,
  autoRespawn: true,
  isUIOpen: false,
  showSaveIndicator: false,
  weather: 'sunny',
  comboCount: 0,
  comboTimer: 0,
  timeOfDay: 0.5,
  achievements: [],
  totalKills: 0,
  totalGoldEarned: 0,
  totalDamageDealt: 0,

  setPlayerClass: (c) => {
    const skills = c ? (CLASS_SKILLS[c] || []).map(s => ({ ...s })) : [];
    set({ playerClass: c, skills });
  },

  setPlayerPosition: (pos) => {
    set({ playerPosition: pos });
  },

  attackEnemy: (id) => {
    const state = get();
    const pClass = state.playerClass;
    if (pClass === 'mage') playMagicCast();
    else if (pClass === 'archer') playArrowShoot();
    else playSwordSlash();

    const equippedPet = state.pets.find(p => p.equipped);
    let bonusDmg = 0;
    if (equippedPet && equippedPet.bonusType === 'damage') {
      bonusDmg = Math.floor(state.playerAttackPower * equippedPet.bonusValue);
    }
    const equippedWeapon = state.inventory.find(i => i.type === 'weapon' && i.equipped);
    const weaponBonus = equippedWeapon ? equippedWeapon.value : 0;
    let totalAtk = state.playerAttackPower + bonusDmg + weaponBonus;
    
    // Combo Damage Bonus (+10% per combo, max +50%)
    const comboBonus = Math.min(state.comboCount * 0.1, 0.5);
    totalAtk = Math.floor(totalAtk * (1 + comboBonus));
    
    const critChance = pClass === 'archer' ? 0.25 : 0.15;
    const isCrit = Math.random() < critChance;
    const critMult = pClass === 'archer' ? 2.0 : 1.5;
    const finalDmg = isCrit ? Math.floor(totalAtk * critMult) : totalAtk;
    
    // Track total damage
    set(s => ({ totalDamageDealt: s.totalDamageDealt + finalDmg, comboTimer: Date.now() }));

    const enemies = state.enemies.map(e => {
      if (e.id !== id || !e.alive) return e;
      const newHp = Math.max(0, e.hp - finalDmg);
      return { ...e, hp: newHp, alive: newHp > 0 };
    });

    const killed = state.enemies.find(e => e.id === id);
    const wasAlive = killed?.alive;
    const nowDead = enemies.find(e => e.id === id)?.alive === false;

    const popups: DamagePopup[] = [...state.damagePopups];
    if (killed) {
      playHitSound();
      popups.push({
        id: `dmg-${popupIdCounter++}`,
        position: [...killed.position] as [number, number, number],
        amount: finalDmg,
        type: isCrit ? 'crit' : 'damage',
        timestamp: Date.now(),
      });
    }

    const hitPos = killed ? [...killed.position] as [number, number, number] : null;

    let xpGain = 0;
    let goldGain = 0;
    if (wasAlive && nowDead && killed) {
      // Level-Gap XP Berechnung
      const enemyLevel = ZONES.find(z => z.id === killed.zone)?.requiredLevel || 1;
      const levelDiff = state.playerLevel - enemyLevel;
      let xpMult = 1;
      let goldMult = 1;
      
      // Wenn Gegner mehr als 10 Level höher ist - weniger XP
      if (levelDiff < -10) {
        xpMult = 0.1;
        goldMult = 0.1;
      } else if (levelDiff < -5) {
        xpMult = 0.3;
        goldMult = 0.4;
      } else if (levelDiff < -2) {
        xpMult = 0.6;
        goldMult = 0.7;
      } else if (levelDiff > 10) {
        xpMult = 1.5;
        goldMult = 1.3;
      }
      
      xpGain = Math.floor(killed.xpReward * xpMult);
      goldGain = Math.floor(killed.goldReward * goldMult);
      
      // Combo erhöhen bei Kill
      const newCombo = Date.now() - state.comboTimer < 5000 ? Math.min(state.comboCount + 1, 5) : 1;
      set({ comboCount: newCombo });
      popups.push({
        id: `xp-${popupIdCounter++}`,
        position: [...killed.position] as [number, number, number],
        amount: xpGain,
        type: 'xp',
        timestamp: Date.now() + 200,
      });
      popups.push({
        id: `gold-${popupIdCounter++}`,
        position: [...killed.position] as [number, number, number],
        amount: goldGain,
        type: 'gold',
        timestamp: Date.now() + 400,
      });
      if (Math.random() < 0.25) {
        const dropTable: InventoryItem[] = [
          { id: `drop-${popupIdCounter++}`, name: 'Kleiner HP Trank', type: 'potion', icon: '🧪', stat: '+30 HP', value: 30, equipped: false, quantity: 1, rarity: 'common' },
          { id: `drop-${popupIdCounter++}`, name: 'Mittlerer HP Trank', type: 'potion', icon: '🧪', stat: '+80 HP', value: 80, equipped: false, quantity: 1, rarity: 'rare' },
        ];
        const drop = dropTable[Math.floor(Math.random() * dropTable.length)];
        const existing = state.inventory.find(i => i.name === drop.name && i.type === 'potion');
        if (existing) {
          set(s => ({ inventory: s.inventory.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i) }));
        } else {
          set(s => ({ inventory: [...s.inventory, drop] }));
        }
      }
    }

    const newXp = state.playerXp + xpGain;
    let newLevel = state.playerLevel;
    let newXpToLevel = state.playerXpToLevel;
    let remainingXp = newXp;
    let didLevelUp = false;

    while (remainingXp >= newXpToLevel) {
      remainingXp -= newXpToLevel;
      newLevel++;
      newXpToLevel = Math.floor(newXpToLevel * 1.5);
      didLevelUp = true;
    }

    if (didLevelUp) {
      playLevelUp();
      useSkillTreeStore.getState().addSkillPoints(2);
    }

    set({
      enemies,
      playerXp: remainingXp,
      playerLevel: newLevel,
      playerXpToLevel: newXpToLevel,
      playerAttackPower: 15 + (newLevel - 1) * 3,
      playerMaxHp: 100 + (newLevel - 1) * 20,
      playerMaxMana: 50 + (newLevel - 1) * 10,
      playerHp: newLevel > state.playerLevel ? 100 + (newLevel - 1) * 20 : state.playerHp,
      playerMana: newLevel > state.playerLevel ? 50 + (newLevel - 1) * 10 : state.playerMana,
      playerGold: state.playerGold + goldGain,
      damagePopups: popups,
      hitEffectPos: hitPos,
      levelUpEffect: didLevelUp,
      totalKills: nowDead ? state.totalKills + 1 : state.totalKills,
      totalGoldEarned: nowDead ? state.totalGoldEarned + goldGain : state.totalGoldEarned,
    });

    if (didLevelUp) setTimeout(() => set({ levelUpEffect: false }), 2000);
    if (hitPos) setTimeout(() => set({ hitEffectPos: null }), 300);
    setTimeout(() => {
      set(s => ({ damagePopups: s.damagePopups.filter(p => Date.now() - p.timestamp < 1500) }));
    }, 1600);
  },

  takeDamage: (amount) => {
    const state = get();
    if (amount < 0) {
      const healAmount = Math.abs(amount);
      set(s => ({ playerHp: Math.min(s.playerMaxHp, s.playerHp + healAmount) }));
      return;
    }
    const equippedPet = state.pets.find(p => p.equipped);
    const equippedArmor = state.inventory.find(i => i.type === 'armor' && i.equipped);
    let reduction = state.playerDefense + (equippedArmor ? equippedArmor.value : 0);
    if (equippedPet && equippedPet.bonusType === 'defense') reduction += Math.floor(amount * equippedPet.bonusValue);
    if (state.shieldActive) reduction += Math.floor(amount * 0.7);
    const finalDmg = Math.max(1, amount - reduction);
    set(s => ({ playerHp: Math.max(0, s.playerHp - finalDmg) }));
  },

  setPlayerHp: (amount: number) => {
    set(s => ({ playerHp: Math.min(s.playerMaxHp, Math.max(0, amount)) }));
  },

  setPlayerMana: (amount: number) => {
    set(s => ({ playerMana: Math.min(s.playerMaxMana, Math.max(0, amount)) }));
  },

  respawnEnemies: () => {
    const zone = get().currentZone;
    const zoneInfo = ZONES.find(z => z.id === zone);
    if (!zoneInfo) return;
    const freshEnemies = generateEnemies(zone, zoneInfo.requiredLevel);
    set(s => ({ enemies: [...s.enemies.filter(e => e.zone !== zone), ...freshEnemies] }));
  },

  setTargetEnemy: (id) => set({ targetEnemyId: id }),
  setIsAttacking: (v) => set({ isAttacking: v }),
  setAutoMoveTarget: (pos, enemyId) => set({ autoMoveTarget: pos, autoMoveEnemyId: enemyId }),

  useSkill: (skillId) => {
    const state = get();
    const now = performance.now() / 1000;
    const skills = state.skills.map(s => {
      if (s.id !== skillId) return s;
      if (now - s.lastUsed < s.cooldown) return s;
      return { ...s, lastUsed: now };
    });
    set({ skills });
  },

  setActiveSkill: (id) => set({ activeSkill: id }),
  setShieldActive: (v) => set({ shieldActive: v }),
  setDashActive: (v) => set({ dashActive: v }),
  setLaserTarget: (pos) => set({ laserTarget: pos }),
  setCurrentZone: (zone) => {
    const zoneInfo = ZONES.find(z => z.id === zone);
    if (zone === 'hub') {
      set({ 
        currentZone: 'hub', 
        playerPosition: [0, 0, 0],
        enemies: []
      });
      return;
    }
    if (!zoneInfo) return;
    const freshEnemies = generateEnemies(zone, zoneInfo.requiredLevel);
    set({ 
      currentZone: zone, 
      playerPosition: [0, 0, 0],
      enemies: freshEnemies
    });
  },
  
  calculateZoneFromPosition: (x: number, z: number): ZoneType => {
    const distToHub = Math.sqrt(x * x + z * z);
    if (distToHub < 50) return 'hub';
    
    for (const zone of ZONES) {
      const dx = x - zone.center[0];
      const dz = z - zone.center[1];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < zone.radius) {
        return zone.id;
      }
    }
    return 'hub';
  },
  
  respawnPlayer: () => {
    const state = get();
    const healAmount = Math.floor(state.playerMaxHp * 0.5);
    set({ 
      playerHp: healAmount, 
      currentZone: 'hub', 
      playerPosition: [0, 0, 0] 
    });
  },

  resetGame: () => {
    set({
      playerHp: 100,
      playerMaxHp: 100,
      playerMana: 100,
      playerMaxMana: 100,
      playerXp: 0,
      playerXpToLevel: 100,
      playerLevel: 1,
      playerGold: 50,
      playerAttackPower: 10,
      playerDefense: 0,
      currentZone: 'hub',
      playerPosition: [0, 0, 0],
      enemies: [],
      inventory: [],
      autoFight: false,
      autoRespawn: true,
    });
  },

  advanceToNextZone: () => {
    const state = get();
    const currentIndex = ZONES.findIndex(z => z.id === state.currentZone);
    if (currentIndex < ZONES.length - 1) {
      const nextZone = ZONES[currentIndex + 1];
      const freshEnemies = generateEnemies(nextZone.id, nextZone.requiredLevel);
      set({ 
        currentZone: nextZone.id, 
        playerPosition: [0, 0, 0],
        enemies: freshEnemies
      });
    }
  },

  setShopOpen: () => {},

  buyItem: (itemId) => {
    const state = get();
    const item = state.shopItems.find(i => i.id === itemId);
    if (!item || item.owned || state.playerGold < item.price) return false;
    const shopItems = state.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i);
    const invItem: InventoryItem = {
      id: `inv-${item.id}`,
      name: item.name,
      type: item.type,
      icon: item.type === 'weapon' ? '⚔️' : '🛡️',
      stat: item.stat,
      value: item.value,
      equipped: false,
      quantity: 1,
      rarity: item.price >= 800 ? 'legendary' : item.price >= 300 ? 'epic' : item.price >= 100 ? 'rare' : 'common',
    };
    set({ shopItems, playerGold: state.playerGold - item.price, inventory: [...state.inventory, invItem] });
    return true;
  },

  buyPet: (petId) => {
    const state = get();
    const pet = state.pets.find(p => p.id === petId);
    if (!pet || pet.owned || state.playerGold < pet.price) return false;
    set({ pets: state.pets.map(p => p.id === petId ? { ...p, owned: true } : p), playerGold: state.playerGold - pet.price });
    return true;
  },

  equipPet: (petId) => {
    set(s => ({
      pets: s.pets.map(p => ({ ...p, equipped: p.id === petId && p.owned ? !p.equipped : (p.id === petId ? p.equipped : false) })),
    }));
  },

  addGold: (amount) => set(s => ({ playerGold: s.playerGold + amount })),

  equipItem: (itemId) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || item.type === 'potion') return;
    set({
      inventory: state.inventory.map(i => {
        if (i.type === item.type && i.id !== itemId) return { ...i, equipped: false };
        if (i.id === itemId) return { ...i, equipped: !i.equipped };
        return i;
      }),
    });
  },

  usePotion: (itemId) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId && i.type === 'potion');
    if (!item || item.quantity <= 0) return;
    playPotionDrink();

    const newInventory = state.inventory.map(i => {
      if (i.id !== itemId) return i;
      return { ...i, quantity: i.quantity - 1 };
    }).filter(i => i.type !== 'potion' || i.quantity > 0);

    let newPlayerHp = state.playerHp;
    let newPlayerMana = state.playerMana;
    let newPlayerSpeed = state.playerSpeed;
    let popupType: 'heal' | 'damage' = 'heal';
    let popupAmount = 0;

    if (item.name.includes('MP') || item.name.includes('Mana')) {
      newPlayerMana = Math.min(state.playerMaxMana, state.playerMana + item.value);
      popupType = 'heal';
      popupAmount = item.value;
    } else if (item.name.includes('Speed')) {
      newPlayerSpeed = state.playerSpeed * (1 + item.value / 100);
      popupType = 'heal';
      popupAmount = Math.round(newPlayerSpeed - state.playerSpeed);
      setTimeout(() => {
        set(s => ({ playerSpeed: s.playerSpeed / (1 + item.value / 100) }));
      }, 30000);
    } else {
      newPlayerHp = Math.min(state.playerMaxHp, state.playerHp + item.value);
      popupAmount = item.value;
    }

    set({
      playerHp: newPlayerHp,
      playerMana: newPlayerMana,
      playerSpeed: newPlayerSpeed,
      inventory: newInventory,
damagePopups: [...state.damagePopups, {
        id: `heal-${popupIdCounter++}`,
        position: state.playerPosition,
        amount: popupAmount,
        type: 'heal',
        timestamp: Date.now(),
      }],
    });
  },

  addToInventory: (item) => {
    const state = get();
    if (item.type === 'potion') {
      const existing = state.inventory.find(i => i.name === item.name && i.type === 'potion');
      if (existing) {
        set({ inventory: state.inventory.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i) });
        return;
      }
    }
    set({ inventory: [...state.inventory, { ...item, equipped: false }] });
  },

  removeFromInventory: (itemId, quantity) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.quantity <= quantity) {
      set({ inventory: state.inventory.filter(i => i.id !== itemId) });
    } else {
      set({ inventory: state.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i) });
    }
  },

  removeDamagePopup: (id) => set(s => ({ damagePopups: s.damagePopups.filter(p => p.id !== id) })),
  
  addDamagePopup: (popup) => set(s => ({ 
    damagePopups: [...s.damagePopups, { ...popup, timestamp: Date.now() }] 
  })),
  
  clearHitEffect: () => set({ hitEffectPos: null }),

  recalcStats: () => {
    const state = get();
    const equippedWeapons = state.inventory.filter(i => i.type === 'weapon' && i.equipped);
    const equippedArmors = state.inventory.filter(i => i.type === 'armor' && i.equipped);
    const atkBonus = equippedWeapons.reduce((a, i) => a + i.value, 0);
    const defBonus = equippedArmors.reduce((a, i) => a + i.value, 0);
    set({
      playerAttackPower: 15 + (state.playerLevel - 1) * 3 + atkBonus,
      playerDefense: defBonus,
    });
  },

  setAutoFight: (v) => set({ autoFight: v }),
  setAutoRespawn: (v) => set({ autoRespawn: v }),
  setUIOpen: (v) => set({ isUIOpen: v }),
  setShowSaveIndicator: (v) => set({ showSaveIndicator: v }),
  setWeather: (weather) => set({ weather }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  unlockAchievement: (id) => set(s => ({ achievements: s.achievements.includes(id) ? s.achievements : [...s.achievements, id] })),
}));

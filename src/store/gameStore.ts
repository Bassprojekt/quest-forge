import { create } from 'zustand';
import { playSwordSlash, playMagicCast, playArrowShoot, playLevelUp, playHitSound, playPotionDrink } from '@/hooks/useSound';
import { useSkillTreeStore } from './skillTreeStore';
import { useQuestStore } from './questStore';

export type ZoneType = 'hub' | 'grasslands' | 'mushroom_forest' | 'frozen_peaks' | 'lava_caverns' | 'coral_reef' | 'shadow_swamp' | 'crystal_highlands' | 'void_nexus' | 'dragon_lair' | 'enchanted_forest' | 'floating_islands' | 'abyss' | 'celestial_plains' | 'shadow_realm' | 'pvp_arena' | 'raid_dungeon' | 'arena_colosseum';
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
  isBoss?: boolean;
  specialAbility?: string;
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
  bonusType: 'damage' | 'speed' | 'defense' | 'heal' | 'crit';
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
  equipped: boolean;
  level: number;
  xp: number;
  evolvedFrom: string | null;
  maxLevel: number;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'cosmetic';
  stat: string;
  value: number;
  price: number;
  owned: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'material' | 'cosmetic';
  icon: string;
  stat: string;
  value: number;
  equipped: boolean;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GroundItem {
  id: string;
  name: string;
  type: 'potion' | 'material';
  icon: string;
  value: number;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  position: [number, number, number];
  timestamp: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  icon: string;
  stat: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  ingredients: { name: string; quantity: number }[];
}

export interface DamagePopup {
  id: string;
  position: [number, number, number];
  amount: number;
  type: 'damage' | 'heal' | 'xp' | 'gold' | 'crit' | 'gem';
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
  { id: 'dragon_lair', name: 'Drachenhöhle', requiredLevel: 80, color: '#D32F2F', center: [2000, 100], radius: 220, skyColor: '#8B0000', groundColor: '#1A0A0A' },
  { id: 'enchanted_forest', name: 'Verzauberter Wald', requiredLevel: 90, color: '#388E3C', center: [2300, 0], radius: 240, skyColor: '#228B22', groundColor: '#0D3D0D' },
  { id: 'floating_islands', name: 'Schwebende Inseln', requiredLevel: 100, color: '#7B1FA2', center: [2600, 150], radius: 260, skyColor: '#4A148C', groundColor: '#1A0A2E' },
  { id: 'abyss', name: 'Die Abgründe', requiredLevel: 110, color: '#212121', center: [2900, 100], radius: 280, skyColor: '#0A0A0A', groundColor: '#1A1A1A' },
  { id: 'celestial_plains', name: 'Himmelsfelder', requiredLevel: 120, color: '#FFD700', center: [3100, 50], radius: 300, skyColor: '#FFE4B5', groundColor: '#FFF8DC' },
  { id: 'shadow_realm', name: 'Schattenreich', requiredLevel: 130, color: '#4A0080', center: [3400, 150], radius: 320, skyColor: '#1A0030', groundColor: '#0D001A' },
  { id: 'pvp_arena', name: 'PvP Arena', requiredLevel: 1, color: '#FF0000', center: [0, 0], radius: 50, skyColor: '#330000', groundColor: '#4A0000' },
  { id: 'raid_dungeon', name: 'Raid Dungeon', requiredLevel: 50, color: '#9C27B0', center: [3200, 0], radius: 150, skyColor: '#1A0000', groundColor: '#2A0A2A' },
  { id: 'arena_colosseum', name: 'Arena Kolosseum', requiredLevel: 30, color: '#FF0000', center: [3100, 100], radius: 100, skyColor: '#330000', groundColor: '#4A0000' },
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
  
  const zoneEnemyDefs: Record<string, { names: string[]; hpMult: number[]; bosses: string[] }> = {
    grasslands: { names: ['Zombie', 'Pilzling', 'Blauer Schleim', 'Riesenbiene', 'Haustier Schnecke', 'Waldameise', 'Käfer'], hpMult: [0.8, 1, 1.6, 2.4, 0.5, 0.6, 0.7], bosses: ['König der Wiesen'] },
    mushroom_forest: { names: ['Sporenpilz', 'Giftwurm', 'Pilzgolem', 'Pilzwespe', 'Farnfox'], hpMult: [1, 1.5, 2.5, 1.8, 2.0], bosses: ['Pilzkönig'] },
    frozen_peaks: { names: ['Eiskobold', 'Frostwolf', 'Eisriese', 'Schneejäger', 'Frostgeist'], hpMult: [1, 1.5, 3, 2.0, 2.2], bosses: ['Kältefürst'] },
    lava_caverns: { names: ['Magmaschleimer', 'Feuerdämon', 'Lavawurm', 'Feuerkäfer', 'Glühwurm'], hpMult: [1, 1.8, 3, 2.2, 2.5], bosses: ['Feuerfürst'] },
    coral_reef: { names: ['Quallenfisch', 'Krabbenkrieger', 'Tiefseeschlange', 'Seeigel', 'Seepferdchen'], hpMult: [1, 1.6, 2.8, 1.4, 1.2], bosses: ['Meereskönig'] },
    shadow_swamp: { names: ['Zombie', 'Skelett', 'Creeper', 'Enderman', 'Sumpfkröte', 'Nebelwandler', 'Moosgeist'], hpMult: [0.7, 0.8, 0.9, 1.0, 1.5, 3, 1.3], bosses: ['Schattenfürst'] },
    crystal_highlands: { names: ['Kristallgolem', 'Prismadrache', 'Edelsteinkäfer', 'Glühfee', 'Mineralkrieger'], hpMult: [1, 2, 3.5, 2.5, 3.0], bosses: ['Kristallkönig'] },
    void_nexus: { names: ['Voidwalker', 'Chaosphantom', 'Nihilschlund', 'Schattenrissaner', 'Dunkelpriester'], hpMult: [1.5, 2.5, 4, 3.0, 3.5], bosses: ['Voidlord'] },
    dragon_lair: { names: ['Drachenjäger', 'Feuerdrache', 'Aschekrieger', 'Drachenpriester', 'Lavaelementar'], hpMult: [2, 3, 4, 3.5, 4.5], bosses: ['Drachenfürst'] },
    enchanted_forest: { names: ['Waldgeist', 'Einhorn', 'Feenpriester', 'Feenwolf', 'Baumhirte'], hpMult: [2.5, 3.5, 4.5, 3.0, 4.0], bosses: ['Waldkönigin'] },
    floating_islands: { names: ['Luftgeist', 'Wolkenriese', 'Sturmrufer', 'Windgeist', 'Donnerbock'], hpMult: [3, 4, 5, 4.5, 5.5], bosses: ['Himmelskönig'] },
    abyss: { names: ['Schattendämon', 'Seelenesser', 'Finsternisklinge', 'Abgrundswächter', 'Schatten Leviathan'], hpMult: [3.5, 4.5, 5.5, 5.0, 6.0], bosses: ['Abgrundsherr'] },
    celestial_plains: { names: ['Lichtengel', 'Sternschnuppe', 'Sonnenritter', 'Strahlengeist', 'Himmelswächter'], hpMult: [4, 5, 6, 5.5, 6.5], bosses: ['Sonnenfürst'] },
    shadow_realm: { names: ['Schattenbestie', 'Nachtklinge', 'Dunkelmagier', 'Seelensammler', 'Schatten人流'], hpMult: [4.5, 5.5, 6.5, 6.0, 7.0], bosses: ['Schattenkönig'] },
    pvp_arena: { names: ['Arena-Krieger', 'Gladiator', 'Champion', 'Kampfmaschine', 'Messermönch'], hpMult: [1, 1.5, 2, 2.5, 2.2], bosses: ['Arena-Meister'] },
    raid_dungeon: { names: [' Dunkelwolf', 'Frostriese', 'Feuerdrache', 'Schattenfürst', 'Dämonenlord', 'Nachtmahralt'], hpMult: [1, 1.5, 2, 2.5, 3, 3.5], bosses: ['Dunkelwolf', 'Frostriese', 'Feuerdrache', 'Schattenfürst', 'Dämonenlord'] },
    arena_colosseum: { names: ['Gladiator', 'Schwertkämpfer', 'Bogenschütze', 'Spass', 'Streitkolben', 'Netzkämpfer'], hpMult: [1.2, 1.8, 2.2, 3, 2.5, 2.8], bosses: ['Champion', 'Arena-Meister'] },
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
  
  // Generate boss for this zone
  if (def.bosses && def.bosses.length > 0) {
    const bossName = def.bosses[Math.floor(Math.random() * def.bosses.length)];
    const bossAngle = Math.random() * Math.PI * 2;
    const bossRadius = 15 + Math.random() * 5;
    enemies.push({
      id: `boss-${zone}-${Date.now()}`,
      position: [Math.cos(bossAngle) * bossRadius, 0.5, Math.sin(bossAngle) * bossRadius],
      hp: Math.floor(baseHp * 5),
      maxHp: Math.floor(baseHp * 5),
      alive: true,
      name: bossName,
      xpReward: Math.floor(baseXp * 10),
      goldReward: Math.floor(baseGold * 10),
      zone,
      isBoss: true,
    });
  }
  
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
  playerGems: number;
  playerPetSlots: number;
  lastDailyReward: number;
  playerDefense: number;
  playerSpeed: number;
  playerTitle: string;
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
  autoLoot: boolean;
  isUIOpen: boolean;
  showSaveIndicator: boolean;
  weather: 'sunny' | 'rainy' | 'foggy';
  shopItems: ShopItem[];
  pets: Pet[];
  inventory: InventoryItem[];
  groundItems: GroundItem[];
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
  handleAFKTimeout: () => void;
  resetPosition: () => void;
  resetGame: () => void;
  buyItem: (itemId: string) => boolean;
  buyPet: (petId: string) => boolean;
  equipPet: (petId: string) => void;
  evolvePet: (petId: string) => boolean;
  addPetXp: (petId: string, xp: number) => void;
  addGold: (amount: number) => void;
  addXp: (amount: number) => void;
  setTitle: (title: string) => void;
  addGems: (amount: number) => void;
  unlockPetSlot: () => boolean;
  claimDailyReward: () => boolean;
  equipItem: (itemId: string) => void;
  usePotion: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  craftItem: (recipeId: string) => void;
  addToInventory: (item: Omit<InventoryItem, 'equipped'>) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  spawnGroundItem: (item: Omit<GroundItem, 'id' | 'timestamp'>) => void;
  pickupGroundItem: (itemId: string) => void;
  removeDamagePopup: (id: string) => void;
  addDamagePopup: (popup: Omit<DamagePopup, 'timestamp'>) => void;
  clearHitEffect: () => void;
  recalcStats: () => void;
  setAutoFight: (v: boolean) => void;
  setAutoRespawn: (v: boolean) => void;
  setAutoLoot: (v: boolean) => void;
  setUIOpen: (v: boolean) => void;
  setShowSaveIndicator: (v: boolean) => void;
  setWeather: (weather: 'sunny' | 'rainy' | 'foggy') => void;
  setTimeOfDay: (time: number) => void;
  unlockAchievement: (id: string) => void;
}

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
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
  { id: 'wpn-12', name: 'Abgrundklinge', type: 'weapon', stat: '+130 ATK', value: 130, price: 3500, owned: false },
  { id: 'wpn-13', name: 'Ewige Klinge', type: 'weapon', stat: '+160 ATK', value: 160, price: 5000, owned: false },
  { id: 'wpn-14', name: 'Sternenklinge', type: 'weapon', stat: '+180 ATK', value: 180, price: 6500, owned: false },
  { id: 'wpn-15', name: 'Nebelschwert', type: 'weapon', stat: '+200 ATK', value: 200, price: 8000, owned: false },
  { id: 'wpn-16', name: 'Seelenschneider', type: 'weapon', stat: '+220 ATK', value: 220, price: 10000, owned: false },
  { id: 'wpn-17', name: 'Kosmos-Schwert', type: 'weapon', stat: '+250 ATK', value: 250, price: 15000, owned: false },
  { id: 'arm-1', name: 'Lederrüstung', type: 'armor', stat: '+5 DEF', value: 5, price: 40, owned: false },
  { id: 'arm-2', name: 'Kettenhemd', type: 'armor', stat: '+10 DEF', value: 10, price: 80, owned: false },
  { id: 'arm-3', name: 'Plattenrüstung', type: 'armor', stat: '+15 DEF', value: 15, price: 150, owned: false },
  { id: 'arm-4', name: 'Sturmrüstung', type: 'armor', stat: '+22 DEF', value: 22, price: 300, owned: false },
  { id: 'arm-5', name: 'Frostrüstung', type: 'armor', stat: '+28 DEF', value: 28, price: 450, owned: false },
  { id: 'arm-6', name: 'Drachenrüstung', type: 'armor', stat: '+35 DEF', value: 35, price: 600, owned: false },
  { id: 'arm-7', name: 'Schattenrüstung', type: 'armor', stat: '+50 DEF', value: 50, price: 1000, owned: false },
  { id: 'arm-8', name: 'Voidrüstung', type: 'armor', stat: '+70 DEF', value: 70, price: 1500, owned: false },
  { id: 'arm-9', name: 'Legendäre Rüstung', type: 'armor', stat: '+100 DEF', value: 100, price: 2500, owned: false },
  { id: 'arm-10', name: 'Abgrundrüstung', type: 'armor', stat: '+130 DEF', value: 130, price: 3500, owned: false },
  { id: 'arm-11', name: 'Ewige Rüstung', type: 'armor', stat: '+160 DEF', value: 160, price: 5000, owned: false },
  { id: 'arm-12', name: 'Sternenrüstung', type: 'armor', stat: '+180 DEF', value: 180, price: 6500, owned: false },
  { id: 'arm-13', name: 'Nebelrüstung', type: 'armor', stat: '+200 DEF', value: 200, price: 8000, owned: false },
  { id: 'arm-14', name: 'Seelenrüstung', type: 'armor', stat: '+220 DEF', value: 220, price: 10000, owned: false },
  { id: 'arm-15', name: 'Kosmos-Rüstung', type: 'armor', stat: '+250 DEF', value: 250, price: 15000, owned: false },
  { id: 'pot-1', name: 'Kleiner HP-Trank', type: 'potion', stat: '+30 HP', value: 30, price: 25, owned: false },
  { id: 'pot-2', name: 'Mittlerer HP-Trank', type: 'potion', stat: '+80 HP', value: 80, price: 60, owned: false },
  { id: 'pot-3', name: 'Großer HP-Trank', type: 'potion', stat: '+150 HP', value: 150, price: 120, owned: false },
  { id: 'pot-4', name: 'Kleiner MP-Trank', type: 'potion', stat: '+20 MP', value: 20, price: 30, owned: false },
  { id: 'pot-5', name: 'Mittlerer MP-Trank', type: 'potion', stat: '+50 MP', value: 50, price: 75, owned: false },
  { id: 'pot-6', name: 'Großer MP-Trank', type: 'potion', stat: '+100 MP', value: 100, price: 150, owned: false },
  { id: 'pot-7', name: 'Epischer HP-Trank', type: 'potion', stat: '+300 HP', value: 300, price: 300, owned: false },
  { id: 'pot-8', name: 'Legendärer HP-Trank', type: 'potion', stat: '+500 HP', value: 500, price: 600, owned: false },
  { id: 'pot-9', name: 'Sternen-Trank', type: 'potion', stat: '+750 HP', value: 750, price: 900, owned: false },
  { id: 'pot-10', name: 'Kosmos-Trank', type: 'potion', stat: '+1000 HP', value: 1000, price: 1500, owned: false },
  { id: 'cosm-glow-red', name: 'Roter Glow', type: 'cosmetic', stat: '+10% XP', value: 10, price: 5, owned: false, icon: '🔴' },
  { id: 'cosm-glow-blue', name: 'Blauer Glow', type: 'cosmetic', stat: '+10% XP', value: 10, price: 5, owned: false, icon: '🔵' },
  { id: 'cosm-glow-gold', name: 'Goldener Glow', type: 'cosmetic', stat: '+15% XP', value: 15, price: 10, owned: false, icon: '🟡' },
  { id: 'cosm-glow-purple', name: 'Violetter Glow', type: 'cosmetic', stat: '+20% XP', value: 20, price: 15, owned: false, icon: '🟣' },
  { id: 'cosm-trail-star', name: 'Stern-Spur', type: 'cosmetic', stat: '+25% XP', value: 25, price: 25, owned: false, icon: '⭐' },
  { id: 'cosm-trail-heart', name: 'Herz-Spur', type: 'cosmetic', stat: '+25% XP', value: 25, price: 25, owned: false, icon: '💖' },
  { id: 'cosm-aura-rainbow', name: 'Regenbogen-Aura', type: 'cosmetic', stat: '+50% XP', value: 50, price: 50, owned: false, icon: '🌈' },
  { id: 'cosm-aura-fire', name: 'Feuer-Aura', type: 'cosmetic', stat: '+30% XP', value: 30, price: 35, owned: false, icon: '🔥' },
  { id: 'cosm-aura-ice', name: 'Frost-Aura', type: 'cosmetic', stat: '+30% XP', value: 30, price: 35, owned: false, icon: '❄️' },
  { id: 'cosm-aura-electric', name: 'Blitz-Aura', type: 'cosmetic', stat: '+35% XP', value: 35, price: 40, owned: false, icon: '⚡' },
];

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  { id: 'craft-iron-sword', name: 'Eisenschwert', type: 'weapon', icon: '⚔️', stat: '+10 ATK', value: 10, rarity: 'common', ingredients: [{ name: 'Eisenerz', quantity: 3 }] },
  { id: 'craft-steel-sword', name: 'Stahlschwert', type: 'weapon', icon: '⚔️', stat: '+20 ATK', value: 20, rarity: 'rare', ingredients: [{ name: 'Stahlbarren', quantity: 2 }, { name: 'Eisenerz', quantity: 5 }] },
  { id: 'craft-mithril-sword', name: 'Mithrilschwert', type: 'weapon', icon: '⚔️', stat: '+40 ATK', value: 40, rarity: 'epic', ingredients: [{ name: 'Mithrilbarren', quantity: 3 }, { name: 'Edelstein', quantity: 2 }] },
  { id: 'craft-abyss-sword', name: 'Abgrundsklinge', type: 'weapon', icon: '⚔️', stat: '+60 ATK', value: 60, rarity: 'legendary', ingredients: [{ name: 'Mithrilbarren', quantity: 5 }, { name: 'Edelstein', quantity: 5 }] },
  { id: 'craft-iron-armor', name: 'Eisenrüstung', type: 'armor', icon: '🛡️', stat: '+10 DEF', value: 10, rarity: 'common', ingredients: [{ name: 'Eisenerz', quantity: 5 }] },
  { id: 'craft-steel-armor', name: 'Stahlrüstung', type: 'armor', icon: '🛡️', stat: '+20 DEF', value: 20, rarity: 'rare', ingredients: [{ name: 'Stahlbarren', quantity: 3 }, { name: 'Eisenerz', quantity: 8 }] },
  { id: 'craft-mithril-armor', name: 'Mithrilrüstung', type: 'armor', icon: '🛡️', stat: '+40 DEF', value: 40, rarity: 'epic', ingredients: [{ name: 'Mithrilbarren', quantity: 3 }, { name: 'Edelstein', quantity: 3 }] },
  { id: 'craft-abyss-armor', name: 'Abgrundsrüstung', type: 'armor', icon: '🛡️', stat: '+60 DEF', value: 60, rarity: 'legendary', ingredients: [{ name: 'Mithrilbarren', quantity: 5 }, { name: 'Edelstein', quantity: 5 }] },
  { id: 'craft-health-potion', name: 'Großer HP Trank', type: 'potion', icon: '🧪', stat: '+150 HP', value: 150, rarity: 'common', ingredients: [{ name: 'Heilkräuter', quantity: 3 }] },
  { id: 'craft-mana-potion', name: 'Großer MP Trank', type: 'potion', icon: '🧪', stat: '+100 MP', value: 100, rarity: 'common', ingredients: [{ name: 'Manablüte', quantity: 3 }] },
  { id: 'craft-super-health', name: 'Epischer HP-Trank', type: 'potion', icon: '🧪', stat: '+300 HP', value: 300, rarity: 'epic', ingredients: [{ name: 'Heilkräuter', quantity: 5 }, { name: 'Edelstein', quantity: 1 }] },
  { id: 'craft-legendary-pot', name: 'Legendärer Trank', type: 'potion', icon: '🧪', stat: '+500 HP', value: 500, rarity: 'legendary', ingredients: [{ name: 'Heilkräuter', quantity: 10 }, { name: 'Edelstein', quantity: 3 }] },
];

const INITIAL_PETS: Pet[] = [
  { id: 'pet-wolf', name: 'Baby Wolf', bonus: '+10% Schaden', bonusValue: 0.1, bonusType: 'damage', price: 80, rarity: 'common', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 10 },
  { id: 'pet-wolf-adult', name: 'Erwachsener Wolf', bonus: '+20% Schaden', bonusValue: 0.2, bonusType: 'damage', price: 0, rarity: 'rare', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: 'pet-wolf', maxLevel: 20 },
  { id: 'pet-wolf-alpha', name: 'Alpha Wolf', bonus: '+35% Schaden', bonusValue: 0.35, bonusType: 'damage', price: 0, rarity: 'epic', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: 'pet-wolf-adult', maxLevel: 30 },
  { id: 'pet-cat', name: 'Flauschkatze', bonus: '+15% Speed', bonusValue: 0.15, bonusType: 'speed', price: 100, rarity: 'rare', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 10 },
  { id: 'pet-cat-ninja', name: 'Ninja Katze', bonus: '+25% Speed', bonusValue: 0.25, bonusType: 'speed', price: 0, rarity: 'epic', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: 'pet-cat', maxLevel: 20 },
  { id: 'pet-dragon', name: 'Mini Drache', bonus: '+20% Schaden', bonusValue: 0.2, bonusType: 'damage', price: 250, rarity: 'epic', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 15 },
  { id: 'pet-dragon-elder', name: 'Elder Drache', bonus: '+40% Schaden', bonusValue: 0.4, bonusType: 'damage', price: 0, rarity: 'legendary', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: 'pet-dragon', maxLevel: 30 },
  { id: 'pet-phoenix', name: 'Goldener Phönix', bonus: '+25% Defense', bonusValue: 0.25, bonusType: 'defense', price: 500, rarity: 'legendary', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 20 },
  { id: 'pet-knight', name: 'Ritter Baldur', bonus: '+30% Defense', bonusValue: 0.3, bonusType: 'defense', price: 1500, rarity: 'epic', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 15 },
  { id: 'pet-priestess', name: 'Priesterin Aria', bonus: '+20 HP/10s', bonusValue: 20, bonusType: 'heal', price: 1200, rarity: 'epic', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 15 },
  { id: 'pet-ranger', name: 'Waldläufer Finn', bonus: '+35% Schaden', bonusValue: 0.35, bonusType: 'damage', price: 2000, rarity: 'legendary', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 20 },
  { id: 'pet-wizard', name: 'Zauberer Merlin', bonus: '+40% Schaden', bonusValue: 0.4, bonusType: 'damage', price: 3000, rarity: 'legendary', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 25 },
  { id: 'pet-fairy', name: 'Wald Fee', bonus: '+10% Krit', bonusValue: 0.1, bonusType: 'crit', price: 400, rarity: 'rare', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 10 },
  { id: 'pet-ghost', name: 'Geist Gigi', bonus: '+25% Speed', bonusValue: 0.25, bonusType: 'speed', price: 600, rarity: 'rare', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 15 },
  { id: 'pet-treant', name: 'Treant Torin', bonus: '+35% Defense', bonusValue: 0.35, bonusType: 'defense', price: 2500, rarity: 'legendary', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 20 },
  { id: 'pet-elemental', name: 'Elementar Emil', bonus: '+50% Schaden', bonusValue: 0.5, bonusType: 'damage', price: 5000, rarity: 'legendary', owned: false, equipped: false, level: 1, xp: 0, evolvedFrom: null, maxLevel: 25 },
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
  playerGems: 0,
  playerPetSlots: 1,
  lastDailyReward: 0,
  playerDefense: 0,
  playerSpeed: 8,
  playerTitle: 'Neuling',
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
      groundItems: [],
      damagePopups: [],
  levelUpEffect: false,
  hitEffectPos: null,
autoFight: false,
      autoRespawn: true,
      autoLoot: true,
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
    const state = get();
    const currentPos = state.playerPosition;
    const dx = pos[0] - currentPos[0];
    const dz = pos[2] - currentPos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 100) {
      console.warn('Blocked teleport - too far:', dist, 'from', currentPos, 'to', pos);
      return;
    }
    set({ playerPosition: pos });
  },

  attackEnemy: (id) => {
    const state = get();
    const pClass = state.playerClass;
    if (pClass === 'mage') playMagicCast();
    else if (pClass === 'archer') playArrowShoot();
    else playSwordSlash();

    const equippedPets = state.pets.filter(p => p.equipped);
    let bonusDmg = 0;
    let critBonus = 0;
    
    for (const pet of equippedPets) {
      if (pet.bonusType === 'damage') {
        bonusDmg += Math.floor(state.playerAttackPower * pet.bonusValue);
      } else if (pet.bonusType === 'crit') {
        critBonus += pet.bonusValue;
      }
    }
    
    const equippedWeapon = state.inventory.find(i => i.type === 'weapon' && i.equipped);
    const weaponBonus = equippedWeapon ? equippedWeapon.value : 0;
    let totalAtk = state.playerAttackPower + bonusDmg + weaponBonus;
    
    // Combo Damage Bonus (+10% per combo, max +50%)
    const comboBonus = Math.min(state.comboCount * 0.1, 0.5);
    totalAtk = Math.floor(totalAtk * (1 + comboBonus));
    
    let critChance = pClass === 'archer' ? 0.25 : 0.15;
    critChance += critBonus;
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
    let gemGain = 0;
    if (wasAlive && nowDead && killed) {
      // Update quest progress
      useQuestStore.getState().updateKillProgress(killed.name);
      
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
      const isBoss = killed.name.includes('Fürst') || killed.name.includes('König') || killed.name.includes('Herr') || killed.name.includes('Meister') || killed.name.includes('Lord');
      // Höhere Drop-Rate: Boss 1-5, Normal 50%
      const gemGain = isBoss ? Math.floor(Math.random() * 5) + 1 : (Math.random() < 0.5 ? 1 : 0);
      
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
        timestamp: Date.now() + 300,
      });
      if (gemGain > 0) {
        popups.push({
          id: `gem-${popupIdCounter++}`,
          position: [...killed.position] as [number, number, number],
          amount: gemGain,
          type: 'gem',
          timestamp: Date.now() + 350,
        });
      }
      if (Math.random() < 0.35) {
        const isBoss = killed.name.includes('Fürst') || killed.name.includes('König') || killed.name.includes('Herr') || killed.name.includes('Meister') || killed.name.includes('Lord');
        const dropTable = [
          { name: 'Kleiner HP Trank', type: 'potion' as const, icon: '🧪', value: 30, quantity: 1, rarity: 'common' as const },
          { name: 'Mittlerer HP Trank', type: 'potion' as const, icon: '🧪', value: 80, quantity: 1, rarity: 'rare' as const },
          { name: 'Großer HP Trank', type: 'potion' as const, icon: '🧪', value: 150, quantity: 1, rarity: 'epic' as const },
          { name: 'Eisenerz', type: 'material' as const, icon: '🪨', value: 5, quantity: isBoss ? 3 : 1, rarity: 'common' as const },
          { name: 'Heilkräuter', type: 'material' as const, icon: '🌿', value: 3, quantity: isBoss ? 3 : 1, rarity: 'common' as const },
          { name: 'Manablüte', type: 'material' as const, icon: '🌸', value: 3, quantity: isBoss ? 3 : 1, rarity: 'common' as const },
          { name: 'Stahlbarren', type: 'material' as const, icon: '🔩', value: 15, quantity: isBoss ? 2 : 1, rarity: 'rare' as const },
          { name: 'Edelstein', type: 'material' as const, icon: '💎', value: 50, quantity: isBoss ? 2 : 1, rarity: 'epic' as const },
          { name: 'Mithrilbarren', type: 'material' as const, icon: '⭐', value: 100, quantity: isBoss ? 2 : 1, rarity: 'legendary' as const },
        ];
        const drop = dropTable[Math.floor(Math.random() * dropTable.length)];
        const dropPos: [number, number, number] = [killed.position[0], 0.3, killed.position[2]];
        get().spawnGroundItem({ ...drop, position: dropPos });
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
      playerGems: state.playerGems + gemGain,
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
    const equippedPets = state.pets.filter(p => p.equipped);
    const equippedArmor = state.inventory.find(i => i.type === 'armor' && i.equipped);
    let reduction = state.playerDefense + (equippedArmor ? equippedArmor.value : 0);
    
    for (const pet of equippedPets) {
      if (pet.bonusType === 'defense') {
        reduction += Math.floor(amount * pet.bonusValue);
      }
    }
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
    const zoneInfo = ZONES.find(z => z.id === 'hub');
    const spawnX = zoneInfo?.center[0] ?? 0;
    const spawnZ = zoneInfo?.center[1] ?? 0;
    set({ 
      playerHp: healAmount, 
      playerPosition: [spawnX, 0, spawnZ],
      currentZone: 'hub',
      enemies: [],
      groundItems: [],
      playerMana: state.playerMaxMana,
    });
  },

  handleAFKTimeout: () => {
    const state = get();
    if (state.currentZone === 'hub') return;
    const zoneInfo = ZONES.find(z => z.id === 'hub');
    const spawnX = zoneInfo?.center[0] ?? 0;
    const spawnZ = zoneInfo?.center[1] ?? 0;
    set({ 
      playerHp: state.playerMaxHp, 
      playerPosition: [spawnX, 0, spawnZ],
      currentZone: 'hub',
      enemies: [],
      groundItems: [],
      playerMana: state.playerMaxMana,
      autoFight: false,
    });
  },

  resetPosition: () => {
    const zoneInfo = ZONES.find(z => z.id === 'hub');
    set({ 
      playerPosition: [zoneInfo?.center[0] ?? 0, 0, zoneInfo?.center[1] ?? 0],
      currentZone: 'hub' 
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
    if (!item || item.owned) return false;
    
    // Handle cosmetic items - pay with gems
    if (item.type === 'cosmetic') {
      if (state.playerGems < item.price) return false;
      const shopItems = state.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i);
      const invItem: InventoryItem = {
        id: `inv-${item.id}`,
        name: item.name,
        type: item.type,
        icon: item.icon || '✨',
        stat: item.stat,
        value: item.value,
        equipped: false,
        quantity: 1,
        rarity: item.price >= 50 ? 'legendary' : item.price >= 25 ? 'epic' : item.price >= 10 ? 'rare' : 'common',
      };
      set({ shopItems, playerGems: state.playerGems - item.price, inventory: [...state.inventory, invItem] });
      return true;
    }
    
    // Handle weapons, armor, potions - pay with gold
    if (state.playerGold < item.price) return false;
    const shopItems = state.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i);
    const invItem: InventoryItem = {
      id: `inv-${item.id}`,
      name: item.name,
      type: item.type,
      icon: item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '🧪',
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

  evolvePet: (petId) => {
    const state = get();
    const pet = state.pets.find(p => p.id === petId && p.owned);
    if (!pet || pet.level < pet.maxLevel || !pet.evolvedFrom) return false;
    
    const evolvedPet = state.pets.find(p => p.id === pet.evolvedFrom && p.owned);
    if (!evolvedPet) return false;
    
    const evolutionId = pet.id + '-evolved';
    const existingEvolved = state.pets.find(p => p.id === evolutionId);
    
    if (existingEvolved) {
      set({ pets: state.pets.map(p => p.id === evolutionId ? { ...p, owned: true, equipped: true } : p) });
    } else {
      set({ 
        pets: [...state.pets, { ...pet, id: evolutionId, name: pet.name + ' (Evolved)', level: 1, xp: 0, owned: true, equipped: true }]
      });
    }
    return true;
  },

  addPetXp: (petId, xp) => {
    set(s => ({
      pets: s.pets.map(p => {
        if (p.id !== petId || !p.owned || p.level >= p.maxLevel) return p;
        const newXp = p.xp + xp;
        const xpToNext = p.maxLevel * 100;
        if (newXp >= xpToNext) {
          return { ...p, level: Math.min(p.level + 1, p.maxLevel), xp: newXp - xpToNext };
        }
        return { ...p, xp: newXp };
      }),
    }));
  },

  addGold: (amount) => set(s => ({ playerGold: s.playerGold + amount })),
  addXp: (amount) => set(s => {
    let newXp = s.playerXp + amount;
    let newLevel = s.playerLevel;
    let newXpToLevel = s.playerXpToLevel;
    let newPlayerMaxHp = s.playerMaxHp;
    
    while (newXp >= newXpToLevel) {
      newXp -= newXpToLevel;
      newLevel++;
      newXpToLevel = Math.floor(newXpToLevel * 1.2);
      newPlayerMaxHp += 10;
    }
    
    return {
      playerXp: newXp,
      playerXpToLevel: newXpToLevel,
      playerLevel: newLevel,
      playerMaxHp: newPlayerMaxHp,
      playerTitle: newLevel >= 50 ? 'Legend' : newLevel >= 40 ? 'Hero' : newLevel >= 30 ? 'Champion' : newLevel >= 20 ? 'Veteran' : newLevel >= 15 ? 'Elite' : newLevel >= 10 ? 'Expert' : newLevel >= 5 ? 'Adventurer' : 'Neuling',
    };
  }),
  setTitle: (title) => set({ playerTitle: title }),
  addGems: (amount) => set(s => ({ playerGems: s.playerGems + amount })),

  unlockPetSlot: () => {
    const state = get();
    const costs = [100, 200, 300, 400]; // Preise für Slots 2,3,4,5
    const slotCost = costs[state.playerPetSlots - 1];
    if (!slotCost || state.playerGems < slotCost) return false;
    set({ playerGems: state.playerGems - slotCost, playerPetSlots: state.playerPetSlots + 1 });
    return true;
  },

  claimDailyReward: () => {
    const state = get();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const lastClaim = state.lastDailyReward || 0;
    if (now - lastClaim < dayMs) return false;
    const goldReward = 50 + state.playerLevel * 10;
    const gemReward = state.playerLevel >= 10 ? 1 : 0;
    set({ 
      playerGold: state.playerGold + goldReward,
      playerGems: state.playerGems + gemReward,
      lastDailyReward: now,
    });
    return true;
  },

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

  sellItem: (itemId) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || item.equipped) return;
    
    const sellPrice = Math.floor(item.value * 0.5);
    const newInventory = state.inventory.filter(i => i.id !== itemId);
    
    set({
      inventory: newInventory,
      playerGold: state.playerGold + sellPrice,
    });
  },

  craftItem: (recipeId) => {
    const state = get();
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    
    for (const ing of recipe.ingredients) {
      const hasEnough = state.inventory.some(i => i.name === ing.name && i.quantity >= ing.quantity);
      if (!hasEnough) return;
    }
    
    let newInventory = [...state.inventory];
    for (const ing of recipe.ingredients) {
      const idx = newInventory.findIndex(i => i.name === ing.name && i.quantity >= ing.quantity);
      if (idx !== -1) {
        if (newInventory[idx].quantity > ing.quantity) {
          newInventory[idx] = { ...newInventory[idx], quantity: newInventory[idx].quantity - ing.quantity };
        } else {
          newInventory = newInventory.filter((_, i) => i !== idx);
        }
      }
    }
    
    const newItem: InventoryItem = {
      id: `crafted-${recipeId}-${Date.now()}`,
      name: recipe.name,
      type: recipe.type,
      icon: recipe.icon,
      stat: recipe.stat,
      value: recipe.value,
      equipped: false,
      quantity: 1,
      rarity: recipe.rarity,
    };
    
    set({ inventory: [...newInventory, newItem] });
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

  spawnGroundItem: (item) => {
    const state = get();
    const newItem: GroundItem = { ...item, id: `ground-${Date.now()}`, timestamp: Date.now() };
    set({ groundItems: [...state.groundItems, newItem] });
  },

  pickupGroundItem: (itemId) => {
    const state = get();
    const item = state.groundItems.find(i => i.id === itemId);
    if (!item) return;
    set({ groundItems: state.groundItems.filter(i => i.id !== itemId) });
    
    const invItem: InventoryItem = {
      id: `inv-${item.id}`,
      name: item.name,
      type: item.type as 'weapon' | 'armor' | 'potion' | 'material',
      icon: item.icon,
      stat: item.type === 'potion' ? `+${item.value} HP` : 'Material',
      value: item.value,
      equipped: false,
      quantity: item.quantity,
      rarity: item.rarity
    };
    
    const existing = state.inventory.find(i => i.name === item.name && i.type === item.type);
    if (existing) {
      set(s => ({ inventory: s.inventory.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i) }));
    } else {
      set(s => ({ inventory: [...s.inventory, invItem] }));
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
  setAutoLoot: (v) => set({ autoLoot: v }),
  setUIOpen: (v) => set({ isUIOpen: v }),
  setShowSaveIndicator: (v) => set({ showSaveIndicator: v }),
  setWeather: (weather) => set({ weather }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  unlockAchievement: (id) => set(s => ({ achievements: s.achievements.includes(id) ? s.achievements : [...s.achievements, id] })),
}));

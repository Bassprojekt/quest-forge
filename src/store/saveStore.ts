import { useGameStore, ZoneType, PlayerClass, INITIAL_SHOP_ITEMS } from './gameStore';
import { useSkillTreeStore } from './skillTreeStore';
import { useCompanionStore } from './companionStore';
import { useQuestStore } from './questStore';
import { useGuildStore } from './guildStore';
import { useBankStore, BankItem } from './bankStore';
import { InventoryItem, Pet, ShopItem } from './gameStore';

const SAVE_KEY = 'mmorpg-save-data';
const PLAYER_ID_KEY = 'mmorpg-player-id';

function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

interface SaveData {
  version: number;
  timestamp: number;
  game: {
    playerClass: string | null;
    playerHp: number;
    playerMaxHp: number;
    playerMana: number;
    playerMaxMana: number;
    playerXp: number;
    playerXpToLevel: number;
    playerLevel: number;
    playerAttackPower: number;
    playerGold: number;
    playerGems: number;
    lastDailyReward: number;
    playerDefense: number;
    playerSpeed: number;
    currentZone: ZoneType;
    inventory: InventoryItem[];
    shopItems: ShopItem[];
    pets: Pet[];
  };
  skillTree: {
    skillPoints: number;
    nodes: unknown[];
  };
  companions: {
    companions: unknown[];
  };
  quests: {
    quests: unknown[];
  };
  guild: {
    guild: unknown | null;
    hasGuild: boolean;
  } | null;
  bank: {
    bankGold: number;
    bankItems: BankItem[];
    pin: string | null;
    isPinSet: boolean;
  } | null;
}

function getSaveData(): SaveData {
  const game = useGameStore.getState();
  const skill = useSkillTreeStore.getState();
  const comp = useCompanionStore.getState();
  const quest = useQuestStore.getState();
  const guild = useGuildStore.getState();
  const bank = useBankStore.getState();

  return {
    version: 3,
    timestamp: Date.now(),
    game: {
      playerClass: game.playerClass,
      playerHp: game.playerHp,
      playerMaxHp: game.playerMaxHp,
      playerMana: game.playerMana,
      playerMaxMana: game.playerMaxMana,
      playerXp: game.playerXp,
      playerXpToLevel: game.playerXpToLevel,
      playerLevel: game.playerLevel,
      playerAttackPower: game.playerAttackPower,
      playerGold: game.playerGold,
      playerGems: game.playerGems,
      lastDailyReward: game.lastDailyReward,
      playerDefense: game.playerDefense,
      playerSpeed: game.playerSpeed,
      currentZone: game.currentZone,
      inventory: game.inventory,
      shopItems: game.shopItems,
      pets: game.pets,
    },
    skillTree: {
      skillPoints: skill.skillPoints,
      nodes: skill.nodes,
    },
    companions: {
      companions: comp.companions,
    },
    quests: {
      quests: quest.quests,
    },
    guild: {
      guild: guild.guild,
      hasGuild: guild.hasGuild,
    },
    bank: {
      bankGold: bank.bankGold,
      bankItems: bank.bankItems,
      pin: bank.pin,
      isPinSet: bank.isPinSet,
    },
  };
}

function restoreFromData(data: SaveData): boolean {
  if (!data.game) return false;

  const gs = useGameStore.getState();
  gs.setPlayerClass(data.game.playerClass as 'warrior' | 'mage' | 'archer' | null);
  useGameStore.setState({
    playerHp: data.game.playerHp,
    playerMaxHp: data.game.playerMaxHp,
    playerMana: data.game.playerMana,
    playerMaxMana: data.game.playerMaxMana,
    playerXp: data.game.playerXp,
    playerXpToLevel: data.game.playerXpToLevel,
    playerLevel: data.game.playerLevel,
    playerAttackPower: data.game.playerAttackPower,
    playerGold: data.game.playerGold,
    playerGems: data.game.playerGems || 0,
    lastDailyReward: data.game.lastDailyReward || 0,
    playerDefense: data.game.playerDefense,
    playerSpeed: data.game.playerSpeed,
    currentZone: data.game.currentZone as ZoneType,
    inventory: data.game.inventory,
    shopItems: data.game.shopItems,
    pets: data.game.pets,
  });

  // Add missing cosmetic items to shop
  const newCosmeticItems = INITIAL_SHOP_ITEMS.filter(i => i.type === 'cosmetic');
  const currentShop = useGameStore.getState().shopItems;
  const existingIds = currentShop.map((i: { id: string }) => i.id);
  const missingCosmetics = newCosmeticItems.filter((i: { id: string }) => !existingIds.includes(i.id));
  if (missingCosmetics.length > 0) {
    useGameStore.setState({
      shopItems: [...currentShop, ...missingCosmetics]
    });
  }

  // Add missing pets to existing save
  const loadedPets: Pet[] = data.game.pets || [];
  const loadedPetIds = loadedPets.map((p: Pet) => p.id);
  const INITIAL_PETS_ADD: Pet[] = [
    { id: 'pet-fairy', name: 'Wald Fee', bonus: '+10% Krit', bonusValue: 0.1, bonusType: 'crit', price: 400, rarity: 'rare', owned: false, equipped: false },
    { id: 'pet-ghost', name: 'Geist Gigi', bonus: '+25% Speed', bonusValue: 0.25, bonusType: 'speed', price: 600, rarity: 'rare', owned: false, equipped: false },
    { id: 'pet-treant', name: 'Treant Torin', bonus: '+35% Defense', bonusValue: 0.35, bonusType: 'defense', price: 2500, rarity: 'legendary', owned: false, equipped: false },
    { id: 'pet-elemental', name: 'Elementar Emil', bonus: '+50% Schaden', bonusValue: 0.5, bonusType: 'damage', price: 5000, rarity: 'legendary', owned: false, equipped: false },
    { id: 'pet-shadow', name: 'Schatten Uri', bonus: '+60% Schaden', bonusValue: 0.6, bonusType: 'damage', price: 7000, rarity: 'legendary', owned: false, equipped: false },
    { id: 'pet-abyss', name: 'Abgrund Bestie', bonus: '+70% Schaden', bonusValue: 0.7, bonusType: 'damage', price: 10000, rarity: 'legendary', owned: false, equipped: false },
    { id: 'pet-celestial', name: 'Himmelsfee', bonus: '+25% Heilung', bonusValue: 0.25, bonusType: 'heal', price: 5000, rarity: 'epic', owned: false, equipped: false },
    { id: 'pet-ancient', name: 'Uralter Drache', bonus: '+80% Schaden', bonusValue: 0.8, bonusType: 'damage', price: 15000, rarity: 'legendary', owned: false, equipped: false },
  ];
  const missingPets = INITIAL_PETS_ADD.filter((p: Pet) => !loadedPetIds.includes(p.id));
  if (missingPets.length > 0) {
    useGameStore.setState({
      pets: [...loadedPets, ...missingPets]
    });
  }

  if (data.skillTree) {
    useSkillTreeStore.setState({
      skillPoints: data.skillTree.skillPoints,
      nodes: data.skillTree.nodes,
    });
    useGameStore.getState().recalcStats();
  }

  if (data.companions) {
    useCompanionStore.setState({
      companions: data.companions.companions,
    });
  }

  if (data.quests) {
    useQuestStore.setState({
      quests: data.quests.quests,
    });
  }

  if (data.guild) {
    useGuildStore.setState({
      guild: data.guild.guild,
      hasGuild: data.guild.hasGuild,
    });
  }

  if (data.bank) {
    useBankStore.setState({
      bankGold: data.bank.bankGold,
      bankItems: data.bank.bankItems,
      pin: data.bank.pin,
      isPinSet: data.bank.isPinSet,
    });
  }

  return true;
}

export function saveGame(): boolean {
  const data = getSaveData();
  const game = useGameStore.getState();
  
localStorage.setItem(SAVE_KEY, JSON.stringify(data));
   
   useGameStore.getState().setShowSaveIndicator(true);
   setTimeout(() => {
     useGameStore.getState().setShowSaveIndicator(false);
   }, 2000);
   
   return true;
}

export function loadGame(): boolean {
  // First try local storage
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      const data: SaveData = JSON.parse(raw);
      if (data.version) {
        restoreFromData(data);
        return true;
      }
    } catch {}
  }
  
  // Try Supabase if local fails
  const playerId = getPlayerId();
  supabase.from('game_saves').select('save_data').eq('player_id', playerId).single()
    .then(({ data: saved, error }) => {
      if (error || !saved) return;
      try {
        restoreFromData(saved.save_data);
      } catch {}
    });
  
  return false;
}

export function exportSaveToFile(): boolean {
  try {
    const data = getSaveData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questforge-save-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export function importSaveFromFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: SaveData = JSON.parse(e.target?.result as string);
        if (!data.version || !data.game) {
          resolve(false);
          return;
        }

        restoreFromData(data);
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
}

export function hasSaveData(): boolean {
  return !!localStorage.getItem(SAVE_KEY);
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function getLastSaveTime(): string | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return new Date(data.timestamp).toLocaleString('de-DE');
  } catch {
    return null;
  }
}

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let hasLoadedOnce = false;

export function startAutoSave() {
  if (!hasLoadedOnce) {
    hasLoadedOnce = true;
    loadGame();
  }
  if (autoSaveInterval) return;
  autoSaveInterval = setInterval(() => {
    if (useGameStore.getState().playerClass) {
      saveGame();
    }
  }, 30000);
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}
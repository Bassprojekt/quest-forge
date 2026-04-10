import { useGameStore, ZoneType, PlayerClass } from './gameStore';
import { useSkillTreeStore } from './skillTreeStore';
import { useCompanionStore } from './companionStore';
import { useQuestStore } from './questStore';
import { useGuildStore } from './guildStore';
import { useBankStore, BankItem } from './bankStore';
import { InventoryItem, Pet, ShopItem } from './gameStore';

const SAVE_KEY = 'mmorpg-save-data';

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
    playerDefense: data.game.playerDefense,
    playerSpeed: data.game.playerSpeed,
    currentZone: data.game.currentZone as ZoneType,
    inventory: data.game.inventory,
    shopItems: data.game.shopItems,
    pets: data.game.pets,
  });

  if (data.skillTree) {
    useSkillTreeStore.setState({
      skillPoints: data.skillTree.skillPoints,
      nodes: data.skillTree.nodes,
    });
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
  try {
    const data = getSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    
    useGameStore.getState().setShowSaveIndicator(true);
    setTimeout(() => {
      useGameStore.getState().setShowSaveIndicator(false);
    }, 2000);
    
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data: SaveData = JSON.parse(raw);
    if (!data.version) return false;

    return restoreFromData(data);
  } catch {
    return false;
  }
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

export function startAutoSave() {
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
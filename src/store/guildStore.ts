import { create } from 'zustand';

export interface GuildMember {
  name: string;
  rank: 'leader' | 'officer' | 'member';
  level: number;
  class: string;
  joinedAt: number;
}

export interface GuildItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Guild {
  name: string;
  leader: string;
  members: GuildMember[];
  level: number;
  xp: number;
  xpToNextLevel: number;
  createdAt: number;
  bankGold: number;
  bankItems: GuildItem[];
}

interface GuildState {
  guild: Guild | null;
  hasGuild: boolean;
  createGuild: (name: string, leaderName: string, leaderClass: string) => void;
  leaveGuild: () => void;
  addMember: (member: GuildMember) => void;
  removeMember: (name: string) => void;
  addXp: (amount: number) => void;
  addBankGold: (amount: number) => boolean;
  withdrawBankGold: (amount: number) => boolean;
  addBankItem: (item: GuildItem) => void;
  withdrawBankItem: (itemId: string, quantity: number) => boolean;
}

const calculateXpToNextLevel = (level: number) => {
  return 1000 * Math.pow(1.5, level - 1);
};

export const useGuildStore = create<GuildState>((set, get) => ({
  guild: null,
  hasGuild: false,

  createGuild: (name, leaderName, leaderClass) => {
    const newGuild: Guild = {
      name,
      leader: leaderName,
      members: [{
        name: leaderName,
        rank: 'leader',
        level: 1,
        class: leaderClass,
        joinedAt: Date.now(),
      }],
      level: 1,
      xp: 0,
      xpToNextLevel: calculateXpToNextLevel(1),
      createdAt: Date.now(),
      bankGold: 0,
      bankItems: [],
    };
    set({ guild: newGuild, hasGuild: true });
  },

  leaveGuild: () => {
    set({ guild: null, hasGuild: false });
  },

  addMember: (member) => {
    const { guild } = get();
    if (guild) {
      set({
        guild: {
          ...guild,
          members: [...guild.members, member],
        },
      });
    }
  },

  removeMember: (name) => {
    const { guild } = get();
    if (guild) {
      set({
        guild: {
          ...guild,
          members: guild.members.filter(m => m.name !== name),
        },
      });
    }
  },

  addXp: (amount) => {
    const { guild } = get();
    if (guild) {
      let newXp = guild.xp + amount;
      let newLevel = guild.level;
      let xpToNext = guild.xpToNextLevel;

      while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
        xpToNext = calculateXpToNextLevel(newLevel);
      }

      set({
        guild: {
          ...guild,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: xpToNext,
        },
      });
    }
  },

  addBankGold: (amount) => {
    const { guild, withdrawBankGold } = get();
    const playerGold = 0;
    if (guild && playerGold >= amount) {
      set({
        guild: {
          ...guild,
          bankGold: guild.bankGold + amount,
        },
      });
      return true;
    }
    return false;
  },

  withdrawBankGold: (amount) => {
    const { guild } = get();
    if (guild && guild.bankGold >= amount) {
      set({
        guild: {
          ...guild,
          bankGold: guild.bankGold - amount,
        },
      });
      return true;
    }
    return false;
  },

  addBankItem: (item) => {
    const { guild } = get();
    if (guild) {
      const existingItem = guild.bankItems.find(i => i.id === item.id);
      if (existingItem) {
        set({
          guild: {
            ...guild,
            bankItems: guild.bankItems.map(i => 
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          },
        });
      } else {
        set({
          guild: {
            ...guild,
            bankItems: [...guild.bankItems, item],
          },
        });
      }
    }
  },

  withdrawBankItem: (itemId, quantity) => {
    const { guild } = get();
    if (guild) {
      const item = guild.bankItems.find(i => i.id === itemId);
      if (item && item.quantity >= quantity) {
        if (item.quantity === quantity) {
          set({
            guild: {
              ...guild,
              bankItems: guild.bankItems.filter(i => i.id !== itemId),
            },
          });
        } else {
          set({
            guild: {
              ...guild,
              bankItems: guild.bankItems.map(i =>
                i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
              ),
            },
          });
        }
        return true;
      }
    }
    return false;
  },
}));
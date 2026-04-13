import { create } from 'zustand';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'kill' | 'collect' | 'escort' | 'special' | 'level';
  target: string;
  targetItem?: string;
  required: number;
  current: number;
  rewardXp: number;
  rewardGold: number;
  rewardGems?: number;
  rewardItem?: string;
  status: 'available' | 'active' | 'completed' | 'claimed';
  npcName: string;
}

interface QuestState {
  quests: Quest[];
  activeQuestId: string | null;
  showQuestDialog: boolean;
  selectedNpc: string | null;

  acceptQuest: (id: string) => void;
  updateKillProgress: (enemyName: string) => void;
  claimReward: (id: string) => { xp: number; gold: number } | null;
  setShowQuestDialog: (v: boolean) => void;
  setSelectedNpc: (npc: string | null) => void;
}

const INITIAL_QUESTS: Quest[] = [
  { id: 'q1', title: 'Pilzjäger', description: 'Besiege 3 Pilzlinge auf den Grünen Wiesen.', type: 'kill', target: 'Pilzling', required: 3, current: 0, rewardXp: 75, rewardGold: 30, status: 'available', npcName: 'Händler Mika' },
  { id: 'q2', title: 'Schleimjagd', description: 'Bezwinge 2 Blaue Schleime.', type: 'kill', target: 'Blauer Schleim', required: 2, current: 0, rewardXp: 100, rewardGold: 50, status: 'available', npcName: 'Händler Mika' },
  { id: 'q3', title: 'Bienenstich', description: 'Besiege die Riesenbiene.', type: 'kill', target: 'Riesenbiene', required: 1, current: 0, rewardXp: 150, rewardGold: 70, status: 'available', npcName: 'Pet-Meisterin Luna' },
  { id: 'q4', title: 'Zombieplage', description: 'Besiege 3 Zombies im Schattensumpf.', type: 'kill', target: 'Zombie', required: 3, current: 0, rewardXp: 200, rewardGold: 100, status: 'available', npcName: 'Händler Mika' },
  { id: 'q5', title: 'Knochenjäger', description: 'Bezwinge 3 Skelette.', type: 'kill', target: 'Skelett', required: 3, current: 0, rewardXp: 250, rewardGold: 120, status: 'available', npcName: 'Schmied Vulkan' },
  { id: 'q6', title: 'Creeper-Alarm', description: 'Zerstöre 2 Creeper.', type: 'kill', target: 'Creeper', required: 2, current: 0, rewardXp: 300, rewardGold: 150, status: 'available', npcName: 'Pet-Meisterin Luna' },
  { id: 'q7', title: 'Enderjagd', description: 'Besiege einen Enderman.', type: 'kill', target: 'Enderman', required: 1, current: 0, rewardXp: 400, rewardGold: 200, status: 'available', npcName: 'Schmied Vulkan' },
  { id: 'q8', title: 'Sporenplage', description: 'Besiege 2 Sporenpilze im Pilzwald.', type: 'kill', target: 'Sporenpilz', required: 2, current: 0, rewardXp: 200, rewardGold: 100, status: 'available', npcName: 'Händler Mika' },
  { id: 'q9', title: 'Giftwurm', description: 'Töte den Giftwurm.', type: 'kill', target: 'Giftwurm', required: 1, current: 0, rewardXp: 280, rewardGold: 140, status: 'available', npcName: 'Apothekerin Flora' },
  { id: 'q10', title: 'Frostjagd', description: 'Töte 2 Eiskobolde auf den Frostgipfeln.', type: 'kill', target: 'Eiskobold', required: 2, current: 0, rewardXp: 350, rewardGold: 150, status: 'available', npcName: 'Schmied Vulkan' },
  { id: 'q11', title: 'Wolfspack', description: 'Bezwinge 2 Frostwölfe.', type: 'kill', target: 'Frostwolf', required: 2, current: 0, rewardXp: 450, rewardGold: 200, status: 'available', npcName: 'Pet-Meisterin Luna' },
  { id: 'q12', title: 'Feuertaufe', description: 'Besiege 2 Magmaschleimer.', type: 'kill', target: 'Magmaschleimer', required: 2, current: 0, rewardXp: 500, rewardGold: 250, status: 'available', npcName: 'Schmied Vulkan' },
  { id: 'q13', title: 'Dämonenjagd', description: 'Besiege einen Feuerdämon.', type: 'kill', target: 'Feuerdämon', required: 1, current: 0, rewardXp: 600, rewardGold: 300, status: 'available', npcName: 'Waffenhändler Erik' },
  { id: 'q14', title: 'Quallenfang', description: 'Töte 2 Quallenfische.', type: 'kill', target: 'Quallenfisch', required: 2, current: 0, rewardXp: 550, rewardGold: 280, status: 'available', npcName: 'Händler Hans' },
  { id: 'q15', title: 'Tiefseejäger', description: 'Besiege die Tiefseeschlange.', type: 'kill', target: 'Tiefseeschlange', required: 1, current: 0, rewardXp: 700, rewardGold: 350, status: 'available', npcName: 'Pet-Meisterin Luna' },
  { id: 'q16', title: 'Sumpfkröten', description: 'Besiege 3 Sumpfkröten.', type: 'kill', target: 'Sumpfkröte', required: 3, current: 0, rewardXp: 400, rewardGold: 180, status: 'available', npcName: 'Apothekerin Flora' },
  { id: 'q17', title: 'Kristalljagd', description: 'Besiege einen Kristallgolem.', type: 'kill', target: 'Kristallgolem', required: 1, current: 0, rewardXp: 900, rewardGold: 450, status: 'available', npcName: 'Waffenhändler Erik' },
  { id: 'q18', title: 'Drachenruf', description: 'Bezwinge den Prismadrachen.', type: 'kill', target: 'Prismadrache', required: 1, current: 0, rewardXp: 1200, rewardGold: 600, status: 'available', npcName: 'Gildenmeisterin Gabi' },
  { id: 'q19', title: 'Void-Bezwinger', description: 'Besiege einen Voidwalker.', type: 'kill', target: 'Voidwalker', required: 1, current: 0, rewardXp: 1500, rewardGold: 800, status: 'available', npcName: 'Schmied Vulkan' },
  { id: 'q20', title: 'Chaosbrecher', description: 'Zerstöre ein Chaosphantom.', type: 'kill', target: 'Chaosphantom', required: 1, current: 0, rewardXp: 2000, rewardGold: 1000, status: 'available', npcName: 'Gildenmeisterin Gabi' },
  // Collect quests
  { id: 'q21', title: 'Pilzsammler', description: 'Sammle 5 Pilze im Pilzwald.', type: 'collect', target: 'Pilz', targetItem: 'Pilz', required: 5, current: 0, rewardXp: 150, rewardGold: 75, status: 'available', npcName: 'Apothekerin Flora' },
  { id: 'q22', title: 'Kristallsucher', description: 'Sammle 3 Kristalle.', type: 'collect', target: 'Kristall', targetItem: 'Kristall', required: 3, current: 0, rewardXp: 300, rewardGold: 150, status: 'available', npcName: 'Waffenhändler Erik' },
  { id: 'q23', title: 'Schattenessenz', description: 'Sammle 4 Schattenperlen.', type: 'collect', target: 'Schattenperle', targetItem: 'Schattenperle', required: 4, current: 0, rewardXp: 400, rewardGold: 200, status: 'available', npcName: 'Schmied Vulkan' },
  // Neue Quests
  { id: 'q24', title: 'Edelsteinjäger', description: 'Sammle 5 Edelsteine von Bossen.', type: 'collect', target: 'Edelstein', targetItem: 'Edelstein', required: 5, current: 0, rewardXp: 500, rewardGold: 250, rewardGems: 2, status: 'available', npcName: 'Bankier Boris' },
  { id: 'q25', title: 'Nihilschlund', description: 'Besiege den Nihilschlund.', type: 'kill', target: 'Nihilschlund', required: 1, current: 0, rewardXp: 2500, rewardGold: 1200, rewardGems: 5, status: 'available', npcName: 'Raid-Leiter Roy' },
  { id: 'q26', title: 'Käferplage', description: 'Töte 5 Edelsteinkäfer.', type: 'kill', target: 'Edelsteinkäfer', required: 5, current: 0, rewardXp: 600, rewardGold: 300, status: 'available', npcName: 'Apothekerin Flora' },
  { id: 'q27', title: 'Alchemist', description: 'Sammle 10 Heilkräuter.', type: 'collect', target: 'Heilkräuter', targetItem: 'Heilkräuter', required: 10, current: 0, rewardXp: 200, rewardGold: 100, status: 'available', npcName: 'Alchemist Anton' },
  { id: 'q28', title: 'Schmiedemeister', description: 'Sammle 5 Eisenerz.', type: 'collect', target: 'Eisenerz', targetItem: 'Eisenerz', required: 5, current: 0, rewardXp: 150, rewardGold: 75, status: 'available', npcName: 'Handwerker Hagen' },
  { id: 'q29', title: 'Korallensammler', description: 'Sammle 8 Korallen.', type: 'collect', target: 'Koralle', targetItem: 'Koralle', required: 8, current: 0, rewardXp: 350, rewardGold: 175, status: 'available', npcName: 'Händler Hans' },
  { id: 'q30', title: 'Nebelwandler', description: 'Besiege den Nebelwandler.', type: 'kill', target: 'Nebelwandler', required: 1, current: 0, rewardXp: 800, rewardGold: 400, status: 'available', npcName: 'Event-Verkünder Evi' },
  { id: 'q31', title: 'Friedensstifter', description: 'Besiege 10 Feinde in der PvP Arena.', type: 'kill', target: 'Spieler', required: 10, current: 0, rewardXp: 1000, rewardGold: 500, rewardGems: 3, status: 'available', npcName: 'Arena-Leiter Max' },
  { id: 'q32', title: 'Guild-Gründer', description: 'Gründe eine Gilde.', type: 'special', target: 'Gilde', required: 1, current: 0, rewardXp: 2000, rewardGold: 1000, rewardGems: 5, status: 'available', npcName: 'Gildenmeisterin Gabi' },
  { id: 'q33', title: 'Freunde-Finder', description: 'Füge 3 Freunde hinzu.', type: 'special', target: 'Freunde', required: 3, current: 0, rewardXp: 300, rewardGold: 150, status: 'available', npcName: 'Freunde-Finder Finn' },
  { id: 'q34', title: 'Level-Master', description: 'Erreiche Level 20.', type: 'level', target: 'Level', required: 20, current: 0, rewardXp: 0, rewardGold: 2000, rewardGems: 10, status: 'available', npcName: 'Event-Verkünder Evi' },
  { id: 'q35', title: 'Monster-Sammler', description: 'Besiege alle Monster-Typen mindestens 1x.', type: 'special', target: 'Monster', required: 20, current: 0, rewardXp: 3000, rewardGold: 1500, rewardGems: 8, status: 'available', npcName: 'Freunde-Finder Finn' },
];

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: INITIAL_QUESTS.map(q => ({ ...q })),
  activeQuestId: null,
  showQuestDialog: false,
  selectedNpc: null,

  acceptQuest: (id) => {
    set(s => ({
      quests: s.quests.map(q => q.id === id ? { ...q, status: 'active' as const } : q),
    }));
  },

  updateKillProgress: (enemyName) => {
    set(s => ({
      quests: s.quests.map(q => {
        if (q.status !== 'active' || q.target !== enemyName) return q;
        const newCurrent = Math.min(q.current + 1, q.required);
        return {
          ...q,
          current: newCurrent,
          status: newCurrent >= q.required ? 'completed' as const : 'active' as const,
        };
      }),
    }));
  },

  claimReward: (id) => {
    const quest = get().quests.find(q => q.id === id);
    if (!quest || quest.status !== 'completed') return null;
    set(s => ({
      quests: s.quests.map(q => q.id === id ? { ...q, status: 'claimed' as const } : q),
    }));
    return { xp: quest.rewardXp, gold: quest.rewardGold };
  },

  setShowQuestDialog: (v) => set({ showQuestDialog: v }),
  setSelectedNpc: (npc) => set({ selectedNpc: npc }),
}));

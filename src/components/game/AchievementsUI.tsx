import { useGameStore } from '@/store/gameStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: { level: number; kills: number; gold: number; pets: number }) => boolean;
  reward: string;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_kill',
    name: 'Erster Kill',
    description: 'Besiege dein erstes Monster',
    icon: '⚔️',
    requirement: (s) => s.kills >= 1,
    reward: '50 Gold',
  },
  {
    id: 'kill_10',
    name: 'Monsterjäger',
    description: 'Besiege 10 Monster',
    icon: '💀',
    requirement: (s) => s.kills >= 10,
    reward: '100 Gold',
  },
  {
    id: 'kill_50',
    name: 'Schlachtfeld',
    description: 'Besiege 50 Monster',
    icon: '⚔️',
    requirement: (s) => s.kills >= 50,
    reward: '250 Gold',
  },
  {
    id: 'kill_100',
    name: 'Schlachtmeister',
    description: 'Besiege 100 Monster',
    icon: '🗡️',
    requirement: (s) => s.kills >= 100,
    reward: '500 Gold',
  },
  {
    id: 'level_5',
    name: 'Aufsteiger',
    description: 'Erreiche Level 5',
    icon: '⭐',
    requirement: (s) => s.level >= 5,
    reward: '100 Gold',
  },
  {
    id: 'level_10',
    name: 'Veteran',
    description: 'Erreiche Level 10',
    icon: '🌟',
    requirement: (s) => s.level >= 10,
    reward: '250 Gold',
  },
  {
    id: 'level_20',
    name: ' Meister',
    description: 'Erreiche Level 20',
    icon: '💫',
    requirement: (s) => s.level >= 20,
    reward: '500 Gold',
  },
  {
    id: 'rich_1000',
    name: 'Goldsammler',
    description: 'Sammle 1.000 Gold',
    icon: '💰',
    requirement: (s) => s.gold >= 1000,
    reward: '150 Gold',
  },
  {
    id: 'rich_10000',
    name: 'Geldadel',
    description: 'Sammle 10.000 Gold',
    icon: '💎',
    requirement: (s) => s.gold >= 10000,
    reward: '500 Gold',
  },
  {
    id: 'pet_owner',
    name: 'Tierfreund',
    description: 'Besitze dein erstes Haustier',
    icon: '🐾',
    requirement: (s) => s.pets >= 1,
    reward: '200 Gold',
  },
  {
    id: 'pet_collector',
    name: 'TierSammler',
    description: 'Besitze 5 Haustiere',
    icon: '🦎',
    requirement: (s) => s.pets >= 5,
    reward: '500 Gold',
  },
  {
    id: 'guild_founder',
    name: 'Gründer',
    description: 'Gründe eine Gilde',
    icon: '🏰',
    requirement: () => false,
    reward: '1.000 Gold',
  },
];

interface Props {
  onClose: () => void;
}

export const AchievementsUI = ({ onClose }: Props) => {
  const achievements = useGameStore(s => s.achievements);
  const playerLevel = useGameStore(s => s.playerLevel);
  const totalKills = useGameStore(s => s.totalKills);
  const totalGoldEarned = useGameStore(s => s.totalGoldEarned);
  const ownedPets = useGameStore(s => s.pets.filter(p => p.owned).length);
  
  const stats = {
    level: playerLevel,
    kills: totalKills,
    gold: totalGoldEarned,
    pets: ownedPets,
  };
  
  const unlockedCount = achievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] border-2 border-[#FFD700] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        style={{ fontFamily: 'Fredoka, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#FFD700] font-bold text-xl">🏆 Achievements</h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full text-white hover:bg-white/20">
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>{unlockedCount} / {totalCount} freigeschaltet</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
          {ALL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = achievements.includes(ach.id);
            const canUnlock = !isUnlocked && ach.requirement(stats);
            
            return (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isUnlocked 
                    ? 'bg-green-500/20 border-green-500' 
                    : canUnlock
                      ? 'bg-[#FFD700]/20 border-[#FFD700] animate-pulse'
                      : 'bg-white/5 border-white/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{ach.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{ach.name}</div>
                    <div className="text-white/60 text-sm">{ach.description}</div>
                    {isUnlocked && (
                      <div className="text-green-400 text-xs mt-1">✓ Freigeschaltet</div>
                    )}
                    {canUnlock && (
                      <div className="text-[#FFD700] text-xs mt-1 animate-pulse">🎉 Kann freischalten!</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[#FFD700] text-sm">+{ach.reward}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
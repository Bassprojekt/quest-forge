import { useQuestStore } from '@/store/questStore';
import { useGameStore } from '@/store/gameStore';

export const QuestUI = () => {
  const showDialog = useQuestStore(s => s.showQuestDialog);
  const selectedNpc = useQuestStore(s => s.selectedNpc);
  const quests = useQuestStore(s => s.quests);
  const acceptQuest = useQuestStore(s => s.acceptQuest);
  const claimReward = useQuestStore(s => s.claimReward);
  const setShowQuestDialog = useQuestStore(s => s.setShowQuestDialog);
  const addGold = useGameStore(s => s.addGold);
  const addXp = useGameStore(s => s.addXp);

  if (!showDialog || !selectedNpc) return null;

  const npcQuests = quests.filter(q => q.npcName === selectedNpc);

  const handleClaim = (id: string) => {
    const reward = claimReward(id);
    if (reward) {
      addGold(reward.gold);
      addXp(reward.xp);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-quest-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowQuestDialog(false)} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-6 max-w-md w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#4169E1] font-bold text-lg">{selectedNpc}</h2>
          <button onClick={() => setShowQuestDialog(false)} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
        </div>

        <div className="text-[#888] text-xs mb-4 italic">
          "Willkommen, Abenteurer! Ich habe Aufgaben für dich."
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {npcQuests.map(quest => (
            <div key={quest.id} className="bg-[#F8F6F0] rounded-xl p-3 border border-[#E0D5C0]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#333] text-sm font-bold">{quest.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  quest.status === 'available' ? 'bg-[#E8F5E9] text-[#4CAF50]' :
                  quest.status === 'active' ? 'bg-[#E3F2FD] text-[#2196F3]' :
                  quest.status === 'completed' ? 'bg-[#FFF8E1] text-[#FF9800]' :
                  'bg-[#F5F5F5] text-[#999]'
                }`}>
                  {quest.status === 'available' ? 'Verfügbar' :
                   quest.status === 'active' ? `${quest.current}/${quest.required}` :
                   quest.status === 'completed' ? 'Fertig!' :
                   'Erledigt'}
                </span>
              </div>
              <p className="text-[#888] text-[11px] mb-2">{quest.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-[#888]">
                  🏆 {quest.rewardXp} XP · 💰 {quest.rewardGold} Gold
                </div>
                {quest.status === 'available' && (
                  <button onClick={() => acceptQuest(quest.id)}
                    className="bg-[#4169E1] text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#3457B2]">
                    ANNEHMEN
                  </button>
                )}
                {quest.status === 'completed' && (
                  <button onClick={() => handleClaim(quest.id)}
                    className="bg-[#4CAF50] text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#43A047]">
                    BELOHNUNG
                  </button>
                )}
              </div>
            </div>
          ))}
          {npcQuests.length === 0 && (
            <div className="text-[#888] text-sm text-center py-4">Keine Aufträge verfügbar.</div>
          )}
        </div>
      </div>
    </div>
  );
};

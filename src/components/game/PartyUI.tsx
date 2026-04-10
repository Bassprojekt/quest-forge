import { useCompanionStore } from '@/store/companionStore';

interface Props {
  onClose: () => void;
}

export const PartyUI = ({ onClose }: Props) => {
  const { companions, toggleCompanion, maxPartySize } = useCompanionStore();
  const activeCount = companions.filter(c => c.active).length;

  const typeLabels = { tank: '🛡️ Tank', healer: '✨ Heiler', dps: '⚔️ DPS' };
  const rarityColors = { tank: '#4169E1', healer: '#FF69B4', dps: '#4CAF50' };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ background: 'rgba(0,0,0,0.6)', fontFamily: "'Fredoka', sans-serif" }}>
      <div className="bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-5 max-w-[500px] w-full mx-4"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black text-[#333]">👥 Gruppe</h2>
            <div className="text-xs text-[#888]">{activeCount}/{maxPartySize} Begleiter aktiv</div>
          </div>
          <button onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFCDD2] text-[#F44336] hover:bg-[#EF9A9A]">
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {companions.map(comp => (
            <div key={comp.id}
              className={`p-3 rounded-xl border-2 transition-all ${
                !comp.unlocked ? 'border-[#E0E0E0] bg-[#F5F5F5] opacity-50' :
                comp.active ? 'border-[#4CAF50] bg-[#E8F5E9]' :
                'border-[#E0E0E0] bg-white hover:bg-[#F5F5F5]'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: `${rarityColors[comp.type]}20`, border: `2px solid ${rarityColors[comp.type]}` }}>
                  {comp.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#333]">{comp.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: `${rarityColors[comp.type]}20`, color: rarityColors[comp.type] }}>
                      {typeLabels[comp.type]}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#888]">
                    Lv.{comp.level} • ATK: {comp.attackPower} • HP: {comp.hp}/{comp.maxHp}
                  </div>
                  <div className="text-[9px] text-[#4169E1] font-semibold">⚡ {comp.skill} (CD: {comp.skillCooldown}s)</div>
                </div>
                {comp.unlocked && (
                  <button onClick={() => toggleCompanion(comp.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      comp.active
                        ? 'bg-[#FFCDD2] text-[#F44336] hover:bg-[#EF9A9A]'
                        : activeCount >= maxPartySize
                        ? 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                        : 'bg-[#E8F5E9] text-[#4CAF50] hover:bg-[#C8E6C9]'
                    }`}
                    disabled={!comp.active && activeCount >= maxPartySize}>
                    {comp.active ? 'Entfernen' : 'Einladen'}
                  </button>
                )}
                {!comp.unlocked && (
                  <div className="text-[10px] text-[#999] font-bold">🔒 Gesperrt</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

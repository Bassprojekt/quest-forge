import { useState } from 'react';
import { useGameStore, InventoryItem } from '@/store/gameStore';

interface Props {
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export const InventoryUI = ({ onClose }: Props) => {
  const inventory = useGameStore(s => s.inventory);
  const equipItem = useGameStore(s => s.equipItem);
  const usePotion = useGameStore(s => s.usePotion);
  const recalcStats = useGameStore(s => s.recalcStats);
  const playerHp = useGameStore(s => s.playerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const [tab, setTab] = useState<'all' | 'weapon' | 'armor' | 'potion'>('all');

  const filtered = tab === 'all' ? inventory : inventory.filter(i => i.type === tab);

  const handleEquip = (item: InventoryItem) => {
    equipItem(item.id);
    setTimeout(recalcStats, 10);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-inventory-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#4169E1] font-bold text-lg">🎒 Inventar</h2>
          <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'weapon', 'armor', 'potion'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                tab === t ? 'bg-[#4169E1] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
              }`}>
              {t === 'all' ? '📦 ALLE' : t === 'weapon' ? '⚔️ WAFFEN' : t === 'armor' ? '🛡️ RÜSTUNG' : '🧪 TRÄNKE'}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center text-[#AAA] text-sm py-8">Keine Items vorhanden</div>
          )}
          {filtered.map(item => (
            <div key={item.id}
              className={`bg-[#F8F6F0] rounded-xl p-3 border-2 flex items-center justify-between transition-colors ${
                item.equipped ? 'border-[#4CAF50]/50 bg-[#E8F5E9]/50' : 'border-[#E0D5C0]'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: RARITY_COLORS[item.rarity] + '15', border: `2px solid ${RARITY_COLORS[item.rarity]}40` }}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#333] text-sm font-bold">{item.name}</span>
                    {item.quantity > 1 && <span className="text-[#888] text-[10px]">x{item.quantity}</span>}
                    {item.equipped && <span className="text-[#4CAF50] text-[9px] font-bold bg-[#4CAF50]/10 px-1.5 py-0.5 rounded">AUSGERÜSTET</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#888] text-[10px]">{item.stat}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ color: RARITY_COLORS[item.rarity], background: RARITY_COLORS[item.rarity] + '20' }}>
                      {item.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {item.type === 'potion' ? (
                  <button onClick={() => usePotion(item.id)}
                    disabled={playerHp >= playerMaxHp}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                      playerHp < playerMaxHp
                        ? 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                        : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                    }`}>
                    BENUTZEN
                  </button>
                ) : (
                  <button onClick={() => handleEquip(item)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                      item.equipped
                        ? 'bg-[#FF9800] text-white hover:bg-[#F57C00]'
                        : 'bg-[#4169E1] text-white hover:bg-[#3558C0]'
                    }`}>
                    {item.equipped ? 'ABLEGEN' : 'ANLEGEN'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

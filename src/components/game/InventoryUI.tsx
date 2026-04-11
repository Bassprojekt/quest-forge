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
  const playerHp = useGameStore(s => s.playerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const equipItem = useGameStore(s => s.equipItem);
  const drinkPotion = useGameStore(s => s.usePotion);
  const sellItem = useGameStore(s => s.sellItem);
  const recalcStats = useGameStore(s => s.recalcStats);
  const [tab, setTab] = useState<'all' | 'weapon' | 'armor' | 'potion' | 'material'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'name' | 'type'>('rarity');
  const [sellMode, setSellMode] = useState(false);

  const filtered = tab === 'all' ? inventory : inventory.filter(i => i.type === tab);
  
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.type.localeCompare(b.type);
  });

  const handleUsePotion = (itemId: string) => {
    drinkPotion(itemId);
  };

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
          <div className="flex items-center gap-2">
            <button onClick={() => setSellMode(!sellMode)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                sellMode ? 'bg-[#FF5722] text-white' : 'bg-[#FF5722]/20 text-[#FF5722] hover:bg-[#FF5722]/30'
              }`}>
              {sellMode ? '✕ VERKAUFEN' : '💰 VERKAUFEN'}
            </button>
            <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          {(['all', 'weapon', 'armor', 'potion', 'material'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                tab === t ? 'bg-[#4169E1] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
              }`}>
              {t === 'all' ? '📦 ALLE' : t === 'weapon' ? '⚔️ WAFFEN' : t === 'armor' ? '🛡️ RÜSTUNG' : t === 'potion' ? '🧪 TRÄNKE' : '🪨 MATERIAL'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 mb-3">
          <span className="text-[10px] text-[#888] self-center">Sortieren:</span>
          {(['rarity', 'name', 'type'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                sortBy === s ? 'bg-[#FF9800] text-white' : 'bg-[#F0F0F0] text-[#888]'
              }`}>
              {s === 'rarity' ? '💎 Rarität' : s === 'name' ? '🔤 Name' : '📦 Typ'}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sorted.length === 0 && (
            <div className="text-center text-[#AAA] text-sm py-8">Keine Items vorhanden</div>
          )}
          {sorted.map(item => (
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
                  {sellMode ? (
                    item.equipped ? (
                      <span className="text-[#999] text-[10px]">Ausgerüstet</span>
                    ) : (
                      <button onClick={() => sellItem(item.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#FF5722] text-white hover:bg-[#E64A19]">
                        +{Math.floor(item.value * 0.5)} 💰
                      </button>
                    )
                  ) : item.type === 'potion' ? (
                    <button onClick={() => handleUsePotion(item.id)}
                      disabled={playerHp >= playerMaxHp}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        playerHp < playerMaxHp
                          ? 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                          : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                      }`}>
                      BENUTZEN
                    </button>
                  ) : item.type === 'material' ? (
                    <span className="text-[#999] text-[10px]">Material</span>
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

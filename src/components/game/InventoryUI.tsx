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

const INVENTORY_SIZE = 30;

export const InventoryUI = ({ onClose }: Props) => {
  const inventory = useGameStore(s => s.inventory);
  const playerHp = useGameStore(s => s.playerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const playerMaxMana = useGameStore(s => s.playerMaxMana);
  const playerMana = useGameStore(s => s.playerMana);
  const playerGold = useGameStore(s => s.playerGold);
  const playerLevel = useGameStore(s => s.playerLevel);
  const playerXp = useGameStore(s => s.playerXp);
  const playerXpToLevel = useGameStore(s => s.playerXpToLevel);
  const equipItem = useGameStore(s => s.equipItem);
  const drinkPotion = useGameStore(s => s.usePotion);
  const sellItem = useGameStore(s => s.sellItem);
  const recalcStats = useGameStore(s => s.recalcStats);
  
  const [tab, setTab] = useState<'all' | 'weapon' | 'armor' | 'potion' | 'material'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'name' | 'type'>('rarity');
  const [sellMode, setSellMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);

  const filtered = tab === 'all' ? inventory : inventory.filter(i => i.type === tab);
  
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.type.localeCompare(b.type);
  });

  const slots = Array(INVENTORY_SIZE).fill(null).map((_, index) => sorted[index] || null);

  const handleUsePotion = (itemId: string) => {
    drinkPotion(itemId);
  };

  const handleQuickSell = (itemId: string) => {
    sellItem(itemId);
  };

  const handleEquip = (item: InventoryItem) => {
    equipItem(item.id);
    setTimeout(recalcStats, 10);
  };

  const handleDragStart = (item: InventoryItem) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const xpPercent = Math.min((playerXp / playerXpToLevel) * 100, 100);
  const hpPercent = Math.min((playerHp / playerMaxHp) * 100, 100);
  const manaPercent = Math.min((playerMana / playerMaxMana) * 100, 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-inventory-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-4 max-w-2xl w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-3">
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

        <div className="bg-[#F5F0E6] rounded-xl p-3 mb-3 border border-[#D4C9B8]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[#FF9800] font-bold">Lv.{playerLevel}</span>
              <span className="text-[#333] text-sm font-bold">{playerGold} 💰</span>
            </div>
            <span className="text-[#888] text-xs">{inventory.length}/{INVENTORY_SIZE} Slots</span>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-[#F44336]">❤️ {playerHp}/{playerMaxHp}</span>
              <span className="text-[#888]">{Math.round(hpPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-[#2196F3]">💧 {playerMana}/{playerMaxMana}</span>
              <span className="text-[#888]">{Math.round(manaPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${manaPercent}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-[#9C27B0]">⭐ {playerXp}/{playerXpToLevel} XP</span>
              <span className="text-[#888]">{Math.round(xpPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all" style={{ width: `${xpPercent}%` }} />
            </div>
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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2 mb-3 max-h-80 overflow-y-auto" onWheel={e => e.stopPropagation()}>
          {slots.map((item, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center relative cursor-pointer transition-all ${
                draggedItem?.id === item?.id ? 'opacity-50' : ''
              } ${
                item
                  ? sellMode
                    ? item.equipped
                      ? 'border-gray-300 bg-gray-100/50'
                      : 'border-[#FF5722]/50 bg-[#FF5722]/10 hover:bg-[#FF5722]/20'
                    : item.equipped
                      ? 'border-[#4CAF50]/50 bg-[#E8F5E9]/50'
                      : 'border-[#E0D5C0] bg-[#F8F6F0] hover:border-[#4169E1] hover:bg-[#E3F2FD]'
                  : 'border-dashed border-[#D0C8B8] bg-[#FDFBF7]'
              }`}
              onClick={() => item && setSelectedItem(item)}
              draggable={!!item}
              onDragStart={() => item && handleDragStart(item)}
              onDragEnd={handleDragEnd}
              style={item ? { borderColor: item.equipped ? RARITY_COLORS[item.rarity] + '80' : RARITY_COLORS[item.rarity] + '40' } : undefined}
            >
              {item && (
                <>
                  <div className="text-2xl">{item.icon}</div>
                  {item.quantity > 1 && (
                    <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                      {item.quantity}
                    </div>
                  )}
                  {item.equipped && (
                    <div className="absolute top-0 left-0 w-2 h-2 bg-[#4CAF50] rounded-full" />
                  )}
                  {sellMode && !item.equipped && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickSell(item.id); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center hover:bg-red-600"
                    >
                      $
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {selectedItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={() => setSelectedItem(null)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-4"
              onClick={e => e.stopPropagation()}
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl"
                  style={{ background: RARITY_COLORS[selectedItem.rarity] + '15', border: `3px solid ${RARITY_COLORS[selectedItem.rarity]}` }}>
                  {selectedItem.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#333] text-lg font-bold">{selectedItem.name}</span>
                    {selectedItem.equipped && (
                      <span className="text-[#4CAF50] text-[9px] font-bold bg-[#4CAF50]/10 px-1.5 py-0.5 rounded">AUSGERÜSTET</span>
                    )}
                  </div>
                  <div className="text-[#888] text-sm">{selectedItem.stat}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ color: RARITY_COLORS[selectedItem.rarity], background: RARITY_COLORS[selectedItem.rarity] + '20' }}>
                      {(selectedItem.rarity || 'common').toUpperCase()}
                    </span>
                    {selectedItem.quantity > 1 && (
                      <span className="text-[#888] text-[10px]">Menge: {selectedItem.quantity}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {sellMode ? (
                  selectedItem.equipped ? (
                    <button disabled className="flex-1 py-2 rounded-lg text-sm font-bold bg-gray-200 text-gray-500 cursor-not-allowed">
                      Ausgerüstet - Cannot Sell
                    </button>
                  ) : (
                    <button onClick={() => { sellItem(selectedItem.id); setSelectedItem(null); }}
                      className="flex-1 py-2 rounded-lg text-sm font-bold bg-[#FF5722] text-white hover:bg-[#E64A19]">
                      Verkaufen für {Math.floor((selectedItem.price || selectedItem.value || 50) * 0.5)} 💰
                    </button>
                  )
                ) : selectedItem.type === 'potion' ? (
                  <button onClick={() => { handleUsePotion(selectedItem.id); setSelectedItem(null); }}
                    disabled={selectedItem.type === 'potion' && playerHp >= playerMaxHp}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                      playerHp < playerMaxHp
                        ? 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}>
                    BENUTZEN
                  </button>
                ) : selectedItem.type === 'crate' ? (
                  <button onClick={() => { handleUsePotion(selectedItem.id); setSelectedItem(null); }}
                    className="flex-1 py-2 rounded-lg text-sm font-bold bg-[#9C27B0] text-white hover:bg-[#7B1FA2]">
                    ÖFFNEN
                  </button>
                ) : selectedItem.type === 'material' ? (
                  <div className="flex-1 py-2 text-center text-sm text-gray-500">
                    Material - Cannot Use
                  </div>
                ) : (
                  <button onClick={() => { handleEquip(selectedItem); setSelectedItem(null); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                      selectedItem.equipped
                        ? 'bg-[#FF9800] text-white hover:bg-[#F57C00]'
                        : 'bg-[#4169E1] text-white hover:bg-[#3558C0]'
                    }`}>
                    {selectedItem.equipped ? 'ABLEGEN' : 'ANLEGEN'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
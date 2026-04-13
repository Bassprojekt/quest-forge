import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

type Tab = 'items' | 'pets' | 'cosmetics';
type ShopType = 'general' | 'weapons' | 'armor' | 'potions';

interface Props {
  onClose: () => void;
  initialTab?: Tab;
  shopType?: ShopType;
  showOnlyPets?: boolean;
}

const SHOP_TITLES: Record<ShopType, string> = {
  general: '🏪 Laden',
  weapons: '⚔️ Waffen',
  armor: '🛡️ Rüstung',
  potions: '🧪 Tränke',
};

export const ShopUI = ({ onClose, initialTab = 'items', shopType = 'general', showOnlyPets = false }: Props) => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const gold = useGameStore(s => s.playerGold);
  const gems = useGameStore(s => s.playerGems);
  const shopItems = useGameStore(s => s.shopItems);
  const cosmeticItems = shopItems.filter(item => item.type === 'cosmetic');
  const pets = useGameStore(s => s.pets);
  const buyItem = useGameStore(s => s.buyItem);
  const buyPet = useGameStore(s => s.buyPet);
  const equipPet = useGameStore(s => s.equipPet);

  const rarityColors: Record<string, string> = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-shop-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#4169E1] font-bold text-lg">{SHOP_TITLES[shopType]}</h2>
          <div className="flex items-center gap-3">
            <span className="text-[#FF9800] text-sm font-bold">💰 {gold}</span>
            <span className="text-[#E040FB] text-sm font-bold">💎 {gems}</span>
            <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {initialTab !== 'pets' && (
            <>
              <button onClick={() => setTab('items')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  tab === 'items' ? 'bg-[#4169E1] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
                }`}>
                🧪 TRÄNKE
              </button>
              <button onClick={() => setTab('pets')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  tab === 'pets' ? 'bg-[#FF69B4] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
                }`}>
                🐾 PETS
              </button>
              <button onClick={() => setTab('cosmetics')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  tab === 'cosmetics' ? 'bg-[#9C27B0] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
                }`}>
                ✨ KOSMETIK ({cosmeticItems.length})
              </button>
            </>
          )}
          {initialTab === 'pets' && (
            <button onClick={() => setTab('pets')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#FF69B4] text-white">
              🐾 PETS
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tab === 'items' && shopItems.filter(item => {
            if (shopType === 'potions') return item.type === 'potion';
            if (shopType === 'weapons') return item.type === 'weapon';
            if (shopType === 'armor') return item.type === 'armor';
            return true;
          }).map(item => (
            <div key={item.id} className="bg-[#F8F6F0] rounded-xl p-3 border border-[#E0D5C0] flex items-center justify-between">
              <div>
                <div className="text-[#333] text-sm font-bold">{item.name}</div>
                <div className="text-[#888] text-[10px]">{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '🧪'} {item.stat}</div>
              </div>
              <div>
                {item.owned ? (
                  <span className="text-[#4CAF50] text-[10px] font-bold">GEKAUFT ✓</span>
                ) : (
                  <button onClick={() => buyItem(item.id)}
                    disabled={gold < item.price}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      gold >= item.price
                        ? 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                        : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                    }`}>
                    {item.price} 💰
                  </button>
                )}
              </div>
            </div>
          ))}

          {tab === 'pets' && pets.map(pet => (
            <div key={pet.id} className="bg-[#F8F6F0] rounded-xl p-3 border border-[#E0D5C0] flex items-center justify-between"
              style={{ borderColor: pet.owned ? rarityColors[pet.rarity] + '60' : undefined }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#333] text-sm font-bold">{pet.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ color: rarityColors[pet.rarity], background: rarityColors[pet.rarity] + '20' }}>
                    {pet.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="text-[#888] text-[10px]">🐾 {pet.bonus}</div>
              </div>
              <div>
                {pet.owned ? (
                  <button onClick={() => equipPet(pet.id)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      pet.equipped ? 'bg-[#FF69B4] text-white' : 'bg-[#F0F0F0] text-[#333] hover:bg-[#E0E0E0]'
                    }`}>
                    {pet.equipped ? '✨ AKTIV' : 'ANLEGEN'}
                  </button>
                ) : (
                  <button onClick={() => buyPet(pet.id)}
                    disabled={gold < pet.price}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      gold >= pet.price
                        ? 'bg-[#FF69B4] text-white hover:bg-[#E91E8C]'
                        : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                    }`}>
                    {pet.price} 💰
                  </button>
                )}
              </div>
            </div>
          ))}

          {tab === 'cosmetics' && cosmeticItems.map(item => (
            <div key={item.id}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{item.icon || '✨'}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-800 text-sm font-bold">{item.name}</span>
                  </div>
                  <div className="text-purple-600 text-[10px] font-semibold">+{item.value}% XP</div>
                </div>
              </div>
              <div>
                {item.owned ? (
                  <span className="text-purple-600 text-[10px] font-bold">✓ GEKAUFT</span>
                ) : (
                  <button onClick={() => buyItem(item.id)}
                    disabled={gems < item.price}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      gems >= item.price
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}>
                    {item.price} 💎
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
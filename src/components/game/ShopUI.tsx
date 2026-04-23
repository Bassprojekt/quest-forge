import { useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { PetTournamentUI } from './PetTournamentUI';

type Tab = 'items' | 'pets' | 'cosmetics' | 'armor';
type ShopType = 'general' | 'weapons' | 'armor' | 'potions';

interface Props {
  onClose: () => void;
  initialTab?: Tab;
  shopType?: ShopType;
  showOnlyPets?: boolean;
  onOpenInventory?: () => void;
}

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  icon: string;
  quantity: number;
}

const SHOP_TITLES: Record<ShopType, string> = {
  general: '🏪 Laden',
  weapons: '⚔️ Waffen',
  armor: '🛡️ Rüstung',
  potions: '🧪 Tränke',
};

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export const ShopUI = ({ onClose, initialTab = 'items', shopType = 'general', showOnlyPets = false, onOpenInventory }: Props) => {
  const isPetOnlyShop = initialTab === 'pets' && !shopType;
  const canSell = !isPetOnlyShop;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showTournament, setShowTournament] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sellMode, setSellMode] = useState(false);
  
  const gold = useGameStore(s => s.playerGold);
  const gems = useGameStore(s => s.playerGems);
  const shopItems = useGameStore(s => s.shopItems);
  const cosmeticItems = shopItems.filter(item => item.type === 'cosmetic');
  const pets = useGameStore(s => s.pets);
  const inventory = useGameStore(s => s.inventory);
  const buyItem = useGameStore(s => s.buyItem);
  const buyPet = useGameStore(s => s.buyPet);
  const equipPet = useGameStore(s => s.equipPet);
  const sellItem = useGameStore(s => s.sellItem);

  const filteredShopItems = shopItems.filter(item => {
    if (shopType === 'potions') return item.type === 'potion';
    if (shopType === 'weapons') return item.type === 'weapon';
    if (shopType === 'armor') return item.type === 'armor';
    if (shopType === 'general') return item.type === 'weapon' || item.type === 'armor';
    return item.type !== 'cosmetic';
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (item: typeof shopItems[0]) => {
    const qty = quantities[item.id] || 1;
    const existing = cart.find(c => c.itemId === item.id);
    if (existing) {
      setCart(cart.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { itemId: item.id, name: item.name, price: item.price, icon: item.icon, quantity: qty }]);
    }
    setQuantities({ ...quantities, [item.id]: 1 });
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => c.itemId === itemId ? { ...c, quantity: Math.min(qty, 9999) } : c));
    }
  };

  const buyAll = () => {
    if (gold >= cartTotal) {
      cart.forEach(c => {
        for (let i = 0; i < c.quantity; i++) {
          buyItem(c.itemId);
        }
      });
      setCart([]);
    }
  };

  const handleSellItem = (itemId: string, qty: number) => {
    for (let i = 0; i < qty; i++) {
      sellItem(itemId);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-shop-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-2 sm:p-4 max-w-4xl w-full mx-2 sm:mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#4169E1] font-bold text-lg">{SHOP_TITLES[shopType]}</h2>
          <div className="flex items-center gap-2">
            {canSell && (
              <button onClick={() => { 
                setSellMode(!sellMode); 
                onOpenInventory?.();
              }}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  sellMode ? 'bg-[#4CAF50] text-white' : 'bg-[#FF5722]/20 text-[#FF5722] hover:bg-[#FF5722]/30'
                }`}>
                {sellMode ? '✅ VERKAUFEN' : '💰 VERKAUFEN'}
              </button>
            )}
            <span className="text-[#FF9800] text-sm font-bold">💰 {gold}</span>
            <span className="text-[#E040FB] text-sm font-bold">💎 {gems}</span>
            <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          {initialTab !== 'pets' && (
            <>
              {shopType === 'general' && (
                <>
                  <button onClick={() => setTab('items')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      tab === 'items' ? 'bg-[#4169E1] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
                    }`}>
                    ⚔️ WAFFEN
                  </button>
                  <button onClick={() => setTab('armor')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      tab === 'armor' ? 'bg-[#4169E1] text-white' : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
                    }`}>
                    🛡️ RÜSTUNG
                  </button>
                </>
              )}
              {shopType !== 'general' && (
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
            </>
          )}
          {initialTab === 'pets' && (
            <div className="flex gap-2">
              <button onClick={() => setTab('pets')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#FF69B4] text-white">
                🐾 PETS
              </button>
              <button onClick={() => setShowTournament(true)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#9C27B0] text-white">
                🏆 TURIER
              </button>
              {showTournament && (
                <PetTournamentUI onClose={() => setShowTournament(false)} />
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: sellMode ? '1fr' : '1fr 1fr' }}>
          {!sellMode && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#333] text-sm font-bold">🏪 Shop</span>
                <span className="text-[#888] text-xs">{filteredShopItems.length} Items</span>
              </div>
              <div className="flex-1 space-y-2 max-h-80 overflow-y-auto p-2 rounded-xl border-2 border-[#E0D5C0] bg-[#F8F6F0]"
                onWheel={e => e.stopPropagation()}>
                {/* Waffen Tab - nur bei shopType=general */}
                {tab === 'items' && shopType === 'general' && shopItems.filter(i => i.type === 'weapon').map(item => (
                  <div key={item.id} className="bg-[#FFF] rounded-lg p-2 border border-[#E0D5C0] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: RARITY_COLORS[item.rarity || 'common'] + '15', border: `2px solid ${RARITY_COLORS[item.rarity || 'common']}40` }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#333] text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[#888] text-[9px]">{item.stat}</div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={quantities[item.id] || 1}
                      onChange={e => setQuantities({ ...quantities, [item.id]: Math.min(9999, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="w-14 px-1 py-0.5 text-xs text-center border border-[#DDD] rounded"
                    />
                    <button onClick={() => addToCart(item)}
                      disabled={item.owned}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.owned ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                      }`}>
                      {item.owned ? '✓' : '+'}
                    </button>
                  </div>
                ))}

                {/* Rüstung Tab - nur bei shopType=general */}
                {tab === 'armor' && shopType === 'general' && shopItems.filter(i => i.type === 'armor').map(item => (
                  <div key={item.id} className="bg-[#FFF] rounded-lg p-2 border border-[#E0D5C0] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: RARITY_COLORS[item.rarity || 'common'] + '15', border: `2px solid ${RARITY_COLORS[item.rarity || 'common']}40` }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#333] text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[#888] text-[9px]">{item.stat}</div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={quantities[item.id] || 1}
                      onChange={e => setQuantities({ ...quantities, [item.id]: Math.min(9999, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="w-14 px-1 py-0.5 text-xs text-center border border-[#DDD] rounded"
                    />
                    <button onClick={() => addToCart(item)}
                      disabled={item.owned}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.owned ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                      }`}>
                      {item.owned ? '✓' : '+'}
                    </button>
                  </div>
                ))}

                {/* Tränke Tab - wenn nicht general */}
                {tab === 'items' && shopType !== 'general' && filteredShopItems.map(item => (
                  <div key={item.id} className="bg-[#FFF] rounded-lg p-2 border border-[#E0D5C0] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: RARITY_COLORS[item.rarity || 'common'] + '15', border: `2px solid ${RARITY_COLORS[item.rarity || 'common']}40` }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#333] text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[#888] text-[9px]">{item.stat}</div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={quantities[item.id] || 1}
                      onChange={e => setQuantities({ ...quantities, [item.id]: Math.min(9999, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="w-14 px-1 py-0.5 text-xs text-center border border-[#DDD] rounded"
                    />
                    <button onClick={() => addToCart(item)}
                      disabled={item.owned}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.owned ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                      }`}>
                      {item.owned ? '✓' : '+'}
                    </button>
                  </div>
                ))}
                
                {tab === 'pets' && pets.filter(p => {
                  const allPets = useGameStore.getState().allPets || [];
                  const isEvolutionForm = allPets.some(ep => ep.id === p.id && ep.evolvedFrom !== null);
                  if (isEvolutionForm) return false;
                  return true;
                }).map(pet => (
                  <div key={pet.id} className="bg-[#FFF] rounded-lg p-2 border border-[#E0D5C0] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: RARITY_COLORS[pet.rarity] + '15', border: `2px solid ${RARITY_COLORS[pet.rarity]}40` }}>
                      🐾
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[#333] text-xs font-bold truncate">{pet.name}</span>
                        <span className="text-[9px] px-1 py-0.5 rounded-full font-semibold"
                          style={{ color: RARITY_COLORS[pet.rarity], background: RARITY_COLORS[pet.rarity] + '20' }}>
                          Lv.{pet.level}
                        </span>
                      </div>
                      <div className="text-[#888] text-[9px]">{pet.bonus}</div>
                    </div>
                    <div>
                      {pet.owned && !pet.inTournament ? (
                        <button onClick={() => equipPet(pet.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pet.equipped ? 'bg-[#FF69B4] text-white' : 'bg-[#F0F0F0] text-[#333]'
                          }`}>
                          {pet.equipped ? '✓' : '👤'}
                        </button>
                      ) : (
                        <button onClick={() => buyPet(pet.id)}
                          disabled={gold < pet.price}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            gold >= pet.price
                              ? 'bg-[#FF69B4] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                          {pet.price}💰
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {tab === 'cosmetics' && cosmeticItems.map(item => (
                  <div key={item.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl">✨</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-purple-800 text-xs font-bold truncate">{item.name}</div>
                      <div className="text-purple-600 text-[9px]">+{item.value}% XP</div>
                    </div>
                    {item.owned ? (
                      <span className="text-purple-600 text-[10px] font-bold">✓</span>
                    ) : (
                      <button onClick={() => addToCart(item)}
                        disabled={gems < item.price}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gems >= item.price
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                        {item.price}💎
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#333] text-sm font-bold">
                {sellMode ? '💰 Deine Items verkaufen' : '🛒 Warenkorb'}
              </span>
              <span className="text-[#888] text-xs">
                {sellMode ? `${inventory.length} Items` : `${cart.length} Artikel`}
              </span>
            </div>
            <div className={`flex-1 space-y-2 max-h-80 overflow-y-auto p-2 rounded-xl border-2 ${
              sellMode 
                ? 'border-[#FF5722] bg-red-50' 
                : 'border-[#4169E1]/30 bg-[#E3F2FD]'
            }`}>
              {sellMode ? (
                inventory.length === 0 ? (
                  <div className="text-center text-[#FF5722] text-sm py-8">
                    Keine Items zum Verkaufen
                  </div>
                ) : (
                  inventory.map(item => {
                    const sellPrice = Math.floor((item.price || item.value || 50) * 0.5);
                    return (
                      <div key={item.id} className={`rounded-lg p-2 border flex items-center gap-2 ${
                        item.equipped 
                          ? 'bg-gray-100 border-gray-300 opacity-60' 
                          : 'bg-white border-[#FF5722]/30'
                      }`}>
                        <div className="text-xl">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#333] text-xs font-bold truncate">
                            {item.name}
                            {item.quantity > 1 && <span className="text-gray-400 text-[9px] ml-1">(x{item.quantity})</span>}
                            {item.equipped && <span className="text-gray-400 text-[9px] ml-1">(Ausgerüstet)</span>}
                          </div>
                          <div className="text-[#888] text-[9px]">
                            {item.equipped ? 'Nicht verkaufbar' : `+${sellPrice} 💰/Stück`}
                          </div>
                        </div>
                        {!item.equipped && item.quantity > 1 && (
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            defaultValue={1}
                            className="w-12 px-1 py-0.5 text-xs text-center border border-[#DDD] rounded"
                          />
                        )}
                        {!item.equipped && (
                          <button onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            const qty = input ? parseInt(input.value) || 1 : 1;
                            handleSellItem(item.id, qty);
                          }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5722] text-white hover:bg-[#E64A19]">
                            $
                          </button>
                        )}
                      </div>
                    );
                  })
                )
              ) : cart.length === 0 ? (
                <div className="text-center text-[#4169E1] text-sm py-8">
                  Warenkorb ist leer
                </div>
              ) : (
                cart.map(c => (
                  <div key={c.itemId} className="bg-white rounded-lg p-2 border border-[#4169E1]/20 flex items-center gap-2">
                    <div className="text-xl">{c.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#333] text-xs font-bold truncate">{c.name}</div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={c.quantity}
                      onChange={e => updateCartQuantity(c.itemId, Math.min(9999, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-14 px-1 py-0.5 text-xs text-center border border-[#DDD] rounded"
                    />
                    <button onClick={() => removeFromCart(c.itemId)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 hover:bg-red-200">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={`mt-2 p-3 rounded-xl border ${
              sellMode 
                ? 'bg-red-50 border-[#FF5722]/30' 
                : 'bg-[#FFF8E1] border-[#FF9800]/30'
            }`}>
              {sellMode ? (
                <div className="text-center">
                  <span className="text-[#FF5722] text-sm font-bold">
                    Wähle die Menge und klicke auf $
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#333] text-sm font-bold">Gesamtpreis:</span>
                    <span className={`text-lg font-bold ${gold >= cartTotal ? 'text-[#FF9800]' : 'text-red-500'}`}>
                      {cartTotal} 💰
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCart([])}
                      className="flex-1 py-2 rounded-lg text-sm font-bold bg-gray-200 text-gray-600 hover:bg-gray-300">
                      Leeren
                    </button>
                    <button onClick={buyAll}
                      disabled={cart.length === 0 || gold < cartTotal}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                        cart.length > 0 && gold >= cartTotal
                          ? 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}>
                      Kaufen ({cart.reduce((sum, c) => sum + c.quantity, 0)}x)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showTournament && <PetTournamentUI onClose={() => setShowTournament(false)} />}
    </div>
  );
};
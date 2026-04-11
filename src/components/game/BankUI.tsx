import { useState } from 'react';
import { useBankStore, BankItem } from '@/store/bankStore';
import { useGameStore, InventoryItem } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

interface Props {
  onClose: () => void;
}

export const BankUI = ({ onClose }: Props) => {
  const bankGold = useBankStore(s => s.bankGold);
  const bankItems = useBankStore(s => s.bankItems);
  const isPinSet = useBankStore(s => s.isPinSet);
  const isUnlocked = useBankStore(s => s.isUnlocked);
  const setPin = useBankStore(s => s.setPin);
  const verifyPin = useBankStore(s => s.verifyPin);
  const unlock = useBankStore(s => s.unlock);
  const lock = useBankStore(s => s.lock);
  const depositGold = useBankStore(s => s.depositGold);
  const withdrawGold = useBankStore(s => s.withdrawGold);
  const depositItem = useBankStore(s => s.depositItem);
  const withdrawItem = useBankStore(s => s.withdrawItem);
  
  const playerGold = useGameStore(s => s.playerGold);
  const playerInventory = useGameStore(s => s.inventory);
  const addGold = useGameStore(s => s.addGold);
  const addToInventory = useGameStore(s => s.addToInventory);
  const removeFromInventory = useGameStore(s => s.removeFromInventory);
  
  const language = useSettingsStore(s => s.language);
  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.de[key] || key;

  const [pinInput, setPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [goldAmount, setGoldAmount] = useState('');
  const [goldError, setGoldError] = useState('');

  const handlePinSubmit = () => {
    if (!isPinSet) {
      if (newPinInput.length === 4 && /^\d+$/.test(newPinInput)) {
        setPin(newPinInput);
        unlock();
        setPinError('');
      } else {
        setPinError('4-stellige PIN eingeben');
      }
    } else {
      if (verifyPin(pinInput)) {
        unlock();
        setPinError('');
      } else {
        setPinError('Falsche PIN');
      }
    }
  };

  const handleDepositGold = () => {
    const amount = parseInt(goldAmount);
    if (isNaN(amount) || amount <= 0) {
      setGoldError('Ungültige Menge');
      return;
    }
    if (amount > playerGold) {
      setGoldError('Nicht genug Gold');
      return;
    }
    addGold(-amount);
    depositGold(amount);
    setGoldAmount('');
    setGoldError('');
  };

  const handleWithdrawGold = () => {
    const amount = parseInt(goldAmount);
    if (isNaN(amount) || amount <= 0) {
      setGoldError('Ungültige Menge');
      return;
    }
    if (withdrawGold(amount)) {
      addGold(amount);
      setGoldAmount('');
      setGoldError('');
    } else {
      setGoldError('Nicht genug Gold in der Bank');
    }
  };

  const handleDepositItem = (item: InventoryItem) => {
    depositItem({
      id: item.id,
      name: item.name,
      type: item.type,
      icon: item.icon,
      stat: item.stat,
      value: item.value,
      quantity: item.quantity,
      rarity: item.rarity,
    });
    removeFromInventory(item.id, item.quantity);
  };

  const handleWithdrawItem = (itemId: string) => {
    const item = bankItems.find(i => i.id === itemId);
    if (item && withdrawItem(itemId, 1)) {
      addToInventory({
        id: item.id,
        name: item.name,
        type: item.type,
        icon: item.icon,
        stat: item.stat,
        value: item.value,
        quantity: 1,
        rarity: item.rarity,
        equipped: false,
      });
    }
  };

  const rarityColors: Record<string, string> = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
        style={{ fontFamily: "'Fredoka', sans-serif" }}
        data-bank-open="true">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#FFD700] rounded-2xl p-6 max-w-md w-full mx-4"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#FFD700] font-bold text-xl">🏦 Bank</h2>
            <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
          </div>

          <div className="text-center py-6">
            <div className="text-6xl mb-4">🏦</div>
            
            {!isPinSet ? (
              <>
                <p className="text-gray-600 mb-4">Erstelle eine 4-stellige PIN für dein Bankkonto:</p>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-32 text-center text-2xl letter-spacing px-4 py-2 rounded-xl border-2 border-[#FFD700] focus:border-[#FFD700] outline-none mb-2"
                />
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">Gib deine 4-stellige PIN ein:</p>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="****"
                  className="w-32 text-center text-2xl letter-spacing px-4 py-2 rounded-xl border-2 border-[#FFD700] focus:border-[#FFD700] outline-none mb-2"
                />
              </>
            )}
            
            {pinError && <p className="text-red-500 text-sm mb-2">{pinError}</p>}

            <button
              onClick={handlePinSubmit}
              className="bg-[#FFD700] text-gray-800 px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#FFC107] transition-colors"
            >
              {isPinSet ? 'PIN bestätigen' : 'PIN erstellen'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#FFD700] rounded-2xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#FFD700] font-bold text-xl">🏦 Bank</h2>
          <div className="flex items-center gap-3">
            <span className="text-[#FFD700] text-sm font-bold">💰 {bankGold} Gold</span>
            <button onClick={lock} className="text-xs text-gray-500 hover:text-gray-700">🔒</button>
            <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'deposit' 
                ? 'bg-[#FFD700] text-gray-800' 
                : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
            }`}
          >
            📥 Einzahlen
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'withdraw' 
                ? 'bg-[#FFD700] text-gray-800' 
                : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
            }`}
          >
            📤 Abheben
          </button>
        </div>

        {/* Gold Section */}
        <div className="bg-[#F8F6F0] rounded-xl p-4 mb-4 border border-[#E0D5C0]">
          <h3 className="text-gray-600 font-bold mb-2">Gold {activeTab === 'deposit' ? 'einzahlen' : 'abheben'}</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
              placeholder="Menge"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-[#E0D5C0] focus:border-[#FFD700] outline-none"
            />
            <button
              onClick={activeTab === 'deposit' ? handleDepositGold : handleWithdrawGold}
              className="bg-[#FFD700] text-gray-800 px-4 py-2 rounded-xl font-bold hover:bg-[#FFC107]"
            >
              {activeTab === 'deposit' ? '+' : '-'}
            </button>
          </div>
          {goldError && <p className="text-red-500 text-sm mt-1">{goldError}</p>}
          <p className="text-gray-500 text-xs mt-2">Dein Gold: {playerGold}</p>
        </div>

        {/* Items Section */}
        <div>
          <h3 className="text-gray-600 font-bold mb-2">
            {activeTab === 'deposit' ? '📦 Items einzahlen' : '📦 Items abheben'} ({activeTab === 'deposit' ? playerInventory.length : bankItems.length})
          </h3>
          
          {activeTab === 'deposit' ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {playerInventory.filter(i => !i.equipped).map((item) => (
                <div key={item.id} className="bg-[#F8F6F0] rounded-xl p-3 flex items-center justify-between border border-[#E0D5C0]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">Menge: {item.quantity}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDepositItem(item)}
                    className="bg-[#FFD700] text-gray-800 px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#FFC107]"
                  >
                    +
                  </button>
                </div>
              ))}
              {playerInventory.filter(i => !i.equipped).length === 0 && (
                <p className="text-center text-gray-400 py-4">KeineItems zum Einzahlen</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bankItems.map((item) => (
                <div key={item.id} className="bg-[#F8F6F0] rounded-xl p-3 flex items-center justify-between border border-[#E0D5C0]"
                  style={{ borderColor: rarityColors[item.rarity] + '60' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">Menge: {item.quantity}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleWithdrawItem(item.id)}
                    className="bg-[#FFD700] text-gray-800 px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#FFC107]"
                  >
                    -
                  </button>
                </div>
              ))}
              {bankItems.length === 0 && (
                <p className="text-center text-gray-400 py-4">Keine Items in der Bank</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useGuildStore, GuildItem } from '@/store/guildStore';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

interface Props {
  onClose: () => void;
}

export const GuildUI = ({ onClose }: Props) => {
  const guild = useGuildStore(s => s.guild);
  const hasGuild = useGuildStore(s => s.hasGuild);
  const createGuild = useGuildStore(s => s.createGuild);
  const leaveGuild = useGuildStore(s => s.leaveGuild);
  const playerGold = useGameStore(s => s.playerGold);
  const addBankGold = useGuildStore(s => s.addBankGold);
  const withdrawBankGold = useGuildStore(s => s.withdrawBankGold);
  const addBankItem = useGuildStore(s => s.addBankItem);
  const withdrawBankItem = useGuildStore(s => s.withdrawBankItem);
  const playerClass = useGameStore(s => s.playerClass);
  const language = useSettingsStore(s => s.language);
  const addGold = useGameStore(s => s.addGold);
  
  const [newGuildName, setNewGuildName] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'bank'>('members');
  const [goldAmount, setGoldAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.de[key] || key;

  const handleCreateGuild = () => {
    if (!newGuildName.trim()) {
      setError('Bitte einen Namen eingeben');
      return;
    }
    if (newGuildName.length < 3) {
      setError('Name muss mindestens 3 Zeichen haben');
      return;
    }
    if (newGuildName.length > 20) {
      setError('Name darf maximal 20 Zeichen haben');
      return;
    }
    createGuild(newGuildName.trim(), 'Du', playerClass || 'Krieger');
    setError('');
  };

  const handleDepositGold = () => {
    const amount = parseInt(goldAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Ungültige Menge');
      return;
    }
    if (amount > playerGold) {
      setDepositError('Nicht genug Gold');
      return;
    }
    if (guild && addBankGold(amount)) {
      addGold(-amount);
      setGoldAmount('');
      setDepositError('');
    }
  };

  const handleWithdrawGold = () => {
    const amount = parseInt(goldAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Ungültige Menge');
      return;
    }
    if (withdrawBankGold(amount)) {
      addGold(amount);
      setGoldAmount('');
      setDepositError('');
    } else {
      setDepositError('Nicht genug Gold in der Bank');
    }
  };

  const rankColors: Record<string, string> = {
    leader: '#FFD700',
    officer: '#4169E1',
    member: '#9E9E9E',
  };

  const rankNames: Record<string, string> = {
    leader: 'Anführer',
    officer: 'Offizier',
    member: 'Mitglied',
  };

  const classIcons: Record<string, string> = {
    warrior: '⚔️',
    mage: '🔮',
    archer: '🏹',
  };

  const rarityColors: Record<string, string> = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  };

  if (!hasGuild) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
        style={{ fontFamily: "'Fredoka', sans-serif" }}
        data-guild-open="true">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#4169E1] rounded-2xl p-6 max-w-md w-full mx-4"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#4169E1] font-bold text-xl">🏛️ Gilde erstellen</h2>
            <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
          </div>

          <div className="text-center py-6">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-gray-600 mb-6">Du hast noch keine Gilde. Erstelle deine eigene Gilde und finde Mitstreiter!</p>
            
            <div className="mb-4">
              <input
                type="text"
                value={newGuildName}
                onChange={(e) => setNewGuildName(e.target.value)}
                placeholder="Gildenname..."
                className="w-full px-4 py-2 rounded-xl border-2 border-[#E0D5C0] focus:border-[#4169E1] outline-none text-center"
                maxLength={20}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              onClick={handleCreateGuild}
              className="bg-[#4169E1] text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#3658B8] transition-colors"
            >
              Gilde erstellen
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
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#4169E1] rounded-2xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#4169E1] font-bold text-xl">🏛️ {guild?.name}</h2>
          <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'members' 
                ? 'bg-[#4169E1] text-white' 
                : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
            }`}
          >
            👥 Mitglieder
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'bank' 
                ? 'bg-[#FF9800] text-white' 
                : 'bg-[#F0F0F0] text-[#888] hover:text-[#333]'
            }`}
          >
            🏦 Bank
          </button>
        </div>

        {activeTab === 'members' ? (
          <>
            {/* Guild Level */}
            <div className="bg-gradient-to-r from-[#4169E1] to-[#6B8DD6] rounded-xl p-4 mb-4 text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Gilden-Level {guild?.level}</span>
                <span className="text-sm">XP: {guild?.xp} / {guild?.xpToNextLevel}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div 
                  className="bg-yellow-400 h-3 rounded-full transition-all"
                  style={{ width: `${((guild?.xp || 0) / (guild?.xpToNextLevel || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Members */}
            <div className="mb-4">
              <h3 className="text-gray-600 font-bold mb-2">👥 Mitglieder ({guild?.members.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {guild?.members.map((member, i) => (
                  <div key={i} className="bg-[#F8F6F0] rounded-xl p-3 flex items-center justify-between border border-[#E0D5C0]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{classIcons[member.class] || '⚔️'}</span>
                      <div>
                        <div className="font-bold text-gray-800">{member.name}</div>
                        <div className="text-xs text-gray-500">Lv. {member.level}</div>
                      </div>
                    </div>
                    <div 
                      className="px-2 py-1 rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: rankColors[member.rank] }}
                    >
                      {rankNames[member.rank]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Guild Bank */}
            <div className="bg-gradient-to-r from-[#FF9800] to-[#FFB74D] rounded-xl p-4 mb-4 text-white">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">💰 Gilden-Bank</span>
                <span className="text-xl font-bold">{guild?.bankGold || 0} Gold</span>
              </div>
            </div>

            {/* Gold Deposit/Withdraw */}
            <div className="bg-[#F8F6F0] rounded-xl p-4 mb-4 border border-[#E0D5C0]">
              <h3 className="text-gray-600 font-bold mb-2">Gold einzahlen / abheben</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={goldAmount}
                  onChange={(e) => setGoldAmount(e.target.value)}
                  placeholder="Menge"
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-[#E0D5C0] focus:border-[#FF9800] outline-none"
                />
                <button
                  onClick={handleDepositGold}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600"
                >
                  +
                </button>
                <button
                  onClick={handleWithdrawGold}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600"
                >
                  -
                </button>
              </div>
              {depositError && <p className="text-red-500 text-sm mt-1">{depositError}</p>}
              <p className="text-gray-500 text-xs mt-2">Dein Gold: {playerGold}</p>
            </div>

            {/* Bank Items */}
            <div>
              <h3 className="text-gray-600 font-bold mb-2">📦 Bank-Items ({guild?.bankItems.length || 0})</h3>
              {guild?.bankItems && guild.bankItems.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {guild.bankItems.map((item, i) => (
                    <div key={i} className="bg-[#F8F6F0] rounded-xl p-3 flex items-center justify-between border border-[#E0D5C0]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-bold text-gray-800" style={{ color: rarityColors[item.rarity] }}>
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">Menge: {item.quantity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4 bg-[#F8F6F0] rounded-xl">
                  <p>Keine Items in der Bank</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-[#4169E1] text-white py-2 rounded-xl font-bold hover:bg-[#3658B8]"
          >
            Schließen
          </button>
          <button
            onClick={leaveGuild}
            className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold hover:bg-red-600"
          >
            Gilde verlassen
          </button>
        </div>
      </div>
    </div>
  );
};
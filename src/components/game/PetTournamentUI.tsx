import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

interface PetBattle {
  id: string;
  playerPetId: string;
  enemyPetId: string;
  playerHp: number;
  enemyHp: number;
  rounds: number;
  reward: number;
}

const ENEMY_PETS = [
  { name: 'Wild Wolf', level: 1, hp: 50, damage: 8 },
  { name: 'Straßenkatze', level: 3, hp: 80, damage: 12 },
  { name: 'Wild Drache', level: 6, hp: 150, damage: 20 },
  { name: 'Kampfphönix', level: 10, hp: 250, damage: 30 },
  { name: 'Eis Löwe', level: 15, hp: 400, damage: 45 },
  { name: 'Donner Tiger', level: 20, hp: 550, damage: 60 },
  { name: 'König Drache', level: 30, hp: 800, damage: 80 },
  { name: 'Legendärer Phönix', level: 50, hp: 1200, damage: 120 },
];

const HOUR_OPTIONS = [
  { hours: 1, label: '1 Stunde' },
  { hours: 2, label: '2 Stunden' },
  { hours: 3, label: '3 Stunden' },
  { hours: 4, label: '4 Stunden' },
  { hours: 12, label: '12 Stunden' },
  { hours: 24, label: '24 Stunden' },
];

export const PetTournamentUI = ({ onClose }: { onClose: () => void }) => {
  const pets = useGameStore(s => s.pets);
  const forceUpdate = useGameStore(s => s.playerGold); // Force re-render on any store change
  const ownedPets = pets.filter(p => p.owned);
  const tournamentPets = ownedPets.filter(p => p.inTournament);
  const playerGold = useGameStore(s => s.playerGold);
  const addGold = useGameStore(s => s.addGold);
  const addPetXp = useGameStore(s => s.addPetXp);
  const sendPetToTournament = useGameStore(s => s.sendPetToTournament);
  const removePetFromTournament = useGameStore(s => s.removePetFromTournament);
  const evolvePet = useGameStore(s => s.evolvePet);
  
  const [activeTab, setActiveTab] = useState<'manual' | 'auto' | 'pets'>('manual');
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState(1);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isBattling, setIsBattling] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<PetBattle | null>(null);
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const startBattle = () => {
    if (!selectedPet) return;
    const pet = pets.find(p => p.id === selectedPet);
    if (!pet) return;
    if (playerGold < 100) return;
    if (pet.inTournament) return;
    
    addGold(-100);
    
    const baseLevel = pet.level || 1;
    const enemyIndex = Math.floor(Math.random() * ENEMY_PETS.length);
    const baseEnemy = ENEMY_PETS[enemyIndex];
    const levelDiff = baseLevel - baseEnemy.level;
    let enemyHp = Math.max(30, baseEnemy.hp + levelDiff * 20);
    let enemyDmg = Math.max(5, baseEnemy.damage + levelDiff * 3);
    const enemy = { ...baseEnemy, hp: enemyHp, damage: enemyDmg };
    const playerMaxHp = (pet.level || 1) * 50;
    const playerDamage = pet.bonusType === 'damage' ? (pet.level || 1) * 5 * (1 + pet.bonusValue) : (pet.level || 1) * 5;
    const playerDefense = pet.bonusType === 'defense' ? pet.bonusValue : 0;
    
    setIsBattling(true);
    setBattleLog([]);
    setBattleResult(null);
    
    const battle: PetBattle = {
      id: Date.now().toString(),
      playerPetId: selectedPet,
      enemyPetId: enemy.name,
      playerHp: playerMaxHp,
      enemyHp: enemy.hp,
      rounds: 0,
      reward: enemy.level * 100 + (enemy.level >= 15 ? 1 : 0) + (enemy.level >= 30 ? 2 : 0),
    };
    setCurrentBattle(battle);
    
    let currentPlayerHp = playerMaxHp;
    let currentEnemyHp = enemy.hp;
    const logs: string[] = [];
    
    while (currentPlayerHp > 0 && currentEnemyHp > 0) {
      battle.rounds++;
      
      const playerCrit = Math.random() < 0.2;
      const actualPlayerDamage = playerCrit ? playerDamage * 2 : playerDamage;
      currentEnemyHp -= actualPlayerDamage;
      logs.push(`Dein ${pet.name} greift an${playerCrit ? ' (KRITISCH!)' : ''}! ${enemy.name} hat noch ${Math.max(0, currentEnemyHp)} HP`);
      
      if (currentEnemyHp <= 0) break;
      
      const enemyCrit = Math.random() < 0.15;
      const reducedDamage = Math.max(1, enemy.damage * (1 - playerDefense));
      const actualEnemyDamage = enemyCrit ? reducedDamage * 2 : reducedDamage;
      currentPlayerHp -= actualEnemyDamage;
      logs.push(`${enemy.name} greift an${enemyCrit ? ' (KRITISCH!)' : ''}! Dein ${pet.name} hat noch ${Math.max(0, currentPlayerHp)} HP`);
    }
    
    setBattleLog(logs);
    
    setTimeout(() => {
      if (currentEnemyHp <= 0) {
        setBattleResult('win');
        addGold(battle.reward);
        addPetXp(selectedPet, 10);
      } else {
        setBattleResult('lose');
      }
      setIsBattling(false);
    }, logs.length * 500);
  };
  
  const handleSendToTournament = () => {
    if (!selectedPet) return;
    sendPetToTournament(selectedPet, selectedHours);
    setSelectedPet(null);
  };
  
  const handleRemoveFromTournament = (petId: string) => {
    removePetFromTournament(petId);
  };
  
  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Abgeschlossen!';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md border-2 border-purple-300 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onWheel={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-purple-600 font-bold text-xl">🐾 Pet-Turnier Arena</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'manual' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
            ⚔️ Manuell
          </button>
          <button onClick={() => setActiveTab('auto')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'auto' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
            🤖 Auto-Senden
          </button>
          <button onClick={() => setActiveTab('pets')}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'pets' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
            🐾 Meine Pets
          </button>
        </div>
        
        {activeTab === 'manual' && (
          <>
            {!isBattling && !battleResult && (
              <>
                <div className="space-y-2 mb-4">
                  {ownedPets.filter(p => !p.inTournament).map(pet => (
                    <div 
                      key={pet.id}
                      onClick={() => setSelectedPet(pet.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPet === pet.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-800">{pet.name} Lv.{pet.level || 1}</div>
                          <div className="text-xs text-gray-500">Level {pet.level || 1} | {pet.bonus}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{pet.rarity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={startBattle}
                  disabled={!selectedPet || playerGold < 100}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    selectedPet && playerGold >= 100
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  ⚔️ Kampf starten (100 Gold)
                </button>
              </>
            )}
            
            {isBattling && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚔️</div>
                <div className="text-xl font-bold text-gray-800 mb-2">Kampf läuft...</div>
              </div>
            )}
            
            {battleResult && (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">{battleResult === 'win' ? '🏆' : '💀'}</div>
                <div className={`text-2xl font-bold mb-4 ${battleResult === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                  {battleResult === 'win' ? 'Sieg!' : 'Niederlage!'}
                </div>
                <button 
                  onClick={() => { setBattleResult(null); setBattleLog([]); setCurrentBattle(null); }}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  Noch ein Kampf
                </button>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'auto' && (
          <>
            <div className="mb-4">
              <div className="space-y-2 mb-4">
                {ownedPets.filter(p => !p.inTournament).map(pet => (
                  <div 
                    key={pet.id}
                    onClick={() => setSelectedPet(pet.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPet === pet.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800">{pet.name} Lv.{pet.level || 1}</div>
                        <div className="text-xs text-gray-500">Level {pet.level || 1} | {pet.bonus}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPet && (
                <>
                  <div className="mb-3">
                    <label className="text-sm font-bold text-gray-600 block mb-2">Dauer:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HOUR_OPTIONS.map(opt => (
                        <button
                          key={opt.hours}
                          onClick={() => setSelectedHours(opt.hours)}
                          className={`py-2 rounded-lg text-sm font-bold transition-all ${
                            selectedHours === opt.hours
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {opt.label} ({opt.hours * 200}💰)
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSendToTournament}
                    disabled={!selectedPet || playerGold < selectedHours * 200}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                      selectedPet && playerGold >= selectedHours * 200
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    🚀 Ins Turnier senden ({selectedHours * 200}💰)
                  </button>
                </>
              )}
            </div>
            
            {tournamentPets.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-700">🏟️ Aktive Turnier-Pets</h3>
                  <button onClick={() => setTick(t => t + 1)} className="text-xs bg-purple-500 text-white px-2 py-1 rounded">🔄</button>
                </div>
                <div className="space-y-2">
                  {tournamentPets.map(pet => (
                    <div key={pet.id} className="p-3 rounded-xl border-2 border-purple-200 bg-purple-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-800">{pet.name} Lv.{pet.level || 1}</div>
                          <div className="text-xs text-gray-500">
                            ⏱️ {formatTimeRemaining(pet.tournamentEndTime)}
                          </div>
                          <div className="mt-1 text-xs text-purple-600 font-bold">
                            XP: {pet.xp || 0} / {((pet.level || 1) * 100)} (wins: {pet.tournamentWins})
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                            <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((pet.xp || 0) / ((pet.level || 1) * 100)) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600">S: {pet.tournamentWins}</div>
                          <div className="text-xs text-red-600">N: {pet.tournamentLosses}</div>
                          <button
                            onClick={() => handleRemoveFromTournament(pet.id)}
                            className="mt-1 px-2 py-1 bg-purple-500 text-white text-xs rounded-lg"
                          >
                            Zurückholen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'pets' && (
          <>
            <div className="space-y-2">
              {ownedPets.map(pet => {
                const canEvolve = (pet.level || 1) >= (pet.maxLevel || 10);
                return (
                  <div key={pet.id} className="p-3 rounded-xl border-2 border-gray-200 bg-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800">{pet.name} Lv.{pet.level || 1}</div>
                        <div className="text-xs text-gray-500">{pet.bonus} | {pet.rarity}</div>
                        <div className="mt-1 text-xs text-purple-600 font-bold">
                          XP: {pet.xp || 0} / {((pet.level || 1) * 100)} (Max: {pet.maxLevel || 10})
                        </div>
                        <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((pet.xp || 0) / ((pet.maxLevel || 10) * 100)) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="text-right">
                        {canEvolve && (
                          <button
                            onClick={() => evolvePet(pet.id)}
                            className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-lg"
                          >
                            ✨ Evolvieren
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
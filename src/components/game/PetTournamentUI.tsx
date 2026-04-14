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

export const PetTournamentUI = ({ onClose }: { onClose: () => void }) => {
  const pets = useGameStore(s => s.pets);
  const ownedPets = pets.filter(p => p.owned);
  const playerGold = useGameStore(s => s.playerGold);
  const addGold = useGameStore(s => s.addGold);
  const addPetXp = useGameStore(s => s.addPetXp);
  
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isBattling, setIsBattling] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<PetBattle | null>(null);
  
  const ENEMY_PETS = [
    { name: 'Wild Wolf', level: 5, hp: 50, damage: 10 },
    { name: 'Straßenkatze', level: 8, hp: 80, damage: 15 },
    { name: 'Wild Drache', level: 15, hp: 150, damage: 30 },
    { name: 'Kampfphönix', level: 20, hp: 200, damage: 40 },
  ];
  
  const startBattle = () => {
    if (!selectedPet) return;
    const pet = pets.find(p => p.id === selectedPet);
    if (!pet) return;
    
    const enemy = ENEMY_PETS[Math.floor(Math.random() * ENEMY_PETS.length)];
    const playerMaxHp = pet.level * 50;
    const playerDamage = pet.bonusType === 'damage' ? pet.level * 5 * (1 + pet.bonusValue) : pet.level * 5;
    
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
      reward: enemy.level * 100,
    };
    setCurrentBattle(battle);
    
    // Battle simulation
    let currentPlayerHp = playerMaxHp;
    let currentEnemyHp = enemy.hp;
    const logs: string[] = [];
    
    while (currentPlayerHp > 0 && currentEnemyHp > 0) {
      battle.rounds++;
      
      currentEnemyHp -= playerDamage;
      logs.push(`Dein ${pet.name} greift an! ${enemy.name} hat noch ${Math.max(0, currentEnemyHp)} HP`);
      
      if (currentEnemyHp <= 0) break;
      
      currentPlayerHp -= enemy.damage;
      logs.push(`${enemy.name} greift an! Dein ${pet.name} hat noch ${Math.max(0, currentPlayerHp)} HP`);
    }
    
    setBattleLog(logs);
    
    setTimeout(() => {
      if (currentEnemyHp <= 0) {
        setBattleResult('win');
        addGold(battle.reward);
        addPetXp(selectedPet, enemy.level * 50);
      } else {
        setBattleResult('lose');
      }
      setIsBattling(false);
    }, logs.length * 500);
  };
  
  const selectedPetData = selectedPet ? pets.find(p => p.id === selectedPet) : null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md border-2 border-purple-300 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-purple-600 font-bold text-xl">🐾 Pet-Turnier Arena</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        {!isBattling && !battleResult && (
          <>
            <p className="text-gray-600 text-sm mb-4">
              Wähle dein Pet für das Turnier! Gewonnene Kämpfe geben Gold und XP.
            </p>
            
            <div className="space-y-2 mb-4">
              {ownedPets.map(pet => (
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
                      <div className="font-bold text-gray-800">{pet.name}</div>
                      <div className="text-xs text-gray-500">Level {pet.level} | {pet.bonus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-purple-500">XP: {pet.xp}/{pet.maxLevel * 100}</div>
                      <div className="text-xs text-gray-400">{pet.rarity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={startBattle}
              disabled={!selectedPet}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                selectedPet 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
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
            <div className="text-gray-500">Runde {currentBattle?.rounds || 0}</div>
          </div>
        )}
        
        {battleResult && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">{battleResult === 'win' ? '🏆' : '💀'}</div>
            <div className={`text-2xl font-bold mb-4 ${battleResult === 'win' ? 'text-green-600' : 'text-red-600'}`}>
              {battleResult === 'win' ? 'Sieg!' : 'Niederlage!'}
            </div>
            
            {battleResult === 'win' && (
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <div className="text-green-600 font-bold">+{currentBattle?.reward || 0} Gold</div>
                <div className="text-green-500 text-sm">+{Math.floor((currentBattle?.rounds || 0) * 10)} Pet XP</div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left max-h-40 overflow-y-auto">
              <div className="text-xs font-bold text-gray-500 mb-2">Kampf-Log:</div>
              {battleLog.map((log, i) => (
                <div key={i} className="text-xs text-gray-600 mb-1">{log}</div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                setBattleResult(null);
                setBattleLog([]);
                setCurrentBattle(null);
              }}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              Noch ein Kampf
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
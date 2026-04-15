import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export const PetBuffUI = ({ onClose }: { onClose: () => void }) => {
  const pets = useGameStore(s => s.pets);
  const playerPetSlots = useGameStore(s => s.playerPetSlots);
  const playerGems = useGameStore(s => s.playerGems);
  const equipPet = useGameStore(s => s.equipPet);
  const unlockPetSlot = useGameStore(s => s.unlockPetSlot);

  // ESC zum Schließen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  const equippedPets = pets.filter(p => p.equipped);
  const availablePets = pets.filter(p => p.owned && !p.equipped);
  const slotCosts = [100, 200, 300, 400];
  const nextSlotCost = slotCosts[playerPetSlots - 1];
  const canUnlockMore = playerPetSlots < 5 && playerGems >= nextSlotCost;
  
  const rarityColors: Record<string, string> = {
    common: '#FFD700',
    rare: '#4169E1',
    epic: '#9C27B0',
    legendary: '#FF5722',
  };
  
  const bonusIcons: Record<string, string> = {
    damage: '⚔️',
    defense: '🛡️',
    speed: '⚡',
    crit: '🎯',
    heal: '💖',
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[70] flex items-center justify-center" 
      data-shop-open="true"
      style={{ fontFamily: "'Fredoka', sans-serif" }}>
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onClose} />
      
      <div className="relative pointer-events-auto bg-gradient-to-b from-purple-900 to-indigo-900 border-4 border-purple-500 rounded-2xl p-6 w-[450px] max-h-[80vh] overflow-auto"
        style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🐾 Pet Buff System</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        
        {/* Aktive Pets mit Buffs */}
        <div className="mb-4">
          <div className="text-purple-300 text-sm font-bold mb-2">Aktive Buffs</div>
          <div className="space-y-2">
            {equippedPets.map(pet => (
              <div key={pet.id} className="bg-purple-800/50 rounded-xl p-3 flex items-center justify-between border border-purple-600">
                <div className="flex items-center gap-3">
                  <div className="text-3xl" style={{ color: rarityColors[pet.rarity] }}>●</div>
                  <div>
                    <div className="text-white font-bold">{pet.name} Lv.{pet.level}</div>
                    <div className="text-purple-300 text-xs">
                      {bonusIcons[pet.bonusType]} {pet.bonus}
                    </div>
                  </div>
                </div>
                <button onClick={() => equipPet(pet.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold">
                  Entfernen
                </button>
              </div>
            ))}
            {equippedPets.length === 0 && (
              <div className="text-purple-400 text-center py-4 text-sm">
                Keine Pets ausgerüstet
              </div>
            )}
          </div>
        </div>
        
        {/* Verfügbare Pets */}
        <div className="mb-4">
          <div className="text-purple-300 text-sm font-bold mb-2">Verfügbare Pets</div>
          <div className="space-y-2 max-h-40 overflow-auto">
            {availablePets.map(pet => (
              <div key={pet.id} className="bg-purple-800/30 rounded-xl p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xl" style={{ color: rarityColors[pet.rarity] }}>●</div>
                  <div>
                    <div className="text-white text-sm font-bold">{pet.name} Lv.{pet.level}</div>
                    <div className="text-purple-400 text-xs">{bonusIcons[pet.bonusType]} {pet.bonus}</div>
                  </div>
                </div>
                <button onClick={() => equipPet(pet.id)}
                  disabled={equippedPets.length >= playerPetSlots}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    equippedPets.length >= playerPetSlots
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}>
                  Anlegen
                </button>
              </div>
            ))}
            {availablePets.length === 0 && (
              <div className="text-purple-400 text-center py-2 text-xs">
                Kaufe Pets im Shop
              </div>
            )}
          </div>
        </div>
        
        {/* Slots freischalten */}
        <div className="border-t border-purple-700 pt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-purple-300 text-sm font-bold">
              Slots: {playerPetSlots}/5
            </div>
            {playerPetSlots < 5 && (
              <button onClick={() => unlockPetSlot()}
                disabled={!canUnlockMore}
                className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  canUnlockMore
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}>
                + Slot: {nextSlotCost} 💎
              </button>
            )}
          </div>
          
          {/* Slot Anzeige */}
          <div className="flex gap-2 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                i < playerPetSlots 
                  ? 'bg-purple-700 border-2 border-purple-400' 
                  : 'bg-gray-800 border-2 border-gray-600'
              }`}>
                {i < equippedPets.length ? '●' : '🔒'}
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};
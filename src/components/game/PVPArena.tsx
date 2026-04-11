import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

interface Props {
  onClose: () => void;
}

export const PVPArena = ({ onClose }: Props) => {
  const setCurrentZone = useGameStore(s => s.setCurrentZone);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const respawnEnemies = useGameStore(s => s.respawnEnemies);
  const playerLevel = useGameStore(s => s.playerLevel);

  const startArena = () => {
    setCurrentZone('arena_colosseum');
    setPlayerPosition([0, 0.5, 0]);
    setTimeout(() => respawnEnemies(), 100);
    onClose();
  };

  const isUnlocked = playerLevel >= 30;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-pvp-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gradient-to-b from-red-900 to-black/90 border-2 border-red-600 rounded-2xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 0 30px rgba(220,38,38,0.5)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-red-500 font-bold text-xl">⚔️ Arena Kolosseum</h2>
          <button onClick={onClose} className="text-red-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="text-center py-8">
          <div className="text-white text-2xl mb-4">🏆 Arena Turnier</div>
          <div className="text-gray-400 text-sm mb-6">Kämpfe dich durch die Arena!</div>
          
          {!isUnlocked ? (
            <div className="text-red-400 py-4">
              Du brauchst Level 30 um teilzunehmen!
              <br />
              <span className="text-gray-500">Aktuell: Level {playerLevel}</span>
            </div>
          ) : (
            <div>
              <div className="text-yellow-400 text-lg mb-6">Belohnung: bis 1000 Gold!</div>
              <button onClick={startArena}
                className="px-8 py-3 rounded-xl text-lg font-bold bg-red-600 text-white hover:bg-red-500">
                KAMPF STARTEN ⚔️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
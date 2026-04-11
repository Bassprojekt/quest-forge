import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

interface Props {
  onClose: () => void;
}

export const RaidUI = ({ onClose }: Props) => {
  const currentZone = useGameStore(s => s.currentZone);
  const setCurrentZone = useGameStore(s => s.setCurrentZone);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const respawnEnemies = useGameStore(s => s.respawnEnemies);
  const playerLevel = useGameStore(s => s.playerLevel);

  const startRaid = () => {
    setCurrentZone('raid_dungeon');
    setPlayerPosition([0, 0.5, 0]);
    setTimeout(() => respawnEnemies(), 100);
    onClose();
  };

  const isUnlocked = playerLevel >= 50;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-raid-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gradient-to-b from-purple-900 to-black border-2 border-purple-600 rounded-2xl p-6 max-w-md w-full mx-4"
        style={{ boxShadow: '0 0 30px rgba(147,51,234,0.5)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-purple-400 font-bold text-xl">👹 Raid Dungeon</h2>
          <button onClick={onClose} className="text-purple-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="text-center py-6">
          <div className="text-4xl mb-4">👹</div>
          <div className="text-white text-xl font-bold mb-2">4 Bosses</div>
          <div className="text-gray-400 text-sm mb-4">Kämpfe gegen 4 Bosse nacheinander!</div>
          
          {!isUnlocked ? (
            <div className="text-red-400 py-4">
              Du brauchst Level 50 um teilzunehmen!
              <br />
              <span className="text-gray-500">Aktuell: Level {playerLevel}</span>
            </div>
          ) : (
            <div>
              <div className="text-yellow-400 mb-4">Belohnung: 2000 Gold + Epic Loot!</div>
              <button onClick={startRaid}
                className="px-8 py-3 rounded-xl text-lg font-bold bg-purple-600 text-white hover:bg-purple-500">
                STARTEN ⚔️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
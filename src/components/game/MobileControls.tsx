import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export const MobileControls = () => {
  const [isMobile, setIsMobile] = useState(false);
  const targetEnemyId = useGameStore(s => s.targetEnemyId);
  const attackEnemy = useGameStore(s => s.attackEnemy);
  const skills = useGameStore(s => s.skills);
  const useSkill = useGameStore(s => s.useSkill);
  
  useEffect(() => {
    const check = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(check);
  }, []);
  
  const handleAttack = () => {
    if (targetEnemyId) {
      attackEnemy(targetEnemyId);
    }
  };
  
  const handleSkill1 = () => {
    if (skills[0]) useSkill(skills[0].id);
  };
  
  const handleSkill2 = () => {
    if (skills[1]) useSkill(skills[1].id);
  };
  
  const handleSkill3 = () => {
    if (skills[2]) useSkill(skills[2].id);
  };
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2" data-mobile-controls="true">
      <button
        onTouchStart={handleAttack}
        className="w-16 h-16 bg-red-500/80 rounded-full border-4 border-red-700 flex items-center justify-center text-white font-bold text-xl shadow-lg active:bg-red-600"
      >
        ⚔️
      </button>
      <div className="flex gap-2">
        <button
          onTouchStart={handleSkill1}
          className="w-12 h-12 bg-blue-500/80 rounded-full border-2 border-blue-700 flex items-center justify-center text-white text-sm active:bg-blue-600"
        >
          Q
        </button>
        <button
          onTouchStart={handleSkill2}
          className="w-12 h-12 bg-purple-500/80 rounded-full border-2 border-purple-700 flex items-center justify-center text-white text-sm active:bg-purple-600"
        >
          E
        </button>
        <button
          onTouchStart={handleSkill3}
          className="w-12 h-12 bg-green-500/80 rounded-full border-2 border-green-700 flex items-center justify-center text-white text-sm active:bg-green-600"
        >
          ⇧
        </button>
      </div>
    </div>
  );
};
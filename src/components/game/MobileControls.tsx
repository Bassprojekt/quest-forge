import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

interface JoystickData {
  x: number;
  y: number;
}

export const MobileControls = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  
  const targetEnemyId = useGameStore(s => s.targetEnemyId);
  const attackEnemy = useGameStore(s => s.attackEnemy);
  const skills = useGameStore(s => s.skills);
  const useSkill = useGameStore(s => s.useSkill);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const playerPosition = useGameStore(s => s.playerPosition);
  const playerSpeed = useGameStore(s => s.playerSpeed);
  const setTargetEnemy = useGameStore(s => s.setTargetEnemy);
  const enemies = useGameStore(s => s.enemies);
  const autoFight = useGameStore(s => s.autoFight);
  const setAutoFight = useGameStore(s => s.setAutoFight);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  
  useEffect(() => {
    const check = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(check || hasTouchScreen);
  }, []);
  
  const handleAttack = () => {
    if (targetEnemyId) {
      attackEnemy(targetEnemyId);
    } else {
      const closestEnemy = enemies.find(e => e.alive && e.zone === useGameStore.getState().currentZone);
      if (closestEnemy) {
        setTargetEnemy(closestEnemy.id);
        attackEnemy(closestEnemy.id);
      }
    }
  };
  
  const handleSkill1 = () => {
    if (skills[0]) useSkill(skills[0].id);
  };
  
  const handleSkill2 = () => {
    if (skills[1]) useSkill(skills[1].id);
  };
  
  const handleAutoFight = () => {
    setAutoFight(!autoFight);
  };
  
  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current || !isMountedRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2 - 15;
    
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;
    
    if (distance > maxDistance) {
      normalizedX = deltaX / distance;
      normalizedY = deltaY / distance;
    }
    
    normalizedX = Math.max(-1, Math.min(1, normalizedX));
    normalizedY = Math.max(-1, Math.min(1, normalizedY));
    
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${normalizedX * maxDistance}px, ${normalizedY * maxDistance}px)`;
    }
    
    setIsMoving(normalizedX !== 0 || normalizedY !== 0);
    return { x: normalizedX, y: normalizedY };
  }, []);
  
  const startMovement = useCallback((direction: JoystickData) => {
    if (!isMountedRef.current) return;
    
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    
    moveIntervalRef.current = window.setInterval(() => {
      if (!isMountedRef.current) return;
      const state = useGameStore.getState();
      if (direction.x === 0 && direction.y === 0) return;
      
      const speed = state.playerSpeed * 0.02;
      const newX = state.playerPosition[0] + direction.x * speed;
      const newZ = state.playerPosition[2] + direction.y * speed;
      
      setPlayerPosition([newX, 0, newZ]);
    }, 16);
  }, [setPlayerPosition]);
  
  const stopMovement = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    setIsMoving(false);
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, []);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dir = handleJoystickMove(touch.clientX, touch.clientY);
    if (dir) startMovement(dir);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dir = handleJoystickMove(touch.clientX, touch.clientY);
    if (dir) startMovement(dir);
  };
  
  const handleTouchEnd = () => {
    stopMovement();
  };
  
  if (!isMobile || !showControls) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] select-none">
      {/* Toggle HUD button - top right */}
      <button
        onClick={() => setShowControls(false)}
        className="absolute top-4 right-4 pointer-events-auto w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        ➖
      </button>
      
      {/* Restore button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute bottom-24 right-4 pointer-events-auto w-12 h-12 bg-blue-500/80 rounded-full flex items-center justify-center text-white text-xl"
        >
          🎮
        </button>
      )}
      
      {/* Joystick - bottom left */}
      <div 
        className="absolute bottom-6 left-4 sm:left-8 pointer-events-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div 
          ref={joystickRef}
          className="w-32 h-32 sm:w-36 sm:h-36 bg-black/30 rounded-full border-4 border-white/40 flex items-center justify-center touch-none"
          style={{ boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}
        >
          <div 
            ref={knobRef}
            className="w-16 h-16 bg-white/70 rounded-full shadow-lg transition-transform duration-75 touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>
        {isMoving && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs">
           Moving...
          </div>
        )}
      </div>
      
      {/* Action buttons - bottom right */}
      <div className="absolute bottom-6 right-4 sm:right-8 pointer-events-auto flex flex-col gap-2 sm:gap-3 items-end">
        {/* Auto-fight toggle */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleAutoFight(); }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center text-lg sm:text-xl shadow-lg touch-none ${
            autoFight 
              ? 'bg-green-500/90 border-green-700' 
              : 'bg-gray-500/80 border-gray-600'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          🔄
        </button>
        
        {/* Main attack button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleAttack(); }}
          className="w-18 h-18 sm:w-20 sm:h-20 bg-red-500/90 rounded-full border-4 border-red-700 flex items-center justify-center text-3xl shadow-lg active:scale-90 touch-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ⚔️
        </button>
        
        {/* Skill buttons */}
        <div className="flex gap-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleSkill1(); }}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/90 rounded-full border-2 border-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg active:scale-90 touch-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ①
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleSkill2(); }}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/90 rounded-full border-2 border-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg active:scale-90 touch-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ②
          </button>
        </div>
      </div>
    </div>
  );
};
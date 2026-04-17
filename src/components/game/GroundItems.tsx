import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';

export const GroundItems = () => {
  const groundItems = useGameStore(s => s.groundItems);
  const playerPosition = useGameStore(s => s.playerPosition);
  const pickupGroundItem = useGameStore(s => s.pickupGroundItem);
  const autoLoot = useGameStore(s => s.autoLoot);
  const frameRef = useRef(0);

  const getDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  };

  useFrame(() => {
    if (!autoLoot) return;
    frameRef.current++;
    if (frameRef.current < 30) return;
    frameRef.current = 0;

    groundItems.forEach(item => {
      const dist = getDistance(playerPosition, item.position);
      if (dist < 1.5) {
        pickupGroundItem(item.id);
      }
    });
  });

  const getItemEmoji = (item: { name: string; type: string; icon?: string }) => {
    if (item.icon) return item.icon;
    switch (item.name) {
      case 'Holz': return '🪵';
      case 'Leder': return '🟫';
      case 'Kräuter': return '🌿';
      case 'Erz': return '🪨';
      case 'Federn': return '🪶';
      case 'Fisch': return '🐟';
      case 'Fleisch': return '🥩';
      case 'Stahlbarren': return '🔩';
      case 'Edelstein': return '💎';
      case 'Mithrilbarren': return '⭐';
      case 'Heiltrank': return '🧪';
      case 'Manatrank': return '🧪';
      default: return '📦';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9E9E9E';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <>
      {groundItems.map(item => {
        const dist = getDistance(playerPosition, item.position);
        if (dist > 10) return null;
        
        const emoji = getItemEmoji(item);
        const color = getRarityColor(item.rarity);
        
        return (
          <group key={item.id} position={item.position}>
            <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
              <div style={{
                fontSize: '28px',
                textShadow: '0 0 5px black, 0 0 5px black',
                filter: `drop-shadow(0 0 3px ${color})`,
              }}>
                {emoji}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
};
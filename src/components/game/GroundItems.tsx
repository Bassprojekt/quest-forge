import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

  return (
    <>
      {groundItems.map(item => {
        const dist = getDistance(playerPosition, item.position);
        if (dist > 10) return null;
        return (
          <group key={item.id} position={item.position}>
            <mesh>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial 
                color={item.rarity === 'common' ? '#9E9E9E' : item.rarity === 'rare' ? '#2196F3' : item.rarity === 'epic' ? '#9C27B0' : '#FF9800'} 
                emissive={item.rarity === 'common' ? '#9E9E9E' : item.rarity === 'rare' ? '#2196F3' : item.rarity === 'epic' ? '#9C27B0' : '#FF9800'}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
};
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

const ZONE_RADIUS = 18;
const UPDATE_INTERVAL = 3;

export const EnemyMover = () => {
  const enemies = useGameStore(s => s.enemies);
  const currentZone = useGameStore(s => s.currentZone);
  const updateEnemyPosition = useGameStore(s => s.updateEnemyPosition);
  const frameCount = useRef(0);
  const pendingUpdates = useRef<Map<string, { position: [number, number, number]; moveTarget?: [number, number, number] }>>(new Map());

  useFrame(() => {
    if (currentZone === 'hub') return;
    
    frameCount.current++;
    const doUpdate = frameCount.current % UPDATE_INTERVAL === 0;

    enemies.forEach(enemy => {
      if (!enemy.alive || enemy.isBoss || !enemy.moveTarget || !enemy.moveSpeed) return;

      const [cx, cy, cz] = enemy.position;
      const [tx, ty, tz] = enemy.moveTarget;

      const dx = tx - cx;
      const dz = tz - cz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      const speed = enemy.moveSpeed * (doUpdate ? 0.06 : 0);

      let newX = cx;
      let newZ = cz;
      let reachedTarget = false;

      if (dist < 0.5) {
        reachedTarget = true;
        newX = tx;
        newZ = tz;
      } else if (doUpdate) {
        newX = cx + (dx / dist) * speed;
        newZ = cz + (dz / dist) * speed;
      }

      if (reachedTarget) {
        const newTarget: [number, number, number] = [
          (Math.random() - 0.5) * ZONE_RADIUS * 2,
          0.5,
          (Math.random() - 0.5) * ZONE_RADIUS * 2,
        ];
        pendingUpdates.current.set(enemy.id, { position: [newX, cy, newZ], moveTarget: newTarget });
      } else if (doUpdate && (newX !== cx || newZ !== cz)) {
        pendingUpdates.current.set(enemy.id, { position: [newX, cy, newZ] });
      }
    });

    if (doUpdate && pendingUpdates.current.size > 0) {
      pendingUpdates.current.forEach((data, enemyId) => {
        updateEnemyPosition(enemyId, data.position, data.moveTarget);
      });
      pendingUpdates.current.clear();
    }
  });

  return null;
};
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { PetModel3D, getPetColor } from './PetModels';

const getDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
  const dx = pos2[0] - pos1[0];
  const dz = pos2[2] - pos1[2];
  return Math.sqrt(dx*dx + dz*dz);
};

export const PetCompanion = () => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const pets = useGameStore(s => s.pets);
  const pet = pets.find(p => p.equipped && !p.inTournament);
  const groundItems = useGameStore(s => s.groundItems);
  const pickupGroundItem = useGameStore(s => s.pickupGroundItem);
  const lastPickupTime = useRef(0);
  const collectingRef = useRef(false);
  const collectTargetRef = useRef<[number, number, number] | null>(null);

  const targetOffset = 1.5;
  const smoothSpeed = 0.1;
  const collectRange = 50;
  const pickupRange = 1.2;

  useFrame(() => {
    if (!meshRef.current || !pet) return;

    const petPos: [number, number, number] = [meshRef.current.position.x, 0, meshRef.current.position.z];
    const now = Date.now();
    const playerDist = getDistance(petPos, playerPos);

    if (!collectingRef.current) {
      const itemsInRange = groundItems.filter(item => {
        const itemDist = getDistance(petPos, item.position);
        return itemDist < collectRange;
      });

      if (itemsInRange.length > 0 && now - lastPickupTime.current > 600) {
        let closestItem = itemsInRange[0];
        let closestDist = getDistance(petPos, closestItem.position);

        for (const item of itemsInRange) {
          const d = getDistance(petPos, item.position);
          if (d < closestDist) {
            closestDist = d;
            closestItem = item;
          }
        }

        collectTargetRef.current = closestItem.position;
        collectingRef.current = true;
      }
    }

    if (collectingRef.current && collectTargetRef.current) {
      const itemStillExists = groundItems.some(item => 
        item.position[0] === collectTargetRef.current![0] && 
        item.position[2] === collectTargetRef.current![2]
      );

      if (!itemStillExists) {
        collectingRef.current = false;
        collectTargetRef.current = null;
      } else {
        const targetX = collectTargetRef.current[0];
        const targetZ = collectTargetRef.current[2];
        const toItemDist = getDistance(petPos, collectTargetRef.current);

        if (toItemDist > pickupRange) {
          meshRef.current.position.x += (targetX - meshRef.current.position.x) * smoothSpeed;
          meshRef.current.position.z += (targetZ - meshRef.current.position.z) * smoothSpeed;
        } else {
          const item = groundItems.find(item => 
            item.position[0] === collectTargetRef.current![0] && 
            item.position[2] === collectTargetRef.current![2]
          );
          if (item) {
            pickupGroundItem(item.id);
            lastPickupTime.current = now;
          }
          collectingRef.current = false;
          collectTargetRef.current = null;
        }
        return;
      }
    }

    const targetX = playerPos[0];
    const targetZ = playerPos[2] - targetOffset;

    if (playerDist > 2.5) {
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * smoothSpeed;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * smoothSpeed;
    }
    meshRef.current.position.y = 0;

    const dx = playerPos[0] - meshRef.current.position.x;
    const dz = playerPos[2] - meshRef.current.position.z;
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });

  if (!pet) return null;

  const color = getPetColor(pet);

  return (
    <group ref={meshRef} position={[playerPos[0], 0, playerPos[2] - targetOffset]}>
      <PetModel3D pet={pet} />
      <pointLight intensity={0.5} distance={3} color={color} />
    </group>
  );
};
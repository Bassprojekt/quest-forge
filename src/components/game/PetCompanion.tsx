import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { PetModel3D, getPetColor } from './PetModels';

type PetState = 'FOLLOW' | 'COLLECT' | 'RETURN' | 'IDLE';

const getDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
  const dx = pos2[0] - pos1[0];
  const dz = pos2[2] - pos1[2];
  return Math.sqrt(dx*dx + dz*dz);
};

export const PetCompanion = () => {
  const meshRef = useRef<THREE.Group>(null);
  const stateRef = useRef<PetState>('FOLLOW');
  const targetRef = useRef<[number, number, number] | null>(null);
  const lastStateChange = useRef(0);
  const idleTimeRef = useRef(0);
  const leftOrRight = useRef(Math.random() > 0.5 ? 1 : -1);

  const playerPos = useGameStore(s => s.playerPosition);
  const pets = useGameStore(s => s.pets);
  const pet = pets.find(p => p.equipped && !p.inTournament);
  const groundItems = useGameStore(s => s.groundItems);
  const pickupGroundItem = useGameStore(s => s.pickupGroundItem);

  useFrame((_, delta) => {
    if (!meshRef.current || !pet) return;

    const petPos = meshRef.current.position;
    const now = Date.now();

    const speed = 4 * delta;
    const playerTarget = new THREE.Vector3(playerPos[0], 0, playerPos[2] - 1.5 - (leftOrRight.current * 0.8));
    const distanceToPlayer = petPos.distanceTo(playerTarget);

    // =============================
    // 🧠 STATE SWITCHING
    // =============================
    if (stateRef.current !== 'COLLECT' && stateRef.current !== 'RETURN') {
      const item = groundItems.find(item => {
        const d = new THREE.Vector3(item.position[0], 0, item.position[2]).distanceTo(petPos);
        return d < 6;
      });

      if (item) {
        targetRef.current = item.position;
        stateRef.current = 'COLLECT';
        lastStateChange.current = now;
      }
    }

    // =============================
    // 🎯 COLLECT STATE
    // =============================
    if (stateRef.current === 'COLLECT' && targetRef.current) {
      const target = new THREE.Vector3(targetRef.current[0], 0, targetRef.current[2]);
      const dist = petPos.distanceTo(target);

      if (dist > 0.8) {
        petPos.lerp(target, 0.1);
      } else {
        const item = groundItems.find(i =>
          i.position[0] === targetRef.current![0] &&
          i.position[2] === targetRef.current![2]
        );

        if (item) {
          pickupGroundItem(item.id);
        }

        stateRef.current = 'RETURN';
        targetRef.current = null;
      }
      return;
    }

    // =============================
    // 🔄 RETURN TO PLAYER
    // =============================
    if (stateRef.current === 'RETURN') {
      if (distanceToPlayer > 0.5) {
        petPos.lerp(playerTarget, 0.1);
      } else {
        stateRef.current = 'IDLE';
        idleTimeRef.current = now;
        leftOrRight.current = Math.random() > 0.5 ? 1 : -1;
      }
      return;
    }

    // =============================
    // 😴 IDLE
    // =============================
    if (stateRef.current === 'IDLE') {
      if (distanceToPlayer > 2.5) {
        stateRef.current = 'FOLLOW';
      }

      if (now - idleTimeRef.current > 2000 && now - lastStateChange.current > 1000) {
        stateRef.current = 'FOLLOW';
        lastStateChange.current = now;
      }

      petPos.y = Math.sin(now * 0.003) * 0.08;
      return;
    }

    // =============================
    // 🧍 FOLLOW PLAYER
    // =============================
    if (stateRef.current === 'FOLLOW') {
      if (distanceToPlayer > 1.5) {
        petPos.lerp(playerTarget, 0.08);
      }
    }

    // =============================
    // 🔄 ROTATION
    // =============================
    const dir = new THREE.Vector3().subVectors(playerTarget, petPos);
    const angle = Math.atan2(dir.x, dir.z);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      angle,
      0.1
    );
  });

  if (!pet) return null;

  const color = getPetColor(pet);

  return (
    <group ref={meshRef} position={[playerPos[0], 0, playerPos[2] - 1.5]}>
      <PetModel3D pet={pet} />
      <pointLight intensity={0.5} distance={3} color={color} />
    </group>
  );
};
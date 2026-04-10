import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

export const PetCompanion = () => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const pets = useGameStore(s => s.pets);
  const equippedPet = pets.find(p => p.equipped);
  
  const targetOffset = 1.5;
  const smoothSpeed = 0.08;
  
  useFrame(() => {
    if (!meshRef.current || !equippedPet) return;
    
    const targetX = playerPos[0];
    const targetZ = playerPos[2] - targetOffset;
    
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * smoothSpeed;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * smoothSpeed;
    meshRef.current.position.y = 0;
    
    const dx = playerPos[0] - meshRef.current.position.x;
    const dz = playerPos[2] - meshRef.current.position.z;
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });
  
  if (!equippedPet) return null;
  
  const petColor = equippedPet.bonusType === 'heal' ? '#FFD700' :
                   equippedPet.bonusType === 'damage' ? '#FF4444' :
                   equippedPet.bonusType === 'defense' ? '#4488FF' : '#44FF44';
  
  return (
    <group ref={meshRef} position={[playerPos[0], 0, playerPos[2] - targetOffset]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={petColor} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color={petColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.75, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <pointLight position={[0, 0.5, 0]} color={petColor} intensity={0.5} distance={3} />
    </group>
  );
};
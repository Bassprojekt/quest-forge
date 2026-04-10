import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const LaserBeam = () => {
  const laserTarget = useGameStore(s => s.laserTarget);
  const playerPos = useGameStore(s => s.playerPosition);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current || !laserTarget) return;
    const start = new THREE.Vector3(playerPos[0], 1.2, playerPos[2]);
    const end = new THREE.Vector3(...laserTarget);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dist = start.distanceTo(end);

    meshRef.current.position.copy(mid);
    meshRef.current.lookAt(end);
    meshRef.current.scale.set(0.06, 0.06, dist);
  });

  if (!laserTarget) return null;

  return (
    <>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF6347" emissive="#FF6347" emissiveIntensity={4} transparent opacity={0.85} />
      </mesh>
      <pointLight position={laserTarget} color="#FF6347" intensity={8} distance={5} />
      <mesh position={laserTarget}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={3} transparent opacity={0.7} />
      </mesh>
    </>
  );
};

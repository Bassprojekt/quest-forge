import * as THREE from 'three';
import React, { useMemo } from 'react';
import { useGameStore, ZONES } from '@/store/gameStore';

const Bush = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[0.6, 8, 6]} />
      <meshStandardMaterial color="#228B22" roughness={0.9} />
    </mesh>
    <mesh position={[0.3, 0.5, 0.2]} castShadow>
      <sphereGeometry args={[0.4, 6, 5]} />
      <meshStandardMaterial color="#2E8B57" roughness={0.9} />
    </mesh>
  </group>
);

const Flower = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.04, 0.3, 6]} />
      <meshStandardMaterial color="#2E7D32" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.32, 0]} castShadow>
      <sphereGeometry args={[0.1, 8, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  </group>
);

const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  const greens = ['#2E7D32', '#388E3C', '#43A047', '#1B5E20', '#4CAF50'];
  const green = greens[Math.floor(Math.abs(position[0] * position[2]) % greens.length)];
  
  return (
    <group position={position} scale={scale}>
      {/* Trunk - slightly bent */}
      <mesh position={[0.1, 1.5, 0]} castShadow rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.25, 0.35, 3, 6]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* Main foliage - slightly deformed */}
      <mesh position={[0.3, 3.3, 0.2]} castShadow>
        <sphereGeometry args={[2, 10, 8]} />
        <meshStandardMaterial color={green} roughness={0.75} />
      </mesh>
      {/* Secondary foliage */}
      <mesh position={[-0.5, 4, -0.3]} castShadow scale={0.7}>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshStandardMaterial color={greens[Math.floor((position[0] * 7) + 1) % greens.length]} roughness={0.7} />
      </mesh>
    </group>
  );
};

const Rock = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.8, 0.6, 0.7]} />
      <meshStandardMaterial color="#696969" roughness={0.95} />
    </mesh>
  </group>
);

const generatePositions = (count: number, range: number, seedBase: number) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * range;
    positions.push({
      pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
      scale: 0.6 + Math.random() * 0.8
    });
  }
  return positions;
};

const GrasslandsWorld = () => {
  const bushPositions = useMemo(() => generatePositions(25, 25, 1000), []);
  const rockPositions = useMemo(() => generatePositions(15, 30, 2000), []);
  const flowerPositions = useMemo(() => generatePositions(30, 25, 3000), []);
  const treePositions = useMemo(() => generatePositions(10, 20, 4000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#6DBE6D" />
      </mesh>
      {treePositions.map((item, i) => (
        <Tree key={`tree-${i}`} position={item.pos} scale={item.scale} />
      ))}
      {bushPositions.map((item, i) => (
        <Bush key={`bush-${i}`} position={item.pos} scale={item.scale} />
      ))}
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} />
      ))}
      {flowerPositions.map((item, i) => (
        <Flower key={`flower-${i}`} position={item.pos} color={['#FF69B4', '#FFD700', '#FF6347', '#FF1493'][i % 4]} scale={item.scale} />
      ))}
    </group>
  );
};

const MushroomForestWorld = () => {
  const bushPositions = useMemo(() => generatePositions(20, 25, 1000), []);
  const rockPositions = useMemo(() => generatePositions(15, 30, 2000), []);
  const flowerPositions = useMemo(() => generatePositions(25, 25, 3000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4A6B4A" />
      </mesh>
      {bushPositions.map((item, i) => (
        <Bush key={`bush-${i}`} position={item.pos} scale={item.scale} />
      ))}
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} color="#5D4E37" />
      ))}
      {flowerPositions.map((item, i) => (
        <Flower key={`flower-${i}`} position={item.pos} color={['#FF69B4', '#FFA07A', '#DA70D6'][i % 3]} scale={item.scale} />
      ))}
    </group>
  );
};

const FrozenPeaksWorld = () => {
  const rockPositions = useMemo(() => generatePositions(20, 30, 2000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#D8E8F0" />
      </mesh>
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} />
      ))}
    </group>
  );
};

const LavaCavernsWorld = () => {
  const rockPositions = useMemo(() => generatePositions(20, 30, 2000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4A3030" />
      </mesh>
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} color="#3A2020" />
      ))}
    </group>
  );
};

const CoralReefWorld = () => {
  const rockPositions = useMemo(() => generatePositions(15, 30, 2000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#5BA8A0" />
      </mesh>
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} color="#3D7878" />
      ))}
    </group>
  );
};

const ShadowSwampWorld = () => {
  const bushPositions = useMemo(() => generatePositions(20, 25, 1000), []);
  const rockPositions = useMemo(() => generatePositions(15, 30, 2000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3A4A3A" />
      </mesh>
      {bushPositions.map((item, i) => (
        <Bush key={`bush-${i}`} position={item.pos} scale={item.scale} color="#2D3A2D" />
      ))}
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} color="#2F2F2F" />
      ))}
    </group>
  );
};

const CrystalHighlandsWorld = () => {
  const rockPositions = useMemo(() => generatePositions(15, 30, 2000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#B8D0E0" />
      </mesh>
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} color="#9BB0C0" />
      ))}
    </group>
  );
};

const VoidNexusWorld = () => {
  const rockPositions = useMemo(() => generatePositions(10, 25, 2000), []);
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1A0A2A" />
      </mesh>
      {rockPositions.map((item, i) => (
        <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} color="#0A0510" />
      ))}
    </group>
  );
};

const WORLD_COMPONENTS: Record<string, () => JSX.Element> = {
  grasslands: GrasslandsWorld,
  mushroom_forest: MushroomForestWorld,
  frozen_peaks: FrozenPeaksWorld,
  lava_caverns: LavaCavernsWorld,
  coral_reef: CoralReefWorld,
  shadow_swamp: ShadowSwampWorld,
  crystal_highlands: CrystalHighlandsWorld,
  void_nexus: VoidNexusWorld,
};

export const GameWorld = () => {
  const currentZone = useGameStore(s => s.currentZone);
  if (currentZone === 'hub') return null;
  const WorldComponent = WORLD_COMPONENTS[currentZone];
  if (!WorldComponent) return null;
  return <WorldComponent />;
};
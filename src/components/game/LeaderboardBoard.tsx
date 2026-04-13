import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const LeaderboardBoard = () => {
  const ref = useRef<THREE.Group>(null);
  const [showInfo, setShowInfo] = useState(false);
  const lastUpdate = useRef(Date.now());
  
  const playerLevel = useGameStore(s => s.playerLevel);
  const playerTitle = useGameStore(s => s.playerTitle);
  const totalKills = useGameStore(s => s.totalKills);
  const totalGoldEarned = useGameStore(s => s.totalGoldEarned);
  
  useFrame(() => {
    if (!ref.current) return;
    if (ref.current) {
      ref.current.rotation.y = Math.sin(Date.now() / 3000) * 0.05;
    }
    
    if (Date.now() - lastUpdate.current > 15 * 60 * 1000) {
      lastUpdate.current = Date.now();
    }
  });

  return (
    <group ref={ref} position={[-18, 3.5, -28]}>
      <mesh castShadow>
        <boxGeometry args={[6, 4, 0.3]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.3} />
      </mesh>
      
      <Text
        position={[0, 1.5, 0.2]}
        fontSize={0.4}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Fredoka-Bold.ttf"
      >
        🏆 RANGLISTE 🏆
      </Text>
      
      <Text
        position={[0, 0.8, 0.2]}
        fontSize={0.25}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        ─────────────────
      </Text>
      
      <Text
        position={[-2.3, 0.3, 0.2]}
        fontSize={0.2}
        color="#FFD700"
        anchorX="left"
      >
        Level: {playerLevel}
      </Text>
      <Text
        position={[0.5, 0.3, 0.2]}
        fontSize={0.2}
        color="#FFA500"
        anchorX="left"
      >
        {playerTitle}
      </Text>
      
      <Text
        position={[-2.3, -0.1, 0.2]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="left"
      >
        Kills: {totalKills}
      </Text>
      <Text
        position={[0.5, -0.1, 0.2]}
        fontSize={0.2}
        color="#FFA500"
        anchorX="left"
      >
        💀
      </Text>
      
      <Text
        position={[-2.3, -0.5, 0.2]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="left"
      >
        Gold: {totalGoldEarned.toLocaleString()}
      </Text>
      <Text
        position={[0.5, -0.5, 0.2]}
        fontSize={0.2}
        color="#FFA500"
        anchorX="left"
      >
        💰
      </Text>
      
      <Text
        position={[0, -1.2, 0.2]}
        fontSize={0.15}
        color="#888888"
        anchorX="center"
      >
        Updates alle 15 Min
      </Text>
      
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[2, 0.3, 0.3]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} />
      </mesh>
    </group>
  );
};
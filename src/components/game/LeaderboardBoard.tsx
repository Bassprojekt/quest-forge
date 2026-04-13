import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

const SIMULATED_PLAYERS = [
  { name: 'DragonKing', level: 85, gold: 2450000 },
  { name: 'ShadowMage', level: 72, gold: 1890000 },
  { name: 'IceWarrior', level: 68, gold: 1650000 },
  { name: 'FireKnight', level: 65, gold: 1420000 },
  { name: 'StormArcher', level: 61, gold: 1280000 },
  { name: 'NightRanger', level: 58, gold: 1150000 },
  { name: 'LightHealer', level: 55, gold: 980000 },
  { name: 'DarkRogue', level: 52, gold: 850000 },
  { name: 'SteelTank', level: 48, gold: 720000 },
  { name: 'FrostMage', level: 45, gold: 610000 },
];

export const LeaderboardBoard = () => {
  const ref = useRef<THREE.Group>(null);
  const lastUpdate = useRef(Date.now());
  
  const playerLevel = useGameStore(s => s.playerLevel);
  const playerGold = useGameStore(s => s.playerGold);
  
  const allPlayers = useMemo(() => {
    const players = [...SIMULATED_PLAYERS, { name: 'DU', level: playerLevel, gold: playerGold }];
    return players.sort((a, b) => b.level - a.level || b.gold - a.gold).slice(0, 10);
  }, [playerLevel, playerGold]);
  
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(Date.now() / 3000) * 0.03;
    
    if (Date.now() - lastUpdate.current > 15 * 60 * 1000) {
      lastUpdate.current = Date.now();
    }
  });

  const medalEmojis = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10'];
  const rowColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1'];

  return (
    <group ref={ref} position={[-18, 4, -28]}>
      <mesh castShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
      </mesh>
      
      <mesh position={[0, 2.3, 0]} castShadow>
        <boxGeometry args={[8, 0.8, 0.15]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <Text
        position={[0, 2.3, 0.1]}
        fontSize={0.35}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        🏆 TOP 10 RANKING 🏆
      </Text>
      
      {allPlayers.map((player, i) => {
        const xPos = -5.2 + (i * 1.1);
        const isPlayer = player.name === 'DU';
        
        return (
          <group key={i} position={[xPos, 0.8, 0]}>
            <Text
              position={[0, 0.5, 0.1]}
              fontSize={0.18}
              color={rowColors[i]}
              anchorX="center"
            >
              {medalEmojis[i]}
            </Text>
            <Text
              position={[0, 0.2, 0.1]}
              fontSize={0.15}
              color={isPlayer ? '#FF6B64' : '#FFFFFF'}
              anchorX="center"
              anchorY="middle"
            >
              {player.name}
            </Text>
            <Text
              position={[0, -0.1, 0.1]}
              fontSize={0.14}
              color="#4CAF50"
              anchorX="center"
            >
              Lv{player.level}
            </Text>
            <Text
              position={[0, -0.35, 0.1]}
              fontSize={0.12}
              color="#FFD700"
              anchorX="center"
            >
              💰{(player.gold / 1000).toFixed(0)}k
            </Text>
            
            {isPlayer && (
              <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[1.1, 1.3]} />
                <meshStandardMaterial color="#FF6B64" transparent opacity={0.2} />
              </mesh>
            )}
          </group>
        );
      })}
      
      <Text
        position={[0, -1.8, 0.1]}
        fontSize={0.12}
        color="#666666"
        anchorX="center"
      >
        Updates alle 15 Min | Dein Rang: {allPlayers.findIndex(p => p.name === 'DU') + 1}
      </Text>
    </group>
  );
};
import { useRef, useMemo, useState, Suspense } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, useGLTF } from '@react-three/drei';
import { useGameStore, ZONES } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const generateFlowerData = () => {
  const colors = ['#FF69B4', '#FFD700', '#FF6347', '#DA70D6', '#87CEEB', '#FFA07A', '#ADFF2F'];
  const flowers: { pos: [number, number, number]; color: string }[] = [];
  for (let i = 0; i < 15; i++) {
    const seed = i * 789.123;
    const angle = seededRandom(seed) * Math.PI * 2;
    const r = 10 + seededRandom(seed + 456) * 30;
    flowers.push({
      pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r],
      color: colors[i % colors.length],
    });
  }
  return flowers;
};

const HubFlower = ({ position, color }: { position: [number, number, number]; color: string }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.04, 0.3, 6]} />
      <meshStandardMaterial color="#2E7D32" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.32, 0]} castShadow>
      <sphereGeometry args={[0.12, 8, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.32, 0]}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

const getBuildingNPCColors = (color: string) => {
  const colorMap: Record<string, { shirt: [string, string, string]; pants: [string, string, string]; shoes: [string, string, string]; hair: string; skin: string; skinDark: string; hat: string }> = {
    '#9C27B0': { // Alchemist - purple
      shirt: ['#7B1FA2', '#5A1577', '#9C27C0'],
      pants: ['#4A146A', '#3A0A50', '#5A187A'],
      shoes: ['#2A0A3A', '#1A0520', '#3A0A4A'],
      hair: '#3A2040',
      skin: '#E8C8A0',
      skinDark: '#C8A880',
      hat: '#9C27B0'
    },
    '#FF9800': { // Handwerker Hagen - orange
      shirt: ['#E65100', '#BF4000', '#FF9800'],
      pants: ['#5A3A00', '#4A2800', '#6A4400'],
      shoes: ['#3A2000', '#2A1000', '#4A2800'],
      hair: '#4A3020',
      skin: '#D4A574',
      skinDark: '#B4956A',
      hat: '#FF9800'
    },
    '#4A4A4A': { // Bankier - gray
      shirt: ['#2E2E2E', '#1E1E1E', '#3E3E3E'],
      pants: ['#1A1A1A', '#0D0D0D', '#2A2A2A'],
      shoes: ['#1A1A1A', '#0D0D0D', '#2A2A2A'],
      hair: '#2A2A2A',
      skin: '#D4A574',
      skinDark: '#B4956A',
      hat: '#4A4A4A'
    },
    '#DEB887': { // Händler - tan
      shirt: ['#C4956A', '#A07850', '#D4A880'],
      pants: ['#6A5040', '#5A4030', '#7A6050'],
      shoes: ['#4A3520', '#3A2510', '#5A4530'],
      hair: '#4A3520',
      skin: '#D4A574',
      skinDark: '#B4956A',
      hat: '#8B4513'
    },
    '#CD853F': { // Wirt - brown
      shirt: ['#8B4513', '#6B3510', '#A05523'],
      pants: ['#4A3020', '#3A2010', '#5A4030'],
      shoes: ['#3A2010', '#2A1008', '#4A3020'],
      hair: '#5A4030',
      skin: '#E8B8A0',
      skinDark: '#C8A080',
      hat: '#8B4513'
    },
    '#4169E1': { // Gildenmeisterin - blue
      shirt: ['#1565C0', '#0D47A1', '#1976D2'],
      pants: ['#0D47A1', '#0A3690', '#1155B8'],
      shoes: ['#0A3690', '#051080', '#0A4090'],
      hair: '#4A3020',
      skin: '#D4A574',
      skinDark: '#B4956A',
      hat: '#1565C0'
    },
    '#FF0000': { // Arena-Leiter - red
      shirt: ['#C62828', '#8B0000', '#E53935'],
      pants: ['#4A1515', '#3A0A0A', '#5A1A1A'],
      shoes: ['#3A0A0A', '#2A0505', '#4A0A0A'],
      hair: '#3A2020',
      skin: '#D4A574',
      skinDark: '#B4956A',
      hat: '#C62828'
    },
    };
  return colorMap[color] || {
    shirt: ['#3A5F8C', '#2D4A6E', '#4C78A8'],
    pants: ['#2F4F4F', '#232F2F', '#3D5D5D'],
    shoes: ['#1A1A1A', '#0D0D0D', '#2A2A2A'],
    hair: '#3A2A20',
    skin: '#D4A574',
    skinDark: '#B4956A',
    hat: color
  };
};

const NPCWithBuilding = ({ name, color, position, icon, onClick }: { 
  name: string; 
  color: string; 
  position: [number, number, number];
  icon: string;
  onClick?: () => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const [hovered, setHovered] = useState(false);
  const floatPhase = useRef(Math.random() * Math.PI * 2);

  const npcColors = getBuildingNPCColors(color);
  const skin = npcColors.skin;
  const skinDark = npcColors.skinDark;

  useFrame(() => {
    if (!meshRef.current) return;
    floatPhase.current += 0.015;
    meshRef.current.position.y = Math.sin(floatPhase.current) * 0.03;
    
    // NPCs face center (0,0,0)
    const toCenterX = -position[0];
    const toCenterZ = -position[2];
    meshRef.current.rotation.y = Math.atan2(toCenterX, toCenterZ);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (onClick) {
      onClick();
    }
  };

  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <group ref={meshRef}>
        {/* Shadow */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 12]} />
          <meshStandardMaterial color="#000" transparent opacity={0.15} />
        </mesh>
        
        {/* Left Leg */}
        <mesh position={[0.1, 0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.4, 0.16]} />
          <meshStandardMaterial color={npcColors.pants[0]} roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.42, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.04, 0.18]} />
          <meshStandardMaterial color={npcColors.pants[1]} roughness={0.8} />
        </mesh>
        
        {/* Right Leg */}
        <mesh position={[-0.1, 0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.4, 0.16]} />
          <meshStandardMaterial color={npcColors.pants[0]} roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.42, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.04, 0.18]} />
          <meshStandardMaterial color={npcColors.pants[1]} roughness={0.8} />
        </mesh>
        
        {/* Boots */}
        <mesh position={[0.1, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.2]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} />
        </mesh>
        <mesh position={[-0.1, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.2]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} />
        </mesh>
        
        {/* Body - Torso */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.25]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.75} />
        </mesh>
        {/* Shirt stripe left */}
        <mesh position={[0.2, 0.85, 0.126]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.01]} />
          <meshStandardMaterial color={npcColors.shirt[2]} roughness={0.7} />
        </mesh>
        {/* Shirt stripe right */}
        <mesh position={[-0.2, 0.85, 0.126]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.01]} />
          <meshStandardMaterial color={npcColors.shirt[2]} roughness={0.7} />
        </mesh>
        
        {/* Belt */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.52, 0.08, 0.26]} />
          <meshStandardMaterial color="#3A2A10" roughness={0.6} />
        </mesh>
        <mesh position={[0.12, 0.58, 0.14]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.03]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[0.32, 0.85, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.75} />
        </mesh>
        <mesh position={[0.32, 0.58, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} />
        </mesh>
        
        <mesh position={[-0.32, 0.85, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.75} />
        </mesh>
        <mesh position={[-0.32, 0.58, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} />
        </mesh>
        
        {/* Head */}
        <group position={[0, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.44, 0.4]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
          
          <mesh position={[0, -0.18, 0.06]} castShadow>
            <boxGeometry args={[0.36, 0.12, 0.32]} />
            <meshStandardMaterial color={skinDark} roughness={0.6} />
          </mesh>
          
          <mesh position={[0, -0.04, 0.22]} castShadow>
            <boxGeometry args={[0.08, 0.1, 0.08]} />
            <meshStandardMaterial color={skinDark} roughness={0.5} />
          </mesh>
          
          {/* Eyes */}
          <mesh position={[0.1, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.04]} />
            <meshStandardMaterial color="#FFF" roughness={0.3} />
          </mesh>
          <mesh position={[-0.1, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.04]} />
            <meshStandardMaterial color="#FFF" roughness={0.3} />
          </mesh>
          
          <mesh position={[0.1, 0.05, 0.22]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial color="#1A1A2A" roughness={0.2} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.22]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial color="#1A1A2A" roughness={0.2} />
          </mesh>
          
          <mesh position={[0.12, 0.08, 0.225]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.08, 0.08, 0.225]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
          </mesh>
          
          {/* Eyebrows */}
          <mesh position={[0.1, 0.16, 0.18]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.04]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.16, 0.18]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.04]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.8} />
          </mesh>
          
          {/* Mouth */}
          <mesh position={[0, -0.12, 0.2]} castShadow>
            <boxGeometry args={[0.12, 0.03, 0.04]} />
            <meshStandardMaterial color="#C45050" roughness={0.5} />
          </mesh>
          
          {/* Blush */}
          <mesh position={[0.16, -0.02, 0.18]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.02]} />
            <meshStandardMaterial color="#E8A0A0" transparent opacity={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[-0.16, -0.02, 0.18]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.02]} />
            <meshStandardMaterial color="#E8A0A0" transparent opacity={0.4} roughness={0.4} />
          </mesh>
          
          {/* Hair */}
          <mesh position={[0, 0.22, -0.04]} castShadow>
            <boxGeometry args={[0.46, 0.14, 0.42]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.85} />
          </mesh>
          <mesh position={[0.2, 0.1, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.12]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.85} />
          </mesh>
          <mesh position={[-0.2, 0.1, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.12]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.85} />
          </mesh>
          
          {/* Hat - based on NPC color */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.24, 0.3, 4]} />
            <meshStandardMaterial color={npcColors.hat} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.36, 0.1, 0.36]} />
            <meshStandardMaterial color={npcColors.hat} roughness={0.5} />
          </mesh>
        </group>
        
        {/* Icon indicator */}
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
        </mesh>
        <pointLight position={[0, 2.1, 0]} color="#FFD700" intensity={1} distance={3} />
        
        {hovered && (
          <Html position={[0, 2.4, 0]} center>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 10,
              padding: '4px 12px',
              border: '2px solid #E0D5C0',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <div style={{ color: '#333', fontSize: 12, fontWeight: 'bold', fontFamily: 'Fredoka, sans-serif' }}>
                {icon} {name}
              </div>
              <div style={{ color: '#888', fontSize: 9 }}>Klicken zum Öffnen</div>
            </div>
          </Html>
        )}
      </group>
      
      {/* Click area */}
      <mesh
        position={[0, 1, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

const PortalRing = ({ zone, angle, radius, unlocked }: { zone: typeof ZONES[0]; angle: number; radius: number; unlocked: boolean }) => {
  const ringRef = useRef<THREE.Group>(null);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);

  useFrame((_, dt) => {
    if (ringRef.current && unlocked) {
      ringRef.current.rotation.z += dt * 0.5;
    }
  });

  const px = Math.cos(angle) * radius;
  const pz = Math.sin(angle) * radius;

  const handleClick = () => {
    if (unlocked) {
      setPlayerPosition([zone.center[0], 0, zone.center[1]]);
    }
  };

  return (
    <group position={[px, 0, pz]} onClick={handleClick}>
      {/* Base pedestal */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[3, 3.5, 0.4, 16]} />
        <meshStandardMaterial color={unlocked ? '#D2B48C' : '#808080'} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.1, 16]} />
        <meshStandardMaterial color={unlocked ? '#C4A777' : '#696969'} roughness={0.5} />
      </mesh>

      {/* Portal arch - two pillars + arch */}
      <mesh position={[-1.8, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 4.5, 8]} />
        <meshStandardMaterial color={unlocked ? '#B8A88A' : '#777'} roughness={0.5} />
      </mesh>
      <mesh position={[1.8, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 4.5, 8]} />
        <meshStandardMaterial color={unlocked ? '#B8A88A' : '#777'} roughness={0.5} />
      </mesh>

      {/* Rotating ring */}
      <group ref={ringRef} position={[0, 3, 0]}>
        <mesh>
          <torusGeometry args={[2, 0.15, 16, 32]} />
          <meshStandardMaterial
            color={unlocked ? zone.color : '#555'}
            emissive={unlocked ? zone.color : '#333'}
            emissiveIntensity={unlocked ? 1.5 : 0.1}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Inner rotating ring */}
        {unlocked && (
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.6, 0.08, 12, 24]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={2}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
      </group>

      {/* Portal fill */}
      <mesh position={[0, 3, 0]}>
        <circleGeometry args={[1.7, 32]} />
        <meshStandardMaterial
          color={unlocked ? zone.color : '#444'}
          emissive={unlocked ? zone.color : '#222'}
          emissiveIntensity={unlocked ? 0.8 : 0}
          transparent
          opacity={unlocked ? 0.35 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glow */}
      {unlocked && (
        <pointLight position={[0, 3, 0]} color={zone.color} intensity={4} distance={10} />
      )}

      {/* Lock */}
      {!unlocked && (
        <mesh position={[0, 5.5, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.5} />
        </mesh>
      )}
    </group>
  );
};

const GLBFountain = () => {
  const { scene } = useGLTF('/hundertwasser-haus_brunnen.glb');

  return (
    <group>
      <primitive
        object={scene.clone()}
        scale={[3, 3, 3]}
        position={[0, -1.0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export const HubBuildings = ({ onOpenShop, onOpenGuild, onOpenBank, onOpenPotionCraft, onOpenWeaponCraft, onOpenPVPArena, onOpenFriends, onOpenEvents, onOpenRaid }: { onOpenShop?: (tab: 'items' | 'pets', shopType?: 'general' | 'weapons' | 'armor' | 'potions') => void; onOpenGuild?: () => void; onOpenBank?: () => void; onOpenPotionCraft?: () => void; onOpenWeaponCraft?: () => void; onOpenPVPArena?: () => void; onOpenFriends?: () => void; onOpenEvents?: () => void; onOpenRaid?: () => void }) => {

  // Detailed Tree Component
const DetailedTree = ({ position, variant }: { position: [number, number, number]; variant: number }) => {
  const ref = useRef<THREE.Group>(null);
  
  const trunkColors = ['#5D4037', '#4E342E', '#6D4C41'];
  const leafColors = [
    ['#2E7D32', '#388E3C', '#43A047'],
    ['#1B5E20', '#2E7D32', '#388E3C'],
    ['#388E3C', '#43A047', '#4CAF50'],
    ['#FF69B4', '#FFB6C1', '#FF91A4'], // cherry blossom
    ['#2E8B57', '#3CB371', '#48D1CC'], // tropical
  ];
  const c = variant % leafColors.length;
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.5 + position[0]) * 0.02;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Trunk - slightly tilted */}
      <mesh position={[0.1, 1.5, 0]} rotation={[0, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 3, 6]} />
        <meshStandardMaterial color={trunkColors[variant % trunkColors.length]} roughness={0.9} />
      </mesh>
      
      {/* Main foliage - slightly offset */}
      <mesh position={[0.2, 3.3, 0.1]} castShadow>
        <coneGeometry args={[1.3, 2.5, 8]} />
        <meshStandardMaterial color={leafColors[c][0]} roughness={0.7} />
      </mesh>
      
      {/* Second layer - different green */}
      <mesh position={[-0.3, 4.2, -0.2]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color={leafColors[c][1]} roughness={0.7} />
      </mesh>
      
      {/* Top - lighter */}
      <mesh position={[0.1, 5, 0]} castShadow>
        <coneGeometry args={[0.6, 1.5, 6]} />
        <meshStandardMaterial color={leafColors[c][2]} roughness={0.6} />
      </mesh>
    </group>
  );
};

// Animated Torch
const AnimatedTorch = ({ position }: { position: [number, number, number] }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current && lightRef.current) {
      const flicker = 0.8 + Math.sin(clock.elapsedTime * 10) * 0.2 + Math.random() * 0.1;
      meshRef.current.scale.setScalar(flicker);
      if (lightRef.current) lightRef.current.intensity = 2 * flicker;
    }
  });
  
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 3, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      {/* Flame mesh */}
      <mesh ref={meshRef} position={[0, 3.2, 0]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color="#FF6D00" emissive="#FF6D00" emissiveIntensity={5} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 3.2, 0]} color="#FF9800" intensity={3} distance={15} />
    </group>
  );
};

  return (
    <group>
      {/* Detailed cherry blossom trees */}
      {[
        [-15, 0, 15], [15, 0, 15], [-15, 0, -15], [15, 0, -15],
        [-25, 0, 0], [25, 0, 0], [0, 0, 25], [0, 0, -25],
        [-8, 0, 8], [8, 0, 8], [-8, 0, -8], [8, 0, -8],
      ].map(([x, , z], i) => (
        <group key={`hub-tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.35, 4, 16]} />
            <meshStandardMaterial color="#5D4037" roughness={0.85} />
          </mesh>
          <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
            <sphereGeometry args={[2.2, 24, 24]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#FF69B4' : i % 3 === 1 ? '#FFB6C1' : '#3CB371'} roughness={0.6} />
          </mesh>
          <mesh position={[0.7, 5.3, 0.5]} castShadow receiveShadow>
            <sphereGeometry args={[1.4, 16, 16]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#FF91A4' : '#2E8B57'} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Decorative rocks */}
      {[
        [-20, 0, 10, 1.2], [20, 0, -10, 0.8], [-10, 0, -20, 1], [10, 0, 20, 0.7],
        [-30, 0, -20, 1.5], [30, 0, 20, 1.1], [-18, 0, 28, 0.9], [28, 0, -18, 0.6],
      ].map(([x, , z, s], i) => (
        <mesh key={`rock-${i}`} position={[x, (s as number) * 0.3, z]} castShadow>
          <dodecahedronGeometry args={[s as number, 0]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#A0A0A0' : '#8B8B8B'} roughness={0.8} />
        </mesh>
      ))}

      {/* Lamp posts along paths */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 20;
        return (
          <group key={`lamp-${i}`} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 4, 8]} />
              <meshStandardMaterial color="#5C4033" />
            </mesh>
            <mesh position={[0, 4.2, 0]}>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial color="#FFE4B5" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 4.2, 0]} color="#FFD700" intensity={2} distance={8} />
          </group>
        );
      })}

{/* ==================== NEUE GEBÄUDE & NPCs ==================== */}

      {/* Waffenladen - Westen - door faces center */}
      <group position={[-20, 0, 20]} rotation={[0, 2.35, 0]}>
        {/* Main walls - 2 tones */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4.2, 3, 4.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.75} />
        </mesh>
        <mesh position={[0.05, 1.5, 0.15]} castShadow>
          <boxGeometry args={[3.8, 2.8, 3.8]} />
          <meshStandardMaterial color="#A0522D" roughness={0.7} />
        </mesh>
        
        {/* Roof with overhang */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[4.8, 0.35, 4.8]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[3.2, 0.5, 3.2]} />
          <meshStandardMaterial color="#6D4C41" roughness={0.75} />
        </mesh>
        
        {/* Windows - dark with frame */}
        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, 1.8, 2.15]}>
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.7, 0.1]} />
              <meshStandardMaterial color="#3E2723" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.55, 0.55, 0.08]} />
              <meshStandardMaterial color="#FFEB3B" emissive="#FFB300" emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}
        
        {/* Door */}
        <mesh position={[0, 0.75, 2.15]} castShadow>
          <boxGeometry args={[0.9, 1.5, 0.12]} />
          <meshStandardMaterial color="#4E342E" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, 2.22]}>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Sign */}
        <mesh position={[0, 2.8, 2.2]} castShadow>
          <boxGeometry args={[1.6, 0.8, 0.15]} />
          <meshStandardMaterial color="#4169E1" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.8, 2.28]}>
          <boxGeometry args={[1.4, 0.6, 0.05]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
        
        {/* Alchemist & Handwerker & Tierhändler - vor dem Gebäude (nahe Tür) */}
        <NPCWithBuilding name="Alchemist Anton" color="#9C27B0" position={[0, 0, 3]} icon="⚗️" onClick={() => onOpenPotionCraft?.()} />
        <NPCWithBuilding name="Handwerker Hagen" color="#FF9800" position={[2.5, 0, 3]} icon="🔨" onClick={() => onOpenWeaponCraft?.()} />
        <NPCWithBuilding name="Tierhändler Tobi" color="#FF69B4" position={[-2.5, 0, 3]} icon="🐾" onClick={() => onOpenShop?.('pets')} />
      </group>

      {/* Bank/Lager - Osten Nord - door faces center */}
      <group position={[20, 0, -20]} rotation={[0, 0.785, 0]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[5, 4, 4]} />
          <meshStandardMaterial color="#4A4A4A" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[3, 0.4, 3]} />
          <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Säulen */}
        {[-2, 2].map(x => (
          <mesh key={x} position={[x, 2, 2.1]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
            <meshStandardMaterial color="#D2B48C" roughness={0.6} />
          </mesh>
        ))}
        <NPCWithBuilding name="Bankier Boris" color="#4A4A4A" position={[0, 0, 3]} icon="🏦" onClick={() => onOpenBank?.()} />
      </group>

      {/* Hausierer (Traveling Merchant) - Südwesten - faces center */}
      <group position={[-30, 0, 5]} rotation={[0, -0.78, 0]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[1.5, 2, 1.6, 8]} />
          <meshStandardMaterial color="#DEB887" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow>
          <coneGeometry args={[1.8, 1, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Karren */}
        <mesh position={[1.5, 0.5, 0]} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#A0522D" roughness={0.9} />
        </mesh>
        <mesh position={[1.5, 1, 0]} castShadow>
          <boxGeometry args={[1, 0.4, 0.6]} />
          <meshStandardMaterial color="#D2B48C" roughness={0.6} />
        </mesh>
        <NPCWithBuilding name="Händler Hans" color="#DEB887" position={[0, 0, 1.5]} icon="🛒" onClick={() => onOpenShop?.('items')} />
      </group>

      {/* Taverne - Südosten - door faces center */}
      <group position={[30, 0, 5]} rotation={[0, -2.35, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[5, 3, 4]} />
          <meshStandardMaterial color="#CD853F" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow>
          <coneGeometry args={[2.8, 1.5, 6]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Schild */}
        <mesh position={[0, 2, 2.1]} castShadow>
          <boxGeometry args={[2, 1.2, 0.1]} />
          <meshStandardMaterial color="#8B0000" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2, 2.15]}>
          <boxGeometry args={[1.5, 0.8, 0.05]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
        {/* Eingang */}
        <mesh position={[0, 0.8, 2.05]} castShadow>
          <boxGeometry args={[1.2, 1.6, 0.1]} />
          <meshStandardMaterial color="#4A3728" roughness={0.9} />
        </mesh>
        <NPCWithBuilding name="Wirt Willi" color="#CD853F" position={[0, 0, 3]} icon="🍺" onClick={() => onOpenShop?.('items')} />
      </group>

      {/* Gildenhaus - Zentrum Nord - faces center */}
      <group position={[0, 0, 30]} rotation={[0, 3.14, 0]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[6, 5, 5]} />
          <meshStandardMaterial color="#4169E1" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 5.3, 0]} castShadow>
          <boxGeometry args={[4, 0.6, 4]} />
          <meshStandardMaterial color="#1E90FF" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 5.8, 0]} castShadow>
          <coneGeometry args={[0.5, 1.2, 4]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        <pointLight position={[0, 6, 0]} color="#4169E1" intensity={2} distance={8} />
        {/* Tür */}
        <mesh position={[0, 1.2, 2.55]} castShadow>
          <boxGeometry args={[1.5, 2.4, 0.1]} />
          <meshStandardMaterial color="#4A3728" roughness={0.9} />
        </mesh>
        <NPCWithBuilding name="Gildenmeisterin Gabi" color="#4169E1" position={[0, 0, 4]} icon="🏛️" onClick={() => onOpenGuild?.()} />
        <NPCWithBuilding name="Arena-Leiter Max" color="#FF0000" position={[3, 0, 4]} icon="⚔️" onClick={() => onOpenPVPArena?.()} />
        <NPCWithBuilding name="Freunde-Finder Finn" color="#9C27B0" position={[-3, 0, 4]} icon="👥" onClick={() => onOpenFriends?.()} />
      </group>

      {/* Event & Raid building - door faces center */}
      <group position={[30, 0, -10]} rotation={[0, -0.785, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#4A3728" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow>
          <coneGeometry args={[2.2, 1.2, 4]} />
          <meshStandardMaterial color="#8B0000" roughness={0.8} />
        </mesh>
        <NPCWithBuilding name="Event-Verkünder Evi" color="#FF9800" position={[0, 0, 4]} icon="🎉" onClick={() => onOpenEvents?.()} />
        <NPCWithBuilding name="Raid-Leiter Roy" color="#9C27B0" position={[3, 0, 4]} icon="👹" onClick={() => onOpenRaid?.()} />
      </group>

      {/* Stone path - small ring only */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[6, 7.5, 32]} />
        <meshStandardMaterial color="#C4A777" roughness={0.8} />
      </mesh>

      {/* Flower patches */}
      {generateFlowerData().map((f, i) => (
        <HubFlower key={`flower-${i}`} position={f.pos} color={f.color} />
      ))}
    </group>
  );
};

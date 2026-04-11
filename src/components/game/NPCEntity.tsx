import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

interface Props {
  name: string;
  position: [number, number, number];
  color: string;
  onClick?: () => void;
}

const getNPCColors = (color: string) => {
  const npcColors: Record<string, { shirt: [string, string, string]; pants: [string, string, string]; shoes: [string, string, string]; hair: string; skin: string; skinDark: string; hat?: string }> = {
    '#4169E1': { // Blacksmith
      shirt: ['#3A5F8C', '#2D4A6E', '#4C78A8'],
      pants: ['#2F4F4F', '#232F2F', '#3D5D5D'],
      shoes: ['#1A1A1A', '#0D0D0D', '#2A2A2A'],
      hair: '#2A1A10',
      skin: '#D4A574',
      skinDark: '#B8956A',
      hat: '#4A4A4A'
    },
    '#CD853F': { // Merchant
      shirt: ['#8B5A2B', '#6B4423', '#A06B35'],
      pants: ['#4A4025', '#3A301D', '#5A5030'],
      shoes: ['#2A2015', '#1A1008', '#3A2A1A'],
      hair: '#3A2A15',
      skin: '#D4A574',
      skinDark: '#B8956A'
    },
    '#FF69B4': { // Pet Master
      shirt: ['#E83A98', '#C42D7B', '#F84DAD'],
      pants: ['#6B4060', '#4F2A45', '#7B4A65'],
      shoes: ['#4A2535', '#2D1520', '#5A2D40'],
      hair: '#F0B0D0',
      skin: '#E8B8A0',
      skinDark: '#C8A080',
      hat: '#FF69B4'
    },
    '#FFD700': { // Rebirth
      shirt: ['#C4A000', '#9E7800', '#D4B020'],
      pants: ['#5A4800', '#3A3000', '#6A5400'],
      shoes: ['#3A2A00', '#2A1800', '#4A3400'],
      hair: '#E8D878',
      skin: '#D4A574',
      skinDark: '#B8956A',
      hat: '#FFD700'
    }
  };
  
  return npcColors[color] || {
    shirt: ['#3A6B3A', '#2A4F2A', '#4A804A'],
    pants: ['#2F3F2F', '#1F2F1F', '#3F4F3F'],
    shoes: ['#1A1A1A', '#0D0D0D', '#2A2A2A'],
    hair: '#3A2A15',
    skin: '#D4A574',
    skinDark: '#B8956A'
  };
};

export const NPCEntity = ({ name, position, color, onClick }: Props) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const setShowQuestDialog = useQuestStore(s => s.setShowQuestDialog);
  const setSelectedNpc = useQuestStore(s => s.setSelectedNpc);
  const quests = useQuestStore(s => s.quests);
  const language = useSettingsStore(s => s.language);
  const [hovered, setHovered] = useState(false);
  const floatPhase = useRef(Math.random() * Math.PI * 2);
  
  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language][key];
  const npcColors = getNPCColors(color);
  
  const hasQuests = quests.some(q => q.npcName === name && (q.status === 'available' || q.status === 'completed'));
  
  useFrame(() => {
    if (!meshRef.current) return;
    floatPhase.current += 0.015;
    meshRef.current.position.y = position[1] + Math.sin(floatPhase.current) * 0.03;
    
    // NPCs look at player - back to center is wrong
    const toPlayerX = playerPos[0] - position[0];
    const toPlayerZ = playerPos[2] - position[2];
    meshRef.current.rotation.y = Math.atan2(toPlayerX, toPlayerZ);
  });
  
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 5) {
      setSelectedNpc(name);
      setShowQuestDialog(true);
    }
  };
  
  const skin = npcColors.skin;
  const skinDark = '#B8956A4';
  
  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={meshRef}>
        {/* Shadow */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 12]} />
          <meshStandardMaterial color="#000" transparent opacity={0.15} />
        </mesh>
        
        {/* Legs - two separate legs for blocky look */}
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
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[-0.1, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.2]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} metalness={0.1} />
        </mesh>
        
        {/* Body - Torso */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.25]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.75} />
        </mesh>
        {/* Shirt details - left side stripe */}
        <mesh position={[0.2, 0.85, 0.126]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.01]} />
          <meshStandardMaterial color={npcColors.shirt[2]} roughness={0.7} />
        </mesh>
        {/* Shirt details - right side stripe */}
        <mesh position={[-0.2, 0.85, 0.126]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.01]} />
          <meshStandardMaterial color={npcColors.shirt[2]} roughness={0.7} />
        </mesh>
        
        {/* Belt */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.52, 0.08, 0.26]} />
          <meshStandardMaterial color="#3A2A10" roughness={0.6} />
        </mesh>
        {/* Belt buckle */}
        <mesh position={[0.12, 0.58, 0.14]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.03]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Arms */}
        {/* Left Arm */}
        <mesh position={[0.32, 0.85, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.75} />
        </mesh>
        <mesh position={[0.32, 0.58, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} />
        </mesh>
        
        {/* Right Arm */}
        <mesh position={[-0.32, 0.85, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.75} />
        </mesh>
        <mesh position={[-0.32, 0.58, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.7} />
        </mesh>
        
        {/* Head - blocky face */}
        <group position={[0, 1.45, 0]}>
          {/* Face base */}
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.44, 0.4]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
          
          {/* Chin/Jaw */}
          <mesh position={[0, -0.18, 0.06]} castShadow>
            <boxGeometry args={[0.36, 0.12, 0.32]} />
            <meshStandardMaterial color={skinDark} roughness={0.6} />
          </mesh>
          
          {/* Nose */}
          <mesh position={[0, -0.04, 0.22]} castShadow>
            <boxGeometry args={[0.08, 0.1, 0.08]} />
            <meshStandardMaterial color={skinDark} roughness={0.5} />
          </mesh>
          
          {/* Eyes - larger and more expressive */}
          <mesh position={[0.1, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.04]} />
            <meshStandardMaterial color="#FFF" roughness={0.3} />
          </mesh>
          <mesh position={[-0.1, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.04]} />
            <meshStandardMaterial color="#FFF" roughness={0.3} />
          </mesh>
          
          {/* Pupils */}
          <mesh position={[0.1, 0.05, 0.22]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial color="#1A1A2A" roughness={0.2} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.22]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial color="#1A1A2A" roughness={0.2} />
          </mesh>
          
          {/* Eye shine */}
          <mesh position={[0.12, 0.08, 0.225]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.08, 0.08, 0.225]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
          </mesh>
          
          {/* Eyebrows - expressive */}
          <mesh position={[0.1, 0.16, 0.18]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.04]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.16, 0.18]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.04]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.8} />
          </mesh>
          
          {/* Mouth - slight smile */}
          <mesh position={[0, -0.12, 0.2]} castShadow>
            <boxGeometry args={[0.12, 0.03, 0.04]} />
            <meshStandardMaterial color="#C45050" roughness={0.5} />
          </mesh>
          
          {/* Cheeks - subtle blush */}
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
          {/* Hair side pieces */}
          <mesh position={[0.2, 0.1, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.12]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.85} />
          </mesh>
          <mesh position={[-0.2, 0.1, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.12]} />
            <meshStandardMaterial color={npcColors.hair} roughness={0.85} />
          </mesh>
          
          {/* Hat based on NPC type */}
          {color === '#4169E1' && (
            <group>
              {/* Blacksmith helmet */}
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.48, 0.12, 0.44]} />
                <meshStandardMaterial color={npcColors.hat} metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.22, 0]} castShadow>
                <boxGeometry args={[0.42, 0.08, 0.38]} />
                <meshStandardMaterial color={npcColors.hat} metalness={0.6} roughness={0.4} />
              </mesh>
            </group>
          )}
          {color === '#FF69B4' && (
            <group>
              {/* Pet master wizard hat */}
              <mesh position={[0, 0.32, 0]} castShadow>
                <coneGeometry args={[0.24, 0.3, 4]} />
                <meshStandardMaterial color={npcColors.hat} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.36, 0.1, 0.36]} />
                <meshStandardMaterial color="#E83A98" roughness={0.5} />
              </mesh>
            </group>
          )}
          {color === '#FFD700' && (
            <group>
              {/* Crown */}
              <mesh position={[0, 0.28, 0]} castShadow>
                <boxGeometry args={[0.4, 0.08, 0.36]} />
                <meshStandardMaterial color={npcColors.hat} metalness={0.9} roughness={0.15} />
              </mesh>
              <mesh position={[0.14, 0.36, 0]} castShadow>
                <boxGeometry args={[0.08, 0.12, 0.08]} />
                <meshStandardMaterial color={npcColors.hat} metalness={0.9} roughness={0.15} />
              </mesh>
              <mesh position={[-0.14, 0.36, 0]} castShadow>
                <boxGeometry args={[0.08, 0.12, 0.08]} />
                <meshStandardMaterial color={npcColors.hat} metalness={0.9} roughness={0.15} />
              </mesh>
            </group>
          )}
        </group>
        
        {/* Staff/Tool based on color */}
        {color === '#4169E1' && (
          <group position={[0.42, 0.85, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 1.1, 0.08]} />
              <meshStandardMaterial color="#4A3020" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.16, 0.16, 0.16]} />
              <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )}
        {color === '#FFD700' && (
          <group position={[-0.42, 0.95, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 1.2, 0.06]} />
              <meshStandardMaterial color="#6A5010" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.55, 0]} castShadow>
              <octahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
            </mesh>
            <pointLight position={[0, 0.55, 0]} color="#FFD700" intensity={0.8} distance={3} />
          </group>
        )}
        
        {/* Quest indicator */}
        {hasQuests && (
          <group position={[0, 2.1, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.5} />
            </mesh>
            <pointLight color="#FFD700" intensity={1.5} distance={3} />
          </group>
        )}
        
        {hovered && (
          <Html position={[0, 2.2, 0]} center>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 10,
              padding: '4px 12px',
              border: '2px solid #E0D5C0',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <div style={{ color: '#333', fontSize: 12, fontWeight: 'bold', fontFamily: 'Fredoka, sans-serif' }}>{name}</div>
              <div style={{ color: '#888', fontSize: 9 }}>{t('clickToTalk')}</div>
            </div>
          </Html>
        )}
      </group>
      
      <mesh
        position={[0, 1, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};
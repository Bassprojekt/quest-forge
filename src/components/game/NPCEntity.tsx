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

  const hasQuests = quests.some(q => q.npcName === name && (q.status === 'available' || q.status === 'completed'));

  useFrame(() => {
    if (!meshRef.current) return;
    floatPhase.current += 0.015;
    meshRef.current.position.y = position[1] + Math.sin(floatPhase.current) * 0.03;

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    meshRef.current.rotation.y = Math.atan2(dx, dz);
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

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={meshRef}>
        {/* Shadow */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 12]} />
          <meshStandardMaterial color="#000" transparent opacity={0.15} />
        </mesh>

        {/* Legs */}
        <mesh position={[0.12, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshStandardMaterial color={color === '#4169E1' ? '#2F4F4F' : color === '#FF69B4' ? '#8B4513' : '#4A4A4A'} roughness={0.7} />
        </mesh>
        <mesh position={[-0.12, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshStandardMaterial color={color === '#4169E1' ? '#2F4F4F' : color === '#FF69B4' ? '#8B4513' : '#4A4A4A'} roughness={0.7} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.28, 0.55, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 12]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
        <mesh position={[0.08, 0.6, 0.15]}>
          <boxGeometry args={[0.1, 0.12, 0.06]} />
          <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Arms */}
        <mesh position={[0.38, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh position={[-0.38, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#FFDAB9" roughness={0.6} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.65, -0.05]} castShadow>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color={color === '#FF69B4' ? '#FFB6C1' : '#4A3728'} roughness={0.8} />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.1, 1.52, 0.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.1, 1.52, 0.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Eye shine */}
        <mesh position={[0.11, 1.53, 0.25]} scale={0.5}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.09, 1.53, 0.25]} scale={0.5}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.8} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 1.45, 0.26]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#FFDAB9" roughness={0.7} />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, 1.38, 0.24]}>
          <boxGeometry args={[0.1, 0.02, 0.04]} />
          <meshStandardMaterial color="#CD5C5C" roughness={0.6} />
        </mesh>

        {/* Hat based on NPC type */}
        {color === '#4169E1' && (
          <group>
            {/* Blacksmith helmet */}
            <mesh position={[0, 1.85, 0]} castShadow>
              <sphereGeometry args={[0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.65, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 0.15, 12]} />
              <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )}
        {color === '#FF69B4' && (
          <group>
            {/* Pet master hat with bow */}
            <mesh position={[0, 1.8, 0]} castShadow>
              <coneGeometry args={[0.32, 0.5, 8]} />
              <meshStandardMaterial color="#FF69B4" roughness={0.4} />
            </mesh>
            <mesh position={[0.25, 1.7, 0]} castShadow>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#FF1493" roughness={0.5} />
            </mesh>
            <mesh position={[0.3, 1.65, 0.05]} scale={0.7}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial color="#FFF" roughness={0.5} />
            </mesh>
          </group>
        )}
        {color === '#FFD700' && (
          <group>
            {/* Rebirth altar crown */}
            <mesh position={[0, 1.75, 0]} castShadow>
              <torusGeometry args={[0.25, 0.05, 8, 16]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.15, 1.85, 0]} castShadow>
              <coneGeometry args={[0.08, 0.15, 4]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-0.15, 1.85, 0]} castShadow>
              <coneGeometry args={[0.08, 0.15, 4]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.95, 0]} castShadow>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}
        {!['#4169E1', '#FF69B4', '#FFD700'].includes(color) && (
          <mesh position={[0, 1.75, 0]} castShadow>
            <coneGeometry args={[0.28, 0.4, 8]} />
            <meshStandardMaterial color="#4169E1" roughness={0.5} />
          </mesh>
        )}

        {/* Staff/Tool based on color */}
        {color === '#4169E1' && (
          <group position={[0.5, 0.9, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.05, 1.2, 8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )}
        {color === '#FFD700' && (
          <group position={[-0.5, 0.9, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
              <meshStandardMaterial color="#DAA520" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.75, 0]}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>
            <pointLight position={[0, 0.75, 0]} color="#FFD700" intensity={1} distance={4} />
          </group>
        )}

        {/* Quest indicator */}
        {hasQuests && (
          <group position={[0, 2.4, 0]}>
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>
            <pointLight color="#FFD700" intensity={2} distance={3} />
          </group>
        )}

        {hovered && (
          <Html position={[0, 2.5, 0]} center>
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
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

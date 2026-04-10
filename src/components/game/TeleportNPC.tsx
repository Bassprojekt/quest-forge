import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

interface Props {
  onOpenTeleport: () => void;
}

const TELEPORT_NPC_COLOR = '#00E5FF';

export const TeleportNPC = ({ onOpenTeleport }: Props) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const playerLevel = useGameStore(s => s.playerLevel);
  const currentZone = useGameStore(s => s.currentZone);
  const language = useSettingsStore(s => s.language);
  const [hovered, setHovered] = useState(false);
  const floatPhase = useRef(Math.random() * Math.PI * 2);

  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language][key];
  const position: [number, number, number] = currentZone === 'hub' ? [8, 0, 0] : [0, 0, 0];

  useFrame(() => {
    if (!meshRef.current) return;
    floatPhase.current += 0.015;
    meshRef.current.position.y = position[1] + Math.sin(floatPhase.current) * 0.03;

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });

  const handleClick = () => {
    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 6) {
      onOpenTeleport();
    }
  };

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={meshRef}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
          <meshStandardMaterial color={TELEPORT_NPC_COLOR} roughness={0.4} metalness={0.5} emissive={TELEPORT_NPC_COLOR} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, 2.0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.25, 0.6, 8]} />
          <meshStandardMaterial color={TELEPORT_NPC_COLOR} roughness={0.4} metalness={0.5} emissive={TELEPORT_NPC_COLOR} emissiveIntensity={0.5} />
        </mesh>
        
        <mesh position={[0, 2.0, 0.35]} castShadow>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
        </mesh>
        
        <mesh position={[0.08, 1.65, 0.22]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
        </mesh>
        <mesh position={[-0.08, 1.65, 0.22]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
        </mesh>

        <mesh position={[0, 0.4, 0.35]} castShadow>
          <boxGeometry args={[0.4, 0.15, 0.1]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} metalness={0.8} />
        </mesh>
        
        {[0.15, -0.15].map((offset, i) => (
          <mesh key={i} position={[offset, 0.15, 0.4]} rotation={[0, 0, offset > 0 ? -0.3 : 0.3]} castShadow>
            <boxGeometry args={[0.15, 0.3, 0.1]} />
            <meshStandardMaterial color={TELEPORT_NPC_COLOR} roughness={0.4} metalness={0.5} />
          </mesh>
        ))}

        <pointLight position={[0, 2.5, 0]} color={TELEPORT_NPC_COLOR} intensity={2} distance={5} />

        <group position={[0, 2.8, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} transparent opacity={0.9} />
          </mesh>
          <pointLight color="#FFD700" intensity={2} distance={4} />
        </group>

        {hovered && (
          <Html position={[0, 3.2, 0]} center>
            <div style={{
              background: 'rgba(0,229,255,0.95)',
              borderRadius: 10,
              padding: '4px 12px',
              border: '2px solid #00BFFF',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'Fredoka, sans-serif' }}>{t('teleportNPC')}</div>
              <div style={{ color: '#E0F7FF', fontSize: 9 }}>{t('clickToTalk')}</div>
            </div>
          </Html>
        )}
      </group>

      <mesh
        position={[0, 1, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        visible={false}
      >
        <sphereGeometry args={[2, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color={TELEPORT_NPC_COLOR} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

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

const getTeleportColors = () => ({
  shirt: ['#00B8D4', '#00838F', '#26C6DA'],
  pants: ['#006064', '#004D40', '#00838F'],
  shoes: ['#004D40', '#003030', '#005A50'],
  hair: '#E0F7FA',
  skin: '#B2EBF2',
  skinDark: '#81D4FA',
  hat: '#00E5FF'
});

export const TeleportNPC = ({ onOpenTeleport }: Props) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const currentZone = useGameStore(s => s.currentZone);
  const language = useSettingsStore(s => s.language);
  const [hovered, setHovered] = useState(false);
  const floatPhase = useRef(Math.random() * Math.PI * 2);

  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language][key];
  const position: [number, number, number] = currentZone === 'hub' ? [8, 0, 0] : [0, 0, 0];
  const npcColors = getTeleportColors();
  const skin = npcColors.skin;
  const skinDark = npcColors.skinDark;

  useFrame(() => {
    if (!meshRef.current) return;
    floatPhase.current += 0.015;
    meshRef.current.position.y = position[1] + Math.sin(floatPhase.current) * 0.03;

    // NPC faces the center of the hub (0, 0)
    const toCenterX = 0 - position[0];
    const toCenterZ = 0 - position[2];
    meshRef.current.rotation.y = Math.atan2(toCenterX, toCenterZ);
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

        {/* Boots - glowing */}
        <mesh position={[0.1, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.2]} />
          <meshStandardMaterial color="#00BCD4" roughness={0.3} emissive="#00BCD4" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.1, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.2]} />
          <meshStandardMaterial color="#00BCD4" roughness={0.3} emissive="#00BCD4" emissiveIntensity={0.5} />
        </mesh>

        {/* Body - Torso */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.25]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Glow stripe */}
        <mesh position={[0, 0.85, 0.126]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.01]} />
          <meshStandardMaterial color={npcColors.shirt[2]} roughness={0.4} emissive={npcColors.shirt[2]} emissiveIntensity={0.5} />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.52, 0.08, 0.26]} />
          <meshStandardMaterial color="#00ACC1" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0.12, 0.58, 0.14]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.03]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>

        {/* Arms */}
        <mesh position={[0.32, 0.85, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.5} />
        </mesh>
        <mesh position={[0.32, 0.58, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.5} />
        </mesh>

        <mesh position={[-0.32, 0.85, 0]} castShadow>
          <boxGeometry args={[0.14, 0.5, 0.14]} />
          <meshStandardMaterial color={npcColors.shirt[0]} roughness={0.5} />
        </mesh>
        <mesh position={[-0.32, 0.58, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshStandardMaterial color={npcColors.shoes[0]} roughness={0.5} />
        </mesh>

        {/* Head */}
        <group position={[0, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.44, 0.4]} />
            <meshStandardMaterial color={skin} roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh position={[0, -0.18, 0.06]} castShadow>
            <boxGeometry args={[0.36, 0.12, 0.32]} />
            <meshStandardMaterial color={skinDark} roughness={0.5} />
          </mesh>

          <mesh position={[0, -0.04, 0.22]} castShadow>
            <boxGeometry args={[0.08, 0.1, 0.08]} />
            <meshStandardMaterial color={skinDark} roughness={0.4} />
          </mesh>

          {/* Eyes - glowing cyan */}
          <mesh position={[0.1, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.04]} />
            <meshStandardMaterial color="#00FFF0" roughness={0.2} emissive="#00FFF0" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.04]} />
            <meshStandardMaterial color="#00FFF0" roughness={0.2} emissive="#00FFF0" emissiveIntensity={0.8} />
          </mesh>

          {/* Eye shine */}
          <mesh position={[0.12, 0.08, 0.225]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1} />
          </mesh>
          <mesh position={[-0.08, 0.08, 0.225]} castShadow>
            <boxGeometry args={[0.02, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1} />
          </mesh>

          {/* Eyebrows */}
          <mesh position={[0.1, 0.16, 0.18]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.04]} />
            <meshStandardMaterial color="#E0F7FA" roughness={0.6} />
          </mesh>
          <mesh position={[-0.1, 0.16, 0.18]} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.04]} />
            <meshStandardMaterial color="#E0F7FA" roughness={0.6} />
          </mesh>

          {/* Mouth */}
          <mesh position={[0, -0.12, 0.2]} castShadow>
            <boxGeometry args={[0.12, 0.03, 0.04]} />
            <meshStandardMaterial color="#00ACC1" roughness={0.4} />
          </mesh>

          {/* Hair - ethereal white */}
          <mesh position={[0, 0.22, -0.04]} castShadow>
            <boxGeometry args={[0.46, 0.14, 0.42]} />
            <meshStandardMaterial color="#E0F7FA" roughness={0.4} />
          </mesh>
          <mesh position={[0.2, 0.1, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.12]} />
            <meshStandardMaterial color="#E0F7FA" roughness={0.4} />
          </mesh>
          <mesh position={[-0.2, 0.1, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.12]} />
            <meshStandardMaterial color="#E0F7FA" roughness={0.4} />
          </mesh>

          {/* Hat - magical crown */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.24, 0.3, 4]} />
            <meshStandardMaterial color={TELEPORT_NPC_COLOR} roughness={0.3} metalness={0.5} emissive={TELEPORT_NPC_COLOR} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.36, 0.1, 0.36]} />
            <meshStandardMaterial color="#00BCD4" roughness={0.4} />
          </mesh>
        </group>

        {/* Floating crystal */}
        <mesh position={[0, 2.1, 0]}>
          <octahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#FFE082" emissive="#FFD700" emissiveIntensity={1.5} />
        </mesh>
        <pointLight position={[0, 2.1, 0]} color="#00E5FF" intensity={1.5} distance={4} />

        {hovered && (
          <Html position={[0, 2.5, 0]} center>
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
      >
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};
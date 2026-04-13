import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, useGLTF } from '@react-three/drei';
import { useGameStore, Enemy } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';

interface Props {
  enemy: Enemy;
}

type MobType = 'humanoid' | 'slime' | 'beast' | 'insect' | 'plant' | 'elemental' | 'dragon' | 'undead' | 'aquatic' | 'glb_zombie' | 'glb_skeleton' | 'glb_creeper' | 'glb_enderman';

const MOB_CONFIGS: Record<string, { type: MobType; bodyColor: string; accentColor: string; hasWings: boolean; size: number }> = {
  'Zombie': { type: 'glb_zombie', bodyColor: '#4A5D23', accentColor: '#8B0000', hasWings: false, size: 0.7 },
  'Skelett': { type: 'glb_skeleton', bodyColor: '#E8E8E8', accentColor: '#4A4A4A', hasWings: false, size: 0.7 },
  'Creeper': { type: 'glb_creeper', bodyColor: '#00AA00', accentColor: '#111111', hasWings: false, size: 0.7 },
  'Enderman': { type: 'glb_enderman', bodyColor: '#111111', accentColor: '#AA00AA', hasWings: false, size: 0.9 },
  'Haustier Schnecke': { type: 'slime', bodyColor: '#98D8C8', accentColor: '#5D9E8D', hasWings: false, size: 0.5 },
  'Pilzling': { type: 'plant', bodyColor: '#8B4513', accentColor: '#FF6347', hasWings: false, size: 0.5 },
  'Blauer Schleim': { type: 'slime', bodyColor: '#4FC3F7', accentColor: '#81D4FA', hasWings: false, size: 0.6 },
  'Riesenbiene': { type: 'insect', bodyColor: '#FFD700', accentColor: '#FFA000', hasWings: true, size: 0.5 },
  'Sporenpilz': { type: 'plant', bodyColor: '#6D4C41', accentColor: '#9C27B0', hasWings: false, size: 0.6 },
  'Giftwurm': { type: 'beast', bodyColor: '#7CB342', accentColor: '#558B2F', hasWings: false, size: 0.5 },
  'Pilzgolem': { type: 'elemental', bodyColor: '#795548', accentColor: '#5D4037', hasWings: false, size: 0.9 },
  'Eiskobold': { type: 'humanoid', bodyColor: '#B3E5FC', accentColor: '#4FC3F7', hasWings: false, size: 0.5 },
  'Frostwolf': { type: 'beast', bodyColor: '#78909C', accentColor: '#B0BEC5', hasWings: false, size: 0.7 },
  'Eisriese': { type: 'humanoid', bodyColor: '#ECEFF1', accentColor: '#90CAF9', hasWings: false, size: 1.2 },
  'Magmaschleimer': { type: 'slime', bodyColor: '#FF5722', accentColor: '#FFAB91', hasWings: false, size: 0.6 },
  'Feuerdämon': { type: 'elemental', bodyColor: '#BF360C', accentColor: '#FF5722', hasWings: true, size: 0.8 },
  'Lavawurm': { type: 'beast', bodyColor: '#3E2723', accentColor: '#FF5722', hasWings: false, size: 1.0 },
  'Quallenfisch': { type: 'aquatic', bodyColor: '#E91E63', accentColor: '#F48FB1', hasWings: false, size: 0.5 },
  'Krabbenkrieger': { type: 'aquatic', bodyColor: '#C62828', accentColor: '#EF5350', hasWings: false, size: 0.6 },
  'Tiefseeschlange': { type: 'aquatic', bodyColor: '#AD1457', accentColor: '#EC407A', hasWings: false, size: 0.9 },
  'Schattengeist': { type: 'undead', bodyColor: '#37474F', accentColor: '#607D8B', hasWings: true, size: 0.6 },
  'Sumpfkröte': { type: 'beast', bodyColor: '#558B2F', accentColor: '#7CB342', hasWings: false, size: 0.7 },
  'Nebelwandler': { type: 'undead', bodyColor: '#455A64', accentColor: '#78909C', hasWings: true, size: 0.9 },
  'Kristallgolem': { type: 'elemental', bodyColor: '#00BCD4', accentColor: '#00E5FF', hasWings: false, size: 0.9 },
  'Prismadrache': { type: 'dragon', bodyColor: '#7B1FA2', accentColor: '#E040FB', hasWings: true, size: 1.0 },
  'Edelsteinkäfer': { type: 'insect', bodyColor: '#00695C', accentColor: '#00BFA5', hasWings: true, size: 0.7 },
  'Voidwalker': { type: 'undead', bodyColor: '#4A148C', accentColor: '#7B1FA2', hasWings: true, size: 0.8 },
  'Chaosphantom': { type: 'undead', bodyColor: '#311B92', accentColor: '#5E35B1', hasWings: true, size: 0.9 },
  'Nihilschlund': { type: 'dragon', bodyColor: '#1A237E', accentColor: '#3949AB', hasWings: true, size: 1.3 },
  // New mobs
  'Waldameise': { type: 'insect', bodyColor: '#5D4037', accentColor: '#8D6E63', hasWings: false, size: 0.3 },
  'Käfer': { type: 'insect', bodyColor: '#1B5E20', accentColor: '#4CAF50', hasWings: false, size: 0.3 },
  'Pilzwespe': { type: 'insect', bodyColor: '#FFA726', accentColor: '#E65100', hasWings: true, size: 0.5 },
  'Farnfox': { type: 'beast', bodyColor: '#8D6E63', accentColor: '#5D4037', hasWings: false, size: 0.5 },
  'Schneejäger': { type: 'humanoid', bodyColor: '#E0E0E0', accentColor: '#BDBDBD', hasWings: false, size: 0.6 },
  'Frostgeist': { type: 'undead', bodyColor: '#80DEEA', accentColor: '#00BCD4', hasWings: true, size: 0.5 },
  'Feuerkäfer': { type: 'insect', bodyColor: '#BF360C', accentColor: '#FF5722', hasWings: true, size: 0.4 },
  'Glühwurm': { type: 'insect', bodyColor: '#FFEB3B', accentColor: '#FFC107', hasWings: true, size: 0.3 },
  'Seeigel': { type: 'aquatic', bodyColor: '#7B1FA2', accentColor: '#AB47BC', hasWings: false, size: 0.4 },
  'Seepferdchen': { type: 'aquatic', bodyColor: '#EC407A', accentColor: '#F48FB1', hasWings: false, size: 0.3 },
  'Moosgeist': { type: 'undead', bodyColor: '#33691E', accentColor: '#558B2F', hasWings: true, size: 0.6 },
  'Glühfee': { type: 'elemental', bodyColor: '#FFD54F', accentColor: '#FFCA28', hasWings: true, size: 0.5 },
  'Mineralkrieger': { type: 'humanoid', bodyColor: '#607D8B', accentColor: '#90A4AE', hasWings: false, size: 0.7 },
  'Schattenrissaner': { type: 'undead', bodyColor: '#311B92', accentColor: '#5E35B1', hasWings: true, size: 0.7 },
  'Dunkelpriester': { type: 'humanoid', bodyColor: '#4A148C', accentColor: '#7B1FA2', hasWings: false, size: 0.6 },
  'Drachenpriester': { type: 'humanoid', bodyColor: '#BF360C', accentColor: '#FF5722', hasWings: false, size: 0.6 },
  'Lavaelementar': { type: 'elemental', bodyColor: '#FF5722', accentColor: '#FFAB91', hasWings: false, size: 0.9 },
  'Feenwolf': { type: 'beast', bodyColor: '#7B1FA2', accentColor: '#E040FB', hasWings: false, size: 0.6 },
  'Baumhirte': { type: 'elemental', bodyColor: '#2E7D32', accentColor: '#43A047', hasWings: false, size: 1.0 },
  'Windgeist': { type: 'undead', bodyColor: '#90CAF9', accentColor: '#42A5F5', hasWings: true, size: 0.6 },
  'Donnerbock': { type: 'beast', bodyColor: '#424242', accentColor: '#FFEB3B', hasWings: false, size: 0.8 },
  'Abgrundswächter': { type: 'undead', bodyColor: '#1A237E', accentColor: '#283593', hasWings: false, size: 1.0 },
  'Schatten Leviathan': { type: 'dragon', bodyColor: '#311B92', accentColor: '#5E35B1', hasWings: true, size: 1.5 },
  'Strahlengeist': { type: 'undead', bodyColor: '#FFD54F', accentColor: '#FFCA28', hasWings: true, size: 0.6 },
  'Himmelswächter': { type: 'humanoid', bodyColor: '#FFEB3B', accentColor: '#FFC107', hasWings: true, size: 0.8 },
  'Seelensammler': { type: 'undead', bodyColor: '#4527A0', accentColor: '#7E57C2', hasWings: true, size: 0.7 },
  'Schatten人流': { type: 'undead', bodyColor: '#37474F', accentColor: '#546E7A', hasWings: true, size: 0.8 },
  'Kampfmaschine': { type: 'humanoid', bodyColor: '#424242', accentColor: '#F44336', hasWings: false, size: 1.0 },
  'Messermönch': { type: 'humanoid', bodyColor: '#F44336', accentColor: '#B71C1C', hasWings: false, size: 0.6 },
  'Nachtmahralt': { type: 'undead', bodyColor: '#212121', accentColor: '#424242', hasWings: true, size: 1.2 },
  'Streitkolben': { type: 'humanoid', bodyColor: '#757575', accentColor: '#BDBDBD', hasWings: false, size: 0.8 },
  'Netzkämpfer': { type: 'humanoid', bodyColor: '#8D6E63', accentColor: '#5D4037', hasWings: false, size: 0.6 },
};

const getMobColors = (baseColor: string) => {
  return {
    base: baseColor,
    light: '#' + baseColor.slice(1).replace(/../g, c => Math.min(255, parseInt(c, 16) + 80).toString(16).padStart(2, '0')),
    dark: '#' + baseColor.slice(1).replace(/../g, c => Math.max(0, parseInt(c, 16) - 60).toString(16).padStart(2, '0')),
    accent: '#' + baseColor.slice(1).replace(/../g, c => Math.min(255, parseInt(c, 16) + 40).toString(16).padStart(2, '0')),
  };
};

const SlimeMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  const colors = getMobColors(config.bodyColor);
  return (
    <group>
      {/* Main body - cute rounded cube */}
      <mesh position={[0, scale * 0.55, 0]} castShadow>
        <boxGeometry args={[scale * 1.6, scale * 1.1, scale * 1.4]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      {/* Rounded top */}
      <mesh position={[0, scale * 1.15, 0]} castShadow>
        <boxGeometry args={[scale * 1.2, scale * 0.5, scale * 1.0]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      {/* Highlight stripe */}
      <mesh position={[0, scale * 0.9, scale * 0.5]} castShadow>
        <boxGeometry args={[scale * 0.8, scale * 0.3, scale * 0.15]} />
        <meshStandardMaterial color={colors.light} roughness={0.5} />
      </mesh>
      {/* Face - cute big eyes */}
      <group position={[0, scale * 0.55, scale * 0.7]}>
        {/* Left eye white */}
        <mesh position={[scale * 0.28, scale * 0.12, 0]}>
          <boxGeometry args={[scale * 0.35, scale * 0.35, scale * 0.15]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Right eye white */}
        <mesh position={[-scale * 0.28, scale * 0.12, 0]}>
          <boxGeometry args={[scale * 0.35, scale * 0.35, scale * 0.15]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Left pupil */}
        <mesh position={[scale * 0.28, scale * 0.08, scale * 0.08]}>
          <boxGeometry args={[scale * 0.2, scale * 0.2, scale * 0.1]} />
          <meshStandardMaterial color="#222222" roughness={0.2} />
        </mesh>
        {/* Right pupil */}
        <mesh position={[-scale * 0.28, scale * 0.08, scale * 0.08]}>
          <boxGeometry args={[scale * 0.2, scale * 0.2, scale * 0.1]} />
          <meshStandardMaterial color="#222222" roughness={0.2} />
        </mesh>
        {/* Cute blush */}
        <mesh position={[scale * 0.5, -scale * 0.02, scale * 0.02]}>
          <boxGeometry args={[scale * 0.15, scale * 0.1, scale * 0.05]} />
          <meshStandardMaterial color="#FFAAAA" transparent opacity={0.6} roughness={0.8} />
        </mesh>
        <mesh position={[-scale * 0.5, -scale * 0.02, scale * 0.02]}>
          <boxGeometry args={[scale * 0.15, scale * 0.1, scale * 0.05]} />
          <meshStandardMaterial color="#FFAAAA" transparent opacity={0.6} roughness={0.8} />
        </mesh>
        {/* Tiny smile */}
        <mesh position={[0, -scale * 0.12, scale * 0.05]}>
          <boxGeometry args={[scale * 0.2, scale * 0.05, scale * 0.05]} />
          <meshStandardMaterial color="#333333" roughness={0.5} />
        </mesh>
      </group>
      {/* Feet */}
      <mesh position={[scale * 0.4, scale * 0.08, scale * 0.3]} castShadow>
        <boxGeometry args={[scale * 0.4, scale * 0.15, scale * 0.5]} />
        <meshStandardMaterial color={colors.dark} roughness={0.7} />
      </mesh>
      <mesh position={[-scale * 0.4, scale * 0.08, scale * 0.3]} castShadow>
        <boxGeometry args={[scale * 0.4, scale * 0.15, scale * 0.5]} />
        <meshStandardMaterial color={colors.dark} roughness={0.7} />
      </mesh>
      {isTarget && (
        <mesh position={[0, scale * 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.2, scale * 1.5, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const HumanoidMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.3, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.38, scale * 0.5, 8, 16]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, scale * 1.1, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.35, scale * 0.7, 8, 16]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, scale * 1.85, 0]} castShadow>
        <sphereGeometry args={[scale * 0.32, 14, 14]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, scale * 1.95, -scale * 0.1]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.1, scale * 0.25]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.6} />
      </mesh>
      <mesh position={[scale * 0.38, scale * 1.15, 0]} rotation={[0, 0, -0.35]} castShadow>
        <capsuleGeometry args={[scale * 0.1, scale * 0.55, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.55} />
      </mesh>
      <mesh position={[-scale * 0.38, scale * 1.15, 0]} rotation={[0, 0, 0.35]} castShadow>
        <capsuleGeometry args={[scale * 0.1, scale * 0.55, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.55} />
      </mesh>
      <mesh position={[scale * 0.1, scale * 1.88, scale * 0.22]}>
        <sphereGeometry args={[scale * 0.055, 8, 8]} />
        <meshStandardMaterial color="#FF3333" emissive="#FF3333" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-scale * 0.1, scale * 1.88, scale * 0.22]}>
        <sphereGeometry args={[scale * 0.055, 8, 8]} />
        <meshStandardMaterial color="#FF3333" emissive="#FF3333" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[scale * 0.12, scale * 1.9, scale * 0.26]} scale={0.5}>
        <sphereGeometry args={[scale * 0.02, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-scale * 0.08, scale * 1.9, scale * 0.26]} scale={0.5}>
        <sphereGeometry args={[scale * 0.02, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[scale * 0.18, scale * 0.6, scale * 0.25]} castShadow>
        <capsuleGeometry args={[scale * 0.13, scale * 0.55, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.55} />
      </mesh>
      <mesh position={[-scale * 0.18, scale * 0.6, scale * 0.25]} castShadow>
        <capsuleGeometry args={[scale * 0.13, scale * 0.55, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.55} />
      </mesh>
      <mesh position={[0, scale * 0.1, 0]} castShadow>
        <cylinderGeometry args={[scale * 0.12, scale * 0.15, scale * 0.2, 8]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.3} />
      </mesh>
      {config.hasWings && (
        <group>
          <mesh position={[scale * 0.85, scale * 1.55, 0]} rotation={[0, 0, 0.6]} castShadow>
            <planeGeometry args={[scale * 0.9, scale * 0.55]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.75} metalness={0.2} />
          </mesh>
          <mesh position={[-scale * 0.85, scale * 1.55, 0]} rotation={[0, 0, -0.6]} castShadow>
            <planeGeometry args={[scale * 0.9, scale * 0.55]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.75} metalness={0.2} />
          </mesh>
        </group>
      )}
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const BeastMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.45, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.38, scale * 0.65, 8, 16]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh position={[0, scale * 0.95, 0]} castShadow>
        <boxGeometry args={[scale * 0.55, scale * 0.5, scale * 0.5]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, scale * 1.35, scale * 0.12]} castShadow>
        <coneGeometry args={[scale * 0.18, scale * 0.35, 5]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[scale * 0.18, scale * 0.25, scale * 0.15]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.12, scale * 0.45, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[-scale * 0.18, scale * 0.25, scale * 0.15]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.12, scale * 0.45, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[scale * 0.22, scale * 0.08, scale * 0.45]} rotation={[0.2, 0, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.1, scale * 0.35, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[-scale * 0.22, scale * 0.08, scale * 0.45]} rotation={[0.2, 0, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.1, scale * 0.35, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.75} />
      </mesh>
      <mesh position={[scale * 0.28, scale * 1.25, -scale * 0.12]} rotation={[0, 0, 0.35]} castShadow>
        <coneGeometry args={[scale * 0.09, scale * 0.22, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.28, scale * 1.25, -scale * 0.12]} rotation={[0, 0, -0.35]} castShadow>
        <coneGeometry args={[scale * 0.09, scale * 0.22, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
      </mesh>
      <mesh position={[scale * 0.28, scale * 0.95, scale * 0.18]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#FF3333" emissive="#FF3333" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-scale * 0.28, scale * 0.95, scale * 0.18]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#FF3333" emissive="#FF3333" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[scale * 0.3, scale * 0.97, scale * 0.22]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-scale * 0.26, scale * 0.97, scale * 0.22]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, scale * 0.5, scale * 0.35]} castShadow>
        <sphereGeometry args={[scale * 0.08, 8, 8]} />
        <meshStandardMaterial color="#2a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[scale * 0.55, scale * 1.35, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[scale * 0.04, scale * 0.15, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} />
      </mesh>
      <mesh position={[-scale * 0.55, scale * 1.35, 0]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[scale * 0.04, scale * 0.15, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} />
      </mesh>
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const InsectMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.45, 0]} castShadow>
        <sphereGeometry args={[scale * 0.4, 14, 14]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, scale * 0.45, scale * 0.38]} castShadow>
        <sphereGeometry args={[scale * 0.28, 14, 14]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, scale * 0.45, scale * 0.65]} castShadow>
        <coneGeometry args={[scale * 0.12, scale * 0.3, 8]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[scale * 0.1, scale * 0.6, scale * 0.2]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
      </mesh>
      <mesh position={[-scale * 0.1, scale * 0.6, scale * 0.2]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
      </mesh>
      <mesh position={[scale * 0.11, scale * 0.62, scale * 0.23]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-scale * 0.09, scale * 0.62, scale * 0.23]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[scale * 0.35, scale * 0.35, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.08, scale * 0.25, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.35, scale * 0.35, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.08, scale * 0.25, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[scale * 0.35, scale * 0.35, scale * 0.1]} castShadow>
        <capsuleGeometry args={[scale * 0.08, scale * 0.25, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.35, scale * 0.35, scale * 0.1]} castShadow>
        <capsuleGeometry args={[scale * 0.08, scale * 0.25, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[scale * 0.25, scale * 0.18, scale * 0.05]} castShadow>
        <capsuleGeometry args={[scale * 0.05, scale * 0.2, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.25, scale * 0.18, scale * 0.05]} castShadow>
        <capsuleGeometry args={[scale * 0.05, scale * 0.2, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[scale * 0.25, scale * 0.18, scale * 0.15]} castShadow>
        <capsuleGeometry args={[scale * 0.05, scale * 0.2, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.25, scale * 0.18, scale * 0.15]} castShadow>
        <capsuleGeometry args={[scale * 0.05, scale * 0.2, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.5} />
      </mesh>
      {config.hasWings && (
        <group>
          <mesh position={[scale * 0.55, scale * 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[scale * 0.7, scale * 0.45]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.65} metalness={0.3} />
          </mesh>
          <mesh position={[-scale * 0.55, scale * 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[scale * 0.7, scale * 0.45]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.65} metalness={0.3} />
          </mesh>
          <mesh position={[scale * 0.55, scale * 0.55, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[scale * 0.5, scale * 0.3]} />
            <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} transparent opacity={0.3} />
          </mesh>
          <mesh position={[-scale * 0.55, scale * 0.55, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[scale * 0.5, scale * 0.3]} />
            <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} transparent opacity={0.3} />
          </mesh>
        </group>
      )}
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const PlantMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.75, 0]} castShadow>
        <cylinderGeometry args={[scale * 0.22, scale * 0.32, scale * 1.5, 10]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.85} />
      </mesh>
      <mesh position={[0, scale * 0.1, 0]} castShadow>
        <cylinderGeometry args={[scale * 0.28, scale * 0.35, scale * 0.2, 10]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, scale * 1.85, 0]} castShadow>
        <sphereGeometry args={[scale * 0.55, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, scale * 2.05, 0]} castShadow>
        <sphereGeometry args={[scale * 0.35, 12, 12]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.3} emissive={config.accentColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[scale * 0.25, scale * 1.65, scale * 0.1]} castShadow>
        <coneGeometry args={[scale * 0.12, scale * 0.4, 6]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.25, scale * 1.65, scale * 0.1]} castShadow>
        <coneGeometry args={[scale * 0.12, scale * 0.4, 6]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
      </mesh>
      <mesh position={[scale * 0.4, scale * 1.5, -scale * 0.15]} castShadow>
        <coneGeometry args={[scale * 0.1, scale * 0.35, 6]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
      </mesh>
      <mesh position={[-scale * 0.4, scale * 1.5, -scale * 0.15]} castShadow>
        <coneGeometry args={[scale * 0.1, scale * 0.35, 6]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.5} />
      </mesh>
      {[0.5, -0.4, 0.3, -0.2].map((offset, i) => (
        <mesh key={i} position={[offset * scale, scale * 1.4 + i * 0.15, (i % 2) * 0.25 * scale]} rotation={[0, 0, offset * 0.5]} castShadow>
          <sphereGeometry args={[scale * 0.12, 8, 8]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} emissive={config.accentColor} emissiveIntensity={0.15} />
        </mesh>
      ))}
      <mesh position={[scale * 0.18, scale * 1.85, scale * 0.35]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-scale * 0.18, scale * 1.85, scale * 0.35]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[scale * 0.2, scale * 1.87, scale * 0.38]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-scale * 0.16, scale * 1.87, scale * 0.38]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, scale * 1.8, 0]} color={config.accentColor} intensity={0.5} distance={4} />
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const ElementalMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.95, 0]} castShadow>
        <octahedronGeometry args={[scale * 0.65, 1]} />
        <meshStandardMaterial 
          color={config.bodyColor} 
          roughness={0.2} 
          metalness={0.7} 
          emissive={config.accentColor} 
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, scale * 1.7, 0]} castShadow>
        <octahedronGeometry args={[scale * 0.35, 0]} />
        <meshStandardMaterial 
          color={config.bodyColor} 
          roughness={0.2} 
          metalness={0.7} 
          emissive={config.accentColor} 
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[scale * 0.55, scale * 0.65, 0]} rotation={[0, 0, 0.55]} castShadow>
        <coneGeometry args={[scale * 0.18, scale * 0.65, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.25} metalness={0.5} emissive={config.accentColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-scale * 0.55, scale * 0.65, 0]} rotation={[0, 0, -0.55]} castShadow>
        <coneGeometry args={[scale * 0.18, scale * 0.65, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.25} metalness={0.5} emissive={config.accentColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[scale * 0.55, scale * 1.4, 0]} rotation={[0, 0, 0.55]} castShadow>
        <coneGeometry args={[scale * 0.12, scale * 0.45, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.25} metalness={0.5} emissive={config.accentColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-scale * 0.55, scale * 1.4, 0]} rotation={[0, 0, -0.55]} castShadow>
        <coneGeometry args={[scale * 0.12, scale * 0.45, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.25} metalness={0.5} emissive={config.accentColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[scale * 0.28, scale * 1.35, scale * 0.32]}>
        <sphereGeometry args={[scale * 0.09, 10, 10]} />
        <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-scale * 0.28, scale * 1.35, scale * 0.32]}>
        <sphereGeometry args={[scale * 0.09, 10, 10]} />
        <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[scale * 0.3, scale * 1.37, scale * 0.36]} scale={0.5}>
        <sphereGeometry args={[scale * 0.025, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-scale * 0.26, scale * 1.37, scale * 0.36]} scale={0.5}>
        <sphereGeometry args={[scale * 0.025, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, scale * 0.4, 0]} castShadow>
        <cylinderGeometry args={[scale * 0.15, scale * 0.2, scale * 0.15, 8]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.3} metalness={0.6} />
      </mesh>
      <pointLight position={[0, scale * 1.3, 0]} color={config.accentColor} intensity={1.5} distance={5} />
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const DragonMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  const colors = getMobColors(config.bodyColor);
  return (
    <group>
      {/* Body - blocky dragon */}
      <mesh position={[0, scale * 0.7, 0]} castShadow>
        <boxGeometry args={[scale * 1.2, scale * 1.4, scale * 1.6]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      {/* Belly - lighter */}
      <mesh position={[0, scale * 0.5, scale * 0.5]} castShadow>
        <boxGeometry args={[scale * 0.8, scale * 1.0, scale * 0.5]} />
        <meshStandardMaterial color={colors.light} roughness={0.5} />
      </mesh>
      {/* Head */}
      <group position={[0, scale * 1.6, scale * 0.5]}>
        <mesh castShadow>
          <boxGeometry args={[scale * 0.9, scale * 0.7, scale * 0.8]} />
          <meshStandardMaterial color={colors.base} roughness={0.6} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, -scale * 0.1, scale * 0.45]} castShadow>
          <boxGeometry args={[scale * 0.5, scale * 0.35, scale * 0.4]} />
          <meshStandardMaterial color={colors.dark} roughness={0.5} />
        </mesh>
        {/* Nostrils */}
        <mesh position={[scale * 0.12, -scale * 0.05, scale * 0.65]}>
          <boxGeometry args={[scale * 0.1, scale * 0.08, scale * 0.05]} />
          <meshStandardMaterial color="#222222" roughness={0.3} />
        </mesh>
        <mesh position={[-scale * 0.12, -scale * 0.05, scale * 0.65]}>
          <boxGeometry args={[scale * 0.1, scale * 0.08, scale * 0.05]} />
          <meshStandardMaterial color="#222222" roughness={0.3} />
        </mesh>
        {/* Eyes - angry but cute */}
        <mesh position={[scale * 0.28, scale * 0.15, scale * 0.35]} castShadow>
          <boxGeometry args={[scale * 0.25, scale * 0.2, scale * 0.15]} />
          <meshStandardMaterial color="#FFFF00" roughness={0.3} />
        </mesh>
        <mesh position={[-scale * 0.28, scale * 0.15, scale * 0.35]} castShadow>
          <boxGeometry args={[scale * 0.25, scale * 0.2, scale * 0.15]} />
          <meshStandardMaterial color="#FFFF00" roughness={0.3} />
        </mesh>
        {/* Pupils */}
        <mesh position={[scale * 0.28, scale * 0.13, scale * 0.44]}>
          <boxGeometry args={[scale * 0.12, scale * 0.15, scale * 0.05]} />
          <meshStandardMaterial color="#FF0000" roughness={0.2} />
        </mesh>
        <mesh position={[-scale * 0.28, scale * 0.13, scale * 0.44]}>
          <boxGeometry args={[scale * 0.12, scale * 0.15, scale * 0.05]} />
          <meshStandardMaterial color="#FF0000" roughness={0.2} />
        </mesh>
        {/* Horns */}
        <mesh position={[scale * 0.35, scale * 0.45, 0]} rotation={[0, 0, -0.4]} castShadow>
          <boxGeometry args={[scale * 0.08, scale * 0.4, scale * 0.08]} />
          <meshStandardMaterial color={colors.dark} roughness={0.7} />
        </mesh>
        <mesh position={[-scale * 0.35, scale * 0.45, 0]} rotation={[0, 0, 0.4]} castShadow>
          <boxGeometry args={[scale * 0.08, scale * 0.4, scale * 0.08]} />
          <meshStandardMaterial color={colors.dark} roughness={0.7} />
        </mesh>
      </group>
      {/* Legs - blocky */}
      <mesh position={[scale * 0.4, scale * 0.15, scale * 0.35]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.3, scale * 0.35]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      <mesh position={[-scale * 0.4, scale * 0.15, scale * 0.35]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.3, scale * 0.35]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      <mesh position={[scale * 0.4, scale * 0.15, -scale * 0.35]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.3, scale * 0.35]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      <mesh position={[-scale * 0.4, scale * 0.15, -scale * 0.35]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.3, scale * 0.35]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, scale * 0.35, -scale * 1.1]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[scale * 0.3, scale * 0.3, scale * 1.0]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} />
      </mesh>
      {/* Tail spikes */}
      <mesh position={[0, scale * 0.5, -scale * 1.6]} castShadow>
        <boxGeometry args={[scale * 0.2, scale * 0.15, scale * 0.15]} />
        <meshStandardMaterial color={colors.accent} roughness={0.5} />
      </mesh>
      {/* Wings */}
      {config.hasWings && (
        <group>
          <mesh position={[scale * 0.8, scale * 1.2, -scale * 0.2]} rotation={[0, 0.3, 0.5]} castShadow>
            <boxGeometry args={[scale * 0.1, scale * 0.8, scale * 1.2]} />
            <meshStandardMaterial color={colors.dark} roughness={0.5} />
          </mesh>
          <mesh position={[-scale * 0.8, scale * 1.2, -scale * 0.2]} rotation={[0, -0.3, -0.5]} castShadow>
            <boxGeometry args={[scale * 0.1, scale * 0.8, scale * 1.2]} />
            <meshStandardMaterial color={colors.dark} roughness={0.5} />
          </mesh>
        </group>
      )}
      {config.hasWings && (
        <group>
          <mesh position={[scale * 0.75, scale * 1.1, -scale * 0.1]} rotation={[0, 0, 0.5]} castShadow>
            <coneGeometry args={[scale * 0.15, scale * 0.6, 4]} />
            <meshStandardMaterial color={config.accentColor} roughness={0.35} metalness={0.3} transparent opacity={0.8} />
          </mesh>
          <mesh position={[-scale * 0.75, scale * 1.1, -scale * 0.1]} rotation={[0, 0, -0.5]} castShadow>
            <coneGeometry args={[scale * 0.15, scale * 0.6, 4]} />
            <meshStandardMaterial color={config.accentColor} roughness={0.35} metalness={0.3} transparent opacity={0.8} />
          </mesh>
          <mesh position={[scale * 0.85, scale * 0.95, -scale * 0.05]} rotation={[0.2, 0, 0.4]} castShadow>
            <planeGeometry args={[scale * 0.6, scale * 0.4]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[-scale * 0.85, scale * 0.95, -scale * 0.05]} rotation={[0.2, 0, -0.4]} castShadow>
            <planeGeometry args={[scale * 0.6, scale * 0.4]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.7} metalness={0.2} />
          </mesh>
        </group>
      )}
      <pointLight position={[0, scale * 1.3, scale * 0.3]} color={config.accentColor} intensity={0.8} distance={4} />
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const UndeadMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.65, 0]} castShadow>
        <capsuleGeometry args={[scale * 0.32, scale * 0.85, 8, 16]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.65} transparent opacity={0.82} metalness={0.1} />
      </mesh>
      <mesh position={[0, scale * 0.3, 0]} castShadow>
        <boxGeometry args={[scale * 0.45, scale * 0.12, scale * 0.35]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.7} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, scale * 1.75, 0]} castShadow>
        <sphereGeometry args={[scale * 0.3, 14, 14]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.65} transparent opacity={0.82} metalness={0.1} />
      </mesh>
      <mesh position={[0, scale * 1.95, -scale * 0.08]} castShadow>
        <boxGeometry args={[scale * 0.32, scale * 0.1, scale * 0.22]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.7} transparent opacity={0.8} />
      </mesh>
      <mesh position={[scale * 0.38, scale * 1.05, 0]} rotation={[0, 0, -0.25]} castShadow>
        <capsuleGeometry args={[scale * 0.09, scale * 0.55, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.65} transparent opacity={0.82} />
      </mesh>
      <mesh position={[-scale * 0.38, scale * 1.05, 0]} rotation={[0, 0, 0.25]} castShadow>
        <capsuleGeometry args={[scale * 0.09, scale * 0.55, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.65} transparent opacity={0.82} />
      </mesh>
      <mesh position={[scale * 0.1, scale * 0.55, scale * 0.2]} castShadow>
        <capsuleGeometry args={[scale * 0.12, scale * 0.45, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.65} transparent opacity={0.82} />
      </mesh>
      <mesh position={[-scale * 0.1, scale * 0.55, scale * 0.2]} castShadow>
        <capsuleGeometry args={[scale * 0.12, scale * 0.45, 4, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.65} transparent opacity={0.82} />
      </mesh>
      <mesh position={[scale * 0.12, scale * 1.75, scale * 0.22]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-scale * 0.12, scale * 1.75, scale * 0.22]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color={config.accentColor} emissive={config.accentColor} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[scale * 0.14, scale * 1.77, scale * 0.26]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-scale * 0.1, scale * 1.77, scale * 0.26]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, scale * 1.45, scale * 0.2]} castShadow>
        <cylinderGeometry args={[scale * 0.03, scale * 0.05, scale * 0.35, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, scale * 1.6, scale * 0.25]} castShadow>
        <coneGeometry args={[scale * 0.08, scale * 0.2, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} emissive={config.accentColor} emissiveIntensity={0.3} />
      </mesh>
      {config.hasWings && (
        <group>
          <mesh position={[scale * 0.75, scale * 1.45, 0]} rotation={[0, 0, 0.45]} castShadow>
            <planeGeometry args={[scale * 0.8, scale * 0.55]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[-scale * 0.75, scale * 1.45, 0]} rotation={[0, 0, -0.45]} castShadow>
            <planeGeometry args={[scale * 0.8, scale * 0.55]} />
            <meshStandardMaterial color={config.accentColor} side={THREE.DoubleSide} transparent opacity={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[scale * 0.8, scale * 1.35, 0.05]} rotation={[0, 0, 0.35]}>
            <planeGeometry args={[scale * 0.6, scale * 0.35]} />
            <meshStandardMaterial color={config.bodyColor} side={THREE.DoubleSide} transparent opacity={0.4} />
          </mesh>
          <mesh position={[-scale * 0.8, scale * 1.35, 0.05]} rotation={[0, 0, -0.35]}>
            <planeGeometry args={[scale * 0.6, scale * 0.35]} />
            <meshStandardMaterial color={config.bodyColor} side={THREE.DoubleSide} transparent opacity={0.4} />
          </mesh>
        </group>
      )}
      <pointLight position={[0, scale * 1.5, 0]} color={config.accentColor} intensity={0.6} distance={4} />
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const AquaticMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  return (
    <group>
      <mesh position={[0, scale * 0.55, 0]} castShadow>
        <sphereGeometry args={[scale * 0.42, 18, 14]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, scale * 0.55, scale * 0.42]} castShadow>
        <coneGeometry args={[scale * 0.18, scale * 0.45, 10]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, scale * 0.55, scale * 0.75]} castShadow>
        <coneGeometry args={[scale * 0.08, scale * 0.25, 5]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[scale * 0.42, scale * 0.45, 0]} rotation={[0, 0, -0.55]} castShadow>
        <boxGeometry args={[scale * 0.45, scale * 0.06, scale * 0.25]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[-scale * 0.42, scale * 0.45, 0]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[scale * 0.45, scale * 0.06, scale * 0.25]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[scale * 0.45, scale * 0.42, -scale * 0.1]} rotation={[0, 0, -0.45]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.04, scale * 0.18]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} />
      </mesh>
      <mesh position={[-scale * 0.45, scale * 0.42, -scale * 0.1]} rotation={[0, 0, 0.45]} castShadow>
        <boxGeometry args={[scale * 0.35, scale * 0.04, scale * 0.18]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} />
      </mesh>
      <mesh position={[scale * 0.18, scale * 0.6, scale * 0.38]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
      </mesh>
      <mesh position={[-scale * 0.18, scale * 0.6, scale * 0.38]}>
        <sphereGeometry args={[scale * 0.045, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
      </mesh>
      <mesh position={[scale * 0.2, scale * 0.62, scale * 0.41]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-scale * 0.16, scale * 0.62, scale * 0.41]} scale={0.5}>
        <sphereGeometry args={[scale * 0.015, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[scale * 0.55, scale * 0.55, scale * 0.12]} rotation={[0, 0, -0.35]} castShadow>
        <coneGeometry args={[scale * 0.07, scale * 0.22, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[-scale * 0.55, scale * 0.55, scale * 0.12]} rotation={[0, 0, 0.35]} castShadow>
        <coneGeometry args={[scale * 0.07, scale * 0.22, 4]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, scale * 0.3, scale * 0.2]} castShadow>
        <boxGeometry args={[scale * 0.15, scale * 0.35, scale * 0.1]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[scale * 0.12, scale * 0.2, scale * 0.3]} castShadow>
        <capsuleGeometry args={[scale * 0.04, scale * 0.12, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.45} />
      </mesh>
      <mesh position={[-scale * 0.12, scale * 0.2, scale * 0.3]} castShadow>
        <capsuleGeometry args={[scale * 0.04, scale * 0.12, 4, 6]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.45} />
      </mesh>
      <pointLight position={[0, scale * 0.6, scale * 0.3]} color={config.accentColor} intensity={0.5} distance={3} />
      {isTarget && (
        <mesh position={[0, scale * 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.6, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const GLBZombieMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  const { scene } = useGLTF('/free_stylized_dark_fantasy_zombie_v1.glb');
  const clonedScene = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const walkPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      walkPhase.current += 0.08;
      groupRef.current.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.08;
      groupRef.current.rotation.z = Math.sin(walkPhase.current) * 0.05;
    }
    if (clonedScene.current) {
      clonedScene.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <primitive
          ref={clonedScene}
          object={scene.clone()}
          scale={[scale * 2.2, scale * 2.2, scale * 2.2]}
          position={[0, -0.4, 0]}
          castShadow
          receiveShadow
        />
      </group>
      {isTarget && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.5, scale * 1.9, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const GLBSkeletonMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  const { scene } = useGLTF('/free_stylized_dark_fantasy_skeleton_v1.glb');
  const clonedScene = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const walkPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      walkPhase.current += 0.08;
      groupRef.current.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.08;
      groupRef.current.rotation.z = Math.sin(walkPhase.current) * 0.05;
    }
    if (clonedScene.current) {
      clonedScene.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <primitive
          ref={clonedScene}
          object={scene.clone()}
          scale={[scale * 2.2, scale * 2.2, scale * 2.2]}
          position={[0, -0.4, 0]}
          castShadow
          receiveShadow
        />
      </group>
      {isTarget && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.5, scale * 1.9, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const GLBCreeperMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  const { scene } = useGLTF('/creeper.glb');
  const clonedScene = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const walkPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      walkPhase.current += 0.08;
      groupRef.current.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.05;
    }
    if (clonedScene.current) {
      clonedScene.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <primitive
          ref={clonedScene}
          object={scene.clone()}
          scale={[scale * 2.5, scale * 2.5, scale * 2.5]}
          position={[0, -0.3, 0]}
          castShadow
          receiveShadow
        />
      </group>
      {isTarget && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.5, scale * 1.9, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const GLBEndermanMob = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  const scale = config.size;
  const { scene } = useGLTF('/enderman.glb');
  const clonedScene = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const walkPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      walkPhase.current += 0.06;
      groupRef.current.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.1;
      groupRef.current.rotation.z = Math.sin(walkPhase.current) * 0.03;
    }
    if (clonedScene.current) {
      clonedScene.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <primitive
          ref={clonedScene}
          object={scene.clone()}
          scale={[scale * 2.2, scale * 2.2, scale * 2.2]}
          position={[0, -0.4, 0]}
          castShadow
          receiveShadow
        />
      </group>
      {isTarget && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.5, scale * 1.9, 32]} />
          <meshStandardMaterial color="#FF4444" emissive="#FF4444" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const MobModel = ({ config, isTarget }: { config: ReturnType<typeof MOB_CONFIGS[string]>; isTarget: boolean }) => {
  switch (config.type) {
    case 'slime': return <SlimeMob config={config} isTarget={isTarget} />;
    case 'humanoid': return <HumanoidMob config={config} isTarget={isTarget} />;
    case 'beast': return <BeastMob config={config} isTarget={isTarget} />;
    case 'insect': return <InsectMob config={config} isTarget={isTarget} />;
    case 'plant': return <PlantMob config={config} isTarget={isTarget} />;
    case 'elemental': return <ElementalMob config={config} isTarget={isTarget} />;
    case 'dragon': return <DragonMob config={config} isTarget={isTarget} />;
    case 'undead': return <UndeadMob config={config} isTarget={isTarget} />;
    case 'aquatic': return <AquaticMob config={config} isTarget={isTarget} />;
    case 'glb_zombie': return <GLBZombieMob config={config} isTarget={isTarget} />;
    case 'glb_skeleton': return <GLBSkeletonMob config={config} isTarget={isTarget} />;
    case 'glb_creeper': return <GLBCreeperMob config={config} isTarget={isTarget} />;
    case 'glb_enderman': return <GLBEndermanMob config={config} isTarget={isTarget} />;
    default: return <SlimeMob config={config} isTarget={isTarget} />;
  }
};

export const EnemyEntity = ({ enemy }: Props) => {
  const meshRef = useRef<THREE.Group>(null);
  const attackEnemy = useGameStore(s => s.attackEnemy);
  const takeDamage = useGameStore(s => s.takeDamage);
  const playerPos = useGameStore(s => s.playerPosition);
  const targetId = useGameStore(s => s.targetEnemyId);
  const setTarget = useGameStore(s => s.setTargetEnemy);
  const setAutoMoveTarget = useGameStore(s => s.setAutoMoveTarget);
  const updateKillProgress = useQuestStore(s => s.updateKillProgress);
  const [hovered, setHovered] = useState(false);
  const lastAttackTime = useRef(0);
  const floatPhase = useRef(Math.random() * Math.PI * 2);
  const wasAlive = useRef(enemy.alive);

  const config = MOB_CONFIGS[enemy.name] || { type: 'slime' as MobType, bodyColor: '#FF6347', accentColor: '#FF6347', hasWings: false, size: 0.5 };
  const isTarget = targetId === enemy.id;
  const hpPercent = enemy.hp / enemy.maxHp;

  useFrame((state) => {
    if (!meshRef.current) return;
    if (wasAlive.current && !enemy.alive) {
      updateKillProgress(enemy.name);
      wasAlive.current = false;
    }
    if (!enemy.alive) return;

    floatPhase.current += 0.02;
    meshRef.current.position.y = enemy.position[1] + Math.sin(floatPhase.current) * 0.1;

    const dx = playerPos[0] - enemy.position[0];
    const dz = playerPos[2] - enemy.position[2];
    meshRef.current.rotation.y = Math.atan2(dx, dz);

    const dist = Math.sqrt(dx * dx + dz * dz);
    const baseDmg = Math.max(3, Math.floor(enemy.maxHp * 0.08));
    if (dist < 3 && state.clock.elapsedTime - lastAttackTime.current > 2) {
      takeDamage(baseDmg + Math.floor(Math.random() * 5));
      lastAttackTime.current = state.clock.elapsedTime;
    }
  });

  if (!enemy.alive) return null;

  const handleClick = () => {
    setTarget(enemy.id);
    setAutoMoveTarget(enemy.position, enemy.id);
  };

  return (
    <group
      ref={meshRef}
      position={[enemy.position[0], enemy.position[1], enemy.position[2]]}
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <Suspense fallback={null}>
        <MobModel config={config} isTarget={isTarget} />
      </Suspense>

      {(hovered || isTarget) && (
        <Html position={[0, config.size + 0.8, 0]} center>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
            padding: '4px 10px',
            minWidth: 90,
            textAlign: 'center',
            border: '2px solid #E0E0E0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <div style={{ color: '#333', fontSize: 11, marginBottom: 2, fontFamily: 'Fredoka, sans-serif', fontWeight: 600 }}>{enemy.name}</div>
            <div style={{ background: '#E0E0E0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                background: hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336',
                width: `${hpPercent * 100}%`,
                height: '100%',
                transition: 'width 0.2s',
                borderRadius: 4,
              }} />
            </div>
            <div style={{ color: '#888', fontSize: 9, marginTop: 2 }}>{enemy.hp}/{enemy.maxHp}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

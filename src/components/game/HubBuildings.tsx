import { useRef, useMemo, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, useGLTF } from '@react-three/drei';
import { useGameStore, ZONES } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
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

  useFrame(() => {
    if (!meshRef.current) return;
    floatPhase.current += 0.015;
    meshRef.current.position.y = Math.sin(floatPhase.current) * 0.03;
    
    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });

  const handleClick = (e: any) => {
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
        
        {/* Body */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.28, 0.55, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#FFDAB9" roughness={0.6} />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.1, 1.52, 0.22]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.1, 1.52, 0.22]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        
        {/* Hat/Helmet */}
        <mesh position={[0, 1.75, 0]} castShadow>
          <coneGeometry args={[0.28, 0.4, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
        
        {/* Icon indicator */}
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
        </mesh>
        <pointLight position={[0, 2.2, 0]} color="#FFD700" intensity={1} distance={4} />
        
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
        <sphereGeometry args={[1.5, 8, 8]} />
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

export const HubBuildings = ({ onOpenShop, onOpenGuild, onOpenBank }: { onOpenShop?: (tab: 'items' | 'pets') => void; onOpenGuild?: () => void; onOpenBank?: () => void }) => {

  return (
    <group>
      {/* Decorative cherry blossom trees */}
      {[
        [-15, 0, 15], [15, 0, 15], [-15, 0, -15], [15, 0, -15],
        [-25, 0, 0], [25, 0, 0], [0, 0, 25], [0, 0, -25],
        [-8, 0, 8], [8, 0, 8], [-8, 0, -8], [8, 0, -8],
      ].map(([x, , z], i) => (
        <group key={`hub-tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 4, 8]} />
            <meshStandardMaterial color="#8B6914" roughness={0.9} />
          </mesh>
          <mesh position={[0, 4.5, 0]} castShadow>
            <sphereGeometry args={[2, 12, 12]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#FF69B4' : i % 3 === 1 ? '#FFB6C1' : '#3CB371'} />
          </mesh>
          <mesh position={[0.6, 5.2, 0.4]} castShadow>
            <sphereGeometry args={[1.2, 10, 10]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#FF91A4' : '#2E8B57'} />
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

      {/* Waffenladen - Westen */}
      <group position={[-20, 0, 20]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[4.5, 0.4, 4.5]} />
          <meshStandardMaterial color="#A0522D" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[3, 0.6, 3]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Schild */}
        <mesh position={[0, 2.5, 2.1]} castShadow>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial color="#4169E1" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.5, 2.15]}>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
        {/* Waffen-NPC */}
        <NPCWithBuilding name="Waffenhändler Erik" color="#CD853F" position={[0, 0, 3]} icon="⚔️" onClick={() => onOpenShop?.('items')} />
      </group>

      {/* Rüstungsladen - Osten */}
      <group position={[20, 0, 20]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#696969" roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[4.5, 0.4, 4.5]} />
          <meshStandardMaterial color="#808080" roughness={0.6} />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[3, 0.6, 3]} />
          <meshStandardMaterial color="#A9A9A9" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.5, 2.1]} castShadow>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial color="#4169E1" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.5, 2.15]}>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.3} />
        </mesh>
        <NPCWithBuilding name="Rüstungsmeisterin Greta" color="#808080" position={[0, 0, 3]} icon="🛡️" onClick={() => onOpenShop?.('items')} />
      </group>

      {/* Apotheke - Westen Nord */}
      <group position={[-20, 0, -20]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[2.5, 2.8, 2.4, 8]} />
          <meshStandardMaterial color="#D2B48C" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow>
          <coneGeometry args={[2.5, 1, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.8, 0]} castShadow>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#FF6347" emissive="#FF4500" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 2.8, 0]} color="#FF6347" intensity={1} distance={5} />
        <NPCWithBuilding name="Apothekerin Flora" color="#D2B48C" position={[0, 0, 3]} icon="🧪" onClick={() => onOpenShop?.('items')} />
      </group>

      {/* Bank/Lager - Osten Nord */}
      <group position={[20, 0, -20]}>
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

      {/* Hausierer (Traveling Merchant) - Südwesten */}
      <group position={[-30, 0, 5]}>
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
        <NPCWithBuilding name="Händler Hans" color="#DEB887" position={[0, 0, 1.5]} icon="🛒" />
      </group>

      {/* Taverne - Südosten */}
      <group position={[30, 0, 5]}>
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

      {/* Gildenhaus - Zentrum Nord */}
      <group position={[0, 0, 30]}>
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
      </group>

      {/* Stone path rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[6, 8, 64]} />
        <meshStandardMaterial color="#C4A777" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[35, 45, 64]} />
        <meshStandardMaterial color="#C4A777" roughness={0.8} transparent opacity={0.5} />
      </mesh>

      {/* Flower patches */}
      {(() => {
        const flowerData = useMemo(() => {
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
        }, []);

        return flowerData.map((f, i) => (
          <HubFlower key={`flower-${i}`} position={f.pos} color={f.color} />
        ));
      })()}
    </group>
  );
};

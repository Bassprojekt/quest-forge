import React from 'react';
import { useGameStore } from '@/store/gameStore';

const Bush = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[0.6, 8, 6]} />
      <meshStandardMaterial color="#228B22" roughness={0.9} />
    </mesh>
    <mesh position={[0.3, 0.5, 0.2]} castShadow>
      <sphereGeometry args={[0.25, 6, 4]} />
      <meshStandardMaterial color="#32CD32" />
    </mesh>
  </group>
);

const Flower = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.3]} />
      <meshStandardMaterial color="#228B22" />
    </mesh>
    <mesh position={[0, 0.32, 0]} castShadow>
      <sphereGeometry args={[0.15, 6, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
);

const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  const greens = ['#228B22', '#2E8B57', '#006400', '#32CD32', '#3CB371'];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0.1, 1.5, 0]} castShadow rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.15, 0.25, 3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 3.3, 0.2]} castShadow>
        <coneGeometry args={[1.2, 2, 8]} />
        <meshStandardMaterial color={greens[Math.floor((position[0] * 7) % greens.length)]} roughness={0.7} />
      </mesh>
      <mesh position={[-0.5, 4, -0.3]} castShadow scale={0.7}>
        <coneGeometry args={[1, 1.5, 8]} />
        <meshStandardMaterial color={greens[Math.floor((position[0] * 7) + 1) % greens.length]} roughness={0.7} />
      </mesh>
    </group>
  );
};

const Rock = ({ position, scale = 1, color = '#808080' }: { position: [number, number, number]; scale?: number; color?: string }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <dodecahedronGeometry args={[0.5]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  </group>
);

const ZoneGround: Record<string, { color: string; size: number; decorations?: React.ReactNode }> = {
  hub: { 
    color: '#8B7355', size: 160,
    decorations: (
      <>
        <Tree position={[-60, 0, -50]} scale={2} />
        <Tree position={[60, 0, -60]} scale={2.2} />
        <Tree position={[-50, 0, 60]} scale={1.8} />
        <Tree position={[70, 0, 50]} scale={2} />
        <Rock position={[-70, 0, -30]} scale={2} color="#8B4513" />
        <Rock position={[65, 0, -70]} scale={1.8} />
        <Rock position={[-30, 0, 70]} scale={2.2} />
        <Bush position={[50, 0, -40]} scale={1.2} />
        <Bush position={[-40, 0, 50]} scale={1} />
      </>
    )
  },
  grasslands: { 
    color: '#6DBE6D', size: 100,
    decorations: (
      <>
        <Tree position={[-20, 0, -15]} scale={1.2} />
        <Tree position={[25, 0, 20]} scale={1} />
        <Tree position={[10, 0, -30]} scale={1.3} />
        <Bush position={[-30, 0, 10]} scale={0.8} />
        <Bush position={[15, 0, -20]} scale={0.9} />
        <Rock position={[30, 0, -10]} scale={1.2} color="#606060" />
        <Rock position={[-10, 0, 35]} scale={0.8} />
      </>
    )
  },
  mushroom_forest: { 
    color: '#4A3728', size: 120,
    decorations: (
      <>
        <Tree position={[-30, 0, -20]} scale={1.5} />
        <Tree position={[20, 0, 30]} scale={1.2} />
        <Bush position={[-40, 0, 10]} scale={1} />
        <Rock position={[35, 0, -30]} scale={1.3} color="#5D4037" />
        <Bush position={[10, 0, -40]} scale={0.9} />
      </>
    )
  },
  frozen_peaks: { 
    color: '#E8F4F8', size: 140,
    decorations: (
      <>
        <Rock position={[-40, 0, -30]} scale={2} color="#B0C0D0" />
        <Rock position={[30, 0, 40]} scale={1.8} color="#90A8B0" />
        <Rock position={[50, 0, -20]} scale={2.2} color="#A0B0C0" />
        <Rock position={[-20, 0, 50]} scale={1.5} color="#C0D0E0" />
      </>
    )
  },
  lava_caverns: { 
    color: '#2D1B1B', size: 150,
    decorations: (
      <>
        <Rock position={[-50, 0, -40]} scale={2.5} color="#4A2020" />
        <Rock position={[40, 0, 50]} scale={2} color="#3A1810" />
        <Rock position={[60, 0, -30]} scale={1.8} color="#5A2820" />
      </>
    )
  },
  coral_reef: { 
    color: '#2F4F4F', size: 140,
    decorations: (
      <>
        <Rock position={[-30, 0, 20]} scale={1.5} color="#3A6060" />
        <Rock position={[40, 0, -40]} scale={1.8} color="#4A7070" />
      </>
    )
  },
  shadow_swamp: { 
    color: '#2D3436', size: 160,
    decorations: (
      <>
        <Tree position={[-50, 0, -30]} scale={2} />
        <Tree position={[50, 0, 40]} scale={1.8} />
        <Bush position={[-40, 0, 50]} scale={1.2} />
        <Rock position={[60, 0, -20]} scale={1.5} color="#1A2020" />
      </>
    )
  },
  crystal_highlands: { 
    color: '#B0C4DE', size: 180,
    decorations: (
      <>
        <Rock position={[-60, 0, -40]} scale={2.5} color="#00CED1" />
        <Rock position={[50, 0, 60]} scale={2} color="#00E5EE" />
        <Rock position={[70, 0, -50]} scale={3} color="#00BCD4" />
      </>
    )
  },
  void_nexus: { 
    color: '#0A0510', size: 200,
    decorations: (
      <>
        <Rock position={[-70, 0, -50]} scale={2} color="#1A0030" />
        <Rock position={[60, 0, 70]} scale={2.5} color="#200040" />
      </>
    )
  },
  dragon_lair: { 
    color: '#1A0A0A', size: 220,
    decorations: (
      <>
        <Rock position={[-80, 0, -60]} scale={3} color="#4A0000" />
        <Rock position={[70, 0, 80]} scale={2.5} color="#5A0000" />
        <Rock position={[90, 0, -40]} scale={2} color="#3A0000" />
      </>
    )
  },
  enchanted_forest: { 
    color: '#0D3D0D', size: 240,
    decorations: (
      <>
        <Tree position={[-80, 0, -60]} scale={2.5} />
        <Tree position={[70, 0, 80]} scale={2} />
        <Tree position={[100, 0, -50]} scale={2.2} />
        <Bush position={[-60, 0, 70]} scale={1.5} />
      </>
    )
  },
  floating_islands: { 
    color: '#1A0A2E', size: 260,
    decorations: (
      <>
        <Rock position={[-90, 0, -70]} scale={3} color="#2A0A4E" />
        <Rock position={[80, 0, 90]} scale={2.5} color="#3A1A5E" />
      </>
    )
  },
  abyss: { 
    color: '#1A1A1A', size: 280,
    decorations: (
      <>
        <Rock position={[-100, 0, -80]} scale={3.5} color="#2A2A2A" />
        <Rock position={[90, 0, 100]} scale={3} color="#3A3A3A" />
      </>
    )
  },
  celestial_plains: { 
    color: '#FFF8DC', size: 300,
    decorations: (
      <>
        <Tree position={[-100, 0, -80]} scale={3} />
        <Tree position={[100, 0, 100]} scale={2.5} />
        <Rock position={[120, 0, -60]} scale={2} color="#D4AF37" />
        <Rock position={[-80, 0, 120]} scale={2.5} color="#C4A027" />
      </>
    )
  },
  shadow_realm: { 
    color: '#0D001A', size: 320,
    decorations: (
      <>
        <Rock position={[-110, 0, -90]} scale={4} color="#1A002A" />
        <Rock position={[100, 0, 110]} scale={3.5} color="#2A004A" />
        <Rock position={[130, 0, -70]} scale={3} color="#150020" />
      </>
    )
  },
};

const Ground = ({ zone }: { zone: string }) => {
  const g = ZoneGround[zone];
  const groundSize = GROUND_SIZES[zone] || g?.size || 100;
  if (!g) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color={g.color} />
      </mesh>
      {g.decorations}
    </group>
  );
};

const WORLD_COMPONENTS: Record<string, React.FC> = {
  hub: () => <Ground zone="hub" />,
  grasslands: () => <Ground zone="grasslands" />,
  mushroom_forest: () => <Ground zone="mushroom_forest" />,
  frozen_peaks: () => <Ground zone="frozen_peaks" />,
  lava_caverns: () => <Ground zone="lava_caverns" />,
  coral_reef: () => <Ground zone="coral_reef" />,
  shadow_swamp: () => <Ground zone="shadow_swamp" />,
  crystal_highlands: () => <Ground zone="crystal_highlands" />,
  void_nexus: () => <Ground zone="void_nexus" />,
  dragon_lair: () => <Ground zone="dragon_lair" />,
  enchanted_forest: () => <Ground zone="enchanted_forest" />,
  floating_islands: () => <Ground zone="floating_islands" />,
  abyss: () => <Ground zone="abyss" />,
  celestial_plains: () => <Ground zone="celestial_plains" />,
  shadow_realm: () => <Ground zone="shadow_realm" />,
};

const ZoneBoundaries: Record<string, { size: number; wallColor: string }> = {
  hub: { size: 160, wallColor: '#5D4037' },
  grasslands: { size: 100, wallColor: '#2D5A2D' },
  mushroom_forest: { size: 120, wallColor: '#1A0F0A' },
  frozen_peaks: { size: 140, wallColor: '#8BA8B8' },
  lava_caverns: { size: 150, wallColor: '#1A0A0A' },
  coral_reef: { size: 140, wallColor: '#1A2525' },
  shadow_swamp: { size: 160, wallColor: '#151A1B' },
  crystal_highlands: { size: 180, wallColor: '#606870' },
  void_nexus: { size: 200, wallColor: '#050010' },
  dragon_lair: { size: 220, wallColor: '#0A0505' },
  enchanted_forest: { size: 240, wallColor: '#051505' },
  floating_islands: { size: 260, wallColor: '#0A0515' },
  abyss: { size: 280, wallColor: '#0A0A0A' },
  celestial_plains: { size: 300, wallColor: '#C0A060' },
  shadow_realm: { size: 320, wallColor: '#050008' },
};

// Ground größer als Wände -5 um Flackern zu vermeiden
const GROUND_SIZES: Record<string, number> = {
  hub: 170, grasslands: 110, mushroom_forest: 130, frozen_peaks: 150, lava_caverns: 160,
  coral_reef: 150, shadow_swamp: 170, crystal_highlands: 190, void_nexus: 210, dragon_lair: 230,
  enchanted_forest: 250, floating_islands: 270, abyss: 290, celestial_plains: 310, shadow_realm: 330,
};

const BoundaryWalls = ({ zone }: { zone: string }) => {
  const bounds = ZoneBoundaries[zone];
  if (!bounds) return null;
  const { size, wallColor } = bounds;
  const halfSize = size / 2;
  const wallHeight = 12;
  const wallThickness = 4;
  
  return (
    <group>
      {/* North Wall */}
      <mesh position={[0, wallHeight / 2, -halfSize - wallThickness / 2]} receiveShadow>
        <boxGeometry args={[size + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} flatShading />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, wallHeight / 2, halfSize + wallThickness / 2]} receiveShadow>
        <boxGeometry args={[size + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallColor} flatShading />
      </mesh>
      {/* East Wall */}
      <mesh position={[halfSize + wallThickness / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, size]} />
        <meshStandardMaterial color={wallColor} flatShading />
      </mesh>
      {/* West Wall */}
      <mesh position={[-halfSize - wallThickness / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, size]} />
        <meshStandardMaterial color={wallColor} flatShading />
      </mesh>
    </group>
  );
};

const ZoneWallSizes: Record<string, number> = {
  hub: 80, grasslands: 50, mushroom_forest: 60, frozen_peaks: 70, lava_caverns: 75,
  coral_reef: 70, shadow_swamp: 80, crystal_highlands: 90, void_nexus: 100,
  dragon_lair: 110, enchanted_forest: 120, floating_islands: 130, abyss: 140,
  celestial_plains: 150, shadow_realm: 160, pvp_arena: 25, raid_dungeon: 75, arena_colosseum: 50,
};

const WallColors: Record<string, string> = {
  hub: '#5D4037', grasslands: '#2D5A2D', mushroom_forest: '#1A0F0A', frozen_peaks: '#8BA8B8',
  lava_caverns: '#1A0A0A', coral_reef: '#1A2525', shadow_swamp: '#151A1B', crystal_highlands: '#606870',
  void_nexus: '#050010', dragon_lair: '#0A0505', enchanted_forest: '#051505', floating_islands: '#0A0515',
  abyss: '#0A0A0A', celestial_plains: '#C0A060', shadow_realm: '#050008',
};

export const GameWorld = () => {
  const currentZone = useGameStore(s => s.currentZone);
  const WorldComponent = WORLD_COMPONENTS[currentZone];
  const size = ZoneWallSizes[currentZone] || 50;
  const wallColor = WallColors[currentZone] || '#333333';
  
  return (
    <>
      <BoundaryWalls zone={currentZone} />
      {WorldComponent && <WorldComponent />}
    </>
  );
};
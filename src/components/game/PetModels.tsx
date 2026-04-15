import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Pet } from '@/store/gameStore';

export const getPetType = (name: string) => {
  const n = name.toLowerCase();

  if (/drache|dragon/.test(n)) return 'dragon';
  if (/wolf|wölf/.test(n)) return 'wolf';
  if (/geist|ghost/.test(n)) return 'ghost';
  if (/fee|fairy/.test(n)) return 'fairy';
  if (/ritter|knight|baldur|champion/.test(n)) return 'knight';
  if (/treant|torin/.test(n)) return 'treant';
  if (/phönix|phoenix/.test(n)) return 'phoenix';
  if (/katze|cat|ninja/.test(n)) return 'cat';
  if (/zauberer|merlin/.test(n)) return 'wizard';
  if (/priester|aria/.test(n)) return 'priestess';
  if (/waldläufer|finn/.test(n)) return 'ranger';
  if (/elementar|emil/.test(n)) return 'elemental';

  return 'default';
};

export const getPetColor = (pet: Pet) => {
  return pet.bonusType === 'heal' ? '#FFD700' :
         pet.bonusType === 'damage' ? '#FF4444' :
         pet.bonusType === 'defense' ? '#4488FF' :
         '#44FF44';
};

const Eyes = ({ position = [0, 0.75, 0.2], scale = 1 }: { position?: [number, number, number], scale?: number }) => (
  <group position={position}>
    <mesh position={[-0.08 * scale, 0, 0]}>
      <sphereGeometry args={[0.04 * scale, 8, 8]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[0.08 * scale, 0, 0]}>
      <sphereGeometry args={[0.04 * scale, 8, 8]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[-0.08 * scale, 0, 0.03]}>
      <sphereGeometry args={[0.02 * scale, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.08 * scale, 0, 0.03]}>
      <sphereGeometry args={[0.02 * scale, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
  </group>
);

const DragonModel = ({ color, evolved }: { color: string, evolved: boolean }) => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <boxGeometry args={[0.8, 0.3, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.4, 0.4]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <Eyes position={[0, 0.5, 0.45]} />
    <mesh position={[0.5, 0.2, -0.2]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[0.7, 0.05, 0.3]} />
      <meshStandardMaterial color="#999" />
    </mesh>
    <mesh position={[-0.5, 0.2, -0.2]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.7, 0.05, 0.3]} />
      <meshStandardMaterial color="#999" />
    </mesh>
    <mesh position={[0, 0.1, -0.5]}>
      <boxGeometry args={[0.15, 0.1, 0.4]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {evolved && <pointLight intensity={1} distance={3} color={color} position={[0, 0.3, 0]} />}
  </group>
);

const WolfModel = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <boxGeometry args={[0.8, 0.3, 0.4]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    <mesh position={[0, 0.35, 0.35]}>
      <boxGeometry args={[0.3, 0.25, 0.3]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    <mesh position={[0, 0.3, 0.55]}>
      <boxGeometry args={[0.15, 0.15, 0.2]} />
      <meshStandardMaterial color="#444" />
    </mesh>
    <mesh position={[-0.1, 0.5, 0.35]}>
      <coneGeometry args={[0.08, 0.2, 4]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0.1, 0.5, 0.35]}>
      <coneGeometry args={[0.08, 0.2, 4]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0, 0.15, -0.4]}>
      <boxGeometry args={[0.1, 0.1, 0.3]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <Eyes position={[0, 0.4, 0.45]} scale={0.8} />
  </group>
);

const GhostModel = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.3, 12, 12]} />
      <meshStandardMaterial color="#aaa" transparent opacity={0.6} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <coneGeometry args={[0.25, 0.4, 8]} />
      <meshStandardMaterial color="#aaa" transparent opacity={0.5} />
    </mesh>
    <mesh position={[-0.1, 0.25, 0.25]}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0.8} />
    </mesh>
    <mesh position={[0.1, 0.25, 0.25]}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0.8} />
    </mesh>
  </group>
);

const FairyModel = ({ color }: { color: string }) => (
  <group position={[0, 0.4, 0]}>
    <mesh position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial emissive={color} color={color} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <coneGeometry args={[0.12, 0.3, 6]} />
      <meshStandardMaterial color="#88FF88" transparent opacity={0.6} />
    </mesh>
    <mesh position={[-0.05, 0.22, 0.12]}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[0.05, 0.22, 0.12]}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[-0.05, 0.22, 0.14]}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.05, 0.22, 0.14]}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[0.4, 0.05, 0.2]} />
      <meshStandardMaterial color="#aaa" />
    </mesh>
    <mesh position={[-0.3, 0.3, 0]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.4, 0.05, 0.2]} />
      <meshStandardMaterial color="#aaa" />
    </mesh>
  </group>
);

const KnightModel = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.2, 0.25, 0.6, 8]} />
      <meshStandardMaterial color="#777" metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>
    <mesh position={[-0.08, 0.55, 0.15]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0.08, 0.55, 0.15]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0, 0.7, 0]}>
      <boxGeometry args={[0.25, 0.1, 0.25]} />
      <meshStandardMaterial color="#888" metalness={0.9} />
    </mesh>
  </group>
);

const TreantModel = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.3, 0.4, 0.8, 6]} />
      <meshStandardMaterial color="#228822" />
    </mesh>
    <mesh position={[0, 0.8, 0.1]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial color="#88CC44" />
    </mesh>
    <mesh position={[-0.1, 0.8, 0.15]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshStandardMaterial color="#333333" />
    </mesh>
    <mesh position={[0.1, 0.8, 0.15]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshStandardMaterial color="#333333" />
    </mesh>
    <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, 0.4]}>
      <boxGeometry args={[0.5, 0.1, 0.1]} />
      <meshStandardMaterial color="#228822" />
    </mesh>
    <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, -0.4]}>
      <boxGeometry args={[0.4, 0.08, 0.08]} />
      <meshStandardMaterial color="#228822" />
    </mesh>
  </group>
);

const PhoenixModel = ({ color, evolved }: { color: string, evolved: boolean }) => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.25, 12, 12]} />
      <meshStandardMaterial color="#FFAA00" emissive="#FF6600" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0.6, 0]}>
      <coneGeometry args={[0.15, 0.5, 8]} />
      <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[-0.08, 0.25, 0.2]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[0.08, 0.25, 0.2]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[-0.08, 0.25, 0.23]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.08, 0.25, 0.23]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    {evolved && (
      <>
        <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.5, 0.05, 0.25]} />
          <meshStandardMaterial color="#FFAA00" />
        </mesh>
        <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.5, 0.05, 0.25]} />
          <meshStandardMaterial color="#FFAA00" />
        </mesh>
      </>
    )}
  </group>
);

const CatModel = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.05, 0]}>
      <boxGeometry args={[0.5, 0.25, 0.6]} />
      <meshStandardMaterial color="#444" />
    </mesh>
    <mesh position={[0, 0.3, 0.3]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color="#444" />
    </mesh>
    <mesh position={[-0.12, 0.5, 0.3]} rotation={[0.3, 0, 0]}>
      <coneGeometry args={[0.07, 0.15, 4]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0.12, 0.5, 0.3]} rotation={[0.3, 0, 0]}>
      <coneGeometry args={[0.07, 0.15, 4]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[-0.12, 0.32, 0.35]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#88FF88" />
    </mesh>
    <mesh position={[0.12, 0.32, 0.35]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#88FF88" />
    </mesh>
    <mesh position={[-0.12, 0.32, 0.38]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.12, 0.32, 0.38]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[-0.2, 0.05, 0.35]}>
      <boxGeometry args={[0.1, 0.08, 0.15]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.2, 0.05, 0.35]}>
      <boxGeometry args={[0.1, 0.08, 0.15]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);

const WizardModel = ({ color }: { color: string }) => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
      <meshStandardMaterial color="#4444aa" />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>
    <mesh position={[-0.07, 0.5, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0.07, 0.5, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0, 0.7, 0]}>
      <coneGeometry args={[0.12, 0.25, 6]} />
      <meshStandardMaterial color="#4444aa" />
    </mesh>
    <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.35, 0.05, 0.08]} />
      <meshStandardMaterial color="#666" metalness={0.5} />
    </mesh>
  </group>
);

const PriestessModel = ({ color }: { color: string }) => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
      <meshStandardMaterial color="#aa44aa" />
    </mesh>
    <mesh position={[0, 0.48, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>
    <mesh position={[-0.06, 0.53, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[0.06, 0.53, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[-0.06, 0.53, 0.17]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.06, 0.53, 0.17]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0, 0.65, 0]}>
      <coneGeometry args={[0.1, 0.2, 6]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

const RangerModel = ({ color }: { color: string }) => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
      <meshStandardMaterial color="#228822" />
    </mesh>
    <mesh position={[0, 0.48, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>
    <mesh position={[-0.07, 0.53, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[0.07, 0.53, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    <mesh position={[-0.07, 0.53, 0.17]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.07, 0.53, 0.17]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    <mesh position={[0.25, 0.35, 0]} rotation={[0, 0, -0.3]}>
      <boxGeometry args={[0.35, 0.04, 0.04]} />
      <meshStandardMaterial color="#664422" />
    </mesh>
  </group>
);

const ElementalModel = ({ color }: { color: string }) => (
  <group position={[0, 0.4, 0]}>
    <mesh>
      <sphereGeometry args={[0.35, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0.35, 0.15, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[-0.35, 0.1, 0]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.3]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
    <mesh position={[-0.12, 0.35, 0.3]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0.12, 0.35, 0.3]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

const DefaultModel = ({ color }: { color: string }) => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[0, 0.1, 0]}>
      <sphereGeometry args={[0.3, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <Eyes position={[0, 0.15, 0.25]} />
  </group>
);

export const PetModel3D = ({ pet }: { pet: Pet }) => {
  const type = getPetType(pet.name);
  const evolved = (pet.level || 1) > (pet.maxLevel || 10) / 2;
  const color = getPetColor(pet);

  switch (type) {
    case 'dragon': return <DragonModel color={color} evolved={evolved} />;
    case 'wolf': return <WolfModel />;
    case 'ghost': return <GhostModel />;
    case 'fairy': return <FairyModel color={color} />;
    case 'knight': return <KnightModel />;
    case 'treant': return <TreantModel />;
    case 'phoenix': return <PhoenixModel color={color} evolved={evolved} />;
    case 'cat': return <CatModel />;
    case 'wizard': return <WizardModel color={color} />;
    case 'priestess': return <PriestessModel color={color} />;
    case 'ranger': return <RangerModel color={color} />;
    case 'elemental': return <ElementalModel color={color} />;
    default: return <DefaultModel color={color} />;
  }
};
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

const getDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
  const dx = pos2[0] - pos1[0];
  const dz = pos2[2] - pos1[2];
  return Math.sqrt(dx*dx + dz*dz);
};

const Body = ({ size = [0.4,0.3,0.5], color }: { size?: [number, number, number], color: string }) => (
  <mesh castShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const Head = ({ size = 0.2, color, position = [0,0.4,0] }: { size?: number, color: string, position?: [number, number, number] }) => (
  <mesh position={position} castShadow>
    <sphereGeometry args={[size, 8, 8]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const Wing = ({ side = 1 }: { side?: number }) => (
  <mesh position={[0.4 * side, 0.4, 0]} rotation={[0, 0, 0.5 * side]}>
    <boxGeometry args={[0.5, 0.05, 0.2]} />
    <meshStandardMaterial color="#aaa" />
  </mesh>
);

const Tail = ({ position = [0, 0, -0.4], color }: { position?: [number, number, number], color: string }) => (
  <mesh position={position}>
    <boxGeometry args={[0.2, 0.1, 0.4]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const Dragon = ({ color, evolved }: { color: string, evolved: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });

  return (
    <group ref={ref}>
      <Body size={[0.6, 0.3, 0.8]} color={color} />
      <Head color={color} position={[0, 0.5, -0.2]} />
      <Wing side={1} />
      <Wing side={-1} />
      <Tail color={color} />
      {evolved && <pointLight intensity={1} distance={3} color={color} />}
    </group>
  );
};

const Wolf = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 5) * 0.02;
  });

  return (
    <group ref={ref}>
      <Body size={[0.6, 0.3, 0.4]} color="#555" />
      <Head color="#555" position={[0, 0.5, -0.3]} />
      <Tail color="#444" position={[0, 0, 0.4]} />
    </group>
  );
};

const Ghost = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.1;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#aaa" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

const Fairy = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.1);
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial emissive={color} color={color} />
      </mesh>
      <Wing side={1} />
      <Wing side={-1} />
    </group>
  );
};

const Knight = () => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.2, 0.25, 0.6, 8]} />
      <meshStandardMaterial color="#777" metalness={0.8} />
    </mesh>
    <Head color="#ffccaa" />
  </group>
);

const Treant = () => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.3, 0.4, 0.8, 6]} />
      <meshStandardMaterial color="#228822" />
    </mesh>
  </group>
);

const Phoenix = ({ color, evolved }: { color: string, evolved: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.05;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#FFAA00" emissive="#FF6600" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={0.5} />
      </mesh>
      {evolved && (
        <>
          <Wing side={1} />
          <Wing side={-1} />
        </>
      )}
    </group>
  );
};

const Cat = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 4) * 0.01;
  });

  return (
    <group ref={ref}>
      <Body size={[0.4, 0.25, 0.5]} color="#444" />
      <Head color="#444" position={[0, 0.45, -0.1]} />
      <mesh position={[-0.15, 0.65, -0.1]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, 0.65, -0.1]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

const Wizard = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
      <meshStandardMaterial color="#4444aa" metalness={0.3} />
    </mesh>
    <Head color="#ffccaa" position={[0, 0.45, 0]} />
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

const Priestess = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
      <meshStandardMaterial color="#aa44aa" />
    </mesh>
    <Head color="#ffccaa" position={[0, 0.48, 0]} />
    <mesh position={[0, 0.65, 0]}>
      <coneGeometry args={[0.1, 0.2, 6]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
    </mesh>
  </group>
);

const Ranger = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
      <meshStandardMaterial color="#228822" />
    </mesh>
    <Head color="#ffccaa" position={[0, 0.48, 0]} />
    <mesh position={[0.25, 0.35, 0]} rotation={[0, 0, -0.3]}>
      <boxGeometry args={[0.35, 0.04, 0.04]} />
      <meshStandardMaterial color="#664422" />
    </mesh>
  </group>
);

const Elemental = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.3, 0.2, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.3, 0.1, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

const PetModel = ({ pet }: { pet: ReturnType<typeof useGameStore.getState>['pets'][0] }) => {
  const name = pet.name.toLowerCase();
  const evolved = (pet.level || 1) > (pet.maxLevel || 10) / 2;
  
  const petColor = pet.bonusType === 'heal' ? '#FFD700' :
                   pet.bonusType === 'damage' ? '#FF4444' :
                   pet.bonusType === 'defense' ? '#4488FF' : '#44FF44';

  if (name.includes('drache') || name.includes('dragon')) return <Dragon color={petColor} evolved={evolved} />;
  if (name.includes('wolf') || name.includes('bär')) return <Wolf color={petColor} />;
  if (name.includes('geist') || name.includes('gigi')) return <Ghost />;
  if (name.includes('fee')) return <Fairy color={petColor} />;
  if (name.includes('ritter') || name.includes('baldur') || name.includes('champion')) return <Knight />;
  if (name.includes('treant') || name.includes('torin')) return <Treant />;
  if (name.includes('phönix') || name.includes('phoenix')) return <Phoenix color={petColor} evolved={evolved} />;
  if (name.includes('katze') || name.includes('cat') || name.includes('ninja')) return <Cat />;
  if (name.includes('zauberer') || name.includes('merlin')) return <Wizard color={petColor} />;
  if (name.includes('priester') || name.includes('aria')) return <Priestess color={petColor} />;
  if (name.includes('waldläufer') || name.includes('finn')) return <Ranger color={petColor} />;
  if (name.includes('elementar') || name.includes('emil')) return <Elemental color={petColor} />;

  return <Body color={petColor} />;
};

export const PetCompanion = () => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const pets = useGameStore(s => s.pets);
  const pet = pets.find(p => p.equipped && !p.inTournament);
  const groundItems = useGameStore(s => s.groundItems);
  const pickupGroundItem = useGameStore(s => s.pickupGroundItem);
  const lastPickupTime = useRef(0);
  const collectingRef = useRef(false);
  const collectTargetRef = useRef<[number, number, number] | null>(null);

  const targetOffset = 1.5;
  const smoothSpeed = 0.1;
  const collectRange = 50;
  const pickupRange = 1.2;

  useFrame(() => {
    if (!meshRef.current || !pet) return;

    const petPos: [number, number, number] = [meshRef.current.position.x, 0, meshRef.current.position.z];
    const now = Date.now();
    const playerDist = getDistance(petPos, playerPos);

    if (!collectingRef.current) {
      const itemsInRange = groundItems.filter(item => {
        const itemDist = getDistance(petPos, item.position);
        return itemDist < collectRange;
      });

      if (itemsInRange.length > 0 && now - lastPickupTime.current > 600) {
        let closestItem = itemsInRange[0];
        let closestDist = getDistance(petPos, closestItem.position);

        for (const item of itemsInRange) {
          const d = getDistance(petPos, item.position);
          if (d < closestDist) {
            closestDist = d;
            closestItem = item;
          }
        }

        collectTargetRef.current = closestItem.position;
        collectingRef.current = true;
      }
    }

    if (collectingRef.current && collectTargetRef.current) {
      const itemStillExists = groundItems.some(item => 
        item.position[0] === collectTargetRef.current![0] && 
        item.position[2] === collectTargetRef.current![2]
      );

      if (!itemStillExists) {
        collectingRef.current = false;
        collectTargetRef.current = null;
      } else {
        const targetX = collectTargetRef.current[0];
        const targetZ = collectTargetRef.current[2];
        const toItemDist = getDistance(petPos, collectTargetRef.current);

        if (toItemDist > pickupRange) {
          meshRef.current.position.x += (targetX - meshRef.current.position.x) * smoothSpeed;
          meshRef.current.position.z += (targetZ - meshRef.current.position.z) * smoothSpeed;
        } else {
          const item = groundItems.find(item => 
            item.position[0] === collectTargetRef.current![0] && 
            item.position[2] === collectTargetRef.current![2]
          );
          if (item) {
            pickupGroundItem(item.id);
            lastPickupTime.current = now;
          }
          collectingRef.current = false;
          collectTargetRef.current = null;
        }
        return;
      }
    }

    const targetX = playerPos[0];
    const targetZ = playerPos[2] - targetOffset;

    if (playerDist > 2.5) {
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * smoothSpeed;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * smoothSpeed;
    }
    meshRef.current.position.y = 0;

    const dx = playerPos[0] - meshRef.current.position.x;
    const dz = playerPos[2] - meshRef.current.position.z;
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });

  if (!pet) return null;

  const petColor = pet.bonusType === 'heal' ? '#FFD700' :
                  pet.bonusType === 'damage' ? '#FF4444' :
                  pet.bonusType === 'defense' ? '#4488FF' : '#44FF44';

  return (
    <group ref={meshRef} position={[playerPos[0], 0, playerPos[2] - targetOffset]}>
      <PetModel pet={pet} />
      <pointLight position={[0, 0.5, 0]} color={petColor} intensity={0.5} distance={3} />
    </group>
  );
};
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

const getDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
  const dx = pos2[0] - pos1[0];
  const dz = pos2[2] - pos1[2];
  return Math.sqrt(dx*dx + dz*dz);
};

const getPetType = (name: string) => {
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

const getColor = (pet: ReturnType<typeof useGameStore.getState>['pets'][0]) => {
  return pet.bonusType === 'heal' ? '#FFD700' :
         pet.bonusType === 'damage' ? '#FF4444' :
         pet.bonusType === 'defense' ? '#4488FF' :
         '#44FF44';
};

const Dragon = ({ color, evolved }: { color: string, evolved: boolean }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.3, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, 0.7, -0.4]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.7, 0.05, 0.3]} />
        <meshStandardMaterial color="#999" />
      </mesh>
      <mesh position={[-0.5, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.7, 0.05, 0.3]} />
        <meshStandardMaterial color="#999" />
      </mesh>

      {evolved && <pointLight intensity={1} distance={3} color={color} />}
    </group>
  );
};

const Wolf = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 5) * 0.03;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      <mesh position={[0, 0.55, -0.35]}>
        <boxGeometry args={[0.3, 0.25, 0.3]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      <mesh position={[0, 0.5, -0.55]}>
        <boxGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[-0.1, 0.7, -0.35]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.1, 0.7, -0.35]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <mesh position={[0, 0.35, 0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
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
};

const Knight = () => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.2, 0.25, 0.6, 8]} />
      <meshStandardMaterial color="#777" metalness={0.8} />
    </mesh>

    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>
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
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.08;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#FFAA00" emissive="#FF6600" emissiveIntensity={0.3} />
      </mesh>

      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={0.5} />
      </mesh>

      {evolved && (
        <>
          <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.5, 0.05, 0.25]} />
            <meshStandardMaterial color="#FFAA00" />
          </mesh>
          <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.5, 0.05, 0.25]} />
            <meshStandardMaterial color="#FFAA00" />
          </mesh>
        </>
      )}
    </group>
  );
};

const Cat = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 4) * 0.015;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.25, 0.6]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[0, 0.5, -0.2]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[-0.12, 0.7, -0.2]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.07, 0.15, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.12, 0.7, -0.2]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.07, 0.15, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <mesh position={[-0.15, 0.45, 0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.15, 0.45, 0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
};

const Wizard = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
      <meshStandardMaterial color="#4444aa" />
    </mesh>

    <mesh position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
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

const Priestess = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
      <meshStandardMaterial color="#aa44aa" />
    </mesh>

    <mesh position={[0, 0.48, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>

    <mesh position={[0, 0.65, 0]}>
      <coneGeometry args={[0.1, 0.2, 6]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

const Ranger = ({ color }: { color: string }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
      <meshStandardMaterial color="#228822" />
    </mesh>

    <mesh position={[0, 0.48, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>

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
      ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.08);
    }
  });

  return (
    <group ref={ref}>
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
    </group>
  );
};

const PetModel = ({ pet }: { pet: ReturnType<typeof useGameStore.getState>['pets'][0] }) => {
  const type = getPetType(pet.name);
  const evolved = (pet.level || 1) > (pet.maxLevel || 10) / 2;
  const color = getColor(pet);

  if (type === 'dragon') return <Dragon color={color} evolved={evolved} />;
  if (type === 'wolf') return <Wolf />;
  if (type === 'ghost') return <Ghost />;
  if (type === 'fairy') return <Fairy color={color} />;
  if (type === 'knight') return <Knight />;
  if (type === 'treant') return <Treant />;
  if (type === 'phoenix') return <Phoenix color={color} evolved={evolved} />;
  if (type === 'cat') return <Cat />;
  if (type === 'wizard') return <Wizard color={color} />;
  if (type === 'priestess') return <Priestess color={color} />;
  if (type === 'ranger') return <Ranger color={color} />;
  if (type === 'elemental') return <Elemental color={color} />;

  return (
    <mesh>
      <sphereGeometry args={[0.3, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
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

  const color = getColor(pet);

  return (
    <group ref={meshRef} position={[playerPos[0], 0, playerPos[2] - targetOffset]}>
      <PetModel pet={pet} />
      <pointLight intensity={0.5} distance={3} color={color} />
    </group>
  );
};
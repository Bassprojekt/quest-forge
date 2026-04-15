import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

const getDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
  const dx = pos2[0] - pos1[0];
  const dz = pos2[2] - pos1[2];
  return Math.sqrt(dx*dx + dz*dz);
};

const PetModel = ({ pet }: { pet: ReturnType<typeof useGameStore.getState>['pets'][0] }) => {
  const rarity = pet.rarity;
  const level = pet.level || 1;
  const petName = pet.name.toLowerCase();
  
  const isWolf = petName.includes('wolf') || petName.includes('bär');
  const isCat = petName.includes('katze') || petName.includes('cat');
  const isNinja = petName.includes('ninja');
  const isDragon = petName.includes('drache') || petName.includes('dragon');
  const isPhoenix = petName.includes('phönix') || petName.includes('phoenix');
  const isKnight = petName.includes('ritter') || petName.includes('baldur');
  const isPriestess = petName.includes('priester') || petName.includes('aria');
  const isRanger = petName.includes('waldläufer') || petName.includes('finn');
  const isWizard = petName.includes('zauberer') || petName.includes('merlin');
  const isFairy = petName.includes('fee');
  const isGhost = petName.includes('geist') || petName.includes('gigi');
  const isTreant = petName.includes('treant') || petName.includes('torin');
  const isElemental = petName.includes('elementar') || petName.includes('emil');
  
  const isEvolved = level > (pet.maxLevel || 10) / 2 || rarity === 'legendary' || rarity === 'epic';
  
  const petColor = pet.bonusType === 'heal' ? '#FFD700' :
                   pet.bonusType === 'damage' ? '#FF4444' :
                   pet.bonusType === 'defense' ? '#4488FF' : '#44FF44';
  
  if (isDragon) {
    return (
      <group>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.7]} />
          <meshStandardMaterial color={petColor} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.0, -0.2]} castShadow>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshStandardMaterial color="#FF6600" />
        </mesh>
        <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.2]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.2]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        {isEvolved && (
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.8, 0.2, 1.0]} />
            <meshStandardMaterial color={petColor} opacity={0.3} transparent />
          </mesh>
        )}
      </group>
    );
  }
  
  if (isPhoenix) {
    return (
      <group>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#FFAA00" emissive="#FF6600" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={0.5} />
        </mesh>
        {isEvolved && (
          <>
            <mesh position={[-0.4, 0.6, 0]} rotation={[0, 0, 0.5]} castShadow>
              <boxGeometry args={[0.5, 0.05, 0.3]} />
              <meshStandardMaterial color="#FFAA00" />
            </mesh>
            <mesh position={[0.4, 0.6, 0]} rotation={[0, 0, -0.5]} castShadow>
              <boxGeometry args={[0.5, 0.05, 0.3]} />
              <meshStandardMaterial color="#FFAA00" />
            </mesh>
          </>
        )}
      </group>
    );
  }
  
  if (isKnight || isRanger) {
    return (
      <group>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.6, 8]} />
          <meshStandardMaterial color={rarity === 'legendary' ? '#888888' : '#666666'} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#FFCCAA" />
        </mesh>
        <mesh position={[-0.25, 0.7, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.4, 0.08, 0.1]} />
          <meshStandardMaterial color="#888888" metalness={0.7} />
        </mesh>
        <mesh position={[0.25, 0.7, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.4, 0.08, 0.1]} />
          <meshStandardMaterial color="#888888" metalness={0.7} />
        </mesh>
        {isEvolved && (
          <mesh position={[0, 1.3, 0]} castShadow>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshStandardMaterial color={rarity === 'legendary' ? '#FFD700' : '#CCCCCC'} metalness={0.9} />
          </mesh>
        )}
      </group>
    );
  }
  
  if (isCat || isNinja) {
    return (
      <group>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.25, 0.5]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        <mesh position={[-0.15, 0.75, -0.1]} rotation={[0.3, 0, 0]} castShadow>
          <coneGeometry args={[0.08, 0.15, 4]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.15, 0.75, -0.1]} rotation={[0.3, 0, 0]} castShadow>
          <coneGeometry args={[0.08, 0.15, 4]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {isEvolved && (
          <>
            <mesh position={[-0.3, 0.2, 0.2]} castShadow>
              <boxGeometry args={[0.15, 0.1, 0.2]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            <mesh position={[0.3, 0.2, 0.2]} castShadow>
              <boxGeometry args={[0.15, 0.1, 0.2]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          </>
        )}
      </group>
    );
  }
  
  if (isWolf) {
    return (
      <group>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.3, 0.6]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[0, 0.65, -0.1]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[-0.12, 0.85, -0.15]} rotation={[0.2, 0, 0]} castShadow>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        <mesh position={[0.12, 0.85, -0.15]} rotation={[0.2, 0, 0]} castShadow>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        {isEvolved && (
          <mesh position={[0, 0.1, 0.35]} castShadow>
            <boxGeometry args={[0.3, 0.08, 0.15]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        )}
      </group>
    );
  }
  
  if (isGhost) {
    return (
      <group>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color="#AAAAAA" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <coneGeometry args={[0.25, 0.4, 8]} />
          <meshStandardMaterial color="#AAAAAA" transparent opacity={0.5} />
        </mesh>
        {isEvolved && (
          <>
            <mesh position={[-0.2, 0.6, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.2, 0.6, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0.5} />
            </mesh>
          </>
        )}
      </group>
    );
  }
  
  if (isFairy) {
    return (
      <group>
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={petColor} emissive={petColor} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <coneGeometry args={[0.12, 0.3, 6]} />
          <meshStandardMaterial color="#88FF88" transparent opacity={0.6} />
        </mesh>
        {isEvolved && (
          <>
            <mesh position={[-0.25, 0.5, 0]} rotation={[0, 0, 0.5]} castShadow>
              <boxGeometry args={[0.3, 0.02, 0.15]} />
              <meshStandardMaterial color={petColor} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0.25, 0.5, 0]} rotation={[0, 0, -0.5]} castShadow>
              <boxGeometry args={[0.3, 0.02, 0.15]} />
              <meshStandardMaterial color={petColor} transparent opacity={0.8} />
            </mesh>
          </>
        )}
      </group>
    );
  }
  
  if (isTreant || isElemental) {
    return (
      <group>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 0.8, 6]} />
          <meshStandardMaterial color={rarity === 'legendary' ? '#44AA44' : '#228822'} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color={rarity === 'legendary' ? '#FFD700' : '#88CC44'} />
        </mesh>
        {isEvolved && (
          <>
            <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.4]} castShadow>
              <boxGeometry args={[0.4, 0.1, 0.1]} />
              <meshStandardMaterial color="#228822" />
            </mesh>
            <mesh position={[0.3, 0.7, 0]} rotation={[0, 0, -0.4]} castShadow>
              <boxGeometry args={[0.3, 0.08, 0.08]} />
              <meshStandardMaterial color="#228822" />
            </mesh>
          </>
        )}
      </group>
    );
  }
  
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={petColor} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color={petColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.8, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {isEvolved && (
        <mesh position={[0, 0.1, 0.2]} castShadow>
          <boxGeometry args={[0.25, 0.05, 0.15]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
      )}
    </group>
  );
};

export const PetCompanion = () => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const pets = useGameStore(s => s.pets);
  const pet = pets.find(p => p.equipped && !p.inTournament);
  const equippedPet = pet;
  
  const targetOffset = 1.5;
  const smoothSpeed = 0.1;
  const collectRange = 50;
  const pickupRange = 1.2;
  const groundItems = useGameStore(s => s.groundItems);
  const pickupGroundItem = useGameStore(s => s.pickupGroundItem);
  const lastPickupTime = useRef(0);
  const collectingRef = useRef(false);
  const collectTargetRef = useRef<[number, number, number] | null>(null);
  
  useFrame((_, delta) => {
    if (!meshRef.current || !equippedPet) return;
    
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
    
    let targetX = playerPos[0];
    let targetZ = playerPos[2] - targetOffset;
    
    if (playerDist > 2.5) {
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * smoothSpeed;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * smoothSpeed;
    }
    meshRef.current.position.y = 0;
    
    const dx = playerPos[0] - meshRef.current.position.x;
    const dz = playerPos[2] - meshRef.current.position.z;
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });
  
  if (!equippedPet) return null;
  
  return (
    <group ref={meshRef} position={[playerPos[0], 0, playerPos[2] - targetOffset]}>
      <PetModel pet={equippedPet} />
      <pointLight position={[0, 0.5, 0]} color={equippedPet.bonusType === 'heal' ? '#FFD700' : equippedPet.bonusType === 'damage' ? '#FF4444' : equippedPet.bonusType === 'defense' ? '#4488FF' : '#44FF44'} intensity={0.5} distance={3} />
    </group>
  );
};
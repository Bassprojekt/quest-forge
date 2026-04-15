import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { Pet } from '@/store/gameStore';

const CutePetModel = ({ pet, isHealer, isGathering }: { pet: Pet; isHealer?: boolean; isGathering?: boolean; rotation?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bounce = useRef(0);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    bounce.current += delta * (isGathering ? 8 : 4);
    groupRef.current.position.y = 0.25 + Math.abs(Math.sin(bounce.current)) * (isGathering ? 0.2 : 0.15);
    // Pet schaut immer zum Spieler
  });
  
  const rarityColors: Record<string, string> = {
    common: '#FFD700',
    rare: '#4169E1',
    epic: '#9C27B0',
    legendary: '#FF5722',
  };
  
  const color = rarityColors[pet.rarity] || '#FFD700';
  
  return (
    <group ref={groupRef}>
      {/* Körper */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      
      {/* Augen */}
      <mesh position={[0.08, 0.28, 0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.08, 0.28, 0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Pupillen */}
      <mesh position={[0.08, 0.28, 0.2]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.08, 0.28, 0.2]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Mund */}
      <mesh position={[0, 0.18, 0.18]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
      
      {/* Ohren */}
      <mesh position={[0.15, 0.38, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.15, 0.38, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Glow */}
      <pointLight position={[0, 0.2, 0]} color={color} intensity={isGathering ? 1 : 0.5} distance={2.5} />
      
      {/* Heiligenschein */}
      {isHealer && (
        <pointLight position={[0, 0.5, 0]} color="#FF69B4" intensity={1} distance={2} />
      )}
    </group>
  );
};

const IndividualPet = ({ pet, index }: { pet: Pet; index: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  const petPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const playerPosition = useGameStore(s => s.playerPosition);
  const groundItems = useGameStore(s => s.groundItems);
  const pickupGroundItem = useGameStore(s => s.pickupGroundItem);
  const setPlayerHp = useGameStore(s => s.setPlayerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const playerHp = useGameStore(s => s.playerHp);
  const addDamagePopup = useGameStore(s => s.addDamagePopup);
  
  const [targetItem, setTargetItem] = useState<{id: string; position: [number, number, number]} | null>(null);
  const [isGathering, setIsGathering] = useState(false);
  const [petRotation, setPetRotation] = useState(0);
  const lastHeal = useRef(0);
  const lastPlayerPos = useRef<[number, number, number]>([0, 0, 0]);
  
  const pickupRange = 50;
  const gatherSpeed = 20;
  const returnSpeed = 18;
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const px = playerPosition[0];
    const pz = playerPosition[2];
    const petX = petPosRef.current[0];
    const petZ = petPosRef.current[2];
    
    // Wenn Spieler sich bewegt hat, aktualisiere die Basis-Position
    if (px !== lastPlayerPos.current[0] || pz !== lastPlayerPos.current[2]) {
      lastPlayerPos.current = [px, 0, pz];
    }
    
    let targetX = px;
    let targetZ = pz;
    
    // Item finden in der Nähe wenn nicht schon unterwegs
    if (!targetItem) {
      const nearbyItem = groundItems.find(item => {
        const dx = item.position[0] - px;
        const dz = item.position[2] - pz;
        return Math.sqrt(dx * dx + dz * dz) < pickupRange;
      });
      
      if (nearbyItem) {
        setTargetItem({ id: nearbyItem.id, position: nearbyItem.position });
        setIsGathering(true);
      }
    }
    
    // Wenn Target Item existiert, hingehen
    if (targetItem) {
      const item = groundItems.find(i => i.id === targetItem.id);
      if (!item) {
        setTargetItem(null);
        setIsGathering(false);
      } else {
        targetX = targetItem.position[0];
        targetZ = targetItem.position[2];
        
        const dx = targetX - petX;
        const dz = targetZ - petZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 1.5) {
          pickupGroundItem(targetItem.id);
          setTargetItem(null);
          setIsGathering(false);
        }
      }
    } else {
      // Zum Spieler zurückkehren
      const backDx = px - petX;
      const backDz = pz - petZ;
      const backDist = Math.sqrt(backDx * backDx + backDz * backDz);
      
      if (backDist > 4) {
        targetX = px;
        targetZ = pz;
      } else {
        targetX = petX;
        targetZ = petZ;
      }
    }
    
    // Bewegen
    const dx = targetX - petX;
    const dz = targetZ - petZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > 0.3) {
      const speed = isGathering ? gatherSpeed : returnSpeed;
      const newX = petX + (dx / dist) * speed * delta;
      const newZ = petZ + (dz / dist) * speed * delta;
      
      petPosRef.current = [newX, 0, newZ];
      meshRef.current.position.x = newX;
      meshRef.current.position.z = newZ;
    }
    
    // Healer: Alle 10 Sekunden heilen
    if (pet.bonusType === 'heal') {
      const now = Date.now() / 1000;
      if (now - lastHeal.current > 10) {
        const healAmount = pet.bonusValue || 20;
        const newHp = Math.min(playerMaxHp, playerHp + healAmount);
        setPlayerHp(newHp);
        
        addDamagePopup({
          id: `heal-${now}`,
          position: [petX, 1, petZ],
          amount: healAmount,
          type: 'heal',
        });
        
        lastHeal.current = now;
      }
    }
    
    meshRef.current.position.y = 0;
    
    // Pet schaut zum Spieler
    const toPlayerX = px - petX;
    const toPlayerZ = pz - petZ;
    const angle = Math.atan2(toPlayerX, toPlayerZ);
    setPetRotation(angle);
  });
  
  return (
    <group ref={meshRef} rotation={[0, petRotation, 0]}>
      <CutePetModel pet={pet} isHealer={pet.bonusType === 'heal'} isGathering={isGathering} />
    </group>
  );
};

export const BuffPet = () => {
  const pets = useGameStore(s => s.pets);
  const equippedPets = pets.filter(p => p.equipped && !p.inTournament);
  
  if (equippedPets.length === 0) return null;
  
  return (
    <>
      {equippedPets.map((pet, idx) => (
        <IndividualPet key={pet.id} pet={pet} index={idx} />
      ))}
    </>
  );
};
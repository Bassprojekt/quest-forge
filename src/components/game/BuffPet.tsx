import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { Pet, getPetColor } from '@/store/gameStore';
import { PetModel3D, getPetType, getPetColor as getModelColor } from './PetModels';

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
    
    if (px !== lastPlayerPos.current[0] || pz !== lastPlayerPos.current[2]) {
      lastPlayerPos.current = [px, 0, pz];
    }
    
    let targetX = px;
    let targetZ = pz;
    
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
    
    const toPlayerX = px - petX;
    const toPlayerZ = pz - petZ;
    const angle = Math.atan2(toPlayerX, toPlayerZ);
    setPetRotation(angle);
  });

  const evolved = (pet.level || 1) > (pet.maxLevel || 10) / 2;
  const color = getModelColor(pet);

  return (
    <group ref={meshRef} rotation={[0, petRotation, 0]}>
      <PetModel3D pet={pet} />
      <pointLight intensity={isGathering ? 1 : 0.5} distance={2.5} color={color} />
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
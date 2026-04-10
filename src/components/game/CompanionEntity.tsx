import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { useCompanionStore, Companion } from '@/store/companionStore';

interface Props {
  companion: Companion;
  index: number;
}

export const CompanionEntity = ({ companion, index }: Props) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore(s => s.playerPosition);
  const playerHp = useGameStore(s => s.playerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const enemies = useGameStore(s => s.enemies);
  const currentZone = useGameStore(s => s.currentZone);
  const attackEnemy = useGameStore(s => s.attackEnemy);
  const lastAttack = useRef(0);
  const lastHeal = useRef(0);
  const walkCycle = useRef(Math.random() * Math.PI * 2);

  // Follow offset based on index
  const angleOffset = ((index + 1) * Math.PI * 0.6) - Math.PI * 0.3;

  useFrame((state, delta) => {
    if (!meshRef.current || companion.hp <= 0) return;
    const now = state.clock.elapsedTime;

    // Follow player with offset
    const followDist = 2.5;
    const targetX = playerPos[0] + Math.sin(angleOffset) * followDist;
    const targetZ = playerPos[2] + Math.cos(angleOffset) * followDist;

    const dx = targetX - meshRef.current.position.x;
    const dz = targetZ - meshRef.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.5) {
      walkCycle.current += delta * 8;
      const speed = Math.min(dist * 3, 10);
      meshRef.current.position.x += (dx / dist) * speed * delta;
      meshRef.current.position.z += (dz / dist) * speed * delta;
    }

    // Healer: Heal player every 5 seconds
    if (companion.type === 'healer') {
      const hpPercent = playerHp / playerMaxHp;
      if (now - lastHeal.current > 5) {
        const healAmount = Math.floor(companion.healPower || 20);
        const state = useGameStore.getState();
        const newHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
        useGameStore.setState({ playerHp: newHp });
        
        const popups = useGameStore.getState().damagePopups;
        useGameStore.setState({
          damagePopups: [...popups, {
            id: `heal-${Date.now()}`,
            position: playerPos,
            amount: healAmount,
            type: 'heal' as const,
            timestamp: Date.now(),
          }]
        });
        
        lastHeal.current = now;
      }
    }

    // Face movement direction or nearest enemy
    const nearestEnemy = currentZone !== 'hub'
      ? enemies.filter(e => e.alive && e.zone === currentZone).sort((a, b) => {
          const da = Math.hypot(a.position[0] - meshRef.current!.position.x, a.position[2] - meshRef.current!.position.z);
          const db = Math.hypot(b.position[0] - meshRef.current!.position.x, b.position[2] - meshRef.current!.position.z);
          return da - db;
        })[0]
      : null;

    if (nearestEnemy) {
      const ex = nearestEnemy.position[0] - meshRef.current.position.x;
      const ez = nearestEnemy.position[2] - meshRef.current.position.z;
      const eDist = Math.sqrt(ex * ex + ez * ez);
      meshRef.current.rotation.y = Math.atan2(ex, ez);

      // Auto-attack nearby enemies
      if (eDist < 4 && now - lastAttack.current > companion.attackSpeed) {
        attackEnemy(nearestEnemy.id);
        lastAttack.current = now;
      }
    } else if (dist > 0.5) {
      meshRef.current.rotation.y = Math.atan2(dx, dz);
    }

    useCompanionStore.getState().updateCompanionPosition(companion.id, [
      meshRef.current.position.x, 0, meshRef.current.position.z,
    ]);
  });

  if (companion.hp <= 0) return null;

  const legSwing = Math.sin(walkCycle.current) * 0.3;
  const bodyBob = Math.abs(Math.sin(walkCycle.current)) * 0.03;
  const hpPercent = companion.hp / companion.maxHp;

  const typeColors = {
    tank: { body: '#4169E1', accent: '#FFD700' },
    healer: { body: '#FF69B4', accent: '#FFFFFF' },
    dps: { body: '#4CAF50', accent: '#FF5722' },
  };
  const colors = typeColors[companion.type];

  return (
    <group ref={meshRef} position={[playerPos[0] + Math.sin(angleOffset) * 2.5, 0, playerPos[2] + Math.cos(angleOffset) * 2.5]}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 12]} />
        <meshStandardMaterial color="#000" transparent opacity={0.15} />
      </mesh>

      <group position={[0, bodyBob, 0]}>
        {/* Boots */}
        <group position={[0.1, 0.12, 0]} rotation={[legSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.14, 0.16, 0.18]} /><meshStandardMaterial color="#5D4037" flatShading /></mesh>
        </group>
        <group position={[-0.1, 0.12, 0]} rotation={[-legSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.14, 0.16, 0.18]} /><meshStandardMaterial color="#5D4037" flatShading /></mesh>
        </group>

        {/* Body */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.22]} />
          <meshStandardMaterial color={colors.body} flatShading />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.32, 0.3, 0.3]} />
          <meshStandardMaterial color="#FFD5AA" flatShading />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.08, 0.82, 0.16]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.08, 0.82, 0.16]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Hat/Helmet */}
        <mesh position={[0, 0.98, 0]} castShadow>
          <boxGeometry args={[0.36, 0.08, 0.34]} />
          <meshStandardMaterial color={colors.accent} flatShading metalness={0.5} />
        </mesh>

        {/* Arms */}
        <group position={[0.24, 0.42, 0]} rotation={[-legSwing * 0.5, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.1, 0.28, 0.1]} /><meshStandardMaterial color={colors.body} flatShading /></mesh>
        </group>
        <group position={[-0.24, 0.42, 0]} rotation={[legSwing * 0.5, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.1, 0.28, 0.1]} /><meshStandardMaterial color={colors.body} flatShading /></mesh>
        </group>

        {/* Type indicator */}
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial
            color={companion.type === 'tank' ? '#4169E1' : companion.type === 'healer' ? '#FF69B4' : '#4CAF50'}
            emissive={companion.type === 'tank' ? '#4169E1' : companion.type === 'healer' ? '#FF69B4' : '#4CAF50'}
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>

      {/* HP bar */}
      <Html position={[0, 1.3, 0]} center>
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 9, color: '#FFF', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontFamily: 'Fredoka, sans-serif' }}>
            {companion.name}
          </div>
          <div style={{ background: '#333', borderRadius: 3, height: 5, width: 60, margin: '0 auto', overflow: 'hidden' }}>
            <div style={{
              background: hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#F44336',
              width: `${hpPercent * 100}%`, height: '100%', borderRadius: 3,
            }} />
          </div>
        </div>
      </Html>
    </group>
  );
};

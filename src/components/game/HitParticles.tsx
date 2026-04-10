import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const HitParticles = () => {
  const hitPos = useGameStore(s => s.hitEffectPos);
  if (!hitPos) return null;
  return <HitBurst position={hitPos} />;
};

const HitBurst = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Points>(null);
  const time = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const count = 12;
    const pos = new Float32Array(count * 3);
    const vel: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4,
      ));
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    time.current += delta;
    const geo = ref.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < velocities.length; i++) {
      posAttr.array[i * 3] += velocities[i].x * delta;
      posAttr.array[i * 3 + 1] += velocities[i].y * delta;
      posAttr.array[i * 3 + 2] += velocities[i].z * delta;
      velocities[i].y -= 8 * delta; // gravity
    }
    posAttr.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - time.current * 4);
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.15} transparent opacity={1} />
    </points>
  );
};

export const LevelUpEffect = () => {
  const active = useGameStore(s => s.levelUpEffect);
  const pos = useGameStore(s => s.playerPosition);
  if (!active) return null;
  return <LevelUpRing position={pos} />;
};

const LevelUpRing = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    time.current += delta;
    const scale = 1 + time.current * 3;
    ref.current.scale.set(scale, scale, scale);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = Math.max(0, 1 - time.current);
    ref.current.rotation.y += delta * 4;
  });

  return (
    <mesh ref={ref} position={[position[0], 0.1, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.2, 32]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={3}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

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

  const { positions, velocities, colors } = useMemo(() => {
    const count = 20;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel: THREE.Vector3[] = [];
    const particleColors = ['#FF0000', '#FF4500', '#FFD700', '#FFA500'];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      const c = particleColors[Math.floor(Math.random() * particleColors.length)];
      col[i * 3] = parseInt(c.slice(1, 3), 16) / 255;
      col[i * 3 + 1] = parseInt(c.slice(3, 5), 16) / 255;
      col[i * 3 + 2] = parseInt(c.slice(5, 7), 16) / 255;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 6,
      ));
    }
    return { positions: pos, velocities: vel, colors: col };
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
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.2} transparent opacity={1} vertexColors />
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

export const DeathParticles = () => {
  const deathPos = useGameStore(s => s.deathEffectPos);
  if (!deathPos) return null;
  return <DeathBurst position={deathPos} />;
};

const DeathBurst = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Points>(null);
  const time = useRef(0);

  const { positions, velocities, colors } = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel: THREE.Vector3[] = [];
    const particleColors = ['#8B0000', '#FF4500', '#FFD700', '#FFA500', '#4A0000'];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = Math.random() * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      const c = particleColors[Math.floor(Math.random() * particleColors.length)];
      col[i * 3] = parseInt(c.slice(1, 3), 16) / 255;
      col[i * 3 + 1] = parseInt(c.slice(3, 5), 16) / 255;
      col[i * 3 + 2] = parseInt(c.slice(5, 7), 16) / 255;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8,
      ));
    }
    return { positions: pos, velocities: vel, colors: col };
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
      velocities[i].y -= 12 * delta;
    }
    posAttr.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - time.current * 1.5);
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
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#FF4500" size={0.3} transparent opacity={1} vertexColors />
    </points>
  );
};

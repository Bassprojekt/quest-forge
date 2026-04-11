import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  position: [number, number, number];
  color: string;
  count: number;
  life: number;
  size: number;
  speed: number;
}

export const EffectParticles = ({ position, color, count = 20, life = 1, size = 0.2, speed = 1 }: ParticlesProps) => {
  const ref = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: number[] = [];
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];
      
      velocities.push(
        (Math.random() - 0.5) * speed,
        Math.random() * speed,
        (Math.random() - 0.5) * speed
      );
    }
    
    return { positions, velocities };
  }, [count, position, speed]);

  useFrame(() => {
    if (!ref.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / life;
    
    if (progress >= 1) {
      ref.current.visible = false;
      return;
    }
    
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3] * 0.02;
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * 0.02;
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * 0.02;
      
      particles.velocities[i * 3 + 1] -= 0.01;
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
    
    const material = ref.current.material as THREE.PointsMaterial;
    material.opacity = 1 - progress;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

interface TrailProps {
  position: [number, number, number];
  color: string;
  lifetime?: number;
}

export const HitTrail = ({ position, color, lifetime = 0.5 }: TrailProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (!ref.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const scale = 1 + elapsed * 2;
    ref.current.scale.set(scale, scale, scale);
    
    const material = ref.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.max(0, 1 - elapsed / lifetime);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
};

interface GlowRingProps {
  position: [number, number, number];
  color: string;
  size: number;
}

export const GlowRing = ({ position, color, size = 2 }: GlowRingProps) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime;
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.1);
  });

  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * 0.8, size, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};
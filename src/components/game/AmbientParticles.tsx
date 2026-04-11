import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AmbientParticlesProps {
  count?: number;
  color?: string;
  area?: number;
  height?: number;
}

export const AmbientParticles = ({ count = 50, color = '#FFFFFF', area = 40, height = 15 }: AmbientParticlesProps) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.01 + 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      
      sizes[i] = Math.random() * 0.08 + 0.02;
    }
    
    return { positions, velocities, sizes };
  }, [count, area, height]);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
      
      if (positions[i * 3 + 1] > height) {
        positions[i * 3 + 1] = 0;
        positions[i * 3] = (Math.random() - 0.5) * area;
        positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      }
      
      if (Math.abs(positions[i * 3]) > area / 2) positions[i * 3] *= -0.9;
      if (Math.abs(positions[i * 3 + 2]) > area / 2) positions[i * 3 + 2] *= -0.9;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Dust particles for forests/areas
export const DustParticles = ({ count = 30 }: { count?: number }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    
    return positions;
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += Math.sin(time * 0.5 + i) * 0.002;
      positions[i * 3 + 1] += Math.cos(time * 0.3 + i * 0.5) * 0.003;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#D2B48C" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
};

// Firefly particles for night
export const FireflyParticles = ({ count = 20 }: { count?: number }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 5 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, phases };
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const phase = particles.phases[i];
      positions[i * 3] += Math.sin(time + phase) * 0.01;
      positions[i * 3 + 1] += Math.sin(time * 2 + phase) * 0.005;
      positions[i * 3 + 2] += Math.cos(time + phase) * 0.01;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#ADFF2F" transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};
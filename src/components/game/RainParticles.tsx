import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const RainParticles = () => {
  const count = 500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  useFrame((state) => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 40;
      
      const pos = dummy.current.position;
      pos.set(x, y, z);
      pos.y -= 0.3;
      if (pos.y < -15) pos.y = 15;
      
      dummy.current.scale.set(0.02, 0.15, 0.02);
      dummy.current.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.current.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#aaaaff" transparent opacity={0.4} />
    </instancedMesh>
  );
};
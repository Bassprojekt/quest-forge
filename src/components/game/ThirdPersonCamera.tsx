import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const ThirdPersonCamera = () => {
  const { camera, gl } = useThree();
  const playerPos = useGameStore(s => s.playerPosition);
  const isUIOpen = useGameStore(s => s.isUIOpen);

  const angleRef = useRef({ theta: Math.PI, phi: 0.4 });
  const distRef = useRef(10);
  const isRightMouseDown = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        isRightMouseDown.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        isRightMouseDown.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRightMouseDown.current) return;
      
      const isUIOpen = document.querySelector('[data-shop-open="true"]') !== null || 
                       document.querySelector('[data-inventory-open="true"]') !== null ||
                       document.querySelector('[data-quest-open="true"]') !== null;
      if (isUIOpen) return;
      
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      
      angleRef.current.theta -= dx * 0.008;
      angleRef.current.phi = THREE.MathUtils.clamp(
        angleRef.current.phi + dy * 0.006, 0.1, 1.2
      );
      
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      const isUIOpen = document.querySelector('[data-shop-open="true"]') !== null || 
                       document.querySelector('[data-inventory-open="true"]') !== null ||
                       document.querySelector('[data-quest-open="true"]') !== null;
      if (isUIOpen) return;
      e.preventDefault();
      distRef.current = THREE.MathUtils.clamp(
        distRef.current + e.deltaY * 0.02, 
        4, 
        25
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        isRightMouseDown.current = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl]);

  useFrame(() => {
    const { theta, phi } = angleRef.current;
    const dist = distRef.current;

    const target = new THREE.Vector3(playerPos[0], 1.2, playerPos[2]);
    const offset = new THREE.Vector3(
      dist * Math.sin(theta) * Math.cos(phi),
      dist * Math.sin(phi),
      dist * Math.cos(theta) * Math.cos(phi)
    );

    camera.position.lerp(target.clone().add(offset), 0.1);
    camera.lookAt(target);
  });

  return null;
};

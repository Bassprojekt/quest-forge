import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, ZONES } from '@/store/gameStore';
import { useKeyboard } from '@/hooks/useKeyboard';

const getMapHalfSize = (zone: string): number => {
  const sizes: Record<string, number> = {
    hub: 80, grasslands: 50, mushroom_forest: 60, frozen_peaks: 70, lava_caverns: 75,
    coral_reef: 70, shadow_swamp: 80, crystal_highlands: 90, void_nexus: 100,
    dragon_lair: 110, enchanted_forest: 120, floating_islands: 130, abyss: 140,
    celestial_plains: 150, shadow_realm: 160, pvp_arena: 25, raid_dungeon: 75, arena_colosseum: 50,
  };
  return sizes[zone] || 50;
};

const WarriorWeapon = ({ swingRef }: { swingRef: React.RefObject<THREE.Group> }) => (
  <group ref={swingRef} position={[0.35, 0.7, 0.2]} rotation={[-0.1, 0, 0.1]}>
    {/* Arm */}
    <mesh position={[0, -0.25, 0]} castShadow>
      <boxGeometry args={[0.12, 0.35, 0.12]} />
      <meshStandardMaterial color="#E8C39E" flatShading roughness={0.7} />
    </mesh>
    {/* Handle */}
    <mesh position={[0, -0.42, 0]} castShadow rotation={[0, 0, 0.1]}>
      <boxGeometry args={[0.06, 0.18, 0.06]} />
      <meshStandardMaterial color="#4A2A10" flatShading roughness={0.6} />
    </mesh>
    {/* Guard */}
    <mesh position={[0, -0.52, 0]} castShadow>
      <boxGeometry args={[0.12, 0.04, 0.08]} />
      <meshStandardMaterial color="#FFD700" flatShading metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Blade */}
    <mesh position={[0, -0.15, 0]} castShadow>
      <boxGeometry args={[0.08, 0.5, 0.03]} />
      <meshStandardMaterial color="#C0C8D0" flatShading metalness={0.95} roughness={0.05} />
    </mesh>
    {/* Blade shine */}
    <mesh position={[0, -0.15, 0.02]} castShadow>
      <boxGeometry args={[0.04, 0.5, 0.01]} />
      <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} flatShading metalness={1} roughness={0.02} />
    </mesh>
    {/* Tip */}
    <mesh position={[0, 0.12, 0]} castShadow>
      <boxGeometry args={[0.06, 0.06, 0.03]} />
      <meshStandardMaterial color="#C0C8D0" flatShading metalness={0.95} roughness={0.05} />
    </mesh>
  </group>
);

const MageWeapon = ({ swingRef }: { swingRef: React.RefObject<THREE.Group> }) => (
  <group ref={swingRef} position={[0.35, 0.7, 0.2]} rotation={[-0.1, 0, 0.1]}>
    {/* Arm */}
    <mesh position={[0, -0.25, 0]} castShadow>
      <boxGeometry args={[0.12, 0.35, 0.12]} />
      <meshStandardMaterial color="#E8C39E" flatShading roughness={0.7} />
    </mesh>
    {/* Staff shaft */}
    <mesh position={[0, -0.4, 0]} castShadow rotation={[0, 0, 0.1]}>
      <boxGeometry args={[0.05, 1.1, 0.05]} />
      <meshStandardMaterial color="#5C3A1E" flatShading />
    </mesh>
    {/* Staff orb */}
    <mesh position={[0, 0.25, 0]} castShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#9C27B0" emissive="#9C27B0" emissiveIntensity={1.5} flatShading />
    </mesh>
  </group>
);

const ArcherWeapon = ({ swingRef }: { swingRef: React.RefObject<THREE.Group> }) => (
  <group ref={swingRef} position={[0.35, 0.7, 0.2]} rotation={[0, 0, 0.1]}>
    {/* Arm */}
    <mesh position={[0, -0.25, 0]} castShadow>
      <boxGeometry args={[0.12, 0.35, 0.12]} />
      <meshStandardMaterial color="#E8C39E" flatShading roughness={0.7} />
    </mesh>
    {/* Bow body */}
    <mesh position={[0, -0.45, 0]} castShadow>
      <torusGeometry args={[0.35, 0.025, 6, 12, Math.PI]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
</group>
);

export const Player = () => {
  const meshRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const keys = useKeyboard();
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const activateSkill = useGameStore(s => s.useSkill);
  const skills = useGameStore(s => s.skills);
  const setShieldActive = useGameStore(s => s.setShieldActive);
  const setDashActive = useGameStore(s => s.setDashActive);
  const setLaserTarget = useGameStore(s => s.setLaserTarget);
  const playerMana = useGameStore(s => s.playerMana);
  const setPlayerMana = useGameStore(s => s.setPlayerMana);
  const enemies = useGameStore(s => s.enemies);
  const attackEnemy = useGameStore(s => s.attackEnemy);
  const targetEnemyId = useGameStore(s => s.targetEnemyId);
  const autoMoveTarget = useGameStore(s => s.autoMoveTarget);
  const autoMoveEnemyId = useGameStore(s => s.autoMoveEnemyId);
  const setAutoMoveTarget = useGameStore(s => s.setAutoMoveTarget);
  const setIsAttacking = useGameStore(s => s.setIsAttacking);
  const playerClass = useGameStore(s => s.playerClass);
  const autoFight = useGameStore(s => s.autoFight);
  const autoRespawn = useGameStore(s => s.autoRespawn);
  const respawnEnemies = useGameStore(s => s.respawnEnemies);
  const currentZone = useGameStore(s => s.currentZone);
  const playerPosition = useGameStore(s => s.playerPosition);
  const playerHp = useGameStore(s => s.playerHp);
  const setAutoFight = useGameStore(s => s.setAutoFight);
  const velocity = useRef(new THREE.Vector3());
  const shieldTimer = useRef(0);
  const dashTimer = useRef(0);
  const dashDir = useRef(new THREE.Vector3());
  const lastSkillCheck = useRef({ q: false, e: false, shift: false });
  const swingTimer = useRef(0);
  const attackCooldown = useRef(0);
  const walkCycle = useRef(0);
  const idlePhase = useRef(0);

  const attackSpeed = playerClass === 'archer' ? 0.4 : playerClass === 'mage' ? 0.5 : 0.5;
  const attackRange = playerClass === 'archer' ? 8 : playerClass === 'mage' ? 6 : 2.5;

  useEffect(() => {
    if (meshRef.current && playerPosition) {
      meshRef.current.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    }
  }, [playerPosition]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (playerHp <= 0) {
      if (autoFight) setAutoFight(false);
      if (velocity.current.length() > 0) {
        velocity.current.set(0, 0, 0);
      }
      meshRef.current.position.y = 0;
      return;
    }
    const now = performance.now() / 1000;

    // Weapon swing animation - arm swing combat with body movement
    if (swordRef.current && torsoRef.current) {
      if (swingTimer.current > 0) {
        swingTimer.current -= delta;
        const swingProgress = 1 - (swingTimer.current / 0.25);
        
        if (playerClass === 'mage') {
          // Staff thrust
          swordRef.current.rotation.x = -0.1 + Math.sin(swingProgress * Math.PI) * -0.8;
          swordRef.current.position.z = 0.2 + Math.sin(swingProgress * Math.PI) * 0.4;
        } else if (playerClass === 'archer') {
          // Bow aim
          swordRef.current.rotation.x = Math.sin(swingProgress * Math.PI) * -0.2;
        } else {
          // Full body swing - dramatic combat move
          const swing = Math.sin(swingProgress * Math.PI);
          
          // Arm swings up and down
          swordRef.current.rotation.x = -0.1 + swing * 1.8;
          swordRef.current.rotation.z = 0.1 + swing * 0.8;
          swordRef.current.position.z = 0.2 - swing * 0.4;
          swordRef.current.position.y = 0.7 + swing * 0.2;
          
          // Body leans into the swing
          torsoRef.current.rotation.z = swing * 0.15;
          torsoRef.current.rotation.y = swing * 0.1;
          
          // Slight body step
          meshRef.current.position.x += swing * 0.02;
        }
      } else {
        // Return to idle - smooth lerp
        swordRef.current.rotation.x = THREE.MathUtils.lerp(swordRef.current.rotation.x, -0.1, 8 * delta);
        swordRef.current.rotation.z = THREE.MathUtils.lerp(swordRef.current.rotation.z, 0.1, 8 * delta);
        swordRef.current.position.z = THREE.MathUtils.lerp(swordRef.current.position.z, 0.2, 8 * delta);
        swordRef.current.position.y = THREE.MathUtils.lerp(swordRef.current.position.y, 0.7, 8 * delta);
        
        // Body returns to normal
        torsoRef.current.rotation.z = THREE.MathUtils.lerp(torsoRef.current.rotation.z, 0, 8 * delta);
        torsoRef.current.rotation.y = THREE.MathUtils.lerp(torsoRef.current.rotation.y, 0, 8 * delta);
      }
    }

    // Skills
    if (keys.current.q && !lastSkillCheck.current.q) {
      const skill = skills[0];
      if (skill && now - skill.lastUsed >= skill.cooldown && playerMana >= skill.manaCost) {
        activateSkill(skill.id);
        setPlayerMana(playerMana - skill.manaCost);
        const target = enemies.find(e => e.id === targetEnemyId && e.alive);
        if (target) {
          setLaserTarget(target.position);
          attackEnemy(target.id);
          attackEnemy(target.id);
        }
        setTimeout(() => setLaserTarget(null), 400);
      }
    }

    if (keys.current.e && !lastSkillCheck.current.e) {
      const skill = skills[1];
      if (skill && now - skill.lastUsed >= skill.cooldown && playerMana >= skill.manaCost) {
        activateSkill(skill.id);
        setPlayerMana(playerMana - skill.manaCost);
        setShieldActive(true);
        shieldTimer.current = 3;
      }
    }

    if (keys.current.shift && !lastSkillCheck.current.shift) {
      const skill = skills[2];
      if (skill && now - skill.lastUsed >= skill.cooldown && playerMana >= skill.manaCost) {
        activateSkill(skill.id);
        setPlayerMana(playerMana - skill.manaCost);
        setDashActive(true);
        dashTimer.current = 0.25;
        const cameraDir = new THREE.Vector3();
        state.camera.getWorldDirection(cameraDir);
        cameraDir.y = 0;
        cameraDir.normalize();
        dashDir.current.copy(cameraDir);
      }
    }

    lastSkillCheck.current = { q: keys.current.q, e: keys.current.e, shift: keys.current.shift };

    if (shieldTimer.current > 0) {
      shieldTimer.current -= delta;
      if (shieldTimer.current <= 0) setShieldActive(false);
    }

    if (dashTimer.current > 0) {
      dashTimer.current -= delta;
      meshRef.current.position.addScaledVector(dashDir.current, 40 * delta);
      if (dashTimer.current <= 0) setDashActive(false);
      const mapHalfSize = getMapHalfSize(currentZone);
      meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -mapHalfSize, mapHalfSize);
      meshRef.current.position.z = THREE.MathUtils.clamp(meshRef.current.position.z, -mapHalfSize, mapHalfSize);
      setPlayerPosition([meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]);
      return;
    }

    // Auto-move and auto-attack target enemy
    let isAutoMoving = false;
    let isMoving = false;
    
    // Auto-Fight: Find nearest enemy when enabled and no target
    if (autoFight && !autoMoveEnemyId) {
      const zoneEnemies = enemies.filter(e => e.alive && e.zone === currentZone);
      let nearestEnemy = null;
      let nearestDist = Infinity;
      for (const enemy of zoneEnemies) {
        const dx = enemy.position[0] - meshRef.current.position.x;
        const dz = enemy.position[2] - meshRef.current.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = enemy;
        }
      }
      if (nearestEnemy) {
        setAutoMoveTarget(nearestEnemy.position, nearestEnemy.id);
      }
    }
    
    if (autoMoveEnemyId) {
      const targetEnemy = enemies.find(e => e.id === autoMoveEnemyId);
      if (!targetEnemy || !targetEnemy.alive) {
        // Enemy dead - stop auto attack
        setAutoMoveTarget(null, null);
      } else {
        const tx = targetEnemy.position[0] - meshRef.current.position.x;
        const tz = targetEnemy.position[2] - meshRef.current.position.z;
        const dist = Math.sqrt(tx * tx + tz * tz);
        const angle = Math.atan2(tx, tz);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 10 * delta);

        if (dist <= attackRange) {
          // In range - keep attacking continuously
          velocity.current.set(0, 0, 0);
          if (attackCooldown.current <= 0) {
            attackEnemy(targetEnemy.id);
            swingTimer.current = 0.3;
            attackCooldown.current = attackSpeed;
            setIsAttacking(true);
            setTimeout(() => setIsAttacking(false), 200);
          }
        } else {
          // Walk toward enemy
          isAutoMoving = true;
          isMoving = true;
          const dir = new THREE.Vector3(tx, 0, tz).normalize();
          velocity.current.lerp(dir.multiplyScalar(8), 5 * delta);
        }
      }
    }

    if (attackCooldown.current > 0) attackCooldown.current -= delta;

    // Manual WASD movement
    if (!isAutoMoving && !autoMoveEnemyId) {
      const baseSpeed = useGameStore.getState().playerSpeed;
      const equippedPets = useGameStore.getState().pets.filter(p => p.equipped);
      let speedBonus = 0;
      for (const pet of equippedPets) {
        if (pet.bonusType === 'speed') {
          speedBonus += pet.bonusValue;
        }
      }
      const totalSpeed = baseSpeed * (1 + speedBonus);
      
      const dir = new THREE.Vector3();
      const cameraDir = new THREE.Vector3();
      state.camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).negate();

      if (keys.current.w) dir.add(cameraDir);
      if (keys.current.s) dir.sub(cameraDir);
      if (keys.current.a) dir.sub(right);
      if (keys.current.d) dir.add(right);

      if (dir.length() > 0) {
        dir.normalize();
        isMoving = true;
        const targetAngle = Math.atan2(dir.x, dir.z);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetAngle, 10 * delta);
        if (autoMoveEnemyId) setAutoMoveTarget(null, null);
      }

      velocity.current.lerp(dir.multiplyScalar(totalSpeed), 5 * delta);
    } else if (!isAutoMoving && autoMoveEnemyId) {
      // Standing still attacking - cancel with WASD
      if (keys.current.w || keys.current.a || keys.current.s || keys.current.d) {
        setAutoMoveTarget(null, null);
      }
    }

    if (isMoving) {
      walkCycle.current += delta * 10;
    } else {
      walkCycle.current = 0;
    }

    meshRef.current.position.addScaledVector(velocity.current, delta);
    const mapHalfSize = getMapHalfSize(currentZone);
    meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -mapHalfSize, mapHalfSize);
    meshRef.current.position.z = THREE.MathUtils.clamp(meshRef.current.position.z, -mapHalfSize, mapHalfSize);
    setPlayerPosition([meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]);
    
    // Idle animation phase - always update
    idlePhase.current += delta * 1.5;

    // Apply idle animations when not moving
    const isMovingNow = velocity.current.length() > 0.1 || keys.current.w || keys.current.a || keys.current.s || keys.current.d;
    const idleBreathNow = Math.sin(idlePhase.current) * 0.02;
    const idleArmSwayNow = Math.sin(idlePhase.current * 0.7) * 0.05;

    if (!isMovingNow && torsoRef.current) {
      torsoRef.current.position.y = idleBreathNow;
    }
    if (!isMovingNow && headRef.current) {
      headRef.current.rotation.x = idleBreathNow * 0.5;
    }
    if (!isMovingNow && rightArmRef.current) {
      rightArmRef.current.rotation.x = idleArmSwayNow;
    }
    if (!isMovingNow && leftArmRef.current) {
      leftArmRef.current.rotation.x = -idleArmSwayNow;
    }
  });

  const shieldActive = useGameStore(s => s.shieldActive);
  const dashActive = useGameStore(s => s.dashActive);

  const legSwing = Math.sin(walkCycle.current) * 0.4;
  const armSwing = Math.sin(walkCycle.current + Math.PI) * 0.3;
  const bodyBob = Math.abs(Math.sin(walkCycle.current)) * 0.05;
  
  // Class-specific colors
  const tunicColor = playerClass === 'warrior' ? '#C62828' : playerClass === 'mage' ? '#4A148C' : '#1B5E20';
  const tunicDark = playerClass === 'warrior' ? '#8E0000' : playerClass === 'mage' ? '#311B92' : '#0D3B0D';
  const shoulderColor = playerClass === 'warrior' ? '#D4A44A' : playerClass === 'mage' ? '#7E57C2' : '#4CAF50';
  const headbandColor = playerClass === 'warrior' ? '#B71C1C' : playerClass === 'mage' ? '#6A1B9A' : '#2E7D32';
  const hairColor = playerClass === 'warrior' ? '#E8A030' : playerClass === 'mage' ? '#E0E0E0' : '#5D4037';
  const hairDark = playerClass === 'warrior' ? '#D4901C' : playerClass === 'mage' ? '#BDBDBD' : '#3E2723';

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      <group position={[0, bodyBob, 0]}>
        {/* Boots */}
        <group position={[0.18, 0.2, 0]} rotation={[legSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.22, 0.25, 0.28]} /><meshStandardMaterial color="#6B3A2A" flatShading roughness={0.7} /></mesh>
          <mesh position={[0, 0.1, 0]} castShadow><boxGeometry args={[0.24, 0.06, 0.30]} /><meshStandardMaterial color="#8B5A3A" flatShading roughness={0.6} /></mesh>
        </group>
        <group position={[-0.18, 0.2, 0]} rotation={[-legSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.22, 0.25, 0.28]} /><meshStandardMaterial color="#6B3A2A" flatShading roughness={0.7} /></mesh>
          <mesh position={[0, 0.1, 0]} castShadow><boxGeometry args={[0.24, 0.06, 0.30]} /><meshStandardMaterial color="#8B5A3A" flatShading roughness={0.6} /></mesh>
        </group>

        {/* Legs */}
        <group position={[0.14, 0.52, 0]} rotation={[legSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.18, 0.35, 0.18]} /><meshStandardMaterial color="#2E4A7A" flatShading /></mesh>
        </group>
        <group position={[-0.14, 0.52, 0]} rotation={[-legSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.18, 0.35, 0.18]} /><meshStandardMaterial color="#2E4A7A" flatShading /></mesh>
        </group>

        {/* Torso */}
        <group ref={torsoRef}>
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.55, 0.55, 0.32]} />
          <meshStandardMaterial color={tunicColor} flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.85, -0.16]} castShadow>
          <boxGeometry args={[0.50, 0.65, 0.06]} />
          <meshStandardMaterial color={tunicDark} flatShading roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <boxGeometry args={[0.50, 0.08, 0.28]} />
          <meshStandardMaterial color="#F5F0E0" flatShading roughness={0.9} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[0.58, 0.08, 0.35]} />
          <meshStandardMaterial color="#C8A84E" flatShading metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.72, 0.18]} castShadow>
          <boxGeometry args={[0.10, 0.10, 0.04]} />
          <meshStandardMaterial color="#FFD700" flatShading metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Shoulder pads */}
        <mesh position={[0.35, 1.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.24]} />
          <meshStandardMaterial color={shoulderColor} flatShading />
        </mesh>
        <mesh position={[-0.35, 1.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.24]} />
          <meshStandardMaterial color={shoulderColor} flatShading />
        </mesh>
        </group>

        {/* Right arm (weapon arm) - now on right side */}
        <group ref={rightArmRef} position={[0.38, 0.92, 0]} rotation={[-armSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.14, 0.40, 0.14]} /><meshStandardMaterial color={tunicColor} flatShading /></mesh>
          <mesh position={[0, -0.24, 0]} castShadow><boxGeometry args={[0.12, 0.12, 0.12]} /><meshStandardMaterial color="#FFCC99" flatShading /></mesh>
        </group>
        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.38, 0.92, 0]} rotation={[armSwing, 0, 0]}>
          <mesh castShadow><boxGeometry args={[0.14, 0.40, 0.14]} /><meshStandardMaterial color={tunicColor} flatShading /></mesh>
          <mesh position={[0, -0.24, 0]} castShadow><boxGeometry args={[0.12, 0.12, 0.12]} /><meshStandardMaterial color="#FFCC99" flatShading /></mesh>
        </group>

        {/* Head */}
        <group ref={headRef} position={[0, 1.52, 0]}>
          <mesh castShadow><boxGeometry args={[0.52, 0.48, 0.48]} /><meshStandardMaterial color="#FFD5AA" flatShading /></mesh>
          <mesh position={[0, 0.22, -0.02]} castShadow><boxGeometry args={[0.56, 0.14, 0.52]} /><meshStandardMaterial color={hairColor} flatShading /></mesh>
          <mesh position={[0.26, 0.05, -0.05]} castShadow><boxGeometry args={[0.08, 0.35, 0.42]} /><meshStandardMaterial color={hairDark} flatShading /></mesh>
          <mesh position={[-0.26, 0.05, -0.05]} castShadow><boxGeometry args={[0.08, 0.35, 0.42]} /><meshStandardMaterial color={hairDark} flatShading /></mesh>
          <mesh position={[0, -0.05, -0.26]} castShadow><boxGeometry args={[0.50, 0.45, 0.08]} /><meshStandardMaterial color={hairDark} flatShading /></mesh>
          <mesh position={[0.12, 0.18, 0.24]} castShadow><boxGeometry args={[0.12, 0.10, 0.06]} /><meshStandardMaterial color={hairColor} flatShading /></mesh>
          <mesh position={[-0.12, 0.18, 0.24]} castShadow><boxGeometry args={[0.12, 0.10, 0.06]} /><meshStandardMaterial color={hairColor} flatShading /></mesh>
          {/* Eyes */}
          <mesh position={[0.12, 0.02, 0.245]}><boxGeometry args={[0.12, 0.14, 0.02]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
          <mesh position={[-0.12, 0.02, 0.245]}><boxGeometry args={[0.12, 0.14, 0.02]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
          <mesh position={[0.12, 0.0, 0.255]}><boxGeometry args={[0.08, 0.10, 0.02]} /><meshStandardMaterial color="#2255AA" emissive="#2244AA" emissiveIntensity={0.3} /></mesh>
          <mesh position={[-0.12, 0.0, 0.255]}><boxGeometry args={[0.08, 0.10, 0.02]} /><meshStandardMaterial color="#2255AA" emissive="#2244AA" emissiveIntensity={0.3} /></mesh>
          <mesh position={[0.14, 0.04, 0.265]}><boxGeometry args={[0.03, 0.04, 0.01]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} /></mesh>
          <mesh position={[-0.10, 0.04, 0.265]}><boxGeometry args={[0.03, 0.04, 0.01]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} /></mesh>
          <mesh position={[0, -0.10, 0.245]}><boxGeometry args={[0.08, 0.03, 0.02]} /><meshStandardMaterial color="#DD8866" /></mesh>
          {/* Blush */}
          <mesh position={[0.20, -0.06, 0.24]}><boxGeometry args={[0.06, 0.04, 0.02]} /><meshStandardMaterial color="#FFB0B0" transparent opacity={0.6} /></mesh>
          <mesh position={[-0.20, -0.06, 0.24]}><boxGeometry args={[0.06, 0.04, 0.02]} /><meshStandardMaterial color="#FFB0B0" transparent opacity={0.6} /></mesh>
          {/* Headband */}
          <mesh position={[0, 0.12, 0.01]} castShadow><boxGeometry args={[0.56, 0.06, 0.50]} /><meshStandardMaterial color={headbandColor} flatShading /></mesh>
          <mesh position={[0, 0.14, -0.28]} castShadow><boxGeometry args={[0.08, 0.12, 0.08]} /><meshStandardMaterial color={headbandColor} flatShading /></mesh>
        </group>

        {/* Weapon based on class */}
        {playerClass === 'warrior' && <WarriorWeapon swingRef={swordRef} />}
        {playerClass === 'mage' && <MageWeapon swingRef={swordRef} />}
        {playerClass === 'archer' && <ArcherWeapon swingRef={swordRef} />}
      </group>

      {/* Shield visual */}
      {shieldActive && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial
            color={playerClass === 'mage' ? '#81D4FA' : '#4FC3F7'}
            emissive={playerClass === 'mage' ? '#81D4FA' : '#4FC3F7'}
            emissiveIntensity={0.8}
            transparent opacity={0.15} side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Dash trail */}
      {dashActive && (
        <>
          <mesh position={[0, 0.8, -0.8]}>
            <boxGeometry args={[0.4, 1.2, 0.6]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={2} transparent opacity={0.3} flatShading />
          </mesh>
          <mesh position={[0, 0.8, -1.4]}>
            <boxGeometry args={[0.3, 0.8, 0.5]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={1.5} transparent opacity={0.2} flatShading />
          </mesh>
        </>
      )}
    </group>
  );
};

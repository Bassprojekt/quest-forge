import { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Player } from './Player';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { EnemyEntity } from './EnemyEntity';
import { GameWorld } from './GameWorld';
import { HubBuildings } from './HubBuildings';
import { NPCEntity } from './NPCEntity';
import { TeleportNPC } from './TeleportNPC';
import { TeleportDialog } from './TeleportDialog';
import { LaserBeam } from './LaserBeam';
import { HUD } from './HUD';
import { DamageNumbers } from './DamageNumbers';
import { HitParticles, LevelUpEffect } from './HitParticles';
import { ClassSelect } from './ClassSelect';
import { ShopUI } from './ShopUI';
import { GuildUI } from './GuildUI';
import { BankUI } from './BankUI';
import { PetCompanion } from './PetCompanion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';
import { playZoneMusic, playPortalSound } from '@/hooks/useSound';
import { startAutoSave } from '@/store/saveStore';

const ZONE_SKY: Record<string, string> = {
  hub: '#87CEEB',
  grasslands: '#7EC8E3',
  mushroom_forest: '#6B4A8B',
  frozen_peaks: '#A8D8EA',
  lava_caverns: '#FF6B35',
  coral_reef: '#40C4FF',
  shadow_swamp: '#4A5A5A',
  crystal_highlands: '#E0F0FF',
  void_nexus: '#2A0A4A',
};

const WEATHER_FOG: Record<string, string> = {
  sunny: '#000000',
  rainy: '#708090',
  foggy: '#A0A0A0',
};

interface HubBuildingsProps {
  onOpenShop: (tab: 'items' | 'pets') => void;
  onOpenGuild: () => void;
  onOpenBank: () => void;
}

const HubBuildingsWithProps = ({ onOpenShop, onOpenGuild, onOpenBank }: HubBuildingsProps) => {
  return <HubBuildings onOpenShop={onOpenShop} onOpenGuild={onOpenGuild} onOpenBank={onOpenBank} />;
};

export const GameScene = () => {
  const enemies = useGameStore(s => s.enemies);
  const currentZone = useGameStore(s => s.currentZone);
  const zoneEnemies = enemies.filter(e => e.zone === currentZone);
  const playerClass = useGameStore(s => s.playerClass);
  const weather = useGameStore(s => s.weather);
  const baseSkyColor = ZONE_SKY[currentZone] || '#87CEEB';
  const skyColor = weather === 'rainy' ? '#4A5568' : weather === 'foggy' ? '#9CA3AF' : baseSkyColor;
  const fogColor = WEATHER_FOG[weather] || '#000000';
  const [showTeleportDialog, setShowTeleportDialog] = useState(false);
  const [shopTab, setShopTab] = useState<'items' | 'pets'>('items');
  const [showShop, setShowShop] = useState(false);
  const [showGuild, setShowGuild] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const language = useSettingsStore(s => s.language);
  
  const t = (key: keyof typeof TRANSLATIONS.de): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.de[key] || key;
  };

  const handleOpenShop = useCallback((tab: 'items' | 'pets') => {
    setShopTab(tab);
    setShowShop(false);
    setTimeout(() => setShowShop(true), 0);
  }, []);

  const handleOpenPets = useCallback(() => {
    setShopTab('pets');
    setShowShop(false);
    setTimeout(() => setShowShop(true), 0);
  }, []);

  const handleOpenGuild = useCallback(() => {
    setShowGuild(true);
  }, []);

  const handleOpenBank = useCallback(() => {
    setShowBank(true);
  }, []);

  const blacksmithName = 'Schmied Vulkan';
  const merchantName = 'Händler Mika';
  const petMasterName = 'Pet-Meisterin Luna';
  const rebirthAltarName = 'Rebirth Altar';
  const setWeather = useGameStore(s => s.setWeather);

  useEffect(() => {
    playPortalSound();
    playZoneMusic(currentZone);
  }, [currentZone]);

  useEffect(() => {
    if (playerClass) startAutoSave();
  }, [playerClass]);

  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const weatherTypes: ('sunny' | 'rainy' | 'foggy')[] = ['sunny', 'rainy', 'foggy'];
      const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      setWeather(newWeather);
    }, 45000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Pet heal interval
  const playerHp = useGameStore(s => s.playerHp);
  const playerMaxHp = useGameStore(s => s.playerMaxHp);
  const playerMana = useGameStore(s => s.playerMana);
  const playerMaxMana = useGameStore(s => s.playerMaxMana);
  const playerPosition = useGameStore(s => s.playerPosition);
  const pets = useGameStore(s => s.pets);
  const setPlayerHp = useGameStore(s => s.setPlayerHp);
  const setPlayerMana = useGameStore(s => s.setPlayerMana);
  const addDamagePopup = useGameStore(s => s.addDamagePopup);
  
  useEffect(() => {
    const healPet = pets.find(p => p.equipped && p.bonusType === 'heal');
    if (!healPet) return;
    
    const healInterval = setInterval(() => {
      const newHp = Math.min(playerMaxHp, playerHp + healPet.bonusValue);
      setPlayerHp(newHp);
      addDamagePopup({
        id: `heal-${Date.now()}`,
        position: playerPosition,
        amount: healPet.bonusValue,
        type: 'heal',
      });
    }, 5000);
    
    return () => clearInterval(healInterval);
  }, [pets, playerHp, playerMaxHp, playerPosition, setPlayerHp, addDamagePopup]);

  // HP Regeneration (1 HP every 2 seconds when not full)
  useEffect(() => {
    if (playerHp >= playerMaxHp) return;
    const hpRegenInterval = setInterval(() => {
      setPlayerHp(Math.min(playerMaxHp, playerHp + 1));
    }, 2000);
    return () => clearInterval(hpRegenInterval);
  }, [playerHp, playerMaxHp, setPlayerHp]);

  // MP Regeneration (1 MP every 3 seconds when not full)
  useEffect(() => {
    if (playerMana >= playerMaxMana) return;
    const mpRegenInterval = setInterval(() => {
      setPlayerMana(Math.min(playerMaxMana, playerMana + 1));
    }, 3000);
    return () => clearInterval(mpRegenInterval);
  }, [playerMana, playerMaxMana, setPlayerMana]);

  if (!playerClass) {
    return <ClassSelect />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TeleportDialog open={showTeleportDialog} onOpenChange={setShowTeleportDialog} />
      {showShop && <ShopUI onClose={() => setShowShop(false)} initialTab={shopTab} />}
      {showGuild && <GuildUI onClose={() => setShowGuild(false)} />}
      {showBank && <BankUI onClose={() => setShowBank(false)} />}
      <HUD />
      <Canvas
        shadows
        camera={{ fov: 55, near: 0.1, far: 1200 }}
        style={{ background: skyColor }}
        gl={{ antialias: false, toneMapping: 3, toneMappingExposure: 1.4 }}
      >
        <ambientLight intensity={0.5} color="#FFF8E7" />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.5}
          color="#FFF5D4"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={300}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-20, 20, -30]} intensity={0.4} color="#B0E0FF" />
        <hemisphereLight color="#87CEEB" groundColor="#6B8E6B" intensity={0.6} />
        <pointLight position={[0, 10, 0]} intensity={0.3} color="#FFE4B5" distance={50} />
        <fog attach="fog" args={[fogColor, weather === 'sunny' ? 80 : weather === 'rainy' ? 40 : 30, weather === 'sunny' ? 120 : weather === 'rainy' ? 60 : 50]} />

        <ThirdPersonCamera />
        <Player />
        <PetCompanion />
        <LaserBeam />
        <DamageNumbers />
        <HitParticles />
        <LevelUpEffect />

        {/* Ground - only shown in hub, zones have their own ground */}
        {currentZone === 'hub' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#4a7c4a" />
          </mesh>
        )}

        {/* Hub with buildings and NPCs */}
        {currentZone === 'hub' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color="#3d5c3d" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
              <circleGeometry args={[25, 32]} />
              <meshStandardMaterial color="#7CCD7C" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <circleGeometry args={[10, 32]} />
              <meshStandardMaterial color="#D2B48C" />
            </mesh>
            <HubBuildingsWithProps onOpenShop={handleOpenShop} onOpenGuild={handleOpenGuild} onOpenBank={handleOpenBank} />
            <NPCEntity name={blacksmithName} position={[-6, 0, 6]} color="#CD853F" />
            <NPCEntity name={merchantName} position={[6, 0, 6]} color="#4169E1" />
            <NPCEntity name={petMasterName} position={[-6, 0, -6]} color="#FF69B4" onClick={handleOpenPets} />
            <NPCEntity name={rebirthAltarName} position={[6, 0, -6]} color="#FFD700" />
          </>
        )}

        {/* Teleporter NPC - shows in all zones */}
        <TeleportNPC onOpenTeleport={() => setShowTeleportDialog(true)} />

        {/* Zone-based world (only current zone loads) */}
        <GameWorld />
        
        {/* Only current zone enemies */}
        {zoneEnemies.map(enemy => (
          <EnemyEntity key={enemy.id} enemy={enemy} />
        ))}
      </Canvas>
    </div>
  );
};
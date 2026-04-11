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
import { RainParticles } from './RainParticles';
import { DamageNumbers } from './DamageNumbers';
import { GroundItems } from './GroundItems';
import { HitParticles, LevelUpEffect } from './HitParticles';
import { ClassSelect } from './ClassSelect';
import { ShopUI } from './ShopUI';
import { CraftingUI } from './CraftingUI';
import { WeaponCraftingUI } from './WeaponCraftingUI';
import { PVPArena } from './PVPArena';
import { FriendsUI } from './FriendsUI';
import { EventsUI } from './EventsUI';
import { RaidUI } from './RaidUI';
import { GuildUI } from './GuildUI';
import { BankUI } from './BankUI';
import { PetCompanion } from './PetCompanion';
import { LoginScreen } from './LoginScreen';
import { TutorialScreen } from './TutorialScreen';
import { ChatUI } from './ChatUI';
import { MobileControls } from './MobileControls';
import { useAccountStore } from '@/store/accountStore';
import { useTutorialStore } from '@/store/tutorialStore';
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
  onOpenPotionCraft: () => void;
  onOpenWeaponCraft: () => void;
  onOpenPVPArena: () => void;
  onOpenFriends: () => void;
  onOpenEvents: () => void;
  onOpenRaid: () => void;
}

const HubBuildingsWithProps = ({ onOpenShop, onOpenGuild, onOpenBank, onOpenPotionCraft, onOpenWeaponCraft, onOpenPVPArena, onOpenFriends, onOpenEvents, onOpenRaid }: HubBuildingsProps) => {
  return <HubBuildings onOpenShop={onOpenShop} onOpenGuild={onOpenGuild} onOpenBank={onOpenBank} onOpenPotionCraft={onOpenPotionCraft} onOpenWeaponCraft={onOpenWeaponCraft} onOpenPVPArena={onOpenPVPArena} onOpenFriends={onOpenFriends} onOpenEvents={onOpenEvents} onOpenRaid={onOpenRaid} />;
};

export const GameScene = () => {
  const enemies = useGameStore(s => s.enemies);
  const currentZone = useGameStore(s => s.currentZone);
  const zoneEnemies = enemies.filter(e => e.zone === currentZone);
  const playerClass = useGameStore(s => s.playerClass);
  const weather = useGameStore(s => s.weather);
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const baseSkyColor = ZONE_SKY[currentZone] || '#87CEEB';
  const skyColor = weather === 'rainy' ? '#4A5568' : weather === 'foggy' ? '#9CA3AF' : baseSkyColor;
  const fogColor = WEATHER_FOG[weather] || '#000000';
  
  // Day/Night lighting adjustment
  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;
  const nightIntensity = isNight ? 0.3 : 1;
  const [showTeleportDialog, setShowTeleportDialog] = useState(false);
  const [shopTab, setShopTab] = useState<'items' | 'pets'>('items');
  const [showShop, setShowShop] = useState(false);
  const [showGuild, setShowGuild] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showPotionCraft, setShowPotionCraft] = useState(false);
  const [showWeaponCraft, setShowWeaponCraft] = useState(false);
  const [showPVPArena, setShowPVPArena] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const language = useSettingsStore(s => s.language);
  
  const t = (key: keyof typeof TRANSLATIONS.de): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.de[key] || key;
  };

  const [shopType, setShopType] = useState<'general' | 'weapons' | 'armor' | 'potions'>('general');

  const handleOpenShop = useCallback((tab: 'items' | 'pets', type?: 'general' | 'weapons' | 'armor' | 'potions') => {
    setShopTab(tab);
    if (type) setShopType(type);
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

  const handleOpenPotionCraft = useCallback(() => {
    setShowPotionCraft(true);
  }, []);

  const handleOpenWeaponCraft = useCallback(() => {
    setShowWeaponCraft(true);
  }, []);

  const handleOpenPVPArena = useCallback(() => {
    setShowPVPArena(true);
  }, []);

  const handleOpenFriends = useCallback(() => {
    setShowFriends(true);
  }, []);

  const handleOpenEvents = useCallback(() => {
    setShowEvents(true);
  }, []);

  const handleOpenRaid = useCallback(() => {
    setShowRaid(true);
  }, []);

  const [showEvents, setShowEvents] = useState(false);
  const [showRaid, setShowRaid] = useState(false);

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

  // Day/Night Cycle (changes every 60 seconds)
  const setTimeOfDay = useGameStore(s => s.setTimeOfDay || (() => {}));
  useEffect(() => {
    const dayNightInterval = setInterval(() => {
      const now = Date.now() / 60000;
      const time = now % 1;
      setTimeOfDay(time);
    }, 60000);
    return () => clearInterval(dayNightInterval);
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

  // HP Regeneration (1 HP every 15 seconds when not full)
  useEffect(() => {
    if (playerHp >= playerMaxHp) return;
    const hpRegenInterval = setInterval(() => {
      setPlayerHp(Math.min(playerMaxHp, playerHp + 1));
    }, 15000);
    return () => clearInterval(hpRegenInterval);
  }, [playerHp, playerMaxHp, setPlayerHp]);

  // MP Regeneration (1 MP every 15 seconds when not full)
  useEffect(() => {
    if (playerMana >= playerMaxMana) return;
    const mpRegenInterval = setInterval(() => {
      setPlayerMana(Math.min(playerMaxMana, playerMana + 1));
    }, 15000);
    return () => clearInterval(mpRegenInterval);
  }, [playerMana, playerMaxMana, setPlayerMana]);

  const isLoggedIn = useAccountStore(s => s.isLoggedIn());
  const currentUsername = useAccountStore(s => s.getCurrentUsername());
  const logout = useAccountStore(s => s.logout);

  const seenTutorial = useTutorialStore(s => s.seenTutorial);
  const markTutorialSeen = useTutorialStore(s => s.markTutorialSeen);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => {}} />;
  }

  if (!seenTutorial && playerClass) {
    return <TutorialScreen onComplete={markTutorialSeen} />;
  }

  if (!playerClass) {
    return <ClassSelect />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TeleportDialog open={showTeleportDialog} onOpenChange={setShowTeleportDialog} />
      {showShop && <ShopUI onClose={() => setShowShop(false)} initialTab={shopTab} shopType={shopType} />}
      {showGuild && <GuildUI onClose={() => setShowGuild(false)} />}
      {showBank && <BankUI onClose={() => setShowBank(false)} />}
      {showPotionCraft && <CraftingUI onClose={() => setShowPotionCraft(false)} />}
      {showWeaponCraft && <WeaponCraftingUI onClose={() => setShowWeaponCraft(false)} />}
      {showPVPArena && <PVPArena onClose={() => setShowPVPArena(false)} />}
      {showFriends && <FriendsUI onClose={() => setShowFriends(false)} />}
      {showEvents && <EventsUI onClose={() => setShowEvents(false)} />}
      {showRaid && <RaidUI onClose={() => setShowRaid(false)} />}
      <ChatUI onClose={() => {}} />
      <MobileControls />
      <HUD />
      <Canvas
        shadows
        camera={{ fov: 55, near: 0.1, far: 1200 }}
        style={{ background: skyColor }}
        gl={{ antialias: false, toneMapping: 3, toneMappingExposure: 1.4 }}
      >
        <ambientLight intensity={0.5 * nightIntensity} color={isNight ? '#1a1a3a' : '#FFF8E7'} />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.5 * nightIntensity}
          color={isNight ? '#6666aa' : '#FFF5D4'}
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

        {/* Rain particles when rainy */}
        {weather === 'rainy' && <RainParticles />}

        <ThirdPersonCamera />
        <Player />
        <PetCompanion />
        <LaserBeam />
        <DamageNumbers />
        <GroundItems />
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
            <HubBuildingsWithProps onOpenShop={handleOpenShop} onOpenGuild={handleOpenGuild} onOpenBank={handleOpenBank} onOpenPotionCraft={handleOpenPotionCraft} onOpenWeaponCraft={handleOpenWeaponCraft} onOpenPVPArena={handleOpenPVPArena} onOpenFriends={handleOpenFriends} onOpenEvents={handleOpenEvents} onOpenRaid={handleOpenRaid} />
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
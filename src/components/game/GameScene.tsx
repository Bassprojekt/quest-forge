import { useEffect, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Player } from './Player';
import { BuffPet } from './BuffPet';
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
import { AmbientParticles, FireflyParticles } from './AmbientParticles';
import { PVPArena } from './PVPArena';
import { FriendsUI } from './FriendsUI';
import { EventsUI } from './EventsUI';
import { RaidUI } from './RaidUI';
import { GuildUI } from './GuildUI';
import { BankUI } from './BankUI';
import { LeaderboardBoard } from './LeaderboardBoard';
import { PetTournamentUI } from './PetTournamentUI';
import { useCompanionStore } from '@/store/companionStore';
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
  const handleAFKTimeout = useGameStore(s => s.handleAFKTimeout);
  const respawnPlayer = useGameStore(s => s.respawnPlayer);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const lastInputTime = useRef(Date.now());
  
  // AFK detection - 1 hour timeout
  useEffect(() => {
    const afkTimer = setInterval(() => {
      const inactive = Date.now() - lastInputTime.current;
      if (inactive > 3600000) {
        handleAFKTimeout();
        lastInputTime.current = Date.now();
      }
    }, 60000);
    return () => clearInterval(afkTimer);
  }, [handleAFKTimeout]);
  
  // Track player input
  useEffect(() => {
    const onInput = () => { lastInputTime.current = Date.now(); };
    window.addEventListener('keydown', onInput);
    window.addEventListener('mousedown', onInput);
    window.addEventListener('touchstart', onInput);
    return () => {
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('mousedown', onInput);
      window.removeEventListener('touchstart', onInput);
    };
  }, []);
  
  // Day/Night lighting adjustment
  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;
  const nightIntensity = isNight ? 0.3 : 1;
  const [showTeleportDialog, setShowTeleportDialog] = useState(false);
  const [shopTab, setShopTab] = useState<'items' | 'pets'>('items');
  const [showShop, setShowShop] = useState(false);
  const [showGuild, setShowGuild] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showPetTournament, setShowPetTournament] = useState(false);
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

  const handleOpenPetTournament = useCallback(() => {
    setShowPetTournament(true);
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

  // Mana regeneriert nicht mehr automatisch - nur noch durch Tränke

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
      {showPetTournament && <PetTournamentUI onClose={() => setShowPetTournament(false)} />}
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
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.3 }}
      >
        <ambientLight intensity={0.4 * nightIntensity} color={isNight ? '#1a1a3a' : '#FFF8E7'} />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.9 * nightIntensity}
          color={isNight ? '#6666aa' : '#FFF5D4'}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={500}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-20, 20, -30]} intensity={0.5} color="#B0E0FF" />
        <hemisphereLight color="#87CEEB" groundColor="#4A6741" intensity={0.8} />
        <pointLight position={[0, 10, 0]} intensity={0.4} color="#FFE4B5" distance={60} />
        <pointLight position={[20, 15, -20]} intensity={0.2} color="#ADD8E6" distance={80} />
        <fog attach="fog" args={[fogColor, weather === 'sunny' ? 80 : weather === 'rainy' ? 40 : 30, weather === 'sunny' ? 120 : weather === 'rainy' ? 60 : 50]} />

        {/* Additional fill lights for better atmosphere */}
        <pointLight position={[-30, 20, 30]} intensity={0.15} color="#FFA07A" distance={100} />
        <pointLight position={[30, 20, -30]} intensity={0.15} color="#87CEEB" distance={100} />

        {/* Enhanced rain particles */}
        {weather === 'rainy' && <RainParticles />}

        {/* Ambient particles for atmosphere */}
        {currentZone === 'hub' && !isNight && <AmbientParticles count={50} color="#FFFACD" area={60} height={25} />}
        {currentZone === 'hub' && isNight && <FireflyParticles count={35} />}

        {/* Zone-specific particles */}
        {currentZone.includes('forest') && <AmbientParticles count={35} color="#90EE90" area={35} height={10} />}
{currentZone === 'frozen_peaks' && <AmbientParticles count={25} color="#E0FFFF" area={25} height={5} />}
          {currentZone === 'lava_caverns' && <AmbientParticles count={20} color="#FF6B35" area={20} height={8} />}
          {currentZone === 'crystal_highlands' && <AmbientParticles count={30} color="#00FFFF" area={30} height={12} />}
          {currentZone === 'void_nexus' && <FireflyParticles count={30} />}
          {currentZone === 'dragon_lair' && <AmbientParticles count={25} color="#FF4500" area={25} height={10} />}
          {currentZone === 'enchanted_forest' && <AmbientParticles count={40} color="#7CFC00" area={35} height={15} />}
          {currentZone === 'celestial_plains' && <AmbientParticles count={35} color="#FFD700" area={40} height={12} />}
          {currentZone === 'shadow_realm' && <FireflyParticles count={25} />}
        {currentZone === 'abyss' && <FireflyParticles count={30} />}
        {currentZone === 'coral_reef' && <AmbientParticles count={20} color="#40E0D0" area={25} height={5} />}
        {currentZone === 'floating_islands' && <AmbientParticles count={40} color="#E6E6FA" area={35} height={15} />}
        {currentZone === 'pvp_arena' && <AmbientParticles count={15} color="#FF6347" area={15} height={3} />}
        {currentZone === 'raid_dungeon' && <FireflyParticles count={40} />}
        {currentZone === 'arena_colosseum' && <AmbientParticles count={20} color="#FFD700" area={20} height={5} />}

        <ThirdPersonCamera />
        <Player />
        <BuffPet />
        <LaserBeam />
        <DamageNumbers />
        <GroundItems />
        <HitParticles />
        <LevelUpEffect />

        {/* Hub ground - no overlaps */}
        {currentZone === 'hub' && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
              <planeGeometry args={[80, 80]} />
              <meshStandardMaterial color="#3d5c3d" roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <circleGeometry args={[20, 24]} />
              <meshStandardMaterial color="#5a8a5a" roughness={0.8} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
              <circleGeometry args={[8, 16]} />
              <meshStandardMaterial color="#7CCD7C" roughness={0.7} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
              <circleGeometry args={[3, 12]} />
              <meshStandardMaterial color="#D2B48C" roughness={0.7} />
            </mesh>
            <HubBuildingsWithProps onOpenShop={handleOpenShop} onOpenGuild={handleOpenGuild} onOpenBank={handleOpenBank} onOpenPotionCraft={handleOpenPotionCraft} onOpenWeaponCraft={handleOpenWeaponCraft} onOpenPVPArena={handleOpenPVPArena} onOpenFriends={handleOpenFriends} onOpenEvents={handleOpenEvents} onOpenRaid={handleOpenRaid} />
            <NPCEntity name={blacksmithName} position={[-6, 0, 6]} color="#CD853F" />
            <NPCEntity name={merchantName} position={[6, 0, 6]} color="#4169E1" />
            <NPCEntity name={petMasterName} position={[-6, 0, -6]} color="#FF69B4" onClick={handleOpenPets} />
            <NPCEntity name={rebirthAltarName} position={[6, 0, -6]} color="#FFD700" />
            <LeaderboardBoard />
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
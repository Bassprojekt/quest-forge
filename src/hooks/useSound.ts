// Procedural sound effects using Web Audio API
import { useSettingsStore } from '@/store/settingsStore';

let audioCtx: AudioContext | undefined = undefined;

const getAudioContext = (): AudioContext | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    if (!audioCtx) {
      audioCtx = window.AudioContext ? new window.AudioContext() : (window as { webkitAudioContext?: () => AudioContext }).webkitAudioContext?.() ?? undefined;
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return undefined;
  }
};

function ensureCtx() {
  try {
    if (!audioCtx) {
      audioCtx = window.AudioContext ? new window.AudioContext() : (window as { webkitAudioContext?: () => AudioContext }).webkitAudioContext?.() ?? undefined;
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn('Audio context error:', e);
    return undefined;
  }
}

export function initAudio() {
  const ctx = ensureCtx();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

function getVolumeMultiplier(): number {
  return useSettingsStore.getState().volume / 100;
}

function getFxVolumeMultiplier(): number {
  return useSettingsStore.getState().fxVolume / 100;
}

// Background music player
let bgMusic: HTMLAudioElement | null = null;
let musicInitialized = false;
let currentTrackIndex = 0;

const ambientTracks = [
  '/Sounds/mp3/Ambient 1 Loop.mp3',
  '/Sounds/mp3/Ambient 2 Loop.mp3',
  '/Sounds/mp3/Ambient 3 Loop.mp3',
  '/Sounds/mp3/Ambient 4 Loop.mp3',
  '/Sounds/mp3/Ambient 5 Loop.mp3',
  '/Sounds/mp3/Ambient 6 Loop.mp3',
  '/Sounds/mp3/Ambient 7 Loop.mp3',
  '/Sounds/mp3/Ambient 8 Loop.mp3',
  '/Sounds/mp3/Ambient 9 Loop.mp3',
  '/Sounds/mp3/Ambient 10 Loop.mp3',
];

function getMusicVolume(): number {
  return useSettingsStore.getState().volume / 100;
}

export function startBackgroundMusic() {
  if (musicInitialized) return;
  musicInitialized = true;
  
  function playNext() {
    if (!bgMusic) {
      bgMusic = new Audio();
    }
    
    const vol = getMusicVolume();
    if (vol === 0) {
      setTimeout(playNext, 1000);
      return;
    }
    
    bgMusic.src = ambientTracks[currentTrackIndex];
    bgMusic.volume = vol;
    bgMusic.loop = false;
    
    bgMusic.play().then(() => {
      console.log('🎵 Now playing:', ambientTracks[currentTrackIndex]);
    }).catch(() => {});
    
    bgMusic.onended = () => {
      currentTrackIndex = (currentTrackIndex + 1) % ambientTracks.length;
      playNext();
    };
  }
  
  playNext();
}

export function stopBackgroundMusic() {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }
  musicInitialized = false;
}

export function updateMusicVolume() {
  if (bgMusic) {
    bgMusic.volume = getMusicVolume();
  }
}

const ZONE_MUSIC_NOTES: Record<string, number[]> = {
  hub: [261.63, 329.63, 392.00],
  grasslands: [293.66, 369.99, 440.00],
  mushroom_forest: [246.94, 311.13, 369.99],
  frozen_peaks: [277.18, 349.23, 415.30],
  lava_caverns: [220.00, 277.18, 329.63],
  coral_reef: [329.63, 415.30, 493.88],
  shadow_swamp: [196.00, 246.94, 293.66],
  crystal_highlands: [349.23, 440.00, 523.25],
  void_nexus: [185.00, 233.08, 277.18],
};

export function stopAllMusic() {
  // Music disabled - cleanup
}

export function playZoneMusic(_zone: string) {
  // Music disabled - can be re-enabled later
}

export function stopZoneMusic() {
  // Music disabled
}

// Footstep sound
export function playFootstep() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
  gain.gain.setValueAtTime(0.05 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

// UI click sound
export function playUIClick() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.setValueAtTime(600, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// Heal/Pickup sound
export function playPickup() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.05 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

// Mob-specific sounds
export function playZombieSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.setValueAtTime(60, ctx.currentTime + 0.15);
  osc.frequency.setValueAtTime(80, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.06 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

export function playSlimeSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.05 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playSkeletonSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const noiseSize = ctx.sampleRate * 0.15;
  const noiseBuf = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseSize * 0.3));
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.15);
}

export function playGhostSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.03 * vol, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12 * vol, ctx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

export function playSpiderSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
  osc.frequency.setValueAtTime(100, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playGoblinSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.05 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playOrcSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.18 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playDragonSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.2 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
  // Secondary roar
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
  osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
  gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
  gain2.gain.linearRampToValueAtTime(0.06 * vol, ctx.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.1);
  osc2.stop(ctx.currentTime + 0.5);
}

export function playEnemyAttackSound(mobType: string) {
  switch (mobType.toLowerCase()) {
    case 'zombie':
      playZombieSound();
      break;
    case 'slime':
      playSlimeSound();
      break;
    case 'skeleton':
      playSkeletonSound();
      break;
    case 'ghost':
      playGhostSound();
      break;
    case 'spider':
      playSpiderSound();
      break;
    case 'goblin':
      playGoblinSound();
      break;
    case 'orc':
      playOrcSound();
      break;
    case 'dragon':
      playDragonSound();
      break;
    default:
      break;
  }
}

export function playZoneChangeSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

export function playQuestCompleteSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.04 * vol, ctx.currentTime + i * 0.1 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.3);
  });
}

export function playErrorSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

// Desert mob sounds
export function playDesertSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.05 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playSnakeSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playScorpionSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.setValueAtTime(200, ctx.currentTime + 0.08);
  osc.frequency.setValueAtTime(150, ctx.currentTime + 0.16);
  gain.gain.setValueAtTime(0.05 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playDeathSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  // Heavy thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
  // Crack sound
  const noise = ctx.createBufferSource();
  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
  noise.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  noise.connect(ng).connect(ctx.destination);
  noise.start();
}

export function playBossSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  // Deep rumble
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(60, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.15 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
  // Thunder crack
  const noise = ctx.createBufferSource();
  const bufSize = ctx.sampleRate * 0.3;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.1));
  noise.buffer = buf;
  const ng = ctx.createGain();
  const nf = ctx.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.value = 1000;
  ng.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  noise.connect(nf).connect(ng).connect(ctx.destination);
  noise.start();
}

export function playTeleportSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const notes = [400, 500, 600, 800];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.04 * vol, ctx.currentTime + i * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.15);
  });
}

export function playGoldPickup() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.03 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

let arrowAudio: HTMLAudioElement | null = null;
export function playArrowMp3() {
  ensureCtx();
  const vol = getFxVolumeMultiplier();
  if (vol === 0) return;
  try {
    if (!arrowAudio) {
      arrowAudio = new Audio('/Sounds/ARROW SOUND EFFECT.mp3');
    }
    arrowAudio.volume = 0.5;
    arrowAudio.currentTime = 0;
    arrowAudio.play().catch(() => {});
  } catch (e) {
    console.log('Audio play failed:', e);
  }
}

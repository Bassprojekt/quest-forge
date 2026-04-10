// Procedural sound effects using Web Audio API
import { useSettingsStore } from '@/store/settingsStore';

type AudioContextType = AudioContext | undefined;

const getAudioContext = (): AudioContextType => {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext ? new window.AudioContext() : (window as { webkitAudioContext?: () => AudioContext }).webkitAudioContext?.() ?? undefined;
};

const audioCtx = getAudioContext();

function ensureCtx() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function getVolumeMultiplier(): number {
  return useSettingsStore.getState().volume / 100;
}

export function playSwordSlash() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.15 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
  // Noise burst
  const bufSize = ctx.sampleRate * 0.1;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.12 * vol, ctx.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  noise.connect(ng).connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + 0.1);
}

export function playMagicCast() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.12 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

export function playArrowShoot() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2));
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  // Twang
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
  og.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
  og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(og).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playLevelUp() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.12 * vol, ctx.currentTime + i * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.4);
  });
}

export function playPortalSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.0);
  gain.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12 * vol, ctx.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.0);
}

export function playPotionDrink() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 300 + i * 80;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.06 * vol, ctx.currentTime + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.1);
  }
}

export function playHitSound() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// Ambient zone music - simple looping pads
let currentMusic: { osc: OscillatorNode; gain: GainNode; interval: ReturnType<typeof setInterval> } | null = null;

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

export function playZoneMusic(zone: string) {
  stopZoneMusic();
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const notes = ZONE_MUSIC_NOTES[zone] || ZONE_MUSIC_NOTES.hub;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = notes[0];
  gain.gain.value = 0.03 * vol;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  // Slow arpeggio
  let noteIdx = 0;
  const interval = setInterval(() => {
    noteIdx = (noteIdx + 1) % notes.length;
    osc.frequency.exponentialRampToValueAtTime(notes[noteIdx], ctx.currentTime + 0.5);
  }, 2000);
  currentMusic = { osc, gain, interval };
}

export function stopZoneMusic() {
  if (currentMusic) {
    clearInterval(currentMusic.interval);
    try { currentMusic.osc.stop(); } catch { /* ignore if already stopped */ }
    currentMusic = null;
  }
}

// Footstep sound
export function playFootstep() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
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
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.setValueAtTime(600, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.1 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// Heal/Pickup sound
export function playPickup() {
  const ctx = ensureCtx();
  if (!ctx) return;
  const vol = getVolumeMultiplier();
  if (vol === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.12 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';

let bgMusic: HTMLAudioElement | null = null;
let currentTrackIndex = 0;
let musicStarted = false;
let volumeCheckInterval: ReturnType<typeof setInterval> | null = null;

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

function getVolume(): number {
  return useSettingsStore.getState().volume || 10;
}

function checkAndUpdateVolume() {
  const volRaw = useSettingsStore.getState().volume;
  const vol = volRaw !== undefined ? volRaw : 10;
  
  if (vol <= 0) {
    if (bgMusic) {
      bgMusic.pause();
    }
    musicStarted = false;
  } else if (!musicStarted && vol > 0) {
    startBackgroundMusic();
  } else if (bgMusic) {
    bgMusic.volume = vol / 100;
  }
}

export function startBackgroundMusic() {
  const volRaw = useSettingsStore.getState().volume;
  const vol = volRaw !== undefined ? volRaw : 10;
  
  if (vol <= 0) {
    musicStarted = false;
    return;
  }
  
  musicStarted = true;
  
  if (bgMusic) {
    bgMusic.pause();
  }
  
  bgMusic = new Audio(ambientTracks[0]);
  bgMusic.volume = (vol || 10) / 100;
  bgMusic.loop = false;
  
  bgMusic.onended = () => {
    currentTrackIndex = (currentTrackIndex + 1) % ambientTracks.length;
    if (bgMusic && musicStarted) {
      bgMusic.src = ambientTracks[currentTrackIndex];
      bgMusic.play().catch(() => {});
    }
  };
  
  bgMusic.onerror = () => {};
  
  bgMusic.play().catch(() => {});
    
  if (!volumeCheckInterval) {
    volumeCheckInterval = setInterval(checkAndUpdateVolume, 500);
  }
}

export function stopBackgroundMusic() {
  musicStarted = false;
  if (volumeCheckInterval) {
    clearInterval(volumeCheckInterval);
    volumeCheckInterval = null;
  }
  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }
}

export function updateMusicVolume() {
  checkAndUpdateVolume();
}
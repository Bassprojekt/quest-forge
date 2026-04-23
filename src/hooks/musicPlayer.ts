import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';

let bgMusic: HTMLAudioElement | null = null;
let currentTrackIndex = 0;
let musicStarted = false;

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
  return (useSettingsStore.getState().volume || 10) / 100;
}

export function startBackgroundMusic() {
  const vol = getVolume();
  console.log('Starting music with volume:', vol);
  
  if (vol <= 0) {
    musicStarted = false;
    return;
  }
  
  if (bgMusic) {
    bgMusic.pause();
  }
  
  musicStarted = true;
  bgMusic = new Audio(ambientTracks[0]);
  bgMusic.volume = vol;
  bgMusic.loop = false;
  
  bgMusic.onended = () => {
    currentTrackIndex = (currentTrackIndex + 1) % ambientTracks.length;
    if (bgMusic && musicStarted) {
      bgMusic.src = ambientTracks[currentTrackIndex];
      bgMusic.play().catch(() => {});
    }
  };
  
  bgMusic.onerror = (e) => {
    console.log('Audio error:', e);
  };
  
  bgMusic.play()
    .then(() => console.log('Music playing!'))
    .catch((e) => console.log('Play failed:', e));
}

export function stopBackgroundMusic() {
  musicStarted = false;
  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }
}

export function updateMusicVolume() {
  const vol = getVolume();
  console.log('updateMusicVolume:', vol);
  
  if (vol <= 0) {
    stopBackgroundMusic();
  } else if (!bgMusic && musicStarted === false) {
    startBackgroundMusic();
  } else if (bgMusic) {
    bgMusic.volume = vol;
  }
}
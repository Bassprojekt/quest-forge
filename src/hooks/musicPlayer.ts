import { useSettingsStore } from '@/store/settingsStore';

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

function getVolume(): number {
  return (useSettingsStore.getState().volume || 2) / 100;
}

export function startBackgroundMusic() {
  if (musicInitialized) return;
  musicInitialized = true;
  
  function playNext() {
    if (!bgMusic) {
      bgMusic = new Audio();
    }
    
    const vol = getVolume();
    if (vol <= 0.01) {
      setTimeout(playNext, 1000);
      return;
    }
    
    bgMusic.src = ambientTracks[currentTrackIndex];
    bgMusic.volume = vol;
    bgMusic.loop = false;
    
    bgMusic.play().catch(() => {});
    
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
    bgMusic.volume = getVolume();
  }
}
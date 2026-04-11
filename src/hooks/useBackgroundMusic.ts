import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export const useBackgroundMusic = () => {
  const volume = useSettingsStore(s => s.volume);
  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioContext.current && gainNode.current) {
      gainNode.current.gain.value = volume / 100;
    }
  }, [volume]);

  const playTone = (freq: number, duration: number) => {
    if (!audioContext.current || !gainNode.current) return;
    
    const osc = audioContext.current.createOscillator();
    const gain = audioContext.current.createGain();
    
    osc.connect(gain);
    gain.connect(gainNode.current);
    
    osc.frequency.value = freq;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);
    
    osc.start();
    osc.stop(audioContext.current.currentTime + duration);
  };

  const playMelody = () => {
    if (!audioContext.current || !gainNode.current) return;
    
    const notes = [261.63, 293.66, 311.13, 349.23, 392.00, 349.23, 311.13, 293.66];
    const now = audioContext.current.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = audioContext.current!.createOscillator();
      const gain = audioContext.current!.createGain();
      
      osc.connect(gain);
      gain.connect(gainNode.current!);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, now + i * 0.5);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.5 + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.5 + 0.4);
      
      osc.start(now + i * 0.5);
      osc.stop(now + i * 0.5 + 0.5);
    });
  };

  const toggleMusic = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      gainNode.current = audioContext.current.createGain();
      gainNode.current.connect(audioContext.current.destination);
      gainNode.current.gain.value = volume / 100;
    }
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playMelody();
      
      const interval = setInterval(() => {
        if (isPlaying) playMelody();
      }, 4000);
      
      return () => clearInterval(interval);
    }
  };

  return { toggleMusic, isPlaying };
};
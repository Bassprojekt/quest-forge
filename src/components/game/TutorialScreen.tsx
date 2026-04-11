import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface Props {
  onComplete: () => void;
}

const TRANSLATIONS: Record<string, Array<{title: string; content: string; emoji: string}>> = {
  de: [
    { title: 'Willkommen in Quest Forge! 🗡️', content: 'Dies ist ein kurzes Tutorial. Du kannst jederzeit skippen.', emoji: '👋' },
    { title: 'Steuerung', content: 'WASD = Bewegen | Maus = Kamera | Linksklick = Angreifen', emoji: '⌨️' },
    { title: 'Fähigkeiten', content: 'Drücke Q, E oder Shift für Spezial-Fähigkeiten!', emoji: '⚡' },
    { title: 'Ziele', content: 'Besiege Monster, sammle Gold, kaufe Ausrüstung und steige auf!', emoji: '🎯' },
    { title: 'Los gehts!', content: 'Viel Spaß in Quest Forge! 🚀', emoji: '🎮' },
  ],
  en: [
    { title: 'Welcome to Quest Forge! 🗡️', content: 'This is a quick tutorial. You can skip anytime.', emoji: '👋' },
    { title: 'Controls', content: 'WASD = Move | Mouse = Camera | Left Click = Attack', emoji: '⌨️' },
    { title: 'Abilities', content: 'Press Q, E or Shift for Special Abilities!', emoji: '⚡' },
    { title: 'Goals', content: 'Defeat monsters, collect gold, buy gear and level up!', emoji: '🎯' },
    { title: 'Let\'s go!', content: 'Have fun in Quest Forge! 🚀', emoji: '🎮' },
  ],
};

export const TutorialScreen = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const language = useSettingsStore(s => s.language);
  
  const lang = (language === 'es' || language === 'fr') ? language : 'de';
  const tutorialSteps = TRANSLATIONS[lang] || TRANSLATIONS.de;

  const current = tutorialSteps[step];
  const progress = ((step + 1) / tutorialSteps.length) * 100;

  const next = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md border-4 border-amber-400 rounded-3xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{current.emoji}</div>
          <h1 className="text-2xl font-bold text-amber-800 mb-2">{current.title}</h1>
          <p className="text-gray-600">{current.content}</p>
        </div>

        <div className="h-2 bg-gray-200 rounded-full mb-4">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={skip}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold rounded-xl"
          >
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
          >
            {step < tutorialSteps.length - 1 ? 'Weiter →' : 'Start! 🎮'}
          </button>
        </div>
      </div>
    </div>
  );
};
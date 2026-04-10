import { useState } from 'react';
import { useGameStore, PlayerClass } from '@/store/gameStore';
import { hasSaveData, loadGame } from '@/store/saveStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';

const CLASS_INFO: { id: PlayerClass; nameKey: 'warrior' | 'mage' | 'archer'; icon: string; descKey: string; color: string }[] = [
  { id: 'warrior', nameKey: 'warrior', icon: '⚔️', descKey: 'warrior_desc', color: '#E53935' },
  { id: 'mage', nameKey: 'mage', icon: '🔮', descKey: 'mage_desc', color: '#7B1FA2' },
  { id: 'archer', nameKey: 'archer', icon: '🏹', descKey: 'archer_desc', color: '#2E7D32' },
];

const CLASS_DESCS: Record<string, Record<string, string>> = {
  de: {
    warrior_desc: 'Nahkampf-Spezialist mit hohem Schaden und Verteidigung',
    mage_desc: 'Mächtiger Fernkampf-Zauberer mit AoE-Skills',
    archer_desc: 'Schneller Fernkämpfer mit Kritischen Treffern',
  },
  en: {
    warrior_desc: 'Melee specialist with high damage and defense',
    mage_desc: 'Powerful ranged wizard with AoE skills',
    archer_desc: 'Fast ranged fighter with critical hits',
  },
};

export const ClassSelect = () => {
  const setClass = useGameStore(s => s.setPlayerClass);
  const [showNew, setShowNew] = useState(!hasSaveData());
  const hasSave = hasSaveData();
  const language = useSettingsStore(s => s.language);
  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language][key];

  const handleLoad = () => {
    loadGame();
  };

  if (!showNew && hasSave) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a15 100%)', fontFamily: "'Fredoka', sans-serif" }}>
        <div className="text-center">
          <h1 className="text-4xl font-black mb-2" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            ⚔️ MMORPG Adventure
          </h1>
          <p className="text-[#8888AA] text-sm mb-8">{language === 'de' ? 'Spielstand gefunden!' : 'Save found!'}</p>
          <div className="flex flex-col gap-3 items-center">
            <button onClick={handleLoad}
              className="w-64 px-6 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: 'white', boxShadow: '0 4px 20px rgba(76,175,80,0.4)' }}>
              ▶️ {language === 'de' ? 'Weiterspielen' : 'Continue'}
            </button>
            <button onClick={() => setShowNew(true)}
              className="w-64 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FF980020, #FF572220)', color: '#FF9800', border: '2px solid #FF980040' }}>
              🆕 {language === 'de' ? 'Neues Spiel' : 'New Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a15 100%)' }}>
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2" style={{
          color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.5)', fontFamily: "'Fredoka', sans-serif",
        }}>
          {t('selectClass')}
        </h1>
        <p className="text-[#8888AA] text-sm mb-8">{language === 'de' ? 'Jede Klasse hat einzigartige Skills und Waffen' : 'Each class has unique skills and weapons'}</p>
        <div className="flex gap-6">
          {CLASS_INFO.map(c => (
            <button key={c.id} onClick={() => setClass(c.id)}
              className="group w-48 p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${c.color}15, ${c.color}30)`,
                borderColor: `${c.color}40`,
                boxShadow: `0 0 30px ${c.color}10`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = c.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${c.color}40`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${c.color}40`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${c.color}10`;
              }}>
              <div className="text-5xl mb-3">{c.icon}</div>
              <div className="text-xl font-bold mb-2" style={{ color: c.color }}>{t(c.nameKey)}</div>
              <div className="text-[#8888AA] text-xs leading-relaxed">{CLASS_DESCS[language][c.descKey]}</div>
            </button>
          ))}
        </div>
        {hasSave && (
          <button onClick={() => setShowNew(false)}
            className="mt-6 text-[#8888AA] text-sm underline hover:text-white transition-colors">
            ← {language === 'de' ? 'Zurück zum Ladebildschirm' : 'Back to load screen'}
          </button>
        )}
      </div>
    </div>
  );
};

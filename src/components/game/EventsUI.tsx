import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

interface Props {
  onClose: () => void;
}

interface Event {
  id: string;
  name: string;
  description: string;
  bonus: string;
  active: boolean;
  expiresAt: number;
}

export const EventsUI = ({ onClose }: Props) => {
  const addGold = useGameStore(s => s.addGold);
  const [activeEvents, setActiveEvents] = useState<Event[]>([
    { id: 'gold-rush', name: 'Gold-Rausch', description: 'Alle Gegner droppen 50% mehr Gold!', bonus: '+50% Gold', active: true, expiresAt: Date.now() + 3600000 },
    { id: 'double-xp', name: 'Doppel-XP', description: 'Erhalte doppelte Erfahrung!', bonus: '+100% XP', active: true, expiresAt: Date.now() + 7200000 },
    { id: 'rare-drop', name: 'Seltene Drops', description: 'Höhere Chance auf epische Items!', bonus: '+25% Rare', active: false, expiresAt: 0 },
  ]);

  const claimReward = (event: Event) => {
    if (event.id === 'gold-rush') addGold(100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-events-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gradient-to-b from-orange-900 to-black/90 border-2 border-orange-500 rounded-2xl p-6 max-w-md w-full mx-4"
        style={{ boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-orange-500 font-bold text-xl">🎉 Events</h2>
          <button onClick={onClose} className="text-orange-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-3">
          {activeEvents.map(event => (
            <div key={event.id}
              className={`bg-black/50 rounded-xl p-4 border-2 ${event.active ? 'border-green-500' : 'border-gray-700'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold">{event.name}</span>
                    {event.active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">
                        AKTIV
                      </span>
                    )}
                  </div>
                  <div className="text-gray-300 text-sm mt-1">{event.description}</div>
                  <div className="text-yellow-400 text-xs mt-1">{event.bonus}</div>
                </div>
                {event.active && (
                  <button onClick={() => claimReward(event)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-500">
                    CLAIM
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <div className="text-gray-400 text-xs">
            Neue Events erscheinen regelmäßig!
            <br />
            <span className="text-orange-400">Bleib dran!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useFriendsStore } from '@/store/friendsStore';
import { useAccountStore } from '@/store/accountStore';
import { useGameStore } from '@/store/gameStore';

interface Props {
  onClose: () => void;
}

const CLASS_ICONS: Record<string, string> = {
  warrior: '⚔️',
  mage: '🔮',
  archer: '🏹',
};

export const FriendsUI = ({ onClose }: Props) => {
  const friends = useFriendsStore(s => s.friends);
  const addFriend = useFriendsStore(s => s.addFriend);
  const removeFriend = useFriendsStore(s => s.removeFriend);
  const currentUser = useAccountStore(s => s.currentUser);
  const playerLevel = useGameStore(s => s.playerLevel);
  const playerClass = useGameStore(s => s.playerClass);
  
  const [newFriend, setNewFriend] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newFriend.trim() || newFriend.length < 2) return;
    addFriend(newFriend.trim(), 1, ' warrior');
    setNewFriend('');
    setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-friends-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#4169E1] rounded-2xl p-6 max-w-sm w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#4169E1] font-bold text-lg">👥 Freunde</h2>
          <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">{friends.length} Freunde</span>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-[#4169E1] text-white hover:bg-[#3558C0]">
            + HINZUFÜGEN
          </button>
        </div>

        {showAdd && (
          <div className="flex gap-2 mb-3">
            <input value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              placeholder="Spielername"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-600">
              ✓
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {friends.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              Noch keine Freunde 😢
              <br />
              <span className="text-xs">Füge Spieler hinzu, um sie zu verfolgen!</span>
            </div>
          )}
          {friends.map((friend, i) => (
            <div key={i} className="bg-[#F8F6F0] rounded-xl p-3 border border-[#E0D5C0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#4169E1]/20 flex items-center justify-center text-lg">
                  {CLASS_ICONS[friend.class] || '🎮'}
                </div>
                <div>
                  <div className="text-[#333] text-sm font-bold">{friend.name}</div>
                  <div className="text-[#888] text-[10px]">Level {friend.level} • {friend.class}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <button onClick={() => removeFriend(friend.name)}
                  className="text-red-400 hover:text-red-600 text-lg">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-400">
            Dein Name: <span className="font-bold">{currentUser || 'Spieler'}</span>
            <br />
            Teile deinen Namen mit Freunden!
          </div>
        </div>
      </div>
    </div>
  );
};
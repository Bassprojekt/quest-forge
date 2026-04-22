import { useState, useEffect } from 'react';
import { useAccountStore } from '@/store/accountStore';
import { useGameStore } from '@/store/gameStore';
import { deleteSave } from '@/store/saveStore';
import { useSkillTreeStore } from '@/store/skillTreeStore';
import { initAudio, stopAllMusic } from '@/hooks/useSound';

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saveLogin, setSaveLogin] = useState(false);
  const [error, setError] = useState('');

  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showCharCreate, setShowCharCreate] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState<'warrior' | 'mage' | 'archer'>('warrior');

  const [selectedChannel, setSelectedChannel] = useState<number>(1);

  const register = useAccountStore(s => s.register);
  const login = useAccountStore(s => s.login);
  const logout = useAccountStore(s => s.logout);
  const users = useAccountStore(s => s.users);
  const currentUser = useAccountStore(s => s.currentUser);
  
  const createCharacter = useAccountStore(s => s.createCharacter);
  const selectCharacter = useAccountStore(s => s.selectCharacter);
  const currentCharacterSlot = useAccountStore(s => s.currentCharacterSlot);
  const resetCharacters = useAccountStore(s => s.resetCharacters);

  const setPlayerClass = useGameStore(s => s.setPlayerClass);

  const user = users.find(u => u.username === currentUser);
  const characters = user?.characters || [];
  const selectedChar = characters[currentCharacterSlot];

  useEffect(() => {
    const savedUser = localStorage.getItem('qf_username');
    const savedPass = localStorage.getItem('qf_password');
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setSaveLogin(true);
    }
  }, []);

  const getClassIcon = (c: string | null | undefined) => {
    if (c === 'warrior') return 'W';
    if (c === 'mage') return 'M';
    if (c === 'archer') return 'A';
    return '+';
  };
  
  const getClassColor = (c: string) => {
    if (c === 'warrior') return 'bg-red-500';
    if (c === 'mage') return 'bg-purple-500';
    if (c === 'archer') return 'bg-green-500';
    return 'bg-gray-400';
  };

  const handleLogin = async () => {
    initAudio();
    if (!username || !password) {
      setError('Please enter account and password');
      return;
    }

    if (isRegister) {
      if (username.length < 3) {
        setError('At least 3 characters');
        return;
      }
      if (password.length < 4) {
        setError('Password at least 4 characters');
        return;
      }
      const success = await register(username, password);
      if (success) {
        if (saveLogin) {
          localStorage.setItem('qf_username', username);
          localStorage.setItem('qf_password', password);
        }
        await login(username, password);
        setShowCharSelect(true);
      } else {
        setError('Account already exists');
      }
    } else {
      const success = await login(username, password);
      if (success) {
        if (saveLogin) {
          localStorage.setItem('qf_username', username);
          localStorage.setItem('qf_password', password);
        } else {
          localStorage.removeItem('qf_username');
          localStorage.removeItem('qf_password');
        }
        setShowCharSelect(true);
      } else {
        setError('Invalid account or password');
      }
    }
  };

  const handleCharSlotClick = (slot: number) => {
    if (characters[slot]) {
      selectCharacter(slot);
    } else {
      setShowCharCreate(true);
    }
  };

  const handleCharCreate = () => {
    if (!newCharName || newCharName.length < 2) {
      setError('Name at least 2 characters');
      return;
    }
    const classToCreate = newCharClass;
    const success = createCharacter(newCharName, classToCreate);
    if (success) {
      setShowCharCreate(false);
      setNewCharName('');
    } else {
      setError('All 3 slots taken');
    }
  };

  const handleStartGame = () => {
    if (selectedChar?.class) {
      setPlayerClass(selectedChar.class, false);
    }
    onLogin();
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md border-4 border-amber-400 rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-amber-800 mb-2">Quest Forge</h1>
            <p className="text-gray-500 text-sm">MMORPG Adventure</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Account"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-center"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-center"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-amber-700 cursor-pointer">
              <input
                type="checkbox"
                checked={saveLogin}
                onChange={e => setSaveLogin(e.target.checked)}
                className="w-4 h-4"
              />
              Save
            </label>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl">
                {error}
              </div>
            )}

            <button onClick={handleLogin} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
              Login
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-amber-600 text-sm hover:underline"
            >
              {isRegister ? 'Already have an account? Login' : 'No account? Register'}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            Local Account
          </div>
        </div>
      </div>
    );
  }

  if (showCharSelect) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md border-4 border-amber-400 rounded-3xl p-6 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-800">Select Character</h1>
            <p className="text-gray-500 text-sm">Account: {currentUser}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[0, 1, 2].map(slot => (
              <div
                key={slot}
                onClick={() => handleCharSlotClick(slot)}
                className={`
                  h-32 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${currentCharacterSlot === slot 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                    : characters[slot] 
                      ? 'border-amber-400 bg-amber-50 hover:bg-amber-100' 
                      : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'}
                `}
              >
                {characters[slot] ? (
                  <>
                    <span className="text-2xl font-bold mb-1">{getClassIcon(characters[slot].class)}</span>
                    <span className="font-bold text-sm text-gray-700">{characters[slot].name}</span>
                    <span className="text-xs text-gray-500">Lv {characters[slot].level}</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl text-gray-300">+</span>
                    <span className="text-xs text-gray-400">Empty</span>
                  </>
                )}
              </div>
            ))}
          </div>

          {showCharCreate && (
            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <input
                type="text"
                placeholder="Character Name"
                value={newCharName}
                onChange={e => setNewCharName(e.target.value.slice(0, 12))}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 mb-3"
                maxLength={12}
              />
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(['warrior', 'mage', 'archer'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setNewCharClass(c); 
                    }}
                    className={`
                      py-2 rounded-lg font-bold text-sm transition-all
                      ${newCharClass === c 
                        ? `${getClassColor(c)} text-white` 
                        : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    {getClassIcon(c)} {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCharCreate}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCharCreate(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl mb-3">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleStartGame}
              disabled={!selectedChar}
              className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                selectedChar
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all characters, skills and save?')) {
                  resetCharacters();
                  deleteSave();
                  useSkillTreeStore.getState().resetTreeFully();
                }
              }}
              className="px-4 py-3 text-red-500 hover:text-red-700 text-sm"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 border-t pt-4">
            <h2 className="text-lg font-bold text-amber-700 mb-3">Select Server</h2>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 mb-3">
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(ch => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedChannel === ch
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Ch {ch}
                    {ch === 4 && <span className="block text-xs">(PK)</span>}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-gray-500">
              Yggdrasil - Channel {selectedChannel} {selectedChannel === 4 && '(PvP)'}
            </p>
          </div>

          <button
            onClick={() => { stopAllMusic(); logout(); setShowCharSelect(false); }}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm mt-4"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (currentUser) {
    if (!showCharSelect) {
      setShowCharSelect(true);
    }
  }

  return null;
};

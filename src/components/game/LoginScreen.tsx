import { useState } from 'react';
import { useAccountStore } from '@/store/accountStore';

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const register = useAccountStore(s => s.register);
  const login = useAccountStore(s => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Bitte alles ausfüllen');
      return;
    }

    if (isRegister) {
      if (username.length < 3) {
        setError('Mindestens 3 Zeichen');
        return;
      }
      if (password.length < 4) {
        setError('Passwort mindestens 4 Zeichen');
        return;
      }
      const success = register(username, password);
      if (success) {
        login(username, password);
        onLogin();
      } else {
        setError('Username schon vergeben');
      }
    } else {
      const success = login(username, password);
      if (success) {
        onLogin();
      } else {
        setError('Falsches Passwort oder nicht gefunden');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md border-4 border-amber-400 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">⚔️ Quest Forge</h1>
          <p className="text-gray-500 text-sm">MMORPG Adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-center"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-center"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
            {isRegister ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-amber-600 text-sm hover:underline"
          >
            {isRegister ? 'Schon Account? Hier anmelden' : 'Noch kein Account? Hier registrieren'}
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          ⚠️ Lokaler Account (nicht sicher für echte Passwörter)
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';
import { useAccountStore } from '@/store/accountStore';
import { updateMusicVolume } from '@/hooks/musicPlayer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Settings, Globe, ChevronDown, Volume2, VolumeX } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenHelp: () => void;
  onLogout: () => void;
}

export const SettingsDialog = ({ open, onOpenChange, onOpenHelp, onLogout }: SettingsDialogProps) => {
  const { volume, fxVolume, language, setVolume, setFxVolume, setLanguage } = useSettingsStore();
  const [localVolume, setLocalVolume] = useState(volume);
  const [localFxVolume, setLocalFxVolume] = useState(fxVolume);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const resetGame = useGameStore(s => s.resetGame);
  const logout = useAccountStore(s => s.logout);

  useEffect(() => {
    setLocalVolume(volume);
    setLocalFxVolume(fxVolume);
  }, [volume, fxVolume, open]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setLocalVolume(newVolume);
    setVolume(newVolume);
    updateMusicVolume();
  };

  const handleFxVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setLocalFxVolume(newVolume);
    setFxVolume(newVolume);
  };

  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language][key];

  const languages = [
    { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2" title="Wähle die Sprache des Spiels">
              <Globe className="h-4 w-4" />
              {t('language')}
            </label>
            
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-full p-3 rounded-lg border-2 border-gray-600 bg-gray-800 hover:border-gray-500 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{currentLang.flag}</span>
                  <span className="text-sm font-medium">{currentLang.label}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {langDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden z-10">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full p-3 flex items-center gap-2 hover:bg-gray-700 transition-colors ${
                        language === lang.code ? 'bg-gray-700' : ''
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2" title="Musik-Lautstärke einstellen">
              <Volume2 className="h-4 w-4" />
              {t('music')}
            </label>
            <div className="flex items-center gap-3">
              <Slider
                value={[localVolume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded min-w-[50px] text-center">
                {localVolume}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2" title="Soundeffekte-Lautstärke einstellen">
              {localFxVolume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {t('soundEffects')}
            </label>
            <div className="flex items-center gap-3">
              <Slider
                value={[localFxVolume]}
                onValueChange={handleFxVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded min-w-[50px] text-center">
                {localFxVolume}%
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Spiel zurücksetzen? Alle Fortschritte gehen verloren!')) {
                resetGame();
                onOpenChange(false);
              }
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
          >
            Spiel zurücksetzen
          </button>

          <button
            onClick={() => onOpenHelp?.()}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Hilfe & Steuerung
          </button>

          <button
            onClick={() => {
              logout();
              onOpenChange(false);
              onLogout?.();
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            Abmelden
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGameStore, ZONES } from '@/store/gameStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';
import { MapPin, Lock, Star, Zap } from 'lucide-react';

interface TeleportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeleportDialog = ({ open, onOpenChange }: TeleportDialogProps) => {
  const playerLevel = useGameStore(s => s.playerLevel);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const setCurrentZone = useGameStore(s => s.setCurrentZone);
  const playerGold = useGameStore(s => s.playerGold);
  const addGold = useGameStore(s => s.addGold);
  const language = useSettingsStore(s => s.language);

  const TELEPORT_COST = 10;

  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language][key];

  const handleTeleport = (zoneId: string) => {
    if (playerGold >= TELEPORT_COST) {
      const zone = ZONES.find(z => z.id === zoneId);
      if (zone) {
        addGold(-TELEPORT_COST);
        setCurrentZone(zoneId as 'hub' | 'grasslands' | 'mushroom_forest' | 'frozen_peaks' | 'lava_caverns' | 'coral_reef' | 'shadow_swamp' | 'crystal_highlands' | 'void_nexus');
        setPlayerPosition([zone.center[0], 0, zone.center[1]]);
        onOpenChange(false);
      }
    }
  };

  const zoneNames: Record<string, Record<string, string>> = {
    de: {
      grasslands: 'Grüne Wiesen',
      mushroom_forest: 'Pilzwald',
      frozen_peaks: 'Frostgipfel',
      lava_caverns: 'Lavahöhlen',
      coral_reef: 'Korallenriff',
      shadow_swamp: 'Schattensumpf',
      crystal_highlands: 'Kristallhochland',
      void_nexus: 'Void Nexus',
    },
    en: {
      grasslands: 'Green Meadows',
      mushroom_forest: 'Mushroom Forest',
      frozen_peaks: 'Frozen Peaks',
      lava_caverns: 'Lava Caverns',
      coral_reef: 'Coral Reef',
      shadow_swamp: 'Shadow Swamp',
      crystal_highlands: 'Crystal Highlands',
      void_nexus: 'Void Nexus',
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {t('teleport')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
            <span className="text-sm text-muted-foreground">{t('teleportCost')}</span>
            <span className="font-bold text-yellow-500 flex items-center gap-1">
              <Zap className="h-4 w-4" /> {TELEPORT_COST} Gold
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {ZONES.map((zone) => {
              const isUnlocked = playerLevel >= zone.requiredLevel;
              const canAfford = playerGold >= TELEPORT_COST;
              const zoneName = zoneNames[language][zone.id] || zone.name;
              
              return (
                <button
                  key={zone.id}
                  onClick={() => isUnlocked && canAfford && handleTeleport(zone.id)}
                  disabled={!isUnlocked || !canAfford}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all
                    ${isUnlocked 
                      ? 'hover:scale-105 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                    }
                    ${isUnlocked 
                      ? 'border-' + zone.color.replace('#', '') 
                      : 'border-gray-600 bg-gray-800'
                    }
                  `}
                  style={{
                    backgroundColor: isUnlocked ? `${zone.color}20` : undefined,
                    borderColor: isUnlocked ? zone.color : undefined,
                  }}
                >
                  {isUnlocked && (
                    <div 
                      className="absolute inset-0 rounded-lg opacity-10"
                      style={{ backgroundColor: zone.color }}
                    />
                  )}
                  
                  <div className="relative flex flex-col items-center gap-1">
                    <MapPin 
                      className="h-5 w-5" 
                      style={{ color: isUnlocked ? zone.color : '#666' }}
                    />
                    <span 
                      className="text-xs font-medium text-center"
                      style={{ color: isUnlocked ? zone.color : '#666' }}
                    >
                      {zoneName}
                    </span>
                    
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>{t('level')} {zone.requiredLevel}</span>
                    </div>
                    
                    {!isUnlocked && (
                      <div className="absolute -top-1 -right-1">
                        <Lock className="h-3 w-3 text-red-500" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {playerGold < TELEPORT_COST && (
            <p className="text-xs text-red-500 text-center">
              {t('notEnoughGold')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from 'react';
import { useGameStore, ZONES } from '@/store/gameStore';
import { useQuestStore } from '@/store/questStore';
import { useSkillTreeStore } from '@/store/skillTreeStore';
import { useSettingsStore, TRANSLATIONS } from '@/store/settingsStore';
import { QuestUI } from './QuestUI';
import { ShopUI } from './ShopUI';
import { InventoryUI } from './InventoryUI';
import { SkillTreeUI } from './SkillTreeUI';
import { SettingsDialog } from './SettingsDialog';
import { HelpUI } from './HelpUI';
import { exportSaveToFile } from '@/store/saveStore';

export const HUD = () => {
  const hp = useGameStore(s => s.playerHp);
  const maxHp = useGameStore(s => s.playerMaxHp);
  const hpPercent = (hp / maxHp) * 100;
  const mana = useGameStore(s => s.playerMana);
  const maxMana = useGameStore(s => s.playerMaxMana);
  const manaPercent = (mana / maxMana) * 100;
  const xp = useGameStore(s => s.playerXp);
  const xpToLevel = useGameStore(s => s.playerXpToLevel);
  const xpPercent = (xp / xpToLevel) * 100;
  const level = useGameStore(s => s.playerLevel);
  const now = performance.now() / 1000;
  const attackPower = useGameStore(s => s.playerAttackPower);
  const defense = useGameStore(s => s.playerDefense);
  const gold = useGameStore(s => s.playerGold);
  const enemies = useGameStore(s => s.enemies);
  const respawnEnemies = useGameStore(s => s.respawnEnemies);
  const respawnPlayer = useGameStore(s => s.respawnPlayer);
  const skills = useGameStore(s => s.skills);
  const currentZone = useGameStore(s => s.currentZone);
  const playerPos = useGameStore(s => s.playerPosition);
  const zoneFromPos = currentZone;
  const setCurrentZone = useGameStore(s => s.setCurrentZone);
  const quests = useQuestStore(s => s.quests);
  const activeQuests = quests.filter(q => q.status === 'active' || q.status === 'completed');
  const equippedPet = useGameStore(s => s.pets).find(p => p.equipped);
  const inventory = useGameStore(s => s.inventory);
  const levelUpEffect = useGameStore(s => s.levelUpEffect);
  const skillPoints = useSkillTreeStore(s => s.skillPoints);
  const autoFight = useGameStore(s => s.autoFight);
  const setAutoFight = useGameStore(s => s.setAutoFight);
  const autoRespawn = useGameStore(s => s.autoRespawn);
  const autoLoot = useGameStore(s => s.autoLoot);
  const setAutoRespawn = useGameStore(s => s.setAutoRespawn);
  const setAutoLoot = useGameStore(s => s.setAutoLoot);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const playerLevel = useGameStore(s => s.playerLevel);
  const comboCount = useGameStore(s => s.comboCount);
  const comboTimer = useGameStore(s => s.comboTimer);
  const totalKills = useGameStore(s => s.totalKills);
  const totalGoldEarned = useGameStore(s => s.totalGoldEarned);
  const totalDamageDealt = useGameStore(s => s.totalDamageDealt);

  const [showShop, setShowShop] = useState(false);
  const [shopTab, setShopTab] = useState<'items' | 'pets'>('items');
  const [showInventory, setShowInventory] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const language = useSettingsStore(s => s.language);
  const t = (key: keyof typeof TRANSLATIONS.de) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.de[key] || key;

  const zoneEnemies = enemies.filter(e => e.zone === zoneFromPos);
  const allDead = zoneFromPos !== 'hub' && zoneEnemies.every(e => !e.alive);

  useEffect(() => {
    if (allDead && autoFight && zoneFromPos !== 'hub') {
      const timer = setTimeout(() => {
        respawnEnemies();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allDead, autoFight, zoneFromPos]);

  const zoneFromPosInfo = ZONES.find(z => z.id === zoneFromPos);
  const potionCount = inventory.filter(i => i.type === 'potion').reduce((a, i) => a + i.quantity, 0);

  const handleExport = () => {
    if (exportSaveToFile()) {
      setSaveMsg('Exportiert! 📁');
      setTimeout(() => setSaveMsg(''), 2000);
    }
  };

  const showSaveIndicator = useGameStore(s => s.showSaveIndicator);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
    if (e.key === 'i' || e.key === 'I') setShowInventory(v => !v);
    if (e.key === 'k' || e.key === 'K') setShowSkillTree(v => !v);
  };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-Respawn: automatically trigger respawn when all enemies dead
  useEffect(() => {
    if (allDead && autoRespawn && zoneFromPos !== 'hub') {
      const timer = setTimeout(() => {
        respawnEnemies();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allDead, autoRespawn, zoneFromPos]);

  const playerClass = useGameStore(s => s.playerClass);
  const className = playerClass === 'warrior' ? '⚔️ ' + t('warrior') : playerClass === 'mage' ? '🔮 ' + t('mage') : '🏹 ' + t('archer');

  return (
    <div className="fixed inset-0 pointer-events-none z-50" style={{ fontFamily: "'Fredoka', sans-serif" }}>
      {showSettings && <SettingsDialog open={showSettings} onOpenChange={setShowSettings} onOpenHelp={() => { setShowSettings(false); setShowHelp(true); }} />}
      {showHelp && <HelpUI onClose={() => setShowHelp(false)} />}
      {/* {showShop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto">
          <div className="text-red-500 text-2xl font-bold">SHOP SHOULD SHOW HERE - showShop={String(showShop)} shopTab={shopTab}</div>
        </div>
      )} */}
      {showShop && <ShopUI onClose={() => setShowShop(false)} initialTab={shopTab} />}
      {showInventory && <InventoryUI onClose={() => setShowInventory(false)} />}
      {showSkillTree && <SkillTreeUI onClose={() => setShowSkillTree(false)} />}
      
      <QuestUI />
      
      {saveMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
          {saveMsg}
        </div>
      )}

      {levelUpEffect && (
        <div className="absolute inset-0 pointer-events-none animate-fade-in" style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)' }}>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
            <div className="text-4xl font-black text-yellow-400">⬆ {t('levelUp')} ⬆</div>
            <div className="text-xl font-bold mt-1 text-white">{t('level')} {level} — +2 {t('skillPointsAvailable')}</div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-2xl p-4 min-w-[240px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border-2 border-blue-600 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">{level}</span>
            </div>
            <div className="flex-1">
              <div className="text-gray-800 text-sm font-bold">{className}</div>
              <div className="text-gray-500 text-xs flex gap-3">
                <span>⚔️ {attackPower}</span>
                <span>🛡️ {defense}</span>
                <span>💰 {gold}</span>
              </div>
            </div>
          </div>

          {equippedPet && (
            <div className="mb-2 px-2 py-1 bg-pink-100 rounded-lg text-xs text-pink-600 font-semibold">
              🐾 {equippedPet.name} — {equippedPet.bonus}
            </div>
          )}

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-500 font-semibold">❤️ {t('hp')}</span>
              <span className="text-gray-500">{hp}/{maxHp}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-red-200">
              <div className="h-full rounded-full transition-all" style={{ width: `${hpPercent}%`, background: hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#F44336' }} />
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-500 font-semibold">💧 {t('mp')}</span>
              <span className="text-gray-500">{mana}/{maxMana}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-blue-200">
              <div className="h-full rounded-full" style={{ width: `${manaPercent}%`, background: 'linear-gradient(90deg, #42A5F5, #64B5F6)' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-orange-500 font-semibold">⭐ {t('xp')}</span>
              <span className="text-gray-500">{xp}/{xpToLevel}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-orange-200">
              <div className="h-full rounded-full" style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #FFB300, #FFC107)' }} />
            </div>
          </div>

          {skillPoints > 0 && (
            <button onClick={() => setShowSkillTree(true)} className="mt-2 w-full px-2 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-500 border border-orange-200 animate-pulse">
              ✨ {skillPoints} {t('skillPointsAvailable')}
            </button>
          )}
        </div>
      </div>

      {zoneFromPos !== 'hub' && zoneFromPosInfo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl px-4 py-2 text-center">
            <div className="text-gray-800 text-sm font-bold">{zoneFromPosInfo.name}</div>
            <div className="text-gray-500 text-xs">{t('requiredLevel')}{zoneFromPosInfo.requiredLevel}+</div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto z-[60]">
        {/* Mini-Map */}
        <div className="bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl p-2 w-32">
          <div className="text-[10px] text-gray-500 font-bold mb-1 text-center">🌍 {zoneFromPosInfo?.name || 'Hub'}</div>
          <div className="w-full h-24 bg-gray-800 rounded-lg relative overflow-hidden">
            {/* Player dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg" />
            {/* Zone center indicator */}
            <div className="absolute top-1/2 left-1/2 w-6 h-6 border-2 border-yellow-500/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
            {/* Direction indicator */}
            <div className="absolute top-2 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 -translate-x-1/2" />
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 mt-1">
            <span>X: {Math.round(playerPos[0])}</span>
            <span>Z: {Math.round(playerPos[2])}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl p-2 text-xs">
          <div className="text-orange-500 text-[10px] font-bold mb-1">📊 {t('stats') || 'Stats'}</div>
          <div className="text-gray-600 space-y-0.5">
            <div>Kills: <span className="font-bold text-gray-800">{enemies.filter(e => !e.alive).length}</span></div>
            <div>Zone: <span className="font-bold">{zoneFromPosInfo?.requiredLevel || 0}+</span></div>
            {comboCount > 0 && (
              <div className="text-orange-500 font-bold">🔥 Combo x{comboCount}</div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl flex items-center justify-center hover:bg-gray-100">
            <span className="text-lg">⚙️</span>
          </button>
          <button onClick={() => setShowAchievements(true)} className="w-10 h-10 bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl flex items-center justify-center hover:bg-gray-100">
            <span className="text-lg">🏆</span>
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="w-10 h-10 bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl flex items-center justify-center hover:bg-gray-100">
            <span className="text-lg">📈</span>
          </button>
        </div>
        {activeQuests.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-2xl p-3 min-w-[200px]">
            <div className="text-orange-500 text-xs font-bold mb-2">📋 {t('quests')}</div>
            {activeQuests.map(q => (
              <div key={q.id} className="mb-1.5 last:mb-0">
                <div className="text-gray-800 text-xs font-bold">{q.title}</div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 text-[9px]">{q.target}</div>
                  <span className={`text-[10px] font-bold ${q.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`}>{q.current}/{q.required}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 mt-0.5">
                  <div className="h-full rounded-full" style={{ width: `${(q.current / q.required) * 100}%`, background: q.status === 'completed' ? '#4CAF50' : '#2196F3' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-2xl px-3 py-2 flex items-center gap-2">
          {skills.map(skill => {
            const cd = Math.max(0, skill.cooldown - (now - skill.lastUsed));
            const onCooldown = cd > 0;
            return (
              <div key={skill.id} className="relative">
                <div className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center ${onCooldown ? 'border-gray-300 bg-gray-100 opacity-60' : 'border-blue-500 bg-blue-50 hover:bg-blue-100'}`}>
                  <span className="text-lg">{skill.icon}</span>
                  <span className="text-[8px] text-blue-500 font-bold">{skill.key}</span>
                  {onCooldown && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                      <span className="text-white text-xs font-bold">{cd.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="w-px h-10 bg-amber-200 mx-1" />

          <button onClick={() => setShowInventory(true)} className="w-12 h-12 rounded-xl border-2 border-purple-500 bg-purple-50 hover:bg-purple-100 flex flex-col items-center justify-center">
            <span className="text-lg">🎒</span>
            <span className="text-[8px] text-purple-500 font-bold">I</span>
          </button>

          <button onClick={() => setShowSkillTree(true)} className="w-12 h-12 rounded-xl border-2 border-orange-500 bg-orange-50 hover:bg-orange-100 flex flex-col items-center justify-center relative">
            <span className="text-lg">🌳</span>
            <span className="text-[8px] text-orange-500 font-bold">K</span>
            {skillPoints > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{skillPoints}</span>
            )}
          </button>

          {potionCount > 0 && (
            <button onClick={() => { const potion = inventory.find(i => i.type === 'potion'); if (potion) useGameStore.getState().usePotion(potion.id); }} className="w-12 h-12 rounded-xl border-2 border-green-500 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center relative">
              <span className="text-lg">🧪</span>
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{potionCount}</span>
            </button>
          )}

          <div className="w-px h-10 bg-amber-200 mx-1" />

          <button 
            onClick={() => setAutoFight(!autoFight)} 
            className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${autoFight ? 'bg-red-500 text-white border-red-500' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
          >
            ⚔️ {t('autoFight')}
          </button>

          <button 
            onClick={() => setAutoRespawn(!autoRespawn)} 
            className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${autoRespawn ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
          >
            🔄 {autoRespawn ? t('autoOn') : t('autoOff')}
          </button>

          <button 
            onClick={() => setAutoLoot(!autoLoot)} 
            className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${autoLoot ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
          >
            📦 {autoLoot ? t('autoOn') : t('autoOff')}
          </button>

          {zoneFromPos !== 'hub' && (
            <button onClick={() => setCurrentZone('hub')} className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-100 text-orange-600 border-2 border-orange-200 hover:bg-orange-200">🏠 {t('hub')}</button>
          )}
        </div>

        <div className="mt-2 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1 inline-flex gap-3 text-gray-500 text-xs">
            <span><kbd className="text-blue-600 font-bold">WASD</kbd> {t('move')}</span>
            <span><kbd className="text-blue-600 font-bold">Q/E/SHIFT</kbd> {t('useSkill')}</span>
            <span><kbd className="text-purple-600 font-bold">I</kbd> {t('openInventory')}</span>
            <span><kbd className="text-orange-600 font-bold">K</kbd> {t('openSkills')}</span>
          </div>
        </div>
      </div>

      {allDead && autoRespawn && zoneFromPos !== 'hub' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-white/70 backdrop-blur-md border-2 border-green-500 rounded-2xl px-4 py-2 text-center">
            <div className="text-green-500 text-sm font-bold">🎉 {t('zoneCleared')}</div>
          </div>
        </div>
      )}

      {allDead && !autoRespawn && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border-2 border-green-500 rounded-2xl p-6 text-center">
            <div className="text-green-500 text-lg font-bold mb-2">🎉 {t('zoneCleared')}</div>
            <div className="text-gray-500 text-sm mb-4">{t('allEnemiesDefeated')}</div>
            <div className="flex gap-2">
              <button onClick={respawnEnemies} className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-green-600">🔄 {t('respawn')}</button>
              <button onClick={() => setCurrentZone('hub')} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-600">🏠 {t('toHub')}</button>
            </div>
          </div>
        </div>
      )}

      {hp <= 0 && (
        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-white/95 border-2 border-red-500 rounded-2xl p-6 text-center">
            <div className="text-red-500 text-lg font-bold mb-2">💀 {t('defeated')}</div>
            <div className="text-gray-500 text-sm mb-4">{t('youWereDefeated')}</div>
            <button onClick={respawnPlayer} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-600">{t('restart').toUpperCase()}</button>
          </div>
        </div>
      )}

      {/* Auto-Save Indicator */}
      {showSaveIndicator && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-green-500/80 backdrop-blur-sm px-3 py-2 rounded-xl animate-fade-in">
          <div className="animate-spin text-white">⚙️</div>
          <span className="text-white text-xs font-bold">Gespeichert!</span>
        </div>
      )}

      {/* Achievements Window */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-amber-600 font-bold text-lg">🏆 Erfolge</h2>
              <button onClick={() => setShowAchievements(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-2">
              <div className={`p-3 rounded-xl border-2 ${totalKills >= 10 ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                <div className="font-bold text-sm">🎯 Erstelle 10 Kills</div>
                <div className="text-xs text-gray-500">{totalKills} / 10</div>
              </div>
              <div className={`p-3 rounded-xl border-2 ${totalGoldEarned >= 1000 ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                <div className="font-bold text-sm">💰 Verdiene 1000 Gold</div>
                <div className="text-xs text-gray-500">{totalGoldEarned} / 1000</div>
              </div>
              <div className={`p-3 rounded-xl border-2 ${totalDamageDealt >= 10000 ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                <div className="font-bold text-sm">⚔️ Teile 10000 Schaden aus</div>
                <div className="text-xs text-gray-500">{totalDamageDealt} / 10000</div>
              </div>
              <div className={`p-3 rounded-xl border-2 ${playerLevel >= 10 ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                <div className="font-bold text-sm">⬆️ Errreiche Level 10</div>
                <div className="text-xs text-gray-500">{playerLevel} / 10</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Window */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-amber-600 font-bold text-lg">📈 Bestenliste</h2>
              <button onClick={() => setShowLeaderboard(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-xl">
                <span className="font-bold">Dein Level</span>
                <span className="font-bold text-amber-600">{playerLevel}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-xl">
                <span className="font-bold">Gesamt Kills</span>
                <span className="font-bold text-amber-600">{totalKills}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-xl">
                <span className="font-bold">Verdientes Gold</span>
                <span className="font-bold text-amber-600">{totalGoldEarned}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-xl">
                <span className="font-bold">Ausgeteilter Schaden</span>
                <span className="font-bold text-amber-600">{totalDamageDealt}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-gray-500 text-center">Lokal gespeichert im Browser</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
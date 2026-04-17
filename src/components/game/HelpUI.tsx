interface Props {
  onClose: () => void;
}

export const HelpUI = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-help-open="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#4169E1] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        onWheel={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#4169E1] font-bold text-xl">📖 Hilfe & Steuerung</h2>
          <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
        </div>

        <div className="space-y-6 text-sm">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">🎮 Steuerung</h3>
            <div className="space-y-2 text-blue-700">
              <div><span className="font-bold">WASD</span> - Bewegung</div>
              <div><span className="font-bold">Q / E / SHIFT</span> - Fähigkeiten</div>
              <div><span className="font-bold">Maus Rechts</span> - Kamera drehen</div>
              <div><span className="font-bold">Maus Rad</span> - Zoom</div>
              <div><span className="font-bold">I</span> - Inventar</div>
              <div><span className="font-bold">ESC</span> - Menü schließen</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <h3 className="font-bold text-green-800 mb-2">⚔️ Kämpfen</h3>
            <div className="space-y-2 text-green-700">
              <div>Klicke auf Gegner um sie anzugreifen</div>
              <div>Q - Wirbelschlag (Krieger) / Feuerball (Magier)</div>
              <div>E - Schutzschild (Krieger) / Eiswall (Magier)</div>
              <div>SHIFT - Sturmangriff (Krieger) / Teleport (Magier)</div>
              <div>Autokampf greift automatisch an</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2">🎒 Inventar & Crafting</h3>
            <div className="space-y-2 text-yellow-700">
              <div><span className="font-bold">I</span> - Inventar öffnen</div>
              <div>Drücke <span className="font-bold">ANLEGEN</span> um Ausrüstung zu nutzen</div>
              <div>Drücke <span className="font-bold">💰 VERKAUFEN</span> um Items zu verkaufen (50% Wert)</div>
              <div>Gehe zu <span className="font-bold">Alchemist Anton ⚗️</span> um Tränke zu craften</div>
              <div>Gehe zu <span className="font-bold">Handwerker Hagen 🔨</span> für Waffen & Rüstungen</div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2">🌍 Zonen & Fortschritt</h3>
            <div className="space-y-2 text-purple-700">
              <div>Bosse erscheinen als <span className="font-bold">💀</span> mit viel HP</div>
              <div>Sammle <span className="font-bold">Materialien</span> vom Boden für Crafting</div>
              <div>Dein <span className="font-bold">Begleiter</span> sammelt Items automatisch ein</div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h3 className="font-bold text-red-800 mb-2">⚔️ PvP & Raids</h3>
            <div className="space-y-2 text-red-700">
              <div>Gehe zu <span className="font-bold">Arena-Leiter Max ⚔️</span> für PvP Kämpfe</div>
              <div>Gehe zu <span className="font-bold">Raid-Leiter Roy 👹</span> für Raid-Dungeons</div>
              <div>Besiege alle Bosse nacheinander für tolle Belohnungen!</div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-2">🏛️ Gilde & Soziales</h3>
            <div className="space-y-2 text-orange-700">
              <div>Erstelle oder trete einer <span className="font-bold">Gilde</span> bei Gabi bei</div>
              <div>Nutze <span className="font-bold">Freunde-Finder Finn 👥</span> um Freunde zu verwalten</div>
              <div>Chatte mit <span className="font-bold">/g</span> für Gilde, <span className="font-bold">/p</span> für privat</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">💡 Tipps</h3>
            <div className="space-y-2 text-gray-700">
              <div>✨ Aktiviere <span className="font-bold">Auto-Loot</span> um Items automatisch zu sammeln</div>
              <div>🔄 Aktiviere <span className="font-bold">Auto-Respawn</span> für schnelleres Spielen</div>
              <div>⚔️ Aktiviere <span className="font-bold">Auto-Fight</span> für automatisches Kämpfen</div>
              <div>🎒 Besorge dir einen <span className="font-bold">Begleiter</span> beim Haustier-Händler</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
# Quest Forge 🗡️

Ein MMORPG-Browserspiel mit 3D-Grafik, gebaut mit React, TypeScript und Three.js.

## 🎮 Was ist Quest Forge?

Quest Forge ist ein klassisches Fantasy-MMORPG, das du direkt im Browser spielst. Wähle deinen Helden, besiege Monster, sammle Beute und werde zum legendären Krieger!

## 🧑 Klassen

- **Krieger** - Nahkampf-Spezialist mit hohem Leben
- **Magier** - Fernkampf-Magie mit hoher Krit-Rate
- **Bogenschütze** - Schneller Angriff aus der Ferne

## 🎯 Spielziele

1. **Level aufsteigen** - Werde stärker durch Erfahrungspunkte
2. **Gegner besiegen** - Verschiedene Monster in verschiedenen Zonen
3. **Ausrüstung sammeln** - Bessere Waffen und Rüstungen kaufen
4. **Quests abschließen** - Belohnungen verdienen
5. **Haustiere finden** - Begleiter für Boni

## 🗺️ Zonen (vom Leichten zum Schweren)

1. **Grüne Wiesen** - Einsteigerzone
2. **Pilzwald** - Mittelstufe
3. **Frostgipfel** - Fortgeschrittene
4. **Lava-Höhlen** - Herausfordernd
5. **Korallenriff** - Unterwasser-Abenteuer
6. **Schattensumpf** - Dunkle Kreaturen
7. **Kristall-Hochländer** - Endgame
8. **Void-Nexus** - Boss-Zone

## ⚔️ Spielmechaniken

### Combo-System
- Töte Gegner schnell hintereinander für Schaden-Boni
- Bis zu +50% Schaden bei voller Combo

### Regeneration
- HP: +1 alle 15 Sekunden
- MP: +1 alle 15 Sekunden

### Level-Unterschied
- Schwerere Gegner geben weniger XP
- Leichtere Gegner geben mehr XP

### Tag/Nacht-Zyklus
- Die Beleuchtung ändert sich alle Minute

### Weather Effects
- Sonnig, Regen, Nebel

## 🏆 Achievements

- **10 Kills** - Erste Schritte
- **1000 Gold** - Wohlstand
- **10000 Schaden** - Kraftvoll
- **Level 10** - Aufgestiegen

## 🔧 Technologien

- React + TypeScript
- Three.js / @react-three/fiber
- Tailwind CSS
- Zustand (State Management)
- LocalStorage (Save System)

## 🚀 Spiel starten

```bash
npm install
npm run dev
```

Dann im Browser: http://localhost:8080

## 📝 Steuerung

- **WASD** - Bewegung
- **Maus** - Kamera
- **Linksklick** - Angreifen
- **Q/E** - Fähigkeiten
- **Shift** - Sprint/Dash
- **F** - Nahkampf

## ⚠️ Hinweis

Dies ist ein **Prototype/Browser-Spiel**. Das Account-System speichert Daten nur lokal im Browser (LocalStorage). Für ein echtes Online-MMORPG wäre ein Server mit Datenbank nötig.

## 📜 Lizenz

MIT License
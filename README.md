# Quest Forge 🗡️

Ein MMORPG-Browserspiel mit 3D-Grafik, gebaut mit React, TypeScript und Three.js.

## 🎮 Was ist Quest Forge?

Quest Forge ist ein klassisches Fantasy-MMORPG, das du direkt im Browser spielst. Wähle deinen Helden, besiege Monster, sammle Beute und werde zum legendären Krieger!

## 🚀 Login-Flow

Das Spiel folgt einem klassischen MMORPG-Login-System:

1. **Login Screen** - Account erstellen oder einloggen
   - Account + Passwort
   - "Save" Checkbox für automatisches Einloggen
2. **Charakterauswahl** - 3 Charakter-Slots
   - Charakter erstellen (Name + Klasse wählen)
   - Warrior / Mage / Archer
   - Slot wird blau markiert wenn ausgewählt
3. **Serverauswahl** - Channel wählen
   - Yggdrasil Server
   - Channel 1-4 (Channel 4 = PvP)
4. **Spiel starten** - Accept Button

## 🧑 Klassen

- **Krieger** - Nahkampf-Spezialist mit hohem Leben
- **Magier** - Fernkampf-Magie mit hoher Krit-Rate
- **Bogenschütze** - Schneller Angriff aus der Ferne

## 🌳 Klassenspezifische Skill-Bäume

Jede Klasse hat ihren eigenen einzigartigen Skill-Baum:

### ⚔️ Krieger
- Schwertschlag, Kampfeswut, Wirbelschlag
- Rüstung, Schildblock, Kampfgeist
- Wundenheilung, Kriegsraserei
- Sturmangriff, Plünderer

### 🔮 Magier
- Feuerball, Verbrennung, Meteor
- Eis, Frostschild, Manareserven
- Meditation, Teleport
- Fokus, Studium

### 🏹 Bogenschütze
- Bogenschuss, Scharfschütze, Mehrfachschuss
- Schnellläufer, Ausweichen, Ausdauer
- Schatten, Fernsicht
- Jagdprämie, Kopfschuss

## 🎯 Spielziele

1. **Level aufsteigen** - Werde stärker durch Erfahrungspunkte
2. **Gegner besiegen** - Verschiedene Monster in verschiedenen Zonen
3. **Ausrüstung sammeln** - Bessere Waffen und Rüstungen kaufen
4. **Quests abschließen** - 35+ Quests mit tollen Belohnungen
5. **Pets kaufen** - 16 verschiedene Pets mit Buffs
6. **Pet-Turnier** - Automatische Kämpfe für XP und Gold
7. **Edelsteine sammeln** - Kosmetik und Pet-Slots kaufen

## 🗺️ Zonen (18 Zonen)

1. **Hub** - Hauptstadt mit NPCs, Shop, Quests
2. **Grüne Wiesen** - Einsteigerzone
3. **Pilzwald** - Mittelstufe
4. **Frostgipfel** - Fortgeschrittene
5. **Lava-Höhlen** - Herausfordernd
6. **Korallenriff** - Unterwasser-Abenteuer
7. **Schattensumpf** - Dunkle Kreaturen
8. **Kristall-Hochländer** - Endgame
9. **Void-Nexus** - Boss-Zone
10. **Drachenhöhle** - Drachen-Boss
11. **Verzauberter Wald** - Magische Gegner
12. **Schwebende Inseln** - Luftig
13. **Abgrund** - Hohe Gegner
14. **Himmelsebenen** - Engel
15. **Schattenreich** - Dunkle Macht
16. **PvP Arena** - Spieler gegen Spieler
17. **Raid Dungeon** - 8 Spieler Raid
18. **Arena Kolosseum** - Gladiator

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
- Die Beleuchtung ändert sich alle 60 Sekunden

### Weather Effects
- Sonnig, Regen, Nebel

### Pet-Buff System 🐾
- Pets sammeln automatisch Items in der Nähe ein
- Verschiedene Buff-Typen: Schaden, Defense, Speed, Krit, Heilung
- Bis zu 5 Pet-Slots (mit 💎 freischaltbar)
- Pets folgen dem Spieler und heilen alle 10 Sekunden
- **Pet-Turnier Arena** - Schicke dein Pet ins Turnier für automatische Kämpfe
  - Manuelle Kämpfe (100 Gold) oder Auto-Send Modus (200 Gold/Stunde)
  - XP und Gold bei jedem Sieg
  - Neue "Meine Pets" Tab zeigt alle Pets mit XP-Balken

### Pet-Evolution System ✨
- Pets evolvieren wenn sie ihr Max-Level erreichen
- Klicke auf "✨ Evolvieren" im "Meine Pets" Tab
- Das Pet wird auf die nächste Stufe upgegraded:
  - Baby Wolf → Erwachsener Wolf → Alpha Wolf
  - Flauschkatze → Ninja Katze
  - Mini Drache → Elder Drache
  - Wald Fee → Magische Fee → Verzauberte Fee
  - Geist Gigi → Phantom Gigi → Schreckens Gigi
  - Ritter Baldur → Champion Baldur
  - Priesterin Aria → Hohepriesterin Aria
- Evolvierte Pets haben bessere Stats und einzigartige 3D-Modelle

### Zone-Wände
- Jede Zone hat Wände an allen 4 Seiten
- Kollisionserkennung verhindert das Verlassen

### Tägliche Belohnungen 🎁
- Gold: 50 + (Level × 10)
- 💎 ab Level 10

### Titel-System 👑
- Verschiedene Titel basierend auf Spieler-Level
- Mehr als 20 Titel von "Neuling" bis "Legendär"

### Leaderboard 🏅
- Rangliste der besten Spieler im Hub
- Top 10 Spieler werden angezeigt

### Edelsteine 💎
- Boss-Drop: 1-5 pro Boss
- Normaler Mob: 50% Chance auf 1
- Kosmetik-Items und Pet-Slots kaufbar

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
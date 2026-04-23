import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbQRB-X7pmXcg-KwTsq52ElT4uOQwbXjU",
  authDomain: "novastar-rpg.firebaseapp.com",
  projectId: "novastar-rpg",
  storageBucket: "novastar-rpg.firebasestorage.app",
  messagingSenderId: "862051862012",
  appId: "1:862051862012:web:96a12ec1907b698391de79",
  measurementId: "G-J8XGRD7N4P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface PlayerSave {
  playerId: string;
  playerName: string;
  playerClass: string;
  playerLevel: number;
  playerXp: number;
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  playerMaxMana: number;
  playerAttack: number;
  playerDefense: number;
  playerGold: number;
  playerGems: number;
  playerTitle: string;
  equipped: string[];
  inventory: string[];
  pets: string[];
  cosmetics: string[];
  quests: string[];
  skills: string[];
  skillPoints: number;
  language: string;
  lastZone: string;
  achievementIds: string[];
  totalKills: number;
  totalGoldEarned: number;
  totalDamageDealt: number;
  lastSaved: Date;
}

export const savePlayerFirebase = async (playerData: Partial<PlayerSave>): Promise<void> => {
  try {
    const playerRef = doc(db, 'players', playerData.playerId || 'default');
    await setDoc(playerRef, { ...playerData, lastSaved: new Date() });
  } catch (error) {
    // Silent fail
  }
};

export const loadPlayerFirebase = async (playerId: string): Promise<PlayerSave | null> => {
  try {
    const playerRef = doc(db, 'players', playerId || 'default');
    const snap = await getDoc(playerRef);
    if (snap.exists()) {
      return snap.data() as PlayerSave;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const listPlayersFirebase = async (): Promise<PlayerSave[]> => {
  try {
    const snap = await getDocs(collection(db, 'players'));
    return snap.docs.map(d => d.data() as PlayerSave);
  } catch (error) {
    return [];
  }
};

export const deletePlayerFirebase = async (playerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'players', playerId));
  } catch (error) {
    // Silent fail
  }
};
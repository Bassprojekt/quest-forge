import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCbQRB-X7pmXcg-KwTsq52ElT4uOQwbXjU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "novastar-rpg.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "novastar-rpg",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "novastar-rpg.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "862051862012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:862051862012:web:96a12ec1907b698391de79",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-J8XGRD7N4P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase initialized with project:', firebaseConfig.projectId);

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
    console.log('💾 Firebase: Spielstand gespeichert!');
  } catch (error) {
    console.error('❌ Firebase Speicherfehler:', error);
    throw error;
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
    console.error('❌ Firebase Ladefehler:', error);
    return null;
  }
};

export const listPlayersFirebase = async (): Promise<PlayerSave[]> => {
  try {
    const snap = await getDocs(collection(db, 'players'));
    return snap.docs.map(d => d.data() as PlayerSave);
  } catch (error) {
    console.error('❌ Firebase Listenfehler:', error);
    return [];
  }
};

export const deletePlayerFirebase = async (playerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'players', playerId));
    console.log('🗑️ Firebase: Spieler gelöscht');
  } catch (error) {
    console.error('❌ Firebase Löschfehler:', error);
  }
};
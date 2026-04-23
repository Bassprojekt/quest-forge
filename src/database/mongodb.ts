import { MongoClient, Db, Collection } from 'mongodb';

const MONGO_URI = 'mongodb+srv://dereasybassprojekt_db_user:c4epnAq2L3ohv1N7@novestarrpg.6prfglc.mongodb.net/?retryWrites=true&w=majority&appName=NoveStarRPG';
const DB_NAME = 'QuestForge';

let client: MongoClient | null = null;
let db: Db | null = null;

export interface PlayerSave {
  _id?: string;
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

export const connectDB = async (): Promise<Db> => {
  if (db) return db;
  
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ MongoDB verbunden:', DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error);
    throw error;
  }
};

export const getPlayerCollection = async (): Promise<Collection<PlayerSave>> => {
  const database = await connectDB();
  return database.collection<PlayerSave>('players');
};

export const savePlayer = async (playerData: Partial<PlayerSave>): Promise<void> => {
  try {
    const collection = await getPlayerCollection();
    await collection.updateOne(
      { playerId: playerData.playerId },
      { $set: { ...playerData, lastSaved: new Date() } },
      { upsert: true }
    );
    console.log('💾 Spielstand gespeichert:', playerData.playerName);
  } catch (error) {
    console.error('❌ Speicherfehler:', error);
    throw error;
  }
};

export const loadPlayer = async (playerId: string): Promise<PlayerSave | null> => {
  try {
    const collection = await getPlayerCollection();
    const player = await collection.findOne({ playerId });
    return player || null;
  } catch (error) {
    console.error('❌ Ladefehler:', error);
    throw error;
  }
};

export const listPlayers = async (): Promise<PlayerSave[]> => {
  try {
    const collection = await getPlayerCollection();
    return collection.find({}).toArray();
  } catch (error) {
    console.error('❌ Listenfehler:', error);
    throw error;
  }
};

export const deletePlayer = async (playerId: string): Promise<void> => {
  try {
    const collection = await getPlayerCollection();
    await collection.deleteOne({ playerId });
    console.log('🗑️ Spieler gelöscht:', playerId);
  } catch (error) {
    console.error('❌ Löschfehler:', error);
    throw error;
  }
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB getrennt');
  }
};
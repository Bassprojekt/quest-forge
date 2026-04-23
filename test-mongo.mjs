import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://dereasybassprojekt_db_user:c4epnAq2L3ohv1N7@novestarrpg.6prfglc.mongodb.net';

async function test() {
  console.log('🔌 Teste Verbindung...');
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Verbunden!');
    
    const db = client.db('QuestForge');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', '));
    
  } catch (e) {
    console.log('❌ Fehler:', e.message);
  } finally {
    await client.close();
  }
}

test();
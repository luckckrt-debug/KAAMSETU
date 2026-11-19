const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority';

async function syncInitialData() {
  const storePath = path.join(__dirname, '..', 'data', 'kaamsetu_store.json');
  if (!fs.existsSync(storePath)) {
    console.error('Store file not found:', storePath);
    return;
  }

  const raw = fs.readFileSync(storePath, 'utf8');
  const store = JSON.parse(raw);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('[SUCCESS] Connected to MongoDB Atlas');
    const db = client.db('kaamsetu');

    for (const key of Object.keys(store)) {
      if (Array.isArray(store[key])) {
        const col = db.collection(key);
        const count = await col.countDocuments();
        console.log(`Collection ${key}: current Atlas count = ${count}, local items = ${store[key].length}`);
        
        if (count === 0 && store[key].length > 0) {
          // Clean objects to ensure valid document structure
          const docs = store[key].map(item => {
            const doc = { ...item };
            if (doc.id) {
              doc._id = doc.id; // Map id to _id for fast indexing and uniqueness
            }
            return doc;
          });
          const res = await col.insertMany(docs);
          console.log(` -> Seeded ${res.insertedCount} records into collection '${key}'`);
        }
      }
    }

    console.log('--- Initial Sync & Verify Done ---');
  } catch (err) {
    console.error('Error syncing:', err);
  } finally {
    await client.close();
  }
}

syncInitialData();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority';

async function checkCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('kaamsetu');
    const cols = await db.listCollections().toArray();
    console.log('Collections in Atlas kaamsetu database:');
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count} documents`);
    }
  } finally {
    await client.close();
  }
}

checkCollections();

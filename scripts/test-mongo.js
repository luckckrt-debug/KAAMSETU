const { MongoClient } = require('mongodb');

const uris = [
  {
    name: 'Decoded password with encoded @ (Abhinav%402008)',
    uri: 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority'
  },
  {
    name: 'Literal angle brackets (%3CAbhinav%402008%3E)',
    uri: 'mongodb+srv://8887642828:%3CAbhinav%402008%3E@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority'
  }
];

async function run() {
  for (const item of uris) {
    console.log(`Testing connection: ${item.name}...`);
    const client = new MongoClient(item.uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    try {
      await client.connect();
      console.log(`[SUCCESS] Connected to MongoDB Atlas with: ${item.name}`);
      const db = client.db('kaamsetu');
      const collections = await db.listCollections().toArray();
      console.log('Collections in database kaamsetu:', collections.map(c => c.name));
      await client.close();
      return item.uri;
    } catch (err) {
      console.error(`[FAILED] ${item.name}:`, err.message);
    }
  }
}

run();

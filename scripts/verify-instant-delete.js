const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority';

async function verify() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('kaamsetu');
    console.log('[SUCCESS] Connected to MongoDB Atlas cluster0.jjs2wil.mongodb.net/kaamsetu');

    // 1. Insert a test worker
    const testWorkerId = `test-worker-${Date.now()}`;
    await db.collection('workerProfiles').insertOne({
      _id: testWorkerId,
      id: testWorkerId,
      headline: 'Temporary Test Plumber',
      city: 'Delhi',
      createdAt: new Date().toISOString()
    });
    console.log(`[TEST 1] Inserted worker document: ${testWorkerId}`);

    // Verify it exists in Atlas
    const workerFound = await db.collection('workerProfiles').findOne({ _id: testWorkerId });
    console.log(`[TEST 2] Worker found in MongoDB Atlas:`, workerFound ? workerFound.id : null);

    // 2. Perform instant delete (identical to /api/admin/data logic)
    const deleteRes = await db.collection('workerProfiles').deleteOne({
      $or: [{ _id: testWorkerId }, { id: testWorkerId }]
    });
    console.log(`[TEST 3] Executed instant deleteOne in MongoDB Atlas. Deleted count:`, deleteRes.deletedCount);

    // Verify it is gone from Atlas
    const workerAfter = await db.collection('workerProfiles').findOne({ _id: testWorkerId });
    console.log(`[TEST 4] After deletion, document in MongoDB Atlas exists:`, !!workerAfter);

    if (deleteRes.deletedCount === 1 && !workerAfter) {
      console.log('>>> ALL VERIFICATION CHECKS PASSED: Live MongoDB Atlas Instant Deletion is 100% OPERATIONAL! <<<');
    }
  } finally {
    await client.close();
  }
}

verify();

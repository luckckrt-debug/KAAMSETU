const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority';

async function testDelete() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('kaamsetu');
    const col = db.collection('auditLogs');

    const testDoc = { _id: 'test_delete_123', id: 'test_delete_123', action: 'TEST_INSERT_DELETE', timestamp: new Date().toISOString() };
    await col.insertOne(testDoc);
    console.log('[TEST] Inserted test doc');

    const found = await col.findOne({ _id: 'test_delete_123' });
    console.log('[TEST] Found test doc:', !!found);

    const deleteRes = await col.deleteOne({ $or: [{ _id: 'test_delete_123' }, { id: 'test_delete_123' }] });
    console.log('[TEST] Deleted test doc count:', deleteRes.deletedCount);

    const afterDelete = await col.findOne({ _id: 'test_delete_123' });
    console.log('[TEST] After delete doc exists:', !!afterDelete);
  } finally {
    await client.close();
  }
}

testDelete();

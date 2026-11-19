const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority";

async function runTests() {
  console.log('--- STARTING CUSTOMER REGISTRATION & FIREBASE AUTH TESTS ---');
  let client;

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('kaamsetu');
    console.log('✅ Connected to MongoDB Atlas: kaamsetu');

    const testCustomerPhone = '9999' + Math.floor(100000 + Math.random() * 900000);
    const testEmail = `test.customer.${Date.now()}@kaamsetu.test`;

    // 1. Simulate registration without password (Customer passwordless)
    const testUserDoc = {
      id: `user-cust-${Date.now()}`,
      phoneNumber: testCustomerPhone,
      phoneVerified: true,
      passwordHash: undefined,
      fullName: 'Ananya Deshmukh',
      email: testEmail,
      language: 'hi',
      roles: ['CUSTOMER'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const insertRes = await db.collection('users').insertOne(testUserDoc);
    console.log('Test 1 PASS: User created without password requirement in MongoDB Atlas users collection. _id:', insertRes.insertedId);

    // 2. Create customer profile
    const testCustProf = {
      id: `cust-prof-${Date.now()}`,
      userId: testUserDoc.id,
      city: 'Noida',
      addressLine: 'Sector 62, Indirapuram',
      createdAt: new Date().toISOString(),
    };
    await db.collection('customerProfiles').insertOne(testCustProf);
    console.log('Test 2 PASS: Customer profile created in customerProfiles collection');

    // 3. Verify user retrieval by phone & email
    const fetched = await db.collection('users').findOne({ phoneNumber: testCustomerPhone });
    if (!fetched || fetched.fullName !== 'Ananya Deshmukh' || fetched.roles[0] !== 'CUSTOMER') {
      throw new Error('Test 3 FAIL: User verification failed');
    }
    console.log('Test 3 PASS: User safely retrieved with role CUSTOMER, no password needed');

    // 4. Test Firebase UID linking
    const testFirebaseUid = `fb_uid_${Date.now()}`;
    await db.collection('users').updateOne(
      { id: testUserDoc.id },
      { $set: { firebaseUid: testFirebaseUid, updatedAt: new Date().toISOString() } }
    );
    const updatedUser = await db.collection('users').findOne({ id: testUserDoc.id });
    if (updatedUser.firebaseUid !== testFirebaseUid) {
      throw new Error('Test 4 FAIL: Firebase UID linking failed');
    }
    console.log('Test 4 PASS: Firebase UID successfully linked with MongoDB Atlas user record');

    // Clean up test document
    await db.collection('users').deleteOne({ id: testUserDoc.id });
    await db.collection('customerProfiles').deleteOne({ id: testCustProf.id });
    console.log('Test 5 PASS: Cleaned up test records from MongoDB Atlas');

    console.log('--- ALL CUSTOMER REGISTRATION & FIREBASE TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

runTests();

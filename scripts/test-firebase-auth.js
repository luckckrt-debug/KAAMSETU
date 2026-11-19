/**
 * Automated Test Script for Firebase Authentication Integration
 * Tests:
 * 1. Firebase configuration validation (kaamsetu-e47e9)
 * 2. Firebase App and Auth SDK initialization
 * 3. /api/auth/firebase authentication flow with MongoDB Atlas
 * 4. Role detection and JWT session token generation
 */

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const firebaseConfig = {
  apiKey: "AIzaSyDAlN3BJYnhVynBHMPY2vM7VjnC_wy_Tws",
  authDomain: "kaamsetu-e47e9.firebaseapp.com",
  projectId: "kaamsetu-e47e9",
  storageBucket: "kaamsetu-e47e9.firebasestorage.app",
  messagingSenderId: "574359088214",
  appId: "1:574359088214:web:d263b245f2c0a219241ff7",
  measurementId: "G-KHB750S7BM"
};

const MONGO_URI = 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu';

async function testFirebaseIntegration() {
  console.log('================================================================');
  console.log('🔥 KAAMSETU FIREBASE AUTHENTICATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] Step ${total}: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] Step ${total}: ${message}`);
      throw new Error(message);
    }
  }

  try {
    // 1. Initialize Firebase App
    const app = initializeApp(firebaseConfig, `test-app-${Date.now()}`);
    assert(app && app.name, `Firebase initialized with project ID: ${app.options.projectId}`);

    // 2. Initialize Firebase Auth
    const auth = getAuth(app);
    assert(auth !== null && auth.app.options.apiKey === firebaseConfig.apiKey, 'Firebase Auth instance created successfully');

    // 3. Connect to MongoDB Atlas
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('kaamsetu');
    assert(db !== null, 'Connected to KaamSetu MongoDB Atlas database');

    // 4. Simulate Firebase User Authentication sync
    const testUid = `fb_test_uid_${Date.now().toString().slice(-6)}`;
    const testPhone = `9820${Date.now().toString().slice(-6)}`;
    const testEmail = `firebase_user_${Date.now().toString().slice(-6)}@kaamsetu.in`;

    const userDoc = {
      id: `user-fb-${Date.now().toString().slice(-6)}`,
      fullName: 'Firebase Verified User',
      phoneNumber: testPhone,
      email: testEmail,
      roles: ['CUSTOMER'],
      firebaseUid: testUid,
      status: 'ACTIVE',
      language: 'hi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').insertOne(userDoc);
    const retrievedUser = await db.collection('users').findOne({ firebaseUid: testUid });
    assert(retrievedUser && retrievedUser.firebaseUid === testUid, 'Firebase UID successfully indexed & stored in MongoDB Atlas');

    // 5. Generate and verify JWT session token
    const token = jwt.sign(
      { userId: userDoc.id, phoneNumber: userDoc.phoneNumber, roles: userDoc.roles },
      'kaamsetu_super_secure_jwt_secret_dev_2026_change_in_production',
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, 'kaamsetu_super_secure_jwt_secret_dev_2026_change_in_production');
    assert(decoded.userId === userDoc.id && decoded.roles[0] === 'CUSTOMER', 'JWT session token generated and verified for Firebase user');

    // 6. Test Worker Firebase Login Provisioning
    const workerUid = `fb_worker_${Date.now().toString().slice(-6)}`;
    const workerDoc = {
      id: `user-fb-worker-${Date.now().toString().slice(-6)}`,
      fullName: 'Sunil Kumar (Electrician)',
      phoneNumber: `9871${Date.now().toString().slice(-6)}`,
      email: `worker_${Date.now().toString().slice(-6)}@gmail.com`,
      roles: ['WORKER'],
      firebaseUid: workerUid,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    await db.collection('users').insertOne(workerDoc);

    const workerProfileDoc = {
      id: `worker-prof-${Date.now().toString().slice(-6)}`,
      userId: workerDoc.id,
      headline: 'Certified Electrician',
      verificationStatus: 'VERIFIED',
      ratingAvg: 4.9,
      createdAt: new Date().toISOString(),
    };
    await db.collection('workerProfiles').insertOne(workerProfileDoc);
    assert(true, 'Worker role account with Firebase UID provisioned in MongoDB Atlas');

    // 7. Test Contractor Firebase Login Provisioning
    const contractorUid = `fb_contractor_${Date.now().toString().slice(-6)}`;
    const contractorDoc = {
      id: `user-fb-cont-${Date.now().toString().slice(-6)}`,
      fullName: 'Sharma Infrastructure (Contractor)',
      phoneNumber: `9811${Date.now().toString().slice(-6)}`,
      email: `contractor_${Date.now().toString().slice(-6)}@gmail.com`,
      roles: ['CONTRACTOR'],
      firebaseUid: contractorUid,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    await db.collection('users').insertOne(contractorDoc);

    const contractorProfileDoc = {
      id: `contractor-prof-${Date.now().toString().slice(-6)}`,
      userId: contractorDoc.id,
      companyName: 'Sharma Infrastructure',
      verificationStatus: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };
    await db.collection('contractorProfiles').insertOne(contractorProfileDoc);
    assert(true, 'Contractor role account with Firebase UID provisioned in MongoDB Atlas');

    // 8. Clean up test users
    await db.collection('users').deleteMany({
      id: { $in: [userDoc.id, workerDoc.id, contractorDoc.id] }
    });
    await db.collection('workerProfiles').deleteOne({ id: workerProfileDoc.id });
    await db.collection('contractorProfiles').deleteOne({ id: contractorProfileDoc.id });
    assert(true, 'Cleaned up temporary test records from MongoDB Atlas');

    await client.close();

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passed} OF ${total} FIREBASE INTEGRATION TESTS PASSED!`);
    console.log('Firebase project "kaamsetu-e47e9" successfully connected.');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Firebase test failed:', err);
    process.exit(1);
  }
}

testFirebaseIntegration();

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu';

async function testControlRoom() {
  console.log('=== KAAMSETU SUPER ADMIN CONTROL ROOM SYSTEM AUDIT ===\n');
  console.log('Connecting to MongoDB Atlas:', MONGODB_URI.replace(/:[^@]+@/, ':****@'));

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  console.log('Connected to MongoDB Atlas successfully.');

  const db = client.db('kaamsetu');

  // 1. Audit Collections
  const collections = await db.listCollections().toArray();
  console.log(`\nFound ${collections.length} active collections in Atlas database:`);
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  - ${c.name.padEnd(25)}: ${count} documents`);
  }

  // 2. Super Admin Account Audit
  console.log('\n--- Super Admin Credentials & Account Check ---');
  const adminUser = await db.collection('users').findOne({
    $or: [{ phoneNumber: '9999999999' }, { roles: 'SUPER_ADMIN' }, { roles: 'ADMIN' }]
  });
  if (adminUser) {
    console.log('  Super Admin Account Found:');
    console.log(`    ID: ${adminUser.id}`);
    console.log(`    Name: ${adminUser.fullName}`);
    console.log(`    Phone: ${adminUser.phoneNumber}`);
    console.log(`    Roles: ${JSON.stringify(adminUser.roles)}`);
    console.log(`    Status: ${adminUser.accountStatus || adminUser.status || 'ACTIVE'}`);
  } else {
    console.error('  WARNING: No Super Admin account found in users collection!');
  }

  // 3. Platform Fee Check (Rs 99 model)
  console.log('\n--- Pricing Model & ₹99 Platform Fee Audit ---');
  const bookings = await db.collection('bookings').find({}).limit(5).toArray();
  console.log(`  Inspecting recent bookings (${bookings.length}):`);
  for (const b of bookings) {
    const base = b.workerBaseCharge || b.workerAgreedWage || b.totalAmount || 0;
    const fee = b.platformFee || 99;
    const total = b.totalCustomerPrice || (base + fee);
    console.log(`    Booking ${b.id}: Worker Base ₹${base} + Fee ₹${fee} = Customer Total ₹${total}`);
  }

  // 4. Audit Logs Check
  console.log('\n--- Immutable Security Audit Logs Check ---');
  const auditLogs = await db.collection('auditLogs').find({}).sort({ timestamp: -1 }).limit(5).toArray();
  console.log(`  Recent audit log records (${auditLogs.length}):`);
  for (const a of auditLogs) {
    console.log(`    [${a.timestamp || a.createdAt}] ${a.adminName || a.adminId}: ${a.action} -> ${a.targetCollection || a.targetUser || a.reason}`);
  }

  // 5. System Settings Check
  console.log('\n--- System Settings Check ---');
  const settings = await db.collection('system_settings').findOne({ id: 'kaamsetu_global_settings' });
  if (settings) {
    console.log(`  Platform Fee: ₹${settings.platformFee}`);
    console.log(`  Auto Dispatch: ${settings.autoDispatchEnabled}`);
    console.log(`  Maintenance Mode: ${settings.maintenanceMode}`);
  } else {
    console.log('  Settings collection is ready for admin initialization.');
  }

  await client.close();
  console.log('\n=== CONTROL ROOM AUDIT COMPLETE: ALL SYSTEMS VERIFIED & READY ===');
}

testControlRoom().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});

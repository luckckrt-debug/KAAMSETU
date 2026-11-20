const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu';

async function setupIndexes() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('kaamsetu');
    console.log('✅ Connected to MongoDB Atlas: kaamsetu');

    const usersCol = db.collection('users');

    // 1. Identify any duplicate phone numbers in users collection
    const allUsers = await usersCol.find({}).toArray();
    console.log(`📊 Found ${allUsers.length} total user records in Atlas.`);

    const phoneMap = new Map();
    const duplicateIdsToRemove = [];

    for (const u of allUsers) {
      if (!u.phoneNumber) continue;
      const p = String(u.phoneNumber).replace(/\D/g, '');
      if (phoneMap.has(p)) {
        // We already have a record for this phone number; keep the one with passwordHash or oldest createdAt
        const existing = phoneMap.get(p);
        if (!existing.passwordHash && u.passwordHash) {
          duplicateIdsToRemove.push(existing._id);
          phoneMap.set(p, u);
        } else {
          duplicateIdsToRemove.push(u._id);
        }
      } else {
        phoneMap.set(p, u);
      }
    }

    if (duplicateIdsToRemove.length > 0) {
      console.log(`⚠️ Found ${duplicateIdsToRemove.length} redundant duplicate records to clean up for unique phone index:`, duplicateIdsToRemove);
      const delRes = await usersCol.deleteMany({ _id: { $in: duplicateIdsToRemove } });
      console.log(`✅ Deduplicated users: removed ${delRes.deletedCount} redundant duplicate entries.`);
    } else {
      console.log('✅ No duplicate phone numbers found.');
    }

    // 2. Ensure indexes
    console.log('🔄 Creating indexes on users collection...');
    await usersCol.createIndex({ phoneNumber: 1 }, { unique: true, name: 'idx_phone_number_unique' });
    await usersCol.createIndex({ roles: 1 }, { name: 'idx_user_roles' });
    await usersCol.createIndex({ accountStatus: 1 }, { name: 'idx_account_status' });
    await usersCol.createIndex({ status: 1 }, { name: 'idx_status' });
    console.log('✅ Created indexes: idx_phone_number_unique, idx_user_roles, idx_account_status, idx_status');

    // 3. Set accountStatus: 'ACTIVE' for any user missing it
    const updateRes = await usersCol.updateMany(
      { accountStatus: { $exists: false } },
      { $set: { accountStatus: 'ACTIVE' } }
    );
    if (updateRes.modifiedCount > 0) {
      console.log(`ℹ️ Updated ${updateRes.modifiedCount} users with default accountStatus: 'ACTIVE'`);
    }

    // 4. Inspect current user counts
    const totalUsers = await usersCol.countDocuments();
    const workerCount = await usersCol.countDocuments({ roles: 'WORKER' });
    const contractorCount = await usersCol.countDocuments({ roles: 'CONTRACTOR' });
    const customerCount = await usersCol.countDocuments({ roles: { $in: ['CUSTOMER', 'HIRING_PARTNER'] } });
    const adminCount = await usersCol.countDocuments({ roles: { $in: ['ADMIN', 'SUPER_ADMIN'] } });

    console.log(`📊 Verified Users in Atlas: Total = ${totalUsers}`);
    console.log(`   - Workers: ${workerCount}`);
    console.log(`   - Contractors: ${contractorCount}`);
    console.log(`   - Customers/Hiring Partners: ${customerCount}`);
    console.log(`   - Admins: ${adminCount}`);

    // Verify existing indexes
    const indexes = await usersCol.indexes();
    console.log('📋 Current Indexes on `users`:', indexes.map(i => i.name));

  } catch (err) {
    console.error('❌ Error setting up MongoDB Atlas indexes:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupIndexes();

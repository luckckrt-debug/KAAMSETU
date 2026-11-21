import { MongoClient, Db, Collection, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu?retryWrites=true&w=majority';
const dbName = 'kaamsetu';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  console.warn('[MongoDB] No MONGODB_URI provided in environment.');
} else {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the client is not repeatedly re-created on HMR
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
      });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, avoid global variable
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });
    clientPromise = client.connect();
  }
}

export default clientPromise;

/**
 * Returns connected MongoDB database instance
 */
export async function getMongoDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    return null;
  }
}

/**
 * Returns a typed MongoDB collection
 */
export async function getMongoCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<T>(collectionName);
}

/**
 * Instant delete helper for any collection by id
 * Matches either _id or id
 */
export async function deleteMongoDocument(
  collectionName: string,
  id: string
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return { success: false, deletedCount: 0, error: 'Database connection unavailable' };
    }

    const col = db.collection(collectionName);
    // Delete matching _id or id
    const result = await col.deleteOne({
      $or: [{ _id: id as any }, { id: id }],
    });

    console.log(`[MongoDB INSTANT DELETE] Collection: ${collectionName}, ID: ${id}, Deleted: ${result.deletedCount}`);
    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (err: any) {
    console.error(`[MongoDB DELETE ERROR] Collection: ${collectionName}, ID: ${id}`, err);
    return {
      success: false,
      deletedCount: 0,
      error: err?.message || 'Delete operation failed',
    };
  }
}

/**
 * Instant upsert helper for synchronizing single document to MongoDB
 */
export async function upsertMongoDocument(
  collectionName: string,
  id: string,
  document: any
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const col = db.collection(collectionName);
    const cleanDoc = { ...document, _id: id, id: id };
    await col.replaceOne({ $or: [{ _id: id as any }, { id: id }] }, cleanDoc, { upsert: true });
    return true;
  } catch (err) {
    console.error(`[MongoDB UPSERT ERROR] Collection: ${collectionName}, ID: ${id}`, err);
    return false;
  }
}

/**
 * Record an immutable audit log entry in MongoDB Atlas auditLogs collection
 */
export async function recordAdminAuditLog(entry: {
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetUser?: string;
  targetRecord?: string;
  targetCollection?: string;
  previousValue?: any;
  updatedValue?: any;
  reason?: string;
  ipAddress?: string;
  status?: 'SUCCESS' | 'FAILED';
}): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const col = db.collection('auditLogs');
    const doc = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...entry,
      status: entry.status || 'SUCCESS',
      timestamp: new Date().toISOString(),
    };
    await col.insertOne(doc);
    return true;
  } catch (e) {
    console.error('[Audit Log Error]:', e);
    return false;
  }
}

/**
 * Retrieve system settings from MongoDB Atlas
 */
export async function getSystemSettings(): Promise<any> {
  const defaultSettings = {
    id: 'system-settings-main',
    platformName: 'DigiWork',
    platformFee: 99,
    serviceFeeEnabled: true,
    maintenanceMode: false,
    kycRequiredForBookings: true,
    payoutProvider: 'MANUAL',
    supportPhone: '+91-8887642828',
    supportEmail: 'support@digiwork.in',
    autoDispatchEnabled: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getMongoDb();
    if (!db) return defaultSettings;
    const col = db.collection('system_settings');
    const existing = await col.findOne({ id: 'system-settings-main' });
    if (!existing) {
      await col.insertOne(defaultSettings);
      return defaultSettings;
    }
    return existing;
  } catch (e) {
    return defaultSettings;
  }
}

/**
 * Update system settings in MongoDB Atlas
 */
export async function updateSystemSettings(newSettings: any, adminUser?: { id: string; name: string; role: string }): Promise<any> {
  try {
    const db = await getMongoDb();
    if (!db) return null;
    const col = db.collection('system_settings');
    const updated = {
      ...newSettings,
      id: 'system-settings-main',
      updatedAt: new Date().toISOString(),
      updatedByAdminId: adminUser?.id,
    };
    await col.replaceOne({ id: 'system-settings-main' }, updated, { upsert: true });

    if (adminUser) {
      await recordAdminAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        adminRole: adminUser.role,
        action: 'UPDATE_SYSTEM_SETTINGS',
        targetCollection: 'system_settings',
        updatedValue: newSettings,
        reason: 'Super Admin updated platform configuration',
      });
    }

    return updated;
  } catch (e) {
    console.error('[System Settings Update Error]:', e);
    return null;
  }
}


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

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';

const ALLOWED_COLLECTIONS = [
  'users',
  'workerProfiles',
  'contractorProfiles',
  'customerProfiles',
  'bookings',
  'bookingLocations',
  'categories',
  'tenders',
  'tenderApplications',
  'tenderTeams',
  'projects',
  'project_applications',
  'project_assignments',
  'attendance_records',
  'payroll_batches',
  'payout_transactions',
  'wallets',
  'ledgerEntries',
  'earning_ledger',
  'platform_fee_ledger',
  'withdrawals',
  'payments',
  'disputes',
  'notifications',
  'auditLogs',
  'system_settings',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get('collection');
    const search = (searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection offline' }, { status: 503 });
    }

    // 1. If no specific collection requested, return overview of all collections
    if (!collectionName) {
      const liveCols = await db.listCollections().toArray();
      const liveColNames = liveCols.map((c) => c.name);

      const allColNames = Array.from(new Set([...ALLOWED_COLLECTIONS, ...liveColNames]));

      const collectionStats = await Promise.all(
        allColNames.map(async (name) => {
          let count = 0;
          let indexCount = 1;
          try {
            const col = db.collection(name);
            count = await col.countDocuments();
            const indexes = await col.indexes();
            indexCount = indexes.length;
          } catch (e) {
            // collection might not exist yet
          }
          return {
            name,
            count,
            indexCount,
            isCore: ALLOWED_COLLECTIONS.includes(name),
          };
        })
      );

      return NextResponse.json({
        success: true,
        databaseName: 'kaamsetu',
        connected: true,
        totalCollections: collectionStats.length,
        collections: collectionStats.sort((a, b) => b.count - a.count),
      });
    }

    // 2. Query documents inside a specific collection
    if (!ALLOWED_COLLECTIONS.includes(collectionName) && !collectionName.startsWith('audit')) {
      return NextResponse.json({ success: false, error: 'Access to this collection is restricted.' }, { status: 403 });
    }

    const col = db.collection(collectionName);

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { id: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search } },
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } },
          { bookingId: { $regex: search, $options: 'i' } },
          { workerProfileId: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await col.countDocuments(query);
    const skip = (page - 1) * limit;

    const rawDocs = await col
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Sanitize documents: do not expose password hashes even in database explorer
    const sanitizedDocs = rawDocs.map((doc) => {
      const copy = { ...doc };
      if (copy.passwordHash) copy.passwordHash = '•••••••••••••••• [ENCRYPTED BCRYPT]';
      return copy;
    });

    // Detect schema field keys from first 10 documents
    const fieldSet = new Set<string>();
    sanitizedDocs.slice(0, 10).forEach((d) => {
      Object.keys(d).forEach((k) => fieldSet.add(k));
    });

    return NextResponse.json({
      success: true,
      collection: collectionName,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      fields: Array.from(fieldSet),
      documents: sanitizedDocs,
    });
  } catch (error: any) {
    console.error('[Admin Database API Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectionName, documentId, updatedDoc, reason } = body;

    if (!collectionName || !documentId || !updatedDoc) {
      return NextResponse.json({ 
        success: false, 
        error: 'Collection name, document ID, and updated content are required.' 
      }, { status: 400 });
    }

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    let adminName = 'Super Admin';
    let adminRole = 'SUPER_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'SUPER_ADMIN';
      }
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const col = db.collection(collectionName);
    const existing = await col.findOne({ $or: [{ id: documentId }, { _id: documentId as any }] });

    // Protect passwordHash from accidental tampering
    const cleanUpdate = { ...updatedDoc, updatedAt: new Date().toISOString() };
    delete cleanUpdate._id;
    if (existing && existing.passwordHash && !cleanUpdate.passwordHash) {
      cleanUpdate.passwordHash = existing.passwordHash;
    }

    await col.updateOne(
      { $or: [{ id: documentId }, { _id: documentId as any }] },
      { $set: cleanUpdate }
    );

    // Audit log
    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: 'DB_EXPLORER_EDIT_DOCUMENT',
      targetRecord: documentId,
      targetCollection: collectionName,
      previousValue: existing,
      updatedValue: cleanUpdate,
      reason: reason || 'Direct edit performed via Admin Database Explorer.',
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `Document ${documentId} updated successfully in ${collectionName}.`,
    });
  } catch (error: any) {
    console.error('[Database Edit Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

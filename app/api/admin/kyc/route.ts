export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';
import { loadStore, saveStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get('status') || 'ALL').toUpperCase();

    const db = await getMongoDb();
    const store = loadStore();

    let workers: any[] = [];
    let users: any[] = [];

    if (db) {
      try {
        [workers, users] = await Promise.all([
          db.collection('workerProfiles').find({}).toArray(),
          db.collection('users').find({}).toArray(),
        ]);
      } catch (e) {
        console.warn('[Admin KYC API] MongoDB fetch error:', e);
      }
    }

    if (workers.length === 0) workers = store.workerProfiles;
    if (users.length === 0) users = store.users;

    // Filter workers by KYC status
    let kycList = workers.map((w) => {
      const u = users.find((user) => user.id === w.userId);
      const docs = w.documents || [
        {
          id: `doc-${w.id}-1`,
          docType: 'AADHAAR',
          docNumber: `XXXX-XXXX-${w.pincode ? w.pincode.slice(-4) : '4821'}`,
          status: w.verificationStatus || 'SUBMITTED',
          fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
          uploadedAt: w.createdAt,
        },
        {
          id: `doc-${w.id}-2`,
          docType: 'TRADE_CERTIFICATE',
          docNumber: `ITI-CERT-${w.id.slice(-4)}`,
          status: w.verificationStatus || 'SUBMITTED',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
          uploadedAt: w.createdAt,
        }
      ];

      return {
        id: w.id,
        workerProfileId: w.id,
        userId: w.userId,
        fullName: u?.fullName || 'Worker',
        phoneNumber: u?.phoneNumber || 'N/A',
        trade: w.skills?.[0]?.categoryName || w.headline || 'Skilled Professional',
        city: w.city || 'Noida',
        verificationStatus: w.verificationStatus || 'SUBMITTED',
        rejectionReason: w.rejectionReason,
        documents: docs,
        submittedAt: w.createdAt,
        reviewedAt: w.updatedAt,
      };
    });

    if (filter !== 'ALL') {
      if (filter === 'PENDING') {
        kycList = kycList.filter((k) => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(k.verificationStatus));
      } else {
        kycList = kycList.filter((k) => k.verificationStatus === filter);
      }
    }

    return NextResponse.json({
      success: true,
      count: kycList.length,
      kycRecords: kycList,
    });
  } catch (error: any) {
    console.error('[Admin KYC Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workerProfileId, action, reason, internalNotes } = body;

    if (!workerProfileId || !action) {
      return NextResponse.json({ success: false, error: 'Worker profile ID and action are required.' }, { status: 400 });
    }

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    let adminName = 'DigiWork Operations';
    let adminRole = 'KYC_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'KYC_ADMIN';
      }
    }

    let targetStatus = 'VERIFIED';
    if (action === 'REJECT') targetStatus = 'REJECTED';
    else if (action === 'REQUEST_RESUBMISSION') targetStatus = 'SUBMITTED';

    const db = await getMongoDb();
    const store = loadStore();

    // 1. Update in MongoDB Atlas
    if (db) {
      await db.collection('workerProfiles').updateOne(
        { id: workerProfileId },
        { 
          $set: { 
            verificationStatus: targetStatus,
            rejectionReason: reason || undefined,
            adminNotes: internalNotes || undefined,
            updatedAt: new Date().toISOString()
          } 
        }
      );
    }

    // 2. Update store
    const worker = store.workerProfiles.find((w) => w.id === workerProfileId);
    if (worker) {
      worker.verificationStatus = targetStatus as any;
      worker.rejectionReason = reason;
      saveStore();
    }

    // 3. Log audit event
    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: `KYC_${action}`,
      targetRecord: workerProfileId,
      targetCollection: 'workerProfiles',
      updatedValue: { verificationStatus: targetStatus, reason, internalNotes },
      reason: reason || `Admin decision: ${action}`,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `KYC for worker ${workerProfileId} has been updated to ${targetStatus}.`,
      verificationStatus: targetStatus,
    });
  } catch (error: any) {
    console.error('[Admin KYC Decision Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

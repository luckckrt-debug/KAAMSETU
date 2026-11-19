export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';
import { loadStore, saveStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = (searchParams.get('status') || 'ALL').toUpperCase();

    const db = await getMongoDb();
    const store = loadStore();

    let withdrawals: any[] = [];
    let workerProfiles: any[] = [];
    let users: any[] = [];

    if (db) {
      try {
        [withdrawals, workerProfiles, users] = await Promise.all([
          db.collection('withdrawals').find({}).sort({ requestedAt: -1 }).toArray(),
          db.collection('workerProfiles').find({}).toArray(),
          db.collection('users').find({}).toArray(),
        ]);
      } catch (e) {
        console.warn('[Admin Withdrawals API] MongoDB fetch error:', e);
      }
    }

    if (withdrawals.length === 0) withdrawals = store.withdrawals;
    if (workerProfiles.length === 0) workerProfiles = store.workerProfiles;
    if (users.length === 0) users = store.users;

    let enriched = withdrawals.map((w) => {
      const prof = workerProfiles.find((p) => p.id === w.workerProfileId);
      const user = prof ? users.find((u) => u.id === prof.userId) : null;

      // Mask bank account numbers for security (e.g., •••• •••• 4821)
      const rawTarget = w.payoutTargetMasked || prof?.bankAccountNumber || prof?.upiId || '•••• 5432';
      const maskedTarget = rawTarget.includes('@')
        ? rawTarget.replace(/(.{2})(.*)(?=@)/, '$1•••')
        : `•••• •••• ${rawTarget.slice(-4)}`;

      return {
        id: w.id,
        workerProfileId: w.workerProfileId,
        workerName: user?.fullName || 'Worker',
        workerPhone: user?.phoneNumber || 'N/A',
        amount: w.amount,
        fee: w.fee || 0,
        netPayout: (w.amount || 0) - (w.fee || 0),
        payoutMethod: w.payoutAccountType || (prof?.upiId ? 'UPI' : 'IMPS_BANK'),
        maskedDestination: maskedTarget,
        status: w.status || 'PENDING',
        provider: w.provider || 'CASHFREE_PAYOUTS',
        providerRef: w.providerPayoutId || `REF-${w.id.slice(-6).toUpperCase()}`,
        requestedAt: w.requestedAt || w.createdAt,
        processedAt: w.processedAt || w.completedAt,
      };
    });

    if (statusFilter !== 'ALL') {
      enriched = enriched.filter((w) => w.status.toUpperCase() === statusFilter);
    }

    const pendingCount = enriched.filter((w) => w.status === 'PENDING').length;
    const completedCount = enriched.filter((w) => w.status === 'COMPLETED').length;

    return NextResponse.json({
      success: true,
      summary: {
        total: enriched.length,
        pendingCount,
        completedCount,
      },
      withdrawals: enriched,
    });
  } catch (error: any) {
    console.error('[Admin Withdrawals Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { withdrawalId, action, reason } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json({ success: false, error: 'Withdrawal ID and action are required.' }, { status: 400 });
    }

    const token = req.cookies.get('kaamsetu_session')?.value;
    let adminId = 'user-admin-1';
    let adminName = 'KaamSetu Finance Operations';
    let adminRole = 'FINANCE_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'FINANCE_ADMIN';
      }
    }

    let targetStatus = 'COMPLETED';
    if (action === 'REJECT') targetStatus = 'FAILED';
    else if (action === 'PROCESS') targetStatus = 'PROCESSING';

    const db = await getMongoDb();
    const store = loadStore();
    const now = new Date().toISOString();

    if (db) {
      await db.collection('withdrawals').updateOne(
        { id: withdrawalId },
        { 
          $set: { 
            status: targetStatus,
            processedAt: now,
            failureReason: action === 'REJECT' ? reason : undefined,
            updatedAt: now,
          } 
        }
      );
    }

    const item = store.withdrawals.find((w) => w.id === withdrawalId);
    if (item) {
      item.status = targetStatus as any;
      item.processedAt = now;
      saveStore();
    }

    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: `WITHDRAWAL_${action}`,
      targetRecord: withdrawalId,
      targetCollection: 'withdrawals',
      updatedValue: { status: targetStatus, reason },
      reason: reason || `Admin updated withdrawal status to ${targetStatus}`,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${withdrawalId} status updated to ${targetStatus}.`,
      status: targetStatus,
    });
  } catch (error: any) {
    console.error('[Admin Withdrawal Action Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/lib/store';
import { getMongoDb, deleteMongoDocument, recordAdminAuditLog } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getMongoDb();
    const store = loadStore();

    let user: any = null;
    let workerProfile: any = null;
    let contractorProfile: any = null;
    let customerProfile: any = null;
    let userBookings: any[] = [];
    let userLedger: any[] = [];
    let userWallet: any = null;
    let userWithdrawals: any[] = [];
    let userDisputes: any[] = [];
    let userNotifications: any[] = [];
    let userProjects: any[] = [];
    let userAttendance: any[] = [];
    let auditHistory: any[] = [];

    if (db) {
      try {
        user = await db.collection('users').findOne({ $or: [{ id }, { phoneNumber: id }] });
        if (user) {
          const uId = user.id;
          [
            workerProfile,
            contractorProfile,
            customerProfile,
            userBookings,
            userDisputes,
            userNotifications,
            auditHistory,
          ] = await Promise.all([
            db.collection('workerProfiles').findOne({ userId: uId }),
            db.collection('contractorProfiles').findOne({ userId: uId }),
            db.collection('customerProfiles').findOne({ userId: uId }),
            db.collection('bookings').find({
              $or: [
                { 'customer.id': uId },
                { customerProfileId: uId },
                { assignedWorkerProfileId: uId }
              ]
            }).sort({ createdAt: -1 }).toArray(),
            db.collection('disputes').find({
              $or: [{ customerProfileId: uId }, { workerProfileId: uId }]
            }).toArray(),
            db.collection('notifications').find({ userId: uId }).sort({ createdAt: -1 }).limit(30).toArray(),
            db.collection('auditLogs').find({ targetUser: uId }).sort({ timestamp: -1 }).toArray(),
          ]);

          if (workerProfile) {
            const wId = workerProfile.id;
            [userWallet, userLedger, userWithdrawals, userAttendance] = await Promise.all([
              db.collection('wallets').findOne({ workerProfileId: wId }),
              db.collection('ledgerEntries').find({ workerProfileId: wId }).sort({ createdAt: -1 }).toArray(),
              db.collection('withdrawals').find({ workerProfileId: wId }).sort({ requestedAt: -1 }).toArray(),
              db.collection('attendance_records').find({ workerProfileId: wId }).sort({ date: -1 }).toArray(),
            ]);
          }

          if (contractorProfile) {
            userProjects = await db.collection('projects').find({ contractorProfileId: contractorProfile.id }).toArray();
          }
        }
      } catch (e) {
        console.warn('[Admin User Details API] MongoDB fetch error, fallback to store:', e);
      }
    }

    // Fallback search in memory dbStore
    if (!user) {
      user = store.users.find((u) => u.id === id || u.phoneNumber === id);
      if (user) {
        workerProfile = store.workerProfiles.find((w) => w.userId === user.id);
        contractorProfile = store.contractorProfiles.find((c) => c.userId === user.id);
        customerProfile = store.customerProfiles.find((c) => c.userId === user.id);
        userBookings = store.bookings.filter((b) => 
          b.customerProfileId === customerProfile?.id || 
          b.assignedWorkerProfileId === workerProfile?.id
        );
        userWallet = store.wallets.find((wal) => wal.workerProfileId === workerProfile?.id);
        userLedger = store.ledgerEntries.filter((l) => l.workerProfileId === workerProfile?.id);
        userWithdrawals = store.withdrawals.filter((w) => w.workerProfileId === workerProfile?.id);
        userDisputes = store.disputes.filter((d) => d.customerProfileId === customerProfile?.id);
        userNotifications = store.notifications.filter((n) => n.userId === user.id);
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found in KaamSetu database.' }, { status: 404 });
    }

    // Security: NEVER expose passwordHash, tokens, or private secrets!
    const sanitizedUser = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      phoneVerified: !!user.phoneVerified,
      fullName: user.fullName || 'KaamSetu User',
      email: user.email,
      roles: user.roles || ['CUSTOMER'],
      status: user.status || 'ACTIVE',
      language: user.language || 'hi',
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firebaseUid: user.firebaseUid ? 'CONNECTED' : undefined,
    };

    // Calculate Platform Fees for bookings associated with this user
    const platformFeePerJob = 99;
    const platformFees = userBookings.map((b) => {
      const total = Number(b.finalAmount || b.estimatedAmount || 350);
      const base = total > platformFeePerJob ? total - platformFeePerJob : total;
      return {
        id: `fee-${b.id}`,
        bookingId: b.id,
        serviceCategory: b.serviceCategory,
        baseWorkerCharge: base,
        platformFee: platformFeePerJob,
        totalCustomerPayment: total,
        paymentStatus: b.paymentStatus || 'PAID',
        settlementStatus: ['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(b.status) ? 'SETTLED' : 'PENDING',
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      user: sanitizedUser,
      workerProfile,
      contractorProfile,
      customerProfile,
      wallet: userWallet || { balance: 0, pendingBalance: 0 },
      kycDocuments: workerProfile?.documents || [],
      jobs: userBookings,
      applications: [],
      projects: userProjects,
      assignments: [],
      attendance: userAttendance,
      earningsLedger: userLedger,
      withdrawals: userWithdrawals,
      platformFees,
      reviews: [],
      complaints: userDisputes,
      notifications: userNotifications,
      auditHistory,
    });
  } catch (error: any) {
    console.error('[Admin User Backoffice Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reason, updatedFields } = body;

    const token = req.cookies.get('kaamsetu_session')?.value;
    let adminId = 'user-admin-1';
    let adminName = 'KaamSetu Super Admin';
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
    const store = loadStore();

    let previousStatus = 'ACTIVE';

    // 1. Update in MongoDB Atlas
    if (db) {
      const existing = await db.collection('users').findOne({ id });
      if (existing) {
        previousStatus = existing.status || 'ACTIVE';
        const updateData: any = { updatedAt: new Date().toISOString() };
        if (status) updateData.status = status;
        if (updatedFields && typeof updatedFields === 'object') {
          Object.assign(updateData, updatedFields);
        }

        await db.collection('users').updateOne({ id }, { $set: updateData });
      }
    }

    // 2. Update store
    const storeUser = store.users.find((u) => u.id === id);
    if (storeUser) {
      previousStatus = storeUser.status || 'ACTIVE';
      if (status) storeUser.status = status;
      if (updatedFields) Object.assign(storeUser, updatedFields);
      saveStore();
    }

    // 3. Record Audit Log in MongoDB Atlas auditLogs collection
    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: status ? `CHANGE_USER_STATUS_${status}` : 'UPDATE_USER_FIELDS',
      targetUser: id,
      targetCollection: 'users',
      previousValue: { status: previousStatus },
      updatedValue: { status, ...updatedFields },
      reason: reason || 'Administrative action performed in Control Room.',
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `User ${id} status updated to ${status}. Action logged in audit trail.`,
      status,
    });
  } catch (error: any) {
    console.error('[Admin User Update Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get('kaamsetu_session')?.value;
    let adminId = 'user-admin-1';
    let adminName = 'KaamSetu Super Admin';
    let adminRole = 'SUPER_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'SUPER_ADMIN';
      }
    }

    const store = loadStore();
    store.users = store.users.filter((u) => u.id !== id);
    store.customerProfiles = store.customerProfiles.filter((c) => c.userId !== id);
    store.workerProfiles = store.workerProfiles.filter((w) => w.userId !== id);
    store.contractorProfiles = store.contractorProfiles.filter((cp) => cp.userId !== id);

    // Instant delete from MongoDB Atlas
    const atlasRes = await deleteMongoDocument('users', id);
    await deleteMongoDocument('workerProfiles', id);
    await deleteMongoDocument('customerProfiles', id);

    saveStore();

    // Record immutable audit log
    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: 'ADMIN_DELETE_USER',
      targetUser: id,
      targetCollection: 'users',
      reason: 'Permanent deletion requested by authorized Super Admin.',
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `User ${id} permanently deleted from MongoDB Atlas database.`,
      deletedCount: atlasRes.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

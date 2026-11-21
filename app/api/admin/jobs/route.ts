export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';
import { loadStore, saveStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = (searchParams.get('status') || 'ALL').toUpperCase();
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const db = await getMongoDb();
    const store = loadStore();

    let bookings: any[] = [];
    let users: any[] = [];
    let workerProfiles: any[] = [];

    if (db) {
      try {
        [bookings, users, workerProfiles] = await Promise.all([
          db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray(),
          db.collection('users').find({}).toArray(),
          db.collection('workerProfiles').find({}).toArray(),
        ]);
      } catch (e) {
        console.warn('[Admin Jobs API] MongoDB error, falling back to store:', e);
      }
    }

    if (bookings.length === 0) bookings = store.bookings;
    if (users.length === 0) users = store.users;
    if (workerProfiles.length === 0) workerProfiles = store.workerProfiles;

    const platformFee = 99;

    let enrichedJobs = bookings.map((b) => {
      const custUser = b.customer || users.find((u) => u.id === b.customerProfileId);
      const workerProf = workerProfiles.find((w) => w.id === b.assignedWorkerProfileId);
      const workerUser = workerProf ? users.find((u) => u.id === workerProf.userId) : null;

      const totalAmt = Number(b.finalAmount || b.estimatedAmount || 449);
      const baseCharge = totalAmt > platformFee ? totalAmt - platformFee : totalAmt;

      return {
        id: b.id,
        serviceCategory: b.serviceCategory || 'Service',
        customerName: custUser?.fullName || 'Customer',
        customerPhone: custUser?.phoneNumber || 'N/A',
        workerName: workerUser?.fullName || b.assignedWorkerProfileId || 'Unassigned',
        workerPhone: workerUser?.phoneNumber || 'N/A',
        workerBaseCharge: baseCharge,
        platformFee: platformFee,
        totalCustomerPrice: totalAmt,
        location: b.addressLine || 'Delhi NCR',
        city: b.city || 'Noida',
        status: b.status || 'REQUESTED',
        paymentStatus: b.paymentStatus || 'PENDING',
        createdAt: b.createdAt,
        completedAt: b.completedAt,
      };
    });

    if (statusFilter !== 'ALL') {
      enrichedJobs = enrichedJobs.filter((j) => j.status.toUpperCase() === statusFilter);
    }

    if (search) {
      enrichedJobs = enrichedJobs.filter((j) =>
        j.id.toLowerCase().includes(search) ||
        j.serviceCategory.toLowerCase().includes(search) ||
        j.customerName.toLowerCase().includes(search) ||
        j.workerName.toLowerCase().includes(search) ||
        j.city.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: enrichedJobs.length,
      jobs: enrichedJobs,
    });
  } catch (error: any) {
    console.error('[Admin Jobs Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, newStatus, reason } = body;

    if (!jobId || !newStatus) {
      return NextResponse.json({ success: false, error: 'Job ID and new status are required.' }, { status: 400 });
    }

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    let adminName = 'DigiWork Operations';
    let adminRole = 'OPERATIONS_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'OPERATIONS_ADMIN';
      }
    }

    const db = await getMongoDb();
    const store = loadStore();

    if (db) {
      await db.collection('bookings').updateOne(
        { id: jobId },
        { $set: { status: newStatus, updatedAt: new Date().toISOString() } }
      );
    }

    const booking = store.bookings.find((b) => b.id === jobId);
    if (booking) {
      booking.status = newStatus as any;
      saveStore();
    }

    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: `JOB_STATUS_CHANGE_${newStatus}`,
      targetRecord: jobId,
      targetCollection: 'bookings',
      reason: reason || `Admin updated job status to ${newStatus}`,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `Job ${jobId} status updated to ${newStatus}.`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('[Admin Job Status Change Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

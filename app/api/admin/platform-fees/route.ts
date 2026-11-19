export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
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
        console.warn('[Admin Platform Fees API] MongoDB fetch warning:', e);
      }
    }

    if (bookings.length === 0) bookings = store.bookings;
    if (users.length === 0) users = store.users;
    if (workerProfiles.length === 0) workerProfiles = store.workerProfiles;

    const platformFeeAmount = 99;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let totalFeesCollected = 0;
    let todayFees = 0;
    let weeklyFees = 0;
    let monthlyFees = 0;
    let pendingFees = 0;
    let refundedFees = 0;

    const ledgerEntries = bookings.map((b) => {
      const custUser = b.customer || users.find((u) => u.id === b.customerProfileId);
      const workerProf = workerProfiles.find((w) => w.id === b.assignedWorkerProfileId);
      const workerUser = workerProf ? users.find((u) => u.id === workerProf.userId) : null;

      const totalAmt = Number(b.finalAmount || b.estimatedAmount || 449);
      const baseCharge = totalAmt > platformFeeAmount ? totalAmt - platformFeeAmount : totalAmt;
      const bStatus = (b.status || '').toUpperCase();
      const isSettled = ['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(bStatus);
      const isCancelled = bStatus === 'CANCELLED';
      const isDisputed = bStatus === 'DISPUTED';

      let settlementStatus = 'PENDING';
      let paymentStatus = 'PENDING';

      if (isSettled) {
        settlementStatus = 'SETTLED';
        paymentStatus = 'PAID';
        totalFeesCollected += platformFeeAmount;

        const bookingTime = new Date(b.createdAt || 0).getTime();
        if (bookingTime >= startOfToday) todayFees += platformFeeAmount;
        if (bookingTime >= startOfWeek) weeklyFees += platformFeeAmount;
        if (bookingTime >= startOfMonth) monthlyFees += platformFeeAmount;
      } else if (isCancelled || isDisputed) {
        settlementStatus = 'REFUNDED';
        paymentStatus = 'REFUNDED';
        refundedFees += platformFeeAmount;
      } else {
        pendingFees += platformFeeAmount;
      }

      return {
        id: `pfl-${b.id}`,
        bookingId: b.id,
        customerId: b.customerProfileId,
        customerName: custUser?.fullName || 'Customer',
        workerId: b.assignedWorkerProfileId || 'Unassigned',
        workerName: workerUser?.fullName || 'Assigned Worker',
        serviceCategory: b.serviceCategory || 'Service',
        baseWorkerCharge: baseCharge,
        platformFee: platformFeeAmount,
        totalCustomerPayment: totalAmt,
        paymentStatus,
        settlementStatus,
        refundAmount: isCancelled ? platformFeeAmount : 0,
        providerTransactionRef: `TXN-KAAMSETU-${b.id.slice(-6).toUpperCase()}`,
        createdAt: b.createdAt,
        settledAt: isSettled ? b.completedAt || b.createdAt : undefined,
      };
    });

    const netPlatformFeeRevenue = totalFeesCollected - refundedFees;

    return NextResponse.json({
      success: true,
      summary: {
        totalFeesCollected,
        todayFees,
        weeklyFees,
        monthlyFees,
        pendingFees,
        refundedFees,
        netPlatformFeeRevenue,
        feePerJob: platformFeeAmount,
        totalTransactions: ledgerEntries.length,
      },
      ledgerEntries,
    });
  } catch (error: any) {
    console.error('[Admin Platform Fee Ledger Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

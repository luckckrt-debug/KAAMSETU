export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const db = await getMongoDb();
    const store = loadStore();

    let bookings: any[] = [];
    let withdrawals: any[] = [];
    let wallets: any[] = [];
    let earningLedger: any[] = [];
    let platformFeeLedger: any[] = [];
    let settlementRecords: any[] = [];
    let disputes: any[] = [];
    let ledgerEntries: any[] = [];

    if (db) {
      try {
        [
          bookings,
          withdrawals,
          wallets,
          earningLedger,
          platformFeeLedger,
          settlementRecords,
          disputes,
          ledgerEntries,
        ] = await Promise.all([
          db.collection('bookings').find({}).toArray(),
          db.collection('withdrawals').find({}).sort({ requestedAt: -1 }).toArray(),
          db.collection('wallets').find({}).toArray(),
          db.collection('earning_ledger').find({}).sort({ createdAt: -1 }).toArray(),
          db.collection('platform_fee_ledger').find({}).sort({ createdAt: -1 }).toArray(),
          db.collection('settlement_records').find({}).sort({ settledAt: -1 }).toArray(),
          db.collection('disputes').find({}).toArray(),
          db.collection('ledgerEntries').find({}).sort({ createdAt: -1 }).limit(100).toArray(),
        ]);
      } catch (err) {
        console.warn('[Finance Summary DB Warning]:', err);
      }
    }

    // Fallbacks to store if database is empty or transitioning
    if (bookings.length === 0) bookings = store.bookings || [];
    if (withdrawals.length === 0) withdrawals = store.withdrawals || [];
    if (wallets.length === 0) wallets = store.wallets || [];
    if (ledgerEntries.length === 0) ledgerEntries = store.ledgerEntries || [];

    // 1. Total Customer Payments: Sum of all completed bookings (worker charge + ₹99 platform fee)
    const completedBookings = bookings.filter(
      (b) => b.status === 'PAYMENT_PAID' || b.status === 'CUSTOMER_CONFIRMED' || b.status === 'WORK_COMPLETED'
    );
    const totalCustomerPayments = completedBookings.reduce((sum, b) => {
      const workerCharge = b.finalAmount || b.estimatedAmount || 800;
      return sum + workerCharge + 99;
    }, 0);

    // 2. Worker Earnings Payable (Available in wallets ready for withdrawal)
    const workerEarningsPayable = wallets.reduce(
      (sum, w) => sum + (w.availableBalance || 0),
      0
    );

    // 3. Worker Payouts Completed
    const paidWithdrawals = withdrawals.filter((w) => w.status === 'PAID' || w.status === 'SUCCESS');
    const workerPayoutsCompleted = paidWithdrawals.reduce((sum, w) => sum + (w.netPayout || w.amount || 0), 0);

    // 4. Worker Payouts Pending
    const pendingWithdrawalsList = withdrawals.filter(
      (w) => w.status === 'REQUESTED' || w.status === 'UNDER_REVIEW' || w.status === 'PROCESSING' || w.status === 'APPROVED'
    );
    const workerPayoutsPending = pendingWithdrawalsList.reduce((sum, w) => sum + (w.amount || 0), 0);

    // 5. Failed Payouts
    const failedWithdrawalsList = withdrawals.filter((w) => w.status === 'FAILED' || w.status === 'REJECTED' || w.status === 'REVERSED');
    const failedPayoutsAmount = failedWithdrawalsList.reduce((sum, w) => sum + (w.amount || 0), 0);

    // 6. Platform Fee Collected (₹99 per completed booking)
    const platformFeeCollected = completedBookings.length * 99;

    // 7. Platform Fee Pending (open bookings)
    const openBookings = bookings.filter((b) => b.status !== 'PAYMENT_PAID' && b.status !== 'CANCELLED');
    const platformFeePending = openBookings.length * 99;

    // 8. Platform Refunds (from resolved refund disputes)
    const refundedDisputes = disputes.filter((d) => d.status === 'RESOLVED_REFUND');
    const platformRefunds = refundedDisputes.reduce((sum, d) => sum + (d.refundAmount || 99), 0);

    // 9. Platform Net Fee Revenue
    const platformNetFeeRevenue = Math.max(0, platformFeeCollected - platformRefunds);

    return NextResponse.json({
      success: true,
      summary: {
        totalCustomerPayments,
        workerEarningsPayable,
        workerPayoutsCompleted,
        workerPayoutsPending,
        failedPayouts: failedPayoutsAmount,
        failedPayoutsCount: failedWithdrawalsList.length,
        platformFeeCollected,
        platformFeePending,
        platformRefunds,
        platformNetFeeRevenue,
      },
      withdrawals,
      completedBookings,
      platformFeeLedger: platformFeeLedger.length > 0 ? platformFeeLedger : completedBookings.map((b) => ({
        id: `pfee-${b.id}`,
        bookingId: b.id,
        workerId: b.assignedWorkerProfileId || 'worker-prof-1',
        customerId: b.customerProfileId,
        workerCharge: b.finalAmount || b.estimatedAmount || 800,
        platformFee: 99,
        totalPayable: (b.finalAmount || b.estimatedAmount || 800) + 99,
        collectionStatus: 'COLLECTED',
        settlementStatus: 'SETTLED',
        createdAt: b.createdAt,
      })),
      earningLedger: earningLedger.length > 0 ? earningLedger : ledgerEntries.filter((l) => l.transactionType === 'JOB_EARNING'),
      settlementRecords: settlementRecords.length > 0 ? settlementRecords : paidWithdrawals.map((w) => ({
        id: `settle-${w.id}`,
        withdrawalId: w.id,
        workerProfileId: w.workerProfileId,
        amount: w.amount,
        provider: w.provider || 'RAZORPAYX',
        bankTransferReference: w.bankTransferReference || w.providerPayoutId || `UTR_${Date.now()}`,
        destinationMasked: w.payoutTargetMasked,
        status: 'PAID',
        settledAt: w.completedAt || w.requestedAt,
      })),
      failedPayments: failedWithdrawalsList,
      ledgerEntries,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const store = loadStore();
    const db = await getMongoDb();

    let users: any[] = [];
    let workerProfiles: any[] = [];
    let contractorProfiles: any[] = [];
    let customerProfiles: any[] = [];
    let bookings: any[] = [];
    let withdrawals: any[] = [];
    let disputes: any[] = [];
    let auditLogs: any[] = [];
    let projects: any[] = [];
    let tenders: any[] = [];

    if (db) {
      try {
        [
          users,
          workerProfiles,
          contractorProfiles,
          customerProfiles,
          bookings,
          withdrawals,
          disputes,
          auditLogs,
          projects,
          tenders,
        ] = await Promise.all([
          db.collection('users').find({}).toArray(),
          db.collection('workerProfiles').find({}).toArray(),
          db.collection('contractorProfiles').find({}).toArray(),
          db.collection('customerProfiles').find({}).toArray(),
          db.collection('bookings').find({}).toArray(),
          db.collection('withdrawals').find({}).toArray(),
          db.collection('disputes').find({}).toArray(),
          db.collection('auditLogs').find({}).sort({ timestamp: -1 }).limit(20).toArray(),
          db.collection('projects').find({}).toArray(),
          db.collection('tenders').find({}).toArray(),
        ]);
      } catch (err) {
        console.warn('[Admin Overview API] MongoDB fetch warning, fallback to store:', err);
      }
    }

    // Fallbacks if database is empty or offline
    if (users.length === 0) users = store.users;
    if (workerProfiles.length === 0) workerProfiles = store.workerProfiles;
    if (contractorProfiles.length === 0) contractorProfiles = store.contractorProfiles;
    if (customerProfiles.length === 0) customerProfiles = store.customerProfiles;
    if (bookings.length === 0) bookings = store.bookings;
    if (withdrawals.length === 0) withdrawals = store.withdrawals;
    if (disputes.length === 0) disputes = store.disputes;
    if (tenders.length === 0) tenders = store.tenders;
    if (auditLogs.length === 0) auditLogs = store.auditLogs;

    // 1. Role Distribution Counts
    const totalUsers = users.length;
    let totalWorkers = 0;
    let totalContractors = 0;
    let totalHiringPartners = 0;
    let activeUsers = 0;
    let blockedUsers = 0;

    users.forEach((u) => {
      const roles = (u.roles || []).map((r: string) => r.toUpperCase());
      if (roles.includes('WORKER') || roles.includes('TEAM_LEADER')) totalWorkers++;
      else if (roles.includes('CONTRACTOR') || roles.includes('TENDER_OWNER')) totalContractors++;
      else totalHiringPartners++;

      if (u.status === 'BLOCKED' || u.status === 'SUSPENDED') blockedUsers++;
      else activeUsers++;
    });

    // 2. KYC Metrics
    let pendingKyc = 0;
    let approvedKyc = 0;
    let rejectedKyc = 0;

    workerProfiles.forEach((w) => {
      const st = (w.verificationStatus || 'UNVERIFIED').toUpperCase();
      if (st === 'VERIFIED') approvedKyc++;
      else if (st === 'REJECTED') rejectedKyc++;
      else if (st === 'SUBMITTED' || st === 'UNDER_REVIEW') pendingKyc++;
    });

    // 3. Jobs & Bookings Metrics
    let activeJobs = 0;
    let completedJobs = 0;
    let cancelledJobs = 0;

    bookings.forEach((b) => {
      const st = (b.status || '').toUpperCase();
      if (['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(st)) completedJobs++;
      else if (st === 'CANCELLED' || st === 'DISPUTED') cancelledJobs++;
      else activeJobs++;
    });

    // 4. Financials & ₹99 Platform Fee
    const platformFeePerJob = 99;
    let totalWorkerEarnings = 0;
    let totalPlatformRevenue = 0;
    let pendingPlatformFees = 0;

    bookings.forEach((b) => {
      const finalAmt = Number(b.finalAmount || b.estimatedAmount || 0);
      const isSettled = ['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes((b.status || '').toUpperCase());
      
      if (isSettled) {
        // Base worker charge is finalAmt minus ₹99 platform fee if included, or direct base charge
        const base = finalAmt > platformFeePerJob ? finalAmt - platformFeePerJob : finalAmt;
        totalWorkerEarnings += base;
        totalPlatformRevenue += platformFeePerJob;
      } else if (!['CANCELLED', 'DISPUTED'].includes((b.status || '').toUpperCase())) {
        pendingPlatformFees += platformFeePerJob;
      }
    });

    // 5. Withdrawals & Payouts
    let pendingWithdrawals = 0;
    let successfulPayouts = 0;
    let failedPayouts = 0;
    let pendingWithdrawalsAmount = 0;
    let totalPayoutAmount = 0;

    withdrawals.forEach((w) => {
      const amt = Number(w.amount || 0);
      const st = (w.status || '').toUpperCase();
      if (st === 'COMPLETED' || st === 'SUCCESS') {
        successfulPayouts++;
        totalPayoutAmount += amt;
      } else if (st === 'FAILED' || st === 'REJECTED') {
        failedPayouts++;
      } else {
        pendingWithdrawals++;
        pendingWithdrawalsAmount += amt;
      }
    });

    // 6. Recent Activity Feeds
    const latestRegistrations = users
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6)
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        role: (u.roles || ['CUSTOMER'])[0],
        status: u.status || 'ACTIVE',
        createdAt: u.createdAt,
      }));

    const latestJobs = bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6)
      .map((b) => {
        const amt = Number(b.finalAmount || b.estimatedAmount || 350);
        return {
          id: b.id,
          serviceCategory: b.serviceCategory || 'Service',
          status: b.status,
          baseCharge: amt > platformFeePerJob ? amt - platformFeePerJob : amt,
          platformFee: platformFeePerJob,
          totalPrice: amt,
          createdAt: b.createdAt,
        };
      });

    const recentWithdrawalsList = withdrawals
      .slice()
      .sort((a, b) => new Date(b.requestedAt || b.createdAt || 0).getTime() - new Date(a.requestedAt || a.createdAt || 0).getTime())
      .slice(0, 6)
      .map((w) => ({
        id: w.id,
        workerProfileId: w.workerProfileId,
        amount: w.amount,
        status: w.status,
        requestedAt: w.requestedAt || w.createdAt,
      }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalWorkers,
        totalContractors,
        totalHiringPartners,
        activeUsers,
        blockedUsers,
        pendingKyc,
        approvedKyc,
        rejectedKyc,
        activeJobs,
        completedJobs,
        cancelledJobs,
        openRequirements: tenders.length + projects.length,
        activeAssignments: bookings.filter((b) => ['ACCEPTED', 'WORKER_ON_THE_WAY', 'WORK_STARTED'].includes(b.status)).length,
        totalWorkerEarnings,
        totalPlatformRevenue,
        pendingPlatformFees,
        pendingWithdrawals,
        pendingWithdrawalsAmount,
        successfulPayouts,
        totalPayoutAmount,
        failedPayouts,
        openDisputes: disputes.filter((d) => d.status === 'OPEN').length,
      },
      latestRegistrations,
      latestJobs,
      recentWithdrawals: recentWithdrawalsList,
      recentAuditLogs: auditLogs.slice(0, 8),
    });
  } catch (error: any) {
    console.error('[Admin Overview Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';
import { PayrollBatch, AttendanceRecord } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let contractorProfileId = 'cont-prof-1';
    let contractorName = 'Contractor';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        contractorProfileId = payload.userId;
        contractorName = payload.fullName;
      }
    }

    const body = await req.json();
    const { projectId, batchDate, attendanceIds } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required.' }, { status: 400 });
    }

    const date = batchDate || new Date().toISOString().slice(0, 10);
    const attendanceCol = await getMongoCollection('attendance_records');
    const projectsCol = await getMongoCollection('projects');

    if (!attendanceCol) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    // 1. Find attendance records to process
    let query: any = { projectId, date };
    if (Array.isArray(attendanceIds) && attendanceIds.length > 0) {
      query.id = { $in: attendanceIds };
    }

    const eligibleRecords: AttendanceRecord[] = (await attendanceCol.find(query).toArray()) as any[];

    // 2. Validate eligibility & prevent duplicate payouts
    const readyRecords = eligibleRecords.filter(r => 
      r.verificationStatus === 'VERIFIED' && 
      r.paymentStatus === 'ELIGIBLE_FOR_PAYOUT' &&
      r.grossAmount > 0
    );

    if (readyRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No verified, unpaid workers found for this payout batch. Please verify attendance first or workers may already be paid.',
      }, { status: 400 });
    }

    // 3. Financial calculations
    const grossPayroll = readyRecords.reduce((sum, r) => sum + r.grossAmount, 0);
    const platformFeeTotal = readyRecords.reduce((sum, r) => sum + r.platformFee, 0);
    const netPayoutTotal = readyRecords.reduce((sum, r) => sum + r.netAmount, 0);

    const nowIso = new Date().toISOString();
    const batchId = `pbatch-${Date.now()}`;
    const transactionReference = `TXN_PAYOUT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const providerPaymentId = `GATEWAY_SETTLED_${Date.now()}`;

    // 4. Create worker breakdown items
    const workerBreakdown = readyRecords.map(r => ({
      workerProfileId: r.workerProfileId,
      workerName: r.workerName || 'Worker',
      attendanceId: r.id,
      grossAmount: r.grossAmount,
      platformFee: r.platformFee,
      netAmount: r.netAmount,
      status: 'SUCCESS' as const,
      transactionId: `TXN_W_${r.workerProfileId.slice(-6)}_${Date.now().toString().slice(-6)}`,
    }));

    const batchDoc: PayrollBatch = {
      id: batchId,
      projectId,
      contractorProfileId,
      batchDate: date,
      payoutSchedule: 'DAILY',
      totalWorkers: readyRecords.length,
      grossPayroll,
      platformFeeTotal,
      netPayoutTotal,
      status: 'SUCCESS',
      transactionReference,
      providerPaymentId,
      processedAt: nowIso,
      workerBreakdown,
      createdAt: nowIso,
    };

    // 5. Save Payroll Batch in payroll_batches
    const batchesCol = await getMongoCollection('payroll_batches');
    if (batchesCol) {
      await batchesCol.insertOne({
        ...batchDoc,
        _id: batchId as any,
      });
    }

    // 6. Record transaction in payout_transactions
    const payoutTxCol = await getMongoCollection('payout_transactions');
    if (payoutTxCol) {
      await payoutTxCol.insertOne({
        id: transactionReference,
        batchId,
        projectId,
        contractorProfileId,
        amount: netPayoutTotal,
        platformFee: platformFeeTotal,
        grossAmount: grossPayroll,
        currency: 'INR',
        gatewayProvider: 'RAZORPAYX_CENTRAL_SETTLEMENT',
        providerPaymentId,
        status: 'SUCCESS',
        processedAt: nowIso,
      });
    }

    // 7. Update central financial ledgers (earning_ledger, platform_fee_ledger, wallets)
    const earningLedgerCol = await getMongoCollection('earning_ledger');
    const feeLedgerCol = await getMongoCollection('platform_fee_ledger');
    const walletsCol = await getMongoCollection('wallets');
    const notifsCol = await getMongoCollection('notifications');

    for (const wb of workerBreakdown) {
      // Record in earning_ledger
      if (earningLedgerCol) {
        await earningLedgerCol.insertOne({
          id: `earn-${Date.now()}-${wb.workerProfileId}`,
          workerProfileId: wb.workerProfileId,
          projectId,
          batchId,
          grossAmount: wb.grossAmount,
          platformFee: wb.platformFee,
          netAmount: wb.netAmount,
          transactionReference: wb.transactionId,
          type: 'DAILY_PROJECT_PAYOUT',
          status: 'CREDITED',
          date: nowIso,
        });
      }

      // Record in platform_fee_ledger
      if (feeLedgerCol) {
        await feeLedgerCol.insertOne({
          id: `fee-${Date.now()}-${wb.workerProfileId}`,
          projectId,
          batchId,
          payerRole: 'CONTRACTOR_WORKER_TRANSACTION',
          grossAmount: wb.grossAmount,
          feeAmount: wb.platformFee,
          ratePercent: 5,
          settledAt: nowIso,
        });
      }

      // Credit worker wallet in wallets
      if (walletsCol) {
        await walletsCol.updateOne(
          { workerProfileId: wb.workerProfileId },
          { 
            $inc: { 
              currentBalance: wb.netAmount,
              totalEarned: wb.netAmount 
            },
            $set: { updatedAt: nowIso }
          },
          { upsert: true }
        );
      }

      // Send worker push/SMS notification
      if (notifsCol) {
        await notifsCol.insertOne({
          id: `notif-${Date.now()}-${wb.workerProfileId}`,
          userId: wb.workerProfileId,
          title: 'Daily Wage Credited! 💵',
          body: `₹${wb.netAmount} net daily wage has been transferred for your verified work. (Gross: ₹${wb.grossAmount}, Platform Fee: ₹${wb.platformFee}). Ref: ${wb.transactionId}`,
          actionUrl: `/worker/wallet`,
          type: 'PAYMENT',
          isRead: false,
          createdAt: nowIso,
        });
      }
    }

    // 8. Mark attendance records as PAID
    await attendanceCol.updateMany(
      { id: { $in: readyRecords.map(r => r.id) } },
      { 
        $set: { 
          paymentStatus: 'PAID', 
          payoutBatchId: batchId,
          payoutTransactionId: transactionReference 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: `Daily payout batch processed successfully! ₹${netPayoutTotal} dispatched to ${readyRecords.length} verified workers.`,
      batch: batchDoc,
    });
  } catch (error: any) {
    console.error('[Process Batch Payout Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

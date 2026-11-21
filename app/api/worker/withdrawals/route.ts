import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore } from '@/lib/store';
import { requestWorkerWithdrawal } from '@/lib/financial-ledger';
import { getMongoDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let workerProfileId = 'worker-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const db = await getMongoDb();
    let withdrawals: any[] = [];
    if (db) {
      withdrawals = await db
        .collection('withdrawals')
        .find({ workerProfileId })
        .sort({ requestedAt: -1 })
        .toArray();
    }

    if (withdrawals.length === 0) {
      const store = loadStore();
      withdrawals = (store.withdrawals || [])
        .filter((w) => w.workerProfileId === workerProfileId)
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let workerProfileId = 'worker-prof-1';
    let workerObj: any = null;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        workerObj = dbStore.getWorkerById(payload.userId);
        if (workerObj) workerProfileId = workerObj.id;
      }
    }

    // Payout Eligibility Check: Ensure KYC status is VERIFIED
    if (workerObj && workerObj.verificationStatus === 'REJECTED') {
      return NextResponse.json(
        { success: false, error: 'Your KYC was rejected. Please resubmit your identity documents to enable payouts.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { payoutAccountId, amount, idempotencyKey } = body;

    if (!payoutAccountId || !amount) {
      return NextResponse.json(
        { success: false, error: 'payoutAccountId and amount are required' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    const store = loadStore();
    const account = store.payoutAccounts?.find(
      (p) => p.id === payoutAccountId && p.workerProfileId === workerProfileId
    );

    if (!account) {
      return NextResponse.json({ success: false, error: 'Payout destination account not found' }, { status: 404 });
    }

    const destinationMasked =
      account.accountType === 'UPI'
        ? account.upiId || 'UPI'
        : `${account.bankName || 'Bank'} (${account.accountNumberMasked || '•••• 4421'})`;

    const result = await requestWorkerWithdrawal({
      workerProfileId,
      amount: numAmount,
      payoutAccountId,
      destinationType: account.accountType,
      destinationMasked,
      idempotencyKey,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request created successfully. Funds reserved pending settlement.',
      withdrawal: result.withdrawal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

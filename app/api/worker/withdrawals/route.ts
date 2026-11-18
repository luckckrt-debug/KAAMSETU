import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let workerProfileId = 'worker-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const store = loadStore();
    const withdrawals = (store.withdrawals || [])
      .filter(w => w.workerProfileId === workerProfileId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

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
    const token = req.cookies.get('kaamsetu_session')?.value;
    let workerProfileId = 'worker-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const body = await req.json();
    const { payoutAccountId, amount, idempotencyKey } = body;

    if (!payoutAccountId || !amount) {
      return NextResponse.json(
        { success: false, error: 'payoutAccountId and amount are required' },
        { status: 400 }
      );
    }

    const result = await dbStore.requestWithdrawal({
      workerProfileId,
      payoutAccountId,
      amount: Number(amount),
      idempotencyKey,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request created successfully.',
      withdrawal: result.withdrawal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

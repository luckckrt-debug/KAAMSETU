import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';

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

    const wallet = dbStore.getWorkerWallet(workerProfileId);
    const payoutAccounts = dbStore.getPayoutAccounts(workerProfileId);

    return NextResponse.json({
      success: true,
      wallet,
      payoutAccounts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

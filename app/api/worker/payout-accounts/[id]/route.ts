import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const removed = dbStore.deletePayoutAccount(workerProfileId, params.id);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Payout account not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payout account removed.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

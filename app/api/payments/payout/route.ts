import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore, saveStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.roles.includes('WORKER')) {
      return NextResponse.json({ success: false, error: 'Worker role required' }, { status: 403 });
    }

    const worker = dbStore.getWorkerById(payload.userId);
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    const body = await req.json();
    const { payoutId } = body;

    const store = loadStore();
    const payout = store.payouts.find(p => p.id === payoutId && p.workerProfileId === worker.id);

    if (!payout) {
      return NextResponse.json({ success: false, error: 'Payout record not found' }, { status: 404 });
    }

    if (payout.status === 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Payout already completed' }, { status: 400 });
    }

    // Process payout through instant UPI transfer simulation
    payout.status = 'COMPLETED';
    payout.providerRef = `upi_txn_${Date.now()}`;
    payout.processedAt = new Date().toISOString();
    saveStore();

    return NextResponse.json({
      success: true,
      message: `₹${payout.amount} transferred to UPI ${worker.upiId || 'registered bank account'}.`,
      payout,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';
import { verifyPayoutWebhookSignature } from '@/lib/payout';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('x-payout-signature');
    const secret = process.env.PAYOUT_WEBHOOK_SECRET || process.env.RAZORPAYX_KEY_SECRET || 'rzp_payout_secret_kaamsetu';

    if (signature && process.env.NODE_ENV === 'production') {
      const isValid = verifyPayoutWebhookSignature(rawBody, signature, secret);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid payout webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event || 'payout.processed';
    const payoutEntity = payload.payload?.payout?.entity || payload.payout || payload;

    const providerPayoutId = payoutEntity.id || payload.providerPayoutId;
    const withdrawalId = payoutEntity.reference_id || payload.withdrawalId;

    const store = loadStore();
    const withdrawal = store.withdrawals?.find(w => w.id === withdrawalId || w.providerPayoutId === providerPayoutId);

    if (!withdrawal) {
      return NextResponse.json({ success: true, message: 'Withdrawal not found or already processed' });
    }

    if (event === 'payout.processed' || event === 'payout.success') {
      dbStore.finalizeWithdrawal(withdrawal.id, true, providerPayoutId);
      return NextResponse.json({
        success: true,
        message: `Withdrawal ${withdrawal.id} marked as SUCCESS.`,
      });
    } else if (event === 'payout.reversed' || event === 'payout.failed' || event === 'payout.rejected') {
      const reason = payoutEntity.failure_reason || payload.failureReason || 'Payout provider failed transfer';
      dbStore.finalizeWithdrawal(withdrawal.id, false, providerPayoutId, reason);
      return NextResponse.json({
        success: true,
        message: `Withdrawal ${withdrawal.id} marked as FAILED. Funds restored to wallet.`,
      });
    }

    return NextResponse.json({ success: true, message: `Ignored payout event: ${event}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

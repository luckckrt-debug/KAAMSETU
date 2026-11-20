export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';
import { verifyPayoutWebhookSignature } from '@/lib/payout';
import { finalizeWorkerWithdrawal } from '@/lib/financial-ledger';
import { getMongoDb } from '@/lib/mongodb';

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

    // Log incoming webhook event in webhook_events collection
    const db = await getMongoDb();
    if (db) {
      try {
        await db.collection('webhook_events').insertOne({
          id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          event,
          provider: 'RAZORPAYX',
          providerPayoutId,
          withdrawalId,
          rawPayload: payload,
          receivedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[Webhook Event Log Error]:', e);
      }
    }

    const store = loadStore();
    const withdrawal = store.withdrawals?.find(w => w.id === withdrawalId || w.providerPayoutId === providerPayoutId);

    if (!withdrawal) {
      return NextResponse.json({ success: true, message: 'Withdrawal not found or already processed' });
    }

    if (event === 'payout.processed' || event === 'payout.success') {
      const utr = payoutEntity.utr || payload.utr || `UTR_${Date.now()}`;
      await finalizeWorkerWithdrawal({
        withdrawalId: withdrawal.id,
        isSuccess: true,
        bankTransferReference: utr,
        providerPayoutId,
        adminId: 'webhook',
        adminName: 'Gateway Webhook Event',
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal ${withdrawal.id} marked as PAID.`,
      });
    } else if (event === 'payout.reversed' || event === 'payout.failed' || event === 'payout.rejected') {
      const reason = payoutEntity.failure_reason || payload.failureReason || 'Payout provider failed transfer';
      await finalizeWorkerWithdrawal({
        withdrawalId: withdrawal.id,
        isSuccess: false,
        failureReason: reason,
        adminId: 'webhook',
        adminName: 'Gateway Webhook Event',
      });

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

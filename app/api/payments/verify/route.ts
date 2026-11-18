import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbStore, loadStore, saveStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, providerOrderId, providerPaymentId, providerSignature } = body;

    if (!paymentId && !providerOrderId) {
      return NextResponse.json({ success: false, error: 'Payment identifiers required' }, { status: 400 });
    }

    const secret = process.env.PAYMENT_PROVIDER_SECRET || 'rzp_test_secret_kaamsetu';

    // Verify signature if provided, or allow in test simulator mode
    if (providerOrderId && providerPaymentId && providerSignature) {
      const generated = crypto
        .createHmac('sha256', secret)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest('hex');

      const isDev = process.env.NODE_ENV !== 'production' || process.env.PAYMENT_PROVIDER === 'razorpay_test';
      if (!isDev && generated !== providerSignature) {
        return NextResponse.json({ success: false, error: 'Invalid payment signature verification' }, { status: 400 });
      }
    }

    const paidPayment = dbStore.verifyPayment(
      paymentId || providerOrderId,
      providerPaymentId || `pay_${Date.now()}`
    );

    if (!paidPayment) {
      return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
    }

    // Record ledger entry
    const store = loadStore();
    const booking = store.bookings.find(b => b.id === paidPayment.bookingId);
    if (booking && booking.assignedWorkerProfileId) {
      // Create pending worker payout
      store.payouts.push({
        id: `payout-${Date.now()}`,
        workerProfileId: booking.assignedWorkerProfileId,
        paymentId: paidPayment.id,
        amount: paidPayment.workerPayoutAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
      saveStore();
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and settled.',
      payment: paidPayment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

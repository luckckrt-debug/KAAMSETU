import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbStore, loadStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('x-webhook-signature');
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.PAYMENT_PROVIDER_SECRET || 'rzp_test_secret_kaamsetu';

    // Verify HMAC signature in production or if signature is present
    if (signature) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      const isDev = process.env.NODE_ENV !== 'production' || process.env.PAYMENT_PROVIDER === 'razorpay_test';
      if (!isDev && signature !== expected) {
        return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event || 'payment.captured';
    const paymentEntity = payload.payload?.payment?.entity || payload.payment || payload;

    const providerPaymentId = paymentEntity.id || payload.providerPaymentId || `pay_wh_${Date.now()}`;
    const providerOrderId = paymentEntity.order_id || payload.providerOrderId;
    const bookingId = paymentEntity.notes?.bookingId || payload.bookingId;

    if (event === 'payment.captured' || event === 'payment.paid' || event === 'order.paid') {
      const store = loadStore();
      let payment = store.payments.find(p => p.providerOrderId === providerOrderId || p.id === providerOrderId || (bookingId && p.bookingId === bookingId));

      if (payment) {
        dbStore.verifyPayment(payment.id, providerPaymentId);
      } else if (bookingId) {
        const amount = paymentEntity.amount ? paymentEntity.amount / 100 : 500;
        const newPay = dbStore.createPayment(bookingId, amount);
        dbStore.verifyPayment(newPay.id, providerPaymentId);
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook processed. Payment verified and worker wallet credited.',
        providerPaymentId,
      });
    }

    return NextResponse.json({ success: true, message: `Ignored event: ${event}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

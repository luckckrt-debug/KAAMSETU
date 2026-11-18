import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount) {
      return NextResponse.json({ success: false, error: 'bookingId and amount are required' }, { status: 400 });
    }

    const booking = dbStore.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const payment = dbStore.createPayment(bookingId, Number(amount));

    return NextResponse.json({
      success: true,
      order: {
        id: payment.providerOrderId,
        paymentId: payment.id,
        amount: payment.amount * 100, // in paise
        currency: 'INR',
        key: process.env.PAYMENT_PROVIDER_KEY || 'rzp_test_kaamsetu_mock',
      },
      payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

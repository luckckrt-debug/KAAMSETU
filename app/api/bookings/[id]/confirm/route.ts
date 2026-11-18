import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = dbStore.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'WORK_COMPLETED') {
      return NextResponse.json({
        success: false,
        error: `Cannot confirm completion. Current job status is: ${booking.status}`,
      }, { status: 400 });
    }

    const updated = dbStore.updateBookingStatus(params.id, 'CUSTOMER_CONFIRMED');

    // Automatically initiate payment order in test/mock mode
    const payment = dbStore.createPayment(params.id, booking.finalAmount || booking.estimatedAmount);

    return NextResponse.json({
      success: true,
      message: 'Work completion confirmed by customer.',
      booking: updated,
      payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

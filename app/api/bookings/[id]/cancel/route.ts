import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { cancellationReason, cancelledByRole } = body;

    const booking = dbStore.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (['WORK_STARTED', 'WORK_COMPLETED', 'PAYMENT_PAID'].includes(booking.status)) {
      return NextResponse.json({
        success: false,
        error: `Cannot cancel booking after work has started. Please raise a dispute if there is an issue.`,
      }, { status: 400 });
    }

    const updated = dbStore.updateBookingStatus(params.id, 'CANCELLED', {
      cancellationReason: cancellationReason || 'Customer requested cancellation',
      cancelledByRole: cancelledByRole || 'CUSTOMER',
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled.',
      booking: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

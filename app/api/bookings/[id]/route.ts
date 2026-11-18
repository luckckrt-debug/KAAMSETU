import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = dbStore.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const latestLocation = dbStore.getLatestLocation(booking.id);

    return NextResponse.json({
      success: true,
      booking,
      latestLocation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

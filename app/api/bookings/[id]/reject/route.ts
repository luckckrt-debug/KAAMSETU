import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = loadStore();
    const booking = store.bookings.find(b => b.id === params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Reset assignment & redispatch to next available worker in city
    booking.assignedWorkerProfileId = undefined;
    booking.status = 'REQUESTED';
    booking.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Job declined. Auto-redispatched to available pool.',
      booking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

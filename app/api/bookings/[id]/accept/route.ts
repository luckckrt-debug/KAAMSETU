import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let workerProfileId: string | undefined;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const store = loadStore();
    const booking = store.bookings.find(b => b.id === params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Transaction-safe anti-double booking check
    if (booking.status !== 'REQUESTED' && booking.status !== 'OFFERED') {
      return NextResponse.json({
        success: false,
        error: `Cannot accept booking. Job is already in state: ${booking.status}`,
      }, { status: 409 });
    }

    if (workerProfileId) {
      booking.assignedWorkerProfileId = workerProfileId;
    }
    booking.status = 'ACCEPTED';
    booking.updatedAt = new Date().toISOString();

    const updatedBooking = dbStore.getBookingById(params.id);

    return NextResponse.json({
      success: true,
      message: 'Job accepted successfully. Prepare for route dispatch.',
      booking: updatedBooking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

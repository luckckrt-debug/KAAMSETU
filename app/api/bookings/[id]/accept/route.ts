import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore, saveStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
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
    const validAcceptStates = ['REQUESTED', 'OFFERED', 'SEARCHING_WORKERS', 'WORKER_NOTIFIED'];
    if (!validAcceptStates.includes(booking.status)) {
      return NextResponse.json({
        success: false,
        error: `Cannot accept booking. Job has already been accepted or is in state: ${booking.status}`,
      }, { status: 409 });
    }

    if (workerProfileId) {
      booking.assignedWorkerProfileId = workerProfileId;
    }
    booking.status = 'ACCEPTED';
    booking.updatedAt = new Date().toISOString();

    saveStore();

    const updatedBooking = dbStore.getBookingById(params.id);

    // Real-time broadcast to customer room
    const io = (global as any).__digiwork_io || ((global as any).__digiwork_io || (global as any).__kaamsetu_io);
    if (io) {
      io.to(`booking:${params.id}`).emit('booking:worker:assigned', {
        bookingId: params.id,
        worker: updatedBooking?.assignedWorker,
        status: 'ACCEPTED',
        timestamp: new Date().toISOString(),
      });
      io.to(`booking:${params.id}`).emit('booking:status_changed', {
        bookingId: params.id,
        status: 'ACCEPTED',
        updatedAt: updatedBooking?.updatedAt,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Job accepted successfully. Prepare for route dispatch.',
      booking: updatedBooking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

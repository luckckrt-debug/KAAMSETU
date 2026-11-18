import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { BookingStatus } from '@/lib/types';

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['SEARCHING_WORKERS', 'WORKER_NOTIFIED', 'OFFERED', 'ACCEPTED', 'CANCELLED'],
  SEARCHING_WORKERS: ['WORKER_NOTIFIED', 'ACCEPTED', 'CANCELLED'],
  WORKER_NOTIFIED: ['ACCEPTED', 'SEARCHING_WORKERS', 'CANCELLED'],
  OFFERED: ['ACCEPTED', 'REQUESTED', 'CANCELLED'],
  ACCEPTED: ['WORKER_ASSIGNED', 'WORKER_ON_THE_WAY', 'CANCELLED'],
  WORKER_ASSIGNED: ['WORKER_ON_THE_WAY', 'CANCELLED'],
  WORKER_ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['WORK_STARTED', 'CANCELLED'],
  WORK_STARTED: ['WORK_COMPLETED', 'DISPUTED'],
  WORK_COMPLETED: ['CUSTOMER_CONFIRMED', 'DISPUTED'],
  CUSTOMER_CONFIRMED: ['PAYMENT_PENDING', 'PAYMENT_PAID'],
  PAYMENT_PENDING: ['PAYMENT_PROCESSING', 'PAYMENT_PAID'],
  PAYMENT_PAID: ['DISPUTED'],
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, beforeWorkNotes, beforeWorkImageUrl, afterWorkNotes, afterWorkImageUrl, cancellationReason } = body;

    const currentBooking = dbStore.getBookingById(params.id);
    if (!currentBooking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const newStatus = status as BookingStatus;
    const allowed = VALID_TRANSITIONS[currentBooking.status] || [];

    if (!allowed.includes(newStatus)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status transition from '${currentBooking.status}' to '${newStatus}'`,
      }, { status: 400 });
    }

    const updated = dbStore.updateBookingStatus(params.id, newStatus, {
      beforeWorkNotes,
      beforeWorkImageUrl,
      afterWorkNotes,
      afterWorkImageUrl,
      cancellationReason,
    });

    // Notify realtime room via socket if server active
    if ((global as any).__kaamsetu_io) {
      (global as any).__kaamsetu_io.to(`booking:${params.id}`).emit('booking:status_changed', {
        bookingId: params.id,
        status: newStatus,
        updatedAt: updated?.updatedAt,
      });
    }

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

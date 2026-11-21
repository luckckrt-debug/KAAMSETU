import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { BookingStatus } from '@/lib/types';
import { recordVerifiedJobEarning } from '@/lib/financial-ledger';
import { processQualifyingEvent } from '@/lib/referral';

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

    // Automatically record verified earning & platform fee collection
    if (newStatus === 'PAYMENT_PAID' || newStatus === 'CUSTOMER_CONFIRMED' || (body.paymentMethod === 'CASH' && newStatus === 'WORK_COMPLETED')) {
      try {
        const workerCharge = currentBooking.finalAmount || currentBooking.estimatedAmount || 800;
        await recordVerifiedJobEarning({
          bookingId: params.id,
          workerProfileId: currentBooking.assignedWorkerProfileId || 'worker-prof-1',
          customerId: currentBooking.customerProfileId || 'cust-1',
          workerCharge,
          workerName: currentBooking.assignedWorker?.user?.fullName || 'Worker',
          customerName: currentBooking.customer?.fullName || 'Customer',
          paymentMethod: body.paymentMethod === 'CASH' ? 'CASH' : 'ONLINE',
          paymentReference: body.paymentId || `pay_${Date.now()}`,
        });

        // Process referral rewards for qualifying first booking
        const workerUserId = currentBooking.assignedWorker?.userId || currentBooking.assignedWorkerProfileId;
        const customerUserId = currentBooking.customer?.id || currentBooking.customerProfileId;

        if (workerUserId) {
          processQualifyingEvent({
            referredUserId: workerUserId,
            eventType: 'FIRST_BOOKING_COMPLETED',
            transactionAmount: workerCharge,
            metadata: { bookingId: params.id, role: 'WORKER' },
          }).catch(() => {});
        }
        if (customerUserId) {
          processQualifyingEvent({
            referredUserId: customerUserId,
            eventType: 'FIRST_BOOKING_COMPLETED',
            transactionAmount: workerCharge,
            metadata: { bookingId: params.id, role: 'HIRING_PARTNER' },
          }).catch(() => {});
        }
      } catch (e) {
        console.error('Wallet credit notice on status transition:', e);
      }
    }

    // Notify realtime room via socket if server active
    if (((global as any).__digiwork_io || (global as any).__kaamsetu_io)) {
      ((global as any).__digiwork_io || (global as any).__kaamsetu_io).to(`booking:${params.id}`).emit('booking:status_changed', {
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

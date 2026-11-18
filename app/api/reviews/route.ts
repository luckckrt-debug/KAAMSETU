import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      bookingId, 
      ratingQuality, 
      ratingTimeliness, 
      ratingBehaviour, 
      comment 
    } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 });
    }

    const booking = dbStore.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Must be completed or confirmed
    if (!['WORK_COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PAID'].includes(booking.status)) {
      return NextResponse.json({
        success: false,
        error: 'Reviews can only be submitted for completed jobs.',
      }, { status: 400 });
    }

    // Anti-duplicate review check
    const store = loadStore();
    const existing = store.reviews.find(r => r.bookingId === bookingId);
    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this booking.' }, { status: 400 });
    }

    const q = Number(ratingQuality) || 5;
    const t = Number(ratingTimeliness) || 5;
    const b = Number(ratingBehaviour) || 5;
    const overall = Math.round(((q + t + b) / 3) * 10) / 10;

    const review = dbStore.createReview({
      bookingId,
      customerProfileId: booking.customerProfileId,
      customerName: booking.customer?.fullName || 'Verified Customer',
      workerProfileId: booking.assignedWorkerProfileId || 'worker-prof-1',
      ratingQuality: q,
      ratingTimeliness: t,
      ratingBehaviour: b,
      ratingOverall: overall,
      comment,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your rating!',
      review,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';

export async function GET() {
  try {
    const store = loadStore();
    return NextResponse.json({
      success: true,
      disputes: store.disputes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, reason, description, evidenceImages } = body;

    if (!bookingId || !reason || !description) {
      return NextResponse.json({ success: false, error: 'bookingId, reason and description required' }, { status: 400 });
    }

    const booking = dbStore.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const store = loadStore();
    const existing = store.disputes.find(d => d.bookingId === bookingId);
    if (existing) {
      return NextResponse.json({ success: false, error: 'A dispute is already open for this booking.' }, { status: 400 });
    }

    const dispute = dbStore.createDispute({
      bookingId,
      customerProfileId: booking.customerProfileId,
      customerName: booking.customer?.fullName || 'Customer',
      reason,
      description,
      evidenceImages: evidenceImages ? (Array.isArray(evidenceImages) ? evidenceImages : [evidenceImages]) : [],
    });

    return NextResponse.json({
      success: true,
      message: 'Dispute submitted. An Operations Resolution Officer has been assigned.',
      dispute,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

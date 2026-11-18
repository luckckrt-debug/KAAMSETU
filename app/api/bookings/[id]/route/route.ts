import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getRoadRoute } from '@/lib/routing';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = dbStore.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const latestLocation = dbStore.getLatestLocation(params.id);
    const worker = booking.assignedWorker;

    // Determine current worker coordinate
    let workerLat = latestLocation?.latitude ?? worker?.latitude;
    let workerLng = latestLocation?.longitude ?? worker?.longitude;

    // If worker doesn't have coordinates, fallback to slight offset from customer for route demonstration
    if (workerLat === undefined || workerLng === undefined) {
      workerLat = booking.customerLatitude + 0.022;
      workerLng = booking.customerLongitude - 0.018;
    }

    const origin = { lat: workerLat, lng: workerLng };
    const destination = { lat: booking.customerLatitude, lng: booking.customerLongitude };

    const route = await getRoadRoute(origin, destination);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: booking.status,
      route,
      workerLocation: {
        latitude: workerLat,
        longitude: workerLng,
        heading: latestLocation?.heading ?? 0,
        speed: latestLocation?.speed ?? 24,
        accuracyMeters: latestLocation?.accuracyMeters ?? 10,
        recordedAt: latestLocation?.recordedAt ?? new Date().toISOString(),
      },
      customerLocation: {
        latitude: booking.customerLatitude,
        longitude: booking.customerLongitude,
        address: booking.addressLine,
        city: booking.city,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

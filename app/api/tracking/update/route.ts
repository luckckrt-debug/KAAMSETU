import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { calculateDistanceKm, calculateEstimatedEtaMinutes, formatDistance, formatEta } from '@/lib/geo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, workerProfileId, latitude, longitude, accuracyMeters, heading, speed } = body;

    if (!bookingId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, error: 'bookingId, latitude and longitude required' }, { status: 400 });
    }

    const booking = dbStore.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Only allow tracking if worker is on the way or in transit
    if (booking.status !== 'WORKER_ON_THE_WAY') {
      return NextResponse.json({
        success: false,
        error: `Tracking inactive. Worker status is ${booking.status}. Tracking is only active when WORKER_ON_THE_WAY.`,
      }, { status: 400 });
    }

    // Save location point to persistence
    const locRecord = dbStore.recordLocationUpdate({
      bookingId,
      workerProfileId: workerProfileId || booking.assignedWorkerProfileId || 'worker-prof-1',
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracyMeters: accuracyMeters ? Number(accuracyMeters) : 10,
      heading: heading ? Number(heading) : 0,
      speed: speed ? Number(speed) : 25,
    });

    // Calculate real distance to customer
    const distanceKm = calculateDistanceKm(
      Number(latitude),
      Number(longitude),
      booking.customerLatitude,
      booking.customerLongitude
    );
    const etaMinutes = calculateEstimatedEtaMinutes(distanceKm);

    // Realtime broadcast via Socket.IO if server is active
    if ((global as any).__kaamsetu_io) {
      (global as any).__kaamsetu_io.to(`booking:${bookingId}`).emit('location:stream', {
        ...locRecord,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
        etaMinutes,
        formattedEta: formatEta(etaMinutes),
      });
    }

    return NextResponse.json({
      success: true,
      location: locRecord,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      etaMinutes,
      formattedEta: formatEta(etaMinutes),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';
import { calculateDistanceKm, calculateEstimatedEtaMinutes, formatDistance, formatEta } from '@/lib/geo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, workerProfileId, latitude, longitude, accuracyMeters, heading, speed } = body;

    if (!bookingId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'bookingId, latitude and longitude required' 
      }, { status: 400 });
    }

    const booking = dbStore.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // 1. Validate Active Job Status:
    // Location sharing only permitted during active dispatch/travel phase
    if (booking.status !== 'WORKER_ON_THE_WAY' && booking.status !== 'ACCEPTED') {
      return NextResponse.json({
        success: false,
        error: `Location sharing stopped. Job status is ${booking.status}. Realtime location is only active when worker is en-route.`,
      }, { status: 400 });
    }

    // 2. Validate Worker Ownership & Authentication
    const token = req.cookies.get('kaamsetu_session')?.value;
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const isAssignedWorker = 
          booking.assignedWorker?.userId === payload.userId || 
          booking.assignedWorkerProfileId === payload.userId;
        const isAdmin = payload.roles.includes('SUPER_ADMIN') || payload.roles.includes('ADMIN');

        if (!isAssignedWorker && !isAdmin) {
          return NextResponse.json({
            success: false,
            error: 'Unauthorized: Only the assigned worker for this job may broadcast GPS coordinates.',
          }, { status: 403 });
        }
      }
    } else if (workerProfileId && booking.assignedWorkerProfileId && workerProfileId !== booking.assignedWorkerProfileId) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Worker ID does not match the worker assigned to this active booking.',
      }, { status: 403 });
    }

    const assignedWorkerId = workerProfileId || booking.assignedWorkerProfileId || 'worker-prof-1';

    // 3. Save location point to persistence
    const locRecord = dbStore.recordLocationUpdate({
      bookingId,
      workerProfileId: assignedWorkerId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracyMeters: accuracyMeters ? Number(accuracyMeters) : 8,
      heading: heading !== undefined ? Number(heading) : 0,
      speed: speed !== undefined ? Number(speed) : 20,
    });

    // 4. Calculate real distance & dynamic ETA to customer site
    const distanceKm = calculateDistanceKm(
      Number(latitude),
      Number(longitude),
      booking.customerLatitude,
      booking.customerLongitude
    );
    const etaMinutes = calculateEstimatedEtaMinutes(distanceKm);

    const payload = {
      ...locRecord,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      etaMinutes,
      formattedEta: formatEta(etaMinutes),
    };

    // 5. Realtime broadcast via Socket.IO if active
    if ((global as any).__kaamsetu_io) {
      (global as any).__kaamsetu_io.to(`booking:${bookingId}`).emit('worker:location:update', payload);
      (global as any).__kaamsetu_io.to(`booking:${bookingId}`).emit('location:stream', payload);
      (global as any).__kaamsetu_io.to('admin:operations').emit('worker:location:update', payload);
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

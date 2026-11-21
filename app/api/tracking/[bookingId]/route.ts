import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';
import { 
  calculateDistanceKm, 
  calculateEstimatedEtaMinutes, 
  formatDistance, 
  formatEta, 
  isLocationStale, 
  isAccuracyLow 
} from '@/lib/geo';

export async function GET(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const booking = dbStore.getBookingById(params.bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // 1. Location Privacy & Authorization Check
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const isCustomer = booking.customer?.id === payload.userId || booking.customerProfileId === payload.userId;
        const isWorker = booking.assignedWorker?.userId === payload.userId || booking.assignedWorkerProfileId === payload.userId;
        const isAdmin = payload.roles.includes('SUPER_ADMIN') || payload.roles.includes('ADMIN');

        // If authenticated user is neither customer, worker nor admin
        if (!isCustomer && !isWorker && !isAdmin) {
          return NextResponse.json({ 
            success: false, 
            error: 'Unauthorized: You do not have permission to access tracking data for this booking.' 
          }, { status: 403 });
        }
      }
    }

    // 2. Active Job Status Check:
    // Location sharing only permitted during active job phases (ACCEPTED, WORKER_ON_THE_WAY, ARRIVED, WORK_IN_PROGRESS)
    const isJobActive = ['ACCEPTED', 'WORKER_ON_THE_WAY', 'ARRIVED', 'WORK_IN_PROGRESS'].includes(booking.status);
    const isWorkerEnRoute = booking.status === 'WORKER_ON_THE_WAY';

    // If job is completed or cancelled, stop sharing location permanently
    if (!isJobActive) {
      return NextResponse.json({
        success: true,
        booking,
        trackingActive: false,
        liveLocationAvailable: false,
        message: `Job is ${booking.status.toLowerCase()}. Location sharing has stopped automatically.`,
      });
    }

    const latestLocation = dbStore.getLatestLocation(params.bookingId);

    if (!latestLocation) {
      return NextResponse.json({
        success: true,
        booking,
        trackingActive: isWorkerEnRoute,
        liveLocationAvailable: false,
        message: 'Live location unavailable. Worker has not started route yet.',
      });
    }

    // Real distance & ETA
    const distanceKm = calculateDistanceKm(
      latestLocation.latitude,
      latestLocation.longitude,
      booking.customerLatitude,
      booking.customerLongitude
    );
    const etaMinutes = calculateEstimatedEtaMinutes(distanceKm);
    const isStale = isLocationStale(latestLocation.recordedAt);
    const isLowAccuracy = isAccuracyLow(latestLocation.accuracyMeters);

    return NextResponse.json({
      success: true,
      booking,
      trackingActive: isWorkerEnRoute,
      liveLocationAvailable: true,
      currentLocation: latestLocation,
      customerLocation: {
        latitude: booking.customerLatitude,
        longitude: booking.customerLongitude,
        address: booking.addressLine,
      },
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      etaMinutes,
      formattedEta: formatEta(etaMinutes),
      isStale,
      isLowAccuracy,
      staleWarning: isStale ? 'Location last updated more than 2 minutes ago' : null,
      accuracyWarning: isLowAccuracy ? 'Location accuracy is low (> 100m)' : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
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

    const latestLocation = dbStore.getLatestLocation(params.bookingId);

    if (!latestLocation) {
      return NextResponse.json({
        success: true,
        booking,
        trackingActive: booking.status === 'WORKER_ON_THE_WAY',
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
      trackingActive: booking.status === 'WORKER_ON_THE_WAY',
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

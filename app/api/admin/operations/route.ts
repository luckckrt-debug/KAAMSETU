import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';
import { isLocationStale } from '@/lib/geo';

export async function GET(req: NextRequest) {
  try {
    const store = loadStore();

    // 1. Online & Available Workers
    const workers = store.workerProfiles.map((w) => {
      const u = store.users.find((u) => u.id === w.userId);
      const activeBooking = store.bookings.find(
        (b) =>
          b.assignedWorkerProfileId === w.id &&
          ['WORKER_ON_THE_WAY', 'ARRIVED', 'WORK_STARTED'].includes(b.status)
      );

      const latestLoc = store.bookingLocations
        .filter((l) => l.workerProfileId === w.id)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];

      const isStale = latestLoc ? isLocationStale(latestLoc.recordedAt) : true;

      return {
        ...w,
        user: u,
        activeBookingId: activeBooking?.id,
        bookingStatus: activeBooking?.status || (w.isOnline ? 'IDLE_ONLINE' : 'OFFLINE'),
        currentLocation: latestLoc || {
          latitude: w.latitude,
          longitude: w.longitude,
          recordedAt: w.updatedAt,
        },
        isTelemetryStale: isStale,
      };
    });

    // 2. Active Dispatches / Bookings
    const activeBookings = store.bookings
      .filter((b) =>
        [
          'REQUESTED',
          'SEARCHING_WORKERS',
          'WORKER_NOTIFIED',
          'ACCEPTED',
          'WORKER_ASSIGNED',
          'WORKER_ON_THE_WAY',
          'ARRIVED',
          'WORK_STARTED',
        ].includes(b.status)
      )
      .map((b) => dbStore.getBookingById(b.id));

    return NextResponse.json({
      success: true,
      workers,
      activeBookings,
      totalWorkersOnline: workers.filter((w) => w.isOnline).length,
      totalActiveDispatches: activeBookings.length,
      jobsOnTheWay: activeBookings.filter((b) => b?.status === 'WORKER_ON_THE_WAY').length,
      jobsInProgress: activeBookings.filter((b) => b?.status === 'WORK_STARTED').length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

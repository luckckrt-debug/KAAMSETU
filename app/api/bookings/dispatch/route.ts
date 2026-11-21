import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore, saveStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let customerUserId = 'user-customer-1';
    let customerProfileId = 'cust-prof-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        customerUserId = payload.userId;
        const store = loadStore();
        const cp = store.customerProfiles.find(c => c.userId === customerUserId);
        if (cp) customerProfileId = cp.id;
      }
    }

    const body = await req.json();
    const {
      bookingId,
      serviceCategory,
      serviceDescription,
      isUrgent,
      scheduledDate,
      estimatedHours,
      estimatedAmount,
      addressLine,
      locality,
      city,
      pincode,
      customerLatitude,
      customerLongitude,
    } = body;

    let booking;

    if (bookingId) {
      booking = dbStore.getBookingById(bookingId);
      if (!booking) {
        return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
      }
    } else {
      if (!serviceCategory || !addressLine) {
        return NextResponse.json(
          { success: false, error: 'Service category and address are required' },
          { status: 400 }
        );
      }

      booking = dbStore.createBooking({
        customerProfileId,
        serviceCategory,
        serviceDescription: serviceDescription || 'Direct dispatch request',
        isUrgent: isUrgent !== undefined ? Boolean(isUrgent) : true,
        scheduledDate: scheduledDate || new Date().toISOString(),
        estimatedHours: Number(estimatedHours) || 2,
        estimatedAmount: Number(estimatedAmount) || 500,
        addressLine,
        locality: locality || '',
        city: city || 'Noida',
        pincode: pincode || '201301',
        customerLatitude: Number(customerLatitude) || 28.5355,
        customerLongitude: Number(customerLongitude) || 77.3910,
      });
    }

    // Set status to SEARCHING_WORKERS
    dbStore.updateBookingStatus(booking.id, 'SEARCHING_WORKERS');

    // Run expanding discovery
    const discovery = dbStore.discoverNearbyWorkers({
      latitude: booking.customerLatitude,
      longitude: booking.customerLongitude,
      categorySlug: booking.serviceCategory,
      initialRadiusKm: 3,
      maxRadiusKm: 15,
    });

    // If workers found, transition status to WORKER_NOTIFIED
    if (discovery.workers.length > 0) {
      dbStore.updateBookingStatus(booking.id, 'WORKER_NOTIFIED');
    }

    const updatedBooking = dbStore.getBookingById(booking.id);

    // Socket.IO Broadcast to eligible workers & customer room
    const io = (global as any).__digiwork_io || ((global as any).__digiwork_io || (global as any).__kaamsetu_io);
    if (io) {

      // Broadcast to specific booking room
      io.to(`booking:${booking.id}`).emit('booking:dispatch:started', {
        bookingId: booking.id,
        searchRadiusKm: discovery.searchRadiusKm,
        expanded: discovery.expanded,
        candidateCount: discovery.workers.length,
        status: updatedBooking?.status,
      });

      // Broadcast incoming request to eligible workers
      discovery.workers.forEach(w => {
        io.to(`worker:${w.id}`).emit('booking:request:created', {
          bookingId: booking.id,
          serviceCategory: booking.serviceCategory,
          serviceDescription: booking.serviceDescription,
          estimatedAmount: booking.estimatedAmount,
          locality: booking.locality,
          city: booking.city,
          distanceKm: w.distanceKm,
          etaMinutes: w.etaMinutes,
          timeoutSeconds: 60,
          createdAt: new Date().toISOString(),
        });
      });

      // Also broadcast to public workers broadcast channel
      io.emit('booking:request:broadcast', {
        bookingId: booking.id,
        serviceCategory: booking.serviceCategory,
        addressLine: booking.addressLine,
        city: booking.city,
        estimatedAmount: booking.estimatedAmount,
        customerLatitude: booking.customerLatitude,
        customerLongitude: booking.customerLongitude,
        timeoutSeconds: 60,
      });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      discovery,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

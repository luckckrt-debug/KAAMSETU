import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const bookings = dbStore.getUserBookings(payload.userId);

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let customerUserId = 'user-customer-1'; // Default guest / demo fallback
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
      assignedWorkerProfileId,
    } = body;

    if (!serviceCategory || !addressLine) {
      return NextResponse.json({ success: false, error: 'Service category and address are required' }, { status: 400 });
    }

    const booking = dbStore.createBooking({
      customerProfileId,
      serviceCategory,
      serviceDescription,
      isUrgent: Boolean(isUrgent),
      scheduledDate: scheduledDate || new Date().toISOString(),
      estimatedHours: Number(estimatedHours) || 2,
      estimatedAmount: Number(estimatedAmount) || 500,
      addressLine,
      locality,
      city: city || 'Delhi',
      pincode: pincode || '110001',
      customerLatitude: customerLatitude || 28.6139,
      customerLongitude: customerLongitude || 77.2090,
      assignedWorkerProfileId,
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

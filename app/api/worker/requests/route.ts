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
    if (!payload || !payload.roles.includes('WORKER')) {
      return NextResponse.json({ success: false, error: 'Worker role required' }, { status: 403 });
    }

    const worker = dbStore.getWorkerById(payload.userId);
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    const store = loadStore();
    // Incoming requests for this worker or unassigned in the same category & city
    const incomingRequests = store.bookings.filter(b => 
      (b.assignedWorkerProfileId === worker.id && (b.status === 'OFFERED' || b.status === 'REQUESTED')) ||
      (!b.assignedWorkerProfileId && b.status === 'REQUESTED' && b.city.toLowerCase() === worker.city?.toLowerCase())
    );

    const activeJob = store.bookings.find(b => 
      b.assignedWorkerProfileId === worker.id && 
      ['ACCEPTED', 'WORKER_ON_THE_WAY', 'ARRIVED', 'WORK_STARTED'].includes(b.status)
    );

    return NextResponse.json({
      success: true,
      incomingRequests,
      activeJob: activeJob ? dbStore.getBookingById(activeJob.id) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

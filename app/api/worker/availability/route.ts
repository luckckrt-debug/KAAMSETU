import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore } from '@/lib/store';

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.roles.includes('WORKER')) {
      return NextResponse.json({ success: false, error: 'Access denied: Worker role required' }, { status: 403 });
    }

    const body = await req.json();
    const { isOnline, isAvailableNow, emergencyAvailable } = body;

    const updated = dbStore.updateWorkerProfile(payload.userId, {
      isOnline: isOnline !== undefined ? Boolean(isOnline) : undefined,
      isAvailableNow: isAvailableNow !== undefined ? Boolean(isAvailableNow) : undefined,
      emergencyAvailable: emergencyAvailable !== undefined ? Boolean(emergencyAvailable) : undefined,
    });

    return NextResponse.json({
      success: true,
      worker: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

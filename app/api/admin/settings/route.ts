export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Valid settings object is required.' }, { status: 400 });
    }

    if (settings.platformFee !== undefined && (isNaN(settings.platformFee) || settings.platformFee < 0)) {
      return NextResponse.json({ success: false, error: 'Platform fee must be a valid non-negative number.' }, { status: 400 });
    }

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminUser = { id: 'user-admin-1', name: 'Super Admin', role: 'SUPER_ADMIN' };

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminUser = {
          id: payload.userId,
          name: payload.fullName,
          role: (payload.roles && payload.roles[0]) || 'SUPER_ADMIN',
        };
      }
    }

    const updated = await updateSystemSettings(settings, adminUser);

    return NextResponse.json({
      success: true,
      message: 'Platform system settings successfully updated and logged.',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

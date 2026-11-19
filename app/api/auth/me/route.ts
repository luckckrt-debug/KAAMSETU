import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getRoleDashboardPath, normalizeRole } from '@/lib/auth';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = dbStore.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const role = payload.activeRole || user.roles[0] || 'CUSTOMER';

    return NextResponse.json({
      authenticated: true,
      user,
      activeRole: role,
      normalizedRole: normalizeRole(role),
      dashboardUrl: getRoleDashboardPath(role),
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

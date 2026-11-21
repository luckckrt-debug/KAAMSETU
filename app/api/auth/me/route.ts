import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getRoleDashboardPath, normalizeRole } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // 1. Check MongoDB Atlas users collection first
    let user: any = null;
    const usersCol = await getMongoCollection('users');
    if (usersCol) {
      user = await usersCol.findOne({ $or: [{ id: payload.userId }, { phoneNumber: payload.phoneNumber }] });
    }

    // Fallback to store
    if (!user) {
      user = dbStore.getUserById(payload.userId) || dbStore.getUserByPhone(payload.phoneNumber);
    }

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Check account status
    const accountStatus = user.accountStatus || user.status || 'ACTIVE';
    if (accountStatus === 'BLOCKED' || accountStatus === 'SUSPENDED') {
      return NextResponse.json({ 
        authenticated: false, 
        blocked: true,
        error: 'Your account has been suspended or restricted.' 
      }, { status: 403 });
    }

    const role = payload.activeRole || (user.roles && user.roles[0]) || 'CUSTOMER';
    const normalizedRole = normalizeRole(role);

    const sanitizedUser = {
      id: user.id || String(user._id),
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles || [role],
      activeRole: role,
      status: user.status || 'ACTIVE',
      accountStatus: user.accountStatus || 'ACTIVE',
      language: user.language || 'hi',
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      authenticated: true,
      user: sanitizedUser,
      activeRole: role,
      normalizedRole,
      dashboardUrl: getRoleDashboardPath(role),
    });
  } catch (error: any) {
    console.error('[Auth Me Error]:', error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

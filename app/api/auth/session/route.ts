import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, getRoleDashboardPath, normalizeRole } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (!token) {
      return NextResponse.json({ authenticated: false, message: 'No active session token found' }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      const res = NextResponse.json({ authenticated: false, message: 'Session expired or invalid' }, { status: 200 });
      res.cookies.delete('digiwork_session');
      res.cookies.delete('kaamsetu_session');
      return res;
    }

    // 1. Query MongoDB Atlas users collection
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
      const res = NextResponse.json({ authenticated: false, message: 'User record not found' }, { status: 200 });
      res.cookies.delete('digiwork_session');
      res.cookies.delete('kaamsetu_session');
      return res;
    }

    // Check account status
    const accountStatus = user.accountStatus || user.status || 'ACTIVE';
    if (accountStatus === 'BLOCKED' || accountStatus === 'SUSPENDED') {
      const res = NextResponse.json({ 
        authenticated: false, 
        blocked: true,
        message: 'Account has been restricted or blocked by DigiWork Operations.' 
      }, { status: 403 });
      res.cookies.delete('digiwork_session');
      res.cookies.delete('kaamsetu_session');
      return res;
    }

    const activeRole = payload.activeRole || (user.roles && user.roles[0]) || 'CUSTOMER';
    const normalized = normalizeRole(activeRole);
    const dashboardUrl = getRoleDashboardPath(normalized);

    // Sanitize user object
    const sanitizedUser = {
      id: user.id || String(user._id),
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles || [activeRole],
      activeRole,
      status: user.status || 'ACTIVE',
      accountStatus: user.accountStatus || 'ACTIVE',
      language: user.language || 'hi',
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      authenticated: true,
      valid: true,
      user: sanitizedUser,
      activeRole,
      normalizedRole: normalized,
      dashboardUrl,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Session API Error]:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal session verification error' }, { status: 500 });
  }
}

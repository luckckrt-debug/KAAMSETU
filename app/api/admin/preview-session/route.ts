export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';
import { signSessionToken, verifySessionToken, getRoleDashboardPath } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUserId, requestedRole } = body;

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Target user ID is required.' }, { status: 400 });
    }

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    let adminName = 'Super Admin';
    let adminRole = 'SUPER_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'SUPER_ADMIN';
      }
    }

    const db = await getMongoDb();
    const store = loadStore();

    let targetUser: any = null;
    if (db) {
      targetUser = await db.collection('users').findOne({ $or: [{ id: targetUserId }, { phoneNumber: targetUserId }] });
    }
    if (!targetUser) {
      targetUser = store.users.find((u) => u.id === targetUserId || u.phoneNumber === targetUserId);
    }

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Target user not found.' }, { status: 404 });
    }

    const roleToPreview = requestedRole || (targetUser.roles && targetUser.roles[0]) || 'CUSTOMER';

    // Generate secure preview token (1 hour duration)
    const previewToken = signSessionToken({
      userId: targetUser.id,
      phoneNumber: targetUser.phoneNumber,
      fullName: targetUser.fullName,
      roles: targetUser.roles || [roleToPreview],
      activeRole: roleToPreview,
    });

    const redirectUrl = getRoleDashboardPath(roleToPreview);

    // Record audit trail of the preview session
    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: 'ADMIN_VIEW_AS_USER_START',
      targetUser: targetUser.id,
      reason: `Admin launched view-as-user preview for ${targetUser.fullName} (${roleToPreview}).`,
      status: 'SUCCESS',
    });

    const response = NextResponse.json({
      success: true,
      message: `Preview session generated for ${targetUser.fullName}.`,
      previewUser: {
        id: targetUser.id,
        fullName: targetUser.fullName,
        role: roleToPreview,
      },
      redirectUrl: `${redirectUrl}?adminPreview=true&adminId=${adminId}`,
    });

    // Set preview session cookies
    response.cookies.set('digiwork_session', previewToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set('kaamsetu_session', previewToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Preview Session Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

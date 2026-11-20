import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, comparePassword, hashPassword } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword, phoneNumber } = body;

    // Check session or direct phone verification
    const token = req.cookies.get('kaamsetu_session')?.value;
    let targetPhone = phoneNumber ? String(phoneNumber).replace(/\D/g, '') : '';
    let targetUserId = '';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        targetUserId = payload.userId;
        if (!targetPhone) targetPhone = payload.phoneNumber;
      }
    }

    if (!targetPhone && !targetUserId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication session or mobile number required to change password.'
      }, { status: 401 });
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Both current password and new password are required.'
      }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'New password and confirm password do not match.'
      }, { status: 400 });
    }

    // Lookup user in MongoDB Atlas
    let user: any = null;
    const usersCol = await getMongoCollection('users');
    if (usersCol) {
      if (targetUserId) {
        user = await usersCol.findOne({ id: targetUserId });
      }
      if (!user && targetPhone) {
        user = await usersCol.findOne({ phoneNumber: targetPhone });
      }
    }

    // Fallback lookup
    if (!user) {
      user = (targetUserId && dbStore.getUserById(targetUserId)) || 
             (targetPhone && dbStore.getUserByPhone(targetPhone));
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User account not found.'
      }, { status: 404 });
    }

    // Verify current password
    if (user.passwordHash) {
      const isMatch = comparePassword(String(currentPassword), user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({
          success: false,
          error: 'Current password entered is incorrect.'
        }, { status: 401 });
      }
    } else {
      // Legacy demo password check
      const isDemo = currentPassword === 'KaamSetu@2026' || currentPassword === '123456';
      if (!isDemo) {
        return NextResponse.json({
          success: false,
          error: 'Current password entered is incorrect.'
        }, { status: 401 });
      }
    }

    // Hash new password and save
    const newHash = hashPassword(String(newPassword));
    const nowIso = new Date().toISOString();

    if (usersCol) {
      await usersCol.updateOne(
        { $or: [{ id: user.id }, { phoneNumber: user.phoneNumber }] },
        { $set: { passwordHash: newHash, updatedAt: nowIso } }
      );
    }

    user.passwordHash = newHash;

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Change Password Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to change password.'
    }, { status: 500 });
  }
}

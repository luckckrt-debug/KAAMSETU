import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, hashPassword } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, otp, newPassword, confirmPassword } = body;

    if (!phoneNumber || !otp || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Mobile number, OTP, and new password are required.'
      }, { status: 400 });
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Passwords do not match. Please verify your new password.'
      }, { status: 400 });
    }

    // Verify OTP
    const otpRes = verifyOtp(cleanPhone, String(otp));
    if (!otpRes.success) {
      return NextResponse.json({
        success: false,
        error: otpRes.message
      }, { status: 400 });
    }

    // Hash the new password securely
    const newHash = hashPassword(String(newPassword));
    const nowIso = new Date().toISOString();

    // Update in MongoDB Atlas
    const usersCol = await getMongoCollection('users');
    let updatedInMongo = false;
    if (usersCol) {
      const updateRes = await usersCol.updateOne(
        { phoneNumber: cleanPhone },
        { 
          $set: { 
            passwordHash: newHash,
            updatedAt: nowIso 
          } 
        }
      );
      updatedInMongo = updateRes.modifiedCount > 0;
    }

    // Update in-memory fallback store
    const storeUser = dbStore.getUserByPhone(cleanPhone);
    if (storeUser) {
      storeUser.passwordHash = newHash;
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Reset Password Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to reset password.'
    }, { status: 500 });
  }
}

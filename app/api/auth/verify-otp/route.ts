import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, signSessionToken, getRoleDashboardPath } from '@/lib/auth';
import { dbStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json({ success: false, error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const verification = verifyOtp(phoneNumber, otp);
    if (!verification.success) {
      return NextResponse.json({ success: false, error: verification.message }, { status: 400 });
    }

    // Check if user already exists
    let user = dbStore.getUserByPhone(phoneNumber);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      return NextResponse.json({
        success: true,
        isNewUser: true,
        message: 'OTP verified. Please complete your registration details.',
        phoneNumber,
      });
    }

    // Existing user login
    const primaryRole = user.roles[0] || 'CUSTOMER';
    const token = signSessionToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      roles: user.roles,
      activeRole: primaryRole,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser: false,
      user,
      token,
      redirectUrl: getRoleDashboardPath(primaryRole),
    });

    response.cookies.set('digiwork_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('kaamsetu_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

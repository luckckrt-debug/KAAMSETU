import { NextRequest, NextResponse } from 'next/server';
import { generateOtp } from '@/lib/auth';
import { getMongoCollection } from '@/lib/mongodb';
import { dbStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Registered 10-digit mobile number is required.'
      }, { status: 400 });
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json({
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number.'
      }, { status: 400 });
    }

    // Check if user exists in MongoDB Atlas or in-memory store
    let user: any = null;
    const usersCol = await getMongoCollection('users');
    if (usersCol) {
      user = await usersCol.findOne({ phoneNumber: cleanPhone });
    }
    if (!user) {
      user = dbStore.getUserByPhone(cleanPhone);
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No account registered with this mobile number. Please check the number or register.'
      }, { status: 404 });
    }

    // Check account status
    const accountStatus = user.accountStatus || user.status || 'ACTIVE';
    if (accountStatus === 'BLOCKED' || accountStatus === 'SUSPENDED') {
      return NextResponse.json({
        success: false,
        error: 'This account is restricted. Please contact KaamSetu Support.'
      }, { status: 403 });
    }

    // Generate 6-digit OTP
    const otpResult = generateOtp(cleanPhone);
    if (!otpResult.success) {
      return NextResponse.json({
        success: false,
        error: otpResult.message
      }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      message: `Password reset verification OTP sent to +91 ${cleanPhone}.`,
      testCode: otpResult.testCode,
      phoneNumber: cleanPhone,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Forgot Password Error]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process forgot password request.'
    }, { status: 500 });
  }
}

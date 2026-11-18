import { NextRequest, NextResponse } from 'next/server';
import { generateOtp } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const result = generateOtp(phoneNumber);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message, cooldown: result.cooldownSeconds }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      testCode: result.testCode, // Displayed in dev for zero-friction testing
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

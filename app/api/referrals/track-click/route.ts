export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { trackReferralClick } from '@/lib/referral';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || body.ref;
    if (!code) {
      return NextResponse.json({ success: false, error: 'Referral code is required.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    await trackReferralClick(code, ip);

    return NextResponse.json({ success: true, message: 'Click tracked.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

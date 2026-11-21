export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getReferralLedger } from '@/lib/referral';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let userId = 'user-customer-demo';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.userId) {
        userId = payload.userId;
      }
    }

    const data = await getReferralLedger(userId);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('[API /api/referrals/ledger Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

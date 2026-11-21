export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getReferralsList } from '@/lib/referral';

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

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role') || 'ALL';
    const statusFilter = searchParams.get('status') || 'ALL';

    const referrals = await getReferralsList(userId, roleFilter, statusFilter);

    return NextResponse.json({
      success: true,
      referrals,
      count: referrals.length,
    });
  } catch (error: any) {
    console.error('[API /api/referrals/list Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

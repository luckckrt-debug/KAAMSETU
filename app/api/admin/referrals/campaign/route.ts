export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getActiveReferralCampaign, updateReferralCampaign } from '@/lib/referral';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const campaign = await getActiveReferralCampaign();
    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'admin-ops';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.userId) adminId = payload.userId;
    }

    const body = await req.json();
    const updated = await updateReferralCampaign(body, adminId);

    return NextResponse.json({
      success: true,
      message: 'Referral Campaign settings updated successfully.',
      campaign: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

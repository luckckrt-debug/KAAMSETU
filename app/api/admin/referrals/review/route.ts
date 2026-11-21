export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { approveReferralReward, rejectReferralReward } from '@/lib/referral';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'admin-ops';
    let adminName = 'DigiWork Operations Admin';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.userId) {
        adminId = payload.userId;
        adminName = payload.fullName || adminName;
      }
    }

    const body = await req.json();
    const { action, referralId, reason } = body;

    if (!referralId) {
      return NextResponse.json({ success: false, error: 'referralId is required.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const res = await approveReferralReward({
        referralId,
        adminId,
        adminName,
        reason: reason || 'Approved after routine manual review',
      });
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Referral reward approved and credited.' });
    } else if (action === 'REJECT') {
      if (!reason || !reason.trim()) {
        return NextResponse.json({ success: false, error: 'Reason is required for rejection.' }, { status: 400 });
      }
      const res = await rejectReferralReward({
        referralId,
        adminId,
        adminName,
        reason: reason.trim(),
      });
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Referral reward rejected / reversed.' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action. Must be APPROVE or REJECT.' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

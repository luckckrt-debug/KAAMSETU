export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';
import { getActiveReferralCampaign } from '@/lib/referral';

export async function GET(req: NextRequest) {
  try {
    const refCol = await getMongoCollection('referrals');
    const ledgerCol = await getMongoCollection('referral_ledger');
    const campaign = await getActiveReferralCampaign();

    let totalReferrals = 0;
    let pendingApprovals = 0;
    let totalCreditedCount = 0;
    let flaggedSuspiciousCount = 0;
    let totalRewardsDisbursed = 0;

    if (refCol) {
      totalReferrals = await refCol.countDocuments();
      pendingApprovals = await refCol.countDocuments({ status: 'REWARD_PENDING' });
      totalCreditedCount = await refCol.countDocuments({ status: 'REWARD_CREDITED' });
      flaggedSuspiciousCount = await refCol.countDocuments({ 'fraudCheck.passed': false });
    }

    if (ledgerCol) {
      const agg = await ledgerCol.aggregate([
        { $match: { entryType: 'REWARD_CREDITED', status: 'VERIFIED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();
      if (agg.length > 0) {
        totalRewardsDisbursed = agg[0].total;
      }
    }

    // Recent 5 pending approvals for quick action
    let recentPending: any[] = [];
    if (refCol) {
      recentPending = await refCol.find({ status: 'REWARD_PENDING' }).sort({ updatedAt: -1 }).limit(5).toArray();
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalReferrals,
        pendingApprovals,
        totalCreditedCount,
        flaggedSuspiciousCount,
        totalRewardsDisbursed,
        activeCampaignName: campaign.name,
        campaignStatus: campaign.status,
      },
      campaign,
      recentPending,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

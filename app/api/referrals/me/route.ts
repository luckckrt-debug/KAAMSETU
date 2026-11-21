export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { 
  getOrCreateReferralCode, 
  getReferralStats, 
  getActiveReferralCampaign,
  getPartnerWallet,
  getAppBaseUrl
} from '@/lib/referral';
import { getMongoCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let userId = 'user-customer-demo';
    let userRole = 'HIRING_PARTNER';
    let fullName = 'Partner User';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.userId) {
        userId = payload.userId;
        userRole = payload.activeRole || 'HIRING_PARTNER';
        fullName = payload.fullName || 'Partner User';
      }
    }

    // Try finding user from DB if possible
    const usersCol = await getMongoCollection('users');
    if (usersCol && userId) {
      const dbUser = await usersCol.findOne({ id: userId });
      if (dbUser) {
        fullName = dbUser.fullName || fullName;
      }
    }

    const codeDoc = await getOrCreateReferralCode(userId, userRole, fullName);
    const stats = await getReferralStats(userId);
    const campaign = await getActiveReferralCampaign();
    const wallet = await getPartnerWallet(userId);

    const baseUrl = getAppBaseUrl();
    const referralLink = `${baseUrl}/register?ref=${codeDoc.code}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(referralLink)}`;

    const shareMessage = `Join DigiWork — India's verified platform for skilled workforce, daily services and contractor jobs! Register using my referral link to get priority booking and verification benefits: ${referralLink}`;

    return NextResponse.json({
      success: true,
      referral: {
        code: codeDoc.code,
        link: referralLink,
        qrCodeUrl,
        shareMessage,
        clicksCount: stats.clicksCount,
      },
      stats: {
        totalEarnings: stats.totalEarnings,
        availableBalance: stats.availableBalance,
        pendingRewards: stats.pendingRewards,
        totalWithdrawn: stats.totalWithdrawn,
        totalInvited: stats.totalInvited,
        successfulReferrals: stats.successfulReferrals,
        pendingReferrals: stats.pendingReferrals,
        conversionRate: stats.conversionRate,
        roleCounts: stats.roleCounts,
      },
      wallet: {
        totalEarnings: wallet.totalEarnings,
        referralEarnings: wallet.referralEarnings,
        bookingEarnings: wallet.bookingEarnings,
        promotionalBonuses: wallet.promotionalBonuses,
        availableBalance: wallet.availableBalance,
        pendingRewards: wallet.pendingRewards,
        totalWithdrawn: wallet.totalWithdrawn,
      },
      campaign: {
        name: campaign.name,
        status: campaign.status,
        rewards: campaign.rewards,
        maxCapPerReferrer: campaign.maxCapPerReferrer,
        isLeaderboardEnabled: campaign.isLeaderboardEnabled,
      },
    });
  } catch (error: any) {
    console.error('[API /api/referrals/me Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

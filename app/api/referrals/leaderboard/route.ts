export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyLeaderboard } from '@/lib/referral';

export async function GET(req: NextRequest) {
  try {
    const leaderboard = await getMonthlyLeaderboard();
    return NextResponse.json({
      success: true,
      ...leaderboard,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

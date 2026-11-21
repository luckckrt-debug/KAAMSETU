export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const refCol = await getMongoCollection('referrals');
    let records: any[] = [];
    if (refCol) {
      records = await refCol.find({}).sort({ createdAt: -1 }).toArray();
    }

    const headers = [
      'Referral ID',
      'Referral Code',
      'Referrer User ID',
      'Referred User ID',
      'Referred Role',
      'Status',
      'Qualifying Activity',
      'Reward Amount',
      'Reward Status',
      'Fraud Passed',
      'Created At',
      'Last Activity',
    ];

    const rows = records.map(r => [
      `"${r.id || ''}"`,
      `"${r.referralCode || ''}"`,
      `"${r.referrerUserId || ''}"`,
      `"${r.referredUserId || ''}"`,
      `"${r.referredRole || ''}"`,
      `"${r.status || ''}"`,
      `"${r.qualifyingActivity || ''}"`,
      r.rewardAmount || 0,
      `"${r.rewardStatus || ''}"`,
      r.fraudCheck?.passed ? 'YES' : 'NO',
      `"${r.createdAt || ''}"`,
      `"${r.lastActivityAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="DigiWork_Referral_Report_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

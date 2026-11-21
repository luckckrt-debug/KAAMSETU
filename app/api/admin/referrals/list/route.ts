export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const role = searchParams.get('role') || 'ALL';
    const flaggedOnly = searchParams.get('flagged') === 'true';

    const refCol = await getMongoCollection('referrals');
    const usersCol = await getMongoCollection('users');

    let query: any = {};
    if (status !== 'ALL') query.status = status;
    if (role !== 'ALL') query.referredRole = role;
    if (flaggedOnly) query['fraudCheck.passed'] = false;
    if (search) {
      query.$or = [
        { referralCode: { $regex: search, $options: 'i' } },
        { referrerUserId: { $regex: search, $options: 'i' } },
        { referredUserId: { $regex: search, $options: 'i' } },
      ];
    }

    let records: any[] = [];
    if (refCol) {
      records = await refCol.find(query).sort({ createdAt: -1 }).limit(100).toArray();
    }

    // Hydrate names if possible
    const userMap = new Map<string, string>();
    if (usersCol) {
      const userIds = new Set<string>();
      records.forEach(r => {
        if (r.referrerUserId) userIds.add(r.referrerUserId);
        if (r.referredUserId) userIds.add(r.referredUserId);
      });
      if (userIds.size > 0) {
        const users = await usersCol.find({ id: { $in: Array.from(userIds) } }).toArray();
        users.forEach(u => userMap.set(u.id, u.fullName || u.phoneNumber));
      }
    }

    const formatted = records.map(r => ({
      id: r.id,
      referralCode: r.referralCode,
      referrerUserId: r.referrerUserId,
      referrerName: userMap.get(r.referrerUserId) || r.referrerUserId,
      referredUserId: r.referredUserId,
      referredName: userMap.get(r.referredUserId) || r.referredUserId,
      referredRole: r.referredRole,
      referralSource: r.referralSource,
      status: r.status,
      qualifyingActivity: r.qualifyingActivity,
      rewardAmount: r.rewardAmount,
      rewardStatus: r.rewardStatus,
      fraudCheck: r.fraudCheck,
      createdAt: r.createdAt,
      lastActivityAt: r.lastActivityAt,
    }));

    return NextResponse.json({
      success: true,
      records: formatted,
      totalCount: formatted.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

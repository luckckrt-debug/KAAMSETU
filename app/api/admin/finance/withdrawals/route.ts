import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const withdrawals = dbStore.getAdminWithdrawals({ status });

    return NextResponse.json({
      success: true,
      withdrawals,
      count: withdrawals.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

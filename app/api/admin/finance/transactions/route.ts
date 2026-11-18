import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const workerId = searchParams.get('workerId') || undefined;
    const bookingId = searchParams.get('bookingId') || undefined;

    const transactions = dbStore.getAdminFinancialTransactions({
      type,
      workerId,
      bookingId,
    });

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

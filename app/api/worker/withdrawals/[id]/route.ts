import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = loadStore();
    const withdrawal = (store.withdrawals || []).find(w => w.id === params.id);

    if (!withdrawal) {
      return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      withdrawal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

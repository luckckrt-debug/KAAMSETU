export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const summary = dbStore.getAdminFinancialSummary();
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

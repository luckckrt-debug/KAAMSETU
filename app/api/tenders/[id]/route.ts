import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tender = dbStore.getTenderById(params.id);
    if (!tender) {
      return NextResponse.json({ success: false, error: 'Tender not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tender,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

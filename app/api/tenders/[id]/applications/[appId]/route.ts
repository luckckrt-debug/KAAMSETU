import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    const body = await req.json();
    const { status } = body; // 'SHORTLISTED', 'SELECTED', 'REJECTED'

    const updated = dbStore.updateTenderApplicationStatus(params.appId, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Application marked as ${status}`,
      application: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

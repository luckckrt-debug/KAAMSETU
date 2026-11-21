import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) adminId = payload.userId;
    }

    const body = await req.json();
    const { resolutionNotes, status } = body; // 'RESOLVED_REFUND', 'RESOLVED_DISMISSED', 'RESOLVED_PARTIAL_REFUND'

    const dispute = dbStore.resolveDispute(
      params.id,
      resolutionNotes || 'Resolved after dispute investigation.',
      adminId,
      status || 'RESOLVED_REFUND'
    );

    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    dbStore.logAdminAction(
      adminId,
      'DISPUTE_RESOLVED',
      'JobDispute',
      params.id,
      `Status set to ${status}. Notes: ${resolutionNotes}`
    );

    return NextResponse.json({
      success: true,
      message: 'Dispute resolved.',
      dispute,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

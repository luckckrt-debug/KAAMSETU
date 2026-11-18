import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let workerProfileId = 'worker-prof-3'; // Default demo / team lead

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const worker = dbStore.getWorkerById(payload.userId);
        if (worker) workerProfileId = worker.id;
      }
    }

    const body = await req.json();
    const { tenderTeamId, proposedRate, proposedWorkersCount, coverNote } = body;

    const application = dbStore.applyToTender({
      tenderId: params.id,
      workerProfileId,
      tenderTeamId,
      proposedRate: Number(proposedRate) || 1000,
      proposedWorkersCount: Number(proposedWorkersCount) || 1,
      coverNote,
    });

    return NextResponse.json({
      success: true,
      message: 'Tender application submitted successfully.',
      application,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore, dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const store = loadStore();
    const pendingWorkers = store.workerProfiles
      .filter(w => w.verificationStatus === 'SUBMITTED' || w.verificationStatus === 'UNDER_REVIEW')
      .map(w => {
        const u = store.users.find(u => u.id === w.userId);
        return { ...w, user: u };
      });

    return NextResponse.json({
      success: true,
      pendingWorkers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) adminId = payload.userId;
    }

    const body = await req.json();
    const { workerProfileId, action, rejectionReason } = body; // action: 'APPROVE' or 'REJECT'

    const store = loadStore();
    const worker = store.workerProfiles.find(w => w.id === workerProfileId);

    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker profile not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      worker.verificationStatus = 'VERIFIED';
      worker.rejectionReason = undefined;
      // Mark documents as verified
      if (worker.documents) {
        worker.documents.forEach(d => { d.status = 'VERIFIED'; d.reviewedAt = new Date().toISOString(); });
      }
      dbStore.logAdminAction(adminId, 'WORKER_VERIFY_APPROVED', 'WorkerProfile', worker.id, 'Approved KYC & trade skills.');
    } else {
      worker.verificationStatus = 'REJECTED';
      worker.rejectionReason = rejectionReason || 'Document unreadable or invalid credentials.';
      if (worker.documents) {
        worker.documents.forEach(d => { d.status = 'REJECTED'; d.adminNotes = worker.rejectionReason; });
      }
      dbStore.logAdminAction(adminId, 'WORKER_VERIFY_REJECTED', 'WorkerProfile', worker.id, `Rejected: ${worker.rejectionReason}`);
    }

    worker.updatedAt = new Date().toISOString();
    saveStore();

    return NextResponse.json({
      success: true,
      message: `Worker verification status updated to ${worker.verificationStatus}`,
      worker,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

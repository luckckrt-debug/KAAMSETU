import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbStore, loadStore, saveStore } from '@/lib/store';
import { WorkerDocument } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.roles.includes('WORKER')) {
      return NextResponse.json({ success: false, error: 'Worker role required' }, { status: 403 });
    }

    const worker = dbStore.getWorkerById(payload.userId);
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { docType, docNumber, fileUrl } = body;

    if (!docType || !fileUrl) {
      return NextResponse.json({ success: false, error: 'Document type and file are required' }, { status: 400 });
    }

    const newDoc: WorkerDocument = {
      id: `doc-${Date.now()}`,
      workerProfileId: worker.id,
      docType,
      docNumber: docNumber ? `XXXX-XXXX-${docNumber.slice(-4)}` : undefined,
      fileUrl,
      status: 'SUBMITTED',
      uploadedAt: new Date().toISOString(),
    };

    const store = loadStore();
    const targetWorker = store.workerProfiles.find(w => w.id === worker.id);
    if (targetWorker) {
      targetWorker.documents = targetWorker.documents || [];
      targetWorker.documents.push(newDoc);
      targetWorker.verificationStatus = 'SUBMITTED';
      saveStore();
    }

    return NextResponse.json({
      success: true,
      message: 'KYC Document submitted for verification.',
      document: newDoc,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

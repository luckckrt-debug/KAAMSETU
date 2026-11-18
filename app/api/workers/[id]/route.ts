import { NextRequest, NextResponse } from 'next/server';
import { dbStore, loadStore } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const worker = dbStore.getWorkerById(params.id);
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    const store = loadStore();
    const reviews = store.reviews.filter(r => r.workerProfileId === worker.id);

    return NextResponse.json({
      success: true,
      worker: {
        ...worker,
        reviews,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore, dbStore } from '@/lib/store';
import { deleteMongoDocument, upsertMongoDocument } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) adminId = payload.userId;
    }

    const store = loadStore();
    const worker = store.workerProfiles.find((w) => w.id === id || w.userId === id);
    const targetWorkerId = worker ? worker.id : id;
    const targetUserId = worker?.userId;

    // Remove from in-memory store
    store.workerProfiles = store.workerProfiles.filter(
      (w) => w.id !== targetWorkerId && w.userId !== targetWorkerId
    );
    store.bookingLocations = store.bookingLocations.filter(
      (bl) => bl.workerProfileId !== targetWorkerId
    );
    store.wallets = store.wallets.filter((wl) => wl.workerProfileId !== targetWorkerId);

    // Instant delete from MongoDB Atlas
    const atlasRes = await deleteMongoDocument('workerProfiles', targetWorkerId);
    if (targetUserId) {
      store.users = store.users.filter((u) => u.id !== targetUserId);
      await deleteMongoDocument('users', targetUserId);
    }
    await deleteMongoDocument('wallets', targetWorkerId);

    saveStore();

    // Log admin action to Atlas
    const auditEntry = {
      id: `audit-${Date.now()}`,
      adminUserId: adminId,
      action: 'ADMIN_DELETE_WORKER',
      targetType: 'WorkerProfile',
      targetId: targetWorkerId,
      details: `Worker permanently deleted from MongoDB Atlas database.`,
      timestamp: new Date().toISOString(),
    };
    store.auditLogs.unshift(auditEntry);
    saveStore();
    await upsertMongoDocument('auditLogs', auditEntry.id, auditEntry);

    return NextResponse.json({
      success: true,
      message: `Worker ${targetWorkerId} permanently deleted from MongoDB Atlas database.`,
      deletedCount: atlasRes.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

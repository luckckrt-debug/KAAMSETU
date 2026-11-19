import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/lib/store';
import { deleteMongoDocument, upsertMongoDocument } from '@/lib/mongodb';
import { verifySessionToken } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get('kaamsetu_session')?.value;
    let adminId = 'user-admin-1';
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) adminId = payload.userId;
    }

    const store = loadStore();
    store.users = store.users.filter((u) => u.id !== id);
    store.customerProfiles = store.customerProfiles.filter((c) => c.userId !== id);
    store.workerProfiles = store.workerProfiles.filter((w) => w.userId !== id);
    store.contractorProfiles = store.contractorProfiles.filter((cp) => cp.userId !== id);

    // Instant delete from MongoDB Atlas
    const atlasRes = await deleteMongoDocument('users', id);
    await deleteMongoDocument('workerProfiles', id);
    await deleteMongoDocument('customerProfiles', id);

    saveStore();

    const auditEntry = {
      id: `audit-${Date.now()}`,
      adminUserId: adminId,
      action: 'ADMIN_DELETE_USER',
      targetType: 'User',
      targetId: id,
      details: `User permanently deleted from MongoDB Atlas database.`,
      timestamp: new Date().toISOString(),
    };
    store.auditLogs.unshift(auditEntry);
    saveStore();
    await upsertMongoDocument('auditLogs', auditEntry.id, auditEntry);

    return NextResponse.json({
      success: true,
      message: `User ${id} permanently deleted from MongoDB Atlas database.`,
      deletedCount: atlasRes.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

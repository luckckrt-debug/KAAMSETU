export const dynamic = 'force-dynamic';
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
    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) adminId = payload.userId;
    }

    const store = loadStore();
    store.bookings = store.bookings.filter((b) => b.id !== id);
    store.bookingLocations = store.bookingLocations.filter((bl) => bl.bookingId !== id);

    // Instant delete from MongoDB Atlas
    const atlasRes = await deleteMongoDocument('bookings', id);
    await deleteMongoDocument('bookingLocations', id);

    saveStore();

    const auditEntry = {
      id: `audit-${Date.now()}`,
      adminUserId: adminId,
      action: 'ADMIN_DELETE_BOOKING',
      targetType: 'Booking',
      targetId: id,
      details: `Booking permanently deleted from MongoDB Atlas database.`,
      timestamp: new Date().toISOString(),
    };
    store.auditLogs.unshift(auditEntry);
    saveStore();
    await upsertMongoDocument('auditLogs', auditEntry.id, auditEntry);

    return NextResponse.json({
      success: true,
      message: `Booking ${id} permanently deleted from MongoDB Atlas database.`,
      deletedCount: atlasRes.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { loadStore, saveStore, dbStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';
import { getMongoDb, deleteMongoDocument, upsertMongoDocument } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get('collection') || 'workerProfiles';
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const store = loadStore();
    let items: any[] = [];

    // Hydrate items based on collection
    switch (collection) {
      case 'workerProfiles':
        items = store.workerProfiles.map((w) => {
          const u = store.users.find((u) => u.id === w.userId);
          return {
            ...w,
            user: u,
            displayName: u?.fullName || w.id,
            displayPhone: u?.phoneNumber || 'N/A',
            displayRole: w.headline || 'Worker',
          };
        });
        if (search) {
          items = items.filter(
            (w) =>
              w.id.toLowerCase().includes(search) ||
              w.displayName?.toLowerCase().includes(search) ||
              w.displayPhone?.toLowerCase().includes(search) ||
              w.city?.toLowerCase().includes(search) ||
              w.displayRole?.toLowerCase().includes(search)
          );
        }
        break;

      case 'users':
        items = store.users.map((u) => ({
          ...u,
          displayName: u.fullName,
          displayPhone: u.phoneNumber,
          displayRole: (u.roles || []).join(', '),
        }));
        if (search) {
          items = items.filter(
            (u) =>
              u.id.toLowerCase().includes(search) ||
              u.fullName.toLowerCase().includes(search) ||
              u.phoneNumber.toLowerCase().includes(search) ||
              u.email?.toLowerCase().includes(search)
          );
        }
        break;

      case 'bookings':
        items = store.bookings.map((b) => {
          const custProfile = store.customerProfiles.find((cp) => cp.id === b.customerProfileId);
          const custUser = b.customer || (custProfile ? store.users.find((u) => u.id === custProfile.userId) : null);
          const workerProfile = store.workerProfiles.find((w) => w.id === b.assignedWorkerProfileId);
          const workerUser = workerProfile ? store.users.find((u) => u.id === workerProfile.userId) : null;
          return {
            ...b,
            categoryName: b.serviceCategory,
            customerName: custUser?.fullName || b.customerProfileId,
            customerPhone: custUser?.phoneNumber || 'N/A',
            workerName: workerUser?.fullName || b.assignedWorkerProfileId || 'Unassigned',
            workerPhone: workerUser?.phoneNumber || 'N/A',
            amount: b.finalAmount || b.estimatedAmount,
          };
        });
        if (search) {
          items = items.filter(
            (b) =>
              b.id.toLowerCase().includes(search) ||
              b.serviceCategory?.toLowerCase().includes(search) ||
              b.customerName?.toLowerCase().includes(search) ||
              b.workerName?.toLowerCase().includes(search) ||
              b.addressLine?.toLowerCase().includes(search) ||
              b.status.toLowerCase().includes(search)
          );
        }
        break;

      case 'tenders':
        items = store.tenders.map((t) => {
          const cp = store.contractorProfiles.find((c) => c.id === t.contractorProfileId);
          const contractorUser = t.contractor?.user || (cp ? store.users.find((u) => u.id === cp.userId) : null);
          return {
            ...t,
            contractorName: contractorUser?.fullName || t.contractorProfileId,
            contractorPhone: contractorUser?.phoneNumber || 'N/A',
          };
        });
        if (search) {
          items = items.filter(
            (t) =>
              t.id.toLowerCase().includes(search) ||
              t.title.toLowerCase().includes(search) ||
              t.location?.toLowerCase().includes(search) ||
              t.contractorName?.toLowerCase().includes(search)
          );
        }
        break;

      case 'disputes':
        items = store.disputes;
        if (search) {
          items = items.filter(
            (d) =>
              d.id.toLowerCase().includes(search) ||
              d.bookingId.toLowerCase().includes(search) ||
              d.reason.toLowerCase().includes(search) ||
              d.description.toLowerCase().includes(search) ||
              d.customerName?.toLowerCase().includes(search)
          );
        }
        break;

      case 'auditLogs':
        items = store.auditLogs;
        if (search) {
          items = items.filter(
            (a) =>
              a.id.toLowerCase().includes(search) ||
              a.action.toLowerCase().includes(search) ||
              a.targetType.toLowerCase().includes(search) ||
              a.targetId.toLowerCase().includes(search) ||
              a.details?.toLowerCase().includes(search)
          );
        }
        break;

      default:
        // Generic collection fallback
        items = (store as any)[collection] || [];
        if (search) {
          items = items.filter((item: any) => JSON.stringify(item).toLowerCase().includes(search));
        }
        break;
    }

    // Real Atlas connection status & counts
    let mongoConnected = false;
    const collectionCounts: Record<string, number> = {
      workerProfiles: store.workerProfiles.length,
      users: store.users.length,
      bookings: store.bookings.length,
      tenders: store.tenders.length,
      disputes: store.disputes.length,
      auditLogs: store.auditLogs.length,
    };

    try {
      const db = await getMongoDb();
      if (db) {
        await db.command({ ping: 1 });
        mongoConnected = true;

        // Fetch actual live MongoDB Atlas counts
        const [wCount, uCount, bCount, tCount, dCount, aCount] = await Promise.all([
          db.collection('workerProfiles').countDocuments(),
          db.collection('users').countDocuments(),
          db.collection('bookings').countDocuments(),
          db.collection('tenders').countDocuments(),
          db.collection('disputes').countDocuments(),
          db.collection('auditLogs').countDocuments(),
        ]);

        collectionCounts.workerProfiles = wCount;
        collectionCounts.users = uCount;
        collectionCounts.bookings = bCount;
        collectionCounts.tenders = tCount;
        collectionCounts.disputes = dCount;
        collectionCounts.auditLogs = aCount;
      }
    } catch (err) {
      console.warn('[MongoDB Atlas] Could not fetch real-time collection counts:', err);
    }

    return NextResponse.json({
      success: true,
      collection,
      totalCount: items.length,
      items,
      collectionCounts,
      mongoConnected,
      clusterUri: 'cluster0.jjs2wil.mongodb.net/kaamsetu',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('kaamsetu_session')?.value;
    let adminId = 'user-admin-1';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) adminId = payload.userId;
    }

    const body = await req.json();
    const { collection, id, reason } = body;

    if (!collection || !id) {
      return NextResponse.json(
        { success: false, error: 'Both collection and id are required for deletion.' },
        { status: 400 }
      );
    }

    const store = loadStore();
    let deletedCount = 0;
    let details = reason || `Record permanently deleted by Admin ${adminId}`;

    // 1. INSTANT DELETE FROM MONGODB ATLAS
    console.log(`[ADMIN INSTANT DELETE] Deleting ${id} from Atlas collection: ${collection}`);
    const atlasRes = await deleteMongoDocument(collection, id);
    deletedCount = atlasRes.deletedCount || 1;

    // 2. Cascade cleanup based on collection type
    switch (collection) {
      case 'workerProfiles': {
        const worker = store.workerProfiles.find((w) => w.id === id || w.userId === id);
        const targetWorkerId = worker ? worker.id : id;
        const targetUserId = worker?.userId;

        // Clean in-memory
        store.workerProfiles = store.workerProfiles.filter(
          (w) => w.id !== targetWorkerId && w.userId !== targetWorkerId
        );
        store.bookingLocations = store.bookingLocations.filter(
          (bl) => bl.workerProfileId !== targetWorkerId
        );
        store.wallets = store.wallets.filter((wl) => wl.workerProfileId !== targetWorkerId);

        // Delete from MongoDB Atlas cascaded
        await deleteMongoDocument('workerProfiles', targetWorkerId);
        if (targetUserId) {
          store.users = store.users.filter((u) => u.id !== targetUserId);
          await deleteMongoDocument('users', targetUserId);
        }
        await deleteMongoDocument('wallets', targetWorkerId);
        details = `Worker ${worker?.user?.fullName || targetWorkerId} permanently deleted from MongoDB Atlas & system.`;
        break;
      }

      case 'users': {
        const user = store.users.find((u) => u.id === id);
        store.users = store.users.filter((u) => u.id !== id);
        store.customerProfiles = store.customerProfiles.filter((c) => c.userId !== id);
        store.workerProfiles = store.workerProfiles.filter((w) => w.userId !== id);
        store.contractorProfiles = store.contractorProfiles.filter((cp) => cp.userId !== id);

        await deleteMongoDocument('users', id);
        await deleteMongoDocument('workerProfiles', id);
        await deleteMongoDocument('customerProfiles', id);
        details = `User ${user?.fullName || id} (${user?.phoneNumber || ''}) permanently deleted from MongoDB Atlas.`;
        break;
      }

      case 'bookings': {
        store.bookings = store.bookings.filter((b) => b.id !== id);
        store.bookingLocations = store.bookingLocations.filter((bl) => bl.bookingId !== id);

        await deleteMongoDocument('bookings', id);
        await deleteMongoDocument('bookingLocations', id);
        details = `Booking #${id} permanently deleted from MongoDB Atlas.`;
        break;
      }

      case 'tenders': {
        store.tenders = store.tenders.filter((t) => t.id !== id);
        store.tenderApplications = store.tenderApplications.filter((ta) => ta.tenderId !== id);

        await deleteMongoDocument('tenders', id);
        await deleteMongoDocument('tenderApplications', id);
        details = `Tender #${id} permanently deleted from MongoDB Atlas.`;
        break;
      }

      case 'disputes': {
        store.disputes = store.disputes.filter((d) => d.id !== id);
        await deleteMongoDocument('disputes', id);
        details = `Dispute #${id} permanently deleted from MongoDB Atlas.`;
        break;
      }

      default: {
        const arrayKey = collection as keyof typeof store;
        if (Array.isArray(store[arrayKey])) {
          (store as any)[arrayKey] = (store[arrayKey] as any[]).filter(
            (item: any) => item.id !== id && item._id !== id
          );
        }
        await deleteMongoDocument(collection, id);
        break;
      }
    }

    // 3. Save memory state immediately
    saveStore();

    // 4. Log Admin Action to Audit Trail & persist to Atlas auditLogs
    const auditEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminUserId: adminId,
      action: 'ADMIN_INSTANT_DELETE',
      targetType: collection,
      targetId: id,
      details,
      timestamp: new Date().toISOString(),
    };
    store.auditLogs.unshift(auditEntry);
    if (store.auditLogs.length > 300) {
      store.auditLogs = store.auditLogs.slice(0, 300);
    }
    saveStore();

    // Persist audit log directly to MongoDB Atlas
    await upsertMongoDocument('auditLogs', auditEntry.id, auditEntry);

    return NextResponse.json({
      success: true,
      message: `Record ${id} successfully and permanently deleted from MongoDB Atlas database.`,
      collection,
      id,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[ADMIN DELETE API ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

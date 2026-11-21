export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const cleanDigits = q.replace(/\D/g, '');
    const isPhoneSearch = cleanDigits.length >= 4;
    const lowerQ = q.toLowerCase();

    const db = await getMongoDb();
    const store = loadStore();

    let users: any[] = [];
    let workerProfiles: any[] = [];
    let contractorProfiles: any[] = [];
    let customerProfiles: any[] = [];
    let wallets: any[] = [];

    if (db) {
      try {
        const queryConditions: any[] = [
          { fullName: { $regex: q, $options: 'i' } },
          { id: { $regex: q, $options: 'i' } },
        ];
        if (isPhoneSearch) {
          queryConditions.push({ phoneNumber: { $regex: cleanDigits } });
        }
        if (q.includes('@')) {
          queryConditions.push({ email: { $regex: q, $options: 'i' } });
        }

        users = await db.collection('users').find({ $or: queryConditions }).limit(25).toArray();

        // Hydrate related profiles
        const userIds = users.map((u) => u.id);
        [workerProfiles, contractorProfiles, customerProfiles, wallets] = await Promise.all([
          db.collection('workerProfiles').find({ userId: { $in: userIds } }).toArray(),
          db.collection('contractorProfiles').find({ userId: { $in: userIds } }).toArray(),
          db.collection('customerProfiles').find({ userId: { $in: userIds } }).toArray(),
          db.collection('wallets').find({}).toArray(),
        ]);
      } catch (e) {
        console.warn('[Admin Search API] MongoDB error, falling back to store:', e);
      }
    }

    // Fallback store search
    if (users.length === 0) {
      users = store.users.filter((u) => {
        const matchesName = u.fullName?.toLowerCase().includes(lowerQ);
        const matchesId = u.id?.toLowerCase().includes(lowerQ);
        const matchesPhone = cleanDigits && u.phoneNumber?.includes(cleanDigits);
        const matchesEmail = u.email?.toLowerCase().includes(lowerQ);
        const matchesRole = (u.roles || []).some((r: string) => r.toLowerCase().includes(lowerQ));
        return matchesName || matchesId || matchesPhone || matchesEmail || matchesRole;
      }).slice(0, 25);

      workerProfiles = store.workerProfiles;
      contractorProfiles = store.contractorProfiles;
      customerProfiles = store.customerProfiles;
      wallets = store.wallets;
    }

    // Enrich search results
    const results = users.map((u) => {
      const worker = workerProfiles.find((w) => w.userId === u.id);
      const contractor = contractorProfiles.find((c) => c.userId === u.id);
      const customer = customerProfiles.find((cust) => cust.userId === u.id);
      const wallet = wallets.find((wal) => wal.workerProfileId === worker?.id);

      let kycStatus = 'UNVERIFIED';
      if (worker) kycStatus = worker.verificationStatus || 'UNVERIFIED';
      else if (contractor) kycStatus = contractor.verification || contractor.verificationStatus || 'VERIFIED';
      else kycStatus = 'NOT_APPLICABLE';

      return {
        id: u.id,
        userId: u.id,
        fullName: u.fullName || 'DigiWork User',
        phoneNumber: u.phoneNumber,
        email: u.email,
        roles: u.roles || ['CUSTOMER'],
        primaryRole: (u.roles && u.roles[0]) || 'CUSTOMER',
        status: u.status || 'ACTIVE',
        kycStatus,
        city: worker?.city || contractor?.city || customer?.city || 'Delhi NCR',
        profileId: worker?.id || contractor?.id || customer?.id,
        rating: worker?.ratingAvg,
        completedJobsCount: worker?.completedJobsCount || 0,
        walletBalance: wallet?.balance || 0,
        trade: worker?.skills?.[0]?.categoryName || worker?.headline,
        companyName: contractor?.companyName,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      query: q,
      count: results.length,
      results,
    });
  } catch (err: any) {
    console.error('[Admin Search API Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

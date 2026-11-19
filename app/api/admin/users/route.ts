export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { loadStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = (searchParams.get('role') || 'ALL').toUpperCase();
    const statusFilter = (searchParams.get('status') || 'ALL').toUpperCase();
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const db = await getMongoDb();
    const store = loadStore();

    let allUsers: any[] = [];
    let workerProfiles: any[] = [];
    let contractorProfiles: any[] = [];
    let customerProfiles: any[] = [];
    let wallets: any[] = [];

    if (db) {
      try {
        [allUsers, workerProfiles, contractorProfiles, customerProfiles, wallets] = await Promise.all([
          db.collection('users').find({}).toArray(),
          db.collection('workerProfiles').find({}).toArray(),
          db.collection('contractorProfiles').find({}).toArray(),
          db.collection('customerProfiles').find({}).toArray(),
          db.collection('wallets').find({}).toArray(),
        ]);
      } catch (e) {
        console.warn('[Admin Users API] MongoDB fetch fallback to store:', e);
      }
    }

    if (allUsers.length === 0) {
      allUsers = store.users;
      workerProfiles = store.workerProfiles;
      contractorProfiles = store.contractorProfiles;
      customerProfiles = store.customerProfiles;
      wallets = store.wallets;
    }

    // Apply filtering
    let filtered = allUsers.filter((u) => {
      // Role filter
      if (roleFilter !== 'ALL') {
        const uRoles = (u.roles || []).map((r: string) => r.toUpperCase());
        if (roleFilter === 'WORKER' && !uRoles.includes('WORKER') && !uRoles.includes('TEAM_LEADER')) return false;
        if (roleFilter === 'CONTRACTOR' && !uRoles.includes('CONTRACTOR') && !uRoles.includes('TENDER_OWNER')) return false;
        if (roleFilter === 'HIRING_PARTNER' && !uRoles.includes('HIRING_PARTNER') && !uRoles.includes('CUSTOMER')) return false;
        if (roleFilter === 'ADMIN' && !uRoles.includes('ADMIN') && !uRoles.includes('SUPER_ADMIN')) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        const uStatus = (u.status || 'ACTIVE').toUpperCase();
        if (uStatus !== statusFilter) return false;
      }

      // Search term
      if (search) {
        const matchName = u.fullName?.toLowerCase().includes(search);
        const matchPhone = u.phoneNumber?.includes(search);
        const matchId = u.id?.toLowerCase().includes(search);
        const matchEmail = u.email?.toLowerCase().includes(search);
        if (!matchName && !matchPhone && !matchId && !matchEmail) return false;
      }

      return true;
    });

    // Sort by latest created
    filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Enrich users with role profiles and KYC status
    const users = paginated.map((u) => {
      const worker = workerProfiles.find((w) => w.userId === u.id);
      const contractor = contractorProfiles.find((c) => c.userId === u.id);
      const customer = customerProfiles.find((cust) => cust.userId === u.id);
      const wallet = wallets.find((wal) => wal.workerProfileId === worker?.id);

      let kycStatus = 'UNVERIFIED';
      if (worker) kycStatus = worker.verificationStatus || 'UNVERIFIED';
      else if (contractor) kycStatus = contractor.verification || contractor.verificationStatus || 'VERIFIED';
      else kycStatus = 'ACTIVE';

      return {
        id: u.id,
        fullName: u.fullName || 'KaamSetu User',
        phoneNumber: u.phoneNumber,
        email: u.email,
        roles: u.roles || ['CUSTOMER'],
        primaryRole: (u.roles && u.roles[0]) || 'CUSTOMER',
        status: u.status || 'ACTIVE',
        kycStatus,
        city: worker?.city || contractor?.city || customer?.city || 'Noida / Delhi',
        profileId: worker?.id || contractor?.id || customer?.id,
        walletBalance: wallet?.balance || 0,
        completedJobsCount: worker?.completedJobsCount || 0,
        ratingAvg: worker?.ratingAvg,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err: any) {
    console.error('[Admin Users API Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

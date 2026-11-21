export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb, recordAdminAuditLog } from '@/lib/mongodb';
import { loadStore, saveStore } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = await getMongoDb();
    const store = loadStore();

    let wallets: any[] = [];
    let workerProfiles: any[] = [];
    let users: any[] = [];

    if (db) {
      try {
        [wallets, workerProfiles, users] = await Promise.all([
          db.collection('wallets').find({}).toArray(),
          db.collection('workerProfiles').find({}).toArray(),
          db.collection('users').find({}).toArray(),
        ]);
      } catch (e) {
        console.warn('[Admin Wallets API] MongoDB fetch error:', e);
      }
    }

    if (wallets.length === 0) wallets = store.wallets;
    if (workerProfiles.length === 0) workerProfiles = store.workerProfiles;
    if (users.length === 0) users = store.users;

    const enrichedWallets = wallets.map((wal) => {
      const prof = workerProfiles.find((w) => w.id === wal.workerProfileId);
      const user = prof ? users.find((u) => u.id === prof.userId) : null;

      return {
        id: wal.id,
        workerProfileId: wal.workerProfileId,
        workerName: user?.fullName || 'Worker',
        phoneNumber: user?.phoneNumber || 'N/A',
        trade: prof?.skills?.[0]?.categoryName || prof?.headline || 'Electrician',
        balance: wal.balance || 0,
        pendingBalance: wal.pendingBalance || 0,
        totalWithdrawn: wal.totalWithdrawn || 0,
        updatedAt: wal.updatedAt || new Date().toISOString(),
      };
    });

    const totalSystemBalance = enrichedWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    const totalPendingBalance = enrichedWallets.reduce((acc, w) => acc + (w.pendingBalance || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalWallets: enrichedWallets.length,
        totalSystemBalance,
        totalPendingBalance,
      },
      wallets: enrichedWallets,
    });
  } catch (error: any) {
    console.error('[Admin Wallets Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletId, workerProfileId, adjustmentType, amount, reason } = body;

    const numAmount = Number(amount);
    if (!walletId || !adjustmentType || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet ID, valid positive amount, and adjustment type (CREDIT/DEBIT) are required.' 
      }, { status: 400 });
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json({ 
        success: false, 
        error: 'A mandatory reason of at least 5 characters is required for financial adjustments.' 
      }, { status: 400 });
    }

    const token = (req.cookies.get('digiwork_session')?.value || req.cookies.get('kaamsetu_session')?.value);
    let adminId = 'user-admin-1';
    let adminName = 'DigiWork Finance Admin';
    let adminRole = 'FINANCE_ADMIN';

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        adminId = payload.userId;
        adminName = payload.fullName;
        adminRole = (payload.roles && payload.roles[0]) || 'FINANCE_ADMIN';
      }
    }

    const db = await getMongoDb();
    const store = loadStore();

    let wallet = store.wallets.find((w) => w.id === walletId || w.workerProfileId === workerProfileId);
    let previousBalance = wallet ? (wallet.availableBalance ?? (wallet as any).balance ?? 0) : 0;

    if (db) {
      const dbWallet = await db.collection('wallets').findOne({
        $or: [{ id: walletId }, { workerProfileId }]
      });
      if (dbWallet) {
        previousBalance = dbWallet.availableBalance ?? dbWallet.balance ?? 0;
      }
    }

    let newBalance = previousBalance;
    if (adjustmentType === 'CREDIT') {
      newBalance = previousBalance + numAmount;
    } else if (adjustmentType === 'DEBIT') {
      if (previousBalance < numAmount) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient balance. Available: ₹${previousBalance}, requested debit: ₹${numAmount}.` 
        }, { status: 400 });
      }
      newBalance = previousBalance - numAmount;
    }

    const now = new Date().toISOString();

    // 1. Update in MongoDB Atlas
    if (db) {
      await db.collection('wallets').updateOne(
        { $or: [{ id: walletId }, { workerProfileId }] },
        { $set: { availableBalance: newBalance, balance: newBalance, updatedAt: now } }
      );

      // Create ledger entry
      const ledgerDoc = {
        id: `adj-ledg-${Date.now()}`,
        walletId,
        workerProfileId: workerProfileId || wallet?.workerProfileId,
        transactionType: 'ADJUSTMENT',
        grossAmount: numAmount,
        commissionAmount: 0,
        feeAmount: 0,
        netAmount: adjustmentType === 'CREDIT' ? numAmount : -numAmount,
        balanceBefore: previousBalance,
        balanceAfter: newBalance,
        currency: 'INR',
        status: 'COMPLETED',
        description: `Admin Adjustment (${adjustmentType}): ${reason}`,
        idempotencyKey: `idemp-adj-${Date.now()}`,
        createdAt: now,
      };
      await db.collection('ledgerEntries').insertOne(ledgerDoc);
    }

    // 2. Update store
    if (wallet) {
      wallet.availableBalance = newBalance;
      (wallet as any).balance = newBalance;
      wallet.updatedAt = now;
      saveStore();
    }

    // 3. Record Audit Log in auditLogs
    await recordAdminAuditLog({
      adminId,
      adminName,
      adminRole,
      action: `WALLET_ADJUSTMENT_${adjustmentType}`,
      targetRecord: walletId,
      targetCollection: 'wallets',
      previousValue: { balance: previousBalance },
      updatedValue: { balance: newBalance, adjustmentAmount: numAmount, adjustmentType },
      reason,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: `Wallet successfully adjusted by ₹${numAmount} (${adjustmentType}). New balance: ₹${newBalance}.`,
      previousBalance,
      newBalance,
    });
  } catch (error: any) {
    console.error('[Admin Wallet Adjustment Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

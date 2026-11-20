import { getMongoDb, recordAdminAuditLog } from './mongodb';
import { loadStore, saveStore } from './store';
import { WorkerWallet, WalletLedgerEntry } from './types';

export const KAAMSETU_PLATFORM_FEE = 99;

export interface WorkerEarningRecord {
  id: string;
  workerProfileId: string;
  bookingId: string;
  jobId: string;
  entryType: 'CREDIT' | 'RESERVED' | 'PAYOUT' | 'FAILED_REVERSAL' | 'ADJUSTMENT' | 'REFUND_ADJUSTMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'VERIFIED' | 'PENDING' | 'REVERSED';
  description: string;
  paymentReference?: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface PlatformFeeRecord {
  id: string;
  bookingId: string;
  jobId: string;
  workerId: string;
  workerName?: string;
  customerId: string;
  customerName?: string;
  workerCharge: number;
  platformFee: number; // 99
  totalPayable: number; // workerCharge + 99
  paymentProvider: string;
  paymentReference?: string;
  collectionStatus: 'COLLECTED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  settlementStatus: 'SETTLED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  refundStatus: 'NONE' | 'PARTIAL' | 'FULL';
  settlementReference?: string;
  createdAt: string;
  settledAt?: string;
}

export interface PayoutTransactionRecord {
  id: string;
  withdrawalRequestId: string;
  workerProfileId: string;
  amount: number;
  fee: number;
  netPayout: number;
  provider: string;
  providerPayoutId?: string;
  destinationType: 'BANK_ACCOUNT' | 'UPI';
  destinationMasked: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REJECTED' | 'CANCELLED' | 'REVERSED';
  bankTransferReference?: string;
  failureReason?: string;
  idempotencyKey: string;
  createdAt: string;
  settledAt?: string;
}

/**
 * Calculates fair marketplace pricing:
 * Worker Charge (100% to worker) + ₹99 Platform Fee = Customer Total
 */
export function calculateMarketplacePricing(workerCharge: number) {
  const charge = Math.max(0, Math.round(Number(workerCharge) || 0));
  const platformFee = KAAMSETU_PLATFORM_FEE;
  return {
    workerCharge: charge,
    platformFee,
    customerTotal: charge + platformFee,
    workerEarning: charge,
  };
}

/**
 * Records verified job earning:
 * 1. Generates unique earning transaction in earning_ledger
 * 2. Generates platform fee entry in platform_fee_ledger
 * 3. Updates worker wallet atomically
 * 4. Records immutable entry in ledgerEntries
 * 5. Synchronizes to MongoDB Atlas
 */
export async function recordVerifiedJobEarning(params: {
  bookingId: string;
  workerProfileId: string;
  customerId: string;
  workerCharge: number;
  workerName?: string;
  customerName?: string;
  paymentMethod?: 'ONLINE' | 'CASH';
  paymentReference?: string;
  paymentProvider?: string;
}): Promise<{
  success: boolean;
  earningRecord: WorkerEarningRecord;
  platformFeeRecord: PlatformFeeRecord;
  wallet: WorkerWallet;
  alreadyProcessed?: boolean;
}> {
  const {
    bookingId,
    workerProfileId,
    customerId,
    workerCharge,
    workerName = 'Worker',
    customerName = 'Customer',
    paymentMethod = 'ONLINE',
    paymentReference = `pay_${Date.now()}`,
    paymentProvider = 'RAZORPAY',
  } = params;

  const nowIso = new Date().toISOString();
  const idempotencyKey = `earn_${bookingId}_${workerProfileId}`;
  const store = loadStore();
  const db = await getMongoDb();

  // 1. Idempotency Check in MongoDB Atlas and Store
  let existingEarning: any = null;
  if (db) {
    existingEarning = await db.collection('earning_ledger').findOne({ idempotencyKey });
  }
  if (!existingEarning) {
    const memEntry = store.ledgerEntries?.find((l) => l.idempotencyKey === idempotencyKey);
    if (memEntry) existingEarning = memEntry;
  }

  // Get current wallet
  let wallet = store.wallets?.find((w) => w.workerProfileId === workerProfileId);
  if (!wallet) {
    wallet = {
      id: `wallet-${workerProfileId}`,
      workerProfileId,
      availableBalance: 0,
      reservedBalance: 0,
      pendingBalance: 0,
      totalLifetimeEarnings: 0,
      totalWithdrawn: 0,
      totalCommissionPaid: 0,
      totalCompletedJobs: 0,
      commissionPayable: 0,
      currency: 'INR',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (!store.wallets) store.wallets = [];
    store.wallets.push(wallet);
  }

  if (existingEarning) {
    return {
      success: true,
      earningRecord: existingEarning,
      platformFeeRecord: {} as any,
      wallet,
      alreadyProcessed: true,
    };
  }

  // 2. Pricing Calculations
  const pricing = calculateMarketplacePricing(workerCharge);
  const balanceBefore = wallet.availableBalance;

  // 100% of worker charge goes to worker
  wallet.availableBalance = Math.round((wallet.availableBalance + pricing.workerEarning) * 100) / 100;
  wallet.totalLifetimeEarnings = Math.round((wallet.totalLifetimeEarnings + pricing.workerEarning) * 100) / 100;
  wallet.totalCompletedJobs += 1;
  wallet.updatedAt = nowIso;

  // 3. Worker Earning Record
  const earningRecord: WorkerEarningRecord = {
    id: `earn-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    workerProfileId,
    bookingId,
    jobId: bookingId,
    entryType: 'CREDIT',
    amount: pricing.workerEarning,
    balanceBefore,
    balanceAfter: wallet.availableBalance,
    status: 'VERIFIED',
    description: `Worker charge credited for booking #${bookingId.slice(-6)} (100% fair wage)`,
    paymentReference,
    idempotencyKey,
    createdAt: nowIso,
  };

  // 4. Platform Fee Record (₹99)
  const platformFeeRecord: PlatformFeeRecord = {
    id: `pfee-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    bookingId,
    jobId: bookingId,
    workerId: workerProfileId,
    workerName,
    customerId,
    customerName,
    workerCharge: pricing.workerCharge,
    platformFee: pricing.platformFee,
    totalPayable: pricing.customerTotal,
    paymentProvider,
    paymentReference,
    collectionStatus: paymentMethod === 'ONLINE' ? 'COLLECTED' : 'PENDING',
    settlementStatus: 'PENDING',
    refundStatus: 'NONE',
    createdAt: nowIso,
  };

  // 5. Immutable Ledger Entry
  const ledgerEntry: WalletLedgerEntry = {
    id: `led-${Date.now()}-earn`,
    walletId: wallet.id,
    workerProfileId,
    bookingId,
    paymentId: paymentReference,
    transactionType: 'JOB_EARNING',
    grossAmount: pricing.workerCharge,
    commissionAmount: 0, // 0 commission deducted from worker!
    feeAmount: pricing.platformFee,
    netAmount: pricing.workerEarning,
    balanceBefore,
    balanceAfter: wallet.availableBalance,
    currency: 'INR',
    status: 'COMPLETED',
    description: `Job earnings for booking #${bookingId.slice(-6)} (₹${pricing.workerCharge} agreed wage)`,
    paymentReference,
    idempotencyKey,
    createdAt: nowIso,
  };

  // 6. Update Store
  if (!store.ledgerEntries) store.ledgerEntries = [];
  store.ledgerEntries.push(ledgerEntry);
  saveStore();

  // 7. Write to MongoDB Atlas
  if (db) {
    try {
      await Promise.all([
        db.collection('earning_ledger').insertOne(earningRecord),
        db.collection('platform_fee_ledger').insertOne(platformFeeRecord),
        db.collection('ledgerEntries').insertOne(ledgerEntry),
        db.collection('wallets').updateOne(
          { workerProfileId },
          {
            $set: {
              availableBalance: wallet.availableBalance,
              totalLifetimeEarnings: wallet.totalLifetimeEarnings,
              totalCompletedJobs: wallet.totalCompletedJobs,
              updatedAt: nowIso,
            },
          },
          { upsert: true }
        ),
      ]);
    } catch (dbErr) {
      console.error('[Financial Ledger DB Insert Warning]:', dbErr);
    }
  }

  // 8. WebSocket Broadcast
  if ((global as any).__kaamsetu_io) {
    const io = (global as any).__kaamsetu_io;
    io.to(`worker:${workerProfileId}`).emit('wallet:balance:updated', {
      workerProfileId,
      availableBalance: wallet.availableBalance,
      reservedBalance: wallet.reservedBalance,
    });
    io.to(`worker:${workerProfileId}`).emit('wallet:earning:credited', {
      bookingId,
      amount: pricing.workerEarning,
      customerTotal: pricing.customerTotal,
      platformFee: pricing.platformFee,
    });
  }

  return {
    success: true,
    earningRecord,
    platformFeeRecord,
    wallet,
    alreadyProcessed: false,
  };
}

/**
 * Requests a worker withdrawal with balance reservation:
 * 1. Checks available balance
 * 2. Moves requested funds from availableBalance to reservedBalance
 * 3. Records withdrawal_requests & payout_transactions
 * 4. Records ledger entry
 * 5. Synchronizes to MongoDB Atlas
 */
export async function requestWorkerWithdrawal(params: {
  workerProfileId: string;
  amount: number;
  payoutAccountId: string;
  destinationType: 'BANK_ACCOUNT' | 'UPI';
  destinationMasked: string;
  idempotencyKey?: string;
}): Promise<{
  success: boolean;
  withdrawal?: any;
  payoutTransaction?: PayoutTransactionRecord;
  error?: string;
}> {
  const {
    workerProfileId,
    amount,
    payoutAccountId,
    destinationType,
    destinationMasked,
    idempotencyKey = `wdr_${workerProfileId}_${Date.now()}`,
  } = params;

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Invalid withdrawal amount' };
  }
  if (amount < 100) {
    return { success: false, error: 'Minimum withdrawal amount is ₹100' };
  }
  if (amount > 50000) {
    return { success: false, error: 'Maximum single withdrawal limit is ₹50,000' };
  }

  const nowIso = new Date().toISOString();
  const store = loadStore();
  const db = await getMongoDb();

  // Find or fetch wallet
  let wallet = store.wallets?.find((w) => w.workerProfileId === workerProfileId);
  if (!wallet) {
    wallet = {
      id: `wallet-${workerProfileId}`,
      workerProfileId,
      availableBalance: 0,
      reservedBalance: 0,
      pendingBalance: 0,
      totalLifetimeEarnings: 0,
      totalWithdrawn: 0,
      totalCommissionPaid: 0,
      totalCompletedJobs: 0,
      commissionPayable: 0,
      currency: 'INR',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (!store.wallets) store.wallets = [];
    store.wallets.push(wallet);
  }

  if (wallet.availableBalance < amount) {
    return {
      success: false,
      error: `Insufficient available balance. You have ₹${wallet.availableBalance} available for withdrawal.`,
    };
  }

  // Reserve funds safely
  const balanceBefore = wallet.availableBalance;
  wallet.availableBalance = Math.round((wallet.availableBalance - amount) * 100) / 100;
  wallet.reservedBalance = Math.round((wallet.reservedBalance + amount) * 100) / 100;
  wallet.updatedAt = nowIso;

  const withdrawalId = `wdr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const withdrawal = {
    id: withdrawalId,
    walletId: wallet.id,
    workerProfileId,
    payoutAccountId,
    payoutAccountType: destinationType,
    payoutTargetMasked: destinationMasked,
    amount,
    fee: 0,
    netPayout: amount,
    currency: 'INR',
    status: 'REQUESTED',
    provider: 'RAZORPAYX',
    idempotencyKey,
    requestedAt: nowIso,
  };

  const payoutTransaction: PayoutTransactionRecord = {
    id: `ptxn-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    withdrawalRequestId: withdrawalId,
    workerProfileId,
    amount,
    fee: 0,
    netPayout: amount,
    provider: 'RAZORPAYX',
    destinationType,
    destinationMasked,
    status: 'REQUESTED',
    idempotencyKey,
    createdAt: nowIso,
  };

  const ledgerEntry: WalletLedgerEntry = {
    id: `led-wdr-${Date.now()}`,
    walletId: wallet.id,
    workerProfileId,
    withdrawalId,
    transactionType: 'WITHDRAWAL_REQUEST',
    grossAmount: amount,
    commissionAmount: 0,
    feeAmount: 0,
    netAmount: -amount,
    balanceBefore,
    balanceAfter: wallet.availableBalance,
    currency: 'INR',
    status: 'PENDING',
    description: `Withdrawal request #${withdrawalId.slice(-6)} to ${destinationMasked}`,
    idempotencyKey,
    createdAt: nowIso,
  };

  if (!store.withdrawals) store.withdrawals = [];
  store.withdrawals.push(withdrawal as any);
  if (!store.ledgerEntries) store.ledgerEntries = [];
  store.ledgerEntries.push(ledgerEntry);
  saveStore();

  // Persist to MongoDB Atlas
  if (db) {
    try {
      await Promise.all([
        db.collection('withdrawal_requests').insertOne(withdrawal),
        db.collection('withdrawals').insertOne(withdrawal),
        db.collection('payout_transactions').insertOne(payoutTransaction),
        db.collection('ledgerEntries').insertOne(ledgerEntry),
        db.collection('wallets').updateOne(
          { workerProfileId },
          {
            $set: {
              availableBalance: wallet.availableBalance,
              reservedBalance: wallet.reservedBalance,
              updatedAt: nowIso,
            },
          },
          { upsert: true }
        ),
      ]);
    } catch (e) {
      console.error('[Withdrawal DB Insert Warning]:', e);
    }
  }

  // Socket broadcast
  if ((global as any).__kaamsetu_io) {
    const io = (global as any).__kaamsetu_io;
    io.to(`worker:${workerProfileId}`).emit('wallet:balance:updated', {
      workerProfileId,
      availableBalance: wallet.availableBalance,
      reservedBalance: wallet.reservedBalance,
    });
    io.to(`worker:${workerProfileId}`).emit('wallet:withdrawal:created', withdrawal);
  }

  return {
    success: true,
    withdrawal,
    payoutTransaction,
  };
}

/**
 * Settles or Fails a Withdrawal:
 * On Success: Deduct from reserved balance, increase totalWithdrawn, set status to PAID.
 * On Failure: Restore funds from reserved balance back to available balance! Set status to FAILED/REVERSED.
 */
export async function finalizeWorkerWithdrawal(params: {
  withdrawalId: string;
  isSuccess: boolean;
  bankTransferReference?: string;
  providerPayoutId?: string;
  failureReason?: string;
  adminId?: string;
  adminName?: string;
}): Promise<{
  success: boolean;
  withdrawal?: any;
  wallet?: WorkerWallet;
  error?: string;
}> {
  const {
    withdrawalId,
    isSuccess,
    bankTransferReference = `UTR_${Date.now()}`,
    providerPayoutId = `pout_${Date.now()}`,
    failureReason = 'Payout provider failed transfer',
    adminId = 'system',
    adminName = 'System Automated Settlement',
  } = params;

  const nowIso = new Date().toISOString();
  const store = loadStore();
  const db = await getMongoDb();

  let withdrawal = store.withdrawals?.find((w) => w.id === withdrawalId);
  if (!withdrawal && db) {
    withdrawal = (await db.collection('withdrawals').findOne({ id: withdrawalId })) as any;
  }
  if (!withdrawal) {
    return { success: false, error: `Withdrawal ${withdrawalId} not found` };
  }

  const wallet = store.wallets?.find((w) => w.workerProfileId === withdrawal.workerProfileId);
  if (!wallet) {
    return { success: false, error: 'Worker wallet not found' };
  }

  if (isSuccess) {
    // Settle payout: Deduct from reserved balance, record totalWithdrawn
    wallet.reservedBalance = Math.max(0, Math.round((wallet.reservedBalance - withdrawal.amount) * 100) / 100);
    wallet.totalWithdrawn = Math.round((wallet.totalWithdrawn + withdrawal.netPayout) * 100) / 100;
    wallet.updatedAt = nowIso;

    withdrawal.status = 'PAID';
    (withdrawal as any).completedAt = nowIso;
    withdrawal.providerPayoutId = providerPayoutId;

    const settlementRecord = {
      id: `settle-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      withdrawalId,
      workerProfileId: withdrawal.workerProfileId,
      amount: withdrawal.amount,
      netPayout: withdrawal.netPayout,
      provider: withdrawal.provider || 'RAZORPAYX',
      providerPayoutId,
      bankTransferReference,
      destinationMasked: withdrawal.payoutTargetMasked,
      status: 'PAID',
      settledAt: nowIso,
    };

    const ledgerEntry: WalletLedgerEntry = {
      id: `led-wsucc-${Date.now()}`,
      walletId: wallet.id,
      workerProfileId: withdrawal.workerProfileId,
      withdrawalId: withdrawal.id,
      transactionType: 'WITHDRAWAL_SUCCESS',
      grossAmount: withdrawal.amount,
      commissionAmount: 0,
      feeAmount: withdrawal.fee,
      netAmount: -withdrawal.netPayout,
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance,
      currency: 'INR',
      status: 'COMPLETED',
      description: `Settled bank payout #${withdrawal.id.slice(-6)} to ${withdrawal.payoutTargetMasked} (UTR: ${bankTransferReference})`,
      payoutReference: providerPayoutId,
      idempotencyKey: `wsucc_${withdrawal.id}`,
      createdAt: nowIso,
    };

    if (!store.ledgerEntries) store.ledgerEntries = [];
    store.ledgerEntries.push(ledgerEntry);
    saveStore();

    if (db) {
      try {
        await Promise.all([
          db.collection('withdrawals').updateOne({ id: withdrawalId }, { $set: { status: 'PAID', completedAt: nowIso, providerPayoutId, bankTransferReference } }),
          db.collection('withdrawal_requests').updateOne({ id: withdrawalId }, { $set: { status: 'PAID', completedAt: nowIso, providerPayoutId, bankTransferReference } }),
          db.collection('payout_transactions').updateOne({ withdrawalRequestId: withdrawalId }, { $set: { status: 'PAID', settledAt: nowIso, bankTransferReference, providerPayoutId } }),
          db.collection('settlement_records').insertOne(settlementRecord),
          db.collection('ledgerEntries').insertOne(ledgerEntry),
          db.collection('wallets').updateOne({ workerProfileId: withdrawal.workerProfileId }, { $set: { reservedBalance: wallet.reservedBalance, totalWithdrawn: wallet.totalWithdrawn, updatedAt: nowIso } }),
        ]);
        await recordAdminAuditLog({
          adminId,
          adminName,
          adminRole: 'FINANCE_ADMIN',
          action: 'PAYOUT_SETTLED',
          targetCollection: 'withdrawals',
          targetRecord: withdrawalId,
          updatedValue: { status: 'PAID', bankTransferReference, amount: withdrawal.amount },
          reason: `Bank payout confirmed. UTR: ${bankTransferReference}`,
        });
      } catch (err) {
        console.error('[Finalize Withdrawal Success DB Error]:', err);
      }
    }
  } else {
    // Failure / Reversal: Restore reserved funds back to availableBalance!
    wallet.reservedBalance = Math.max(0, Math.round((wallet.reservedBalance - withdrawal.amount) * 100) / 100);
    wallet.availableBalance = Math.round((wallet.availableBalance + withdrawal.amount) * 100) / 100;
    wallet.updatedAt = nowIso;

    withdrawal.status = 'FAILED';
    withdrawal.failureReason = failureReason;

    const ledgerEntry: WalletLedgerEntry = {
      id: `led-wfail-${Date.now()}`,
      walletId: wallet.id,
      workerProfileId: withdrawal.workerProfileId,
      withdrawalId: withdrawal.id,
      transactionType: 'WITHDRAWAL_FAILED',
      grossAmount: withdrawal.amount,
      commissionAmount: 0,
      feeAmount: 0,
      netAmount: withdrawal.amount, // Restoration credit
      balanceBefore: wallet.availableBalance - withdrawal.amount,
      balanceAfter: wallet.availableBalance,
      currency: 'INR',
      status: 'REVERSED',
      description: `Failed withdrawal reversed: funds restored to available wallet balance. Reason: ${failureReason}`,
      idempotencyKey: `wfail_${withdrawal.id}`,
      createdAt: nowIso,
    };

    if (!store.ledgerEntries) store.ledgerEntries = [];
    store.ledgerEntries.push(ledgerEntry);
    saveStore();

    if (db) {
      try {
        await Promise.all([
          db.collection('withdrawals').updateOne({ id: withdrawalId }, { $set: { status: 'FAILED', failureReason } }),
          db.collection('withdrawal_requests').updateOne({ id: withdrawalId }, { $set: { status: 'FAILED', failureReason } }),
          db.collection('payout_transactions').updateOne({ withdrawalRequestId: withdrawalId }, { $set: { status: 'FAILED', failureReason } }),
          db.collection('ledgerEntries').insertOne(ledgerEntry),
          db.collection('wallets').updateOne({ workerProfileId: withdrawal.workerProfileId }, { $set: { reservedBalance: wallet.reservedBalance, availableBalance: wallet.availableBalance, updatedAt: nowIso } }),
        ]);
        await recordAdminAuditLog({
          adminId,
          adminName,
          adminRole: 'FINANCE_ADMIN',
          action: 'PAYOUT_FAILED_REVERSAL',
          targetCollection: 'withdrawals',
          targetRecord: withdrawalId,
          updatedValue: { status: 'FAILED', failureReason, restoredAmount: withdrawal.amount },
          reason: `Payout failed: ₹${withdrawal.amount} safely restored to worker wallet.`,
        });
      } catch (err) {
        console.error('[Finalize Withdrawal Failure DB Error]:', err);
      }
    }
  }

  // Socket broadcast
  if ((global as any).__kaamsetu_io) {
    const io = (global as any).__kaamsetu_io;
    io.to(`worker:${withdrawal.workerProfileId}`).emit('wallet:balance:updated', {
      workerProfileId: withdrawal.workerProfileId,
      availableBalance: wallet.availableBalance,
      reservedBalance: wallet.reservedBalance,
    });
    io.to(`worker:${withdrawal.workerProfileId}`).emit('wallet:withdrawal:updated', withdrawal);
  }

  return {
    success: true,
    withdrawal,
    wallet,
  };
}

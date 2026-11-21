// DIGIWORK - Refer & Earn / Referral Rewards Core Engine
import { getMongoCollection, recordAdminAuditLog } from './mongodb';
import { dbStore } from './store';

export type ReferralRole = 'WORKER' | 'HIRING_PARTNER' | 'CONTRACTOR';

export type QualifyingEventType = 
  | 'REGISTRATION_COMPLETED' 
  | 'PROFILE_COMPLETED' 
  | 'ACCOUNT_VERIFIED' 
  | 'FIRST_BOOKING_COMPLETED' 
  | 'FIRST_ASSIGNMENT_COMPLETED';

export type ReferralStatus = 
  | 'LINK_CLICKED'
  | 'REGISTERED' 
  | 'PROFILE_INCOMPLETE' 
  | 'VERIFICATION_PENDING' 
  | 'QUALIFYING_ACTIVITY_PENDING' 
  | 'REWARD_PENDING' 
  | 'REWARD_CREDITED' 
  | 'INELIGIBLE';

export type ReferralRewardStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'CREDITED' | 'REVERSED';

export type ReferralLedgerEntryType = 
  | 'REWARD_PENDING' 
  | 'REWARD_APPROVED' 
  | 'REWARD_CREDITED' 
  | 'REWARD_REVERSED' 
  | 'REWARD_WITHDRAWN';

export interface RoleRewardConfig {
  rewardAmount: number;
  qualifyingAction: QualifyingEventType;
  approvalMode: 'AUTOMATIC' | 'MANUAL_REVIEW';
  minQualifyingAmount?: number;
  title: string;
  description: string;
}

export interface ReferralCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  startDate: string;
  endDate?: string | null;
  rewards: {
    WORKER: RoleRewardConfig;
    HIRING_PARTNER: RoleRewardConfig;
    CONTRACTOR: RoleRewardConfig;
  };
  maxCapPerReferrer: number;
  totalBudget: number;
  isLeaderboardEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralCodeDoc {
  id: string;
  userId: string;
  userRole: string;
  code: string;
  link: string;
  clickCount: number;
  successfulReferralsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralRelationship {
  id: string;
  referrerUserId: string;
  referrerRole: string;
  referredUserId: string;
  referredRole: ReferralRole;
  referralCode: string;
  referralSource: string;
  status: ReferralStatus;
  qualifyingActivity: QualifyingEventType;
  qualifyingCompletedAt?: string;
  rewardAmount: number;
  rewardStatus: ReferralRewardStatus;
  fraudCheck: {
    passed: boolean;
    flags: string[];
    checkedAt: string;
  };
  ipAddress?: string;
  userAgent?: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralLedgerRecord {
  id: string;
  transactionId: string;
  referralId: string;
  referrerUserId: string;
  referredUserId: string;
  referralType: ReferralRole;
  entryType: ReferralLedgerEntryType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'VERIFIED' | 'PENDING' | 'REVERSED';
  rewardReason: string;
  qualifyingEvent: string;
  adminAudit?: {
    adminId: string;
    adminName: string;
    actionDate: string;
    reason: string;
  };
  idempotencyKey: string;
  createdAt: string;
}

export interface PartnerWallet {
  id: string;
  userId: string;
  totalEarnings: number;
  referralEarnings: number;
  bookingEarnings: number;
  promotionalBonuses: number;
  pendingRewards: number;
  availableBalance: number;
  totalWithdrawn: number;
  updatedAt: string;
}

// In-memory fallback stores when MongoDB is reconnecting
const memCampaigns = new Map<string, ReferralCampaign>();
const memCodes = new Map<string, ReferralCodeDoc>();
const memReferrals = new Map<string, ReferralRelationship>();
const memLedger: ReferralLedgerRecord[] = [];
const memWallets = new Map<string, PartnerWallet>();
const memClicks = new Map<string, number>();

/**
 * Gets production/configured base domain
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }
  return 'https://kaamsetu-gamma.vercel.app';
}

/**
 * Privacy safe masking of name & phone
 * e.g. "Rajesh Kumar" -> "Rajesh K."
 * e.g. "9876543210" -> "+91 98*** **210"
 */
export function maskName(fullName?: string): string {
  if (!fullName) return 'DigiWork Member';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export function maskPhone(phone?: string): string {
  if (!phone) return '+91 98*** *****';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return '+91 ' + clean;
  return `+91 ${clean.slice(0, 2)}*** **${clean.slice(-3)}`;
}

/**
 * Get or seed default active Referral Campaign
 */
export async function getActiveReferralCampaign(): Promise<ReferralCampaign> {
  const col = await getMongoCollection<ReferralCampaign>('referral_campaigns');
  if (col) {
    try {
      const existing = await col.findOne({ status: 'ACTIVE' });
      if (existing) return existing;
    } catch (e) {
      console.warn('[Referral DB] Error loading campaign from Mongo:', e);
    }
  }

  if (memCampaigns.has('camp-default')) {
    return memCampaigns.get('camp-default')!;
  }

  const defaultCampaign: ReferralCampaign = {
    id: 'camp-default',
    name: 'DigiWork Partner Rewards 2026',
    status: 'ACTIVE',
    startDate: new Date('2026-01-01T00:00:00Z').toISOString(),
    endDate: null,
    rewards: {
      WORKER: {
        rewardAmount: 150,
        qualifyingAction: 'FIRST_BOOKING_COMPLETED',
        approvalMode: 'AUTOMATIC',
        minQualifyingAmount: 300,
        title: 'Skilled Worker Referral',
        description: 'Earn ₹150 when your referred worker completes their first verified service on DigiWork.',
      },
      HIRING_PARTNER: {
        rewardAmount: 200,
        qualifyingAction: 'FIRST_BOOKING_COMPLETED',
        approvalMode: 'AUTOMATIC',
        minQualifyingAmount: 300,
        title: 'Hiring Partner Referral',
        description: 'Earn ₹200 when another hiring partner or homeowner books their first verified professional.',
      },
      CONTRACTOR: {
        rewardAmount: 350,
        qualifyingAction: 'FIRST_ASSIGNMENT_COMPLETED',
        approvalMode: 'MANUAL_REVIEW',
        minQualifyingAmount: 500,
        title: 'Contractor & Builder Referral',
        description: 'Earn ₹350 when a registered contractor allocates workforce to an active construction project.',
      },
    },
    maxCapPerReferrer: 50000,
    totalBudget: 1000000,
    isLeaderboardEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (col) {
    try {
      await col.updateOne(
        { id: defaultCampaign.id },
        { $setOnInsert: defaultCampaign },
        { upsert: true }
      );
    } catch (e) {}
  }

  memCampaigns.set('camp-default', defaultCampaign);
  return defaultCampaign;
}

/**
 * Updates campaign configuration (Admin only)
 */
export async function updateReferralCampaign(updates: Partial<ReferralCampaign>, adminId: string): Promise<ReferralCampaign> {
  const current = await getActiveReferralCampaign();
  const updated: ReferralCampaign = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const col = await getMongoCollection<ReferralCampaign>('referral_campaigns');
  if (col) {
    await col.updateOne({ id: current.id }, { $set: updated }, { upsert: true });
  }
  memCampaigns.set(current.id, updated);

  await recordAdminAuditLog({
    adminId,
    adminName: 'DigiWork Operations Admin',
    adminRole: 'SUPER_ADMIN',
    action: 'UPDATE_REFERRAL_CAMPAIGN',
    targetRecord: current.id,
    targetCollection: 'referral_campaigns',
    updatedValue: updates,
    reason: 'Admin updated referral campaign settings',
  });

  return updated;
}

/**
 * Generates or retrieves unique referral code for a Hiring Partner
 */
export async function getOrCreateReferralCode(
  userId: string,
  userRole: string = 'HIRING_PARTNER',
  fullName?: string
): Promise<ReferralCodeDoc> {
  const col = await getMongoCollection<ReferralCodeDoc>('referral_codes');
  if (col) {
    try {
      const existing = await col.findOne({ userId });
      if (existing) return existing;
    } catch (e) {}
  }

  if (memCodes.has(userId)) {
    return memCodes.get(userId)!;
  }

  // Generate deterministic/unique readable code: DW-HP-XXXX
  const cleanId = userId.replace(/\D/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
  const prefix = userRole.toUpperCase().includes('CONTRACTOR') ? 'CONT' : userRole.toUpperCase().includes('WORKER') ? 'WRK' : 'HP';
  const code = `DW-${prefix}-${cleanId}`;
  const baseUrl = getAppBaseUrl();
  const link = `${baseUrl}/register?ref=${code}`;

  const doc: ReferralCodeDoc = {
    id: `refcode-${userId}`,
    userId,
    userRole,
    code,
    link,
    clickCount: 0,
    successfulReferralsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (col) {
    try {
      await col.insertOne({ ...doc, _id: doc.id as any });
    } catch (e) {}
  }

  memCodes.set(userId, doc);
  return doc;
}

/**
 * Tracks link clicks
 */
export async function trackReferralClick(code: string, ipAddress?: string): Promise<boolean> {
  if (!code) return false;
  const col = await getMongoCollection<ReferralCodeDoc>('referral_codes');
  if (col) {
    await col.updateOne({ code: code.trim().toUpperCase() }, { $inc: { clickCount: 1 } });
  }
  const current = memClicks.get(code) || 0;
  memClicks.set(code, current + 1);
  return true;
}

/**
 * Get Partner Wallet (or create if not existing)
 */
export async function getPartnerWallet(userId: string): Promise<PartnerWallet> {
  const col = await getMongoCollection<PartnerWallet>('partner_wallets');
  if (col) {
    try {
      const existing = await col.findOne({ userId });
      if (existing) return existing;
    } catch (e) {}
  }

  if (memWallets.has(userId)) {
    return memWallets.get(userId)!;
  }

  const newWallet: PartnerWallet = {
    id: `pwal-${userId}`,
    userId,
    totalEarnings: 0,
    referralEarnings: 0,
    bookingEarnings: 0,
    promotionalBonuses: 0,
    pendingRewards: 0,
    availableBalance: 0,
    totalWithdrawn: 0,
    updatedAt: new Date().toISOString(),
  };

  if (col) {
    try {
      await col.insertOne({ ...newWallet, _id: newWallet.id as any });
    } catch (e) {}
  }

  memWallets.set(userId, newWallet);
  return newWallet;
}

/**
 * Dispatch In-App / System Notification to user
 */
export async function dispatchReferralNotification(params: {
  userId: string;
  title: string;
  body: string;
  type?: string;
  metadata?: any;
}) {
  const notifCol = await getMongoCollection('notifications');
  const notifDoc = {
    id: `notif-ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: params.userId,
    title: params.title,
    body: params.body,
    type: params.type || 'REFERRAL_REWARD',
    isRead: false,
    metadata: params.metadata || {},
    createdAt: new Date().toISOString(),
  };

  if (notifCol) {
    try {
      await notifCol.insertOne({ ...notifDoc, _id: notifDoc.id as any });
    } catch (e) {}
  }

  // Emit socket event if server is online
  const io = (global as any).__digiwork_io || (global as any).__kaamsetu_io;
  if (io) {
    io.to(`user:${params.userId}`).emit('notification:new', notifDoc);
  }
}

/**
 * Attributes a referral on registration with comprehensive fraud checks
 */
export async function attributeReferralOnRegister(params: {
  referredUserId: string;
  referredRole: ReferralRole | string;
  referralCode?: string;
  referralSource?: string;
  ipAddress?: string;
  userAgent?: string;
  phoneNumber?: string;
}): Promise<{ success: boolean; relationship?: ReferralRelationship; reason?: string }> {
  if (!params.referralCode || !params.referralCode.trim()) {
    return { success: false, reason: 'No referral code provided.' };
  }

  const cleanCode = params.referralCode.trim().toUpperCase();

  // 1. Find Referrer by code
  const codeCol = await getMongoCollection<ReferralCodeDoc>('referral_codes');
  let refCodeDoc: ReferralCodeDoc | null = null;
  if (codeCol) {
    refCodeDoc = await codeCol.findOne({ code: cleanCode });
  }
  if (!refCodeDoc) {
    memCodes.forEach(doc => {
      if (doc.code === cleanCode) {
        refCodeDoc = doc;
      }
    });
  }

  if (!refCodeDoc) {
    return { success: false, reason: 'Invalid or expired referral code.' };
  }

  const referrerUserId = refCodeDoc.userId;

  // 2. FRAUD CHECK 1: Self-Referral Prevention
  if (referrerUserId === params.referredUserId) {
    return { success: false, reason: 'Self-referral is strictly prohibited.' };
  }

  // Check phone number match
  const usersCol = await getMongoCollection('users');
  if (usersCol && params.phoneNumber) {
    const referrerUser = await usersCol.findOne({ id: referrerUserId });
    if (referrerUser && referrerUser.phoneNumber === params.phoneNumber.replace(/\D/g, '')) {
      return { success: false, reason: 'Self-referral detected via identical mobile number.' };
    }
  }

  // 3. FRAUD CHECK 2: Attribution Locking (Check existing referral for this user)
  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  if (refCol) {
    const existing = await refCol.findOne({ referredUserId: params.referredUserId });
    if (existing) {
      return { success: true, relationship: existing, reason: 'Referral attribution already locked.' };
    }
  }

  // 4. FRAUD CHECK 3: Rate limiting / Suspicious Velocity
  const flags: string[] = [];
  if (refCol && params.ipAddress) {
    const recentFromSameIp = await refCol.countDocuments({
      ipAddress: params.ipAddress,
      createdAt: { $gte: new Date(Date.now() - 3600000).toISOString() }
    });
    if (recentFromSameIp >= 5) {
      flags.push('SUSPICIOUS_VELOCITY_SAME_IP');
    }
  }

  // 5. Campaign rule determination
  const campaign = await getActiveReferralCampaign();
  const normalizedRole: ReferralRole = 
    params.referredRole.toUpperCase().includes('CONTRACTOR') ? 'CONTRACTOR' :
    params.referredRole.toUpperCase().includes('WORKER') ? 'WORKER' : 'HIRING_PARTNER';

  const roleConfig = campaign.rewards[normalizedRole];
  const rewardAmount = roleConfig?.rewardAmount || 150;
  const qualifyingActivity = roleConfig?.qualifyingAction || 'FIRST_BOOKING_COMPLETED';

  // Initial status:
  // If qualifying action is REGISTRATION_COMPLETED, evaluate immediately
  const isInstantReward = qualifyingActivity === 'REGISTRATION_COMPLETED' && flags.length === 0;
  const initialStatus: ReferralStatus = isInstantReward
    ? (roleConfig.approvalMode === 'AUTOMATIC' ? 'REWARD_CREDITED' : 'REWARD_PENDING')
    : 'QUALIFYING_ACTIVITY_PENDING';

  const relationship: ReferralRelationship = {
    id: `ref-${referrerUserId}-${params.referredUserId}`,
    referrerUserId,
    referrerRole: refCodeDoc.userRole,
    referredUserId: params.referredUserId,
    referredRole: normalizedRole,
    referralCode: cleanCode,
    referralSource: params.referralSource || 'DIRECT_LINK',
    status: initialStatus,
    qualifyingActivity,
    qualifyingCompletedAt: isInstantReward ? new Date().toISOString() : undefined,
    rewardAmount,
    rewardStatus: isInstantReward 
      ? (roleConfig.approvalMode === 'AUTOMATIC' ? 'CREDITED' : 'PENDING') 
      : 'NONE',
    fraudCheck: {
      passed: flags.length === 0,
      flags,
      checkedAt: new Date().toISOString(),
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (refCol) {
    try {
      await refCol.insertOne({ ...relationship, _id: relationship.id as any });
      await codeCol?.updateOne({ id: refCodeDoc.id }, { $inc: { successfulReferralsCount: 1 } });
    } catch (e) {}
  }
  memReferrals.set(relationship.id, relationship);

  // Record Registration Event
  await recordReferralEvent({
    referralId: relationship.id,
    eventType: 'REGISTRATION_COMPLETED',
    metadata: { referredUserId: params.referredUserId, referredRole: normalizedRole },
  });

  // If instant reward applies, credit or queue in ledger
  if (isInstantReward) {
    await applyRewardToReferrer({
      relationship,
      roleConfig,
      qualifyingEvent: 'REGISTRATION_COMPLETED',
      notes: 'Instant reward on verified registration',
    });
  } else {
    // Notify Referrer that new friend registered
    await dispatchReferralNotification({
      userId: referrerUserId,
      title: 'New Referral Registered!',
      body: `A new ${normalizedRole.toLowerCase().replace('_', ' ')} joined DigiWork using your referral link. Reward of ₹${rewardAmount} will unlock upon their first qualifying activity.`,
    });
  }

  return { success: true, relationship };
}

/**
 * Record an audit event for a referral
 */
export async function recordReferralEvent(params: {
  referralId: string;
  eventType: string;
  metadata?: any;
  triggeredBy?: 'USER' | 'SYSTEM' | 'ADMIN';
  adminId?: string;
}) {
  const col = await getMongoCollection('referral_events');
  const eventDoc = {
    id: `refevt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referralId: params.referralId,
    eventType: params.eventType,
    metadata: params.metadata || {},
    triggeredBy: params.triggeredBy || 'SYSTEM',
    adminId: params.adminId,
    createdAt: new Date().toISOString(),
  };

  if (col) {
    try {
      await col.insertOne({ ...eventDoc, _id: eventDoc.id as any });
    } catch (e) {}
  }
}

/**
 * Triggered when a qualifying event occurs on the platform
 * (e.g., Worker completed booking, Hiring Partner completed booking, Contractor deployed workforce)
 */
export async function processQualifyingEvent(params: {
  referredUserId: string;
  eventType: QualifyingEventType;
  transactionAmount?: number;
  metadata?: any;
}): Promise<{ processed: boolean; rewardStatus?: string; reason?: string }> {
  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  let relationship: ReferralRelationship | null = null;

  if (refCol) {
    relationship = await refCol.findOne({ referredUserId: params.referredUserId });
  }
  if (!relationship) {
    memReferrals.forEach(r => {
      if (r.referredUserId === params.referredUserId) {
        relationship = r;
      }
    });
  }

  if (!relationship) {
    return { processed: false, reason: 'User was not referred through a partner link.' };
  }

  // If reward is already pending, credited, or ineligible, do not re-claim (idempotency)
  if (['REWARD_PENDING', 'REWARD_CREDITED', 'INELIGIBLE'].includes(relationship.status)) {
    return { processed: false, reason: `Referral already in ${relationship.status} state.` };
  }

  const campaign = await getActiveReferralCampaign();
  if (campaign.status !== 'ACTIVE') {
    return { processed: false, reason: 'Referral campaign is currently paused or ended.' };
  }

  const roleConfig = campaign.rewards[relationship.referredRole];
  if (!roleConfig) {
    return { processed: false, reason: 'No reward configuration found for this role.' };
  }

  // Check matching qualifying action
  if (roleConfig.qualifyingAction !== params.eventType) {
    // Record step progress (e.g. Profile completed while waiting for First Booking)
    await recordReferralEvent({
      referralId: relationship.id,
      eventType: params.eventType,
      metadata: params.metadata,
    });
    return { processed: true, rewardStatus: 'INTERMEDIATE_STEP_RECORDED' };
  }

  // Check minimum qualifying amount if applicable
  if (roleConfig.minQualifyingAmount && params.transactionAmount) {
    if (params.transactionAmount < roleConfig.minQualifyingAmount) {
      return { 
        processed: false, 
        reason: `Transaction amount ₹${params.transactionAmount} is below qualifying threshold of ₹${roleConfig.minQualifyingAmount}.` 
      };
    }
  }

  // Check referrer cap
  const wallet = await getPartnerWallet(relationship.referrerUserId);
  if (wallet.referralEarnings + roleConfig.rewardAmount > campaign.maxCapPerReferrer) {
    await refCol?.updateOne(
      { id: relationship.id },
      { $set: { status: 'INELIGIBLE', updatedAt: new Date().toISOString() } }
    );
    return { processed: false, reason: 'Referrer reached campaign maximum reward cap.' };
  }

  // Execute reward application
  await applyRewardToReferrer({
    relationship,
    roleConfig,
    qualifyingEvent: params.eventType,
    notes: `Qualified via ${params.eventType}`,
    metadata: params.metadata,
  });

  return { processed: true, rewardStatus: roleConfig.approvalMode === 'AUTOMATIC' ? 'CREDITED' : 'PENDING' };
}

/**
 * Apply or queue reward in immutable ledger and partner wallet
 */
async function applyRewardToReferrer(params: {
  relationship: ReferralRelationship;
  roleConfig: RoleRewardConfig;
  qualifyingEvent: string;
  notes: string;
  metadata?: any;
}) {
  const { relationship, roleConfig, qualifyingEvent, notes, metadata } = params;
  const isAuto = roleConfig.approvalMode === 'AUTOMATIC';
  const newStatus: ReferralStatus = isAuto ? 'REWARD_CREDITED' : 'REWARD_PENDING';
  const newRewardStatus: ReferralRewardStatus = isAuto ? 'CREDITED' : 'PENDING';

  // 1. Update relationship state
  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  const nowIso = new Date().toISOString();
  if (refCol) {
    await refCol.updateOne(
      { id: relationship.id },
      {
        $set: {
          status: newStatus,
          rewardStatus: newRewardStatus,
          qualifyingCompletedAt: nowIso,
          lastActivityAt: nowIso,
          updatedAt: nowIso,
        }
      }
    );
  }
  relationship.status = newStatus;
  relationship.rewardStatus = newRewardStatus;
  relationship.updatedAt = nowIso;
  memReferrals.set(relationship.id, relationship);

  // 2. Update Partner Wallet
  const walletCol = await getMongoCollection<PartnerWallet>('partner_wallets');
  const wallet = await getPartnerWallet(relationship.referrerUserId);

  const balanceBefore = wallet.availableBalance;
  let balanceAfter = balanceBefore;

  if (isAuto) {
    wallet.totalEarnings += roleConfig.rewardAmount;
    wallet.referralEarnings += roleConfig.rewardAmount;
    wallet.availableBalance += roleConfig.rewardAmount;
    balanceAfter = wallet.availableBalance;
  } else {
    wallet.pendingRewards += roleConfig.rewardAmount;
  }
  wallet.updatedAt = nowIso;

  if (walletCol) {
    await walletCol.updateOne(
      { userId: relationship.referrerUserId },
      { $set: wallet },
      { upsert: true }
    );
  }
  memWallets.set(relationship.referrerUserId, wallet);

  // 3. Write Immutable Referral Ledger Transaction
  const ledgerCol = await getMongoCollection<ReferralLedgerRecord>('referral_ledger');
  const ledgerTx: ReferralLedgerRecord = {
    id: `ref-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    transactionId: `TXN-REF-${Date.now().toString().slice(-8)}`,
    referralId: relationship.id,
    referrerUserId: relationship.referrerUserId,
    referredUserId: relationship.referredUserId,
    referralType: relationship.referredRole,
    entryType: isAuto ? 'REWARD_CREDITED' : 'REWARD_PENDING',
    amount: roleConfig.rewardAmount,
    balanceBefore,
    balanceAfter,
    status: isAuto ? 'VERIFIED' : 'PENDING',
    rewardReason: roleConfig.title,
    qualifyingEvent,
    idempotencyKey: `idem-${relationship.id}-${qualifyingEvent}`,
    createdAt: nowIso,
  };

  if (ledgerCol) {
    try {
      await ledgerCol.insertOne({ ...ledgerTx, _id: ledgerTx.id as any });
    } catch (e) {}
  }
  memLedger.unshift(ledgerTx);

  // 4. Log Event
  await recordReferralEvent({
    referralId: relationship.id,
    eventType: isAuto ? 'REWARD_CREDITED' : 'REWARD_PENDING',
    metadata: { amount: roleConfig.rewardAmount, ...metadata },
  });

  // 5. Notify Partner
  if (isAuto) {
    await dispatchReferralNotification({
      userId: relationship.referrerUserId,
      title: '🎉 Referral Reward Credited!',
      body: `₹${roleConfig.rewardAmount} has been credited to your DigiWork Referral Balance for referring a verified ${relationship.referredRole.toLowerCase().replace('_', ' ')}.`,
      metadata: { transactionId: ledgerTx.transactionId, amount: roleConfig.rewardAmount },
    });
  } else {
    await dispatchReferralNotification({
      userId: relationship.referrerUserId,
      title: '⏳ Referral Reward Pending Review',
      body: `Your referral completed qualifying activity. ₹${roleConfig.rewardAmount} is pending routine verification before release to your wallet.`,
      metadata: { referralId: relationship.id, amount: roleConfig.rewardAmount },
    });
  }
}

/**
 * Admin: Approve a pending referral reward
 */
export async function approveReferralReward(params: {
  referralId: string;
  adminId: string;
  adminName: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  let relationship: ReferralRelationship | null = null;

  if (refCol) {
    relationship = await refCol.findOne({ id: params.referralId });
  }
  if (!relationship) {
    relationship = memReferrals.get(params.referralId) || null;
  }

  if (!relationship) return { success: false, error: 'Referral record not found.' };
  if (relationship.status !== 'REWARD_PENDING') {
    return { success: false, error: `Cannot approve referral in '${relationship.status}' state.` };
  }

  const nowIso = new Date().toISOString();
  const rewardAmount = relationship.rewardAmount;

  // 1. Update relationship
  if (refCol) {
    await refCol.updateOne(
      { id: relationship.id },
      {
        $set: {
          status: 'REWARD_CREDITED',
          rewardStatus: 'CREDITED',
          updatedAt: nowIso,
        }
      }
    );
  }
  relationship.status = 'REWARD_CREDITED';
  relationship.rewardStatus = 'CREDITED';
  relationship.updatedAt = nowIso;
  memReferrals.set(relationship.id, relationship);

  // 2. Move pending to available in partner wallet
  const walletCol = await getMongoCollection<PartnerWallet>('partner_wallets');
  const wallet = await getPartnerWallet(relationship.referrerUserId);

  const balanceBefore = wallet.availableBalance;
  wallet.pendingRewards = Math.max(0, wallet.pendingRewards - rewardAmount);
  wallet.totalEarnings += rewardAmount;
  wallet.referralEarnings += rewardAmount;
  wallet.availableBalance += rewardAmount;
  const balanceAfter = wallet.availableBalance;
  wallet.updatedAt = nowIso;

  if (walletCol) {
    await walletCol.updateOne({ userId: relationship.referrerUserId }, { $set: wallet });
  }
  memWallets.set(relationship.referrerUserId, wallet);

  // 3. Write immutable approval transaction to ledger
  const ledgerCol = await getMongoCollection<ReferralLedgerRecord>('referral_ledger');
  const ledgerTx: ReferralLedgerRecord = {
    id: `ref-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    transactionId: `TXN-REF-${Date.now().toString().slice(-8)}`,
    referralId: relationship.id,
    referrerUserId: relationship.referrerUserId,
    referredUserId: relationship.referredUserId,
    referralType: relationship.referredRole,
    entryType: 'REWARD_APPROVED',
    amount: rewardAmount,
    balanceBefore,
    balanceAfter,
    status: 'VERIFIED',
    rewardReason: `Approved by ${params.adminName}: ${params.reason || 'Verified legitimate referral'}`,
    qualifyingEvent: relationship.qualifyingActivity,
    adminAudit: {
      adminId: params.adminId,
      adminName: params.adminName,
      actionDate: nowIso,
      reason: params.reason || 'Admin approval',
    },
    idempotencyKey: `idem-appr-${relationship.id}-${nowIso}`,
    createdAt: nowIso,
  };

  if (ledgerCol) {
    await ledgerCol.insertOne({ ...ledgerTx, _id: ledgerTx.id as any });
  }
  memLedger.unshift(ledgerTx);

  // 4. Log event & audit
  await recordReferralEvent({
    referralId: relationship.id,
    eventType: 'REWARD_APPROVED',
    adminId: params.adminId,
    metadata: { reason: params.reason, amount: rewardAmount },
  });

  await recordAdminAuditLog({
    adminId: params.adminId,
    adminName: params.adminName,
    adminRole: 'SUPER_ADMIN',
    action: 'APPROVE_REFERRAL_REWARD',
    targetRecord: relationship.id,
    targetCollection: 'referrals',
    updatedValue: { amount: rewardAmount },
    reason: params.reason || 'Admin approval',
  });

  // 5. Notify Partner
  await dispatchReferralNotification({
    userId: relationship.referrerUserId,
    title: '✅ Referral Reward Approved!',
    body: `Admin approved your ₹${rewardAmount} reward for referring ${relationship.referredRole.toLowerCase().replace('_', ' ')}. Funds are now available in your balance.`,
  });

  return { success: true };
}

/**
 * Admin: Reject or Reverse a referral reward
 */
export async function rejectReferralReward(params: {
  referralId: string;
  adminId: string;
  adminName: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: 'A rejection reason is required for immutable audit logging.' };
  }

  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  let relationship: ReferralRelationship | null = null;

  if (refCol) {
    relationship = await refCol.findOne({ id: params.referralId });
  }
  if (!relationship) {
    relationship = memReferrals.get(params.referralId) || null;
  }

  if (!relationship) return { success: false, error: 'Referral record not found.' };

  const nowIso = new Date().toISOString();
  const rewardAmount = relationship.rewardAmount;
  const previousStatus = relationship.status;

  // 1. Update relationship
  if (refCol) {
    await refCol.updateOne(
      { id: relationship.id },
      {
        $set: {
          status: 'INELIGIBLE',
          rewardStatus: 'REVERSED',
          updatedAt: nowIso,
        }
      }
    );
  }
  relationship.status = 'INELIGIBLE';
  relationship.rewardStatus = 'REVERSED';
  relationship.updatedAt = nowIso;
  memReferrals.set(relationship.id, relationship);

  // 2. Adjust wallet (reversal)
  const walletCol = await getMongoCollection<PartnerWallet>('partner_wallets');
  const wallet = await getPartnerWallet(relationship.referrerUserId);

  const balanceBefore = wallet.availableBalance;
  if (previousStatus === 'REWARD_PENDING') {
    wallet.pendingRewards = Math.max(0, wallet.pendingRewards - rewardAmount);
  } else if (previousStatus === 'REWARD_CREDITED') {
    wallet.availableBalance = Math.max(0, wallet.availableBalance - rewardAmount);
    wallet.totalEarnings = Math.max(0, wallet.totalEarnings - rewardAmount);
    wallet.referralEarnings = Math.max(0, wallet.referralEarnings - rewardAmount);
  }
  const balanceAfter = wallet.availableBalance;
  wallet.updatedAt = nowIso;

  if (walletCol) {
    await walletCol.updateOne({ userId: relationship.referrerUserId }, { $set: wallet });
  }
  memWallets.set(relationship.referrerUserId, wallet);

  // 3. Write immutable reversal transaction to ledger
  const ledgerCol = await getMongoCollection<ReferralLedgerRecord>('referral_ledger');
  const ledgerTx: ReferralLedgerRecord = {
    id: `ref-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    transactionId: `TXN-REF-${Date.now().toString().slice(-8)}`,
    referralId: relationship.id,
    referrerUserId: relationship.referrerUserId,
    referredUserId: relationship.referredUserId,
    referralType: relationship.referredRole,
    entryType: 'REWARD_REVERSED',
    amount: -rewardAmount,
    balanceBefore,
    balanceAfter,
    status: 'REVERSED',
    rewardReason: `Reversed: ${params.reason.trim()}`,
    qualifyingEvent: relationship.qualifyingActivity,
    adminAudit: {
      adminId: params.adminId,
      adminName: params.adminName,
      actionDate: nowIso,
      reason: params.reason.trim(),
    },
    idempotencyKey: `idem-rev-${relationship.id}-${nowIso}`,
    createdAt: nowIso,
  };

  if (ledgerCol) {
    await ledgerCol.insertOne({ ...ledgerTx, _id: ledgerTx.id as any });
  }
  memLedger.unshift(ledgerTx);

  // 4. Log event & audit
  await recordReferralEvent({
    referralId: relationship.id,
    eventType: 'REWARD_REVERSED',
    adminId: params.adminId,
    metadata: { reason: params.reason, reversedAmount: rewardAmount },
  });

  await recordAdminAuditLog({
    adminId: params.adminId,
    adminName: params.adminName,
    adminRole: 'SUPER_ADMIN',
    action: 'REVERSE_REFERRAL_REWARD',
    targetRecord: relationship.id,
    targetCollection: 'referrals',
    updatedValue: { reversedAmount: rewardAmount },
    reason: params.reason,
  });

  // 5. Notify Partner
  await dispatchReferralNotification({
    userId: relationship.referrerUserId,
    title: '⚠️ Referral Reward Ineligible / Reversed',
    body: `A referral reward could not be credited. Reason: ${params.reason.trim()}`,
  });

  return { success: true };
}

/**
 * Get aggregated referral metrics for a Hiring Partner
 */
export async function getReferralStats(userId: string) {
  const codeDoc = await getOrCreateReferralCode(userId);
  const wallet = await getPartnerWallet(userId);
  const refCol = await getMongoCollection<ReferralRelationship>('referrals');

  let referrals: ReferralRelationship[] = [];
  if (refCol) {
    referrals = await refCol.find({ referrerUserId: userId }).toArray();
  }
  if (referrals.length === 0) {
    memReferrals.forEach(r => {
      if (r.referrerUserId === userId) referrals.push(r);
    });
  }

  const totalInvited = referrals.length;
  const successfulReferrals = referrals.filter(r => r.status === 'REWARD_CREDITED').length;
  const pendingReferrals = referrals.filter(r => r.status === 'REWARD_PENDING' || r.status === 'QUALIFYING_ACTIVITY_PENDING').length;
  const conversionRate = totalInvited > 0 ? Math.round((successfulReferrals / totalInvited) * 100) : 0;

  const roleCounts = {
    WORKER: referrals.filter(r => r.referredRole === 'WORKER').length,
    HIRING_PARTNER: referrals.filter(r => r.referredRole === 'HIRING_PARTNER').length,
    CONTRACTOR: referrals.filter(r => r.referredRole === 'CONTRACTOR').length,
  };

  return {
    code: codeDoc.code,
    link: codeDoc.link,
    clicksCount: codeDoc.clickCount,
    totalEarnings: wallet.referralEarnings,
    availableBalance: wallet.availableBalance,
    pendingRewards: wallet.pendingRewards,
    totalWithdrawn: wallet.totalWithdrawn,
    totalInvited,
    successfulReferrals,
    pendingReferrals,
    conversionRate,
    roleCounts,
  };
}

/**
 * Get referrals list for a user (privacy safe)
 */
export async function getReferralsList(userId: string, roleFilter?: string, statusFilter?: string) {
  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  const usersCol = await getMongoCollection('users');

  let list: ReferralRelationship[] = [];
  if (refCol) {
    const query: any = { referrerUserId: userId };
    if (roleFilter && roleFilter !== 'ALL') query.referredRole = roleFilter;
    if (statusFilter && statusFilter !== 'ALL') query.status = statusFilter;
    list = await refCol.find(query).sort({ createdAt: -1 }).toArray();
  }
  if (list.length === 0) {
    memReferrals.forEach(r => {
      if (r.referrerUserId !== userId) return;
      if (roleFilter && roleFilter !== 'ALL' && r.referredRole !== roleFilter) return;
      if (statusFilter && statusFilter !== 'ALL' && r.status !== statusFilter) return;
      list.push(r);
    });
  }

  // Hydrate with privacy-safe display details
  const hydrated = await Promise.all(list.map(async (item) => {
    let name = 'DigiWork User';
    let phone = '+91 98*** *****';

    if (usersCol) {
      try {
        const u = await usersCol.findOne({ id: item.referredUserId });
        if (u) {
          name = maskName(u.fullName);
          phone = maskPhone(u.phoneNumber);
        }
      } catch (e) {}
    }

    return {
      id: item.id,
      referredUserId: item.referredUserId,
      displayName: name,
      displayPhone: phone,
      referredRole: item.referredRole,
      status: item.status,
      qualifyingActivity: item.qualifyingActivity,
      rewardAmount: item.rewardAmount,
      rewardStatus: item.rewardStatus,
      lastActivityAt: item.lastActivityAt || item.createdAt,
      createdAt: item.createdAt,
    };
  }));

  return hydrated;
}

/**
 * Get Referral Ledger entries for a user
 */
export async function getReferralLedger(userId: string) {
  const ledgerCol = await getMongoCollection<ReferralLedgerRecord>('referral_ledger');
  let entries: ReferralLedgerRecord[] = [];

  if (ledgerCol) {
    entries = await ledgerCol.find({ referrerUserId: userId }).sort({ createdAt: -1 }).limit(100).toArray();
  }
  if (entries.length === 0) {
    entries = memLedger.filter(l => l.referrerUserId === userId);
  }

  const wallet = await getPartnerWallet(userId);

  return {
    wallet: {
      totalEarnings: wallet.totalEarnings,
      referralEarnings: wallet.referralEarnings,
      bookingEarnings: wallet.bookingEarnings,
      promotionalBonuses: wallet.promotionalBonuses,
      availableBalance: wallet.availableBalance,
      pendingRewards: wallet.pendingRewards,
      totalWithdrawn: wallet.totalWithdrawn,
    },
    transactions: entries,
  };
}

/**
 * Get Monthly Leaderboard (Privacy Safe)
 */
export async function getMonthlyLeaderboard() {
  const campaign = await getActiveReferralCampaign();
  if (!campaign.isLeaderboardEnabled) {
    return { enabled: false, rankings: [] };
  }

  const refCol = await getMongoCollection<ReferralRelationship>('referrals');
  const usersCol = await getMongoCollection('users');

  let rankings: any[] = [];

  if (refCol) {
    try {
      const agg = await refCol.aggregate([
        { $match: { status: 'REWARD_CREDITED' } },
        {
          $group: {
            _id: '$referrerUserId',
            referralCount: { $sum: 1 },
            totalEarned: { $sum: '$rewardAmount' },
          }
        },
        { $sort: { totalEarned: -1, referralCount: -1 } },
        { $limit: 10 }
      ]).toArray();

      for (let i = 0; i < agg.length; i++) {
        const item = agg[i];
        let name = 'Partner Pro';
        if (usersCol) {
          const u = await usersCol.findOne({ id: item._id });
          if (u) name = maskName(u.fullName);
        }

        rankings.push({
          rank: i + 1,
          userId: item._id,
          name,
          referralCount: item.referralCount,
          totalEarned: item.totalEarned,
          badge: i === 0 ? 'Gold Champion' : i === 1 ? 'Silver Star' : i === 2 ? 'Bronze Leader' : 'Top Performer',
        });
      }
    } catch (e) {}
  }

  // Fallback demo rankings if fresh instance
  if (rankings.length === 0) {
    rankings = [
      { rank: 1, name: 'Vikram S.', referralCount: 24, totalEarned: 4800, badge: 'Gold Champion' },
      { rank: 2, name: 'Ananya D.', referralCount: 18, totalEarned: 3600, badge: 'Silver Star' },
      { rank: 3, name: 'Kavita M.', referralCount: 14, totalEarned: 2800, badge: 'Bronze Leader' },
      { rank: 4, name: 'Sunil R.', referralCount: 11, totalEarned: 2200, badge: 'Top Performer' },
      { rank: 5, name: 'Harish T.', referralCount: 9, totalEarned: 1800, badge: 'Top Performer' },
    ];
  }

  return {
    enabled: true,
    rankings,
  };
}

/**
 * Request Referral Reward Withdrawal or Transfer
 */
export async function requestReferralWithdrawal(params: {
  userId: string;
  amount: number;
  paymentMethod: 'UPI' | 'BANK_TRANSFER' | 'BOOKING_CREDIT';
  accountDetails: string;
}): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const walletCol = await getMongoCollection<PartnerWallet>('partner_wallets');
  const wallet = await getPartnerWallet(params.userId);

  const amount = Math.round(Number(params.amount) || 0);
  if (amount < 200) {
    return { success: false, error: 'Minimum withdrawal amount is ₹200.' };
  }
  if (amount > wallet.availableBalance) {
    return { success: false, error: `Insufficient available balance (₹${wallet.availableBalance}).` };
  }

  const nowIso = new Date().toISOString();
  const balanceBefore = wallet.availableBalance;
  wallet.availableBalance -= amount;
  wallet.totalWithdrawn += amount;
  wallet.updatedAt = nowIso;

  if (walletCol) {
    await walletCol.updateOne({ userId: params.userId }, { $set: wallet });
  }
  memWallets.set(params.userId, wallet);

  // Write immutable ledger entry
  const ledgerCol = await getMongoCollection<ReferralLedgerRecord>('referral_ledger');
  const txId = `TXN-WITHDRAW-${Date.now().toString().slice(-8)}`;
  const ledgerTx: ReferralLedgerRecord = {
    id: `ref-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    transactionId: txId,
    referralId: 'WITHDRAWAL',
    referrerUserId: params.userId,
    referredUserId: params.userId,
    referralType: 'HIRING_PARTNER',
    entryType: 'REWARD_WITHDRAWN',
    amount: -amount,
    balanceBefore,
    balanceAfter: wallet.availableBalance,
    status: 'VERIFIED',
    rewardReason: `Payout via ${params.paymentMethod}: ${params.accountDetails}`,
    qualifyingEvent: 'WITHDRAWAL_REQUESTED',
    idempotencyKey: `idem-wth-${txId}`,
    createdAt: nowIso,
  };

  if (ledgerCol) {
    try {
      await ledgerCol.insertOne({ ...ledgerTx, _id: ledgerTx.id as any });
    } catch (e) {}
  }
  memLedger.unshift(ledgerTx);

  await dispatchReferralNotification({
    userId: params.userId,
    title: '💸 Withdrawal Processed',
    body: `₹${amount} has been disbursed to ${params.paymentMethod} (${params.accountDetails}). Reference: ${txId}.`,
    metadata: { transactionId: txId, amount },
  });

  return { success: true, transactionId: txId };
}

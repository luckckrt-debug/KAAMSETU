// KAAMSETU - Core System Types & Enums

export type UserRole = 
  | 'CUSTOMER'
  | 'WORKER'
  | 'CONTRACTOR'
  | 'TENDER_OWNER'
  | 'TEAM_LEADER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type VerificationStatus = 
  | 'UNVERIFIED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type BookingStatus = 
  | 'REQUESTED'
  | 'SEARCHING_WORKERS'
  | 'WORKER_NOTIFIED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'WORKER_ASSIGNED'
  | 'WORKER_ON_THE_WAY'
  | 'ARRIVED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'CUSTOMER_CONFIRMED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_PAID'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus = 
  | 'INITIATED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'CANCELLED';

export type TenderStatus = 
  | 'DRAFT'
  | 'PUBLISHED'
  | 'APPLICATIONS_OPEN'
  | 'SHORTLISTING'
  | 'AWARDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type TenderApplicationStatus = 
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type DisputeStatus = 
  | 'OPEN'
  | 'UNDER_INVESTIGATION'
  | 'RESOLVED_REFUND'
  | 'RESOLVED_DISMISSED'
  | 'RESOLVED_PARTIAL_REFUND';

export interface User {
  id: string;
  phoneNumber: string;
  phoneVerified: boolean;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  language: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  yearsExperience: number;
  hourlyRate: number;
  dailyRate: number;
  contractRate?: number;
  toolsAvailable?: string[];
  qualification?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  isOnline: boolean;
  isAvailableNow: boolean;
  emergencyAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  completedJobsCount: number;

  state: string;
  city: string;
  district?: string;
  pincode: string;
  locality?: string;
  address?: string;
  latitude: number;
  longitude: number;
  preferredRadiusKm: number;

  upiId?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountName?: string;

  user?: User;
  skills?: WorkerSkill[];
  documents?: WorkerDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkerSkill {
  id: string;
  workerProfileId: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  experienceYears: number;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  iconName: string;
  description: string;
  subcategories: Subcategory[];
  coverImage?: string;
  sector?: string;
  requiredTools?: string[];
  certifications?: string[];
  baseHourlyRate?: number;
  baseDailyRate?: number;
  featured?: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  nameHi: string;
  slug: string;
  description?: string;
}

export interface WorkerDocument {
  id: string;
  workerProfileId: string;
  docType: 'AADHAAR' | 'VOTER_ID' | 'PAN' | 'TRADE_CERTIFICATE' | 'POLICE_VERIFICATION';
  docNumber?: string;
  fileUrl: string;
  status: VerificationStatus;
  adminNotes?: string;
  uploadedAt: string;
  reviewedAt?: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  user?: User;
  createdAt: string;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  companyName: string;
  gstin?: string;
  panNumber?: string;
  businessType: string;
  city: string;
  state: string;
  verification: VerificationStatus;
  user?: User;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerProfileId: string;
  customer?: User;
  serviceCategory: string;
  serviceDescription: string;
  isUrgent: boolean;
  scheduledDate: string;
  estimatedHours: number;
  estimatedAmount: number;
  finalAmount?: number;

  addressLine: string;
  locality?: string;
  city: string;
  pincode: string;
  customerLatitude: number;
  customerLongitude: number;

  status: BookingStatus;
  cancellationReason?: string;
  cancelledByRole?: UserRole;

  assignedWorkerProfileId?: string;
  assignedWorker?: WorkerProfile & { user?: User };

  beforeWorkNotes?: string;
  beforeWorkImageUrl?: string;
  afterWorkNotes?: string;
  afterWorkImageUrl?: string;
  workStartedAt?: string;
  workCompletedAt?: string;
  confirmedAt?: string;

  payment?: Payment;
  review?: JobReview;
  dispute?: JobDispute;

  createdAt: string;
  updatedAt: string;
}

export interface BookingLocation {
  id: string;
  bookingId: string;
  workerProfileId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  heading?: number;
  speed?: number;
  recordedAt: string;
}

export interface Tender {
  id: string;
  contractorProfileId: string;
  contractor?: ContractorProfile & { user?: User };
  categoryId: string;
  categoryName?: string;
  title: string;
  projectName: string;
  description: string;
  locationAddress: string;
  city: string;
  state: string;
  pincode: string;
  siteLatitude: number;
  siteLongitude: number;
  workerCountRequired: number;
  skillsRequired: string[];
  experienceRequired: number;
  startDate: string;
  endDate: string;
  workingHours: string;
  shifts: string;
  totalBudget: number;
  perWorkerRate: number;
  paymentTerms: string;
  accommodationProvided: boolean;
  foodProvided: boolean;
  transportProvided: boolean;
  safetyRequirements?: string;
  applicationDeadline: string;
  status: TenderStatus;
  applicationsCount?: number;
  createdAt: string;
}

export interface TenderApplication {
  id: string;
  tenderId: string;
  tenderTitle?: string;
  workerProfileId?: string;
  worker?: WorkerProfile & { user?: User };
  tenderTeamId?: string;
  teamName?: string;
  proposedRate: number;
  proposedWorkersCount: number;
  coverNote?: string;
  status: TenderApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
}

export interface TenderTeam {
  id: string;
  name: string;
  leaderWorkerProfileId: string;
  leaderName?: string;
  leaderPhone?: string;
  primaryTrade: string;
  description?: string;
  memberCount: number;
  members?: Array<{
    workerProfileId: string;
    fullName: string;
    roleInTeam: string;
    skills: string[];
  }>;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  platformCommission: number;
  workerPayoutAmount: number;
  paymentMethod?: 'ONLINE' | 'CASH' | 'WALLET' | 'UPI';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type LedgerTransactionType = 
  | 'JOB_EARNING'
  | 'PLATFORM_COMMISSION'
  | 'WITHDRAWAL_REQUEST'
  | 'WITHDRAWAL_PROCESSING'
  | 'WITHDRAWAL_SUCCESS'
  | 'WITHDRAWAL_FAILED'
  | 'REFUND'
  | 'REVERSAL'
  | 'BONUS'
  | 'ADJUSTMENT'
  | 'CASH_COMMISSION_PAYABLE'
  | 'CASH_COMMISSION_DEDUCTED';

export type WithdrawalStatus = 
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface PayoutAccount {
  id: string;
  workerProfileId: string;
  accountType: 'BANK_ACCOUNT' | 'UPI';
  accountHolderName: string;
  bankName?: string;
  accountNumberMasked?: string;
  accountNumberHash?: string;
  ifscCode?: string;
  upiId?: string;
  isPrimary: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  beneficiaryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerWallet {
  id: string;
  workerProfileId: string;
  availableBalance: number;
  reservedBalance: number;
  pendingBalance: number;
  totalLifetimeEarnings: number;
  totalWithdrawn: number;
  totalCommissionPaid: number;
  totalCompletedJobs: number;
  commissionPayable: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletLedgerEntry {
  id: string;
  walletId: string;
  workerProfileId: string;
  bookingId?: string;
  withdrawalId?: string;
  paymentId?: string;
  transactionType: LedgerTransactionType;
  grossAmount: number;
  commissionAmount: number;
  feeAmount: number;
  netAmount: number; // positive = credit, negative = debit
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'REVERSED' | 'FAILED';
  description: string;
  paymentReference?: string;
  payoutReference?: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  walletId: string;
  workerProfileId: string;
  payoutAccountId: string;
  payoutAccountType: 'BANK_ACCOUNT' | 'UPI';
  payoutTargetMasked: string;
  amount: number;
  fee: number;
  netPayout: number;
  currency: string;
  status: WithdrawalStatus;
  provider: string;
  providerPayoutId?: string;
  failureReason?: string;
  idempotencyKey: string;
  requestedAt: string;
  reviewedAt?: string;
  processedAt?: string;
  completedAt?: string;
}

export interface CommissionRule {
  id: string;
  name: string;
  professionSlug?: string;
  serviceCategory?: string;
  commissionType: 'PERCENTAGE' | 'FIXED' | 'HYBRID';
  percentageRate: number;
  fixedAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  exemptWorkerProfileIds?: string[];
  createdAt: string;
}

export interface WorkerEarningSummary {
  wallet: WorkerWallet;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  lifetimeEarnings: number;
  averageEarningPerJob: number;
  withdrawableAmount: number;
  pendingEarnings: number;
  commissionDeductions: number;
  refundsAdjustments: number;
  totalWithdrawn: number;
  totalCompletedJobs: number;
  commissionPayable: number;
}

export interface FinancialAuditLog {
  id: string;
  actorUserId?: string;
  actorRole: string;
  action: string;
  entityType: 'WALLET' | 'LEDGER' | 'WITHDRAWAL' | 'COMMISSION_RULE' | 'REFUND';
  entityId: string;
  amount?: number;
  details: string;
  timestamp: string;
}

export interface WorkerPayout {
  id: string;
  workerProfileId: string;
  paymentId: string;
  amount: number;
  upiId?: string;
  bankAccount?: string;
  ifscCode?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  providerRef?: string;
  createdAt: string;
  processedAt?: string;
}

export interface JobReview {
  id: string;
  bookingId: string;
  customerProfileId: string;
  customerName?: string;
  workerProfileId: string;
  ratingQuality: number;
  ratingTimeliness: number;
  ratingBehaviour: number;
  ratingOverall: number;
  comment?: string;
  createdAt: string;
}

export interface JobDispute {
  id: string;
  bookingId: string;
  customerProfileId: string;
  customerName?: string;
  reason: string;
  description: string;
  evidenceImages?: string[];
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedByAdminId?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  imageUrl?: string;
  isRead: boolean;
  sentAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  type: 'BOOKING' | 'PAYMENT' | 'TENDER' | 'VERIFICATION' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalWorkers: number;
  verifiedWorkers: number;
  pendingVerifications: number;
  activeWorkers: number;
  workersOnline: number;
  activeBookings: number;
  jobsInProgress: number;
  jobsCompleted: number;
  jobsCancelled: number;
  activeTenders: number;
  tenderApplications: number;
  totalPaymentsAmount: number;
  platformCommissionTotal: number;
  pendingPayoutsAmount: number;
  disputesOpen: number;
}

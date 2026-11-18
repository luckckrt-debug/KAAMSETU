// KAAMSETU - Shared Domain Types and Enums across Mobile Apps and API

export type UserRole = 'WORKER' | 'EMPLOYER' | 'CONTRACTOR' | 'ADMIN';

export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'OVERTIME';

export type VerificationStatus = 'UNVERIFIED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface UserSession {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  fullName: string;
  token: string;
}

export interface WorkerProfileData {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  age: number;
  city: string;
  district: string;
  state: string;
  pincode: string;
  skills: string[];
  experienceYears: number;
  expectedDailyWage: number;
  expectedMonthlySalary: number;
  preferredLocation: string;
  isAvailable: boolean;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  completedJobsCount: number;
  bio?: string;
  identityDocType?: string;
  identityDocNumber?: string;
  createdAt: string;
}

export interface EmployerProfileData {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  companyName?: string;
  businessType?: string;
  city: string;
  address: string;
  postedJobsCount: number;
  totalHiresCount: number;
  createdAt: string;
}

export interface ContractorProfileData {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  companyName: string;
  gstNumber?: string;
  licenseNumber?: string;
  city: string;
  activeProjectsCount: number;
  totalWorkforceCount: number;
  createdAt: string;
}

export interface JobPostingData {
  id: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  title: string;
  category: string;
  description: string;
  requiredWorkersCount: number;
  hiredWorkersCount: number;
  dailyWage: number;
  location: string;
  city: string;
  pincode: string;
  durationDays: number;
  startDate: string;
  status: JobStatus;
  applicantsCount: number;
  createdAt: string;
}

export interface JobApplicationData {
  id: string;
  jobId: string;
  jobTitle?: string;
  employerId?: string;
  employerName?: string;
  dailyWage?: number;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerCategory: string;
  workerRating: number;
  workerExperienceYears: number;
  workerDailyWage: number;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
}

export interface ContractorProjectData {
  id: string;
  contractorId: string;
  contractorName?: string;
  title: string;
  clientName: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  assignedWorkerIds: string[];
  assignedWorkersCount: number;
  requiredTrades: string[];
  attendanceRate: number;
  createdAt: string;
}

export interface AttendanceRecordData {
  id: string;
  projectId: string;
  projectTitle?: string;
  contractorId: string;
  workerId: string;
  workerName: string;
  workerTrade?: string;
  date: string;
  status: AttendanceStatus;
  hoursWorked: number;
  dailyWage: number;
  wagePayable: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

export interface ChatMessageData {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'JOB' | 'APPLICATION' | 'PAYMENT' | 'ATTENDANCE' | 'SYSTEM';
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface WorkerWalletData {
  availableBalance: number;
  reservedBalance: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  totalLifetimeEarnings: number;
  totalWithdrawn: number;
  totalCompletedJobs: number;
}

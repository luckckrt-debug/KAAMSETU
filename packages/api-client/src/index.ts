// DIGIWORK - Universal Typed API & Socket.IO Client SDK
// Consumed by DigiWork Worker, DigiWork Hiring, and DigiWork Contractor Mobile Apps

import {
  WorkerProfileData,
  EmployerProfileData,
  ContractorProfileData,
  JobPostingData,
  JobApplicationData,
  ContractorProjectData,
  AttendanceRecordData,
  ChatMessageData,
  NotificationItem,
  WorkerWalletData,
  APP_CONFIG,
} from '@kaamsetu/shared';
import { io, Socket } from 'socket.io-client';

export class DigiWorkApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private socket: Socket | null = null;

  constructor(customBaseUrl?: string) {
    this.baseUrl = customBaseUrl || APP_CONFIG.DEFAULT_API_URL;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setToken(token: string | null) {
    this.authToken = token;
  }

  public getToken(): string | null {
    return this.authToken;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.warn(`[API CLIENT ERROR] Request failed to ${url}:`, err.message);
      // Fallback for network error / simulator connectivity
      throw new Error(err.message || 'Network connection failed. Please ensure backend is running.');
    }
  }

  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------

  public async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string; testOtp?: string }> {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  public async verifyOtp(phoneNumber: string, otp: string, role: string): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    profile?: any;
    message?: string;
  }> {
    const res = await this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp, role }),
    });

    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async registerWorker(data: Partial<WorkerProfileData>): Promise<{ success: boolean; token: string; worker: WorkerProfileData }> {
    const res = await this.request('/api/auth/register-worker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async registerEmployer(data: Partial<EmployerProfileData>): Promise<{ success: boolean; token: string; employer: EmployerProfileData }> {
    const res = await this.request('/api/auth/register-employer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async registerContractor(data: Partial<ContractorProfileData>): Promise<{ success: boolean; token: string; contractor: ContractorProfileData }> {
    const res = await this.request('/api/auth/register-contractor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  // -------------------------------------------------------------
  // WORKERS DISCOVERY
  // -------------------------------------------------------------

  public async getWorkers(params?: { category?: string; city?: string; search?: string; availableOnly?: boolean }): Promise<{
    success: boolean;
    count: number;
    workers: WorkerProfileData[];
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);
    if (params?.availableOnly) query.append('availableOnly', 'true');

    return this.request(`/api/workers?${query.toString()}`);
  }

  public async getWorkerById(id: string): Promise<{ success: boolean; worker: WorkerProfileData }> {
    return this.request(`/api/workers/${id}`);
  }

  public async updateWorkerAvailability(workerId: string, isAvailable: boolean): Promise<{ success: boolean; isAvailable: boolean }> {
    return this.request(`/api/workers/${workerId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  }

  // -------------------------------------------------------------
  // JOBS & APPLICATIONS
  // -------------------------------------------------------------

  public async getJobs(params?: { category?: string; city?: string; employerId?: string; status?: string }): Promise<{
    success: boolean;
    count: number;
    jobs: JobPostingData[];
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.city) query.append('city', params.city);
    if (params?.employerId) query.append('employerId', params.employerId);
    if (params?.status) query.append('status', params.status);

    return this.request(`/api/jobs?${query.toString()}`);
  }

  public async getJobById(id: string): Promise<{ success: boolean; job: JobPostingData; applicants: JobApplicationData[] }> {
    return this.request(`/api/jobs/${id}`);
  }

  public async postJob(job: Partial<JobPostingData>): Promise<{ success: boolean; job: JobPostingData }> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  public async applyForJob(jobId: string, workerId: string, notes?: string): Promise<{ success: boolean; application: JobApplicationData }> {
    return this.request(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ workerId, notes }),
    });
  }

  public async updateApplicationStatus(applicationId: string, status: 'SHORTLISTED' | 'HIRED' | 'REJECTED'): Promise<{
    success: boolean;
    application: JobApplicationData;
  }> {
    return this.request(`/api/applications/${applicationId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // -------------------------------------------------------------
  // BOOKINGS & DISPATCH
  // -------------------------------------------------------------

  public async getBookings(params?: { customerId?: string; status?: string }): Promise<{
    success: boolean;
    count: number;
    bookings: any[];
  }> {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.status) query.append('status', params.status);

    try {
      return await this.request(`/api/bookings?${query.toString()}`);
    } catch {
      return { success: true, count: 0, bookings: [] };
    }
  }

  public async createBooking(data: any): Promise<{ success: boolean; booking: any }> {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getBookingById(id: string): Promise<{ success: boolean; booking: any }> {
    return this.request(`/api/bookings/${id}`);
  }

  public async updateBookingStatus(bookingId: string, status: string, notes?: string): Promise<{ success: boolean; booking: any }> {
    return this.request(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  public async getProfessions(): Promise<{ success: boolean; categories: any[]; professions: any[] }> {
    try {
      return await this.request('/api/professions');
    } catch {
      return { success: true, categories: [], professions: [] };
    }
  }

  public async getMyApplications(workerId: string): Promise<{ success: boolean; count: number; applications: JobApplicationData[] }> {
    return this.request(`/api/worker/my-applications?workerId=${workerId}`);
  }

  public async getMyWork(workerId: string): Promise<{ success: boolean; directJobs: JobApplicationData[]; projectAssignments: ContractorProjectData[] }> {
    return this.request(`/api/worker/my-work?workerId=${workerId}`);
  }

  // -------------------------------------------------------------
  // WORKER EARNINGS & WALLET
  // -------------------------------------------------------------

  public async getWorkerEarnings(workerId: string): Promise<{ success: boolean; wallet: WorkerWalletData }> {
    return this.request(`/api/worker/earnings/${workerId}`);
  }

  public async requestWithdrawal(workerId: string, amount: number, upiId?: string): Promise<{
    success: boolean;
    availableBalance: number;
    totalWithdrawn: number;
    message: string;
  }> {
    return this.request('/api/worker/withdraw', {
      method: 'POST',
      body: JSON.stringify({ workerId, amount, upiId }),
    });
  }

  // -------------------------------------------------------------
  // CONTRACTOR PROJECTS & ATTENDANCE
  // -------------------------------------------------------------

  public async getContractorProjects(contractorId?: string): Promise<{ success: boolean; count: number; projects: ContractorProjectData[] }> {
    const q = contractorId ? `?contractorId=${contractorId}` : '';
    return this.request(`/api/contractor/projects${q}`);
  }

  public async createProject(data: Partial<ContractorProjectData>): Promise<{ success: boolean; project: ContractorProjectData }> {
    return this.request('/api/contractor/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async assignWorkerToProject(projectId: string, workerId: string): Promise<{ success: boolean; project: ContractorProjectData }> {
    return this.request(`/api/contractor/projects/${projectId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ workerId }),
    });
  }

  public async getAttendance(params?: { projectId?: string; date?: string }): Promise<{
    success: boolean;
    count: number;
    attendance: AttendanceRecordData[];
  }> {
    const q = new URLSearchParams();
    if (params?.projectId) q.append('projectId', params.projectId);
    if (params?.date) q.append('date', params.date);
    return this.request(`/api/contractor/attendance?${q.toString()}`);
  }

  public async markAttendance(data: {
    projectId: string;
    workerId: string;
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'OVERTIME';
    hoursWorked?: number;
    notes?: string;
  }): Promise<{ success: boolean; record: AttendanceRecordData }> {
    return this.request('/api/contractor/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getContractorWageSummary(contractorId?: string): Promise<{
    success: boolean;
    totalWagePayable: number;
    totalAttendanceMarked: number;
    totalPresentCount: number;
    records: AttendanceRecordData[];
  }> {
    const q = contractorId ? `?contractorId=${contractorId}` : '';
    return this.request(`/api/contractor/wages${q}`);
  }

  // -------------------------------------------------------------
  // CHAT & NOTIFICATIONS
  // -------------------------------------------------------------

  public async getChatMessages(threadId: string): Promise<{ success: boolean; messages: ChatMessageData[] }> {
    return this.request(`/api/chat/messages?threadId=${threadId}`);
  }

  public async sendChatMessage(data: Partial<ChatMessageData>): Promise<{ success: boolean; message: ChatMessageData }> {
    return this.request('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getNotifications(userId?: string): Promise<{ success: boolean; notifications: NotificationItem[] }> {
    const q = userId ? `?userId=${userId}` : '';
    return this.request(`/api/notifications${q}`);
  }

  // -------------------------------------------------------------
  // REAL-TIME SOCKET.IO CLIENT
  // -------------------------------------------------------------

  public getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(this.baseUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    return this.socket;
  }

  public joinRoom(room: string) {
    const socket = this.getSocket();
    socket.emit('join:room', room);
  }

  public disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Default Singleton Instance
export const apiClient = new DigiWorkApiClient();
export const KaamSetuApiClient = DigiWorkApiClient; // Backward compatibility alias

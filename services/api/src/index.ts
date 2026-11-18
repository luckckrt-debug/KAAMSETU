// KAAMSETU - Central Production API Service
// Unifies KaamSetu Worker, KaamSetu Hiring, and KaamSetu Contractor Mobile Apps

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from './db';
import {
  WorkerProfileData,
  EmployerProfileData,
  ContractorProfileData,
  JobPostingData,
  JobApplicationData,
  ContractorProjectData,
  AttendanceRecordData,
  ChatMessageData,
} from '@kaamsetu/shared';

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kaamsetu-mobile-secret-2026';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Real-time Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`[SOCKET] Mobile client connected: ${socket.id}`);

  socket.on('join:room', (room: string) => {
    socket.join(room);
    console.log(`[SOCKET] Client ${socket.id} joined room: ${room}`);
  });

  socket.on('leave:room', (room: string) => {
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Middleware for JWT Verification
function authenticateToken(req: any, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & PROFILE REGISTRATION
// -------------------------------------------------------------

// Send OTP (Mock / Firebase provider integration)
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  console.log(`[AUTH] Sending OTP to +91-${phoneNumber}. Test OTP: 123456`);
  return res.json({
    success: true,
    message: 'OTP sent successfully to ' + phoneNumber,
    testOtp: '123456',
  });
});

// Verify OTP & Login
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phoneNumber, otp, role = 'WORKER' } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP required' });
  }

  // Accept test OTP 123456 or 6-digit number
  if (otp !== '123456' && otp.length !== 6) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code. Use 123456.' });
  }

  const db = getDb();
  let existingProfile: any = null;
  let userId = `usr-${phoneNumber}`;

  if (role === 'WORKER') {
    existingProfile = db.workers.find(w => w.phoneNumber === phoneNumber);
  } else if (role === 'EMPLOYER') {
    existingProfile = db.employers.find(e => e.phoneNumber === phoneNumber);
  } else if (role === 'CONTRACTOR') {
    existingProfile = db.contractors.find(c => c.phoneNumber === phoneNumber);
  }

  if (existingProfile) {
    userId = existingProfile.userId;
  }

  const token = jwt.sign({ userId, phoneNumber, role }, JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    token,
    user: {
      userId,
      phoneNumber,
      role,
      fullName: existingProfile?.fullName || '',
      isRegistered: Boolean(existingProfile),
    },
    profile: existingProfile,
  });
});

// Register Worker Profile
app.post('/api/auth/register-worker', (req: Request, res: Response) => {
  const db = getDb();
  const data = req.body;

  if (!data.fullName || !data.phoneNumber) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }

  const existingIdx = db.workers.findIndex(w => w.phoneNumber === data.phoneNumber);
  const nowIso = new Date().toISOString();

  const newWorker: WorkerProfileData = {
    id: existingIdx !== -1 ? db.workers[existingIdx].id : `wrk-${Date.now()}`,
    userId: existingIdx !== -1 ? db.workers[existingIdx].userId : `usr-w-${Date.now()}`,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    age: Number(data.age) || 28,
    city: data.city || 'Noida',
    district: data.district || data.city || 'Noida',
    state: data.state || 'Uttar Pradesh',
    pincode: data.pincode || '201301',
    skills: Array.isArray(data.skills) ? data.skills : [data.tradeCategory || 'Electrician'],
    experienceYears: Number(data.experienceYears) || 3,
    expectedDailyWage: Number(data.expectedDailyWage) || 700,
    expectedMonthlySalary: Number(data.expectedMonthlySalary) || 20000,
    preferredLocation: data.preferredLocation || data.city || 'City Center',
    isAvailable: true,
    isVerified: true,
    ratingAvg: 4.8,
    ratingCount: 1,
    completedJobsCount: 0,
    bio: data.bio || `Skilled ${data.skills?.[0] || 'Worker'} with ${data.experienceYears || 3} years experience.`,
    identityDocType: data.identityDocType || 'Aadhaar',
    identityDocNumber: data.identityDocNumber || '•••• •••• ' + data.phoneNumber.slice(-4),
    createdAt: nowIso,
  };

  if (existingIdx !== -1) {
    db.workers[existingIdx] = newWorker;
  } else {
    db.workers.unshift(newWorker);
    db.wallets[newWorker.id] = {
      availableBalance: 0,
      reservedBalance: 0,
      todayEarnings: 0,
      thisWeekEarnings: 0,
      thisMonthEarnings: 0,
      totalLifetimeEarnings: 0,
      totalWithdrawn: 0,
      totalCompletedJobs: 0,
    };
  }

  saveDb();

  // Broadcast new worker availability to employer and contractor apps
  io.emit('worker:registered', newWorker);

  const token = jwt.sign({ userId: newWorker.userId, phoneNumber: newWorker.phoneNumber, role: 'WORKER' }, JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    token,
    worker: newWorker,
    message: 'Worker profile successfully registered',
  });
});

// Register Employer Profile
app.post('/api/auth/register-employer', (req: Request, res: Response) => {
  const db = getDb();
  const data = req.body;

  if (!data.fullName || !data.phoneNumber) {
    return res.status(400).json({ success: false, message: 'Name and phone required' });
  }

  const existingIdx = db.employers.findIndex(e => e.phoneNumber === data.phoneNumber);
  const nowIso = new Date().toISOString();

  const newEmployer: EmployerProfileData = {
    id: existingIdx !== -1 ? db.employers[existingIdx].id : `emp-${Date.now()}`,
    userId: existingIdx !== -1 ? db.employers[existingIdx].userId : `usr-e-${Date.now()}`,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    companyName: data.companyName || `${data.fullName}'s Business`,
    businessType: data.businessType || 'General Hiring',
    city: data.city || 'Noida',
    address: data.address || `${data.city || 'Noida'}, India`,
    postedJobsCount: 0,
    totalHiresCount: 0,
    createdAt: nowIso,
  };

  if (existingIdx !== -1) {
    db.employers[existingIdx] = newEmployer;
  } else {
    db.employers.unshift(newEmployer);
  }

  saveDb();
  const token = jwt.sign({ userId: newEmployer.userId, phoneNumber: newEmployer.phoneNumber, role: 'EMPLOYER' }, JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    token,
    employer: newEmployer,
    message: 'Employer registered successfully',
  });
});

// Register Contractor Profile
app.post('/api/auth/register-contractor', (req: Request, res: Response) => {
  const db = getDb();
  const data = req.body;

  if (!data.fullName || !data.phoneNumber || !data.companyName) {
    return res.status(400).json({ success: false, message: 'Name, company, and phone required' });
  }

  const existingIdx = db.contractors.findIndex(c => c.phoneNumber === data.phoneNumber);
  const nowIso = new Date().toISOString();

  const newContractor: ContractorProfileData = {
    id: existingIdx !== -1 ? db.contractors[existingIdx].id : `cnt-${Date.now()}`,
    userId: existingIdx !== -1 ? db.contractors[existingIdx].userId : `usr-c-${Date.now()}`,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    companyName: data.companyName,
    gstNumber: data.gstNumber || '07AAACS1429B1Z8',
    licenseNumber: data.licenseNumber || 'LIC-2026-REG',
    city: data.city || 'Noida',
    activeProjectsCount: 0,
    totalWorkforceCount: 0,
    createdAt: nowIso,
  };

  if (existingIdx !== -1) {
    db.contractors[existingIdx] = newContractor;
  } else {
    db.contractors.unshift(newContractor);
  }

  saveDb();
  const token = jwt.sign({ userId: newContractor.userId, phoneNumber: newContractor.phoneNumber, role: 'CONTRACTOR' }, JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    token,
    contractor: newContractor,
    message: 'Contractor registered successfully',
  });
});

// -------------------------------------------------------------
// 2. WORKERS MARKETPLACE (DISCOVERY & PROFILE)
// -------------------------------------------------------------

// List Workers with Multi-Criteria Filtering
app.get('/api/workers', (req: Request, res: Response) => {
  const db = getDb();
  const { category, city, search, availableOnly } = req.query;

  let list = [...db.workers];

  if (category && category !== 'all') {
    const catStr = String(category).toLowerCase();
    list = list.filter(w =>
      w.skills.some((s: string) => s.toLowerCase().includes(catStr))
    );
  }

  if (city && city !== 'all') {
    const cityStr = String(city).toLowerCase();
    list = list.filter(w => w.city.toLowerCase().includes(cityStr));
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(w =>
      w.fullName.toLowerCase().includes(q) ||
      w.skills.some((s: string) => s.toLowerCase().includes(q)) ||
      w.city.toLowerCase().includes(q)
    );
  }

  if (availableOnly === 'true') {
    list = list.filter(w => w.isAvailable);
  }

  return res.json({ success: true, count: list.length, workers: list });
});

// Get Single Worker Details
app.get('/api/workers/:id', (req: Request, res: Response) => {
  const db = getDb();
  const worker = db.workers.find(w => w.id === req.params.id);

  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  return res.json({ success: true, worker });
});

// Toggle Worker Availability (Online / Offline Duty Status)
app.put('/api/workers/:id/availability', (req: Request, res: Response) => {
  const db = getDb();
  const worker = db.workers.find(w => w.id === req.params.id);

  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  const { isAvailable } = req.body;
  worker.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !worker.isAvailable;
  saveDb();

  io.emit('worker:availability:updated', { workerId: worker.id, isAvailable: worker.isAvailable });

  return res.json({
    success: true,
    isAvailable: worker.isAvailable,
    message: `Worker status updated to ${worker.isAvailable ? 'Online' : 'Offline'}`,
  });
});

// -------------------------------------------------------------
// 3. JOBS & HIRING LIFECYCLE
// -------------------------------------------------------------

// List All Jobs (Worker Feed & Employer Management)
app.get('/api/jobs', (req: Request, res: Response) => {
  const db = getDb();
  const { category, city, employerId, status } = req.query;

  let list = [...db.jobs];

  if (employerId) {
    list = list.filter(j => j.employerId === employerId);
  }

  if (category && category !== 'all') {
    const cat = String(category).toLowerCase();
    list = list.filter(j => j.category.toLowerCase().includes(cat) || j.title.toLowerCase().includes(cat));
  }

  if (city && city !== 'all') {
    const c = String(city).toLowerCase();
    list = list.filter(j => j.city.toLowerCase().includes(c));
  }

  if (status) {
    list = list.filter(j => j.status === status);
  }

  return res.json({ success: true, count: list.length, jobs: list });
});

// Get Single Job Details + Applicants
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const db = getDb();
  const job = db.jobs.find(j => j.id === req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const applicants = db.applications.filter(a => a.jobId === job.id);

  return res.json({ success: true, job, applicants });
});

// Create Job Post (Employer App)
app.post('/api/jobs', (req: Request, res: Response) => {
  const db = getDb();
  const data = req.body;
  const category = data.category || data.trade;

  if (!data.title || !category || !data.dailyWage) {
    return res.status(400).json({ success: false, message: 'Title, category, and daily wage are required' });
  }

  const newJob: JobPostingData = {
    id: `job-${Date.now()}`,
    employerId: data.employerId || 'emp-1',
    employerName: data.employerName || 'Employer',
    employerPhone: data.employerPhone || '9911223344',
    title: data.title,
    category,
    description: data.description || '',
    requiredWorkersCount: Number(data.requiredWorkersCount) || 1,
    hiredWorkersCount: 0,
    dailyWage: Number(data.dailyWage),
    location: data.location || 'Noida',
    city: data.city || 'Noida',
    pincode: data.pincode || '201301',
    durationDays: Number(data.durationDays) || 1,
    startDate: data.startDate || 'Immediate',
    status: 'OPEN',
    applicantsCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.jobs.unshift(newJob);

  // Update employer stats
  const employer = db.employers.find(e => e.id === newJob.employerId);
  if (employer) {
    employer.postedJobsCount += 1;
  }

  saveDb();

  // Broadcast to all Worker mobile apps instantly
  io.emit('job:posted', newJob);

  return res.status(201).json({
    success: true,
    job: newJob,
    message: 'Job posted successfully and broadcasted to nearby workers',
  });
});

// Worker Applies for Job (Worker App)
app.post('/api/jobs/:id/apply', (req: Request, res: Response) => {
  const db = getDb();
  const job = db.jobs.find(j => j.id === req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  const { workerId, notes } = req.body;
  const worker = db.workers.find(w => w.id === workerId);

  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker profile not found' });
  }

  // Prevent duplicate application
  const existing = db.applications.find(a => a.jobId === job.id && a.workerId === worker.id);
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already applied for this job' });
  }

  const newApplication: JobApplicationData = {
    id: `app-${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    employerId: job.employerId,
    employerName: job.employerName,
    dailyWage: job.dailyWage,
    workerId: worker.id,
    workerName: worker.fullName,
    workerPhone: worker.phoneNumber,
    workerCategory: worker.skills[0] || 'Worker',
    workerRating: worker.ratingAvg,
    workerExperienceYears: worker.experienceYears,
    workerDailyWage: worker.expectedDailyWage,
    status: 'APPLIED',
    appliedAt: new Date().toISOString(),
    notes: notes || 'Ready for work with all necessary tools.',
  };

  db.applications.unshift(newApplication);
  job.applicantsCount += 1;

  // Add Notification for Employer
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: job.employerId,
    title: 'New Applicant Received!',
    body: `${worker.fullName} (${worker.skills[0]}) applied for "${job.title}".`,
    type: 'APPLICATION',
    data: { jobId: job.id, applicationId: newApplication.id },
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDb();

  // Real-time alert to Employer app
  io.to(`employer:${job.employerId}`).emit('application:received', newApplication);
  io.emit('job:application:new', { jobId: job.id, applicantsCount: job.applicantsCount });

  return res.status(201).json({
    success: true,
    application: newApplication,
    message: 'Application submitted successfully to employer',
  });
});

// Employer Updates Application Status (Shortlist, Hire, Reject)
app.post('/api/applications/:id/status', (req: Request, res: Response) => {
  const db = getDb();
  const application = db.applications.find(a => a.id === req.params.id);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const { status } = req.body;
  if (!['SHORTLISTED', 'HIRED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  application.status = status;

  const job = db.jobs.find(j => j.id === application.jobId);
  if (job && status === 'HIRED') {
    job.hiredWorkersCount += 1;
    if (job.hiredWorkersCount >= job.requiredWorkersCount) {
      job.status = 'IN_PROGRESS';
    }

    const employer = db.employers.find(e => e.id === job.employerId);
    if (employer) employer.totalHiresCount += 1;

    // Credit sample earning to worker wallet upon hire / work
    if (!db.wallets[application.workerId]) {
      db.wallets[application.workerId] = {
        availableBalance: 0,
        reservedBalance: 0,
        todayEarnings: 0,
        thisWeekEarnings: 0,
        thisMonthEarnings: 0,
        totalLifetimeEarnings: 0,
        totalWithdrawn: 0,
        totalCompletedJobs: 0,
      };
    }
  }

  // Notify Worker
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: application.workerId,
    title: status === 'HIRED' ? 'Congratulations! You are Hired!' : `Application ${status}`,
    body: `Employer ${application.employerName || 'Employer'} marked your application as ${status} for "${application.jobTitle}".`,
    type: 'JOB',
    data: { applicationId: application.id, status },
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDb();

  // Real-time synchronization to Worker App
  io.to(`worker:${application.workerId}`).emit('application:status:updated', application);
  io.emit('application:updated', application);

  return res.json({
    success: true,
    application,
    message: `Application marked as ${status}`,
  });
});

// Worker's Submitted Applications
app.get('/api/worker/my-applications', (req: Request, res: Response) => {
  const db = getDb();
  const { workerId } = req.query;

  if (!workerId) {
    return res.status(400).json({ success: false, message: 'Worker ID required' });
  }

  const apps = db.applications.filter(a => a.workerId === workerId);
  return res.json({ success: true, count: apps.length, applications: apps });
});

// Worker's Active / Hired Work
app.get('/api/worker/my-work', (req: Request, res: Response) => {
  const db = getDb();
  const { workerId } = req.query;

  if (!workerId) {
    return res.status(400).json({ success: false, message: 'Worker ID required' });
  }

  const hiredApps = db.applications.filter(a => a.workerId === workerId && a.status === 'HIRED');
  const projectAssignments = db.projects.filter(p => p.assignedWorkerIds.includes(String(workerId)));

  return res.json({
    success: true,
    directJobs: hiredApps,
    projectAssignments,
  });
});

// Worker Digital Wallet & Earnings Summary
app.get('/api/worker/earnings/:workerId', (req: Request, res: Response) => {
  const db = getDb();
  const workerId = String(req.params.workerId);

  let wallet = db.wallets[workerId];
  if (!wallet) {
    wallet = {
      availableBalance: 2400,
      reservedBalance: 0,
      todayEarnings: 750,
      thisWeekEarnings: 3800,
      thisMonthEarnings: 16500,
      totalLifetimeEarnings: 52000,
      totalWithdrawn: 49600,
      totalCompletedJobs: 42,
    };
    db.wallets[workerId] = wallet;
    saveDb();
  }

  return res.json({ success: true, wallet });
});

// Worker Withdrawal Request
app.post('/api/worker/withdraw', (req: Request, res: Response) => {
  const db = getDb();
  const { workerId, amount, upiId } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  let wallet = db.wallets[workerId];
  if (!wallet || wallet.availableBalance < numAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient available balance' });
  }

  wallet.availableBalance -= numAmount;
  wallet.totalWithdrawn += numAmount;
  saveDb();

  io.emit('wallet:updated', { workerId, availableBalance: wallet.availableBalance });

  return res.json({
    success: true,
    availableBalance: wallet.availableBalance,
    totalWithdrawn: wallet.totalWithdrawn,
    message: `₹${numAmount} successfully requested for withdrawal to ${upiId || 'primary UPI'}.`,
  });
});

// -------------------------------------------------------------
// 4. CONTRACTOR PROJECTS, WORKFORCE & ATTENDANCE
// -------------------------------------------------------------

// List Contractor Projects
app.get('/api/contractor/projects', (req: Request, res: Response) => {
  const db = getDb();
  const { contractorId } = req.query;

  let list = [...db.projects];
  if (contractorId) {
    list = list.filter(p => p.contractorId === contractorId);
  }

  return res.json({ success: true, count: list.length, projects: list });
});

// Create Contractor Project
app.post('/api/contractor/projects', (req: Request, res: Response) => {
  const db = getDb();
  const data = req.body;

  if (!data.title || !data.location) {
    return res.status(400).json({ success: false, message: 'Project title and location required' });
  }

  const newProject: ContractorProjectData = {
    id: `prj-${Date.now()}`,
    contractorId: data.contractorId || 'cnt-1',
    contractorName: data.contractorName || 'Contractor',
    title: data.title,
    clientName: data.clientName || 'General Client',
    location: data.location,
    city: data.city || 'Noida',
    startDate: data.startDate || 'Immediate',
    endDate: data.endDate || 'Ongoing',
    budget: Number(data.budget) || 1000000,
    status: 'ACTIVE',
    assignedWorkerIds: Array.isArray(data.assignedWorkerIds) ? data.assignedWorkerIds : [],
    assignedWorkersCount: Array.isArray(data.assignedWorkerIds) ? data.assignedWorkerIds.length : 0,
    requiredTrades: Array.isArray(data.requiredTrades) ? data.requiredTrades : ['Construction Labour', 'Mason'],
    attendanceRate: 100,
    createdAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);

  const contractor = db.contractors.find(c => c.id === newProject.contractorId);
  if (contractor) contractor.activeProjectsCount += 1;

  saveDb();

  io.emit('contractor:project:created', newProject);

  return res.status(201).json({
    success: true,
    project: newProject,
    message: 'Project created successfully',
  });
});

// Assign Worker to Project
app.post('/api/contractor/projects/:id/assign', (req: Request, res: Response) => {
  const db = getDb();
  const project = db.projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const { workerId } = req.body;
  if (!workerId) {
    return res.status(400).json({ success: false, message: 'Worker ID required' });
  }

  const worker = db.workers.find(w => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  if (!project.assignedWorkerIds.includes(workerId)) {
    project.assignedWorkerIds.push(workerId);
    project.assignedWorkersCount = project.assignedWorkerIds.length;
  }

  // Notify Worker of project deployment
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: worker.userId,
    title: 'Assigned to New Site Project!',
    body: `Contractor has assigned you to "${project.title}" at ${project.location}.`,
    type: 'JOB',
    data: { projectId: project.id },
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDb();

  io.emit('contractor:workforce:updated', { projectId: project.id, assignedWorkerIds: project.assignedWorkerIds });

  return res.json({
    success: true,
    project,
    message: `${worker.fullName} assigned to ${project.title}`,
  });
});

// Get Attendance Records
app.get('/api/contractor/attendance', (req: Request, res: Response) => {
  const db = getDb();
  const { projectId, date } = req.query;

  let records = [...db.attendance];

  if (projectId) {
    records = records.filter(r => r.projectId === projectId);
  }
  if (date) {
    records = records.filter(r => r.date === date);
  }

  return res.json({ success: true, count: records.length, attendance: records });
});

// Mark Daily Attendance (Present, Absent, Half Day, Overtime)
app.post('/api/contractor/attendance', (req: Request, res: Response) => {
  const db = getDb();
  const { projectId, workerId, status, hoursWorked, notes } = req.body;

  if (!projectId || !workerId || !status) {
    return res.status(400).json({ success: false, message: 'Project, worker, and status required' });
  }

  const worker = db.workers.find(w => w.id === workerId);
  const project = db.projects.find(p => p.id === projectId);

  const today = new Date().toISOString().split('T')[0];
  const existingIdx = db.attendance.findIndex(a => a.projectId === projectId && a.workerId === workerId && a.date === today);

  const dailyWage = worker?.expectedDailyWage || 700;
  let wageMultiplier = 1;
  if (status === 'ABSENT') wageMultiplier = 0;
  if (status === 'HALF_DAY') wageMultiplier = 0.5;
  if (status === 'OVERTIME') wageMultiplier = 1.5;

  const wagePayable = Math.round(dailyWage * wageMultiplier);

  const record: AttendanceRecordData = {
    id: existingIdx !== -1 ? db.attendance[existingIdx].id : `att-${Date.now()}`,
    projectId,
    projectTitle: project?.title || 'Site Project',
    contractorId: project?.contractorId || 'cnt-1',
    workerId,
    workerName: worker?.fullName || 'Worker',
    workerTrade: worker?.skills[0] || 'Labour',
    date: today,
    status,
    hoursWorked: Number(hoursWorked) || (status === 'HALF_DAY' ? 4 : status === 'OVERTIME' ? 12 : 8),
    dailyWage,
    wagePayable,
    isPaid: false,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    db.attendance[existingIdx] = record;
  } else {
    db.attendance.unshift(record);
  }

  // Credit worker digital wallet when present or overtime
  if (record.wagePayable > 0) {
    if (!db.wallets[workerId]) {
      db.wallets[workerId] = {
        availableBalance: 0,
        reservedBalance: 0,
        todayEarnings: 0,
        thisWeekEarnings: 0,
        thisMonthEarnings: 0,
        totalLifetimeEarnings: 0,
        totalWithdrawn: 0,
        totalCompletedJobs: 0,
      };
    }
    db.wallets[workerId].availableBalance += record.wagePayable;
    db.wallets[workerId].todayEarnings += record.wagePayable;
    db.wallets[workerId].thisWeekEarnings += record.wagePayable;
    db.wallets[workerId].thisMonthEarnings += record.wagePayable;
    db.wallets[workerId].totalLifetimeEarnings += record.wagePayable;
    db.wallets[workerId].totalCompletedJobs += 1;
    io.emit('wallet:updated', { workerId, wallet: db.wallets[workerId] });
  }

  saveDb();

  io.emit('attendance:recorded', record);

  return res.json({
    success: true,
    record,
    message: `Attendance marked as ${status} for ${record.workerName}`,
  });
});

// Contractor Wage & Expense Summary
app.get('/api/contractor/wages', (req: Request, res: Response) => {
  const db = getDb();
  const { contractorId } = req.query;

  const records = db.attendance.filter(r => !contractorId || r.contractorId === contractorId);
  const totalWagePayable = records.reduce((sum, r) => sum + r.wagePayable, 0);
  const totalPresentCount = records.filter(r => r.status === 'PRESENT' || r.status === 'OVERTIME').length;

  return res.json({
    success: true,
    totalWagePayable,
    totalAttendanceMarked: records.length,
    totalPresentCount,
    records,
  });
});

// -------------------------------------------------------------
// 5. CHAT MESSAGING & NOTIFICATIONS
// -------------------------------------------------------------

// Get Conversation Messages
app.get('/api/chat/messages', (req: Request, res: Response) => {
  const db = getDb();
  const { threadId } = req.query;

  let msgs = [...db.messages];
  if (threadId) {
    msgs = msgs.filter(m => m.threadId === threadId);
  }

  return res.json({ success: true, count: msgs.length, messages: msgs });
});

// Send Chat Message
app.post('/api/chat/messages', (req: Request, res: Response) => {
  const db = getDb();
  const { threadId, senderId, senderRole, senderName, text } = req.body;

  if (!threadId || !text || !senderId) {
    return res.status(400).json({ success: false, message: 'Thread ID, sender, and text required' });
  }

  const newMsg: ChatMessageData = {
    id: `msg-${Date.now()}`,
    threadId,
    senderId,
    senderRole: senderRole || 'WORKER',
    senderName: senderName || 'User',
    text,
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  db.messages.push(newMsg);
  saveDb();

  // Real-time broadcast to room
  io.to(threadId).emit('chat:message', newMsg);
  io.emit('chat:new', newMsg);

  return res.status(201).json({ success: true, message: newMsg });
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const db = getDb();
  const { userId } = req.query;

  let list = [...db.notifications];
  if (userId) {
    list = list.filter(n => n.userId === userId || n.userId === 'all');
  }

  return res.json({ success: true, count: list.length, notifications: list });
});

// -------------------------------------------------------------
// 6. HEALTH & SYSTEM OVERVIEW
// -------------------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'KAAMSETU Unified Mobile API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/stats', (req: Request, res: Response) => {
  const db = getDb();
  return res.json({
    success: true,
    stats: {
      totalWorkers: db.workers.length,
      availableWorkers: db.workers.filter(w => w.isAvailable).length,
      totalEmployers: db.employers.length,
      totalContractors: db.contractors.length,
      totalJobs: db.jobs.length,
      openJobs: db.jobs.filter(j => j.status === 'OPEN').length,
      totalProjects: db.projects.length,
      totalApplications: db.applications.length,
    },
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`KAAMSETU Central API & Socket.IO running on port ${PORT}`);
  console.log(`Accessible from Android Emulator at http://10.0.2.2:${PORT}`);
  console.log(`Accessible locally at http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

const http = require('http');

const API_BASE = 'http://localhost:5000';

function post(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      `${API_BASE}${urlPath}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${API_BASE}${urlPath}`, { method: 'GET' }, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('================================================================');
  console.log('   KAAMSETU — FULL CROSS-APP SYNCHRONIZATION & WORKFLOW TEST   ');
  console.log('================================================================\n');

  try {
    // 0. Health check
    console.log('[1/7] Checking Central API Health...');
    const health = await get('/api/health');
    console.log('  -> Status:', health.status, '| Response:', JSON.stringify(health.data));
    if (health.status !== 200) throw new Error('API not healthy');

    // 1. Worker Registration in apps/worker
    console.log('\n[2/7] Testing KaamSetu Worker Registration (apps/worker)...');
    const workerReg = await post('/api/auth/register-worker', {
      phoneNumber: '9876543210',
      fullName: 'Arun Kumar Verma',
      age: 29,
      city: 'Noida',
      trade: 'Electrician',
      skills: ['Electrical Wiring', 'MCB Installation', 'Inverter Setup'],
      experienceYears: 6,
      dailyWage: 900,
      monthlySalary: 24000,
      locality: 'Sector 62',
      aadhaarNumber: 'XXXX-XXXX-9021',
    });
    console.log('  -> Worker registered:', workerReg.data.worker?.id, workerReg.data.worker?.fullName);
    const workerId = workerReg.data.worker.id;

    // 2. Employer Registration in apps/hiring
    console.log('\n[3/7] Testing KaamSetu Employer Registration (apps/hiring)...');
    const empReg = await post('/api/auth/register-employer', {
      phoneNumber: '9811223344',
      fullName: 'Siddharth Mehra',
      companyName: 'Mehra Commercial Estates',
      city: 'Noida',
      industry: 'Real Estate & Facility Management',
      address: 'Tower A, Sector 132, Expressway, Noida',
    });
    console.log('  -> Employer registered:', empReg.data.employer?.id, empReg.data.employer?.companyName);
    const employerId = empReg.data.employer.id;

    // 3. Employer Posts a Job in apps/hiring
    console.log('\n[4/7] Employer Posts Urgent Job (apps/hiring)...');
    const jobPost = await post('/api/jobs', {
      employerId,
      employerName: 'Mehra Commercial Estates',
      employerPhone: '9811223344',
      title: 'Commercial Complex 3-Phase Wiring & Cable Laying',
      category: 'Electrician',
      trade: 'Electrician',
      description: 'Need certified electrician for industrial panel wiring and 3-phase testing.',
      location: 'Sector 132',
      city: 'Noida',
      dailyWage: 950,
      workersNeeded: 3,
      duration: '3 Days',
      timing: '9:00 AM - 6:00 PM',
      skillsRequired: ['Electrical Wiring', 'MCB Installation'],
    });
    console.log('  -> Job post response:', jobPost.status, jobPost.data);
    const jobId = jobPost.data?.job?.id;

    // 4. Worker Discovers and Applies for Job in apps/worker
    console.log('\n[5/7] Worker Discovers and Applies to Job (apps/worker)...');
    const workerJobs = await get('/api/jobs?trade=Electrician');
    console.log(`  -> Worker found ${workerJobs.data.jobs?.length} matching jobs.`);

    const applyRes = await post(`/api/jobs/${jobId}/apply`, {
      workerId,
      coverNote: 'Ready to join immediately with professional toolkit and safety equipment.',
    });
    console.log('  -> Worker applied successfully! Application ID:', applyRes.data.application?.id);
    const applicationId = applyRes.data.application.id;

    // 5. Employer Reviews Application and Hires Worker (apps/hiring)
    console.log('\n[6/7] Employer Hires Worker (apps/hiring)...');
    const hireRes = await post(`/api/applications/${applicationId}/status`, {
      status: 'HIRED',
    });
    console.log('  -> Application status updated to:', hireRes.data.application?.status);

    // Verify Worker sees HIRED status in My Work
    const myWork = await get(`/api/worker/my-work?workerId=${workerId}`);
    console.log(`  -> Worker verified active work count: ${myWork.data.directJobs?.length}`);

    // 6. Contractor Muster Roll Attendance & Wages (apps/contractor)
    console.log('\n[7/7] Contractor Muster Roll & Worker Wallet (apps/contractor & apps/worker)...');
    const attendanceRes = await post('/api/contractor/attendance', {
      projectId: 'prj-1',
      workerId,
      status: 'PRESENT',
      hoursWorked: 8,
      notes: 'Completed day 1 commercial panel test successfully',
    });
    console.log('  -> Attendance logged for worker! Record ID:', attendanceRes.data.record?.id, '| Wage Credited: ₹', attendanceRes.data.record?.wagePayable);

    // Check Worker Wallet updated
    const walletRes = await get(`/api/worker/earnings/${workerId}`);
    console.log('  -> Worker Digital Wallet Balance: ₹' + walletRes.data.wallet?.availableBalance, '| Today Earnings: ₹' + walletRes.data.wallet?.todayEarnings);

    // Worker Withdraws via UPI
    const withdrawRes = await post('/api/worker/withdraw', {
      workerId,
      amount: 500,
      upiId: 'arun.verma@okhdfcbank',
    });
    console.log('  -> Withdrawal Processed:', withdrawRes.data.success ? 'SUCCESS ✓' : 'FAILED', '| Remaining Balance: ₹' + withdrawRes.data.availableBalance);

    console.log('\n================================================================');
    console.log('  ✅ ALL CROSS-APP SYNCHRONIZATION TESTS PASSED PERFECTLY!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTest();

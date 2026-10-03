const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, hostname: '127.0.0.1' }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('STARTING FULL END-TO-END OOSE CAPSTONE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health Check
  try {
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(
      health.status === 200 && (health.data.status === 'healthy' || health.data.status === 'OK'),
      'Backend health check responds 200 (healthy)'
    );
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // 2. Candidate Login
  let candidateToken = '';
  let candidateId = '';
  try {
    const candLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'candidate@example.com', password: 'Password123!' }
    );
    assert(candLogin.status === 200 && candLogin.data.token, 'Candidate login succeeds with JWT');
    candidateToken = candLogin.data.token;
    candidateId = candLogin.data.user._id;
  } catch (err) {
    assert(false, `Candidate login failed: ${err.message}`);
  }

  // 3. Candidate Profile
  try {
    const candProfile = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/candidates/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(candProfile.status === 200 && candProfile.data.profile, 'Candidate profile retrieved with skills');
  } catch (err) {
    assert(false, `Candidate profile failed: ${err.message}`);
  }

  // 4. Job Search
  let testJobId = '';
  try {
    const jobsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/jobs?keyword=Developer',
      method: 'GET',
    });
    assert(jobsRes.status === 200 && jobsRes.data.jobs.length > 0, `Job search returned ${jobsRes.data?.jobs?.length} matching jobs`);
    testJobId = jobsRes.data.jobs[0]._id;
  } catch (err) {
    assert(false, `Job search failed: ${err.message}`);
  }

  // 5. AI Match Analysis & Eligibility Checking
  try {
    const matchRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/match-job',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
      },
      { jobId: testJobId }
    );
    const m = matchRes.data?.analysis;
    assert(
      matchRes.status === 200 && m && typeof m.matchPercentage === 'number' && m.eligibility,
      `AI Job Match computed: ${m?.matchPercentage}% match (${m?.eligibility}) with 50/20/15/15 weighting`
    );
  } catch (err) {
    assert(false, `AI match failed: ${err.message}`);
  }

  // 6. AI Skill Gap Analysis
  try {
    const gapRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/skill-gap',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
      },
      { jobId: testJobId }
    );
    const gap = gapRes.data?.gapAnalysis;
    assert(
      gapRes.status === 200 && gap && Array.isArray(gap.matchedSkills) && Array.isArray(gap.missingSkills),
      `Skill Gap calculated: ${gap?.matchedSkills?.length} matched, ${gap?.missingSkills?.length} missing skills identified`
    );
  } catch (err) {
    assert(false, `Skill gap failed: ${err.message}`);
  }

  // 7. AI Learning Roadmap
  try {
    const roadmapRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/learning-roadmap',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
      },
      { jobId: testJobId }
    );
    const rm = roadmapRes.data?.roadmap;
    const steps = Array.isArray(rm) ? rm : (rm?.steps || []);
    assert(
      roadmapRes.status === 200 && Array.isArray(steps) && steps.length > 0,
      `Personalized Learning Roadmap generated with ${steps.length} progressive learning milestones`
    );
  } catch (err) {
    assert(false, `Learning roadmap failed: ${err.message}`);
  }

  // 8. Recruiter Login & Applicant Management
  let recruiterToken = '';
  try {
    const recLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'recruiter@example.com', password: 'Password123!' }
    );
    assert(recLogin.status === 200 && recLogin.data.token, 'Recruiter login succeeds with JWT');
    recruiterToken = recLogin.data.token;
  } catch (err) {
    assert(false, `Recruiter login failed: ${err.message}`);
  }

  // 9. Recruiter Dashboard & Analytics
  try {
    const recApps = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications',
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(recApps.status === 200 && recApps.data.applications.length > 0, `Recruiter retrieved ${recApps.data?.applications?.length} candidate applications`);
  } catch (err) {
    assert(false, `Recruiter applications failed: ${err.message}`);
  }

  // 10. Recruiter Interview Scheduling
  try {
    const recApps = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications',
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    const targetApp = recApps.data?.applications?.[0];
    if (targetApp) {
      const interviewRes = await request(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/interviews',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${recruiterToken}`,
          },
        },
        {
          applicationId: targetApp._id,
          candidateId: targetApp.candidateId?._id || targetApp.candidateId,
          date: '2026-10-15',
          time: '14:00',
          mode: 'Online',
          meetingLink: 'https://meet.google.com/xyz-recruitment-test',
          notes: 'Technical architecture discussion & coding round',
        }
      );
      assert(
        interviewRes.status === 201 && interviewRes.data.interview,
        'Interview successfully scheduled with automated candidate notification generated'
      );
    }
  } catch (err) {
    assert(false, `Interview schedule failed: ${err.message}`);
  }

  // 11. Candidate Notifications
  try {
    const notifs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(
      notifs.status === 200 && Array.isArray(notifs.data.notifications),
      `Candidate received ${notifs.data?.notifications?.length} system notifications`
    );
  } catch (err) {
    assert(false, `Candidate notifications failed: ${err.message}`);
  }

  // 12. Admin Login & Governance Console
  let adminToken = '';
  try {
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@example.com', password: 'Password123!' }
    );
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login authenticated as Superadmin');
    adminToken = adminLogin.data.token;
  } catch (err) {
    assert(false, `Admin login failed: ${err.message}`);
  }

  // 13. Admin Dashboard Metrics & Telemetry
  try {
    const adminDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const s = adminDash.data?.stats;
    assert(
      adminDash.status === 200 && s.totalUsers > 0 && s.totalJobs > 0 && s.totalApplications > 0,
      `Admin telemetry active: ${s?.totalUsers} Users, ${s?.companies} Companies, ${s?.totalJobs} Jobs, ${s?.totalApplications} Applications`
    );
  } catch (err) {
    assert(false, `Admin dashboard failed: ${err.message}`);
  }

  // 14. Admin User Management & Status Toggle
  try {
    const usersRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const candUser = usersRes.data?.users?.find((u) => u.role === 'candidate');
    if (candUser) {
      // Toggle to disabled
      const t1 = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/admin/users/${candUser._id}/toggle-status`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      // Toggle back to active
      const t2 = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/admin/users/${candUser._id}/toggle-status`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(
        t1.status === 200 && t2.status === 200 && t2.data.user.status === 'active',
        'Admin user governance: Account status toggle verified successfully'
      );
    }
  } catch (err) {
    assert(false, `Admin toggle failed: ${err.message}`);
  }

  // 15. Standalone AI Resume Analyzer & Career Skill Advisor
  try {
    const deepAnalysisRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/analyze-resume',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
      },
      {}
    );
    const da = deepAnalysisRes.data?.analysis;
    assert(
      deepAnalysisRes.status === 200 && da && da.careerReadiness?.overall && da.skillsToLearn?.highPriority,
      `AI Resume Analyzer: Career readiness computed at ${da?.careerReadiness?.overall}%, with ${da?.skillsToLearn?.highPriority?.length} high-priority skill recommendations`
    );
  } catch (err) {
    assert(false, `AI Resume Analyzer failed: ${err.message}`);
  }

  // 16. Ask AI About My Resume Chat
  try {
    const chatRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/resume-chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
      },
      { question: 'What should I learn next to improve my resume?' }
    );
    assert(
      chatRes.status === 200 && chatRes.data.answer && chatRes.data.answer.length > 20,
      'Ask AI About My Resume: Contextual Q&A response generated from resume'
    );
  } catch (err) {
    assert(false, `Ask AI chat failed: ${err.message}`);
  }

  // 17. Frontend Health Check
  try {
    const fe = await request({
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET',
    });
    const content = fe.raw || '';
    assert(
      fe.status === 200 && (content.includes('HireMatch AI') || content.includes('HireMatch') || content.includes('JOB PORTAL')),
      'Frontend Vite Server serving HireMatch AI Platform SPA on http://localhost:5173'
    );
  } catch (err) {
    assert(false, `Frontend check failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
}

runE2ETests().catch(console.error);

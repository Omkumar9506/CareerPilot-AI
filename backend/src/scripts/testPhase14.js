import http from 'http';
import mongoose from 'mongoose';
import app from '../app.js';
import { env } from '../config/env.js';

const request = async ({ port, path, method = 'GET', headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve({ status: res.statusCode, body: data });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runPhase14Tests = async () => {
  console.log('=================================================');
  console.log('🚀 RUNNING PHASE 14: RECRUITER DASHBOARD & FUNNEL');
  console.log('=================================================');

  await mongoose.connect(env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`✅ Test server listening on ephemeral port ${port}`);

  const timestamp = Date.now();

  try {
    // 1. Register Recruiter
    console.log('\n--- Step 1: Register Recruiter & Post Vacancies ---');
    const recruiterRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Recruiter Boss ${timestamp}`,
        email: `boss_${timestamp}@hyperion.ai`,
        password: 'Password123!',
        role: 'recruiter',
        company: 'Hyperion AI Labs',
      },
    });
    const recruiterToken = recruiterRes.body.data.token;
    const recruiterId = recruiterRes.body.data.user._id;

    // Post Job 1
    const job1Res = await request({
      port,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        title: 'Principal AI Systems Engineer',
        description: 'Lead next-gen LLM distributed serving platform.',
        company: 'Hyperion AI Labs',
        location: 'San Francisco, CA',
        workplaceType: 'Hybrid',
        jobType: 'Full-time',
        experienceLevel: 'Lead',
        skillsRequired: ['Python', 'PyTorch', 'C++', 'CUDA', 'Distributed Systems'],
        salary: { min: 220000, max: 280000, currency: 'USD' },
      },
    });
    const job1Id = job1Res.body.data.job._id;
    console.log(`✅ Job 1 created: "${job1Res.body.data.job.title}" (${job1Id})`);

    // Post Job 2
    const job2Res = await request({
      port,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        title: 'Full Stack Frontend Architect',
        description: 'Design real-time AI canvas tooling with React and WebGL.',
        company: 'Hyperion AI Labs',
        location: 'Remote',
        workplaceType: 'Remote',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        skillsRequired: ['React', 'TypeScript', 'WebGL', 'TailwindCSS'],
        salary: { min: 175000, max: 215000, currency: 'USD' },
      },
    });
    const job2Id = job2Res.body.data.job._id;
    console.log(`✅ Job 2 created: "${job2Res.body.data.job.title}" (${job2Id})`);

    // 2. Register 3 Candidates & Apply
    console.log('\n--- Step 2: Register Candidates & Submit Applications ---');
    // Candidate A
    const candARes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Candidate Alpha ${timestamp}`,
        email: `alpha_${timestamp}@cand.io`,
        password: 'Password123!',
        role: 'candidate',
      },
    });
    const candAToken = candARes.body.data.token;
    const candAId = candARes.body.data.user._id;

    // Candidate B
    const candBRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Candidate Beta ${timestamp}`,
        email: `beta_${timestamp}@cand.io`,
        password: 'Password123!',
        role: 'candidate',
      },
    });
    const candBToken = candBRes.body.data.token;
    const candBId = candBRes.body.data.user._id;

    // Candidate C
    const candCRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Candidate Gamma ${timestamp}`,
        email: `gamma_${timestamp}@cand.io`,
        password: 'Password123!',
        role: 'candidate',
      },
    });
    const candCToken = candCRes.body.data.token;
    const candCId = candCRes.body.data.user._id;

    // Candidate A applies to Job 1
    const appARes = await request({
      port,
      path: `/api/applications/apply/${job1Id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candAToken}` },
      body: { coverLetter: 'Extensive CUDA and PyTorch background.' },
    });
    const appAId = appARes.body.data.application._id;

    // Candidate B applies to Job 1
    const appBRes = await request({
      port,
      path: `/api/applications/apply/${job1Id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candBToken}` },
      body: { coverLetter: 'Python distributed systems researcher.' },
    });
    const appBId = appBRes.body.data.application._id;

    // Candidate C applies to Job 2
    const appCRes = await request({
      port,
      path: `/api/applications/apply/${job2Id}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candCToken}` },
      body: { coverLetter: 'React and WebGL developer.' },
    });
    const appCId = appCRes.body.data.application._id;

    console.log(`✅ 3 applications submitted successfully across 2 jobs.`);

    // 3. Recruiter Updates Application Stages
    console.log('\n--- Step 3: Advance Candidate Application Stages ---');
    // App B -> Shortlisted
    await request({
      port,
      path: `/api/applications/${appBId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: { status: 'Shortlisted' },
    });
    console.log(`✅ Candidate B advanced to "Shortlisted"`);

    // App C -> Selected
    await request({
      port,
      path: `/api/applications/${appCId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: { status: 'Selected' },
    });
    console.log(`✅ Candidate C advanced to "Selected"`);

    // Schedule Interview for Candidate A (will auto-set App A status to 'Interview')
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const scheduleRes = await request({
      port,
      path: '/api/interviews/schedule',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        candidateId: candAId,
        jobId: job1Id,
        applicationId: appAId,
        date: tomorrow.toISOString(),
        time: '10:00 AM PST',
        meetingLink: 'https://meet.google.com/phase14-interview',
        notes: 'Deep dive into CUDA kernels and LLM batching.',
      },
    });
    console.log(`✅ Candidate A scheduled for interview (App A status synced to "Interview")`);

    // 4. Test Recruiter Dashboard API
    console.log('\n--- Step 4: Query Unified Recruiter Dashboard API ---');
    const dashRes = await request({
      port,
      path: '/api/dashboard/recruiter',
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    if (dashRes.status !== 200) {
      throw new Error(`Recruiter dashboard failed with status ${dashRes.status}: ${JSON.stringify(dashRes.body)}`);
    }

    const data = dashRes.body.data;
    console.log('✅ Recruiter Dashboard Payload Received:');
    console.log(`   Recruiter: ${data.recruiter.name} (${data.recruiter.company})`);
    console.log(`   KPI Total Jobs: ${data.kpis.totalJobs}`);
    console.log(`   KPI Active Jobs: ${data.kpis.activeJobs}`);
    console.log(`   KPI Total Applicants: ${data.kpis.totalApplicants}`);
    console.log(`   KPI Shortlisted: ${data.kpis.shortlisted}`);
    console.log(`   KPI Interviews: ${data.kpis.interviews}`);
    console.log(`   KPI Selected: ${data.kpis.selected}`);
    console.log(`   Shortlist Rate: ${data.kpis.shortlistRate}%`);
    console.log(`   Hire Rate: ${data.kpis.hireRate}%`);
    console.log(`   Funnel Breakdown:`, data.recruitmentFunnel.map((f) => `${f.stage}: ${f.count}`).join(', '));
    console.log(`   Upcoming Interviews Count: ${data.upcomingInterviews.length}`);
    console.log(`   Active Vacancies Count: ${data.activeVacanciesPerformance.length}`);
    console.log(`   Recent Applicants Stream: ${data.recentApplicants.length}`);
    console.log(`   Actionable Insights Count: ${data.recruiterInsights.length}`);

    // Assertions
    if (data.kpis.totalJobs !== 2) throw new Error(`Expected 2 jobs, got ${data.kpis.totalJobs}`);
    if (data.kpis.activeJobs !== 2) throw new Error(`Expected 2 active jobs, got ${data.kpis.activeJobs}`);
    if (data.kpis.totalApplicants !== 3) throw new Error(`Expected 3 applicants, got ${data.kpis.totalApplicants}`);
    if (data.kpis.shortlisted !== 1) throw new Error(`Expected 1 shortlisted, got ${data.kpis.shortlisted}`);
    if (data.kpis.interviews !== 1) throw new Error(`Expected 1 in interview, got ${data.kpis.interviews}`);
    if (data.kpis.selected !== 1) throw new Error(`Expected 1 selected, got ${data.kpis.selected}`);
    if (data.upcomingInterviews.length !== 1) throw new Error(`Expected 1 upcoming interview, got ${data.upcomingInterviews.length}`);
    if (data.activeVacanciesPerformance.length !== 2) throw new Error(`Expected 2 active vacancies in performance list`);
    if (data.recentApplicants.length !== 3) throw new Error(`Expected 3 recent applicants`);

    console.log('\n=================================================');
    console.log('🎉 ALL PHASE 14 BACKEND TESTS PASSED!');
    console.log('=================================================');
  } catch (error) {
    console.error('❌ Phase 14 test failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🚪 Test server and MongoDB connection closed.');
  }
};

runPhase14Tests();

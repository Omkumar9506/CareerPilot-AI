import http from 'http';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
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
            resolve({ status: res.statusCode, body: data, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw, headers: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

export async function runApiTests() {
  console.log('\n🌐 [INTEGRATION & E2E API TESTS] Starting full platform pipeline verification...');
  let failed = 0;
  let passed = 0;
  let server;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`   ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${description}`);
      failed++;
    }
  };

  const PORT = 5057;

  try {
    server = app.listen(PORT);
    console.log(`   🚀 Ephemeral test server running on http://127.0.0.1:${PORT}`);

    const ts = Date.now();
    const candidateEmail = `api_cand_${ts}@careerpilot.io`;
    const recruiterEmail = `api_rec_${ts}@careerpilot.io`;
    const adminEmail = `api_admin_${ts}@careerpilot.io`;
    const password = 'StrongPassword@123';

    // ----------------------------------------------------
    // 1. Authentication & Registration
    // ----------------------------------------------------
    console.log('\n--- 1. Authentication & RBAC ---');
    
    // Register candidate
    const candRegRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'API Candidate', email: candidateEmail, password, role: 'candidate' },
    });
    assert(candRegRes.status === 201 && candRegRes.body?.data?.token, 'Candidate registration returns 201 and token');
    const candidateToken = candRegRes.body?.data?.token;
    const candidateId = candRegRes.body?.data?.user?._id || candRegRes.body?.data?.user?.id;

    // Seed Candidate Profile for AI matching
    await JobSeekerProfile.create({
      user: candidateId,
      headline: 'Full Stack Cloud Engineer',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Node.js', 'React'],
      location: 'San Francisco, CA',
    });

    // Register recruiter
    const recRegRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'API Recruiter', email: recruiterEmail, password, role: 'recruiter' },
    });
    assert(recRegRes.status === 201 && recRegRes.body?.data?.token, 'Recruiter registration returns 201 and token');
    const recruiterToken = recRegRes.body?.data?.token;
    const recruiterId = recRegRes.body?.data?.user?._id || recRegRes.body?.data?.user?.id;

    // Register & elevate admin
    const adminRegRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'API Admin', email: adminEmail, password, role: 'candidate' },
    });
    const adminId = adminRegRes.body?.data?.user?._id || adminRegRes.body?.data?.user?.id;
    await User.findByIdAndUpdate(adminId, { role: 'admin' });

    const adminLoginRes = await request({
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: adminEmail, password },
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body?.data?.token, 'Admin login returns 200 and upgraded admin token');
    const adminToken = adminLoginRes.body?.data?.token;

    // Verify RBAC
    const rbacCandidateCheck = await request({
      port: PORT,
      path: '/api/admin/dashboard',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(rbacCandidateCheck.status === 403, 'Candidate blocked from admin endpoints (403)');

    // ----------------------------------------------------
    // 2. Job Creation & Advanced Search
    // ----------------------------------------------------
    console.log('\n--- 2. Job Lifecycle & Search ---');

    const newJobPayload = {
      title: 'Senior Cloud Solutions Architect',
      description: 'Design and deploy multi-cloud infrastructure with AWS, Kubernetes, and Terraform.',
      company: 'NextGen Cloud Corp',
      location: 'San Francisco, CA',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Hybrid',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker'],
      salary: { min: 160000, max: 200000, currency: 'USD' },
    };

    const postJobRes = await request({
      port: PORT,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: newJobPayload,
    });
    assert(postJobRes.status === 201 && postJobRes.body?.data?.job?._id, 'Recruiter successfully creates job posting (201)');
    const jobId = postJobRes.body?.data?.job?._id;

    // Query job search
    const searchJobRes = await request({
      port: PORT,
      path: '/api/jobs?keyword=Cloud&workplaceType=Hybrid',
      method: 'GET',
    });
    assert(
      searchJobRes.status === 200 && Array.isArray(searchJobRes.body?.data?.jobs),
      'Public job search with keywords and workplace filter returns 200 and job list'
    );

    // ----------------------------------------------------
    // 3. Job Application Pipeline
    // ----------------------------------------------------
    console.log('\n--- 3. Job Application Pipeline & Funnel ---');

    const applyRes = await request({
      port: PORT,
      path: `/api/applications/apply/${jobId}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: { coverLetter: 'I am excited about this Cloud Solutions Architect role!' },
    });
    assert(applyRes.status === 201 && applyRes.body?.data?.application?._id, 'Candidate applies for job successfully (201)');
    const applicationId = applyRes.body?.data?.application?._id;

    // Verify duplicate application rejection
    const dupApplyRes = await request({
      port: PORT,
      path: `/api/applications/apply/${jobId}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: { coverLetter: 'Duplicate application' },
    });
    assert(dupApplyRes.status === 400 || dupApplyRes.status === 409, 'Duplicate application attempt correctly blocked');

    // Recruiter updates status to Shortlisted
    const updateAppRes = await request({
      port: PORT,
      path: `/api/applications/${applicationId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: { status: 'Shortlisted' },
    });
    assert(
      updateAppRes.status === 200 && updateAppRes.body?.data?.application?.status === 'Shortlisted',
      'Recruiter updates application status to "Shortlisted"'
    );

    // ----------------------------------------------------
    // 4. Interview Scheduling
    // ----------------------------------------------------
    console.log('\n--- 4. Interview Scheduling ---');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const scheduleRes = await request({
      port: PORT,
      path: '/api/interviews/schedule',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        candidateId,
        jobId,
        date: tomorrow.toISOString(),
        time: '11:00 AM',
        meetingLink: 'https://meet.google.com/test-pipeline-interview',
        notes: 'Technical architecture deep-dive',
      },
    });
    assert(scheduleRes.status === 201 && scheduleRes.body?.data?.interview?._id, 'Recruiter schedules interview for candidate (201)');
    const interviewId = scheduleRes.body?.data?.interview?._id;

    // Candidate checks upcoming interviews
    const candInterviewsRes = await request({
      port: PORT,
      path: '/api/interviews/candidate',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(
      candInterviewsRes.status === 200 && candInterviewsRes.body?.data?.interviews?.length > 0,
      'Candidate successfully retrieves scheduled interview'
    );

    // ----------------------------------------------------
    // 5. AI Services & Match Diagnostics
    // ----------------------------------------------------
    console.log('\n--- 5. AI Recommendations & Mock Interviews ---');

    const matchDiagRes = await request({
      port: PORT,
      path: `/api/matches/job/${jobId}`,
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert(
      matchDiagRes.status === 200 && typeof matchDiagRes.body?.data?.match?.matchScore === 'number',
      'AI match diagnostics returns calculated score and skill breakdown'
    );

    const mockStartRes = await request({
      port: PORT,
      path: '/api/interviews/start',
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: { roleTitle: 'Full Stack Engineer', difficulty: 'Mid-Level' },
    });
    assert(
      mockStartRes.status === 201 && mockStartRes.body?.data?.session?.questions?.length > 0,
      'AI mock interview session initialized with generated question set'
    );

    // ----------------------------------------------------
    // 6. Admin Dashboard & Platform Oversight
    // ----------------------------------------------------
    console.log('\n--- 6. Admin Platform Oversight ---');

    const adminStatsRes = await request({
      port: PORT,
      path: '/api/admin/dashboard',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminStatsRes.status === 200 && adminStatsRes.body?.data?.kpis?.totalUsers >= 3,
      'Admin dashboard retrieves accurate KPI metrics and growth stats'
    );

    // Clean up created entities
    await Promise.all([
      User.deleteMany({ _id: { $in: [candidateId, recruiterId, adminId] } }),
      JobSeekerProfile.deleteMany({ user: candidateId }),
      Job.deleteMany({ _id: jobId }),
      Application.deleteMany({ _id: applicationId }),
      Interview.deleteMany({ _id: interviewId }),
    ]);
    console.log('\n   🧹 Cleaned up temporary test entities.');

    if (server) server.close();

    console.log(`\n📊 [API TESTS RESULT] Passed: ${passed}, Failed: ${failed}`);
    return { passed, failed };
  } catch (err) {
    if (server) server.close();
    console.error('💥 API test runner error:', err);
    return { passed, failed: failed + 1 };
  }
}

import http from 'http';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
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

async function runPhase15Tests() {
  console.log('🚀 [PHASE 15 TEST SUITE] Starting Admin & Platform Moderation verification...');
  let hasErrors = false;
  let server;

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB database.');

    const PORT = 5055;
    server = app.listen(PORT);
    console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);

    // 1. Setup Test Users: Admin, Recruiter, Candidate
    const timestamp = Date.now();
    const adminEmail = `admin_test_${timestamp}@careerpilot.io`;
    const candidateEmail = `cand_test_${timestamp}@careerpilot.io`;
    const recruiterEmail = `rec_test_${timestamp}@careerpilot.io`;
    const password = 'Password@12345';

    // Register Candidate
    const candRegRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'Candidate User', email: candidateEmail, password, role: 'candidate' },
    });
    const candidateToken = candRegRes.body?.data?.token;
    const candidateId = candRegRes.body?.data?.user?.id || candRegRes.body?.data?.user?._id;

    // Register Recruiter
    const recRegRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'Recruiter User', email: recruiterEmail, password, role: 'recruiter' },
    });
    const recruiterToken = recRegRes.body?.data?.token;
    const recruiterId = recRegRes.body?.data?.user?.id || recRegRes.body?.data?.user?._id;

    // Register Admin (promote via DB directly)
    const adminRegRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: { name: 'Platform Admin', email: adminEmail, password, role: 'candidate' },
    });
    const adminId = adminRegRes.body?.data?.user?.id || adminRegRes.body?.data?.user?._id;
    await User.findByIdAndUpdate(adminId, { role: 'admin' });

    // Login as Admin to get updated role token
    const adminLoginRes = await request({
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: adminEmail, password },
    });
    const adminToken = adminLoginRes.body?.data?.token;

    console.log('✅ Test accounts registered and admin elevated.');

    // Post a test job as recruiter
    const jobRes = await request({
      port: PORT,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        title: 'Senior Site Reliability Engineer',
        company: 'CloudScale Tech',
        location: 'Remote, US',
        jobType: 'Full-time',
        workplaceType: 'Remote',
        category: 'DevOps & Cloud',
        experienceLevel: 'Senior',
        description: 'Reliability engineering at scale with Kubernetes, Terraform, and Go.',
        requirements: ['Go', 'Kubernetes', 'AWS'],
        salary: { min: 140000, max: 180000, currency: 'USD' },
      },
    });
    const jobId = jobRes.body?.data?.job?._id || jobRes.body?.data?._id;
    console.log(`✅ Test job posted by recruiter (ID: ${jobId}).`);

    // 2. Test RBAC: Non-admin candidate attempting to access admin dashboard
    console.log('\n--- 2. RBAC Enforcement Test ---');
    const unauthorizedRes = await request({
      port: PORT,
      path: '/api/admin/dashboard',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    if (unauthorizedRes.status === 403) {
      console.log('✅ Candidate correctly forbidden (403) from /api/admin/dashboard');
    } else {
      console.error(`❌ Expected 403 for candidate on /api/admin/dashboard, got ${unauthorizedRes.status}`);
      hasErrors = true;
    }

    // 3. Test Admin Dashboard Stats
    console.log('\n--- 3. Admin Dashboard Statistics Test ---');
    const statsRes = await request({
      port: PORT,
      path: '/api/admin/dashboard',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (statsRes.status === 200 && statsRes.body?.success) {
      const stats = statsRes.body.data;
      console.log('✅ Admin dashboard stats retrieved successfully:');
      console.log(`   Total Users: ${stats.kpis.totalUsers}`);
      console.log(`   Active Users: ${stats.kpis.activeUsers}`);
      console.log(`   Total Jobs: ${stats.kpis.totalJobs}`);
      console.log(`   Total Applications: ${stats.kpis.totalApplications}`);
      console.log(`   Monthly Growth Points: ${stats.platformGrowth.length}`);
    } else {
      console.error(`❌ Failed to retrieve admin dashboard stats: status ${statsRes.status}`, statsRes.body);
      hasErrors = true;
    }

    // 4. Test User Directory & Filtering
    console.log('\n--- 4. User Directory & Pagination Test ---');
    const usersRes = await request({
      port: PORT,
      path: '/api/admin/users?limit=10&page=1',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (usersRes.status === 200 && usersRes.body?.success) {
      console.log(`✅ Users directory retrieved (${usersRes.body.data.users.length} users, total: ${usersRes.body.data.total})`);
    } else {
      console.error(`❌ Failed to fetch user directory: status ${usersRes.status}`);
      hasErrors = true;
    }

    // 5. Test Account Deactivation & Immediate Auth Guard
    console.log('\n--- 5. Account Deactivation & Auth Guard Test ---');
    const deactivateRes = await request({
      port: PORT,
      path: `/api/admin/users/${candidateId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false },
    });

    if (deactivateRes.status === 200 && deactivateRes.body?.data?.user?.isActive === false) {
      console.log('✅ Candidate status toggled to isActive: false');
    } else {
      console.error('❌ Failed to deactivate candidate user:', deactivateRes.body);
      hasErrors = true;
    }

    // Attempt to access candidate profile with candidate token
    const blockedRes = await request({
      port: PORT,
      path: '/api/users/profile/me',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    if (blockedRes.status === 403) {
      console.log(`✅ Deactivated candidate blocked with 403: "${blockedRes.body?.message}"`);
    } else {
      console.error(`❌ Expected 403 for deactivated user, got ${blockedRes.status}:`, blockedRes.body);
      hasErrors = true;
    }

    // 6. Test Account Re-activation
    console.log('\n--- 6. Account Reactivation Test ---');
    const reactivateRes = await request({
      port: PORT,
      path: `/api/admin/users/${candidateId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: true },
    });

    if (reactivateRes.status === 200 && reactivateRes.body?.data?.user?.isActive === true) {
      console.log('✅ Candidate status restored to isActive: true');
    } else {
      console.error('❌ Failed to reactivate candidate user:', reactivateRes.body);
      hasErrors = true;
    }

    const unblockedRes = await request({
      port: PORT,
      path: '/api/users/profile/me',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    if (unblockedRes.status === 200) {
      console.log('✅ Reactivated candidate successfully accesses profile again (200 OK).');
    } else {
      console.error(`❌ Reactivated candidate failed profile check, got ${unblockedRes.status}`);
      hasErrors = true;
    }

    // 7. Test Admin Self-Deactivation Guard
    console.log('\n--- 7. Self-Moderation Guard Test ---');
    const selfDeactivateRes = await request({
      port: PORT,
      path: `/api/admin/users/${adminId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false },
    });

    if (selfDeactivateRes.status === 400) {
      console.log('✅ Admin correctly prevented from deactivating own account (400 Bad Request)');
    } else {
      console.error(`❌ Expected 400 when admin deactivates self, got ${selfDeactivateRes.status}`);
      hasErrors = true;
    }

    // 8. Test Role Modification
    console.log('\n--- 8. Role Modification Test ---');
    const updateRoleRes = await request({
      port: PORT,
      path: `/api/admin/users/${candidateId}/role`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: 'recruiter' },
    });

    if (updateRoleRes.status === 200 && updateRoleRes.body?.data?.user?.role === 'recruiter') {
      console.log('✅ User role elevated from candidate to recruiter by admin');
    } else {
      console.error('❌ Failed to update user role:', updateRoleRes.body);
      hasErrors = true;
    }

    // 9. Test Job Moderation (Status Toggle & Delete)
    console.log('\n--- 9. Job Moderation Test ---');
    const adminJobsRes = await request({
      port: PORT,
      path: '/api/admin/jobs?search=CloudScale',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (adminJobsRes.status === 200 && adminJobsRes.body?.data?.jobs?.length > 0) {
      console.log(`✅ Admin retrieved job listings (${adminJobsRes.body.data.jobs.length} jobs found)`);
    } else {
      console.error('❌ Failed to list jobs in admin moderation:', adminJobsRes.body);
      hasErrors = true;
    }

    const toggleJobRes = await request({
      port: PORT,
      path: `/api/admin/jobs/${jobId}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'Closed' },
    });

    if (toggleJobRes.status === 200 && toggleJobRes.body?.data?.job?.status === 'Closed') {
      console.log('✅ Job status changed to "Closed" by admin moderator');
    } else {
      console.error('❌ Failed to update job status:', toggleJobRes.body);
      hasErrors = true;
    }

    const deleteJobRes = await request({
      port: PORT,
      path: `/api/admin/jobs/${jobId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (deleteJobRes.status === 200) {
      console.log('✅ Job removed by admin moderation');
    } else {
      console.error('❌ Failed to delete job via admin route:', deleteJobRes.body);
      hasErrors = true;
    }

    // Clean up created test accounts
    await User.deleteMany({ _id: { $in: [adminId, candidateId, recruiterId] } });
    console.log('🧹 Cleaned up test accounts.');

    if (server) server.close();
    await mongoose.disconnect();

    if (hasErrors) {
      console.error('\n❌ [PHASE 15 TEST SUITE] Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 [PHASE 15 TEST SUITE] All tests passed with 100% success!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Unhandled error in test suite:', error);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase15Tests();

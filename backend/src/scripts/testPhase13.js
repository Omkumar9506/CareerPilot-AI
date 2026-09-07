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

const runPhase13Tests = async () => {
  console.log('=================================================');
  console.log('🚀 RUNNING PHASE 13: CANDIDATE DASHBOARD & SAVED JOBS');
  console.log('=================================================');

  await mongoose.connect(env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`✅ Test server listening on ephemeral port ${port}`);

  const timestamp = Date.now();

  try {
    // 1. Register Recruiter & Post Vacancies
    console.log('\n--- Step 1: Register Recruiter & Post Jobs ---');
    const recruiterRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Recruiter Pro ${timestamp}`,
        email: `recruiter_${timestamp}@pulseflow.io`,
        password: 'Password123!',
        role: 'recruiter',
        company: 'PulseFlow Inc',
      },
    });
    const recruiterToken = recruiterRes.body.data.token;
    const recruiterId = recruiterRes.body.data.user._id;

    // Post Job A
    const jobARes = await request({
      port,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        title: 'Full Stack Tech Lead',
        description: 'Build enterprise React, Node.js, and MongoDB microservices.',
        company: 'PulseFlow Inc',
        location: 'New York, NY',
        workplaceType: 'Remote',
        jobType: 'Full-time',
        experienceLevel: 'Lead',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        salary: { min: 160000, max: 200000, currency: 'USD' },
      },
    });
    const jobAId = jobARes.body.data.job._id;
    console.log(`✅ Job A posted: "${jobARes.body.data.job.title}" (${jobAId})`);

    // Post Job B
    const jobBRes = await request({
      port,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        title: 'Cloud DevOps Architect',
        description: 'Manage AWS EKS Kubernetes clusters and Terraform.',
        company: 'PulseFlow Inc',
        location: 'Remote',
        workplaceType: 'Remote',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        skillsRequired: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
        salary: { min: 170000, max: 210000, currency: 'USD' },
      },
    });
    const jobBId = jobBRes.body.data.job._id;
    console.log(`✅ Job B posted: "${jobBRes.body.data.job.title}" (${jobBId})`);

    // 2. Register Candidate & Populate Profile
    console.log('\n--- Step 2: Register Candidate & Setup Profile ---');
    const candRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Alex Rivera ${timestamp}`,
        email: `alex_${timestamp}@talent.io`,
        password: 'Password123!',
        role: 'candidate',
      },
    });
    const candToken = candRes.body.data.token;
    const candId = candRes.body.data.user._id;

    // Update Profile
    await request({
      port,
      path: '/api/users/profile/candidate',
      method: 'PUT',
      headers: { Authorization: `Bearer ${candToken}` },
      body: {
        headline: 'Senior Full Stack Engineer',
        bio: 'Passionate full stack developer with 6 years experience building modern scalable web applications.',
        location: 'New York, NY',
        phone: '+1-555-0199',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        experience: [
          {
            company: 'TechCorp',
            position: 'Full Stack Engineer',
            location: 'New York',
            startDate: '2020-01-01',
            current: true,
            description: 'Built high volume React and Node APIs.',
          },
        ],
        education: [
          {
            institution: 'NYU',
            degree: 'BS Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2015-09-01',
            endDate: '2019-05-30',
          },
        ],
      },
    });
    console.log(`✅ Candidate registered & profile updated with skills & history.`);

    // 3. Test Saved Jobs (Bookmarking)
    console.log('\n--- Step 3: Test Saved Jobs (Bookmark / Unbookmark) ---');
    // Save Job A
    const saveRes1 = await request({
      port,
      path: `/api/jobs/${jobAId}/save`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candToken}` },
    });
    console.log(`✅ Job A bookmarked: isSaved=${saveRes1.body.data.isSaved}`);

    // Query saved jobs
    const getSavedRes = await request({
      port,
      path: '/api/jobs/saved',
      method: 'GET',
      headers: { Authorization: `Bearer ${candToken}` },
    });
    console.log(`✅ Saved jobs count: ${getSavedRes.body.data.count}`);
    if (getSavedRes.body.data.count !== 1) {
      throw new Error(`Expected 1 saved job, got ${getSavedRes.body.data.count}`);
    }

    // Query saved IDs
    const getIdsRes = await request({
      port,
      path: '/api/jobs/saved/ids',
      method: 'GET',
      headers: { Authorization: `Bearer ${candToken}` },
    });
    console.log(`✅ Saved job IDs:`, getIdsRes.body.data.savedJobIds);
    if (!getIdsRes.body.data.savedJobIds.includes(jobAId.toString())) {
      throw new Error('Saved job IDs array does not contain Job A');
    }

    // Toggle unbookmark and re-bookmark
    const unsaveRes = await request({
      port,
      path: `/api/jobs/${jobAId}/save`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candToken}` },
    });
    console.log(`✅ Job A unbookmarked: isSaved=${unsaveRes.body.data.isSaved}`);

    await request({
      port,
      path: `/api/jobs/${jobAId}/save`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candToken}` },
    });
    console.log(`✅ Job A re-bookmarked for dashboard testing.`);

    // 4. Candidate Applies for Job A
    console.log('\n--- Step 4: Candidate Applies & Recruiter Schedules Interview ---');
    const applyRes = await request({
      port,
      path: `/api/applications/apply/${jobAId}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candToken}` },
      body: {
        coverLetter: 'Excited about the Full Stack Tech Lead vacancy!',
        resume: 'https://cloudinary.mock.com/resumes/alex_resume.pdf',
      },
    });
    const applicationId = applyRes.body.data.application._id;
    console.log(`✅ Application submitted (ID: ${applicationId})`);

    // Recruiter schedules interview
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const scheduleRes = await request({
      port,
      path: '/api/interviews/schedule',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        candidateId: candId,
        jobId: jobAId,
        applicationId,
        date: tomorrow.toISOString(),
        time: '02:00 PM EST',
        meetingLink: 'https://meet.google.com/xyz-dash-test',
        notes: 'Technical panel discussion on React architecture and Node services.',
      },
    });
    console.log(`✅ Interview scheduled. Status: ${scheduleRes.body.data.interview.status}`);

    // 5. Test Unified Candidate Dashboard API
    console.log('\n--- Step 5: Test Unified Candidate Dashboard API ---');
    const dashRes = await request({
      port,
      path: '/api/dashboard/candidate',
      method: 'GET',
      headers: { Authorization: `Bearer ${candToken}` },
    });

    if (dashRes.status !== 200) {
      throw new Error(`Candidate dashboard returned status ${dashRes.status}: ${JSON.stringify(dashRes.body)}`);
    }

    const dashData = dashRes.body.data;
    console.log('✅ Candidate Dashboard Data Loaded:');
    console.log(`   Profile Completion Score: ${dashData.profileCompletion.score}%`);
    console.log(`   Missing Profile Items: ${dashData.profileCompletion.missingItems.length}`);
    console.log(`   Total Applications: ${dashData.appStats.total}`);
    console.log(`   Applications in Interview Stage: ${dashData.appStats.interview}`);
    console.log(`   Pipeline Stages Breakdown:`, dashData.pipelineFunnel.map((p) => `${p.stage}: ${p.count}`).join(', '));
    console.log(`   Saved Jobs Count: ${dashData.savedJobsCount}`);
    console.log(`   Upcoming Interviews Count: ${dashData.upcomingInterviews.length}`);
    console.log(`   Generated AI Insights Count: ${dashData.aiInsights.length}`);
    console.log(`   Top AI Insight: "${dashData.aiInsights[0]?.title}"`);
    console.log(`   Recommended Jobs Count: ${dashData.recommendedJobs.length}`);

    // Assertions
    if (dashData.profileCompletion.score <= 0) {
      throw new Error('Profile completion score must be greater than 0');
    }
    if (dashData.appStats.interview !== 1) {
      throw new Error(`Expected 1 application in Interview stage, got ${dashData.appStats.interview}`);
    }
    if (dashData.savedJobsCount !== 1) {
      throw new Error(`Expected 1 saved job, got ${dashData.savedJobsCount}`);
    }
    if (dashData.upcomingInterviews.length !== 1) {
      throw new Error(`Expected 1 upcoming interview, got ${dashData.upcomingInterviews.length}`);
    }
    if (dashData.aiInsights.length === 0) {
      throw new Error('Expected at least 1 AI career insight generated');
    }

    console.log('\n=================================================');
    console.log('🎉 ALL PHASE 13 BACKEND TESTS PASSED!');
    console.log('=================================================');
  } catch (error) {
    console.error('❌ Phase 13 test failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🚪 Test server and MongoDB connection closed.');
  }
};

runPhase13Tests();

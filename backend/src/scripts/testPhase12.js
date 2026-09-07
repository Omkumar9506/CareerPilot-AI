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

const runPhase12Tests = async () => {
  console.log('=================================================');
  console.log('🚀 RUNNING PHASE 12: INTERVIEW SCHEDULING & EMAIL');
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
    console.log('\n--- Step 1: Register Recruiter & Post Vacancy ---');
    const recruiterRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Recruiter Boss ${timestamp}`,
        email: `recruiter_${timestamp}@hiretech.io`,
        password: 'Password123!',
        role: 'recruiter',
        company: 'Starlight Dynamics',
      },
    });
    const recruiterToken = recruiterRes.body.data.token;
    console.log(`✅ Recruiter registered: ${recruiterRes.body.data.user.email}`);

    // Create Job
    const jobRes = await request({
      port,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        title: 'Senior Distributed Systems Architect',
        description: 'Design massive real-time cloud architectures with Node, Go, and Kafka.',
        company: 'Starlight Dynamics',
        location: 'San Francisco, CA',
        workplaceType: 'Hybrid',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        skillsRequired: ['Node.js', 'Go', 'Distributed Systems', 'Kafka'],
        salary: { min: 180000, max: 230000, currency: 'USD' },
      },
    });
    const jobId = jobRes.body.data.job._id;
    console.log(`✅ Vacancy posted: "${jobRes.body.data.job.title}" (ID: ${jobId})`);

    // 2. Register Candidate
    console.log('\n--- Step 2: Register Candidate & Submit Application ---');
    const candidateRes = await request({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: `Jordan Engineer ${timestamp}`,
        email: `jordan_${timestamp}@candidate.io`,
        password: 'Password123!',
        role: 'candidate',
      },
    });
    const candidateToken = candidateRes.body.data.token;
    const candidateId = candidateRes.body.data.user._id;
    console.log(`✅ Candidate registered: ${candidateRes.body.data.user.email} (ID: ${candidateId})`);

    // Candidate applies for job
    const applyRes = await request({
      port,
      path: `/api/applications/apply/${jobId}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: {
        coverLetter: 'Excited to bring 8 years of distributed systems engineering to Starlight Dynamics.',
        resume: 'https://cloudinary.mock.com/resumes/jordan_resume.pdf',
      },
    });
    const applicationId = applyRes.body.data.application._id;
    console.log(`✅ Candidate applied for vacancy (Application ID: ${applicationId}, Initial Status: ${applyRes.body.data.application.status})`);

    // 3. Recruiter schedules interview
    console.log('\n--- Step 3: Recruiter Schedules Interview & Sends Email ---');
    const interviewDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const scheduleRes = await request({
      port,
      path: '/api/interviews/schedule',
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        candidateId,
        jobId,
        applicationId,
        date: interviewDate.toISOString(),
        time: '11:00 AM PST',
        meetingLink: 'https://meet.google.com/pqr-stuv-wxy',
        notes: 'Round 1 Architecture Deep Dive. Prepare to discuss high-throughput message streaming.',
      },
    });

    if (scheduleRes.status !== 201) {
      throw new Error(`Failed to schedule interview: ${JSON.stringify(scheduleRes.body)}`);
    }

    const scheduledInterview = scheduleRes.body.data.interview;
    const interviewId = scheduledInterview._id;
    console.log(`✅ Interview scheduled successfully (ID: ${interviewId})`);
    console.log(`   Candidate: ${scheduledInterview.candidate.name} (${scheduledInterview.candidate.email})`);
    console.log(`   Date & Time: ${new Date(scheduledInterview.date).toLocaleDateString()} at ${scheduledInterview.time}`);
    console.log(`   Meeting Link: ${scheduledInterview.meetingLink}`);
    console.log(`   Email Dispatch Status: ${JSON.stringify(scheduleRes.body.data.emailStatus)}`);

    // 4. Verify Application status auto-updated to 'Interview'
    console.log('\n--- Step 4: Verify Application Synchronization ---');
    const verifyAppRes = await request({
      port,
      path: `/api/applications/check/${jobId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const currentStatus = verifyAppRes.body.data.application?.status;
    console.log(`✅ Application status verified: "${currentStatus}" (Expected: "Interview")`);
    if (currentStatus !== 'Interview') {
      throw new Error(`Application status should have transitioned to Interview, got: ${currentStatus}`);
    }

    // 5. Candidate queries scheduled interviews
    console.log('\n--- Step 5: Candidate Queries Scheduled Interviews ---');
    const candidateInterviewsRes = await request({
      port,
      path: '/api/interviews/candidate?timeframe=upcoming',
      method: 'GET',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    console.log(`✅ Candidate upcoming interviews count: ${candidateInterviewsRes.body.data.count}`);
    console.log(`   Stats: ${JSON.stringify(candidateInterviewsRes.body.data.stats)}`);
    const candInterview = candidateInterviewsRes.body.data.interviews[0];
    console.log(`   First Interview Vacancy: "${candInterview.job.title}" with Recruiter "${candInterview.recruiter.name}"`);

    // 6. Recruiter queries scheduled interviews
    console.log('\n--- Step 6: Recruiter Queries Scheduled Interviews ---');
    const recruiterInterviewsRes = await request({
      port,
      path: '/api/interviews/recruiter',
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    console.log(`✅ Recruiter total scheduled interviews: ${recruiterInterviewsRes.body.data.count}`);
    console.log(`   Recruiter Stats: ${JSON.stringify(recruiterInterviewsRes.body.data.stats)}`);

    // 7. Recruiter Reschedules Interview
    console.log('\n--- Step 7: Recruiter Reschedules Interview ---');
    const rescheduleRes = await request({
      port,
      path: `/api/interviews/scheduled/${interviewId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        status: 'Rescheduled',
        time: '03:30 PM PST',
        notes: 'Pushed back by 4.5 hours per interviewer schedule change.',
      },
    });
    console.log(`✅ Interview rescheduled. New Status: ${rescheduleRes.body.data.interview.status}, Time: ${rescheduleRes.body.data.interview.time}`);

    // 8. Recruiter Marks Interview as Completed
    console.log('\n--- Step 8: Recruiter Marks Interview as Completed ---');
    const completeRes = await request({
      port,
      path: `/api/interviews/scheduled/${interviewId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        status: 'Completed',
        notes: 'Candidate demonstrated outstanding system design fundamentals. Recommend for final panel.',
      },
    });
    console.log(`✅ Interview marked as: ${completeRes.body.data.interview.status}`);

    console.log('\n=================================================');
    console.log('🎉 ALL PHASE 12 BACKEND TESTS PASSED!');
    console.log('=================================================');
  } catch (error) {
    console.error('❌ Phase 12 test failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('🚪 Test server and MongoDB connection closed.');
  }
};

runPhase12Tests();

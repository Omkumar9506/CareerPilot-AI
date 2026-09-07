import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

async function request(baseUrl, path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.response = { data, status: res.status };
    throw error;
  }
  return data;
}

async function runPhase9Tests() {
  console.log('🚀 ===============================================');
  console.log('🧪 RUNNING PHASE 9: AI JOB MATCHING & RECOMMENDATIONS TEST SUITE');
  console.log('=================================================');

  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`🌐 Test server listening on ephemeral port ${port}`);

  const timestamp = Date.now();

  try {
    // ----------------------------------------------------
    // STEP 1: Register Recruiter and Post 2 Divergent Jobs
    // ----------------------------------------------------
    console.log('\n--- Step 1: Register Recruiter & Create Jobs ---');
    const recruiterAuth = await request(baseUrl, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Recruiter Matrix ${timestamp}`,
        email: `matrix_recruiter_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'recruiter',
        company: 'HyperScale AI',
      }),
    });
    const recruiterToken = recruiterAuth.data.token;
    console.log('✅ Recruiter registered successfully.');

    // Job A: Senior Full Stack Engineer (Remote, JS Stack)
    const jobARes = await request(baseUrl, '/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: JSON.stringify({
        title: 'Senior Full Stack Engineer',
        description: 'Lead engineering on our high-throughput React and Node.js microservices ecosystem.',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'TypeScript', 'REST'],
        experienceLevel: 'Senior',
        location: 'Remote, US',
        workplaceType: 'Remote',
        employmentType: 'Full-time',
        salary: { min: 140000, max: 180000 },
      }),
    });
    const jobA = jobARes.data.job;
    console.log(`✅ Job A created: "${jobA.title}" (ID: ${jobA._id})`);

    // Job B: Lead Cloud Infrastructure Architect (On-site, DevOps Stack)
    const jobBRes = await request(baseUrl, '/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: JSON.stringify({
        title: 'Lead Cloud Infrastructure Architect',
        description: 'Architect mission-critical multi-region Kubernetes clusters with Terraform and Go.',
        skills: ['Kubernetes', 'Terraform', 'Go', 'GCP', 'Ansible'],
        experienceLevel: 'Lead',
        location: 'Austin, TX',
        workplaceType: 'On-site',
        employmentType: 'Full-time',
        salary: { min: 175000, max: 220000 },
      }),
    });
    const jobB = jobBRes.data.job;
    console.log(`✅ Job B created: "${jobB.title}" (ID: ${jobB._id})`);

    // ----------------------------------------------------
    // STEP 2: Register Candidate 1 (Full Stack JS Focus)
    // ----------------------------------------------------
    console.log('\n--- Step 2: Register Candidate 1 (Full Stack JS Focus) ---');
    const cand1Auth = await request(baseUrl, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Devin Fullstack ${timestamp}`,
        email: `devin_fs_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'candidate',
      }),
    });
    const cand1Token = cand1Auth.data.token;

    // Update Profile with matching JS skills & 6 years experience
    await request(baseUrl, '/users/profile/candidate', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${cand1Token}` },
      body: JSON.stringify({
        headline: 'Senior Full Stack Developer | React & Node.js Architect',
        bio: 'Passionate full stack software engineer specializing in scalable React frontends and distributed Node.js REST services.',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'REST'],
        location: 'San Francisco, CA',
        experience: [
          {
            company: 'TechFlow Systems',
            position: 'Senior Software Engineer',
            startDate: '2019-01-01',
            current: true,
            description: 'Architecting scalable web applications and microservices.',
          },
        ],
      }),
    });
    console.log('✅ Candidate 1 profile updated with React/Node/MongoDB skills.');

    // ----------------------------------------------------
    // STEP 3: Register Candidate 2 (Cloud DevOps Focus)
    // ----------------------------------------------------
    console.log('\n--- Step 3: Register Candidate 2 (Cloud DevOps Focus) ---');
    const cand2Auth = await request(baseUrl, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Clara Cloud ${timestamp}`,
        email: `clara_devops_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'candidate',
      }),
    });
    const cand2Token = cand2Auth.data.token;

    await request(baseUrl, '/users/profile/candidate', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${cand2Token}` },
      body: JSON.stringify({
        headline: 'Lead Cloud Infrastructure & Platform Architect',
        bio: 'Architecting enterprise Kubernetes clusters, Terraform infrastructure, and automated cloud deployments.',
        skills: ['Kubernetes', 'Terraform', 'Go', 'GCP', 'Ansible', 'Docker'],
        location: 'Austin, TX',
        experience: [
          {
            company: 'CloudWorks Inc.',
            position: 'Lead Infrastructure Engineer',
            startDate: '2016-01-01',
            current: true,
            description: 'Managing enterprise cloud infrastructure and Kubernetes fleets.',
          },
        ],
      }),
    });
    console.log('✅ Candidate 2 profile updated with Kubernetes/Terraform/Go skills.');

    // ----------------------------------------------------
    // STEP 4: Candidate 1 Recommendations Feed (GET /api/matches/recommendations)
    // ----------------------------------------------------
    console.log('\n--- Step 4: Candidate 1 Recommendations Feed ---');
    const cand1Recs = await request(baseUrl, '/matches/recommendations', {
      method: 'GET',
      headers: { Authorization: `Bearer ${cand1Token}` },
    });

    const recommendations = cand1Recs.data.recommendations;
    console.log(`✅ Retrieved ${recommendations.length} recommended jobs for Candidate 1.`);
    
    // Validate that Job A (Full Stack) is ranked higher than Job B (Cloud DevOps)
    const recJobA = recommendations.find((j) => j._id === jobA._id);
    const recJobB = recommendations.find((j) => j._id === jobB._id);

    if (!recJobA) throw new Error('Job A was not found in recommendations');
    if (!recJobB) throw new Error('Job B was not found in recommendations');

    console.log(`   Job A Match Score: ${recJobA.match.matchScore}% (${recJobA.match.matchLevel})`);
    console.log(`   Job A Matched Skills:`, recJobA.match.matchedSkills);
    console.log(`   Job B Match Score: ${recJobB.match.matchScore}% (${recJobB.match.matchLevel})`);

    if (recJobA.match.matchScore <= recJobB.match.matchScore) {
      throw new Error(`Expected Job A score (${recJobA.match.matchScore}%) to exceed Job B score (${recJobB.match.matchScore}%)`);
    }
    if (recJobA.match.matchScore < 75) {
      throw new Error(`Expected Job A score to be >= 75%, got ${recJobA.match.matchScore}%`);
    }
    console.log('✅ Verified: Job A is correctly ranked first with high compatibility score!');

    // ----------------------------------------------------
    // STEP 5: Candidate 1 Single Job Match (GET /api/matches/job/:jobId)
    // ----------------------------------------------------
    console.log('\n--- Step 5: Candidate 1 Single Job Match Diagnostics ---');
    const singleMatch = await request(baseUrl, `/matches/job/${jobA._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${cand1Token}` },
    });

    const matchData = singleMatch.data.match;
    console.log('✅ Single Job Match Breakdown:');
    console.log(`   Overall Score: ${matchData.matchScore}%`);
    console.log(`   Skills Score: ${matchData.breakdown.skillsScore}%`);
    console.log(`   Experience Score: ${matchData.breakdown.experienceScore}%`);
    console.log(`   Location Score: ${matchData.breakdown.locationScore}%`);
    console.log(`   Role Score: ${matchData.breakdown.roleScore}%`);
    console.log(`   Matched Skills: ${matchData.matchedSkills.join(', ')}`);
    console.log(`   Missing Skills: ${matchData.missingSkills.join(', ')}`);
    console.log(`   Summary: "${matchData.summary}"`);

    if (!matchData.breakdown || !matchData.summary) {
      throw new Error('Missing match breakdown or summary');
    }

    // ----------------------------------------------------
    // STEP 6: Both Candidates Apply for Job A
    // ----------------------------------------------------
    console.log('\n--- Step 6: Both Candidates Apply for Job A ---');
    await request(baseUrl, `/applications/apply/${jobA._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cand1Token}` },
      body: JSON.stringify({
        resume: 'https://example.com/devin_resume.pdf',
        coverLetter: 'Excited to apply for the Senior Full Stack role!',
      }),
    });
    console.log('✅ Candidate 1 applied for Job A.');

    await request(baseUrl, `/applications/apply/${jobA._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cand2Token}` },
      body: JSON.stringify({
        resume: 'https://example.com/clara_resume.pdf',
        coverLetter: 'Applying with cloud architecture background.',
      }),
    });
    console.log('✅ Candidate 2 applied for Job A.');

    // ----------------------------------------------------
    // STEP 7: Recruiter Checks Applicants with AI Match Enrichment
    // ----------------------------------------------------
    console.log('\n--- Step 7: Recruiter Applicant Review with AI Match ---');
    const applicantsRes = await request(baseUrl, `/applications/job/${jobA._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    const applicants = applicantsRes.data.applicants;
    console.log(`✅ Retrieved ${applicants.length} applicants for Job A.`);

    const cand1App = applicants.find((a) => a.candidate.email.includes('devin_fs'));
    const cand2App = applicants.find((a) => a.candidate.email.includes('clara_devops'));

    if (!cand1App?.aiMatch || !cand2App?.aiMatch) {
      throw new Error('Application does not contain aiMatch data');
    }

    console.log(`   Candidate 1 Application AI Match: ${cand1App.aiMatch.score}% (${cand1App.aiMatch.level})`);
    console.log(`   Candidate 2 Application AI Match: ${cand2App.aiMatch.score}% (${cand2App.aiMatch.level})`);

    if (cand1App.aiMatch.score <= cand2App.aiMatch.score) {
      throw new Error('Expected Candidate 1 to have higher match for Full Stack role than Candidate 2');
    }
    console.log('✅ Verified: Applicant pipeline correctly enriched with AI candidate match scores!');

    // Test sorting by match
    const sortedAppsRes = await request(baseUrl, `/applications/recruiter?jobId=${jobA._id}&sortBy=match`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const sortedApps = sortedAppsRes.data.applications;
    if (sortedApps[0].candidate.email !== cand1App.candidate.email) {
      throw new Error('Expected Candidate 1 to be sorted first by match score');
    }
    console.log('✅ Verified: Recruiter pipeline successfully sorted by highest AI match!');

    // ----------------------------------------------------
    // STEP 8: Recruiter Top Candidates Recommendation
    // ----------------------------------------------------
    console.log('\n--- Step 8: Recruiter Top Platform Talent Discovery ---');
    const topCandidatesRes = await request(baseUrl, `/matches/recruiter/job/${jobA._id}/top-candidates`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    const topCandidates = topCandidatesRes.data.candidates;
    console.log(`✅ Recruiter discovered ${topCandidates.length} top candidates for Job A.`);
    console.log(`   #1 Candidate: ${topCandidates[0].candidate.name} with score ${topCandidates[0].match.matchScore}%`);

    if (topCandidates.length === 0) {
      throw new Error('Expected at least 1 top candidate');
    }

    console.log('\n🎉 ===============================================');
    console.log('🏆 ALL PHASE 9 BACKEND VERIFICATION TESTS PASSED!');
    console.log('=================================================\n');

    server.close();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('💥 Test failed with error:', err.response?.data || err.message);
    server.close();
    await disconnectDB();
    process.exit(1);
  }
}

runPhase9Tests();

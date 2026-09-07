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

async function runPhase11Tests() {
  console.log('🚀 ===============================================');
  console.log('🧪 RUNNING PHASE 11: SKILL GAP & ROADMAP TEST SUITE');
  console.log('=================================================');

  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`🌐 Test server listening on ephemeral port ${port}`);

  const timestamp = Date.now();

  try {
    // ----------------------------------------------------
    // STEP 1: Register Candidate and Set Base Profile
    // ----------------------------------------------------
    console.log('\n--- Step 1: Register Candidate & Set Profile ---');
    const candAuth = await request(baseUrl, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Roadmap Explorer ${timestamp}`,
        email: `roadmap_exp_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'candidate',
      }),
    });
    const token = candAuth.data.token;

    await request(baseUrl, '/users/profile/candidate', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        headline: 'Frontend Engineer transitioning to Cloud Architect',
        skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
        location: 'Seattle, WA',
      }),
    });
    console.log('✅ Candidate registered and profile initialized with frontend skills.');

    // ----------------------------------------------------
    // STEP 2: Generate Career Roadmap (POST /api/roadmaps)
    // ----------------------------------------------------
    console.log('\n--- Step 2: Generate AI Career Roadmap ---');
    const roadmapRes = await request(baseUrl, '/roadmaps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        targetRole: 'Senior Cloud & DevOps Architect',
      }),
    });

    const roadmap = roadmapRes.data.roadmap;
    console.log(`✅ Roadmap created with ID: ${roadmap._id}`);
    console.log(`   Target Role: ${roadmap.targetRole}`);
    console.log(`   Baseline Readiness Score: ${roadmap.readinessScore}%`);
    console.log(`   Estimated Duration: ${roadmap.estimatedWeeks} weeks`);
    console.log(`   Identified Skill Gaps (${roadmap.skillGaps?.length}):`, roadmap.skillGaps?.slice(0, 3).map(g => `${g.skill} [${g.priority}]`));
    console.log(`   Phases Generated (${roadmap.milestones?.length}):`);
    roadmap.milestones.forEach((m) => {
      console.log(`     - [${m.timeframe}] ${m.title}`);
    });

    if (!roadmap.milestones || roadmap.milestones.length === 0) {
      throw new Error('Expected at least 1 milestone in roadmap');
    }
    const initialScore = roadmap.readinessScore;

    // ----------------------------------------------------
    // STEP 3: Retrieve Single Roadmap (GET /api/roadmaps/:id)
    // ----------------------------------------------------
    console.log('\n--- Step 3: Get Roadmap Details by ID ---');
    const getRoadmapRes = await request(baseUrl, `/roadmaps/${roadmap._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Retrieved single roadmap. Target: ${getRoadmapRes.data.roadmap.targetRole}`);

    // ----------------------------------------------------
    // STEP 4: Complete Milestone 1 (PATCH /api/roadmaps/:id/milestones/0)
    // ----------------------------------------------------
    console.log('\n--- Step 4: Toggle Milestone 1 Completion ---');
    const toggleRes = await request(baseUrl, `/roadmaps/${roadmap._id}/milestones/0`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ completed: true }),
    });

    const updatedRoadmap = toggleRes.data.roadmap;
    console.log(`✅ Milestone 1 marked completed.`);
    console.log(`   New Readiness Score: ${updatedRoadmap.readinessScore}% (Initial: ${initialScore}%)`);

    if (updatedRoadmap.readinessScore < initialScore) {
      throw new Error('Expected readiness score to increase upon milestone completion');
    }

    // ----------------------------------------------------
    // STEP 5: Complete Remaining Milestones to Reach 100%
    // ----------------------------------------------------
    console.log('\n--- Step 5: Complete All Milestones ---');
    for (let i = 1; i < updatedRoadmap.milestones.length; i++) {
      await request(baseUrl, `/roadmaps/${roadmap._id}/milestones/${i}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: true }),
      });
    }

    const finalRoadmapRes = await request(baseUrl, `/roadmaps/${roadmap._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const finalRoadmap = finalRoadmapRes.data.roadmap;
    console.log(`✅ All milestones completed. Final Readiness: ${finalRoadmap.readinessScore}%, Status: ${finalRoadmap.status}`);

    if (finalRoadmap.status !== 'Completed') {
      throw new Error(`Expected roadmap status to be Completed, got ${finalRoadmap.status}`);
    }

    // ----------------------------------------------------
    // STEP 6: Sync Newly Mastered Skills to Candidate Profile
    // ----------------------------------------------------
    console.log('\n--- Step 6: Sync Acquired Roadmap Skills to Profile ---');
    const syncRes = await request(baseUrl, `/roadmaps/${roadmap._id}/sync-skills`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Skills synced to candidate profile: ${syncRes.data.syncedCount} new skills added.`);
    console.log(`   New Skills Added:`, syncRes.data.newSkillsAdded);
    console.log(`   Total Profile Skills:`, syncRes.data.allProfileSkills);

    if (syncRes.data.syncedCount === 0) {
      throw new Error('Expected newly mastered skills to be added to profile');
    }

    // ----------------------------------------------------
    // STEP 7: Get All Candidate Roadmaps (GET /api/roadmaps)
    // ----------------------------------------------------
    console.log('\n--- Step 7: Get Candidate Roadmaps Collection ---');
    const myRoadmapsRes = await request(baseUrl, '/roadmaps', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Retrieved candidate roadmaps list. Total: ${myRoadmapsRes.data.total}`);
    if (myRoadmapsRes.data.total < 1) {
      throw new Error('Expected at least 1 roadmap in list');
    }

    console.log('\n🎉 ===============================================');
    console.log('🏆 ALL PHASE 11 BACKEND VERIFICATION TESTS PASSED!');
    console.log('=================================================\n');

    server.close();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('💥 Phase 11 Test failed with error:', err.response?.data || err.message);
    server.close();
    await disconnectDB();
    process.exit(1);
  }
}

runPhase11Tests();

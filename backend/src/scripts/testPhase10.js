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

async function runPhase10Tests() {
  console.log('🚀 ===============================================');
  console.log('🧪 RUNNING PHASE 10: AI MOCK INTERVIEW PREP TEST SUITE');
  console.log('=================================================');

  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`🌐 Test server listening on ephemeral port ${port}`);

  const timestamp = Date.now();

  try {
    // ----------------------------------------------------
    // STEP 1: Register Candidate
    // ----------------------------------------------------
    console.log('\n--- Step 1: Register Candidate ---');
    const candAuth = await request(baseUrl, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Interview Pro ${timestamp}`,
        email: `interview_pro_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'candidate',
      }),
    });
    const token = candAuth.data.token;
    console.log('✅ Candidate registered successfully.');

    // ----------------------------------------------------
    // STEP 2: Start Mock Interview Session (POST /api/interviews/start)
    // ----------------------------------------------------
    console.log('\n--- Step 2: Initialize Mock Interview Session ---');
    const startRes = await request(baseUrl, '/interviews/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        roleTitle: 'Senior Full Stack Engineer',
        category: 'Mixed',
        difficulty: 'Senior',
        targetCompany: 'Stripe & Cloudflare',
        questionCount: 3,
      }),
    });

    const session = startRes.data.session;
    console.log(`✅ Session created with ID: ${session._id}`);
    console.log(`   Role: ${session.roleTitle} (${session.difficulty})`);
    console.log(`   Questions Generated: ${session.questions.length}`);
    session.questions.forEach((q, idx) => {
      console.log(`   Q${idx + 1} [${q.category}]: "${q.questionText.slice(0, 75)}..."`);
    });

    if (session.questions.length !== 3) {
      throw new Error(`Expected 3 questions, got ${session.questions.length}`);
    }

    // ----------------------------------------------------
    // STEP 3: Submit Answer to Question 1 (Technical)
    // ----------------------------------------------------
    console.log('\n--- Step 3: Answer Question 1 & Evaluate ---');
    const q1Answer = 'In React, client-side rendering downloads JavaScript and executes DOM rendering in the browser, which causes higher initial load time and hurts SEO, whereas server-side rendering delivers pre-rendered HTML from the server for fast First Contentful Paint and optimal SEO indexing. We manage this trade-off using Next.js hydration and edge caching.';
    
    const ans1Res = await request(baseUrl, `/interviews/session/${session._id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        questionIndex: 0,
        candidateAnswer: q1Answer,
      }),
    });

    const evaluatedQ1 = ans1Res.data.question;
    console.log(`✅ Q1 Evaluated. Score: ${evaluatedQ1.score}/100`);
    console.log(`   Feedback: "${evaluatedQ1.feedback}"`);
    console.log(`   Strengths:`, evaluatedQ1.strengths);
    console.log(`   Ideal Summary: "${evaluatedQ1.idealAnswerSummary}"`);

    if (typeof evaluatedQ1.score !== 'number' || evaluatedQ1.score <= 0) {
      throw new Error('Invalid Q1 score returned');
    }

    // ----------------------------------------------------
    // STEP 4: Submit Answer to Question 2 (Behavioral STAR)
    // ----------------------------------------------------
    console.log('\n--- Step 4: Answer Question 2 (STAR Format) & Evaluate ---');
    const q2Answer = 'Situation: During high-volume holiday sales, our payment webhook service experienced intermittent connection timeouts. Task: As senior engineer, I needed to restore zero-data-loss transaction processing within our SLA. Action: I diagnosed a database connection pool exhaustion, implemented exponential backoff retries with Redis message queuing, and added alerting. Result: Restored 99.99% webhook success rate and prevented revenue drop.';

    const ans2Res = await request(baseUrl, `/interviews/session/${session._id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        questionIndex: 1,
        candidateAnswer: q2Answer,
      }),
    });

    const evaluatedQ2 = ans2Res.data.question;
    console.log(`✅ Q2 Evaluated. Score: ${evaluatedQ2.score}/100`);
    console.log(`   Strengths:`, evaluatedQ2.strengths);

    // ----------------------------------------------------
    // STEP 5: Submit Answer to Question 3 (System Design / Arch)
    // ----------------------------------------------------
    console.log('\n--- Step 5: Answer Question 3 & Evaluate ---');
    const q3Answer = 'To scale our architecture, we employ an API Gateway with rate limiting, decouple read-heavy queries using Redis cluster caching, partition our MongoDB collections by tenant ID, and process asynchronous workflows through Kafka message queues with idempotent consumer workers.';

    const ans3Res = await request(baseUrl, `/interviews/session/${session._id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        questionIndex: 2,
        candidateAnswer: q3Answer,
      }),
    });

    const evaluatedQ3 = ans3Res.data.question;
    console.log(`✅ Q3 Evaluated. Score: ${evaluatedQ3.score}/100`);
    console.log(`   isLastQuestion: ${ans3Res.data.isLastQuestion}`);

    if (!ans3Res.data.isLastQuestion) {
      throw new Error('Expected isLastQuestion to be true for question index 2');
    }

    // ----------------------------------------------------
    // STEP 6: Finalize & Complete Session (POST /api/interviews/session/:id/complete)
    // ----------------------------------------------------
    console.log('\n--- Step 6: Complete Interview Session & Generate Scorecard ---');
    const completeRes = await request(baseUrl, `/interviews/session/${session._id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const completedSession = completeRes.data.session;
    console.log('✅ Session finalized successfully:');
    console.log(`   Status: ${completedSession.status}`);
    console.log(`   Overall Score: ${completedSession.overallScore}/100`);
    console.log(`   Dimensional Metrics:`, completedSession.metrics);
    console.log(`   Feedback Summary: "${completedSession.feedbackSummary}"`);
    console.log(`   Key Strengths:`, completedSession.strengths);
    console.log(`   Actionable Recommendations:`, completedSession.recommendations);

    if (completedSession.status !== 'Completed') {
      throw new Error('Expected session status to be Completed');
    }
    if (typeof completedSession.overallScore !== 'number' || completedSession.overallScore < 50) {
      throw new Error(`Expected overallScore >= 50, got ${completedSession.overallScore}`);
    }

    // ----------------------------------------------------
    // STEP 7: Retrieve Session by ID (GET /api/interviews/session/:id)
    // ----------------------------------------------------
    console.log('\n--- Step 7: Get Single Interview Session ---');
    const getSessionRes = await request(baseUrl, `/interviews/session/${session._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Retrieved session by ID. Role: ${getSessionRes.data.session.roleTitle}`);

    // ----------------------------------------------------
    // STEP 8: Check Interview History (GET /api/interviews/history)
    // ----------------------------------------------------
    console.log('\n--- Step 8: Get Candidate Interview History ---');
    const historyRes = await request(baseUrl, '/interviews/history', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Candidate history retrieved. Total sessions: ${historyRes.data.total}`);
    if (historyRes.data.total < 1) {
      throw new Error('Expected at least 1 session in history');
    }

    console.log('\n🎉 ===============================================');
    console.log('🏆 ALL PHASE 10 BACKEND VERIFICATION TESTS PASSED!');
    console.log('=================================================\n');

    server.close();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('💥 Phase 10 Test failed with error:', err.response?.data || err.message);
    server.close();
    await disconnectDB();
    process.exit(1);
  }
}

runPhase10Tests();

import http from 'http';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
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

async function runPhase16Tests() {
  console.log('🛡️  [PHASE 16 TEST SUITE] Starting Security & Validation Hardening verification...');
  let hasErrors = false;
  let server;

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const PORT = 5056;
    server = app.listen(PORT);
    console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);

    // 1. Test NoSQL Injection Defense in Request Body
    console.log('\n--- 1. NoSQL Injection Payload Sanitization Test ---');
    // Send a payload containing Mongo operators like $gt, $where, or dot-nested keys
    const maliciousPayload = {
      name: 'Security Test User',
      email: `sec_test_${Date.now()}@careerpilot.io`,
      password: 'Password@123',
      role: 'candidate',
      $where: 'sleep(1000)',
      'nested.key': 'injected',
    };

    const nosqlRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: maliciousPayload,
    });

    if (nosqlRes.status === 201 && nosqlRes.body?.success) {
      // Confirm the user created in DB does NOT contain the injected keys
      const createdUser = await User.findOne({ email: maliciousPayload.email }).lean();
      if (!createdUser['$where'] && !createdUser['nested.key']) {
        console.log('✅ NoSQL injection keys ($where, nested.key) successfully stripped before DB write');
      } else {
        console.error('❌ Danger: Injected keys were saved to database document!');
        hasErrors = true;
      }
    } else {
      console.error('❌ Registration failed unexpectedly during NoSQL injection test:', nosqlRes.body);
      hasErrors = true;
    }

    // 2. Test XSS Sanitization in Request Body
    console.log('\n--- 2. Cross-Site Scripting (XSS) Sanitization Test ---');
    const xssPayload = {
      name: 'Tester <script>alert("xss")</script>',
      email: `xss_test_${Date.now()}@careerpilot.io`,
      password: 'Password@123',
      role: 'candidate',
    };

    const xssRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: xssPayload,
    });

    if (xssRes.status === 201 && xssRes.body?.success) {
      const savedUser = await User.findOne({ email: xssPayload.email }).lean();
      if (!savedUser.name.includes('<script>') && !savedUser.name.includes('alert(')) {
        console.log(`✅ XSS payload neutralized: sanitized name is "${savedUser.name}"`);
      } else {
        console.error(`❌ Danger: Raw script tag persisted in database: "${savedUser.name}"`);
        hasErrors = true;
      }
    } else {
      console.error('❌ Registration failed during XSS test:', xssRes.body);
      hasErrors = true;
    }

    // 3. Test Invalid ObjectId Validation Middleware
    console.log('\n--- 3. Invalid MongoDB ObjectId Format Rejection Test ---');
    const invalidIdRes = await request({
      port: PORT,
      path: '/api/jobs/invalid-id-non-hex-999',
      method: 'GET',
    });

    if (invalidIdRes.status === 400 && invalidIdRes.body?.message?.includes('Invalid id parameter')) {
      console.log('✅ Malformed ObjectId immediately caught and rejected with clean 400 Bad Request');
    } else {
      console.error(`❌ Expected 400 with invalid ID message, got ${invalidIdRes.status}:`, invalidIdRes.body);
      hasErrors = true;
    }

    // 4. Test Strict Input Validation (Missing required fields & invalid enums)
    console.log('\n--- 4. Input Validation Middleware Test ---');
    const invalidJobRes = await request({
      port: PORT,
      path: '/api/jobs',
      method: 'POST',
      headers: { Authorization: `Bearer ${nosqlRes.body?.data?.token}` },
      body: {
        title: '', // Empty
        description: 'Testing',
        employmentType: 'NotARealType',
      },
    });

    // Should fail validation (either 400 for empty title or 403 for candidate role)
    if (invalidJobRes.status === 400 || invalidJobRes.status === 403) {
      console.log(`✅ Invalid job payload correctly blocked (Status: ${invalidJobRes.status}): "${invalidJobRes.body?.message}"`);
    } else {
      console.error(`❌ Expected 400/403 for invalid job input, got ${invalidJobRes.status}:`, invalidJobRes.body);
      hasErrors = true;
    }

    // 5. Test Password Validation (Too short)
    console.log('\n--- 5. Password Complexity / Length Enforcement Test ---');
    const weakPassRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Short Pass User',
        email: `weak_${Date.now()}@careerpilot.io`,
        password: '123', // less than 6 chars
        role: 'candidate',
      },
    });

    if (weakPassRes.status === 400 && weakPassRes.body?.message?.includes('Password must be at least 6 characters')) {
      console.log(`✅ Weak password blocked with 400: "${weakPassRes.body?.message}"`);
    } else {
      console.error(`❌ Expected 400 for short password, got ${weakPassRes.status}:`, weakPassRes.body);
      hasErrors = true;
    }

    // 6. Test Duplicate Registration (Mongoose duplicate key error normalization)
    console.log('\n--- 6. Duplicate Key Normalization Test ---');
    const dupRes = await request({
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Duplicate User',
        email: maliciousPayload.email, // Already registered
        password: 'Password@123',
        role: 'candidate',
      },
    });

    if (dupRes.status === 400 || dupRes.status === 409) {
      console.log(`✅ Duplicate user registration gracefully handled (Status: ${dupRes.status}): "${dupRes.body?.message}"`);
    } else {
      console.error(`❌ Expected 400/409 for duplicate email, got ${dupRes.status}:`, dupRes.body);
      hasErrors = true;
    }

    // 7. Test Rate Limiting on Auth Route
    console.log('\n--- 7. Brute Force Rate Limiter Test ---');
    console.log('   Sending burst of requests to /api/auth/login to trigger rate limit...');
    let hitRateLimit = false;
    for (let i = 0; i < 35; i++) {
      const burstRes = await request({
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'wrong@user.io', password: 'wrongpassword' },
      });
      if (burstRes.status === 429) {
        hitRateLimit = true;
        console.log(`✅ Rate limiter active: HTTP 429 received on request #${i + 1} ("${burstRes.body?.message}")`);
        break;
      }
    }

    if (!hitRateLimit) {
      console.error('❌ Expected HTTP 429 from authLimiter within 35 requests, but none received.');
      hasErrors = true;
    }

    // Clean up created test users
    await User.deleteMany({ email: { $in: [maliciousPayload.email, xssPayload.email] } });
    console.log('\n🧹 Cleaned up test security documents.');

    if (server) server.close();
    await mongoose.disconnect();

    if (hasErrors) {
      console.error('\n❌ [PHASE 16 TEST SUITE] Some security tests failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 [PHASE 16 TEST SUITE] All security and validation tests passed with 100% success!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Unhandled error in security test suite:', error);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase16Tests();

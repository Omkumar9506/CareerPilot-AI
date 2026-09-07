import mongoose from 'mongoose';
import { runUnitTests } from '../tests/unit.test.js';
import { runApiTests } from '../tests/api.test.js';
import { env } from '../config/env.js';

async function runMasterTestSuite() {
  const startTime = Date.now();
  console.log('================================================================');
  console.log('🚀 [PHASE 17: MASTER TEST SUITE] CAREERPILOT AI AUTOMATED TESTS');
  console.log('================================================================');

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('📦 Connected to MongoDB database.\n');

    // 1. Run algorithmic & security unit tests
    const unitResults = await runUnitTests();

    // 2. Run API integration & end-to-end tests
    const apiResults = await runApiTests();

    await mongoose.disconnect();
    console.log('⚠️ MongoDB connection closed.');

    const totalPassed = unitResults.passed + apiResults.passed;
    const totalFailed = unitResults.failed + apiResults.failed;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n================================================================');
    console.log(`🏁 TEST SUMMARY: Completed in ${duration}s`);
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   Passed:      ${totalPassed} ✅`);
    console.log(`   Failed:      ${totalFailed} ${totalFailed > 0 ? '❌' : '🎉'}`);
    console.log('================================================================\n');

    if (totalFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('💥 Master test runner encountered an unhandled error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runMasterTestSuite();

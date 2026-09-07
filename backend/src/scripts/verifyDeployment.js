import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runProductionAudit() {
  console.log('================================================================');
  console.log('🌐 [CAREERPILOT AI] PRODUCTION READINESS & DEPLOYMENT AUDIT');
  console.log('================================================================\n');

  let checksPassed = 0;
  let warnings = 0;
  let errors = 0;

  const pass = (msg) => {
    console.log(`  ✅ [PASS] ${msg}`);
    checksPassed++;
  };

  const warn = (msg) => {
    console.log(`  ⚠️  [WARN] ${msg}`);
    warnings++;
  };

  const fail = (msg) => {
    console.log(`  ❌ [FAIL] ${msg}`);
    errors++;
  };

  // 1. Node.js Engine Check
  console.log('--- 1. Runtime & Engine Compatibility ---');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 20) {
    pass(`Node.js engine version is ${nodeVersion} (meets >= 20.0.0 requirement)`);
  } else {
    fail(`Node.js engine version ${nodeVersion} is outdated (minimum 20.x required)`);
  }

  // 2. Critical Environment Secrets
  console.log('\n--- 2. Security & Configuration Integrity ---');
  if (env.JWT_SECRET && env.JWT_SECRET !== 'dev_secret_key_change_me') {
    pass('JWT_SECRET is customized and configured');
  } else {
    warn('JWT_SECRET is using development default fallback. Set a strong random secret before public deployment.');
  }

  if (env.MONGO_URI) {
    pass(`MONGO_URI is set (${env.MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas Cloud' : 'Standard URI'})`);
  } else {
    fail('MONGO_URI is missing from environment variables');
  }

  if (env.GEMINI_API_KEY) {
    pass('Google Gemini AI key is configured');
  } else {
    warn('GEMINI_API_KEY is omitted. Automated heuristic fallback mode will serve AI queries.');
  }

  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) {
    pass('Cloudinary storage credentials configured for document persistence');
  } else {
    warn('Cloudinary credentials omitted. Local filesystem fallback active in /uploads.');
  }

  if (env.EMAIL_USER && env.EMAIL_PASS) {
    pass('Nodemailer SMTP gateway configured for real-time interview invitations');
  } else {
    warn('Nodemailer credentials omitted. Simulated console delivery active.');
  }

  // 3. Database Connectivity Check
  console.log('\n--- 3. Database Connectivity & Readiness ---');
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    pass(`Successfully connected to MongoDB (${conn.connection.name || 'db'})`);
    await mongoose.disconnect();
  } catch (err) {
    fail(`Unable to connect to MongoDB at ${env.MONGO_URI}: ${err.message}`);
  }

  // 4. Frontend Production Build Directory Check
  console.log('\n--- 4. Frontend Static Asset Bundle Check ---');
  const distPath = path.resolve(__dirname, '../../../frontend/dist');
  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(distPath) && fs.existsSync(indexHtml)) {
    const stats = fs.statSync(indexHtml);
    pass(`Frontend production build verified at ${distPath} (index.html: ${stats.size} bytes)`);
  } else {
    warn('Frontend dist/ bundle not found. Run "npm run build" in frontend/ directory before static deployment.');
  }

  // 5. Deployment Manifests Verification
  console.log('\n--- 5. Platform Manifests Verification ---');
  const rootDir = path.resolve(__dirname, '../../../');
  const renderPath = path.join(rootDir, 'render.yaml');
  const railwayPath = path.join(rootDir, 'railway.json');
  const composePath = path.join(rootDir, 'docker-compose.yml');
  const vercelPath = path.join(rootDir, 'frontend/vercel.json');

  if (fs.existsSync(renderPath)) pass('render.yaml exists for Render Cloud deployment');
  if (fs.existsSync(railwayPath)) pass('railway.json exists for Railway deployment');
  if (fs.existsSync(composePath)) pass('docker-compose.yml exists for Docker deployment');
  if (fs.existsSync(vercelPath)) pass('frontend/vercel.json exists for Vercel deployment');

  // Summary
  console.log('\n================================================================');
  console.log('🏁 PRODUCTION AUDIT SUMMARY');
  console.log(`   Checks Passed: ${checksPassed} ✅`);
  console.log(`   Warnings:      ${warnings} ⚠️`);
  console.log(`   Errors:        ${errors} ${errors > 0 ? '❌' : '🎉'}`);
  console.log('================================================================\n');

  if (errors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runProductionAudit();

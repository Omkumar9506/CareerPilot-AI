import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sanitizeNoSql, sanitizeXss } from '../middlewares/sanitizeMiddleware.js';
import { env } from '../config/env.js';

export async function runUnitTests() {
  console.log('\n🧪 [UNIT TESTS] Executing unit tests for algorithms and utilities...');
  let failed = 0;
  let passed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`   ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${description}`);
      failed++;
    }
  };

  // 1. Password Hashing & Comparison Test
  try {
    const password = 'SecretPassword@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const isMatch = await bcrypt.compare(password, hash);
    const isMismatch = await bcrypt.compare('WrongPassword', hash);

    assert(isMatch === true, 'bcrypt correctly verifies valid password hash');
    assert(isMismatch === false, 'bcrypt rejects invalid password hash');
  } catch (err) {
    assert(false, `Password hashing threw error: ${err.message}`);
  }

  // 2. JWT Generation & Verification Test
  try {
    const payload = { id: '60d0fe4f5311236168a109ca', role: 'candidate' };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, env.JWT_SECRET);

    assert(decoded.id === payload.id && decoded.role === payload.role, 'JWT sign and verify correctly retrieves payload');
  } catch (err) {
    assert(false, `JWT sign/verify threw error: ${err.message}`);
  }

  // 3. NoSQL Injection Sanitizer Test
  try {
    const dirty = {
      name: 'Safe Name',
      $where: 'badScript()',
      nested: {
        'bad.key': 'exploit',
        validKey: 42,
      },
      list: [{ $gt: '' }, 'safeString'],
    };

    const clean = sanitizeNoSql(dirty);

    assert(!('$where' in clean), 'sanitizeNoSql strips top-level operator key ($where)');
    assert(!('bad.key' in clean.nested), 'sanitizeNoSql strips nested key with dot (bad.key)');
    assert(clean.nested.validKey === 42, 'sanitizeNoSql preserves safe nested properties');
    assert(!('$gt' in clean.list[0]), 'sanitizeNoSql strips operators inside arrays');
    assert(clean.list[1] === 'safeString', 'sanitizeNoSql preserves safe array elements');
  } catch (err) {
    assert(false, `NoSQL sanitizer threw error: ${err.message}`);
  }

  // 4. XSS Sanitizer Test
  try {
    const dirtyHtml = 'Hello <script>evil()</script>World javascript:alert(1)';
    const cleanHtml = sanitizeXss(dirtyHtml);

    assert(!cleanHtml.includes('<script>'), 'sanitizeXss strips <script> tags');
    assert(!cleanHtml.includes('javascript:'), 'sanitizeXss strips javascript: URI schemes');
    assert(cleanHtml.includes('Hello') && cleanHtml.includes('World'), 'sanitizeXss preserves legitimate text');
  } catch (err) {
    assert(false, `XSS sanitizer threw error: ${err.message}`);
  }

  console.log(`\n📊 [UNIT TESTS RESULT] Passed: ${passed}, Failed: ${failed}`);
  return { passed, failed };
}

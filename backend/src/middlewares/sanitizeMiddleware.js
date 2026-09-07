/**
 * Recursively strips keys that start with '$' or contain '.'
 * to prevent NoSQL Injection in MongoDB queries.
 */
export const sanitizeNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeNoSql(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prohibit keys with $ prefix or containing dot notation
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeNoSql(value);
  }
  return clean;
};

/**
 * Basic HTML/script tag escaping for XSS prevention in string fields.
 */
export const sanitizeXss = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeXss(v));
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      clean[k] = sanitizeXss(v);
    }
    return clean;
  }
  return value;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 */
export const sanitizeRequestMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeXss(sanitizeNoSql(req.body));
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeXss(sanitizeNoSql(req.query));
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeXss(sanitizeNoSql(req.params));
  }
  next();
};

/**
 * AI Job Matching & Similarity Service
 * Evaluates compatibility across Skills, Experience, Location, and Role semantics.
 */

// Common tech synonyms and alias normalizations
const TECH_SYNONYMS = {
  react: ['react', 'reactjs', 'react.js'],
  nodejs: ['node', 'nodejs', 'node.js'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js', 'es6', 'ecmascript'],
  mongodb: ['mongodb', 'mongo'],
  postgresql: ['postgresql', 'postgres', 'psql'],
  tailwindcss: ['tailwind', 'tailwindcss', 'tailwind css'],
  docker: ['docker', 'containerization'],
  kubernetes: ['kubernetes', 'k8s'],
  aws: ['aws', 'amazon web services'],
  express: ['express', 'expressjs', 'express.js'],
  python: ['python', 'py', 'django', 'flask', 'fastapi'],
  graphql: ['graphql', 'gql'],
  rest: ['rest', 'restful', 'rest api', 'apis'],
  git: ['git', 'github', 'gitlab', 'version control'],
  nextjs: ['next', 'nextjs', 'next.js'],
  redux: ['redux', 'redux toolkit', 'rtk'],
  vue: ['vue', 'vuejs', 'vue.js'],
  angular: ['angular', 'angularjs'],
};

const normalizeTerm = (term) => {
  if (!term || typeof term !== 'string') return '';
  return term.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const areSkillsEquivalent = (candidateSkill, jobSkill) => {
  const normC = normalizeTerm(candidateSkill);
  const normJ = normalizeTerm(jobSkill);

  if (!normC || !normJ) return false;
  if (normC === normJ) return true;
  if (normC.includes(normJ) || normJ.includes(normC)) return true;

  // Check synonym map
  for (const group of Object.values(TECH_SYNONYMS)) {
    const hasC = group.some((syn) => normalizeTerm(syn) === normC);
    const hasJ = group.some((syn) => normalizeTerm(syn) === normJ);
    if (hasC && hasJ) return true;
  }

  return false;
};

/**
 * Calculates candidate's cumulative years of professional experience
 */
export const calculateExperienceYears = (profile) => {
  if (!profile?.experience || profile.experience.length === 0) {
    return 0;
  }

  let totalMonths = 0;
  const now = new Date();

  profile.experience.forEach((exp) => {
    const start = exp.startDate ? new Date(exp.startDate) : null;
    const end = exp.current ? now : exp.endDate ? new Date(exp.endDate) : now;

    if (start && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (months > 0) totalMonths += months;
    }
  });

  return Math.round((totalMonths / 12) * 10) / 10;
};

/**
 * Maps experience level to expected target years
 */
const EXPERIENCE_REQUIREMENTS = {
  Entry: { min: 0, ideal: 1, max: 2 },
  'Mid-Level': { min: 2, ideal: 3.5, max: 5 },
  Senior: { min: 5, ideal: 6.5, max: 8 },
  Lead: { min: 7, ideal: 9, max: 12 },
  Executive: { min: 10, ideal: 12, max: 20 },
};

/**
 * Evaluates experience compatibility
 */
export const evaluateExperienceFit = (candidateYears, jobLevel) => {
  const req = EXPERIENCE_REQUIREMENTS[jobLevel] || EXPERIENCE_REQUIREMENTS['Mid-Level'];

  if (candidateYears >= req.min && candidateYears <= req.max + 1) {
    return 100;
  }
  if (candidateYears > req.max + 1) {
    // Slightly overqualified but still highly capable
    return Math.max(85, 100 - (candidateYears - req.max) * 3);
  }
  // Less than min
  const gap = req.min - candidateYears;
  if (gap <= 1) return 75;
  if (gap <= 2) return 55;
  return Math.max(30, 45 - gap * 5);
};

/**
 * Evaluates workplace and location compatibility
 */
export const evaluateLocationFit = (candidateLocation, job) => {
  if (job.workplaceType === 'Remote') {
    return 100;
  }

  if (!candidateLocation || !job.location) {
    return 70;
  }

  const normCand = candidateLocation.toLowerCase().trim();
  const normJob = job.location.toLowerCase().trim();

  if (normCand === normJob || normCand.includes(normJob) || normJob.includes(normCand)) {
    return 100;
  }

  // Check state or country overlap
  const candParts = normCand.split(',').map((p) => p.trim());
  const jobParts = normJob.split(',').map((p) => p.trim());
  const hasOverlap = candParts.some((cp) => jobParts.includes(cp));

  if (hasOverlap) {
    return job.workplaceType === 'Hybrid' ? 85 : 75;
  }

  return job.workplaceType === 'Hybrid' ? 55 : 40;
};

/**
 * Evaluates headline / title semantic fit
 */
export const evaluateRoleSemanticFit = (headline = '', bio = '', jobTitle = '', jobDesc = '') => {
  const combinedProfile = `${headline} ${bio}`.toLowerCase();
  const titleWords = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'senior', 'junior', 'lead'].includes(w));

  if (titleWords.length === 0) return 70;

  let matchedWords = 0;
  titleWords.forEach((word) => {
    if (combinedProfile.includes(word)) {
      matchedWords++;
    }
  });

  const overlapRatio = matchedWords / titleWords.length;
  return Math.min(100, Math.max(40, Math.round(50 + overlapRatio * 50)));
};

/**
 * Calculates full compatibility report between a candidate profile and a job
 */
export const calculateJobMatch = (profile, job) => {
  const candidateSkills = (profile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));
  const jobSkills = job?.skills || [];

  // 1. Skill evaluation
  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((jSkill) => {
    const hasMatch = candidateSkills.some((cSkill) => areSkillsEquivalent(cSkill, jSkill));
    if (hasMatch) {
      matchedSkills.push(jSkill);
    } else {
      missingSkills.push(jSkill);
    }
  });

  const skillScore =
    jobSkills.length > 0
      ? Math.min(100, Math.round((matchedSkills.length / jobSkills.length) * 100))
      : 80;

  // 2. Experience evaluation
  const candidateYears = calculateExperienceYears(profile);
  const experienceScore = Math.round(evaluateExperienceFit(candidateYears, job.experienceLevel));

  // 3. Location & Workplace evaluation
  const locationScore = Math.round(evaluateLocationFit(profile?.location, job));

  // 4. Role Title / Semantic fit
  const roleScore = Math.round(
    evaluateRoleSemanticFit(profile?.headline, profile?.bio, job.title, job.description)
  );

  // 5. Composite weighted match score
  // Skills: 45%, Experience: 25%, Location: 15%, Role: 15%
  const compositeScore = Math.min(
    99,
    Math.max(
      20,
      Math.round(skillScore * 0.45 + experienceScore * 0.25 + locationScore * 0.15 + roleScore * 0.15)
    )
  );

  // Categorize match level
  let matchLevel = 'Developing Match';
  let badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (compositeScore >= 85) {
    matchLevel = 'Exceptional Match';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (compositeScore >= 70) {
    matchLevel = 'Strong Match';
    badgeColor = 'text-brand-400 bg-brand-500/10 border-brand-500/30';
  } else if (compositeScore >= 50) {
    matchLevel = 'Good Match';
    badgeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/30';
  }

  // Summary generation
  let summary = '';
  if (compositeScore >= 85) {
    summary = `Exceptional fit! You have strong skill coverage (${matchedSkills.length}/${jobSkills.length} skills) and align well with ${job.experienceLevel} expectations.`;
  } else if (compositeScore >= 70) {
    summary = `Strong match! Your profile aligns with core expectations. Bridging gaps in ${missingSkills.slice(0, 2).join(', ') || 'specialized tools'} will maximize interview selection chances.`;
  } else if (compositeScore >= 50) {
    summary = `Viable opportunity. You match foundational aspects (${matchedSkills.length} skills matched). Focus your application on relevant projects to offset missing skills.`;
  } else {
    summary = `Growth opportunity. Consider picking up ${missingSkills.slice(0, 3).join(', ')} before applying to boost your competitive edge.`;
  }

  return {
    matchScore: compositeScore,
    matchLevel,
    badgeColor,
    breakdown: {
      skillsScore: skillScore,
      experienceScore,
      locationScore,
      roleScore,
    },
    candidateYears,
    matchedSkills,
    missingSkills,
    summary,
  };
};

/**
 * Scores and ranks a list of jobs for a candidate profile
 */
export const rankJobsForCandidate = (profile, jobs) => {
  const scored = jobs.map((job) => {
    const jobObj = job.toObject ? job.toObject() : { ...job };
    const match = calculateJobMatch(profile, jobObj);
    return {
      ...jobObj,
      match,
    };
  });

  return scored.sort((a, b) => b.match.matchScore - a.match.matchScore);
};

/**
 * Scores and ranks candidate profiles for a specific job
 */
export const rankCandidatesForJob = (candidatesWithProfiles, job) => {
  const scored = candidatesWithProfiles.map((item) => {
    const match = calculateJobMatch(item.profile, job);
    return {
      candidate: item.candidate,
      profile: item.profile,
      match,
    };
  });

  return scored.sort((a, b) => b.match.matchScore - a.match.matchScore);
};

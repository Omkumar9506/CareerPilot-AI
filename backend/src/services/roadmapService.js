import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const isGeminiAvailable = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());

let genAI = null;
if (isGeminiAvailable) {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI for roadmap service:', err.message);
  }
}

// Common target role benchmark skills
const ROLE_BENCHMARK_SKILLS = {
  'full stack': ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'REST', 'Tailwind CSS', 'Redis', 'CI/CD'],
  frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'State Management', 'Web Performance', 'Jest/Cypress'],
  backend: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'System Design', 'Microservices', 'Message Queues'],
  devops: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Ansible', 'Prometheus', 'Grafana'],
  cloud: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Microservices', 'Distributed Systems', 'Cloud Security'],
  'system design': ['System Design', 'Distributed Systems', 'Caching (Redis)', 'Message Queues (Kafka)', 'Database Sharding', 'Load Balancing'],
  ai: ['Python', 'PyTorch', 'FastAPI', 'Vector Databases', 'Prompt Engineering', 'RAG Architecture', 'Docker'],
};

/**
 * Normalizes term for matching
 */
const normalize = (str) => (str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '');

/**
 * Identify target skills based on targetJob or roleTitle
 */
const getTargetSkills = (targetRole, targetJob) => {
  if (targetJob?.skills && targetJob.skills.length > 0) {
    return targetJob.skills;
  }

  const lower = targetRole.toLowerCase();
  for (const [key, skills] of Object.entries(ROLE_BENCHMARK_SKILLS)) {
    if (lower.includes(key)) {
      return skills;
    }
  }

  return ROLE_BENCHMARK_SKILLS['full stack'];
};

/**
 * Fallback deterministic roadmap generator
 */
const generateFallbackRoadmap = ({ candidateSkills, targetSkills, targetRole }) => {
  const normCandidate = candidateSkills.map(normalize);

  const matched = [];
  const missing = [];

  targetSkills.forEach((skill) => {
    if (normCandidate.some((c) => c === normalize(skill) || c.includes(normalize(skill)))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  // Calculate baseline readiness score
  const matchRatio = targetSkills.length > 0 ? matched.length / targetSkills.length : 0.5;
  const initialReadiness = Math.min(85, Math.max(30, Math.round(matchRatio * 75 + 15)));

  // Categorize skill gaps
  const skillGaps = missing.map((skill, index) => {
    let category = 'Core Essential';
    let priority = 'High';

    const lower = skill.toLowerCase();
    if (lower.includes('docker') || lower.includes('k8s') || lower.includes('ci/cd') || lower.includes('terraform')) {
      category = 'DevOps & Tooling';
    } else if (lower.includes('design') || lower.includes('system') || lower.includes('distributed') || lower.includes('redis')) {
      category = 'Architecture & System Design';
      priority = 'High';
    } else if (index > 3) {
      category = 'Differentiator';
      priority = 'Medium';
    }

    return {
      skill,
      category,
      priority,
      status: 'Missing',
    };
  });

  // Split missing skills into 3 progressive phases
  const p1Skills = missing.slice(0, 2).length > 0 ? missing.slice(0, 2) : ['Core Architecture Fundamentals'];
  const p2Skills = missing.slice(2, 4).length > 0 ? missing.slice(2, 4) : ['Production Deployment & Tooling'];
  const p3Skills = missing.slice(4).length > 0 ? missing.slice(4) : ['Distributed Systems & Scale Optimization'];

  const milestones = [
    {
      phase: 1,
      title: `Phase 1: Foundation & Core Skill Acceleration (${p1Skills.join(', ')})`,
      timeframe: 'Weeks 1-4',
      description: `Bridge foundational gaps in ${p1Skills.join(' and ')} with hands-on development and targeted coding exercises.`,
      skillsCovered: p1Skills,
      recommendedProjects: [
        `Build a production-grade service incorporating ${p1Skills[0] || 'core concepts'} with automated test suites and error handling.`,
      ],
      resources: [
        { title: `${p1Skills[0] || 'Modern Engineering'} Official Documentation & Guides`, type: 'Documentation', url: 'https://developer.mozilla.org' },
        { title: 'Full Stack Architecture Patterns', type: 'Course', url: 'https://roadmap.sh' },
      ],
      completed: false,
    },
    {
      phase: 2,
      title: `Phase 2: Production Tooling, Microservices & Caching (${p2Skills.join(', ')})`,
      timeframe: 'Weeks 5-8',
      description: `Integrate ${p2Skills.join(' and ')} into real-world deployments. Focus on containerization, CI/CD automation, and multi-tier data layers.`,
      skillsCovered: p2Skills,
      recommendedProjects: [
        `Implement a containerized microservices ecosystem with Redis caching and Docker orchestration for ${p2Skills[0] || 'scalable backend'}.`,
      ],
      resources: [
        { title: 'Docker & Microservices Deployment Handbook', type: 'Article', url: 'https://docs.docker.com' },
        { title: 'High-Throughput Redis Patterns', type: 'Tutorial', url: 'https://redis.io/resources' },
      ],
      completed: false,
    },
    {
      phase: 3,
      title: `Phase 3: High-Scale Architecture, System Design & Capstone Project`,
      timeframe: 'Weeks 9-12',
      description: `Master distributed system design, latency optimization, and deploy a comprehensive capstone project showcasing your end-to-end capabilities for ${targetRole}.`,
      skillsCovered: p3Skills,
      recommendedProjects: [
        `Deploy a distributed capstone web platform featuring real-time event streaming, role-based security, and observability monitoring.`,
      ],
      resources: [
        { title: 'System Design Primer & Distributed Principles', type: 'Guide', url: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'Modern Cloud Architecture Best Practices', type: 'Course', url: 'https://aws.amazon.com/architecture' },
      ],
      completed: false,
    },
  ];

  const aiSummary = `To transition effectively into a ${targetRole}, your top priority is mastering ${missing.slice(0, 3).join(', ') || 'specialized tools'}. By completing these 3 structured phases and publishing the recommended portfolio projects, you will elevate your candidate readiness to top percentiles.`;

  return {
    readinessScore: initialReadiness,
    estimatedWeeks: 12,
    skillGaps,
    milestones,
    aiSummary,
  };
};

/**
 * Generate customized career roadmap via Gemini or heuristic fallback
 */
export const generateCareerRoadmap = async ({
  candidateProfile,
  targetRole,
  targetJob = null,
}) => {
  const candidateSkills = (candidateProfile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));
  const targetSkills = getTargetSkills(targetRole, targetJob);

  if (isGeminiAvailable && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
You are a Principal Engineering Career Mentor and Staff Tech Architect.
Create a high-impact, personalized, milestone-driven Career Learning Roadmap for a candidate aiming for the role: "${targetRole}".

Candidate Background:
- Known Skills: ${candidateSkills.length > 0 ? candidateSkills.join(', ') : 'Junior/General'}
- Headline: ${candidateProfile?.headline || 'Aspiring Software Engineer'}
- Target Role / Vacancy: ${targetRole}
- Target Required Stack: ${targetSkills.join(', ')}

Instructions:
1. Compare candidate known skills with target required skills to pinpoint exact missing skills and high-impact gaps.
2. Formulate a baseline readiness score (0 to 100) representing how close they currently are to passing a hiring bar.
3. Build exactly 3 progressive phases (milestones) spanning 12 weeks with:
   - Phase number (1, 2, 3)
   - Title and timeframe (e.g. Weeks 1-4)
   - Concise actionable description
   - Specific skills covered in this phase
   - 1-2 practical portfolio project ideas they should build to prove mastery
   - 2 curated resources (title, type, url)
4. Provide an executive summary with strategic advice.

Return a strictly valid JSON object matching this schema:
{
  "readinessScore": (integer between 25 and 85),
  "estimatedWeeks": 12,
  "skillGaps": [
    {
      "skill": "skill name",
      "category": "Core Essential" | "Architecture & System Design" | "DevOps & Tooling" | "Differentiator",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "milestones": [
    {
      "phase": 1,
      "title": "phase title",
      "timeframe": "Weeks 1-4",
      "description": "description",
      "skillsCovered": ["skill1", "skill2"],
      "recommendedProjects": ["project idea with real-world architecture"],
      "resources": [
        { "title": "resource title", "type": "Documentation" | "Course" | "Article" | "Guide", "url": "https://example.com" }
      ]
    }
  ],
  "aiSummary": "Executive career strategy paragraph"
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());

      if (parsed && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
        return {
          readinessScore: Math.min(85, Math.max(25, Number(parsed.readinessScore) || 50)),
          estimatedWeeks: Number(parsed.estimatedWeeks) || 12,
          skillGaps: Array.isArray(parsed.skillGaps)
            ? parsed.skillGaps.map((sg) => ({
                skill: sg.skill,
                category: sg.category || 'Core Essential',
                priority: sg.priority || 'High',
                status: 'Missing',
              }))
            : [],
          milestones: parsed.milestones.map((m, idx) => ({
            phase: m.phase || idx + 1,
            title: m.title || `Phase ${idx + 1}`,
            timeframe: m.timeframe || 'Weeks 1-4',
            description: m.description || '',
            skillsCovered: Array.isArray(m.skillsCovered) ? m.skillsCovered : [],
            recommendedProjects: Array.isArray(m.recommendedProjects) ? m.recommendedProjects : [],
            resources: Array.isArray(m.resources) ? m.resources : [],
            completed: false,
          })),
          aiSummary: parsed.aiSummary || `Targeted learning path for ${targetRole}.`,
        };
      }
    } catch (err) {
      console.warn('Gemini roadmap generation failed, using fallback:', err.message);
    }
  }

  return generateFallbackRoadmap({ candidateSkills, targetSkills, targetRole });
};

/**
 * Dynamically recomputes roadmap readiness score based on completed milestones
 */
export const recalculateRoadmapProgress = (roadmap) => {
  const totalMilestones = roadmap.milestones.length;
  if (totalMilestones === 0) return roadmap.readinessScore;

  const completedCount = roadmap.milestones.filter((m) => m.completed).length;

  // Calculate baseline readiness score
  const baseline = 50;
  const progressWeight = (50 / totalMilestones) * completedCount;

  const newScore = Math.min(100, Math.round(baseline + progressWeight));
  return newScore;
};

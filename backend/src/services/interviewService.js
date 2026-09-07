import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const isGeminiAvailable = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());

let genAI = null;
if (isGeminiAvailable) {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI for interview service:', err.message);
  }
}

// Curated comprehensive fallback question banks
const FALLBACK_QUESTIONS = {
  Technical: {
    'Full Stack': [
      {
        questionText: 'Can you explain the difference between client-side rendering (CSR) and server-side rendering (SSR), and when you would choose one over the other in a modern React application?',
        category: 'Technical',
        expectedKeyPoints: ['SEO benefits of SSR', 'Initial page load speed vs TTI', 'Server compute overhead', 'Hydration concepts'],
      },
      {
        questionText: 'How do you structure database transactions and error handling in Node.js when multiple operations across MongoDB or PostgreSQL must succeed or roll back together?',
        category: 'Technical',
        expectedKeyPoints: ['ACID compliance', 'Mongoose sessions and startSession()', 'Two-phase commits', 'Centralized error middleware and rollbacks'],
      },
      {
        questionText: 'Explain how Node.js event loop handles asynchronous I/O and how you would diagnose an event loop lag or CPU-bound blocking bottleneck in production.',
        category: 'Technical',
        expectedKeyPoints: ['Libuv thread pool', 'Microtasks vs Macrotasks', 'Worker threads for CPU intensive tasks', 'Profiling tools like clinic.js or node inspect'],
      },
      {
        questionText: 'How do you design a secure authentication and authorization architecture in a single-page app interacting with microservices using JWT and refresh tokens?',
        category: 'Technical',
        expectedKeyPoints: ['HttpOnly SameSite cookies vs localStorage', 'Token expiration and silent rotation', 'CSRF protection', 'Role-based access control (RBAC) middleware'],
      },
    ],
    Frontend: [
      {
        questionText: 'How does React 19 / 18 Concurrent Mode work under the hood, and how do primitives like useTransition and useDeferredValue prevent UI jank?',
        category: 'Technical',
        expectedKeyPoints: ['Interruptible rendering', 'Fiber architecture priorities', 'Non-blocking state transitions', 'Debounce vs deferred value'],
      },
      {
        questionText: 'Explain your strategy for optimizing Core Web Vitals (LCP, INP, CLS) in a high-traffic web application.',
        category: 'Technical',
        expectedKeyPoints: ['Image optimization (WebP/AVIF, srcset)', 'Critical CSS & script async/defer', 'Layout shifts with explicit aspect ratios', 'Minimizing main thread execution'],
      },
    ],
    Backend: [
      {
        questionText: 'How do you implement scalable rate limiting and API throttling across distributed Node.js servers?',
        category: 'Technical',
        expectedKeyPoints: ['Token bucket or sliding window algorithms', 'Redis distributed counter', '429 Too Many Requests headers', 'DDoS mitigation layer'],
      },
      {
        questionText: 'Describe how you design indexes in MongoDB or PostgreSQL to optimize high-volume queries and prevent slow table/collection scans.',
        category: 'Technical',
        expectedKeyPoints: ['Compound indexes and equality/sort/range order', 'Covered queries', 'Explain plan analysis', 'Write performance trade-offs'],
      },
    ],
  },
  'System Design': [
    {
      questionText: 'Design a real-time Notification Service that delivers millions of push, SMS, and in-app notifications per day with deduplication and priority queues.',
      category: 'System Design',
      expectedKeyPoints: ['Message broker (Kafka/RabbitMQ)', 'Worker consumers and rate limiters', 'Idempotency keys for deduplication', 'WebSockets for in-app delivery', 'Database persistence'],
    },
    {
      questionText: 'How would you architect a distributed URL shortener (like Bitly) handling 10,000 writes/sec and 100,000 reads/sec with low latency?',
      category: 'System Design',
      expectedKeyPoints: ['Base62 encoding vs hashing', 'Distributed ID generator (Snowflake)', 'Multi-tier caching (Redis/Memcached)', 'Read replicas and CDN routing'],
    },
    {
      questionText: 'Design a resilient rate limiter and API Gateway capable of protecting downstream microservices during traffic spikes.',
      category: 'System Design',
      expectedKeyPoints: ['Sliding window log algorithm', 'Distributed state with Redis', 'Circuit breaker pattern (Hystrix/Resilience4j)', 'Graceful degradation'],
    },
  ],
  Behavioral: [
    {
      questionText: 'Tell me about a time when you faced a critical production incident or outage. Walk me through how you triaged the issue, communicated with stakeholders, and prevented recurrence using the STAR method.',
      category: 'Behavioral',
      expectedKeyPoints: ['Situation: Context of the outage', 'Task: Your specific ownership', 'Action: Incident containment & debugging', 'Result: Restored SLA and blameless post-mortem actions'],
    },
    {
      questionText: 'Describe a situation where you had a strong technical disagreement with a teammate or senior engineer about an architectural decision. How did you resolve it constructively?',
      category: 'Behavioral',
      expectedKeyPoints: ['Respectful communication', 'Objective criteria & benchmarking/POCs', 'Disagree and commit alignment', 'Outcome and team cohesion'],
    },
    {
      questionText: 'Can you share an example of a project where requirements were ambiguous or rapidly changing? How did you prioritize tasks and deliver impactful results?',
      category: 'Behavioral',
      expectedKeyPoints: ['Proactive stakeholder questioning', 'Breaking work into agile vertical slices', 'MVP delivery', 'Feedback loop validation'],
    },
  ],
};

/**
 * Generate interview questions dynamically via Gemini or fallback
 */
export const generateQuestions = async ({
  roleTitle,
  category = 'Mixed',
  difficulty = 'Mid-Level',
  targetCompany = '',
  candidateSkills = [],
  jobDetails = null,
  count = 4,
}) => {
  if (isGeminiAvailable && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
You are a Principal Tech Interviewer and Hiring Bar Raiser conducting an interview.
Generate ${count} realistic, challenging, and highly relevant interview questions for:
Role: ${roleTitle}
Seniority: ${difficulty}
Category Track: ${category}
${targetCompany ? `Target Company / Culture: ${targetCompany}` : ''}
${candidateSkills.length > 0 ? `Candidate Known Skills: ${candidateSkills.join(', ')}` : ''}
${jobDetails ? `Target Job Stack: ${jobDetails.title} (${jobDetails.skills?.join(', ') || ''})` : ''}

Rules:
- Questions must assess real-world engineering problem solving, not superficial trivia.
- If category is Behavioral, require the STAR method (Situation, Task, Action, Result).
- If category is System Design, present a realistic high-throughput architecture scenario.
- If category is Technical, assess both conceptual depth and architectural trade-offs.

Return a JSON array of objects with this exact schema:
[
  {
    "questionText": "Clear, detailed question prompt string",
    "category": "Technical" | "Behavioral" | "System Design",
    "expectedKeyPoints": ["key point 1", "key point 2", "key point 3", "key point 4"]
  }
]
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, count).map((q) => ({
          questionText: q.questionText,
          category: q.category || 'Technical',
          expectedKeyPoints: Array.isArray(q.expectedKeyPoints) ? q.expectedKeyPoints : [],
        }));
      }
    } catch (err) {
      console.warn('Gemini question generation failed, using intelligent fallback:', err.message);
    }
  }

  // Fallback generation logic
  const selectedQuestions = [];
  const lowerRole = roleTitle.toLowerCase();

  let roleBank = FALLBACK_QUESTIONS.Technical['Full Stack'];
  if (lowerRole.includes('front') || lowerRole.includes('react')) {
    roleBank = FALLBACK_QUESTIONS.Technical['Frontend'];
  } else if (lowerRole.includes('back') || lowerRole.includes('node') || lowerRole.includes('python')) {
    roleBank = FALLBACK_QUESTIONS.Technical['Backend'];
  }

  if (category === 'Technical') {
    selectedQuestions.push(...roleBank);
  } else if (category === 'System Design') {
    selectedQuestions.push(...FALLBACK_QUESTIONS['System Design']);
  } else if (category === 'Behavioral') {
    selectedQuestions.push(...FALLBACK_QUESTIONS.Behavioral);
  } else {
    // Mixed: combine technical, system design, and behavioral
    selectedQuestions.push(roleBank[0] || FALLBACK_QUESTIONS.Technical['Full Stack'][0]);
    selectedQuestions.push(FALLBACK_QUESTIONS.Behavioral[0]);
    selectedQuestions.push(FALLBACK_QUESTIONS['System Design'][0]);
    if (roleBank[1]) selectedQuestions.push(roleBank[1]);
  }

  return selectedQuestions.slice(0, count);
};

/**
 * Fallback deterministic evaluation engine
 */
const fallbackEvaluateAnswer = ({ questionText, candidateAnswer, category = 'Technical', expectedKeyPoints = [] }) => {
  const answer = (candidateAnswer || '').trim();
  const wordCount = answer ? answer.split(/\s+/).length : 0;
  const lowerAnswer = answer.toLowerCase();

  if (wordCount < 10) {
    return {
      score: 30,
      strengths: ['Prompt attempted'],
      improvements: [
        'Response was overly brief. Provide detailed context, architectural reasoning, and practical trade-offs.',
        'Address the core requirements outlined in the question prompt.',
      ],
      feedback: 'The response lacked sufficient technical depth and detail. In tech interviews, aim for comprehensive explanations with clear examples.',
      idealAnswerSummary: expectedKeyPoints.length > 0
        ? `A complete answer should address: ${expectedKeyPoints.join('; ')}.`
        : 'A complete answer should discuss core mechanics, trade-offs, and real-world production considerations.',
    };
  }

  // Check expected key points matched
  const matchedPoints = expectedKeyPoints.filter((kp) => {
    const tokens = kp.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
    return tokens.some((t) => lowerAnswer.includes(t));
  });

  // Check STAR structure for behavioral
  const starSignals = ['situation', 'task', 'action', 'result', 'impact', 'problem', 'challenge', 'resolved', 'metrics', 'team', 'led'];
  const starCount = starSignals.filter((s) => lowerAnswer.includes(s)).length;

  let baseScore = Math.min(65, 45 + Math.min(30, wordCount * 0.3));
  if (expectedKeyPoints.length > 0) {
    baseScore += Math.round((matchedPoints.length / expectedKeyPoints.length) * 25);
  } else {
    baseScore += 15;
  }

  if (category === 'Behavioral' && starCount >= 3) {
    baseScore += 10;
  }

  const finalScore = Math.min(95, Math.max(40, Math.round(baseScore)));

  const strengths = [];
  if (wordCount >= 40) strengths.push('Good descriptive breadth and articulate response structure');
  if (matchedPoints.length > 0) strengths.push(`Effectively incorporated key concepts: ${matchedPoints.slice(0, 2).join(', ')}`);
  if (category === 'Behavioral' && starCount >= 2) strengths.push('Demonstrated structured situational awareness and action orientation');
  if (strengths.length === 0) strengths.push('Solid foundational attempt addressing the question prompt');

  const improvements = [];
  const missingPoints = expectedKeyPoints.filter((kp) => !matchedPoints.includes(kp));
  if (missingPoints.length > 0) {
    improvements.push(`Deepen discussion on: ${missingPoints.slice(0, 2).join(' and ')}`);
  }
  if (wordCount < 60) {
    improvements.push('Incorporate quantifiable metrics or specific engineering trade-offs (e.g., latency, throughput, scale)');
  }
  if (improvements.length === 0) {
    improvements.push('Consider highlighting edge cases, fault tolerance, or alternative architectural approaches');
  }

  return {
    score: finalScore,
    strengths,
    improvements,
    feedback: `Strong response (${finalScore}/100). You demonstrated clear conceptual command and relevant examples. ${
      missingPoints.length > 0 ? `Covering ${missingPoints[0]} would make this answer truly top-tier.` : ''
    }`,
    idealAnswerSummary: expectedKeyPoints.length > 0
      ? `A top-percentile candidate answer highlights: ${expectedKeyPoints.join('; ')}.`
      : 'A comprehensive answer clearly frames the problem, compares trade-offs, and validates results with measurable outcomes.',
  };
};

/**
 * Evaluate single candidate response with Gemini or heuristic fallback
 */
export const evaluateAnswer = async ({
  questionText,
  candidateAnswer,
  roleTitle,
  difficulty = 'Mid-Level',
  category = 'Technical',
  expectedKeyPoints = [],
}) => {
  if (isGeminiAvailable && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
You are an expert Bar-Raiser Tech Interviewer evaluating a candidate answer.
Role: ${roleTitle} (${difficulty} Level)
Question Category: ${category}
Interview Question:
"${questionText}"

Expected Key Concepts:
${expectedKeyPoints.length > 0 ? expectedKeyPoints.join('; ') : 'General senior software engineering standards'}

Candidate Answer:
"""
${candidateAnswer}
"""

Evaluate the candidate's answer constructively, fairly, and with high engineering standards.
Return a strictly valid JSON object matching this schema:
{
  "score": (integer 0 to 100),
  "strengths": [(array of 1-3 specific strong points observed in the response)],
  "improvements": [(array of 1-3 specific technical or structural gaps to bridge)],
  "feedback": "(concise 2-3 sentence coaching feedback to the candidate)",
  "idealAnswerSummary": "(concise summary of what a perfect 100/100 response should encompass)"
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());

      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 75)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear articulation of core concepts'],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Incorporate more concrete metrics and trade-offs'],
        feedback: parsed.feedback || 'Well-structured response with relevant industry insights.',
        idealAnswerSummary: parsed.idealAnswerSummary || 'A high-impact response clearly defines architecture, trade-offs, and outcomes.',
      };
    } catch (err) {
      console.warn('Gemini answer evaluation failed, using fallback:', err.message);
    }
  }

  return fallbackEvaluateAnswer({ questionText, candidateAnswer, category, expectedKeyPoints });
};

/**
 * Computes composite scorecard for an interview session
 */
export const calculateSessionScorecard = (session) => {
  const answered = session.questions.filter((q) => q.candidateAnswer && q.score > 0);
  if (answered.length === 0) {
    return {
      overallScore: 0,
      metrics: { technicalAccuracy: 0, communication: 0, clarity: 0, depth: 0 },
      feedbackSummary: 'No questions were answered in this session.',
      strengths: [],
      weaknesses: ['Complete question prompts to receive personalized evaluation.'],
      recommendations: ['Restart session and provide substantive answers.'],
    };
  }

  const totalScore = answered.reduce((acc, q) => acc + q.score, 0);
  const avgScore = Math.round(totalScore / answered.length);

  // Compute dimensional metrics
  const technicalAccuracy = Math.min(98, Math.round(avgScore * 0.95 + 4));
  const communication = Math.min(96, Math.max(50, Math.round(avgScore * 0.9 + 8)));
  const clarity = Math.min(95, Math.max(55, Math.round(avgScore * 0.92 + 5)));
  const depth = Math.min(99, Math.max(45, Math.round(avgScore * 0.98)));

  // Aggregate strengths and improvements
  const allStrengths = [];
  const allImprovements = [];
  answered.forEach((q) => {
    if (q.strengths) allStrengths.push(...q.strengths);
    if (q.improvements) allImprovements.push(...q.improvements);
  });

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const uniqueWeaknesses = Array.from(new Set(allImprovements)).slice(0, 4);

  let summary = '';
  if (avgScore >= 85) {
    summary = `Outstanding interview performance (${avgScore}/100)! You demonstrated advanced technical mastery, concise communication, and strong architectural trade-off reasoning consistent with top-tier hiring standards.`;
  } else if (avgScore >= 70) {
    summary = `Strong interview demonstration (${avgScore}/100). You communicate technical concepts effectively with good foundational depth. Addressing specific edge cases and quantifying system impact will elevate your candidacy to top percentiles.`;
  } else {
    summary = `Developing performance (${avgScore}/100). Foundational knowledge is present, but responses need more structured frameworks (like STAR for behavioral or component-tier diagrams for system design).`;
  }

  const recommendations = [
    'Always articulate non-functional requirements (scalability, latency, reliability) before diving into implementation details.',
    'Use the STAR method (Situation, Task, Action, Result) for behavioral prompts to demonstrate measurable impact.',
    'Proactively discuss production observability, automated testing, and failure recovery modes.',
  ];

  return {
    overallScore: avgScore,
    metrics: {
      technicalAccuracy,
      communication,
      clarity,
      depth,
    },
    feedbackSummary: summary,
    strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Solid fundamental comprehension'],
    weaknesses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['Expand on quantifiable trade-offs'],
    recommendations,
  };
};

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const isGeminiAvailable = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());

let genAI = null;
if (isGeminiAvailable) {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    console.log('🤖 Google Gemini API initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI client:', err.message);
  }
} else {
  console.log('ℹ️  GEMINI_API_KEY not provided. Intelligent heuristic fallback active.');
}

/**
 * Intelligent deterministic fallback analysis engine
 */
const generateFallbackAnalysis = (resumeContent, jobDetails) => {
  const text = (resumeContent || '').toLowerCase();
  const techKeywords = [
    'react', 'node', 'javascript', 'typescript', 'python', 'mongodb', 
    'docker', 'aws', 'kubernetes', 'express', 'sql', 'git', 'rest',
    'graphql', 'ci/cd', 'tailwind', 'redux', 'next.js', 'redis'
  ];

  const foundKeywords = techKeywords.filter((k) => text.includes(k));
  const targetJobSkills = jobDetails?.skills || ['React', 'Node.js', 'TypeScript', 'Docker', 'MongoDB'];
  
  const matchedSkills = targetJobSkills.filter((s) => text.includes(s.toLowerCase()));
  const missingSkills = targetJobSkills.filter((s) => !text.includes(s.toLowerCase()));

  const baseAts = Math.min(95, Math.max(55, 60 + foundKeywords.length * 4));
  const matchScore = targetJobSkills.length > 0
    ? Math.round((matchedSkills.length / targetJobSkills.length) * 100)
    : 80;

  return {
    atsScore: baseAts,
    matchScore,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : ['JavaScript', 'Git', 'Problem Solving'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['System Design', 'Kubernetes'],
    strengths: [
      'Clear technological background and modern stack focus',
      'Relevant hands-on development experience showcased',
      'Consistent project structure with measurable impact metrics',
    ],
    weaknesses: [
      'Could incorporate more quantifiable achievements (e.g. latency reduced by X%, user retention boosted by Y%)',
      'Missing deep cloud infrastructure and orchestration keywords',
    ],
    recommendations: [
      'Add industry-standard action verbs at the beginning of each accomplishment bullet',
      'Include a dedicated Skills Summary section tailored directly to the target role requirements',
      'Ensure standard chronological layout without tables or graphics for optimal ATS parser reading',
    ],
    experienceRelevance: Math.min(95, Math.max(65, 70 + foundKeywords.length * 3)),
    keywordOptimization: [
      'Microservices Architecture',
      'Test-Driven Development (TDD)',
      'CI/CD Automation',
      'Performance Optimization',
    ],
  };
};

/**
 * Analyze resume with Gemini API or fallback
 * @param {string} resumeContent - Candidate resume text or profile summary
 * @param {object} [jobDetails] - Target job specification
 * @returns {Promise<object>} Structured ATS analysis
 */
export const analyzeResumeWithGemini = async (resumeContent, jobDetails = null) => {
  if (!isGeminiAvailable || !genAI) {
    return generateFallbackAnalysis(resumeContent, jobDetails);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are an expert Technical Recruiter and Applicant Tracking System (ATS) optimization engine.
Analyze the following candidate resume and evaluate its ATS compatibility, keyword density, and qualification fit.

${
  jobDetails
    ? `Target Job Details:
Title: ${jobDetails.title}
Company: ${jobDetails.company}
Required Skills: ${jobDetails.skills?.join(', ') || 'N/A'}
Description: ${jobDetails.description || 'N/A'}
Requirements: ${jobDetails.requirements?.join('; ') || 'N/A'}`
    : 'No specific target job specified. Evaluate against modern tech industry engineering standards.'
}

Candidate Resume / Profile Information:
"""
${resumeContent}
"""

Return a strictly valid JSON object matching this exact schema:
{
  "atsScore": (number between 0 and 100),
  "matchScore": (number between 0 and 100 representing compatibility with the target job or industry standards),
  "matchedSkills": [(array of string skills found in resume that match modern tech or target job)],
  "missingSkills": [(array of string skills absent in resume that would elevate the candidate)],
  "strengths": [(array of 3-4 specific positive observations)],
  "weaknesses": [(array of 2-3 specific areas for improvement)],
  "recommendations": [(array of 3-4 actionable steps to increase ATS pass rates)],
  "experienceRelevance": (number between 0 and 100),
  "keywordOptimization": [(array of 4-6 high-impact keywords to insert)]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return {
      atsScore: Number(parsedData.atsScore) || 75,
      matchScore: Number(parsedData.matchScore) || 70,
      matchedSkills: Array.isArray(parsedData.matchedSkills) ? parsedData.matchedSkills : [],
      missingSkills: Array.isArray(parsedData.missingSkills) ? parsedData.missingSkills : [],
      strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths : [],
      weaknesses: Array.isArray(parsedData.weaknesses) ? parsedData.weaknesses : [],
      recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
      experienceRelevance: Number(parsedData.experienceRelevance) || 75,
      keywordOptimization: Array.isArray(parsedData.keywordOptimization) ? parsedData.keywordOptimization : [],
    };
  } catch (error) {
    console.warn('Gemini API call failed or quota reached. Falling back to heuristic analysis:', error.message);
    return generateFallbackAnalysis(resumeContent, jobDetails);
  }
};

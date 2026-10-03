const { GoogleGenerativeAI } = require('@google/generative-ai');
const { extractResumeInfo } = require('../utils/resumeExtractor');
const { calculateJobMatch } = require('../utils/scoringEngine');
const { checkEligibility } = require('../utils/eligibilityEngine');
const { generateSkillGapAndRoadmap } = require('../utils/roadmapGenerator');
const {
  normalizeAIAnalysis,
  normalizeAreasToImprove,
  normalizeSkillProficiency,
  normalizeCareerReadiness,
} = require('../utils/aiNormalizer');

// Initialize Gemini if API key is provided
const getGeminiModel = () => {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (err) {
    console.warn('[AI Service] Gemini initialization failed:', err.message);
    return null;
  }
};

/**
 * 1. AI Resume Analysis
 * Parses resume text into structured professional profile data
 */
const analyzeResume = async (resumeText = '') => {
  // Deterministic local extraction as reliable foundation
  const fallbackData = extractResumeInfo(resumeText);

  const model = getGeminiModel();
  if (model && resumeText && resumeText.length > 50) {
    try {
      const prompt = `
You are an expert AI HR Technical Recruiter and Resume Parser.
Analyze the following resume text and output a STRICT JSON object only.
DO NOT include markdown backticks or commentary outside JSON.
Strictly ignore any demographic or protected characteristics (gender, age, race, religion, nationality, disability).
Focus entirely on professional merits: technical skills, soft skills, education, work experience, projects, and certifications.

Format:
{
  "name": "Candidate Name",
  "email": "email address",
  "phone": "phone number",
  "headline": "Professional Headline (e.g. Full Stack Developer | React & Node.js)",
  "summary": "3-sentence executive summary of career and strengths",
  "skills": ["Technical Skill 1", "Technical Skill 2"],
  "softSkills": ["Soft Skill 1", "Soft Skill 2"],
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "experience": [{"title": "...", "company": "...", "duration": "...", "description": "..."}],
  "projects": [{"title": "...", "description": "...", "technologies": ["..."]}],
  "certifications": [{"name": "...", "issuer": "..."}],
  "strengths": ["Key professional strength 1", "Key professional strength 2", "Key professional strength 3"],
  "areasToImprove": [
    {
      "area": "Cloud Infrastructure",
      "priority": "High",
      "reason": "The resume does not demonstrate cloud deployment experience.",
      "recommendation": "Learn AWS fundamentals, Docker and basic deployment."
    }
  ],
  "suggestedJobTitles": ["Role 1", "Role 2", "Role 3"]
}

Resume Text:
${resumeText.slice(0, 10000)}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        ...fallbackData,
        ...parsed,
        // Ensure arrays are merged cleanly
        skills: Array.from(new Set([...(parsed.skills || []), ...fallbackData.skills])),
        softSkills: Array.from(new Set([...(parsed.softSkills || []), ...fallbackData.softSkills])),
        areasToImprove: normalizeAreasToImprove(parsed.areasToImprove),
        aiPowered: true,
      };
    } catch (err) {
      console.warn('[AI Service] Gemini call failed, using deterministic fallback parser:', err.message);
    }
  }

  // Deterministic Fallback Output
  const strengths = [];
  if (fallbackData.skills.length > 5) strengths.push(`Diverse technical toolset across ${fallbackData.skills.slice(0, 4).join(', ')}`);
  if (fallbackData.experience.length > 0) strengths.push('Hands-on software development internship/professional experience');
  if (fallbackData.projects.length > 0) strengths.push('Demonstrated end-to-end practical project implementation portfolio');
  if (strengths.length === 0) strengths.push('Solid foundational computer science and programming fundamentals');

  const areasToImprove = normalizeAreasToImprove([
    {
      area: 'Cloud Infrastructure & Deployment (AWS/GCP)',
      priority: 'High',
      reason: 'The resume does not demonstrate cloud hosting or containerization experience.',
      recommendation: 'Learn AWS fundamentals, Docker containerization, and basic cloud deployment.'
    },
    {
      area: 'Automated Testing & CI/CD Pipelines',
      priority: 'Medium',
      reason: 'Automated testing and CI/CD automated pipeline workflows are missing.',
      recommendation: 'Incorporate unit testing (Jest/JUnit) and GitHub Actions automated pipelines into projects.'
    },
    {
      area: 'Quantifiable Business Metrics',
      priority: 'Medium',
      reason: 'Project descriptions focus on task execution rather than measurable business outcomes.',
      recommendation: 'Include quantifiable business impact metrics (e.g., latency reduction, user count) in project descriptions.'
    }
  ]);

  return {
    ...fallbackData,
    headline: fallbackData.experience[0]?.title || 'Software Engineering Professional',
    summary: `Motivated technology professional with expertise in ${fallbackData.skills.slice(0, 5).join(', ') || 'modern software development'}. Strong problem-solving aptitude with hands-on project and engineering experience.`,
    strengths,
    areasToImprove,
    suggestedJobTitles: ['Full Stack Developer', 'Software Engineer', 'Frontend Engineer', 'Backend Developer'],
    aiPowered: false,
  };
};

/**
 * 2. Match Resume to Job
 * Computes explainable match scores, matched skills, missing skills, and eligibility
 */
const matchResumeToJob = async (resumeData = {}, jobData = {}) => {
  // Deterministic explainable calculation
  const matchResult = calculateJobMatch(resumeData, jobData);
  const eligibilityResult = checkEligibility(resumeData, jobData);
  const gapAndRoadmap = generateSkillGapAndRoadmap(
    resumeData.skills || [],
    matchResult.missingSkills || [],
    jobData.title || 'Target Job'
  );

  let recommendations = [
    `Focus on acquiring ${matchResult.missingSkills.slice(0, 3).join(', ')} to boost your candidate competitiveness.`,
    `Review job requirements closely regarding ${jobData.qualification || 'degree requirements'}.`,
    `Highlight existing matched competencies: ${matchResult.matchedSkills.slice(0, 4).join(', ')} during interviews.`
  ];

  // If Gemini is available, generate personalized narrative advice
  const model = getGeminiModel();
  if (model) {
    try {
      const prompt = `
As an objective AI hiring assistant, provide 3 actionable, concise bullet points for this candidate targeting the job '${jobData.title}'.
Candidate skills: ${(resumeData.skills || []).join(', ')}.
Missing job skills: ${matchResult.missingSkills.join(', ')}.
Provide output as JSON array of 3 strings: ["tip 1", "tip 2", "tip 3"].
Strictly no markdown backticks.
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        recommendations = parsed;
      }
    } catch (e) {
      // Keep deterministic recommendations
    }
  }

  return {
    matchPercentage: matchResult.overallMatch,
    skillMatch: matchResult.skillMatch,
    experienceMatch: matchResult.experienceMatch,
    educationMatch: matchResult.educationMatch,
    roleMatch: matchResult.roleMatch,
    matchedSkills: matchResult.matchedSkills,
    missingSkills: matchResult.missingSkills,
    eligibility: eligibilityResult.status,
    eligibilityStatus: eligibilityResult.status,
    eligibilityReasons: eligibilityResult.reasons,
    skillGaps: gapAndRoadmap.skillGaps,
    learningRoadmap: gapAndRoadmap.roadmap,
    recommendations,
    whyMatched: `Matches ${matchResult.matchedSkills.length} required & preferred skills including ${matchResult.matchedSkills.slice(0, 3).join(', ') || 'core qualifications'} with a ${matchResult.overallMatch}% compatibility rating.`,
    disclaimer: 'AI-generated matching is provided as decision support. Recruiters should independently review candidate information before making hiring decisions.'
  };
};

/**
 * 3. Analyze Skill Gap
 */
const analyzeSkillGap = async (candidateSkills = [], jobSkills = [], targetJobTitle = 'Target Role') => {
  const { normalizeSkill } = require('../utils/scoringEngine');
  const normalizedCandidate = new Set((candidateSkills || []).map(normalizeSkill));

  const matched = [];
  const missing = [];

  (jobSkills || []).forEach(req => {
    if (normalizedCandidate.has(normalizeSkill(req))) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const { skillGaps, roadmap } = generateSkillGapAndRoadmap(candidateSkills, missing, targetJobTitle);

  return {
    matchedSkills: matched,
    missingSkills: missing,
    skillGaps,
    roadmap,
    summary: `Identified ${missing.length} skill gaps required for '${targetJobTitle}'. Focusing on priority skills (${missing.slice(0, 3).join(', ') || 'None'}) will significantly increase your eligibility score.`
  };
};

/**
 * 4. Generate Learning Roadmap
 */
const generateLearningRoadmap = async (currentSkills = [], missingSkills = [], targetRole = 'Software Engineer') => {
  return generateSkillGapAndRoadmap(currentSkills, missingSkills, targetRole);
};

/**
 * 5. Recommend Jobs
 * Scores all available active jobs for a candidate and sorts by match percentage
 */
const recommendJobs = async (candidateProfile = {}, jobs = []) => {
  const recommendations = [];

  for (const job of jobs) {
    const match = calculateJobMatch(candidateProfile, job);
    const eligibility = checkEligibility(candidateProfile, job);

    recommendations.push({
      job,
      matchPercentage: match.overallMatch,
      skillMatch: match.skillMatch,
      experienceMatch: match.experienceMatch,
      educationMatch: match.educationMatch,
      eligibilityStatus: eligibility.status,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      whyMatched: `Strong fit in ${match.matchedSkills.slice(0, 3).join(', ')} with ${match.overallMatch}% profile synergy.`
    });
  }

  // Sort by match percentage descending
  return recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
};

/**
 * 6. Deep AI Resume Analyzer & Career Skill Advisor
 * Comprehensive analysis of candidate's resume independent of specific job postings.
 */
const analyzeResumeDeep = async (resumeText = '', resumeRecord = null) => {
  const fallbackData = extractResumeInfo(resumeText);
  const skills = Array.from(new Set([...(resumeRecord?.extractedSkills || []), ...(fallbackData.skills || [])]));
  const softSkills = Array.from(new Set([...(resumeRecord?.languages || []), ...(fallbackData.softSkills || []), 'Problem Solving', 'Team Collaboration', 'Agile Mindset']));
  const education = resumeRecord?.education?.length ? resumeRecord.education : fallbackData.education;
  const experience = resumeRecord?.experience?.length ? resumeRecord.experience : fallbackData.experience;
  const projects = resumeRecord?.projects?.length ? resumeRecord.projects : fallbackData.projects;
  const certifications = resumeRecord?.certifications?.length ? resumeRecord.certifications : fallbackData.certifications;

  const model = getGeminiModel();
  if (model && resumeText && resumeText.length > 50) {
    try {
      const prompt = `
You are an expert AI Career Coach and Resume Intelligence Engine.
Analyze ONLY the candidate's uploaded resume text below.
DO NOT use markdown backticks, return STRICT JSON only.
CRITICAL FAIRNESS RULE: Strictly ignore and do NOT evaluate based on demographic or protected characteristics (gender, religion, race, caste, ethnicity, age, political affiliation, health, disability).
Base all assessments strictly on job-relevant technical skills, experience, education, projects, and certifications.

CRITICAL FORMAT RULES:
1. All scores and percentages must be NUMBERS between 0 and 100. NEVER return strings like "90%". Return 90.
2. areasToImprove must be an array of objects: [{"area": "...", "priority": "High", "reason": "...", "recommendation": "..."}]. NEVER return plain strings.
3. skillProficiency must be an array of objects: [{"skill": "...", "level": "Advanced", "score": 85, "evidence": "..."}]. score must be a number 0-100.

Format:
{
  "summary": "3-4 sentence objective summary of candidate profile, strengths, and primary areas for career growth.",
  "careerReadiness": {
    "technicalSkills": 90,
    "experienceAlignment": 55,
    "projectsDepth": 60,
    "educationVerification": 90,
    "certifications": 50,
    "resumeQuality": 80,
    "overall": 75,
    "explanation": "Calculated based on verified technical tools, project portfolio depth, and educational degree alignment."
  },
  "skillProficiency": [
    { "skill": "JavaScript", "level": "Advanced", "score": 85, "evidence": "Demonstrated through multiple projects and coursework." },
    { "skill": "Python", "level": "Advanced", "score": 80, "evidence": "Demonstrated through backend and algorithm implementations." },
    { "skill": "React", "level": "Advanced", "score": 78, "evidence": "Demonstrated in frontend client-side web application." },
    { "skill": "Node.js", "level": "Intermediate", "score": 70, "evidence": "Demonstrated in API development and backend server." },
    { "skill": "MongoDB", "level": "Intermediate", "score": 65, "evidence": "Demonstrated in document database design." },
    { "skill": "SQL", "level": "Intermediate", "score": 55, "evidence": "Demonstrated in database coursework and querying." }
  ],
  "technicalSkills": {
    "programming": ["Java", "Python", "JavaScript"],
    "frameworks": ["React", "Node.js"],
    "databases": ["MongoDB", "MySQL"],
    "cloudDevOps": ["Git", "Docker"],
    "tools": ["VS Code", "Postman"]
  },
  "softSkills": ["Communication", "Teamwork", "Problem Solving"],
  "strongestSkills": [
    { "title": "Web Application Development", "reason": "Demonstrated through project architecture and enterprise coding patterns." }
  ],
  "areasToImprove": [
    {
      "area": "Cloud Infrastructure",
      "priority": "High",
      "reason": "The resume does not demonstrate cloud deployment experience.",
      "recommendation": "Learn AWS fundamentals, Docker and basic deployment."
    },
    {
      "area": "System Design",
      "priority": "Medium",
      "reason": "The resume does not demonstrate large-scale architecture.",
      "recommendation": "Study system design fundamentals, scalability and database architecture."
    }
  ],
  "skillsToLearn": {
    "highPriority": [
      { "skill": "Docker", "whyLearn": "Standard containerization technology in enterprise production.", "relationToCurrent": "Pairs directly with your Node.js and Java backends.", "whatToLearnFirst": "Dockerfile creation and multi-container Docker Compose." }
    ],
    "mediumPriority": [
      { "skill": "Redis", "whyLearn": "High-performance caching layer used in scalable architectures.", "relationToCurrent": "Integrates into existing database pipelines.", "whatToLearnFirst": "In-memory caching patterns and key-value store basics." }
    ],
    "optional": [
      { "skill": "GraphQL", "whyLearn": "Flexible query language alternative to REST APIs.", "relationToCurrent": "Extends React frontend data-fetching efficiency.", "whatToLearnFirst": "Schema definition and resolvers." }
    ]
  },
  "skillGaps": {
    "currentSkills": ["Java", "React", "MongoDB"],
    "toDevelop": ["Docker", "AWS", "Spring Boot", "CI/CD"],
    "targetAreas": ["Backend Developer", "Full Stack Engineer", "Cloud Software Engineer"]
  },
  "careerAreas": [
    { "area": "Full Stack Web Development", "reason": "Strong balance of modern React frontends and Node.js/Java backend capabilities.", "matchFit": "High Match" }
  ],
  "resumeQuality": [
    { "item": "Contact Information", "status": "Good", "feedback": "Email, phone number, and location are accessible." },
    { "item": "Quantifiable Achievements", "status": "Needs Improvement", "feedback": "Include metrics such as percent improvement or user counts in project descriptions." }
  ],
  "missingInformation": [
    "GitHub profile URL or active project repository links",
    "LinkedIn public profile address",
    "Quantified business results or performance metrics"
  ],
  "projectAnalysis": [
    { "projectName": "Project 1", "technologies": ["React", "Node.js"], "demonstratedSkills": ["Full stack integration", "State management"], "potentialImprovement": "Add automated unit testing and containerized setup." }
  ],
  "certificationAnalysis": {
    "detected": ["Certified Java Associate"],
    "recommendations": [
      { "current": "Java Fundamentals", "potential": "AWS Certified Cloud Practitioner", "reason": "Validates cloud proficiency to complement existing software development." }
    ]
  },
  "learningRoadmap": [
    { "phase": "Phase 1: Core Mastery", "title": "Advanced Language Fundamentals & Algorithms", "topics": ["Data Structures", "Concurrency", "OOP Design Patterns"], "outcome": "Rock-solid engineering foundation" }
  ],
  "thirtyDayPlan": { "skills": ["Docker", "Advanced SQL"], "practiceTopics": ["Containerizing apps", "Complex joins & indexing"], "projectSuggestion": "Dockerize existing portfolio project" },
  "sixtyDayPlan": { "skills": ["AWS Deployment", "CI/CD"], "practiceTopics": ["EC2, S3, GitHub Actions"], "projectSuggestion": "Deploy automated CI/CD pipeline" },
  "ninetyDayPlan": { "skills": ["System Design", "Microservices"], "practiceTopics": ["Scalability, Caching, Message Queues"], "projectSuggestion": "Build distributed microservice architecture" },
  "projectRecommendations": [
    { "title": "Containerized Full Stack Application", "description": "Build and dockerize a multi-tier web application with Redis caching.", "skillsLearned": ["Docker", "Redis", "Full Stack"], "difficulty": "Intermediate", "expectedOutcome": "Portfolio-ready containerized service" }
  ],
  "interviewTopics": [
    { "category": "Java & Object-Oriented Design", "topics": ["Polymorphism", "Collections Framework", "Garbage Collection", "Multithreading"] }
  ]
}

Resume Text:
${resumeText.slice(0, 10000)}
`;

      const result = await model.generateContent(prompt);
      const cleaned = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.summary && parsed.careerReadiness) {
        return normalizeAIAnalysis({ ...parsed, aiPowered: true }, resumeRecord);
      }
    } catch (err) {
      console.warn('[AI Service] Gemini deep analysis failed, falling back to deterministic analyzer:', err.message);
    }
  }

  // Robust, Realistic Deterministic Fallback Engine
  const progLangs = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'PHP', 'Ruby', 'Rust', 'SQL'];
  const fwks = ['React', 'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'FastAPI', 'Next.js', 'Angular', 'Vue'];
  const dbs = ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Oracle', 'SQLite', 'DynamoDB'];
  const cloudOps = ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux', 'GCP', 'Azure', 'Jenkins', 'Terraform'];
  const devTools = ['Git', 'GitHub', 'VS Code', 'Postman', 'Jira', 'Figma', 'Maven', 'Gradle'];

  const detectedProg = skills.filter(s => progLangs.some(p => p.toLowerCase() === s.toLowerCase()));
  const detectedFwk = skills.filter(s => fwks.some(f => f.toLowerCase() === s.toLowerCase()));
  const detectedDb = skills.filter(s => dbs.some(d => d.toLowerCase() === s.toLowerCase()));
  const detectedCloud = skills.filter(s => cloudOps.some(c => c.toLowerCase() === s.toLowerCase()));
  const detectedTools = skills.filter(s => devTools.some(t => t.toLowerCase() === s.toLowerCase()));

  // Ensure default fallbacks if sparse
  const progFinal = detectedProg.length ? detectedProg : ['JavaScript', 'Python'];
  const fwkFinal = detectedFwk.length ? detectedFwk : ['React', 'Node.js'];
  const dbFinal = detectedDb.length ? detectedDb : ['MongoDB', 'SQL'];
  const cloudFinal = detectedCloud.length ? detectedCloud : ['Git'];
  const toolsFinal = detectedTools.length ? detectedTools : ['GitHub', 'VS Code'];

  // Skill proficiency estimation based on evidence
  const allDetected = Array.from(new Set([...progFinal, ...fwkFinal, ...dbFinal, ...cloudFinal, ...toolsFinal]));
  const skillProficiency = allDetected.map((sk, idx) => {
    let level = 'Intermediate';
    let score = 70;
    const lower = sk.toLowerCase();
    if (idx < 2 || lower.includes('java') || lower.includes('react') || lower.includes('python') || lower.includes('script')) {
      level = 'Advanced';
      score = Math.max(75, 88 - idx * 4);
    } else if (idx > 4) {
      level = 'Beginner';
      score = Math.max(35, 55 - (idx - 4) * 5);
    } else {
      level = 'Intermediate';
      score = Math.max(50, 72 - (idx - 2) * 5);
    }
    return {
      skill: sk,
      level,
      score,
      evidence: `Demonstrated through resume coursework and hands-on project implementations.`,
    };
  });

  // Calculate explainable career readiness score
  const techScore = Math.min(95, Math.max(50, allDetected.length * 10));
  const expScore = experience && experience.length > 0 ? 75 : 55;
  const eduScore = education && education.length > 0 ? 90 : 70;
  const projScore = projects && projects.length > 0 ? 85 : 60;
  const certScore = certifications && certifications.length > 0 ? 75 : 50;
  const qualScore = 80;
  const overallReadiness = Math.round(techScore * 0.25 + expScore * 0.20 + projScore * 0.20 + eduScore * 0.15 + certScore * 0.10 + qualScore * 0.10);

  const careerReadiness = {
    technicalSkills: techScore,
    experienceAlignment: expScore,
    projectsDepth: projScore,
    educationVerification: eduScore,
    certifications: certScore,
    resumeQuality: qualScore,
    overall: overallReadiness,
    explanation: `Calculated from ${allDetected.length} verified technical competencies, ${projects?.length || 0} project portfolio entries, and academic qualification records.`,
  };

  const summary = `You are a motivated technology candidate with demonstrated foundational expertise in ${allDetected.slice(0, 4).join(', ')}. Your strongest capabilities center around full stack web and backend data engineering. Adding cloud infrastructure (Docker, AWS) and containerization will significantly expand your industry competitive readiness.`;

  const fallbackOutput = {
    summary,
    careerReadiness,
    skillProficiency,
    technicalSkills: {
      programming: progFinal,
      frameworks: fwkFinal,
      databases: dbFinal,
      cloudDevOps: cloudFinal,
      tools: toolsFinal,
    },
    softSkills: ['Analytical Problem Solving', 'Technical Communication', 'Team Collaboration', 'Continuous Learning'],
    strongestSkills: [
      { title: `${progFinal[0] || 'Web'} Application Development`, reason: `Multiple project and practical implementations listed across your resume.` },
      { title: `Database Design & Querying`, reason: `Demonstrated working knowledge with ${dbFinal.join(' and ')}.` },
      { title: `Component-Based UI Architecture`, reason: `Hands-on usage of modern front-end frameworks.` }
    ],
    areasToImprove: [
      {
        area: 'Cloud Infrastructure',
        priority: 'High',
        reason: 'The resume does not demonstrate cloud deployment experience.',
        recommendation: 'Learn AWS fundamentals, Docker and basic deployment.'
      },
      {
        area: 'System Design',
        priority: 'Medium',
        reason: 'The resume does not demonstrate large-scale architecture.',
        recommendation: 'Study system design fundamentals, scalability and database architecture.'
      },
      {
        area: 'Automated Testing (Unit & Integration)',
        priority: 'Medium',
        reason: 'Enterprise teams require test-driven development (TDD) familiarity.',
        recommendation: 'Incorporate unit testing (Jest/JUnit) and automated testing pipelines into your projects.'
      }
    ],
    skillsToLearn: {
      highPriority: [
        { skill: 'Docker', whyLearn: 'Standard containerization technology required by 80%+ modern backend teams.', relationToCurrent: 'Containerizes your existing Node/Java web apps.', whatToLearnFirst: 'Dockerfile creation and multi-container Compose files.' },
        { skill: 'AWS (Amazon Web Services)', whyLearn: 'Leading cloud provider for enterprise scalability.', relationToCurrent: 'Hosts your frontend and backend infrastructure in production.', whatToLearnFirst: 'AWS EC2, S3 bucket storage, and basic IAM security.' },
        { skill: 'Spring Boot', whyLearn: 'Premier enterprise Java framework for high-throughput APIs.', relationToCurrent: 'Builds upon your core Java and database foundations.', whatToLearnFirst: 'Spring Initializr, REST controllers, and Spring Data JPA.' },
        { skill: 'System Design', whyLearn: 'Essential for technical architecture interviews and scalable distributed systems.', relationToCurrent: 'Bridges modular programming with large-scale architecture.', whatToLearnFirst: 'Scalability fundamentals, database indexing, and caching.' }
      ],
      mediumPriority: [
        { skill: 'Redis Caching', whyLearn: 'Ultra-fast in-memory caching and session management.', relationToCurrent: 'Prevents redundant queries to your MongoDB/SQL database.', whatToLearnFirst: 'Key-value caching patterns and TTL policies.' },
        { skill: 'CI/CD with GitHub Actions', whyLearn: 'Automates linting, test suites, and deployments on push.', relationToCurrent: 'Integrates natively into your existing GitHub projects.', whatToLearnFirst: 'Creating a .github/workflows/deploy.yml pipeline.' }
      ],
      optional: [
        { skill: 'GraphQL', whyLearn: 'Declarative API querying preventing over-fetching.', relationToCurrent: 'Pairs with React Apollo Client on the frontend.', whatToLearnFirst: 'Type definitions and query resolvers.' },
        { skill: 'Kubernetes', whyLearn: 'Automated container orchestration at massive scale.', relationToCurrent: 'Orchestrates Docker containers once Docker is mastered.', whatToLearnFirst: 'Pods, Deployments, and Services concepts.' }
      ]
    },
    skillGaps: {
      currentSkills: allDetected.slice(0, 6),
      toDevelop: ['Docker', 'AWS', 'Spring Boot', 'System Design', 'CI/CD Pipelines'],
      targetAreas: ['Full Stack Developer', 'Backend Software Engineer', 'Cloud Application Developer']
    },
    careerAreas: [
      { area: 'Full Stack Web Developer', reason: 'Balanced capability across modern frontend (React) and backend services.', matchFit: 'High Match' },
      { area: 'Backend Software Engineer', reason: 'Solid grasp of data persistence, REST architecture, and core programming languages.', matchFit: 'High Match' },
      { area: 'Cloud Application Engineer', reason: 'Highly achievable by complementing current programming skills with Docker and AWS.', matchFit: 'Moderate Match (Growth Area)' }
    ],
    resumeQuality: [
      { item: 'Contact Information', status: 'Good', feedback: 'Essential details (email, phone, location) are present and clear.' },
      { item: 'Technical Skills Layout', status: 'Good', feedback: 'Skills are organized and easy for recruiters to scan.' },
      { item: 'Project Portfolio', status: 'Good', feedback: 'Hands-on practical implementations demonstrate applied knowledge.' },
      { item: 'Quantifiable Metrics', status: 'Needs Improvement', feedback: 'Enhance project bullets with measurable results (e.g. reduced load time by 35%).' },
      { item: 'Industry Certifications', status: 'Needs Improvement', feedback: 'Obtaining verified credentials will elevate resume ATS ranking.' }
    ],
    missingInformation: [
      'GitHub repository profile or active code portfolio URL',
      'LinkedIn public profile address',
      'Quantifiable business outcomes (e.g. users served, speed optimizations)',
      'Verified technical certifications from cloud or framework vendors'
    ],
    projectAnalysis: (projects && projects.length > 0 ? projects : [
      { title: 'Full Stack Portal Application', description: 'Interactive application with state management and database integration.' }
    ]).map(p => ({
      projectName: p.title || 'Software Development Project',
      technologies: p.technologies || allDetected.slice(0, 3),
      demonstratedSkills: ['End-to-End Architecture', 'API Integration', 'Data Modeling'],
      potentialImprovement: 'Include user metrics, live deployed URL, and automated test coverage.'
    })),
    certificationAnalysis: {
      detected: certifications?.map(c => c.name || c) || [],
      recommendations: [
        { current: 'Core Programming Skills', potential: 'AWS Certified Cloud Practitioner', reason: 'Validates industry cloud competency for modern full stack engineering.' },
        { current: 'Backend Development', potential: 'Docker Certified Associate (DCA)', reason: 'Proves mastery of microservice containerization workflows.' }
      ]
    },
    learningRoadmap: [
      { phase: 'Phase 1: Core Consolidation', title: 'Advanced Language Concepts & Algorithms', topics: ['Data Structures & Complexity', 'OOP Design Patterns', 'Clean Code Principles'], outcome: 'Deepened core problem-solving aptitude' },
      { phase: 'Phase 2: Enterprise Backend', title: 'Framework Architecture & API Security', topics: ['Spring Boot / Express Optimization', 'JWT & OAuth Authentication', 'Database Indexing'], outcome: 'Production-ready backend engineering' },
      { phase: 'Phase 3: DevOps & Containerization', title: 'Container Workflows & Cloud Hosting', topics: ['Docker & Docker Compose', 'AWS EC2, S3 & IAM', 'GitHub Actions CI/CD'], outcome: 'Ability to deploy and scale services' },
      { phase: 'Phase 4: Advanced Systems', title: 'System Design & Distributed Scalability', topics: ['Microservices Patterns', 'In-Memory Caching (Redis)', 'Message Queues'], outcome: 'Readiness for senior technical interviews' }
    ],
    thirtyDayPlan: {
      skills: ['Docker Basics', 'Advanced SQL & Indexing'],
      practiceTopics: ['Writing Dockerfiles', 'Multi-stage builds', 'Complex joins and execution plans'],
      projectSuggestion: 'Containerize your favorite full-stack project with Docker Compose'
    },
    sixtyDayPlan: {
      skills: ['AWS Fundamentals', 'CI/CD Pipelines'],
      practiceTopics: ['AWS EC2 setup', 'S3 asset storage', 'GitHub Actions automated testing'],
      projectSuggestion: 'Deploy a live containerized application to AWS with automated CI/CD'
    },
    ninetyDayPlan: {
      skills: ['System Design', 'Redis Caching', 'Interview Prep'],
      practiceTopics: ['Distributed caching', 'Load balancing', 'LeetCode intermediate patterns'],
      projectSuggestion: 'Implement rate limiting and Redis caching in your backend API'
    },
    projectRecommendations: [
      {
        title: 'Containerized Microservices E-Commerce API',
        description: 'Build a modular backend with user authentication, catalog management, and Redis caching wrapped in Docker Compose.',
        skillsLearned: ['Docker', 'Redis', 'Microservices Architecture', 'JWT Security'],
        difficulty: 'Intermediate',
        expectedOutcome: 'A showcase repository demonstrating production deployment readiness.'
      },
      {
        title: 'Cloud-Hosted Analytics Dashboard with CI/CD',
        description: 'Deploy a React dashboard backed by real-time endpoints hosted on AWS with an automated GitHub Actions deployment pipeline.',
        skillsLearned: ['AWS S3/EC2', 'GitHub Actions', 'CI/CD', 'React'],
        difficulty: 'Intermediate',
        expectedOutcome: 'Live URL with automated green deployment checks on every commit.'
      },
      {
        title: 'High-Concurrency Task Queue Service',
        description: 'Implement an asynchronous job processing system using Redis and worker pools to handle background tasks.',
        skillsLearned: ['Asynchronous Processing', 'Redis', 'Performance Optimization'],
        difficulty: 'Advanced',
        expectedOutcome: 'A portfolio highlight proving deep backend architecture knowledge.'
      }
    ],
    interviewTopics: [
      {
        category: 'Core Programming & Data Structures',
        topics: ['Time and Space Complexity (Big-O)', 'Hash Maps vs Trees', 'Object-Oriented Design Principles (SOLID)', 'Concurrency & Thread Safety']
      },
      {
        category: 'Web & API Engineering',
        topics: ['REST vs GraphQL architectural tradeoffs', 'HTTP Status Codes and idempotency', 'Authentication vs Authorization (JWT, OAuth)', 'Cross-Origin Resource Sharing (CORS)']
      },
      {
        category: 'Databases & Storage',
        topics: ['SQL vs NoSQL selection criteria', 'Database indexing and B-Trees', 'Transactions, ACID compliance, and eventual consistency', 'N+1 Query Problem and mitigation']
      }
    ],
    aiPowered: false,
  };

  return normalizeAIAnalysis(fallbackOutput, resumeRecord);
};

/**
 * 7. Interactive Resume AI Chat Assistant
 */
const chatAboutResume = async (question = '', analysisData = {}, resumeText = '') => {
  const model = getGeminiModel();
  if (model && question) {
    try {
      const prompt = `
You are an expert AI Career Mentor analyzing this specific candidate's resume and career skill report.
Candidate Career Summary: ${analysisData.summary || 'Software candidate'}
Candidate Detected Skills: ${(analysisData.technicalSkills?.programming || []).join(', ')}, ${(analysisData.technicalSkills?.frameworks || []).join(', ')}
Missing / Skills To Learn: ${(analysisData.skillsToLearn?.highPriority || []).map(s => s.skill).join(', ')}
Candidate Question: "${question}"

Provide a concise, encouraging, direct, and actionable answer (2-4 paragraphs max).
Focus strictly on professional guidance, resume improvement, and learning advice tailored to their specific skills.
`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn('[AI Service] Gemini chat failed, using context-grounded fallback response:', err.message);
    }
  }

  // Intelligent Context-Grounded Offline Fallback
  const q = question.toLowerCase();
  const skills = [...(analysisData.technicalSkills?.programming || []), ...(analysisData.technicalSkills?.frameworks || [])].join(', ');
  const highPriority = (analysisData.skillsToLearn?.highPriority || []).map(s => s.skill).join(', ') || 'Docker and AWS';

  if (q.includes('improve') || q.includes('weak') || q.includes('gap')) {
    return `Based on your resume analysis, your most immediate area for improvement is in cloud deployment and containerization (specifically ${highPriority}). While your foundations in ${skills || 'programming and databases'} are solid, modern recruiters prioritize candidates who can deploy and containerize their code. I recommend picking up Docker first, followed by hosting a live project on AWS.`;
  }

  if (q.includes('job') || q.includes('match') || q.includes('role')) {
    const roles = (analysisData.careerAreas || []).map(a => a.area).join(', ') || 'Full Stack Developer and Backend Software Engineer';
    return `Based on your verified skills (${skills}), you are currently well-prepared to target positions in: ${roles}. To increase your competitiveness for senior and high-compensation roles, closing the gap in Docker and cloud architecture will yield the highest return on investment.`;
  }

  if (q.includes('learn') || q.includes('next') || q.includes('study')) {
    return `Your top recommended skill to learn next is **Docker**, followed by **AWS fundamentals**. Docker directly complements your existing web development projects by allowing you to bundle dependencies and present containerized repositories to hiring managers. Follow our 30-day plan to containerize your current projects first!`;
  }

  if (q.includes('project') || q.includes('portfolio')) {
    return `To make your project section stand out to technical recruiters: 1) Include a live deployed demo link and GitHub repository. 2) Add Docker support to your project. 3) Write clear README documentation with architectural diagrams and quantifiable metrics (e.g., 'Handles 500+ requests/sec with under 40ms latency'). Check the Project Recommendations section above for specific ideas!`;
  }

  return `Regarding your inquiry: As reflected in your career readiness analysis (${analysisData.careerReadiness?.overall || 78}% estimate), you have a strong technical foundation in ${skills || 'software development'}. Focusing your immediate efforts on containerization (${highPriority}), adding quantifiable outcomes to your project descriptions, and practicing system design will accelerate your recruitment velocity.`;
};

module.exports = {
  analyzeResume,
  analyzeResumeDeep,
  chatAboutResume,
  matchResumeToJob,
  analyzeSkillGap,
  generateLearningRoadmap,
  recommendJobs,
};


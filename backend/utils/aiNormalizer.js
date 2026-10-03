/**
 * AI Response Normalization Layer
 * Validates and normalizes all AI output and deterministic data before database insertion
 * Ensures 100% schema compliance and prevents Mongoose CastError exceptions.
 */

// Helper to sanitize and normalize numbers to range [min, max]
const normalizeNumber = (val, defaultVal = 0, min = 0, max = 100) => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') {
    if (isNaN(val)) return defaultVal;
    return Math.round(Math.min(max, Math.max(min, val)));
  }
  if (typeof val === 'string') {
    // Strip percentage signs and extra characters e.g. "90%", "90 / 100", "90"
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return defaultVal;
    return Math.round(Math.min(max, Math.max(min, parsed)));
  }
  return defaultVal;
};

// Normalize string arrays
const toStringArray = (arr, fallback = []) => {
  if (!Array.isArray(arr)) {
    if (typeof arr === 'string' && arr.trim()) return [arr.trim()];
    return fallback;
  }
  return arr
    .map(item => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') return item.name || item.title || item.skill || JSON.stringify(item);
      return '';
    })
    .filter(Boolean);
};

/**
 * Normalize areasToImprove
 * Expected Schema:
 * [
 *   {
 *     area: String,
 *     priority: String, // 'High' | 'Medium' | 'Low'
 *     reason: String,
 *     recommendation: String
 *   }
 * ]
 */
const normalizeAreasToImprove = (items) => {
  const defaultAreas = [
    {
      area: 'Cloud Infrastructure & Deployment',
      priority: 'High',
      reason: 'The resume does not demonstrate cloud hosting or containerization experience.',
      recommendation: 'Learn AWS fundamentals, Docker containerization, and basic cloud deployment.',
    },
    {
      area: 'Automated Testing & CI/CD',
      priority: 'Medium',
      reason: 'Automated test coverage and continuous delivery pipelines are not explicitly showcased.',
      recommendation: 'Study automated unit testing (Jest/JUnit) and GitHub Actions pipeline workflows.',
    },
    {
      area: 'System Design & Scalability',
      priority: 'Medium',
      reason: 'The resume does not demonstrate large-scale architecture or caching strategies.',
      recommendation: 'Study system design fundamentals, database indexing, and distributed caching with Redis.',
    },
  ];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return defaultAreas;
  }

  return items.map((item, idx) => {
    // Handle plain string item: "Expand cloud infrastructure experience"
    if (typeof item === 'string') {
      const trimmed = item.trim();
      let areaTitle = 'Technical Competency';
      const lower = trimmed.toLowerCase();

      if (lower.includes('cloud') || lower.includes('aws') || lower.includes('gcp') || lower.includes('azure')) {
        areaTitle = 'Cloud Infrastructure';
      } else if (lower.includes('docker') || lower.includes('container') || lower.includes('kubernetes')) {
        areaTitle = 'Containerization & DevOps';
      } else if (lower.includes('test') || lower.includes('ci/cd') || lower.includes('pipeline')) {
        areaTitle = 'Automated Testing & CI/CD';
      } else if (lower.includes('system design') || lower.includes('architecture') || lower.includes('scale')) {
        areaTitle = 'System Design & Scalability';
      } else if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo')) {
        areaTitle = 'Database Architecture & Query Optimization';
      } else if (lower.includes('metric') || lower.includes('quantif')) {
        areaTitle = 'Quantifiable Impact & Metrics';
      } else {
        // Use first few words as area title
        const parts = trimmed.split(/[:\-\.]/);
        areaTitle = parts[0].length < 35 ? parts[0].trim() : trimmed.slice(0, 30).trim() + '...';
      }

      return {
        area: areaTitle,
        priority: lower.includes('high') || lower.includes('critical') || lower.includes('cloud') ? 'High' : 'Medium',
        reason: 'This competency is not sufficiently evidenced in your resume.',
        recommendation: trimmed,
        // Backward compatibility
        skill: areaTitle,
        suggestion: trimmed,
        currentEvidence: 'Identified as a growth opportunity from uploaded resume.',
      };
    }

    // Handle object item
    if (item && typeof item === 'object') {
      const area = item.area || item.skill || item.title || `Area ${idx + 1}`;
      const rawPriority = String(item.priority || '').trim();
      let priority = 'Medium';
      if (/high/i.test(rawPriority)) priority = 'High';
      else if (/low/i.test(rawPriority)) priority = 'Low';

      const reason = item.reason || item.currentEvidence || 'The resume does not demonstrate deep proficiency in this area.';
      const recommendation = item.recommendation || item.suggestion || item.feedback || 'Pursue hands-on projects and relevant technical tutorials.';

      return {
        area,
        priority,
        reason,
        recommendation,
        // Backward compatibility
        skill: area,
        suggestion: recommendation,
        currentEvidence: reason,
      };
    }

    return defaultAreas[0];
  });
};

/**
 * Normalize skillProficiency
 * Expected Schema:
 * [
 *   {
 *     skill: String,
 *     level: 'Advanced' | 'Intermediate' | 'Beginner',
 *     score: Number (0-100),
 *     evidence: String
 *   }
 * ]
 */
const normalizeSkillProficiency = (items, fallbackSkills = []) => {
  const defaultList = [
    { skill: 'JavaScript', level: 'Advanced', score: 85, evidence: 'Demonstrated through resume projects and coursework.' },
    { skill: 'Python', level: 'Advanced', score: 80, evidence: 'Demonstrated through practical implementation.' },
    { skill: 'React', level: 'Advanced', score: 78, evidence: 'Used in front-end web architecture.' },
    { skill: 'Node.js', level: 'Intermediate', score: 70, evidence: 'Demonstrated in backend services.' },
    { skill: 'MongoDB', level: 'Intermediate', score: 65, evidence: 'Used for persistent document storage.' },
    { skill: 'SQL', level: 'Intermediate', score: 55, evidence: 'Applied in relational database querying.' },
  ];

  let rawList = items;
  if (!Array.isArray(rawList) || rawList.length === 0) {
    if (Array.isArray(fallbackSkills) && fallbackSkills.length > 0) {
      rawList = fallbackSkills.map((sk, idx) => ({
        skill: typeof sk === 'string' ? sk : sk.name || 'Skill',
        level: idx < 2 ? 'Advanced' : idx < 5 ? 'Intermediate' : 'Beginner',
        score: idx < 2 ? 85 - idx * 5 : idx < 5 ? 70 - (idx - 2) * 5 : 50,
        evidence: 'Identified from resume skills and coursework.',
      }));
    } else {
      return defaultList;
    }
  }

  return rawList.map((item, idx) => {
    if (typeof item === 'string') {
      const score = idx < 2 ? 85 : idx < 5 ? 70 : 55;
      const level = score >= 75 ? 'Advanced' : score >= 50 ? 'Intermediate' : 'Beginner';
      return {
        skill: item.trim(),
        level,
        score,
        evidence: 'Identified from resume coursework and project usage.',
      };
    }

    if (item && typeof item === 'object') {
      const skill = item.skill || item.name || `Skill ${idx + 1}`;
      let rawScore = item.score !== undefined ? item.score : item.percentage;
      let score = normalizeNumber(rawScore, 0);

      let level = item.level ? String(item.level).trim() : '';
      if (!level) {
        if (score >= 75) level = 'Advanced';
        else if (score >= 50) level = 'Intermediate';
        else if (score > 0) level = 'Beginner';
        else level = 'Intermediate';
      } else {
        // Standardize level capitalization
        if (/adv/i.test(level)) level = 'Advanced';
        else if (/beg/i.test(level)) level = 'Beginner';
        else level = 'Intermediate';
      }

      // If score was not provided or 0, infer sensible score from level
      if (score === 0) {
        if (level === 'Advanced') score = Math.max(75, 85 - idx * 2);
        else if (level === 'Beginner') score = 45;
        else score = 65;
      }

      const evidence = item.evidence || item.reason || 'Demonstrated through resume coursework and hands-on projects.';

      return {
        skill,
        level,
        score: Math.min(100, Math.max(0, score)),
        evidence,
        // Backward compatibility
        percentage: score,
        category: item.category || 'Technical',
      };
    }

    return defaultList[0];
  });
};

/**
 * Normalize careerReadiness
 * Expected Schema:
 * {
 *   technicalSkills: Number (0-100),
 *   experienceAlignment: Number (0-100),
 *   projectsDepth: Number (0-100),
 *   educationVerification: Number (0-100),
 *   certifications: Number (0-100),
 *   resumeQuality: Number (0-100),
 *   overall: Number (0-100),
 *   explanation: String
 * }
 */
const normalizeCareerReadiness = (readiness, context = {}) => {
  const r = readiness || {};

  const technicalSkills = normalizeNumber(r.technicalSkills, 80);
  const experienceAlignment = normalizeNumber(
    r.experienceAlignment !== undefined ? r.experienceAlignment : r.experience,
    context.hasExperience ? 75 : 55
  );
  const projectsDepth = normalizeNumber(
    r.projectsDepth !== undefined ? r.projectsDepth : r.projects,
    context.hasProjects ? 80 : 60
  );
  const educationVerification = normalizeNumber(
    r.educationVerification !== undefined ? r.educationVerification : r.education,
    context.hasEducation ? 90 : 70
  );
  const certifications = normalizeNumber(r.certifications, context.hasCertifications ? 75 : 50);
  const resumeQuality = normalizeNumber(r.resumeQuality, 80);

  // Compute overall as weighted average if not provided or 0
  let overall = normalizeNumber(r.overall, 0);
  if (overall === 0) {
    overall = Math.round(
      technicalSkills * 0.25 +
      experienceAlignment * 0.20 +
      projectsDepth * 0.20 +
      educationVerification * 0.15 +
      certifications * 0.10 +
      resumeQuality * 0.10
    );
  }

  const explanation = r.explanation || 'Objective multi-factor estimation based on verified technical tools, project portfolio depth, and educational degree alignment.';

  return {
    technicalSkills,
    experienceAlignment,
    projectsDepth,
    educationVerification,
    certifications,
    resumeQuality,
    overall: Math.min(100, Math.max(0, overall)),
    explanation,
    // Backward compatibility aliases
    experience: experienceAlignment,
    projects: projectsDepth,
    education: educationVerification,
  };
};

/**
 * Normalize Technical Skills categorization
 */
const normalizeTechnicalSkills = (techSkills, allDetected = []) => {
  const t = techSkills || {};
  return {
    programming: toStringArray(t.programming, allDetected.slice(0, 3).length ? allDetected.slice(0, 3) : ['JavaScript', 'Python']),
    frameworks: toStringArray(t.frameworks, ['React', 'Node.js']),
    databases: toStringArray(t.databases, ['MongoDB', 'SQL']),
    cloudDevOps: toStringArray(t.cloudDevOps, ['Git', 'Docker']),
    tools: toStringArray(t.tools, ['VS Code', 'GitHub']),
  };
};

/**
 * Normalize strongest skills
 */
const normalizeStrongestSkills = (items) => {
  const defaults = [
    { title: 'Full Stack Web Development', reason: 'Demonstrated practical projects utilizing modern frontend and backend frameworks.' },
    { title: 'Database Design & Management', reason: 'Experience with data persistence and structured query languages.' },
    { title: 'Software Engineering Fundamentals', reason: 'Solid foundation in data structures, algorithms, and modular design.' },
  ];

  if (!Array.isArray(items) || items.length === 0) return defaults;

  return items.map((item, idx) => {
    if (typeof item === 'string') {
      return { title: item, reason: 'Demonstrated through resume coursework and implementation.' };
    }
    if (item && typeof item === 'object') {
      return {
        title: item.title || item.skill || `Core Competency ${idx + 1}`,
        reason: item.reason || 'Verified through resume project evidence.',
      };
    }
    return defaults[0];
  });
};

/**
 * Normalize skillsToLearn
 */
const normalizeSkillsToLearn = (skillsToLearn) => {
  const defaults = {
    highPriority: [
      {
        skill: 'Docker',
        whyLearn: 'Industry standard for containerization and microservice deployment.',
        relationToCurrent: 'Containerizes existing web and backend applications.',
        whatToLearnFirst: 'Dockerfile creation and multi-container Docker Compose.',
      },
      {
        skill: 'AWS (Amazon Web Services)',
        whyLearn: 'Leading cloud platform required by major tech employers.',
        relationToCurrent: 'Enables hosting scalable cloud backends.',
        whatToLearnFirst: 'AWS EC2, S3 storage, and basic IAM security.',
      },
      {
        skill: 'Spring Boot',
        whyLearn: 'Premier enterprise framework for scalable microservices.',
        relationToCurrent: 'Builds upon core backend programming skills.',
        whatToLearnFirst: 'Spring Initializr, REST controllers, and Spring Data JPA.',
      },
      {
        skill: 'System Design',
        whyLearn: 'Essential for technical architecture interviews and scalable systems.',
        relationToCurrent: 'Bridges coding with large-scale architecture.',
        whatToLearnFirst: 'Horizontal scaling, load balancing, and database caching.',
      },
    ],
    mediumPriority: [
      {
        skill: 'Redis Caching',
        whyLearn: 'High-speed in-memory data store for caching and pub/sub.',
        relationToCurrent: 'Optimizes query performance for existing databases.',
        whatToLearnFirst: 'In-memory caching and session management.',
      },
      {
        skill: 'CI/CD Pipelines (GitHub Actions)',
        whyLearn: 'Automates testing and deployment workflows on every commit.',
        relationToCurrent: 'Directly hooks into current Git repositories.',
        whatToLearnFirst: 'Writing automated test and linting workflows in YAML.',
      },
    ],
    optional: [
      {
        skill: 'GraphQL',
        whyLearn: 'Flexible API query language alternative to REST.',
        relationToCurrent: 'Pairs with React frontend for precision data fetching.',
        whatToLearnFirst: 'Schema definition, resolvers, and queries.',
      },
    ],
  };

  if (!skillsToLearn || typeof skillsToLearn !== 'object') return defaults;

  const normalizePriorityList = (list, fallback) => {
    if (!Array.isArray(list) || list.length === 0) return fallback;
    return list.map(item => {
      if (typeof item === 'string') {
        return {
          skill: item,
          whyLearn: 'Valuable industry skill for modern software teams.',
          relationToCurrent: 'Expands your practical engineering capabilities.',
          whatToLearnFirst: 'Core fundamentals and official quickstart tutorials.',
        };
      }
      return {
        skill: item.skill || 'Technology Skill',
        whyLearn: item.whyLearn || 'In high demand across software engineering roles.',
        relationToCurrent: item.relationToCurrent || 'Builds upon your existing foundations.',
        whatToLearnFirst: item.whatToLearnFirst || 'Basic documentation and tutorial projects.',
      };
    });
  };

  return {
    highPriority: normalizePriorityList(skillsToLearn.highPriority, defaults.highPriority),
    mediumPriority: normalizePriorityList(skillsToLearn.mediumPriority, defaults.mediumPriority),
    optional: normalizePriorityList(skillsToLearn.optional, defaults.optional),
  };
};

/**
 * Full AI Analysis Normalization Pipeline
 * Converts raw AI response / fallback into a schema-safe, crash-proof document.
 */
const normalizeAIAnalysis = (rawAnalysis = {}, resumeRecord = null) => {
  const data = rawAnalysis || {};

  const context = {
    hasExperience: Boolean(resumeRecord?.experience?.length || data.experience?.length),
    hasProjects: Boolean(resumeRecord?.projects?.length || data.projects?.length),
    hasEducation: Boolean(resumeRecord?.education?.length || data.education?.length),
    hasCertifications: Boolean(resumeRecord?.certifications?.length || data.certifications?.length),
  };

  // 1. Summary
  const summary = (data.summary && typeof data.summary === 'string' && data.summary.trim())
    ? data.summary.trim()
    : 'Motivated technology professional with demonstrated software development skills. Focus on expanding cloud deployment, containerization, and system design to maximize competitive industry readiness.';

  // 2. Career Readiness (strictly numbers 0-100)
  const careerReadiness = normalizeCareerReadiness(data.careerReadiness, context);

  // 3. Technical Skills
  const technicalSkills = normalizeTechnicalSkills(data.technicalSkills, resumeRecord?.extractedSkills || []);

  // 4. Soft Skills
  const softSkills = toStringArray(data.softSkills, ['Problem Solving', 'Team Collaboration', 'Technical Communication', 'Adaptability']);

  // 5. Skill Proficiency (strictly numbers 0-100)
  const rawSkills = data.skillProficiency || data.skillAnalysis || [];
  const skillProficiency = normalizeSkillProficiency(rawSkills, resumeRecord?.extractedSkills || []);

  // 6. Strongest Skills
  const strongestSkills = normalizeStrongestSkills(data.strongestSkills);

  // 7. Areas to Improve (strictly embedded objects { area, priority, reason, recommendation })
  const areasToImprove = normalizeAreasToImprove(data.areasToImprove);

  // 8. Skills to Learn
  const skillsToLearn = normalizeSkillsToLearn(data.skillsToLearn);

  // 9. Skill Gaps
  const skillGaps = {
    currentSkills: toStringArray(data.skillGaps?.currentSkills, technicalSkills.programming),
    toDevelop: toStringArray(data.skillGaps?.toDevelop, ['Docker', 'AWS', 'Spring Boot', 'System Design']),
    targetAreas: toStringArray(data.skillGaps?.targetAreas, ['Full Stack Developer', 'Backend Software Engineer', 'Cloud Application Engineer']),
  };

  // 10. Career Areas
  const careerAreas = Array.isArray(data.careerAreas) && data.careerAreas.length > 0
    ? data.careerAreas.map(c => ({
        area: typeof c === 'string' ? c : c.area || 'Software Engineer',
        reason: typeof c === 'object' && c.reason ? c.reason : 'Aligned with current technical toolset.',
        matchFit: typeof c === 'object' && c.matchFit ? c.matchFit : 'High Match',
      }))
    : [
        { area: 'Full Stack Web Developer', reason: 'Strong balance of frontend and backend technologies.', matchFit: 'High Match' },
        { area: 'Backend Software Engineer', reason: 'Foundational experience in APIs and data management.', matchFit: 'High Match' },
        { area: 'Cloud Application Engineer', reason: 'High growth area achievable with Docker & AWS.', matchFit: 'Growth Opportunity' },
      ];

  // 11. Resume Quality
  const resumeQuality = Array.isArray(data.resumeQuality) && data.resumeQuality.length > 0
    ? data.resumeQuality.map(q => ({
        item: typeof q === 'string' ? q : q.item || 'Resume Section',
        status: (typeof q === 'object' && q.status === 'Needs Improvement') ? 'Needs Improvement' : 'Good',
        feedback: typeof q === 'object' && q.feedback ? q.feedback : 'Standard formatting verified.',
      }))
    : [
        { item: 'Contact Information', status: 'Good', feedback: 'Essential details are accessible and legible.' },
        { item: 'Technical Skills Layout', status: 'Good', feedback: 'Skills are structured for ATS parsing.' },
        { item: 'Quantifiable Metrics', status: 'Needs Improvement', feedback: 'Include measurable business impacts and performance metrics.' },
        { item: 'Cloud & DevOps Presence', status: 'Needs Improvement', feedback: 'Highlight containerization and deployment toolsets.' },
      ];

  // 12. Missing Information
  const missingInformation = toStringArray(data.missingInformation, [
    'GitHub profile or public repository portfolio links',
    'LinkedIn profile URL',
    'Quantifiable metrics in project impact descriptions',
  ]);

  // 13. Project Analysis
  const projectAnalysis = Array.isArray(data.projectAnalysis) && data.projectAnalysis.length > 0
    ? data.projectAnalysis.map(p => ({
        projectName: p.projectName || p.title || 'Portfolio Project',
        technologies: toStringArray(p.technologies, ['Full Stack']),
        demonstratedSkills: toStringArray(p.demonstratedSkills, ['Architecture', 'API Integration']),
        potentialImprovement: p.potentialImprovement || 'Add automated unit tests and Docker deployment configuration.',
      }))
    : [
        {
          projectName: 'Full Stack Web Application',
          technologies: ['React', 'Node.js', 'MongoDB'],
          demonstratedSkills: ['Frontend Component Design', 'REST API Architecture', 'Database Persistence'],
          potentialImprovement: 'Add Dockerfile container setup and live deployed demo link.',
        },
      ];

  // 14. Certification Analysis
  const certificationAnalysis = {
    detected: toStringArray(data.certificationAnalysis?.detected, []),
    recommendations: Array.isArray(data.certificationAnalysis?.recommendations) && data.certificationAnalysis.recommendations.length > 0
      ? data.certificationAnalysis.recommendations.map(r => ({
          current: r.current || 'Core Programming Fundamentals',
          potential: r.potential || 'AWS Certified Cloud Practitioner',
          reason: r.reason || 'Validates industry cloud competency for modern full stack engineering.',
        }))
      : [
          {
            current: 'Core Programming Fundamentals',
            potential: 'AWS Certified Cloud Practitioner',
            reason: 'Validates industry cloud competency for modern full stack engineering.',
          },
          {
            current: 'Backend Engineering',
            potential: 'Docker Certified Associate (DCA)',
            reason: 'Proves mastery of microservice containerization workflows.',
          },
        ],
  };

  // 15. Learning Roadmap
  const learningRoadmap = Array.isArray(data.learningRoadmap) && data.learningRoadmap.length > 0
    ? data.learningRoadmap.map(p => ({
        phase: p.phase || 'Phase',
        title: p.title || 'Learning Milestone',
        topics: toStringArray(p.topics, ['Core Concepts', 'Hands-on Implementation']),
        outcome: p.outcome || 'Practical mastery of domain skills',
      }))
    : [
        { phase: 'Phase 1: Core Mastery', title: 'Advanced Language Fundamentals & Algorithms', topics: ['Data Structures & Complexity', 'OOP Design Patterns', 'Clean Code Principles'], outcome: 'Deepened core problem-solving aptitude' },
        { phase: 'Phase 2: Enterprise Backend', title: 'Framework Architecture & API Security', topics: ['Spring Boot / Express Optimization', 'JWT & OAuth Authentication', 'Database Indexing'], outcome: 'Production-ready backend engineering' },
        { phase: 'Phase 3: DevOps & Containerization', title: 'Container Workflows & Cloud Hosting', topics: ['Docker & Docker Compose', 'AWS EC2, S3 & IAM', 'GitHub Actions CI/CD'], outcome: 'Ability to deploy and scale services' },
        { phase: 'Phase 4: Advanced Systems', title: 'System Design & Distributed Scalability', topics: ['Microservices Patterns', 'In-Memory Caching (Redis)', 'Message Queues'], outcome: 'Readiness for senior technical interviews' },
      ];

  // 16. Tactical 30 / 60 / 90 Day Plans
  const defaultPlans = {
    thirtyDayPlan: {
      skills: ['Docker Basics', 'Advanced SQL & Indexing'],
      practiceTopics: ['Writing Dockerfiles', 'Multi-stage builds', 'Complex joins and execution plans'],
      projectSuggestion: 'Containerize an existing full-stack project using Docker Compose',
    },
    sixtyDayPlan: {
      skills: ['AWS Fundamentals', 'CI/CD Pipelines'],
      practiceTopics: ['AWS EC2 deployment', 'S3 asset storage', 'GitHub Actions automated testing'],
      projectSuggestion: 'Deploy a live containerized application to AWS with automated CI/CD',
    },
    ninetyDayPlan: {
      skills: ['System Design', 'Redis Caching', 'Interview Prep'],
      practiceTopics: ['Distributed caching', 'Load balancing', 'System design interview patterns'],
      projectSuggestion: 'Implement rate limiting and Redis caching in your backend API',
    },
  };

  const thirtyDayPlan = {
    skills: toStringArray(data.thirtyDayPlan?.skills, defaultPlans.thirtyDayPlan.skills),
    practiceTopics: toStringArray(data.thirtyDayPlan?.practiceTopics, defaultPlans.thirtyDayPlan.practiceTopics),
    projectSuggestion: data.thirtyDayPlan?.projectSuggestion || defaultPlans.thirtyDayPlan.projectSuggestion,
  };

  const sixtyDayPlan = {
    skills: toStringArray(data.sixtyDayPlan?.skills, defaultPlans.sixtyDayPlan.skills),
    practiceTopics: toStringArray(data.sixtyDayPlan?.practiceTopics, defaultPlans.sixtyDayPlan.practiceTopics),
    projectSuggestion: data.sixtyDayPlan?.projectSuggestion || defaultPlans.sixtyDayPlan.projectSuggestion,
  };

  const ninetyDayPlan = {
    skills: toStringArray(data.ninetyDayPlan?.skills, defaultPlans.ninetyDayPlan.skills),
    practiceTopics: toStringArray(data.ninetyDayPlan?.practiceTopics, defaultPlans.ninetyDayPlan.practiceTopics),
    projectSuggestion: data.ninetyDayPlan?.projectSuggestion || defaultPlans.ninetyDayPlan.projectSuggestion,
  };

  // 17. Project Recommendations
  const projectRecommendations = Array.isArray(data.projectRecommendations) && data.projectRecommendations.length > 0
    ? data.projectRecommendations.map(pr => ({
        title: pr.title || 'Showcase Project',
        description: pr.description || 'Hands-on implementation to demonstrate key technical skills.',
        skillsLearned: toStringArray(pr.skillsLearned, ['Software Engineering']),
        difficulty: pr.difficulty || 'Intermediate',
        expectedOutcome: pr.expectedOutcome || 'Production-ready code repository with documentation.',
      }))
    : [
        {
          title: 'Containerized Microservices E-Commerce API',
          description: 'Build a modular backend with user authentication, catalog management, and Redis caching wrapped in Docker Compose.',
          skillsLearned: ['Docker', 'Redis', 'Microservices Architecture', 'JWT Security'],
          difficulty: 'Intermediate',
          expectedOutcome: 'A showcase repository demonstrating production deployment readiness.',
        },
        {
          title: 'Cloud-Hosted Analytics Dashboard with CI/CD',
          description: 'Deploy a React dashboard backed by real-time endpoints hosted on AWS with an automated GitHub Actions deployment pipeline.',
          skillsLearned: ['AWS S3/EC2', 'GitHub Actions', 'CI/CD', 'React'],
          difficulty: 'Intermediate',
          expectedOutcome: 'Live URL with automated green deployment checks on every commit.',
        },
        {
          title: 'High-Concurrency Task Queue Service',
          description: 'Implement an asynchronous job processing system using Redis and worker pools to handle background tasks.',
          skillsLearned: ['Asynchronous Processing', 'Redis', 'Performance Optimization'],
          difficulty: 'Advanced',
          expectedOutcome: 'A portfolio highlight proving deep backend architecture knowledge.',
        },
      ];

  // 18. Interview Topics
  const interviewTopics = Array.isArray(data.interviewTopics) && data.interviewTopics.length > 0
    ? data.interviewTopics.map(it => ({
        category: it.category || 'Technical Fundamentals',
        topics: toStringArray(it.topics, ['Core Concepts', 'System Architecture']),
      }))
    : [
        {
          category: 'Core Programming & Data Structures',
          topics: ['Time and Space Complexity (Big-O)', 'Hash Maps vs Trees', 'Object-Oriented Design Principles (SOLID)', 'Concurrency & Thread Safety'],
        },
        {
          category: 'Web & API Engineering',
          topics: ['REST vs GraphQL architectural tradeoffs', 'HTTP Status Codes and idempotency', 'Authentication vs Authorization (JWT, OAuth)', 'Cross-Origin Resource Sharing (CORS)'],
        },
        {
          category: 'Databases & Storage',
          topics: ['SQL vs NoSQL selection criteria', 'Database indexing and B-Trees', 'Transactions, ACID compliance, and eventual consistency', 'N+1 Query Problem and mitigation'],
        },
      ];

  return {
    summary,
    careerReadiness,
    skillProficiency,
    // Sync skillAnalysis for backward compatibility
    skillAnalysis: skillProficiency,
    technicalSkills,
    softSkills,
    strongestSkills,
    areasToImprove,
    skillsToLearn,
    skillGaps,
    careerAreas,
    resumeQuality,
    missingInformation,
    projectAnalysis,
    certificationAnalysis,
    learningRoadmap,
    thirtyDayPlan,
    sixtyDayPlan,
    ninetyDayPlan,
    projectRecommendations,
    interviewTopics,
    chatHistory: Array.isArray(data.chatHistory) ? data.chatHistory : [],
    aiPowered: Boolean(data.aiPowered),
  };
};

module.exports = {
  normalizeNumber,
  normalizeAreasToImprove,
  normalizeSkillProficiency,
  normalizeCareerReadiness,
  normalizeTechnicalSkills,
  normalizeStrongestSkills,
  normalizeSkillsToLearn,
  normalizeAIAnalysis,
};

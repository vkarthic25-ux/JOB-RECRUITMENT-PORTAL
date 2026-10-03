// Configurable scoring weights
const DEFAULT_WEIGHTS = {
  skills: 0.50,
  experience: 0.20,
  education: 0.15,
  roleRelevance: 0.15,
};

// Skill aliases and synonyms
const SKILL_ALIASES = {
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'node': 'node.js',
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'express': 'express.js',
  'express.js': 'express.js',
  'vue': 'vue.js',
  'vuejs': 'vue.js',
  'vue.js': 'vue.js',
  'js': 'javascript',
  'javascript': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',
  'py': 'python',
  'python': 'python',
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'aws': 'aws',
  'amazon web services': 'aws',
  'gcp': 'google cloud platform',
  'google cloud': 'google cloud platform',
  'google cloud platform': 'google cloud platform',
  'k8s': 'kubernetes',
  'kubernetes': 'kubernetes',
  'docker': 'docker',
  'golang': 'go',
  'go': 'go',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',
  'machine learning': 'machine learning',
  'ml': 'machine learning',
  'deep learning': 'deep learning',
  'dl': 'deep learning',
  'nlp': 'nlp',
  'spring': 'spring boot',
  'spring boot': 'spring boot',
  'springboot': 'spring boot',
  'tailwind': 'tailwind css',
  'tailwindcss': 'tailwind css',
  'rest': 'rest api',
  'restful': 'rest api',
  'rest api': 'rest api',
};

const normalizeSkill = (skill = '') => {
  const clean = skill.toLowerCase().trim().replace(/[\s\-_]+/g, ' ');
  return SKILL_ALIASES[clean] || clean;
};

/**
 * Calculate explainable job match between candidate data and job requirements
 */
const calculateJobMatch = (candidateData = {}, jobData = {}, customWeights = {}) => {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  // 1. SKILL MATCH (50%)
  const candidateSkills = Array.isArray(candidateData.skills)
    ? candidateData.skills
    : [];
  const normalizedCandidateSkills = new Set(candidateSkills.map(normalizeSkill));

  const requiredSkills = Array.isArray(jobData.requiredSkills)
    ? jobData.requiredSkills
    : [];
  const preferredSkills = Array.isArray(jobData.preferredSkills)
    ? jobData.preferredSkills
    : [];

  const matchedRequired = [];
  const missingRequired = [];

  requiredSkills.forEach(req => {
    const norm = normalizeSkill(req);
    if (normalizedCandidateSkills.has(norm)) {
      matchedRequired.push(req);
    } else {
      missingRequired.push(req);
    }
  });

  const matchedPreferred = [];
  preferredSkills.forEach(pref => {
    const norm = normalizeSkill(pref);
    if (normalizedCandidateSkills.has(norm)) {
      matchedPreferred.push(pref);
    }
  });

  const totalRequired = Math.max(requiredSkills.length, 1);
  const baseSkillScore = (matchedRequired.length / totalRequired) * 100;
  // Small bonus for preferred skills up to 10 points
  const preferredBonus = preferredSkills.length > 0
    ? (matchedPreferred.length / preferredSkills.length) * 10
    : 0;
  const skillMatch = Math.min(100, Math.round(baseSkillScore + preferredBonus));

  // 2. EXPERIENCE MATCH (20%)
  let candidateYears = 0;
  if (Array.isArray(candidateData.experience)) {
    candidateYears = candidateData.experience.reduce((acc, exp) => acc + (exp.years || 1), 0);
  } else if (typeof candidateData.experienceYears === 'number') {
    candidateYears = candidateData.experienceYears;
  }

  const requiredYears = jobData.experienceRequired || 0;
  let experienceMatch = 100;
  if (requiredYears > 0) {
    if (candidateYears >= requiredYears) {
      experienceMatch = 100;
    } else {
      experienceMatch = Math.round((candidateYears / requiredYears) * 100);
    }
  }

  // 3. EDUCATION MATCH (15%)
  let educationMatch = 80; // Baseline
  const candidateEducation = Array.isArray(candidateData.education)
    ? candidateData.education
    : [];
  const qualReq = (jobData.qualification || '').toLowerCase();

  const hasMaster = candidateEducation.some(e => /master|m\.?tech|m\.?s|m\.?c\.?a|m\.?e|mba/i.test(e.degree || ''));
  const hasBachelor = candidateEducation.some(e => /bachelor|b\.?tech|b\.?e|b\.?sc|b\.?s|bca/i.test(e.degree || ''));

  if (qualReq.includes('master') || qualReq.includes('phd')) {
    if (hasMaster) educationMatch = 100;
    else if (hasBachelor) educationMatch = 75;
    else educationMatch = 50;
  } else if (qualReq.includes('bachelor') || qualReq.includes('degree')) {
    if (hasMaster || hasBachelor) educationMatch = 100;
    else educationMatch = 60;
  } else {
    educationMatch = 100;
  }

  // 4. ROLE RELEVANCE (15%)
  let roleMatch = 60;
  const jobTitle = (jobData.title || '').toLowerCase();
  const headline = (candidateData.headline || '').toLowerCase();
  const preferredRoles = (candidateData.preferredJobRoles || []).map(r => r.toLowerCase());
  const expTitles = (candidateData.experience || []).map(e => (e.title || '').toLowerCase()).join(' ');

  const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 2);
  let matchedWords = 0;
  titleWords.forEach(word => {
    if (headline.includes(word) || expTitles.includes(word) || preferredRoles.some(r => r.includes(word))) {
      matchedWords++;
    }
  });

  if (titleWords.length > 0) {
    roleMatch = Math.min(100, Math.round(50 + (matchedWords / titleWords.length) * 50));
  }

  // 5. OVERALL WEIGHTED MATCH
  const overallMatch = Math.round(
    skillMatch * weights.skills +
    experienceMatch * weights.experience +
    educationMatch * weights.education +
    roleMatch * weights.roleRelevance
  );

  return {
    overallMatch: Math.max(10, Math.min(100, overallMatch)),
    skillMatch,
    experienceMatch,
    educationMatch,
    roleMatch,
    matchedSkills: Array.from(new Set([...matchedRequired, ...matchedPreferred])),
    missingSkills: missingRequired,
    weights,
  };
};

module.exports = {
  calculateJobMatch,
  normalizeSkill,
  DEFAULT_WEIGHTS,
};

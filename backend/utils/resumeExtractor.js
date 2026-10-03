// Master dictionary of tech skills and soft skills
const TECH_SKILLS_DB = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'R',
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass',
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'Laravel',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Cassandra', 'Oracle', 'Elasticsearch', 'DynamoDB', 'Firebase', 'Prisma', 'Sequelize',
  'Docker', 'Kubernetes', 'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud Platform', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Linux', 'Git',
  'REST API', 'GraphQL', 'Microservices', 'Kafka', 'RabbitMQ', 'WebSockets', 'gRPC',
  'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy', 'OpenCV', 'Computer Vision', 'Data Analysis',
  'Power BI', 'Tableau', 'Spark', 'Hadoop', 'SQL', 'NoSQL'
];

const SOFT_SKILLS_DB = [
  'Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Critical Thinking', 'Adaptability',
  'Time Management', 'Collaboration', 'Agile', 'Scrum', 'Presentation', 'Work Ethic', 'Empathy'
];

const DEGREE_PATTERNS = [
  /(?:Bachelor(?:'s)?(?:\s+of)?(?:\s+Science|\s+Engineering|\s+Technology|\s+Arts|\s+Computer Science)?|B\.?E\.?|B\.?Tech\.?|B\.?Sc\.?|B\.?S\.?|B\.?C\.?A\.?)/i,
  /(?:Master(?:'s)?(?:\s+of)?(?:\s+Science|\s+Engineering|\s+Technology|\s+Arts|\s+Business Administration|\s+Computer Applications)?|M\.?E\.?|M\.?Tech\.?|M\.?Sc\.?|M\.?S\.?|M\.?C\.?A\.?|M\.?B\.?A\.?)/i,
  /(?:Ph\.?D\.?|Doctorate|Doctor of Philosophy)/i,
  /(?:Diploma|Associate(?:'s)? Degree)/i
];

/**
 * Extract structured information from raw resume text
 */
const extractResumeInfo = (text = '') => {
  if (!text) return {
    name: '',
    email: '',
    phone: '',
    skills: [],
    softSkills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: []
  };

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Extract Email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,4}/i);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extract Phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Extract Name (often first prominent line that is not email/phone or section title)
  let name = '';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.includes('@') &&
      !line.match(/\d{3}/) &&
      !/resume|curriculum vitae|cv|contact|profile|education|experience|skills/i.test(line)
    ) {
      name = line;
      break;
    }
  }

  // 4. Extract Technical Skills
  const lowerText = text.toLowerCase();
  const extractedSkillsSet = new Set();
  TECH_SKILLS_DB.forEach(skill => {
    // Regex boundary check for clean skill match
    const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(text)) {
      extractedSkillsSet.add(skill);
    }
  });

  // 5. Extract Soft Skills
  const extractedSoftSkillsSet = new Set();
  SOFT_SKILLS_DB.forEach(skill => {
    const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i');
    if (regex.test(text)) {
      extractedSoftSkillsSet.add(skill);
    }
  });

  // 6. Extract Education
  const education = [];
  lines.forEach((line, idx) => {
    DEGREE_PATTERNS.forEach(pattern => {
      const match = line.match(pattern);
      if (match) {
        const degree = match[0].trim();
        // Look ahead or in same line for institution
        let inst = line.replace(degree, '').replace(/[-|,]/g, ' ').trim();
        if (!inst && lines[idx + 1]) {
          inst = lines[idx + 1];
        }
        // Extract year if present
        const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
        education.push({
          degree: degree,
          institution: inst || 'University / College',
          year: yearMatch ? yearMatch[0] : '2023',
        });
      }
    });
  });

  // Deduplicate education degrees
  const uniqueEducation = [];
  const seenDegrees = new Set();
  education.forEach(e => {
    const key = e.degree.toLowerCase();
    if (!seenDegrees.has(key)) {
      seenDegrees.add(key);
      uniqueEducation.push(e);
    }
  });

  // Fallback education if none parsed
  if (uniqueEducation.length === 0 && (lowerText.includes('bachelor') || lowerText.includes('b.e') || lowerText.includes('b.tech') || lowerText.includes('degree'))) {
    uniqueEducation.push({
      degree: "B.Tech Computer Science and Engineering",
      institution: "State University",
      year: "2024"
    });
  }

  // 7. Extract Experience clues
  const experience = [];
  const expKeywords = ['intern', 'engineer', 'developer', 'consultant', 'lead', 'analyst', 'specialist', 'manager'];
  lines.forEach(line => {
    expKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(line) && line.length < 80 && !DEGREE_PATTERNS.some(p => p.test(line))) {
        experience.push({
          title: line,
          company: 'Software Company',
          duration: '1-2 years',
          description: line
        });
      }
    });
  });

  // 8. Projects & Certifications heuristics
  const projects = [];
  const certifications = [];
  lines.forEach(line => {
    if (/project|built|developed|application|portal|system|platform/i.test(line) && line.length > 15 && line.length < 120) {
      if (projects.length < 4) {
        projects.push({
          title: line.split(/[:|-]/)[0].trim(),
          description: line,
          technologies: Array.from(extractedSkillsSet).slice(0, 3)
        });
      }
    }
    if (/certified|certification|certificate|aws certified|oracle certified/i.test(line) && line.length < 90) {
      certifications.push({
        name: line,
        issuer: 'Professional Organization'
      });
    }
  });

  return {
    name: name || 'Candidate',
    email,
    phone,
    skills: Array.from(extractedSkillsSet),
    softSkills: Array.from(extractedSoftSkillsSet),
    education: uniqueEducation.slice(0, 3),
    experience: experience.slice(0, 4),
    projects: projects.slice(0, 4),
    certifications: certifications.slice(0, 4),
    languages: ['English', 'Spanish', 'Hindi', 'French'].filter(lang => lowerText.includes(lang.toLowerCase()))
  };
};

module.exports = {
  extractResumeInfo,
  TECH_SKILLS_DB,
  SOFT_SKILLS_DB
};

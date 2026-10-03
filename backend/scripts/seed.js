const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const RecruiterProfile = require('../models/RecruiterProfile');
const CandidateProfile = require('../models/CandidateProfile');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const Skill = require('../models/Skill');
const { calculateJobMatch } = require('../utils/scoringEngine');
const { checkEligibility } = require('../utils/eligibilityEngine');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_recruitment_portal';
    console.log(`[Seed] Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      RecruiterProfile.deleteMany({}),
      CandidateProfile.deleteMany({}),
      Resume.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      Skill.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Skills directory...');
    const skillsList = [
      { name: 'JavaScript', category: 'Frontend' },
      { name: 'TypeScript', category: 'Frontend' },
      { name: 'React', category: 'Frontend' },
      { name: 'Tailwind CSS', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'Express.js', category: 'Backend' },
      { name: 'Java', category: 'Backend' },
      { name: 'Spring Boot', category: 'Backend' },
      { name: 'Python', category: 'Backend' },
      { name: 'Django', category: 'Backend' },
      { name: 'FastAPI', category: 'Backend' },
      { name: 'MongoDB', category: 'Database' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'Redis', category: 'Database' },
      { name: 'Docker', category: 'Cloud & DevOps' },
      { name: 'Kubernetes', category: 'Cloud & DevOps' },
      { name: 'AWS', category: 'Cloud & DevOps' },
      { name: 'CI/CD', category: 'Cloud & DevOps' },
      { name: 'Machine Learning', category: 'AI & Data Science' },
      { name: 'PyTorch', category: 'AI & Data Science' },
      { name: 'TensorFlow', category: 'AI & Data Science' },
      { name: 'Communication', category: 'Soft Skills' },
      { name: 'Teamwork', category: 'Soft Skills' },
      { name: 'Problem Solving', category: 'Soft Skills' },
    ];
    await Skill.insertMany(skillsList);

    console.log('[Seed] Seeding Companies...');
    const companies = await Company.insertMany([
      {
        name: 'Apex Innovations Ltd',
        description: 'Global enterprise software engineering and cloud transformation leader with over 5,000 employees worldwide.',
        website: 'https://apex-innovations.io',
        industry: 'Cloud & Enterprise SaaS',
        location: 'San Francisco, CA',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop&q=80',
      },
      {
        name: 'Nexus AI Systems',
        description: 'Pioneering artificial intelligence and generative machine learning platforms for healthcare, finance, and robotics.',
        website: 'https://nexusai.tech',
        industry: 'Artificial Intelligence & ML',
        location: 'Boston, MA',
        logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&h=120&fit=crop&q=80',
      },
      {
        name: 'Quantex Financial Tech',
        description: 'Next-generation algorithmic trading, distributed payment gateways, and banking infrastructure.',
        website: 'https://quantexfin.com',
        industry: 'Financial Technology',
        location: 'New York, NY',
        logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop&q=80',
      },
    ]);

    const demoPassword = 'Password123!';

    console.log('[Seed] Seeding Admin...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: demoPassword,
      role: 'admin',
      phone: '+1 (555) 019-2831',
      location: 'New York, NY',
    });

    console.log('[Seed] Seeding Recruiters...');
    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@example.com',
      password: demoPassword,
      role: 'recruiter',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
    });
    await RecruiterProfile.create({
      userId: recruiter1._id,
      companyId: companies[0]._id,
      designation: 'Senior Talent Acquisition Lead',
    });

    const recruiter2 = await User.create({
      name: 'David Miller',
      email: 'recruiter2@example.com',
      password: demoPassword,
      role: 'recruiter',
      phone: '+1 (555) 345-6789',
      location: 'Boston, MA',
    });
    await RecruiterProfile.create({
      userId: recruiter2._id,
      companyId: companies[1]._id,
      designation: 'Technical Recruiter - AI & Data',
    });

    const recruiter3 = await User.create({
      name: 'Elena Rostova',
      email: 'recruiter3@example.com',
      password: demoPassword,
      role: 'recruiter',
      phone: '+1 (555) 456-7890',
      location: 'New York, NY',
    });
    await RecruiterProfile.create({
      userId: recruiter3._id,
      companyId: companies[2]._id,
      designation: 'VP of People & Culture',
    });

    console.log('[Seed] Seeding Candidates...');
    // Candidate 1: Demo Candidate
    const candidate1 = await User.create({
      name: 'Alex Morgan',
      email: 'candidate@example.com',
      password: demoPassword,
      role: 'candidate',
      phone: '+1 (555) 890-1234',
      location: 'San Jose, CA',
    });

    const resume1 = await Resume.create({
      candidateId: candidate1._id,
      fileName: 'Alex_Morgan_FullStack_Resume.pdf',
      filePath: '/uploads/sample-alex-morgan.pdf',
      fileType: 'pdf',
      fileSize: 145000,
      extractedText: `
ALEX MORGAN
San Jose, CA | alex@example.com | +1 (555) 890-1234
Full Stack Developer | React, Node.js, TypeScript & Cloud

SUMMARY
Results-oriented Full Stack Developer with 3+ years of experience designing and deploying scalable web applications. Proficient in modern JavaScript/TypeScript, React, Node.js, Express, MongoDB, and REST APIs. Demonstrated ability to deliver resilient microservices and cloud deployments.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks & Libraries: React, React.js, Express.js, Node.js, Tailwind CSS, Next.js
Databases: MongoDB, PostgreSQL, Redis
Cloud & Tools: Docker, AWS, Git, CI/CD, Jest, REST APIs

EXPERIENCE
Software Engineer | CloudSphere Inc. | 2022 - Present
- Architected responsive web dashboards with React and Tailwind CSS boosting user retention by 28%.
- Built high-throughput backend APIs using Node.js and Express handling 1M+ monthly requests.
- Integrated MongoDB aggregations and Redis caching to reduce database query latency by 45%.

Software Development Intern | Alpha Tech | 2021 - 2022
- Developed REST API endpoints in Node.js and contributed to front-end components in React.

EDUCATION
Bachelor of Science in Computer Science | California State University | 2018 - 2022

PROJECTS
- AI Recruitment Portal: Full-stack recruitment system with resume parsing and matching.
- E-Commerce Microservices: Scalable storefront with Stripe integration and Docker.
      `.trim(),
      extractedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'Tailwind CSS', 'SQL'],
      softSkills: ['Communication', 'Teamwork', 'Problem Solving', 'Adaptability'],
      education: [{ degree: 'Bachelor of Science in Computer Science', institution: 'California State University', year: '2022' }],
      experience: [
        { title: 'Software Engineer', company: 'CloudSphere Inc.', duration: '2+ years', description: 'Architected React & Node.js scalable web applications.' },
        { title: 'Software Development Intern', company: 'Alpha Tech', duration: '1 year', description: 'Developed REST APIs and React UI components.' },
      ],
      projects: [
        { title: 'AI Recruitment Portal', description: 'Full stack recruitment platform with resume scoring.', technologies: ['React', 'Node.js', 'MongoDB'] },
        { title: 'E-Commerce Platform', description: 'Distributed microservices architecture.', technologies: ['Node.js', 'Docker', 'PostgreSQL'] },
      ],
      certifications: [{ name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' }],
      languages: ['English', 'Spanish'],
    });

    await CandidateProfile.create({
      userId: candidate1._id,
      headline: 'Full Stack Engineer | React, Node.js, TypeScript & Cloud',
      bio: 'Enthusiastic full-stack engineer passionate about building high-performance web systems and AI applications.',
      education: [{ degree: 'Bachelor of Science in Computer Science', institution: 'California State University', startYear: '2018', endYear: '2022', grade: '3.8 GPA' }],
      experience: [{ title: 'Software Engineer', company: 'CloudSphere Inc.', location: 'San Jose, CA', startDate: '2022', endDate: 'Present', current: true, description: 'Built React and Node.js microservices.', years: 3 }],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'Tailwind CSS'],
      softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
      certifications: [{ name: 'AWS Certified Cloud Practitioner', issuer: 'AWS', issueDate: '2023', credentialUrl: 'https://aws.amazon.com' }],
      projects: [{ title: 'Job Recruitment Portal', description: 'AI-driven applicant evaluation platform', technologies: ['React', 'Node.js', 'MongoDB'], link: 'https://github.com/example/recruitment' }],
      languages: ['English', 'Spanish'],
      preferredJobRoles: ['Full Stack Developer', 'Software Developer', 'Backend Developer', 'Frontend Developer'],
      preferredLocations: ['San Francisco, CA', 'Remote', 'San Jose, CA'],
      resumeId: resume1._id,
      profileCompletion: 95,
    });

    // Candidates 2, 3, 4, 5
    const candidate2 = await User.create({
      name: 'Priya Sharma',
      email: 'candidate2@example.com',
      password: demoPassword,
      role: 'candidate',
      phone: '+1 (555) 789-0123',
      location: 'San Francisco, CA',
    });
    await CandidateProfile.create({
      userId: candidate2._id,
      headline: 'Frontend Engineer | React, Next.js & UI/UX Specialist',
      bio: 'Frontend specialist crafting pixel-perfect, accessible user interfaces.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3', 'REST API'],
      softSkills: ['Collaboration', 'Presentation', 'Creativity'],
      education: [{ degree: 'Bachelor of Engineering in Information Technology', institution: 'State Tech University', startYear: '2019', endYear: '2023' }],
      experience: [{ title: 'Frontend Developer', company: 'DesignCraft Studio', years: 2, description: 'Built client-facing web portals.' }],
      profileCompletion: 85,
    });

    const candidate3 = await User.create({
      name: 'Marcus Vance',
      email: 'candidate3@example.com',
      password: demoPassword,
      role: 'candidate',
      phone: '+1 (555) 678-9012',
      location: 'Austin, TX',
    });
    await CandidateProfile.create({
      userId: candidate3._id,
      headline: 'Backend & Cloud Engineer | Java, Spring Boot & AWS',
      bio: 'Enterprise backend developer focusing on high-volume financial microservices.',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'Kafka'],
      softSkills: ['Problem Solving', 'Leadership', 'Critical Thinking'],
      education: [{ degree: 'Master of Science in Software Engineering', institution: 'UT Austin', startYear: '2019', endYear: '2021' }],
      experience: [{ title: 'Senior Backend Developer', company: 'FinCore Systems', years: 4, description: 'Engineered high-frequency payment gateways.' }],
      profileCompletion: 90,
    });

    const candidate4 = await User.create({
      name: 'Aisha Patel',
      email: 'candidate4@example.com',
      password: demoPassword,
      role: 'candidate',
      phone: '+1 (555) 567-8901',
      location: 'Boston, MA',
    });
    await CandidateProfile.create({
      userId: candidate4._id,
      headline: 'Machine Learning Specialist & Data Scientist',
      bio: 'Specializing in computer vision, generative AI and predictive analytics.',
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Docker', 'SQL', 'FastAPI'],
      softSkills: ['Teamwork', 'Communication', 'Research'],
      education: [{ degree: 'Master of Science in Artificial Intelligence', institution: 'MIT', startYear: '2020', endYear: '2022' }],
      experience: [{ title: 'AI Research Engineer', company: 'NeuralPath Lab', years: 3, description: 'Trained large-scale neural network models.' }],
      profileCompletion: 92,
    });

    const candidate5 = await User.create({
      name: 'Liam O\'Connor',
      email: 'candidate5@example.com',
      password: demoPassword,
      role: 'candidate',
      phone: '+1 (555) 432-1098',
      location: 'Seattle, WA',
    });
    await CandidateProfile.create({
      userId: candidate5._id,
      headline: 'Junior DevOps & Cloud Associate',
      bio: 'Passionate about CI/CD pipelines, containerization, and infrastructure as code.',
      skills: ['Linux', 'Docker', 'AWS', 'Git', 'CI/CD', 'Python', 'Kubernetes'],
      softSkills: ['Agile', 'Adaptability', 'Time Management'],
      education: [{ degree: 'Bachelor of Science in Computer Engineering', institution: 'University of Washington', startYear: '2020', endYear: '2024' }],
      experience: [{ title: 'DevOps Intern', company: 'CloudWorks', years: 1, description: 'Automated test workflows with GitHub Actions.' }],
      profileCompletion: 80,
    });

    console.log('[Seed] Seeding 10 Realistic Jobs...');
    const jobs = await Job.insertMany([
      {
        recruiterId: recruiter1._id,
        companyId: companies[0]._id,
        title: 'Senior Full Stack Developer',
        department: 'Core Platform Engineering',
        description: 'Apex Innovations is looking for an experienced Full Stack Developer to lead our next-generation cloud analytics suite. You will architect resilient microservices and intuitive React applications.',
        responsibilities: [
          'Design and maintain scalable frontend architectures using React, TypeScript, and Tailwind CSS.',
          'Build secure RESTful microservices and data pipelines with Node.js, Express, and MongoDB.',
          'Collaborate with product designers and DevOps engineers to implement seamless CI/CD releases.',
          'Mentor junior developers and participate in code reviews to maintain high quality standards.',
        ],
        requiredSkills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'REST API'],
        preferredSkills: ['Docker', 'AWS', 'Tailwind CSS', 'Redis'],
        qualification: "Bachelor's Degree in Computer Science or equivalent field",
        experienceRequired: 3,
        location: 'San Francisco, CA',
        employmentType: 'Full-time',
        salaryRange: { min: 130000, max: 165000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter3._id,
        companyId: companies[2]._id,
        title: 'Java Developer - Financial Services',
        department: 'Fintech Core',
        description: 'Quantex Financial Tech is hiring a skilled Java Developer to build our ultra-low latency transaction clearing platform using Spring Boot and distributed caching.',
        responsibilities: [
          'Develop robust, thread-safe backend microservices using Java 17 and Spring Boot.',
          'Optimize complex relational database queries on PostgreSQL.',
          'Implement event streaming pipelines with Apache Kafka.',
          'Conduct comprehensive unit and integration testing.',
        ],
        requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'SQL'],
        preferredSkills: ['Kafka', 'Docker', 'Redis', 'AWS'],
        qualification: "Bachelor's or Master's Degree in Computer Science",
        experienceRequired: 3,
        location: 'New York, NY',
        employmentType: 'Full-time',
        salaryRange: { min: 140000, max: 180000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter2._id,
        companyId: companies[1]._id,
        title: 'Machine Learning Engineer',
        department: 'AI Research & Applications',
        description: 'Join Nexus AI Systems to build cutting-edge generative AI models and intelligent pipeline inference engines deployed across multi-cloud environments.',
        responsibilities: [
          'Design, train, and fine-tune deep learning models using PyTorch and TensorFlow.',
          'Create production REST APIs for real-time model inference using FastAPI and Docker.',
          'Analyze model accuracy, bias, and performance metrics.',
          'Collaborate with data engineers to curate training datasets.',
        ],
        requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Docker'],
        preferredSkills: ['Deep Learning', 'FastAPI', 'Kubernetes', 'AWS'],
        qualification: "Master's Degree in Artificial Intelligence or Computer Science",
        experienceRequired: 2,
        location: 'Boston, MA',
        employmentType: 'Full-time',
        salaryRange: { min: 150000, max: 195000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter1._id,
        companyId: companies[0]._id,
        title: 'Frontend Developer (UI/UX Focused)',
        department: 'Experience Engineering',
        description: 'We are seeking a creative and detail-oriented Frontend Developer to construct beautiful, responsive web applications using React, modern CSS, and state management.',
        responsibilities: [
          'Translate Figma prototypes into production-grade React components.',
          'Optimize web performance, Core Web Vitals, and accessibility (WCAG).',
          'Integrate client-side REST and GraphQL endpoints.',
        ],
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3'],
        preferredSkills: ['Next.js', 'REST API', 'Figma'],
        qualification: "Bachelor's Degree in Computer Science, Graphic Design, or related",
        experienceRequired: 2,
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: { min: 105000, max: 135000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter1._id,
        companyId: companies[0]._id,
        title: 'Cloud & DevOps Engineer',
        department: 'Infrastructure & SRE',
        description: 'Design and automate our multi-region AWS cloud infrastructure, Kubernetes clusters, and automated deployment pipelines.',
        responsibilities: [
          'Manage infrastructure as code using Terraform and CloudFormation.',
          'Configure Kubernetes clusters and auto-scaling pods.',
          'Build automated GitHub Actions CI/CD deployment pipelines.',
        ],
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        preferredSkills: ['Terraform', 'Python', 'Go'],
        qualification: "Bachelor's Degree in Engineering or equivalent experience",
        experienceRequired: 3,
        location: 'San Francisco, CA',
        employmentType: 'Full-time',
        salaryRange: { min: 135000, max: 170000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter2._id,
        companyId: companies[1]._id,
        title: 'Python Backend Developer',
        department: 'Platform Services',
        description: 'Develop high-performance asynchronous APIs, data ingestion pipelines, and background workers using Python, FastAPI, and PostgreSQL.',
        responsibilities: [
          'Build scalable web APIs with FastAPI and Django.',
          'Implement asynchronous task queues with Celery and Redis.',
          'Maintain data integrity in PostgreSQL schemas.',
        ],
        requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'REST API'],
        preferredSkills: ['Redis', 'Django', 'AWS', 'Kubernetes'],
        qualification: "Bachelor's Degree in Computer Science",
        experienceRequired: 2,
        location: 'Boston, MA',
        employmentType: 'Full-time',
        salaryRange: { min: 120000, max: 155000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter3._id,
        companyId: companies[2]._id,
        title: 'Data Analyst',
        department: 'Business Intelligence',
        description: 'Transform complex financial datasets into actionable intelligence dashboards and executive insights.',
        responsibilities: [
          'Write advanced SQL queries, window functions, and aggregations.',
          'Build interactive dashboards using Power BI and Tableau.',
          'Perform exploratory data analysis using Python and Pandas.',
        ],
        requiredSkills: ['SQL', 'Python', 'Data Analysis', 'Tableau', 'Power BI'],
        preferredSkills: ['PostgreSQL', 'Machine Learning'],
        qualification: "Bachelor's Degree in Mathematics, Statistics, or Computer Science",
        experienceRequired: 1,
        location: 'New York, NY',
        employmentType: 'Full-time',
        salaryRange: { min: 95000, max: 125000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter1._id,
        companyId: companies[0]._id,
        title: 'Software Developer - Intern / Graduate',
        department: 'Emerging Talent',
        description: 'Kickstart your software engineering career with hands-on mentorship, contributing to live production systems across our web and cloud stacks.',
        responsibilities: [
          'Assist senior engineers in developing web features and bug fixes.',
          'Write automated tests and document API endpoints.',
          'Learn modern cloud architecture and agile methodology.',
        ],
        requiredSkills: ['JavaScript', 'HTML5', 'CSS3', 'Python', 'Git'],
        preferredSkills: ['React', 'Node.js', 'SQL'],
        qualification: "Bachelor's in Computer Science or final year student",
        experienceRequired: 0,
        location: 'San Jose, CA',
        employmentType: 'Internship',
        salaryRange: { min: 65000, max: 85000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter3._id,
        companyId: companies[2]._id,
        title: 'Backend Developer (Node.js & Microservices)',
        department: 'Payment Gateway',
        description: 'Design and deploy mission-critical transaction processors with distributed database persistence and resilient message brokers.',
        responsibilities: [
          'Build distributed Node.js microservices with event-driven design.',
          'Ensure sub-millisecond response latency with Redis caching.',
          'Implement OAuth2 and JWT token security authentication.',
        ],
        requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'REST API'],
        preferredSkills: ['Docker', 'Kafka', 'Redis', 'TypeScript'],
        qualification: "Bachelor's Degree in Computer Science",
        experienceRequired: 2,
        location: 'New York, NY',
        employmentType: 'Full-time',
        salaryRange: { min: 125000, max: 160000, currency: 'USD' },
        status: 'active',
      },
      {
        recruiterId: recruiter2._id,
        companyId: companies[1]._id,
        title: 'DevOps & Site Reliability Engineer',
        department: 'Infrastructure',
        description: 'Ensure 99.99% uptime for AI compute clusters and distributed training environments.',
        responsibilities: [
          'Monitor cluster telemetry with Prometheus and Grafana.',
          'Automate container deployment with Kubernetes and Helm.',
          'Enforce strict security policies and cloud IAM access.',
        ],
        requiredSkills: ['Kubernetes', 'Docker', 'Linux', 'AWS', 'CI/CD'],
        preferredSkills: ['Python', 'Terraform', 'Prometheus'],
        qualification: "Bachelor's Degree in Computer Science or relevant discipline",
        experienceRequired: 3,
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: { min: 140000, max: 175000, currency: 'USD' },
        status: 'active',
      },
    ]);

    console.log('[Seed] Seeding Applications with explainable AI scores...');
    // Seed applications for candidate 1 (Alex Morgan)
    const cand1Data = {
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'Tailwind CSS'],
      education: [{ degree: 'Bachelor of Science in Computer Science', institution: 'California State University', year: '2022' }],
      experience: [{ title: 'Software Engineer', years: 3 }],
      headline: 'Full Stack Developer',
    };

    const appsToCreate = [
      // App 1: Alex -> Job 0 (Senior Full Stack Developer) - Shortlisted!
      {
        candidate: candidate1,
        job: jobs[0],
        status: 'Shortlisted',
        resume: resume1,
      },
      // App 2: Alex -> Job 3 (Frontend Developer) - Under Review
      {
        candidate: candidate1,
        job: jobs[3],
        status: 'Under Review',
        resume: resume1,
      },
      // App 3: Alex -> Job 8 (Backend Developer) - Interview Scheduled!
      {
        candidate: candidate1,
        job: jobs[8],
        status: 'Interview Scheduled',
        resume: resume1,
      },
      // App 4: Candidate 2 (Priya) -> Job 3 (Frontend Developer) - Shortlisted
      {
        candidate: candidate2,
        job: jobs[3],
        status: 'Shortlisted',
        resume: resume1,
      },
      // App 5: Candidate 2 (Priya) -> Job 0 (Senior Full Stack Developer) - Applied
      {
        candidate: candidate2,
        job: jobs[0],
        status: 'Applied',
        resume: resume1,
      },
      // App 6: Candidate 3 (Marcus) -> Job 1 (Java Developer) - Interview Scheduled
      {
        candidate: candidate3,
        job: jobs[1],
        status: 'Interview Scheduled',
        resume: resume1,
      },
      // App 7: Candidate 3 (Marcus) -> Job 4 (Cloud & DevOps) - Shortlisted
      {
        candidate: candidate3,
        job: jobs[4],
        status: 'Shortlisted',
        resume: resume1,
      },
      // App 8: Candidate 4 (Aisha) -> Job 2 (Machine Learning Engineer) - Selected!
      {
        candidate: candidate4,
        job: jobs[2],
        status: 'Selected',
        resume: resume1,
      },
      // App 9: Candidate 4 (Aisha) -> Job 5 (Python Backend Developer) - Under Review
      {
        candidate: candidate4,
        job: jobs[5],
        status: 'Under Review',
        resume: resume1,
      },
      // App 10: Candidate 5 (Liam) -> Job 4 (Cloud & DevOps) - Applied
      {
        candidate: candidate5,
        job: jobs[4],
        status: 'Applied',
        resume: resume1,
      },
      // App 11: Candidate 5 (Liam) -> Job 7 (Intern / Graduate) - Interview Scheduled
      {
        candidate: candidate5,
        job: jobs[7],
        status: 'Interview Scheduled',
        resume: resume1,
      },
      // App 12: Candidate 3 (Marcus) -> Job 0 (Senior Full Stack) - Rejected (Skill gap)
      {
        candidate: candidate3,
        job: jobs[0],
        status: 'Rejected',
        resume: resume1,
      },
    ];

    const createdApplications = [];
    for (const item of appsToCreate) {
      const match = calculateJobMatch(cand1Data, item.job);
      const elig = checkEligibility(cand1Data, item.job);

      const app = await Application.create({
        candidateId: item.candidate._id,
        jobId: item.job._id,
        resumeId: item.resume._id,
        matchPercentage: match.overallMatch,
        skillMatch: match.skillMatch,
        experienceMatch: match.experienceMatch,
        educationMatch: match.educationMatch,
        roleMatch: match.roleMatch,
        eligibilityStatus: elig.status,
        eligibilityReasons: elig.reasons,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        status: item.status,
        appliedAt: new Date(+new Date() - Math.floor(Math.random() * 10 + 1) * 24 * 60 * 60 * 1000),
      });
      createdApplications.push(app);
    }

    console.log('[Seed] Seeding 3 Interviews...');
    // Interview 1: Alex Morgan for Job 8 (Backend Developer)
    await Interview.create({
      applicationId: createdApplications[2]._id,
      candidateId: candidate1._id,
      recruiterId: recruiter3._id,
      jobId: jobs[8]._id,
      date: '2026-10-15',
      time: '11:00 AM PST',
      mode: 'Online',
      meetingLink: 'https://meet.google.com/xyz-recruitment-interview',
      location: 'Google Meet',
      notes: 'Technical round focusing on system design, Node.js event loop, and database query optimization.',
      status: 'Scheduled',
    });

    // Interview 2: Marcus Vance for Job 1 (Java Developer)
    await Interview.create({
      applicationId: createdApplications[5]._id,
      candidateId: candidate3._id,
      recruiterId: recruiter3._id,
      jobId: jobs[1]._id,
      date: '2026-10-18',
      time: '02:00 PM EST',
      mode: 'Online',
      meetingLink: 'https://meet.google.com/abc-quantex-interview',
      location: 'Google Meet',
      notes: 'Architecture discussion on microservices and transaction reliability.',
      status: 'Scheduled',
    });

    // Interview 3: Liam O\'Connor for Job 7 (Intern / Graduate)
    await Interview.create({
      applicationId: createdApplications[10]._id,
      candidateId: candidate5._id,
      recruiterId: recruiter1._id,
      jobId: jobs[7]._id,
      date: '2026-10-20',
      time: '10:30 AM PST',
      mode: 'Offline',
      meetingLink: '',
      location: 'Apex Innovations HQ - 450 Mission St, Suite 800, San Francisco',
      notes: 'Initial cultural and technical aptitude assessment with hiring manager.',
      status: 'Scheduled',
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.insertMany([
      {
        userId: candidate1._id,
        title: '📅 Interview Scheduled!',
        message: 'Your interview for Backend Developer (Node.js & Microservices) is confirmed for Oct 15, 2026 at 11:00 AM PST.',
        type: 'interview',
        link: '/candidate/interviews',
        read: false,
      },
      {
        userId: candidate1._id,
        title: '🎉 Application Shortlisted!',
        message: "You have been shortlisted for 'Senior Full Stack Developer' at Apex Innovations Ltd.",
        type: 'application',
        link: '/candidate/applications',
        read: false,
      },
      {
        userId: recruiter1._id,
        title: 'New Applicant Received',
        message: "Alex Morgan applied for 'Senior Full Stack Developer' with an 85% AI match score.",
        type: 'application',
        link: `/recruiter/jobs/${jobs[0]._id}/applicants`,
        read: false,
      },
    ]);

    console.log('[Seed] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('Candidate: candidate@example.com / Password123!');
    console.log('Recruiter: recruiter@example.com / Password123!');
    console.log('Admin:     admin@example.com / Password123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();

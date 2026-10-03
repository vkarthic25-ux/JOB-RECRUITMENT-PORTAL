// Curated database for skill gap recommendations and roadmaps
const SKILL_CURRICULUM_DB = {
  'spring boot': {
    importance: 'Critical',
    requiredLevel: 'Intermediate to Advanced',
    whyImportant: 'Core framework for enterprise Java backend microservices and RESTful services.',
    topics: ['Dependency Injection & IoC', 'Spring MVC & REST APIs', 'Spring Data JPA & Hibernate', 'Spring Security with JWT', 'Spring Cloud & Microservices'],
    suggestedProject: 'Build a secure multi-tier E-Commerce REST API with PostgreSQL and JWT authentication.'
  },
  'docker': {
    importance: 'Critical',
    requiredLevel: 'Intermediate',
    whyImportant: 'Industry standard for containerizing applications ensuring uniform dev-to-prod deployment.',
    topics: ['Docker Engine & Architecture', 'Writing Production Dockerfiles', 'Multi-stage builds & caching', 'Docker Compose multi-container networks', 'Volume persistence & security'],
    suggestedProject: 'Containerize a full-stack Node.js + React + Redis application with Docker Compose.'
  },
  'kubernetes': {
    importance: 'High',
    requiredLevel: 'Intermediate',
    whyImportant: 'Dominant container orchestration platform for managing scaling, failover, and deployment automation.',
    topics: ['Pods, Deployments & ReplicaSets', 'Cluster Services & Ingress routing', 'ConfigMaps and Secrets management', 'Persistent Volumes & Claims', 'Helm Charts packaging'],
    suggestedProject: 'Deploy and autoscale a containerized microservice application with zero-downtime rolling updates.'
  },
  'aws': {
    importance: 'Critical',
    requiredLevel: 'Intermediate',
    whyImportant: 'Market-leading cloud provider widely required for hosting, cloud storage, serverless, and CI/CD.',
    topics: ['IAM policies & Least Privilege Access', 'EC2 & VPC networking basics', 'S3 Object Storage & CDN (CloudFront)', 'AWS Lambda & API Gateway', 'RDS PostgreSQL database setup'],
    suggestedProject: 'Architect and deploy a serverless image processing pipeline using S3, Lambda, and DynamoDB.'
  },
  'react': {
    importance: 'Critical',
    requiredLevel: 'Advanced',
    whyImportant: 'Premier UI library for interactive, high-performance web applications and SaaS platforms.',
    topics: ['Functional Components & Hooks (useEffect, useMemo)', 'Custom Hooks & State Architecture', 'React Router v6 declarative routing', 'Context API & Redux Toolkit', 'Performance profiling & lazy loading'],
    suggestedProject: 'Build a real-time collaborative Kanban project management board with drag-and-drop.'
  },
  'node.js': {
    importance: 'Critical',
    requiredLevel: 'Intermediate',
    whyImportant: 'Asynchronous event-driven runtime powering high-concurrency microservices and APIs.',
    topics: ['Node.js Event Loop & Streams', 'Express.js middleware design pattern', 'Authentication & JWT authorization', 'Database ORM/ODM integration', 'Error handling & security best practices'],
    suggestedProject: 'Develop a scalable REST API with rate-limiting, centralized error logging, and Redis caching.'
  },
  'python': {
    importance: 'High',
    requiredLevel: 'Intermediate',
    whyImportant: 'Versatile language for backend services, automation, data engineering, and artificial intelligence.',
    topics: ['Object-Oriented Python & Type Hinting', 'FastAPI / Django REST Framework', 'Asyncio asynchronous programming', 'Data manipulation with Pandas', 'Unit testing with Pytest'],
    suggestedProject: 'Build a high-performance asynchronous API for real-time stock market data ingestion.'
  },
  'postgresql': {
    importance: 'High',
    requiredLevel: 'Intermediate',
    whyImportant: 'Reliable, powerful relational database with robust ACID compliance and JSON support.',
    topics: ['Relational Schema Design & Normalization', 'Complex Joins, Aggregations & Subqueries', 'Indexing strategies (B-tree, GIN)', 'Transactions & Isolation levels', 'Stored Procedures & JSONB functions'],
    suggestedProject: 'Design and benchmark an analytics schema with partitioned tables and optimized indexing.'
  },
  'mongodb': {
    importance: 'High',
    requiredLevel: 'Intermediate',
    whyImportant: 'Leading flexible document database for rapid development and scalable distributed data.',
    topics: ['Document schema modeling & validation', 'Mongoose ODM hooks & virtuals', 'Aggregation Framework pipelines', 'Compound & Multikey indexing', 'Replica sets & sharding concepts'],
    suggestedProject: 'Create a social feed platform with complex aggregation pipelines for user activity metrics.'
  },
  'typescript': {
    importance: 'High',
    requiredLevel: 'Intermediate',
    whyImportant: 'Adds static typing to JavaScript, reducing production bugs and enhancing developer tooling.',
    topics: ['Interfaces, Types & Generics', 'Utility types (Partial, Pick, Omit)', 'Type Narrowing & Discriminated Unions', 'tsconfig compiler options', 'TypeScript with React and Express'],
    suggestedProject: 'Refactor a JavaScript microservice to strict TypeScript with 100% type coverage.'
  },
  'machine learning': {
    importance: 'Critical',
    requiredLevel: 'Intermediate',
    whyImportant: 'Powers intelligent predictive modeling, automated insights, and AI applications.',
    topics: ['Supervised vs Unsupervised Algorithms', 'Feature Engineering & Cross-validation', 'Scikit-Learn pipelines', 'Hyperparameter tuning with Optuna', 'Model serving via REST APIs'],
    suggestedProject: 'Train and deploy a customer churn prediction model with real-time inference endpoint.'
  },
  'ci/cd': {
    importance: 'High',
    requiredLevel: 'Intermediate',
    whyImportant: 'Automates testing, linting, building, and deploying software securely and continuously.',
    topics: ['GitHub Actions workflow syntax', 'Automated unit & integration test runners', 'Docker image builds & pushing to registry', 'Secrets management in pipelines', 'Staging vs Production deployment gates'],
    suggestedProject: 'Build a complete GitHub Actions CI/CD pipeline that builds, tests, and deploys to cloud.'
  }
};

/**
 * Generate structured skill gap analysis and step-by-step learning roadmap
 */
const generateSkillGapAndRoadmap = (currentSkills = [], missingSkills = [], targetJobTitle = 'Target Role') => {
  const roadmap = [];
  const skillGaps = [];

  missingSkills.forEach((skill, index) => {
    const key = skill.toLowerCase().trim();
    const curated = SKILL_CURRICULUM_DB[key] || {
      importance: index < 2 ? 'Critical' : 'High',
      requiredLevel: 'Intermediate',
      whyImportant: `Essential technology required to excel in the ${targetJobTitle} position.`,
      topics: [
        `${skill} core fundamentals and syntax`,
        `Modern architecture and best practices for ${skill}`,
        `Integration with database and API layers`,
        `Testing, debugging, and deployment strategies`,
      ],
      suggestedProject: `Build an end-to-end prototype utilizing ${skill} following industry design patterns.`
    };

    skillGaps.push({
      skill,
      importance: curated.importance,
      currentLevel: 'Beginner / Not Demonstrated',
      requiredLevel: curated.requiredLevel,
      whyImportant: curated.whyImportant,
      topics: curated.topics,
      suggestedProject: curated.suggestedProject
    });

    roadmap.push({
      step: index + 1,
      skill,
      importance: curated.importance,
      requiredLevel: curated.requiredLevel,
      topics: curated.topics,
      suggestedProject: curated.suggestedProject,
      completed: false
    });
  });

  return {
    skillGaps,
    roadmap,
  };
};

module.exports = {
  generateSkillGapAndRoadmap,
  SKILL_CURRICULUM_DB,
};

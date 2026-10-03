# AI-Powered Job Recruitment Portal with Resume Matching, Eligibility Checking and Skill Gap Analysis

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20TailwindCSS%20%2B%20Vite-indigo.svg)](https://github.com)
[![Architecture](https://img.shields.io/badge/Architecture-OOSE%20Layered%20Design-emerald.svg)](https://github.com)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%20%2B%20Deterministic%20Fallback-amber.svg)](https://github.com)

An enterprise-grade, full-stack **Object-Oriented Software Engineering (OOSE) Capstone Project** that connects job candidates with hiring companies through explainable AI-powered resume parsing, dynamic job matching, rule-based eligibility verification, skill gap analysis, and automated personalized learning roadmaps.

---

## 1. Project Overview & Objective

### 1.1 Problem Statement
Traditional applicant tracking systems (ATS) often rely on crude keyword matches or opaque algorithms that discard qualified candidates, fail to explain rejection criteria, and provide zero constructive guidance to job seekers on how to bridge their technical skill deficits. Simultaneously, recruiters are inundated with unqualified applications without objective, explainable scoring criteria.

### 1.2 Proposed Solution
**TalentAI** provides a transparent, dual-sided talent acquisition platform:
- **For Candidates:** Automatic multi-format (PDF/DOCX) resume extraction, 4-tier explainable match scoring (50% Skills, 20% Experience, 15% Education, 15% Role Fit), eligibility reasoning checklists, personalized skill gap breakdowns, and step-by-step learning roadmaps with progress tracking.
- **For Recruiters:** Requisition management, applicant pool screening with AI decision support (including mandatory non-discriminatory human-in-the-loop disclaimers), multi-criteria candidate filtering, and real-time interview scheduling.
- **For Administrators:** Master platform governance, candidate/recruiter account moderation with instant toggle actions, enterprise company auditing, and recruitment funnel analytics.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js (v20+), Express.js, RESTful Architecture, CORS, Multer |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js password hashing, Role-based Access Control (RBAC) |
| **File Processing** | `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction), Multer memory/disk storage |
| **AI & NLP** | Google Gemini API (`@google/generative-ai`) with 100% offline-resilient deterministic fallback matching engine |

---

## 3. OOSE Architectural Design

The application is structured strictly according to **Object-Oriented Software Engineering (OOSE)** principles:
1. **Presentation Layer (Frontend):** Pure presentation and state coordination decoupled from database queries via Axios API clients, context providers (`AuthContext`, `ToastContext`), and reusable UI components.
2. **Business Logic Layer (Controllers & Middleware):** Domain logic, role authorization guards (`protect`, `authorize`), and transaction validation.
3. **Service Layer (`aiService.js`, `scoringEngine.js`, `eligibilityEngine.js`):** Modular, testable services executing resume parsing heuristics, explainable weighted scoring, and curriculum generation.
4. **Data Access Layer (Mongoose Models):** Normalized schemas encapsulating database persistence, relationships, and validation constraints.

```
       +-------------------------------------------------------------+
       |                     PRESENTATION LAYER                      |
       |  React 18 SPA (Vite) + Tailwind CSS + Recharts + Lucide UI  |
       +------------------------------+------------------------------+
                                      | HTTP / RESTful JSON
       +------------------------------v------------------------------+
       |                   BUSINESS CONTROLLER LAYER                 |
       | Express Routers, JWT Auth Guard, RBAC Middleware, Multer    |
       +------------------------------+------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
+--------v----------------------+               +------------------v---------+
|      AI & SCORING SERVICE     |               |     DATA ACCESS LAYER      |
|  - Gemini Generative Model    |               |  Mongoose ODM (11 Models)  |
|  - 50/20/15/15 Match Engine   |               |  - User, CandidateProfile  |
|  - Skill Gap & Roadmap Heur.  |               |  - RecruiterProfile, Job   |
|  - Deterministic Offline Fall |               |  - Application, Interview  |
+-------------------------------+               +------------------+---------+
                                                                   |
                                                +------------------v---------+
                                                |       DATABASE LAYER       |
                                                |    MongoDB Server 27017    |
                                                +----------------------------+
```

---

## 4. UML Model Documentation

### 4.1 Use Case Summary
- **Candidate:** Register/Login, Build Profile, Upload PDF/DOCX Resume, View AI Resume Analysis, Search/Filter Jobs, View Match Compatibility & Eligibility, Inspect Missing Skills, Track Learning Roadmap, Apply to Job, Monitor Application Status, Attend Scheduled Interview.
- **Recruiter:** Register/Login, Setup Corporate Profile, Create/Edit Job Postings, Review Applicants, Inspect AI Match Breakdown & Resumes, Shortlist/Reject Candidates, Schedule Interviews, Update Requisition Status.
- **Admin:** Authenticate as Superadmin, Oversee Users & Toggle Account Status, Moderate Company Profiles, Review All Applications, Monitor Platform Growth & Recruitment Analytics.

### 4.2 Explainable AI Scoring Formula
Unlike black-box models, TalentAI calculates candidate compatibility deterministically:
$$\text{Match Percentage} = (0.50 \times \text{SkillMatch}) + (0.20 \times \text{ExpMatch}) + (0.15 \times \text{EduMatch}) + (0.15 \times \text{RoleMatch})$$
- **Skill Match (50%):** Ratio of matched required & preferred skills to total required job skills, normalized for common synonyms (e.g. `react` = `react.js`, `node` = `node.js`, `mongo` = `mongodb`, `k8s` = `kubernetes`).
- **Experience Match (20%):** Comparative ratio of candidate's verified years to required experience.
- **Education Match (15%):** Degree level alignment (e.g., B.Tech / B.E. / M.S. in Computer Science/IT).
- **Role Fit (15%):** Keyword proximity between candidate headline/preferred roles and job title.

---

## 5. Folder Structure

```
job-recruitment-portal/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js    # System moderation & platform telemetry
│   │   ├── aiController.js       # AI analysis, match, gap & roadmap endpoints
│   │   ├── applicationController.js # Multi-role application lifecycle
│   │   ├── authController.js     # JWT registration, login, getMe
│   │   ├── candidateController.js# Candidate profile CRUD
│   │   ├── interviewController.js# Interview scheduling & updates
│   │   ├── jobController.js      # Public & recruiter job management
│   │   ├── notificationController.js # Candidate & recruiter notifications
│   │   ├── recruiterController.js# Corporate profiles & recruiter details
│   │   └── resumeController.js   # PDF/DOCX upload, parsing & retrieval
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   ├── errorMiddleware.js    # Centralized JSON error response handler
│   │   └── uploadMiddleware.js   # Multer file validation (PDF/DOCX, 10MB limit)
│   ├── models/
│   │   ├── AIAnalysis.js         # Cached match and resume analysis
│   │   ├── Application.js        # Candidate applications & status timeline
│   │   ├── CandidateProfile.js   # Comprehensive candidate profile
│   │   ├── Company.js            # Registered enterprise companies
│   │   ├── Interview.js          # Scheduled interviews with meeting details
│   │   ├── Job.js                # Job requisitions with skills & criteria
│   │   ├── Notification.js       # In-app notifications
│   │   ├── RecruiterProfile.js   # Recruiter company linkage
│   │   ├── Resume.js             # Extracted resume text & parsed entities
│   │   ├── Skill.js              # Skill catalog & categorizations
│   │   └── User.js               # Multi-role user accounts (candidate, recruiter, admin)
│   ├── routes/                   # Clean Express route declarations
│   ├── scripts/
│   │   ├── seed.js               # Database seeder (realistic enterprise data)
│   │   └── verify-e2e.js         # Automated end-to-end test suite
│   ├── services/
│   │   └── aiService.js          # Gemini GenAI integration + fallback engine
│   ├── utils/
│   │   ├── docxParser.js         # Mammoth DOCX text extraction
│   │   ├── eligibilityEngine.js  # Rule-based eligibility validator
│   │   ├── pdfParser.js          # pdf-parse text extraction
│   │   ├── resumeExtractor.js    # Entity extraction (skills, education, exp)
│   │   ├── roadmapGenerator.js   # Structured milestone & curriculum generator
│   │   └── scoringEngine.js      # Explainable 50/20/15/15 match algorithm
│   ├── uploads/                  # Uploaded resume repository
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Badge, ProgressBar, StatCard, Modal, Navbar, Sidebar
│   │   │   └── domain/           # MatchScoreCard, EligibilityCard, SkillGapCard, ResumeUploader
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state + 1-Click Demo Role Switcher
│   │   │   └── ToastContext.jsx  # Non-blocking animated toast notifications
│   │   ├── layouts/
│   │   │   ├── DashboardLayouts.jsx # Candidate, Recruiter, Admin sidebars
│   │   │   ├── MainLayout.jsx    # Public navigation & footer
│   │   │   └── ProtectedRoute.jsx# Role-guarded route wrapper
│   │   ├── pages/
│   │   │   ├── admin/            # Dashboard, Users, Companies, Jobs, Applications, Analytics
│   │   │   ├── candidate/        # Dashboard, Profile, Resume, AI Analysis, Roadmap, Applications
│   │   │   ├── recruiter/        # Dashboard, Jobs, Post Job, Applicants, Interviews, Analytics
│   │   │   └── public/           # Landing, Login, Register, Job Search, Job Details
│   │   ├── services/api.js       # Configured Axios instance with interceptors
│   │   ├── utils/formatters.js   # Date, currency, string helpers
│   │   ├── App.jsx               # Complete application routing hierarchy
│   │   ├── index.css             # Tailwind directives & design system tokens
│   │   └── main.jsx              # React 18 DOM mount point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json                  # Root orchestration scripts
└── README.md
```

---

## 6. Installation & Setup

### 6.1 Prerequisites
- **Node.js:** v18.0.0 or higher (`node -v`)
- **MongoDB:** Active local MongoDB instance on port 27017 or MongoDB Atlas connection URI

### 6.2 Backend Setup
```bash
cd backend
npm install
```

Configure `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/job_recruitment_portal
JWT_SECRET=oose_capstone_jwt_super_secret_key_2026
AI_API_KEY=your_gemini_api_key_here_or_leave_blank_for_fallback
```
> *Note: If `AI_API_KEY` is omitted or quota is exceeded, TalentAI automatically activates its deterministic fallback engine without crashing.*

### 6.3 Database Seeding
Populate the database with realistic enterprise data (3 companies, 3 recruiters, 5 candidates, 10 jobs, 12 applications, and interviews):
```bash
npm run seed
```

### 6.4 Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 7. Running the Application

### Option A: From Root Workspace Directory
```bash
# Run backend server
npm run dev:backend

# In a separate terminal, run frontend
npm run dev:frontend
```

### Option B: Individual Terminals
```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open your browser to:
**http://localhost:5173**

---

## 8. Demo Credentials & Quick Switcher

For seamless academic demonstration and grading, **1-Click Demo Login** is built into the navigation bar ("Demo Roles"):

| Role | Email | Password |
|---|---|---|
| **Candidate** | `candidate@example.com` | `Password123!` |
| **Recruiter** | `recruiter@example.com` | `Password123!` |
| **Super Admin** | `admin@example.com` | `Password123!` |

---

## 9. Comprehensive Demonstration Walkthrough

### Part A: Candidate Workflow
1. Navigate to `http://localhost:5173/login` and click **"Candidate Demo"** or sign in.
2. View the **Candidate Dashboard** featuring profile completion metrics, application pipeline counters, and recommended jobs.
3. Open **AI Resume Management** (`/candidate/resume-upload`) and inspect extracted skills (Java, Python, React, MongoDB) or upload a PDF/DOCX file.
4. Navigate to **AI Resume Analysis** (`/candidate/ai-analysis`) to examine detected strengths, areas for improvement, and career trajectory.
5. Browse **Job Search** (`/candidate/jobs`) and select a position (e.g. *Full Stack Developer*).
6. Inspect the **Job Details** page: observe the **Explainable AI Match Card** (Overall %, Skills, Experience, Education, Role Relevance) and **Eligibility Verification Status**.
7. Navigate to **Skill Gap Analysis** (`/candidate/skill-gap`) to see categorized matched vs. missing requirements.
8. Explore the **Personalized Learning Roadmap** (`/candidate/learning-roadmap`) and check off completed technical milestones.
9. Click **"Apply Now"**; verify duplicate prevention and status confirmation.
10. Review your submission in **My Applications** (`/candidate/applications`) with visual stage timelines.

### Part B: Recruiter Workflow
1. Use the top navigation role switcher to select **"Recruiter Demo"**.
2. View the **Recruiter Dashboard** (`/recruiter/dashboard`) showing active requisitions and recruitment funnel charts.
3. Click **"Post New Job"** (`/recruiter/create-job`) and create a requisition with required/preferred skills.
4. Open **Posted Jobs** (`/recruiter/jobs`) and click **"View Applicants"** on any active position.
5. In the **Applicant Management Table**, sort by AI Match % and filter by Eligibility.
6. Open **Candidate Details**: review candidate resume, AI skill gap summary, and note the non-discriminatory decision support disclaimer.
7. Click **"Shortlist Candidate"** to update application status.
8. Click **"Schedule Interview"**: input date, time, online meeting link (Google Meet), and notes.

### Part C: Candidate Interview Notification
1. Switch back to **"Candidate Demo"**.
2. Open **Notifications** (`/candidate/notifications`) to see the interview invitation.
3. Open **Interviews** (`/candidate/interviews`) to access meeting link and instructions.

### Part D: Admin Master Governance Console
1. Switch to **"Admin Demo"**.
2. View the **Master Dashboard** (`/admin/dashboard`) tracking total users, companies, active requisitions, and recruitment telemetry.
3. Navigate to **User Management** (`/admin/users`): search users, filter by role, and toggle account activation status (Disable / Activate).
4. Review **Company Registry** (`/admin/companies`), **Job Governance** (`/admin/jobs`), and **Global Applications** (`/admin/applications`).
5. Open **Analytics** (`/admin/analytics`) for interactive Recharts visualizations of platform velocity.

---

## 10. Automated Test Suite Verification

TalentAI includes an automated end-to-end verification script testing every API endpoint and matching algorithm:
```bash
cd backend
node scripts/verify-e2e.js
```

### Verification Results
```text
====================================================
STARTING FULL END-TO-END OOSE CAPSTONE VERIFICATION
====================================================

  [PASS] Backend health check responds 200 (healthy)
  [PASS] Candidate login succeeds with JWT
  [PASS] Candidate profile retrieved with skills
  [PASS] Job search returned 10 matching jobs
  [PASS] AI Job Match computed: 53% match (Not Eligible) with 50/20/15/15 weighting
  [PASS] Skill Gap calculated: 3 matched, 6 missing skills identified
  [PASS] Personalized Learning Roadmap generated with 4 progressive learning milestones
  [PASS] Recruiter login succeeds with JWT
  [PASS] Recruiter retrieved 8 candidate applications
  [PASS] Interview successfully scheduled with automated candidate notification generated
  [PASS] Candidate received 2 system notifications
  [PASS] Admin login authenticated as Superadmin
  [PASS] Admin telemetry active: 9 Users, 3 Companies, 10 Jobs, 12 Applications
  [PASS] Admin user governance: Account status toggle verified successfully
  [PASS] Frontend Vite Server serving TalentAI SPA on http://localhost:5173

====================================================
VERIFICATION COMPLETE: 15 PASSED, 0 FAILED
====================================================
```

---

## 11. Security & Ethical AI Compliance
- **Password Security:** Salted BCrypt hashing (10 salt rounds).
- **Session Security:** Stateless JWT tokens transmitted via HTTP Authorization Bearer headers.
- **Upload Hardening:** Multer mime-type validation enforcing `.pdf` and `.docx` formats, file size cap at 10MB, unique filename sanitization.
- **Ethical AI Constraints:** In strict adherence to recruitment fairness standards, candidate scoring explicitly excludes race, gender, caste, religion, age, disability, or marital status. Recruiters are explicitly presented with the standard advisory:
  > *"AI-generated matching is provided as decision support. Recruiters should independently review candidate information before making hiring decisions."*

---

## 12. License
Developed for the Object-Oriented Software Engineering (OOSE) Capstone Demonstration. All rights reserved.

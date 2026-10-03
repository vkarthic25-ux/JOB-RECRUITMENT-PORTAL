import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { CandidateLayout, RecruiterLayout, AdminLayout } from './layouts/DashboardLayouts';
import ProtectedRoute from './layouts/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import JobSearchPage from './pages/public/JobSearchPage';
import JobDetailsPage from './pages/public/JobDetailsPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import ResumeUploadPage from './pages/candidate/ResumeUploadPage';
import AIResumeAnalysisPage from './pages/candidate/AIResumeAnalysisPage';
import JobMatchAnalysisPage from './pages/candidate/JobMatchAnalysisPage';
import SkillGapAnalysisPage from './pages/candidate/SkillGapAnalysisPage';
import LearningRoadmapPage from './pages/candidate/LearningRoadmapPage';
import ApplicationsPage from './pages/candidate/ApplicationsPage';
import ApplicationDetailsPage from './pages/candidate/ApplicationDetailsPage';
import InterviewsPage from './pages/candidate/InterviewsPage';
import NotificationsPage from './pages/candidate/NotificationsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';
import JobManagementPage from './pages/recruiter/JobManagementPage';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import EditJobPage from './pages/recruiter/EditJobPage';
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage';
import CandidateDetailsPage from './pages/recruiter/CandidateDetailsPage';
import ShortlistedCandidatesPage from './pages/recruiter/ShortlistedCandidatesPage';
import InterviewManagementPage from './pages/recruiter/InterviewManagementPage';
import RecruitmentAnalyticsPage from './pages/recruiter/RecruitmentAnalyticsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import JobManagementAdminPage from './pages/admin/JobManagementAdminPage';
import ApplicationManagementAdminPage from './pages/admin/ApplicationManagementAdminPage';
import AnalyticsAdminPage from './pages/admin/AnalyticsAdminPage';

function App() {
  return (
    <Routes>
      {/* Public Pages with standard Navbar/Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobSearchPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
      </Route>

      {/* Candidate Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
        <Route element={<CandidateLayout />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/profile" element={<CandidateProfilePage />} />
          <Route path="/candidate/resume-upload" element={<ResumeUploadPage />} />
          <Route path="/candidate/ai-analysis" element={<AIResumeAnalysisPage />} />
          <Route path="/candidate/resume-analyzer" element={<AIResumeAnalysisPage />} />
          <Route path="/candidate/jobs" element={<JobSearchPage />} />
          <Route path="/candidate/recommended-jobs" element={<JobSearchPage />} />
          <Route path="/candidate/match-analysis" element={<JobMatchAnalysisPage />} />
          <Route path="/candidate/match-analysis/:jobId" element={<JobMatchAnalysisPage />} />
          <Route path="/candidate/skill-gap" element={<SkillGapAnalysisPage />} />
          <Route path="/candidate/skill-gap/:jobId" element={<SkillGapAnalysisPage />} />
          <Route path="/candidate/learning-roadmap" element={<LearningRoadmapPage />} />
          <Route path="/candidate/learning-roadmap/:jobId" element={<LearningRoadmapPage />} />
          <Route path="/candidate/applications" element={<ApplicationsPage />} />
          <Route path="/candidate/applications/:id" element={<ApplicationDetailsPage />} />
          <Route path="/candidate/interviews" element={<InterviewsPage />} />
          <Route path="/candidate/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Recruiter Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/company" element={<CompanyProfilePage />} />
          <Route path="/recruiter/jobs" element={<JobManagementPage />} />
          <Route path="/recruiter/jobs/create" element={<CreateJobPage />} />
          <Route path="/recruiter/create-job" element={<CreateJobPage />} />
          <Route path="/recruiter/jobs/edit/:id" element={<EditJobPage />} />
          <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
          <Route path="/recruiter/candidate/:applicationId" element={<CandidateDetailsPage />} />
          <Route path="/recruiter/shortlisted" element={<ShortlistedCandidatesPage />} />
          <Route path="/recruiter/interviews" element={<InterviewManagementPage />} />
          <Route path="/recruiter/analytics" element={<RecruitmentAnalyticsPage />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/companies" element={<CompanyManagementPage />} />
          <Route path="/admin/jobs" element={<JobManagementAdminPage />} />
          <Route path="/admin/applications" element={<ApplicationManagementAdminPage />} />
          <Route path="/admin/analytics" element={<AnalyticsAdminPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

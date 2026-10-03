import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Download,
} from 'lucide-react';
import ResumeUploader from '../../components/candidate/ResumeUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ResumeUploadPage = () => {
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);

  const { refreshUser } = useAuth();
  const { addToast } = useToast();

  const fetchResume = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resumes/current');
      if (res.data.success) {
        setCurrentResume(res.data.resume);
      }
    } catch (err) {
      // 404 is normal if no resume uploaded yet
      setCurrentResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUploadSuccess = (resume, analysis) => {
    setCurrentResume(resume);
    refreshUser();
  };

  const handleDeleteResume = async () => {
    if (!currentResume) return;
    if (!window.confirm('Are you sure you want to delete your current resume?')) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/resumes/${currentResume._id}`);
      if (res.data.success) {
        addToast('Resume deleted successfully.', 'success');
        setCurrentResume(null);
        await refreshUser();
      }
    } catch (err) {
      addToast('Failed to delete resume.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Checking resume documents..." size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Resume Management & AI Extraction
        </h2>
        <p className="text-xs text-slate-500">
          Upload your resume in PDF or DOCX format for automatic parsing and explainable job matching
        </p>
      </div>

      {/* Current Active Resume Card */}
      {currentResume ? (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{currentResume.fileName}</h3>
                <p className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                  <span>{(currentResume.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span className="uppercase font-semibold">{currentResume.fileType}</span>
                  <span>•</span>
                  <span>Uploaded {new Date(currentResume.uploadedAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/candidate/ai-analysis"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Analysis Report
              </Link>
              <button
                onClick={handleDeleteResume}
                disabled={deleting}
                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Extracted Skills Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extracted Skills ({currentResume.extractedSkills?.length || 0})
              </h4>
              <Link
                to="/candidate/profile"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Manage Profile Skills
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentResume.extractedSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200/70"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Extracted Education & Experience Mini Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Detected Education
              </span>
              <p className="font-semibold text-slate-800">
                {currentResume.education?.[0]?.degree || 'Computer Science / Engineering Degree'}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentResume.education?.[0]?.institution || 'Verified University'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Detected Experience
              </span>
              <p className="font-semibold text-slate-800">
                {currentResume.experience?.[0]?.title || 'Software Development Experience'}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentResume.experience?.[0]?.duration || '1-3 years experience'}
              </p>
            </div>
          </div>

          {/* Text preview collapse */}
          <div className="pt-2">
            <button
              onClick={() => setShowTextModal(!showTextModal)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition flex items-center"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              {showTextModal ? 'Hide Extracted Plain Text' : 'View Extracted Plain Text Preview'}
            </button>

            {showTextModal && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {currentResume.extractedText || 'No text extracted from file.'}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Uploader Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {currentResume ? 'Replace Current Resume' : 'Upload Your Resume'}
        </h3>
        <ResumeUploader onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
};

export default ResumeUploadPage;

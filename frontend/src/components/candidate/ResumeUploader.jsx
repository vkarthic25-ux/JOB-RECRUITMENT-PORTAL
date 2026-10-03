import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!allowed.includes(ext)) {
      addToast('Invalid file format. Please upload a PDF or DOCX resume document.', 'error');
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      addToast('File size exceeds the 10MB limit. Please choose a smaller file.', 'error');
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (validateFile(selected)) {
      setFile(selected);
      handleUpload(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (validateFile(dropped)) {
      setFile(dropped);
      handleUpload(dropped);
    }
  };

  const handleUpload = async (fileToUpload) => {
    const targetFile = fileToUpload || file;
    if (!targetFile) return;

    setUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('resume', targetFile);

    try {
      setUploadProgress(50);
      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);
      addToast('Resume uploaded and parsed successfully!', 'success');
      if (onUploadSuccess) {
        onUploadSuccess(res.data.resume, res.data.analysis);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Unable to upload resume. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-800 tracking-tight">
              {uploading
                ? 'Parsing Resume & Extracting Skills...'
                : 'Drag & Drop your Resume here, or browse'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF and DOCX files up to 10MB
            </p>
          </div>

          {uploading && (
            <div className="w-full max-w-xs mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>AI Text Extraction in progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <button
              type="button"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
            >
              Select Resume File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;

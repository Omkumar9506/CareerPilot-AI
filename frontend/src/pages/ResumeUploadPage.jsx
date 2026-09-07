import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  FileCheck
} from 'lucide-react';
import api from '../services/api';

export const ResumeUploadPage = () => {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fetchCurrentResume = async () => {
    try {
      const res = await api.get('/resumes/my-resume');
      if (res.success && res.data) {
        setResumeUrl(res.data.resumeUrl);
      }
    } catch (err) {
      console.error('Failed to load resume info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentResume();
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check size limit (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'File exceeds maximum 5MB size limit.' });
      return;
    }

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setStatusMessage({ type: 'error', text: 'Please select a valid PDF, DOC, or DOCX document.' });
      return;
    }

    setSelectedFile(file);
    setStatusMessage(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data) {
        setResumeUrl(res.data.resumeUrl);
        setSelectedFile(null);
        setStatusMessage({
          type: 'success',
          text: `Resume "${res.data.fileName}" uploaded successfully and saved to your profile!`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Upload failed' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error uploading file' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) return;

    try {
      const res = await api.delete('/resumes/my-resume');
      if (res.success) {
        setResumeUrl(null);
        setStatusMessage({ type: 'success', text: 'Resume removed from your profile.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error removing resume' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your resume documents...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
            Document Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            Resume & Document Hosting
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your resume for employer applications and AI-driven ATS optimization
          </p>
        </div>

        {resumeUrl && (
          <Link
            to="/resume-analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-cyber-600 hover:opacity-95 shadow-lg shadow-brand-600/30 transition-all w-fit"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze with AI
          </Link>
        )}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Current Active Resume Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Current Uploaded Resume</h2>

        {resumeUrl ? (
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Active Primary Resume</p>
                <p className="text-xs text-slate-500 truncate max-w-sm">{resumeUrl}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready for Applications
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-brand-500/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Document
              </a>
              <button
                onClick={handleDeleteResume}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                title="Remove Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 font-medium">No resume on file yet</p>
            <p className="text-xs text-slate-600">Upload your latest PDF below to unlock 1-click job applications and AI scoring.</p>
          </div>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          {resumeUrl ? 'Replace Resume' : 'Upload New Resume'}
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`p-10 rounded-2xl border-2 border-dashed transition-all text-center space-y-4 cursor-pointer ${
            isDragOver
              ? 'border-brand-500 bg-brand-500/10'
              : selectedFile
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
          onClick={() => document.getElementById('resumeFileInput')?.click()}
        >
          <input
            type="file"
            id="resumeFileInput"
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-brand-400 mx-auto flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                Drag and drop your resume here, or <span className="text-brand-400 underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500">Supports PDF, DOC, DOCX up to 5 MB</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading Document...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Upload & Save Resume
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

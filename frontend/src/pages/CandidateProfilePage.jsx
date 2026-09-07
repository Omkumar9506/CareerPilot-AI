import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Globe, 
  Github, 
  Linkedin 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CandidateProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    phone: '',
    location: '',
    skills: [],
    experience: [],
    education: [],
    portfolio: '',
    github: '',
    linkedin: '',
  });

  const [newSkill, setNewSkill] = useState('');

  // Experience input modal/form state
  const [showExpForm, setShowExpForm] = useState(false);
  const [expInput, setExpInput] = useState({
    company: '',
    position: '',
    location: '',
    current: true,
    description: '',
  });

  // Education input modal/form state
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduInput, setEduInput] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    current: false,
    description: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile/me');
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          setFormData({
            headline: p.headline || '',
            bio: p.bio || '',
            phone: p.phone || '',
            location: p.location || '',
            skills: p.skills || [],
            experience: p.experience || [],
            education: p.education || [],
            portfolio: p.portfolio || '',
            github: p.github || '',
            linkedin: p.linkedin || '',
          });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skill = newSkill.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expInput.company || !expInput.position) return;
    setFormData({
      ...formData,
      experience: [...formData.experience, { ...expInput }],
    });
    setExpInput({ company: '', position: '', location: '', current: true, description: '' });
    setShowExpForm(false);
  };

  const handleRemoveExperience = (idx) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== idx),
    });
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!eduInput.institution || !eduInput.degree) return;
    setFormData({
      ...formData,
      education: [...formData.education, { ...eduInput }],
    });
    setEduInput({ institution: '', degree: '', fieldOfStudy: '', current: false, description: '' });
    setShowEduForm(false);
  };

  const handleRemoveEducation = (idx) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.put('/users/profile/candidate', formData);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Profile saved successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Error saving profile' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl ring-2 ring-brand-500/30 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                Job Seeker
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Info & Skills */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Headline & Contact */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              General Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Headline</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer | React"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Professional Bio</label>
              <textarea
                rows={4}
                placeholder="Share a brief overview of your background, passions, and key strengths..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Skills Management */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Technical & Core Skills
            </h3>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. TypeScript)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/25"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-xs text-slate-500">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Online Profiles</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub URL</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://github.com/yourhandle"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourhandle"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Portfolio Website</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Work Experience & Education */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Work Experience */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-400" />
                Work Experience
              </h3>
              <button
                type="button"
                onClick={() => setShowExpForm(!showExpForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
              >
                <Plus className="w-3.5 h-3.5 text-brand-400" />
                Add Position
              </button>
            </div>

            {/* Experience Add Form */}
            {showExpForm && (
              <form onSubmit={handleAddExperience} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={expInput.company}
                      onChange={(e) => setExpInput({ ...expInput, company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Position / Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Software Engineer"
                      value={expInput.position}
                      onChange={(e) => setExpInput({ ...expInput, position: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Description & Key Achievements</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your responsibilities, metrics, and technologies used..."
                    value={expInput.description}
                    onChange={(e) => setExpInput({ ...expInput, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExpForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                  >
                    Add Experience
                  </button>
                </div>
              </form>
            )}

            {/* Experience List */}
            <div className="space-y-3 pt-2">
              {formData.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 border-slate-800/80 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-white">{exp.position}</h4>
                    <p className="text-xs font-medium text-brand-400">{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.experience.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No work experience entries added yet.
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-400" />
                Education & Degrees
              </h3>
              <button
                type="button"
                onClick={() => setShowEduForm(!showEduForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
              >
                <Plus className="w-3.5 h-3.5 text-brand-400" />
                Add Education
              </button>
            </div>

            {/* Education Add Form */}
            {showEduForm && (
              <form onSubmit={handleAddEducation} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Institution / University *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stanford University"
                      value={eduInput.institution}
                      onChange={(e) => setEduInput({ ...eduInput, institution: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Degree *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.S. in Computer Science"
                      value={eduInput.degree}
                      onChange={(e) => setEduInput({ ...eduInput, degree: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEduForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                  >
                    Add Education
                  </button>
                </div>
              </form>
            )}

            {/* Education List */}
            <div className="space-y-3 pt-2">
              {formData.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 border-slate-800/80 flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="text-base font-semibold text-white">{edu.degree}</h4>
                    <p className="text-xs text-brand-400">{edu.institution}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.education.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No education history added yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

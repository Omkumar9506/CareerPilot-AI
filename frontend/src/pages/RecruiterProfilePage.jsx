import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RecruiterProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    description: '',
    website: '',
    location: '',
    industry: 'Technology',
    companySize: '51-200',
  });

  const industries = [
    'Technology',
    'Artificial Intelligence',
    'Fintech',
    'Healthcare & Biotech',
    'E-Commerce & Retail',
    'Enterprise SaaS',
    'Cybersecurity',
    'EdTech',
    'Gaming & Media',
  ];

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile/me');
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          setFormData({
            companyName: p.companyName || `${user?.name}'s Organization`,
            companyLogo: p.companyLogo || '',
            description: p.description || '',
            website: p.website || '',
            location: p.location || '',
            industry: p.industry || 'Technology',
            companySize: p.companySize || '51-200',
          });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to load company profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await api.put('/users/profile/recruiter', formData);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Company profile updated successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Error updating profile' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save company profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading recruiter profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
            {formData.companyLogo ? (
              <img
                src={formData.companyLogo}
                alt={formData.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 text-cyber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {formData.companyName || 'Company Profile'}
              </h1>
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-cyber-500/20 text-cyber-400 border border-cyber-500/30">
                Recruiter
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Manage employer branding & talent recruitment preferences</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-cyber-600 hover:bg-cyber-500 shadow-lg shadow-cyber-600/30 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Company Profile'}
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

      {/* Company Form */}
      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Company Name *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Acme Innovations"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Website URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://acme.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-500"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind} className="bg-slate-900">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Company Size</label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <select
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-500"
              >
                {companySizes.map((size) => (
                  <option key={size} value={size} className="bg-slate-900">
                    {size} Employees
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Headquarters Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Austin, TX (or Hybrid / Remote)"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Logo Image URL</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="url"
                value={formData.companyLogo}
                onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Company Description & Mission</label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell candidates about your company culture, technology stack, mission, and benefits..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-cyber-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-cyber-600 hover:bg-cyber-500 shadow-lg shadow-cyber-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

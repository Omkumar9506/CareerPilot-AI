import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Briefcase, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  ArrowRight,
  Command,
  FileText
} from 'lucide-react';

export const QuickSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName))) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Search Software Engineer Roles', href: '/jobs?keyword=Software+Engineer', icon: Briefcase, category: 'Jobs' },
    { title: 'AI Resume Analyzer', href: '/resume-analyzer', icon: Sparkles, category: 'AI Tools' },
    { title: 'AI Mock Interview Simulator', href: '/mock-interview', icon: Bot, category: 'AI Tools' },
    { title: 'Personalized Skill Roadmaps', href: '/roadmap', icon: TrendingUp, category: 'Career Growth' },
    { title: 'Remote React & Node.js Jobs', href: '/jobs?keyword=React&workplace=Remote', icon: Briefcase, category: 'Jobs' },
    { title: 'Upload & Review Resume', href: '/resume', icon: FileText, category: 'Candidate' },
  ];

  const filtered = quickActions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href) => {
    navigate(href);
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden z-10">
        <form onSubmit={handleFormSubmit} className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, skills, AI tools, companies..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
            ESC
          </kbd>
        </form>

        {/* Results / Suggestions */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {query ? 'Search Results' : 'Recommended Quick Actions'}
          </div>

          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 hover:text-brand-700 hover:bg-brand-50 border border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-brand-600/20 dark:hover:border-brand-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors dark:bg-slate-800 dark:text-brand-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-800 group-hover:text-brand-700 dark:text-slate-200 dark:group-hover:text-white">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No direct actions found for "{query}". Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs text-brand-600 dark:text-brand-400">Enter</kbd> to search jobs.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between dark:bg-slate-950/60 dark:border-slate-800 dark:text-slate-400">
          <span>Search 5,000+ tech roles across verified companies</span>
          <span className="flex items-center gap-1">
            Navigate with <span className="font-mono">↵</span>
          </span>
        </div>
      </div>
    </div>
  );
};

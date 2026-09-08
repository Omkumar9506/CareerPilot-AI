import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Play, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Loader2, 
  Sparkles, 
  Trophy, 
  Award, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Star, 
  ShieldCheck, 
  Cpu,
  Layers,
  Send,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MockInterviewPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isCandidate = isAuthenticated && user?.role === 'candidate';

  // Phase & View states: 'setup' | 'studio' | 'scorecard'
  const [viewState, setViewState] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Setup configuration state
  const [roleTitle, setRoleTitle] = useState('Senior Full Stack Engineer');
  const [category, setCategory] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Senior');
  const [targetCompany, setTargetCompany] = useState('');
  const [questionCount, setQuestionCount] = useState(4);

  // Active Session state
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluatedCurrentQuestion, setEvaluatedCurrentQuestion] = useState(null);

  // Speech & Audio states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // History & Accordion states
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const rolePresets = [
    'Senior Full Stack Engineer',
    'Frontend React Specialist',
    'Backend Node.js & Cloud Architect',
    'DevOps & Kubernetes Engineer',
    'Distributed Systems Architect',
    'Engineering Manager / Tech Lead',
  ];

  const categoryTracks = [
    {
      id: 'Mixed',
      label: 'Comprehensive Mixed Track',
      desc: 'Balanced assessment across coding architecture, system design, and STAR behavioral scenarios.',
      icon: Layers,
      color: 'from-brand-600 to-indigo-600',
    },
    {
      id: 'Technical',
      label: 'Deep Technical & Stack',
      desc: 'In-depth language internals, concurrency, database transactions, and engineering trade-offs.',
      icon: Cpu,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'System Design',
      label: 'System Design & Scalability',
      desc: 'Distributed architectures, caching tiers, message queues, and high-throughput scalability.',
      icon: ShieldCheck,
      color: 'from-teal-600 to-emerald-600',
    },
    {
      id: 'Behavioral',
      label: 'Behavioral Leadership (STAR)',
      desc: 'Conflict resolution, incident triage, ambiguity, and high-impact team leadership.',
      icon: Sparkles,
      color: 'from-amber-600 to-orange-600',
    },
  ];

  // Fetch interview history on mount if candidate
  useEffect(() => {
    if (isCandidate) {
      fetchHistory();
    }
  }, [isCandidate]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/interviews/history');
      if (res.success && res.data) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  // Timer effect during active studio
  useEffect(() => {
    if (viewState === 'studio' && !evaluatedCurrentQuestion) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [viewState, evaluatedCurrentQuestion]);

  // Clean up audio & recognition on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // 1. Text-to-Speech (Read question aloud)
  const toggleSpeakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 2. Speech-to-Text (Voice Dictation Microphone)
  const toggleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation (Speech Recognition) is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Could not start recognition:', err);
      setIsListening(false);
    }
  };

  // Start new interview simulation
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/interviews/start', {
        roleTitle: roleTitle.trim(),
        category,
        difficulty,
        targetCompany: targetCompany.trim(),
        questionCount,
      });

      if (res.success && res.data?.session) {
        setSession(res.data.session);
        setCurrentQuestionIndex(0);
        setCandidateAnswer('');
        setEvaluatedCurrentQuestion(null);
        setTimerSeconds(0);
        setViewState('studio');

        // Automatically read aloud the first question
        if (res.data.session.questions?.[0]) {
          setTimeout(() => {
            toggleSpeakQuestion(res.data.session.questions[0].questionText);
          }, 600);
        }
      } else {
        setErrorMessage(res.message || 'Failed to initialize session');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for current question
  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim()) {
      setErrorMessage('Please type or dictate your response before submitting.');
      return;
    }

    // Stop speaking or listening
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);

    setEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await api.post(`/interviews/session/${session._id}/answer`, {
        questionIndex: currentQuestionIndex,
        candidateAnswer: candidateAnswer.trim(),
      });

      if (res.success && res.data?.question) {
        setEvaluatedCurrentQuestion(res.data.question);
        
        // Update local session state
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentQuestionIndex] = res.data.question;
        setSession({ ...session, questions: updatedQuestions });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  // Next Question or Complete Session
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setCandidateAnswer('');
      setEvaluatedCurrentQuestion(null);
      setTimerSeconds(0);

      // Read aloud next question
      if (session.questions[nextIdx]) {
        toggleSpeakQuestion(session.questions[nextIdx].questionText);
      }
    } else {
      // Finalize session
      setLoading(true);
      try {
        const res = await api.post(`/interviews/session/${session._id}/complete`);
        if (res.success && res.data?.session) {
          setSession(res.data.session);
          setViewState('scorecard');
          fetchHistory();
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to finalize interview scorecard');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAccordion = (idx) => {
    setExpandedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: SETUP SCREEN */}
      {/* ------------------------------------------------------------- */}
      {viewState === 'setup' && (
        <div className="space-y-10">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-xs font-semibold uppercase">
              <Bot className="w-4 h-4" />
              Next-Gen AI Interview Simulation Studio
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Master High-Stakes Tech Interviews with <span className="gradient-text">Gemini AI</span>
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Simulate dynamic Technical, System Design, and STAR Behavioral interviews with real-time answer scoring, speech dictation, audio readouts, and comprehensive performance analytics.
            </p>

            {/* Past History CTA */}
            {isCandidate && history.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
                >
                  <History className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  View Past Interview Scorecards ({history.length})
                </button>
              </div>
            )}
          </div>

          {/* Configuration Form Card */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
            <form onSubmit={handleStartInterview} className="space-y-8">
              
              {/* Target Role Title */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Engineering Position *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer, Cloud Architect, React Lead..."
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition shadow-inner"
                />

                {/* Role Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {rolePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRoleTitle(preset)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                        roleTitle === preset
                          ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/40 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Track Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Interview Category Track
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryTracks.map((track) => {
                    const Icon = track.icon;
                    const isSelected = category === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setCategory(track.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-50/50 dark:bg-slate-900/90 border-brand-500/50 shadow-md ring-1 ring-brand-500/40'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${track.color} text-white flex items-center justify-center shadow`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{track.label}</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{track.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Seniority & Company Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Seniority Level */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Experience Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Entry" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Entry / Junior (0-2y)</option>
                    <option value="Mid-Level" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mid-Level (2-5y)</option>
                    <option value="Senior" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Senior Engineer (5-8y)</option>
                    <option value="Lead" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lead / Staff Architect (8y+)</option>
                  </select>
                </div>

                {/* Target Company / Culture */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Target Company (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Stripe, Startups..."
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Simulation Length
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value={3} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">3 Questions (Express ~15 min)</option>
                    <option value={4} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">4 Questions (Standard ~25 min)</option>
                    <option value={5} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">5 Questions (Comprehensive ~35 min)</option>
                  </select>
                </div>

              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Powered by Gemini 1.5 Flash Real-Time Evaluation</span>
                </div>

                {isCandidate ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-600 hover:scale-[1.02] text-white text-sm font-semibold rounded-2xl shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Tailored Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Start AI Interview Simulation
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-2xl shadow-xl transition-all text-center"
                  >
                    Sign In as Candidate to Begin
                  </Link>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: LIVE INTERVIEW STUDIO */}
      {/* ------------------------------------------------------------- */}
      {viewState === 'studio' && session && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Top Session Progress Bar */}
          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                {currentQuestionIndex + 1}/{session.questions.length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{session.roleTitle}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {session.category} Track • {session.difficulty} Level
                </p>
              </div>
            </div>

            {/* Timer & Abort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-brand-700 dark:text-brand-300 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                {formatTime(timerSeconds)}
              </div>

              <button
                onClick={() => setViewState('setup')}
                className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition font-medium"
              >
                Quit Session
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-500/20">
                  {session.questions[currentQuestionIndex]?.category || 'Technical'} Question
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {session.questions[currentQuestionIndex]?.questionText}
                </h2>
              </div>

              {/* Audio Speaker Readout */}
              <button
                type="button"
                onClick={() =>
                  toggleSpeakQuestion(session.questions[currentQuestionIndex]?.questionText)
                }
                className={`p-3 rounded-2xl border transition ${
                  isSpeaking
                    ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/40 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={isSpeaking ? 'Mute Question' : 'Listen to AI Interviewer'}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Candidate Response Workspace */}
            {!evaluatedCurrentQuestion ? (
              <div className="space-y-4 pt-2">
                <div className="relative">
                  <textarea
                    rows={7}
                    placeholder="Articulate your structured response here... (You can type or click the microphone to speak your response aloud)"
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 transition leading-relaxed shadow-inner"
                  />

                  {/* Word count */}
                  <div className="absolute right-4 bottom-4 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0} words
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Studio Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  
                  {/* Microphone dictation trigger */}
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      isListening
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 text-rose-500" />
                        Listening... Click to Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        Voice Dictation (Speech-to-Text)
                      </>
                    )}
                  </button>

                  {/* Submit Answer */}
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !candidateAnswer.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gemini Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit & Evaluate Answer
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Immediate Evaluation Feedback Card */
              <div className="space-y-6 pt-2 border-t border-slate-200 dark:border-slate-800/80 animate-in fade-in duration-300">
                
                {/* Score & Feedback Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50/50 via-indigo-50/30 to-slate-50 dark:from-slate-900 dark:via-brand-950/30 dark:to-slate-900 border border-brand-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                      Immediate AI Evaluation
                    </span>
                    <span
                      className={`text-sm font-extrabold px-3 py-1 rounded-xl border ${
                        evaluatedCurrentQuestion.score >= 80
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : evaluatedCurrentQuestion.score >= 60
                          ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {evaluatedCurrentQuestion.score}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {evaluatedCurrentQuestion.feedback}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      Observed Strengths
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {evaluatedCurrentQuestion.strengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase">
                      <AlertCircle className="w-4 h-4" />
                      Key Growth Opportunities
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {evaluatedCurrentQuestion.improvements?.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Model Guidance */}
                {evaluatedCurrentQuestion.idealAnswerSummary && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-brand-700 dark:text-brand-300">Ideal Benchmark Highlights: </span>
                    <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {evaluatedCurrentQuestion.idealAnswerSummary}
                    </span>
                  </div>
                )}

                {/* Next CTA */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentQuestionIndex < session.questions.length - 1 ? (
                      <>
                        Continue to Question {currentQuestionIndex + 2}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 text-amber-300" />
                        Finalize & View Full Scorecard
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: COMPREHENSIVE FINAL SCORECARD */}
      {/* ------------------------------------------------------------- */}
      {viewState === 'scorecard' && session && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Main Grand Score Card */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-brand-950/30 dark:to-slate-900 p-6 sm:p-10 rounded-3xl border border-brand-500/30 shadow-md space-y-6 text-center relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-cyber-500" />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-cyber-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-brand-600/30">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                Official AI Simulation Scorecard
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {session.roleTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completed on {new Date(session.updatedAt || Date.now()).toLocaleDateString()} • {session.questions.length} Questions Evaluated
              </p>
            </div>

            {/* Big Score Gauge */}
            <div className="pt-2">
              <div className="inline-flex flex-col items-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-inner">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {session.overallScore}
                  <span className="text-xl font-medium text-slate-400 dark:text-slate-500">/100</span>
                </span>
                <span
                  className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold border ${
                    session.overallScore >= 85
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : session.overallScore >= 70
                      ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {session.overallScore >= 85
                    ? 'Exceptional Hire Rating'
                    : session.overallScore >= 70
                    ? 'Competitive Qualified Rating'
                    : 'Developing Candidate Rating'}
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {session.feedbackSummary}
            </div>
          </div>

          {/* 4-Factor Dimensional Score Bars */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Dimensional Competency Ratings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Technical Accuracy */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Technical Depth & Accuracy</span>
                  <span className="text-slate-900 dark:text-white font-bold">{session.metrics?.technicalAccuracy || 80}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500"
                    style={{ width: `${session.metrics?.technicalAccuracy || 80}%` }}
                  />
                </div>
              </div>

              {/* Communication */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Communication & Articulation</span>
                  <span className="text-slate-900 dark:text-white font-bold">{session.metrics?.communication || 80}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                    style={{ width: `${session.metrics?.communication || 80}%` }}
                  />
                </div>
              </div>

              {/* Clarity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Clarity & Response Framing</span>
                  <span className="text-slate-900 dark:text-white font-bold">{session.metrics?.clarity || 78}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                    style={{ width: `${session.metrics?.clarity || 78}%` }}
                  />
                </div>
              </div>

              {/* Trade-offs & Depth */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Trade-offs & Engineering Maturity</span>
                  <span className="text-slate-900 dark:text-white font-bold">{session.metrics?.depth || 78}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                    style={{ width: `${session.metrics?.depth || 78}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Top Strengths */}
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-emerald-500/20 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                Key Demonstrated Strengths
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {session.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-brand-500/20 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Coaching Roadmaps to Elevate
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {session.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-600 dark:text-brand-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Question-by-Question Accordion Breakdown */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Detailed Question-by-Question Audit
            </h3>

            <div className="space-y-3 pt-2">
              {session.questions?.map((q, idx) => {
                const isExpanded = expandedQuestions[idx];
                return (
                  <div
                    key={q._id || idx}
                    className="rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <div
                      onClick={() => toggleAccordion(idx)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-400 flex items-center justify-center">
                          Q{idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {q.questionText}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{q.score}/100</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-850 space-y-3 text-xs">
                        <div>
                          <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Your Answer:</span>
                          <p className="text-slate-800 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                            {q.candidateAnswer || 'No answer recorded'}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-brand-600 dark:text-brand-400 block mb-1">Evaluator Feedback:</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.feedback}</p>
                        </div>

                        {q.idealAnswerSummary && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-850/80">
                            <span className="font-semibold text-slate-500 block mb-1">What an Ideal Answer Looks Like:</span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{q.idealAnswerSummary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setViewState('setup')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Start Another Simulation
            </button>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-800 transition text-center shadow-sm"
            >
              Explore Matching Positions
            </Link>
          </div>

        </div>
      )}

      {/* History Modal Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Past Interview Sessions</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.roleTitle}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.category} Track • {item.difficulty} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {item.overallScore || 0}/100
                    </span>
                    <button
                      onClick={async () => {
                        setShowHistoryModal(false);
                        setLoading(true);
                        try {
                          const res = await api.get(`/interviews/session/${item._id}`);
                          if (res.success && res.data?.session) {
                            setSession(res.data.session);
                            setViewState('scorecard');
                          }
                        } catch (e) {
                          //
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-brand-600 dark:text-brand-300 font-semibold border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MockInterviewPage;

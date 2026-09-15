import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Tv, 
  X, 
  CheckCircle2, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Clock, 
  User, 
  Building2, 
  ExternalLink, 
  Sliders, 
  AlertTriangle,
  Play,
  Layers,
  Database,
  Check,
  RefreshCw,
  Plus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  subscribeQuestions, 
  subscribeConnectionStatus,
  ConnectionStatus,
  setDisplayLive, 
  clearDisplayLive, 
  markAnswered, 
  deleteQuestion,
  seedSampleQuestions,
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  testFirebaseConnection,
  FirebaseConnectionTestResult
} from '../../lib/firebaseQa';
import { QAQuestion, FirebaseQAConfig } from '../../types/qa';
import { Link } from 'react-router-dom';

export const TechXHostQA: React.FC = () => {
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'live' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting');
  
  // Confirmation modal state
  const [pendingLiveQuestion, setPendingLiveQuestion] = useState<QAQuestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings / Firebase Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState<FirebaseQAConfig>(getActiveFirebaseConfig());
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Fullscreen state for question feed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const questionListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (questionListRef.current) {
        questionListRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen error:', err);
          document.documentElement.requestFullscreen().catch(() => {});
        });
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Live connection test state
  const [testResult, setTestResult] = useState<FirebaseConnectionTestResult | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const res = await testFirebaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: 'Connection test failed',
        databaseId: 'ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676',
        projectId: 'itap-db',
        error: err?.message || String(err)
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeQuestions((updatedList) => {
      setQuestions(updatedList);
    });
    const unsubStatus = subscribeConnectionStatus((status) => {
      setConnStatus(status);
    });
    return () => {
      unsubscribe();
      unsubStatus();
    };
  }, []);

  const activeLiveQuestion = questions.find((q) => q.isSelected && q.status === 'live');
  const totalCount = questions.length;
  const pendingCount = questions.filter((q) => q.status === 'pending').length;
  const answeredCount = questions.filter((q) => q.status === 'answered').length;

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'pending' && q.status !== 'pending') return false;
    if (filter === 'live' && !q.isSelected) return false;
    if (filter === 'answered' && q.status !== 'answered') return false;

    if (searchQuery.trim()) {
      const qText = q.question.toLowerCase();
      const nText = q.name.toLowerCase();
      const cText = (q.company || '').toLowerCase();
      const s = searchQuery.toLowerCase();
      return qText.includes(s) || nText.includes(s) || cText.includes(s);
    }
    return true;
  });

  const handleConfirmDisplayLive = async () => {
    if (!pendingLiveQuestion) return;
    setIsProcessing(true);
    try {
      await setDisplayLive(pendingLiveQuestion.id);
      setPendingLiveQuestion(null);
    } catch (err) {
      console.error('Error setting live display:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearLive = async () => {
    setIsProcessing(true);
    try {
      await clearDisplayLive();
    } catch (err) {
      console.error('Error clearing live display:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAnswered = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAnswered(id);
    } catch (err) {
      console.error('Error marking answered:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this question permanently?')) {
      try {
        await deleteQuestion(id);
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleSeed = async () => {
    await seedSampleQuestions();
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomFirebaseConfig(firebaseConfigInput);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 3000);
    setShowConfigModal(false);
  };

  return (
    <div className="min-h-screen bg-[#070B1E] text-slate-100 font-sans selection:bg-cyan-500/30 flex flex-col">
      {/* Top Navigation / Host Header */}
      <header className="border-b border-slate-800 bg-[#070B1E]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/techx%20for%20dark.png" 
              alt="TechX Summit" 
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-base tracking-wide">
                Host Control Console
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] uppercase tracking-wider">
                Live Q&A
              </span>
              <span 
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                  connStatus === 'connected'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : connStatus === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                }`}
                title="Cloud Firestore Database ID: ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : connStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-amber-400 animate-ping'
                }`} />
                <span>
                  {connStatus === 'connected'
                    ? 'Cloud Firestore: itap-db'
                    : connStatus === 'error'
                    ? 'Firestore Error'
                    : 'Connecting Cloud...'}
                </span>
              </span>

              <button
                onClick={handleTestConnection}
                disabled={isTestingConn}
                title="Run live Firebase ping and round-trip verification"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isTestingConn ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                <span>{isTestingConn ? 'Testing...' : 'Test DB'}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions / External Links */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={handleSeed}
              title="Add mock test questions"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Samples</span>
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Firebase Config</span>
            </button>

            <Link
              to="/techx-live-qa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Open Stage Screen</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>

            <Link
              to="/techx-qa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Submit Portal</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Host Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Metric Counters & Currently Live Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Received</p>
              <p className="text-2xl font-bold text-white mt-0.5">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-sm font-bold">
              {totalCount}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Pending Moderation</p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-bold">
              {pendingCount}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Answered / Handled</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{answeredCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-sm font-bold">
              {answeredCount}
            </div>
          </div>

          <div className={`rounded-xl p-4 flex items-center justify-between border transition-all ${
            activeLiveQuestion 
              ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
              : 'bg-slate-900/50 border-slate-800/60'
          }`}>
            <div>
              <p className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${activeLiveQuestion ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                Stage Display Status
              </p>
              <p className="text-sm font-bold text-white mt-1 truncate max-w-[150px]">
                {activeLiveQuestion ? 'Question Active' : 'Idle (QR Code)'}
              </p>
            </div>
            {activeLiveQuestion && (
              <button
                onClick={handleClearLive}
                disabled={isProcessing}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-mono font-medium transition-colors"
                title="Clear current question from stage"
              >
                Clear Stage
              </button>
            )}
          </div>
        </div>

        {/* Active Question Spotlight Bar (if active) */}
        {activeLiveQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-mono text-[10px] font-extrabold uppercase tracking-wide">
                      ON LIVE SCREEN
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">{activeLiveQuestion.name}</span>
                    {activeLiveQuestion.company && (
                      <span className="text-xs text-slate-400">• {activeLiveQuestion.company}</span>
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-medium text-white line-clamp-2">
                    "{activeLiveQuestion.question}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={(e) => handleMarkAnswered(activeLiveQuestion.id, e)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Done</span>
                </button>
                <button
                  onClick={handleClearLive}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Dismiss Live</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter, Search, and Fullscreen Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['all', 'pending', 'live', 'answered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === tab
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? `All (${totalCount})` : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendee or question..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Question List'}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                isFullscreen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Questions Feed Container with Fullscreen Ref */}
        <div
          ref={questionListRef}
          className={isFullscreen ? 'fixed inset-0 z-50 bg-[#070B1E] p-4 sm:p-8 overflow-y-auto' : ''}
        >
          {isFullscreen && (
            <div className="max-w-7xl mx-auto flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/techx%20for%20dark.png" 
                  alt="TechX Summit" 
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="h-4 w-px bg-slate-800" />
                <span className="font-bold text-white text-sm tracking-wide">
                  Live Questions Feed ({filteredQuestions.length})
                </span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          )}

          <div className={isFullscreen ? 'max-w-7xl mx-auto' : ''}>
            {filteredQuestions.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">No Questions Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  {searchQuery ? 'No submitted questions matched your search query.' : 'Waiting for audience submissions to arrive in real time.'}
                </p>
                <button
                  onClick={handleSeed}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load 3 Demo Questions</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:gap-4">
                {filteredQuestions.map((q) => {
                  const isCurrentlyLive = q.isSelected && q.status === 'live';

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl p-5 border transition-all relative ${
                        isCurrentlyLive
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : q.status === 'answered'
                          ? 'bg-slate-900/40 border-slate-800/50 opacity-70'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700/90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Top Meta info */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {isCurrentlyLive && (
                              <span className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 text-[10px] font-extrabold uppercase font-mono tracking-wider">
                                ACTIVE ON STAGE
                              </span>
                            )}
                            {q.status === 'answered' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                                ANSWERED
                              </span>
                            )}
                            <span className="font-semibold text-sm text-white">{q.name}</span>
                            {q.company && (
                              <span className="text-xs text-slate-400">• {q.company}</span>
                            )}
                            <span className="text-[11px] font-mono text-slate-400 ml-auto sm:ml-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {q.timestamp}
                            </span>
                          </div>

                          {/* Question Text */}
                          <p className={`text-slate-200 leading-relaxed font-normal ${isFullscreen ? 'text-lg font-medium' : 'text-sm sm:text-base'}`}>
                            "{q.question}"
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          {!isCurrentlyLive ? (
                            <button
                              onClick={() => setPendingLiveQuestion(q)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/10"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Display Live</span>
                            </button>
                          ) : (
                            <button
                              onClick={handleClearLive}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Take Down</span>
                            </button>
                          )}

                          {q.status !== 'answered' && (
                            <button
                              onClick={(e) => handleMarkAnswered(q.id, e)}
                              title="Mark as answered"
                              className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 transition-colors border border-slate-800"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDelete(q.id, e)}
                            title="Delete question"
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors border border-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Display Live */}
      <AnimatePresence>
        {pendingLiveQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Tv className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Display Question on Live Stage?
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Are you sure you want to display this question live on the presentation screen?
              </p>

              {/* Question Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                <div className="text-xs text-cyan-400 font-semibold mb-1">
                  {pendingLiveQuestion.name}
                  {pendingLiveQuestion.company && ` • ${pendingLiveQuestion.company}`}
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{pendingLiveQuestion.question}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingLiveQuestion(null)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisplayLive}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                >
                  {isProcessing ? (
                    <span>Broadcasting...</span>
                  ) : (
                    <>
                      <Tv className="w-3.5 h-3.5" />
                      <span>Yes, Display Live</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Firebase Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Firebase Firestore Configuration</h3>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Connected to <strong className="text-cyan-400">itap-db</strong> Cloud Firestore. Live sync is active across participant questions and stage projection displays.
              </p>

              <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Firestore Database ID
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigInput.firestoreDatabaseId || 'ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676'}
                    onChange={(e) => setFirebaseConfigInput({ ...firebaseConfigInput, firestoreDatabaseId: e.target.value })}
                    placeholder="ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676"
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg px-3 py-2 text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigInput.projectId || 'itap-db'}
                    onChange={(e) => setFirebaseConfigInput({ ...firebaseConfigInput, projectId: e.target.value })}
                    placeholder="itap-db"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigInput.apiKey || ''}
                    onChange={(e) => setFirebaseConfigInput({ ...firebaseConfigInput, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigInput.appId || '1:768834139783:web:83ef2135331ba1dd4a6a22'}
                    onChange={(e) => setFirebaseConfigInput({ ...firebaseConfigInput, appId: e.target.value })}
                    placeholder="1:768834139783:web:83ef2135331ba1dd4a6a22"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* Connection Test Diagnostics */}
                <div className="pt-2 pb-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Live Connection Diagnostics</span>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConn}
                      className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingConn ? 'animate-spin' : ''}`} />
                      <span>{isTestingConn ? 'Running Test...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                      testResult.ok
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        {testResult.ok ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Connection Verified: OK</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Connection Test Failed</span>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-0.5 pt-1">
                        <div>Database: <span className="text-cyan-300">{testResult.databaseId}</span></div>
                        <div>Project: <span className="text-white">{testResult.projectId}</span></div>
                        {testResult.ok && (
                          <>
                            <div>Write Ping: <span className="text-emerald-300">{testResult.writeLatencyMs} ms</span> | Read Ping: <span className="text-emerald-300">{testResult.readLatencyMs} ms</span></div>
                            <div>Collections: <span className="text-white">{testResult.questionCount} questions</span>, <span className="text-white">{testResult.registrationCount} registrations</span></div>
                          </>
                        )}
                        {testResult.error && (
                          <div className="text-red-300 mt-1 font-sans">{testResult.error}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow"
                  >
                    Save & Reconnect
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

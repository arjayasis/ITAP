import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  CheckCircle2, 
  Sparkles, 
  MessageSquarePlus, 
  User, 
  HelpCircle,
  Radio,
  UserCheck
} from 'lucide-react';
import { submitQuestion } from '../../lib/firebaseQa';

export const TechXParticipantQA: React.FC = () => {
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; question: string; timestamp: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = isAnonymous ? 'Anonymous' : name.trim();
    if (!isAnonymous && !effectiveName) {
      setErrorMsg('Please enter your full name or select Submit as Anonymous');
      return;
    }
    if (!question.trim()) {
      setErrorMsg('Please type your question for the speakers');
      return;
    }
    if (question.trim().length < 10) {
      setErrorMsg('Please provide a slightly more descriptive question (at least 10 characters)');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await submitQuestion(effectiveName, question, '');
      setSubmittedData({
        name: result.name,
        question: result.question,
        timestamp: result.timestamp
      });
      setIsSubmitted(true);
      setQuestion('');
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err?.message || 'Failed to submit question. Please check network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#070B1E] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#070B1E]/80 backdrop-blur-md px-4 py-4 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/techx%20for%20dark.png" 
              alt="TechX Summit 2026" 
              className="h-8 sm:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase hidden sm:inline-block">
              Interactive Q&A
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Badge & Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Audience Participation Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Submit Your Question
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Ask a question to keynote speakers and panelists. Selected questions will be spotlighted live on the stage screen.
                </p>
              </div>

              {/* Form Container */}
              <form 
                onSubmit={handleSubmit}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

                {errorMsg && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Participant Name & Anonymous Option */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">
                      Your Name {!isAnonymous && <span className="text-cyan-400">*</span>}
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => {
                          setIsAnonymous(e.target.checked);
                          if (e.target.checked) {
                            setErrorMsg('');
                          }
                        }}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isAnonymous 
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950' 
                          : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
                      }`}>
                        {isAnonymous && <UserCheck className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className={`text-xs font-mono transition-colors ${
                        isAnonymous ? 'text-cyan-300 font-semibold' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>
                        Post Anonymously
                      </span>
                    </label>
                  </div>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      isAnonymous ? 'text-slate-600' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      value={isAnonymous ? 'Anonymous' : name}
                      disabled={isAnonymous}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAnonymous ? 'Anonymous Attendee' : 'e.g. Juan Dela Cruz'}
                      required={!isAnonymous}
                      className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-500 transition-all ${
                        isAnonymous 
                          ? 'border-slate-800/60 text-slate-400 cursor-not-allowed bg-slate-950/40 italic' 
                          : 'border-slate-800 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Question Field */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">
                      Your Question <span className="text-cyan-400">*</span>
                    </label>
                    <span className={`text-[11px] font-mono ${question.length > 350 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {question.length} / 400
                    </span>
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => {
                      if (e.target.value.length <= 400) {
                        setQuestion(e.target.value);
                      }
                    }}
                    rows={4}
                    placeholder="Type your question clearly for the moderator and speakers..."
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none leading-relaxed"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Clear, concise questions have the highest chance of being featured on stage.</span>
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting || (!isAnonymous && !name.trim()) || !question.trim()}
                  className="w-full relative group overflow-hidden rounded-xl p-px font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-300 group-hover:scale-105" />
                  <span className="relative flex items-center justify-center gap-2 bg-[#0A0F29] px-6 py-3.5 rounded-[11px] text-white group-hover:bg-[#0A0F29]/80 transition-all">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>Sending to Stage...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                        <span>Submit Question to Panel</span>
                      </>
                    )}
                  </span>
                </button>
              </form>
            </motion.div>
          ) : (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Question Submitted!
              </h2>
              <p className="text-sm text-slate-300 mb-6">
                Thank you, <strong className="text-cyan-400">{submittedData?.name}</strong>. Your question has been delivered to the host moderation console.
              </p>

              {/* Question Preview Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
                  <span className="text-cyan-400 font-semibold">Your Question</span>
                  <span>{submittedData?.timestamp}</span>
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{submittedData?.question}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-md text-sm"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Submit Another Question</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 px-4 py-4 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 ITAP TechX Summit</p>
      </footer>
    </div>
  );
};


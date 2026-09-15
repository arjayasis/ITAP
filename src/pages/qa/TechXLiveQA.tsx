import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Maximize2, 
  Minimize2, 
  QrCode, 
  Sparkles, 
  User, 
  Building2, 
  Clock, 
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { subscribeActiveQuestion, subscribeConnectionStatus, ConnectionStatus } from '../../lib/firebaseQa';
import { QAQuestion } from '../../types/qa';
import { QRCodeCanvas } from '../../components/QRCodeCanvas';

export const TechXLiveQA: React.FC = () => {
  const [activeQuestion, setActiveQuestion] = useState<QAQuestion | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participantUrl, setParticipantUrl] = useState('');
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Generate full URL pointing to participant page with clean, web-safe slug
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setParticipantUrl(`${origin}/techx-qa`);
    }

    // Subscribe to active question updates in real time
    const unsubscribe = subscribeActiveQuestion((question) => {
      setActiveQuestion(question);
    });

    const unsubStatus = subscribeConnectionStatus((status) => {
      setConnStatus(status);
    });

    return () => {
      unsubscribe();
      unsubStatus();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-screen bg-[#060919] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 font-sans relative overflow-hidden"
    >
      {/* Dynamic Cyber Tech Stage Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-[700px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[600px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle tech grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-12 py-5 sm:py-6 flex items-center justify-between border-b border-slate-800/60 bg-[#060919]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img 
            src="https://marketing.timcorp.net.ph/hubfs/ITAP/techx%20for%20dark.png" 
            alt="TechX Summit 2026" 
            className="h-9 sm:h-11 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              ITAP 2nd GMM 2026
            </span>
            <span className="text-[11px] text-slate-400">
              Interactive Audience Q&A Session
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live indicator radar pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="font-semibold tracking-wider">LIVE STAGE</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Stage Display Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!activeQuestion ? (
            /* ========================================================= */
            /* DEFAULT STATE: No Question Selected (Prominent QR Code)   */
            /* ========================================================= */
            <motion.div
              key="default-qr-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center flex flex-col items-center max-w-3xl w-full"
            >
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-mono mb-6 shadow-lg shadow-cyan-500/10">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Open Floor For Audience Questions</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Scan to Ask a Question
              </h1>
              <p className="text-base sm:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
                Point your phone camera at the QR code to submit questions directly to keynote speakers and panelists.
              </p>

              {/* High-Resolution Dynamic Scannable QR Code */}
              <div className="relative group p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl shadow-cyan-500/15 mb-8">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-30 blur-xl group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
                <div className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-inner flex flex-col items-center">
                  <QRCodeCanvas 
                    value={participantUrl || (typeof window !== 'undefined' ? `${window.location.origin}/techx-qa` : '')}
                    size={260}
                    darkColor="#070B1E"
                    lightColor="#FFFFFF"
                  />
                  <div className="mt-3 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-800 font-bold">
                      TechX Interactive Q&A
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Web Address for Laptop Users */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm font-mono text-slate-300">
                <span className="text-cyan-400 font-semibold">Direct link:</span>
                <span className="text-white underline underline-offset-4 decoration-cyan-500">
                  {participantUrl ? participantUrl.replace(/^https?:\/\//, '') : 'itaphil.com/techx-qa'}
                </span>
              </div>
            </motion.div>
          ) : (
            /* ========================================================= */
            /* ACTIVE STATE: Question Selected by Host                   */
            /* ========================================================= */
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full max-w-5xl flex flex-col justify-center relative"
            >
              {/* Question Presentation Stage Card */}
              <div className="relative rounded-[32px] p-8 sm:p-14 md:p-16 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-[#0A0F29]/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
                {/* Stage ambient lights */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm" />
                <div className="absolute -top-24 right-1/4 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Badge */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400 text-slate-950 text-xs font-mono font-extrabold uppercase tracking-wider shadow-md shadow-cyan-400/20">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Audience Question</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeQuestion.timestamp}</span>
                  </div>
                </div>

                {/* Huge Question Typography for Stage / Projector */}
                <blockquote className="mb-10 sm:mb-12">
                  <p className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.3] text-left">
                    "{activeQuestion.question}"
                  </p>
                </blockquote>

                {/* Participant Identity Bar */}
                <div className="pt-6 sm:pt-8 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-lg shadow-md">
                      {activeQuestion.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                        {activeQuestion.name}
                      </h3>
                      {activeQuestion.company && (
                        <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-0.5">
                          {activeQuestion.company}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Corner Mini QR Code for Late Submitters */}
                  <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-2.5 sm:px-3 sm:py-2 self-start sm:self-center">
                    <div className="bg-white p-1 rounded-lg">
                      <QRCodeCanvas 
                        value={participantUrl || (typeof window !== 'undefined' ? `${window.location.origin}/techx-qa` : '')}
                        size={64}
                        darkColor="#070B1E"
                        lightColor="#FFFFFF"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold leading-tight">
                        Have a Question?
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        Scan to submit
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Stage Bottom Footer */}
      <footer className="relative z-20 px-6 sm:px-12 py-4 flex items-center justify-between border-t border-slate-900/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>TechX Summit 2026</span>
          <span>•</span>
          <span>Technological Institute of the Philippines (T.I.P.) QC</span>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  X, 
  ExternalLink, 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link as LinkIcon,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  image: string | null;
  venue: string;
  overview: string;
  videoUrl?: string;
  eventPhotos?: string[];
}

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const isDirectVideo = (url?: string) => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('.mp4');
};

// Rich text renderer for markdown headings, bold, italics, and bullet points
const parseFormattedInline = (str: string) => {
  const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      return (
        <strong key={bIdx} className="text-white font-bold">
          {bPart.slice(2, -2)}
        </strong>
      );
    }
    const italicParts = bPart.split(/(\*[^*]+\*)/g);
    return (
      <React.Fragment key={bIdx}>
        {italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith('*') && iPart.endsWith('*') && !iPart.startsWith('**')) {
            return (
              <em key={iIdx} className="text-brand-cyan/90 font-medium italic">
                {iPart.slice(1, -1)}
              </em>
            );
          }
          return iPart;
        })}
      </React.Fragment>
    );
  });
};

const renderFormattedOverview = (text: string) => {
  if (!text || text === 'N/A') return 'No additional details available for this event.';

  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a heading (e.g. ### Title)
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={pIdx} className="text-lg sm:text-xl font-display font-bold text-white text-brand-cyan pt-2 tracking-tight">
              {parseFormattedInline(trimmed.replace(/^###\s*/, ''))}
            </h4>
          );
        }

        // Check if paragraph contains bullet lines
        const lines = trimmed.split('\n');
        const isBulletList = lines.some(l => l.trim().startsWith('*') || l.trim().startsWith('•') || l.trim().startsWith('-'));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-3 my-3 pl-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[\*\•\-]\s*/, '').trim();
                if (!cleanLine) return null;
                return (
                  <li key={lIdx} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan mt-2 shrink-0 shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
                    <span className="leading-relaxed">{parseFormattedInline(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="whitespace-pre-line leading-relaxed">
            {parseFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const EventModal = ({ event, onClose }: EventModalProps) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?id=${event.id}`
    : '';
  const shareText = `Check out this ITAP event: ${event.title}`;

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
    }
    if (url) window.open(url, '_blank');
  };

  const youtubeUrl = getYouTubeEmbedUrl(event.videoUrl);
  const directVideoUrl = isDirectVideo(event.videoUrl) ? event.videoUrl : null;
  const hasPhotos = event.eventPhotos && event.eventPhotos.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-56 sm:h-72 md:h-96 shrink-0 bg-slate-950">
            {event.image ? (
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center p-12">
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
                  alt="ITAP Logo Placeholder" 
                  className="max-h-full max-w-full object-contain opacity-20"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            {/* Top Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-950/70 text-white hover:bg-brand-cyan hover:text-brand-ink transition-all backdrop-blur-md border border-white/10 cursor-pointer shadow-lg z-10"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges in Header */}
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-brand-cyan text-brand-ink px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {hasPhotos && (
                  <div className="bg-slate-950/80 text-white border border-white/15 px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>{event.eventPhotos!.length} Photos</span>
                  </div>
                )}

                {(youtubeUrl || directVideoUrl) && (
                  <div className="bg-slate-950/80 text-brand-cyan border border-brand-cyan/30 px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <Play className="w-3.5 h-3.5 fill-brand-cyan" />
                    <span>Recap Video</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              <div className="flex-1 space-y-8">
                {/* Title and Metadata */}
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-3 tracking-tight leading-tight">
                    {event.title}
                  </h2>
                  
                  {event.subtitle && (
                    <p className="text-base sm:text-lg font-mono text-brand-cyan mb-4 font-semibold">
                      {event.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 text-brand-cyan shrink-0" />
                      <span className="text-xs sm:text-sm">{event.venue !== 'N/A' ? event.venue : 'To be announced'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-brand-cyan shrink-0" />
                      <span className="text-xs sm:text-sm">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                    </div>
                  </div>
                </div>

                {/* Event Highlights & Overview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand-cyan font-bold">
                      Event Highlights & Recap
                    </h3>
                  </div>
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                    {renderFormattedOverview(event.overview)}
                  </div>
                </div>

                {/* Video Section (MP4 Direct Video or YouTube Embed) */}
                {(directVideoUrl || youtubeUrl) && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-brand-cyan fill-brand-cyan" />
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand-cyan font-bold">
                        Event Recap Video
                      </h3>
                    </div>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                      {directVideoUrl ? (
                        <video
                          src={directVideoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain bg-black"
                          poster={event.image || undefined}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <iframe
                          src={youtubeUrl!}
                          title={event.title}
                          className="absolute top-0 left-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Event Photo Gallery */}
                {hasPhotos && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-cyan" />
                        <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand-cyan font-bold">
                          Official Event Photo Gallery
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {event.eventPhotos!.length} Photos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {event.eventPhotos!.map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setActivePhotoIndex(pIdx)}
                          className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer shadow-md hover:border-brand-cyan/50 transition-all hover:scale-[1.02]"
                        >
                          <img
                            src={photoUrl}
                            alt={`Event Photo ${pIdx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2 rounded-full bg-slate-950/80 text-brand-cyan border border-brand-cyan/40">
                              <Maximize2 className="w-4 h-4" />
                            </span>
                          </div>
                          <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-mono text-white/90">
                            #{pIdx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:w-72 shrink-0 space-y-6">
                {/* Event Status Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">Event Status</h4>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold font-mono">Successfully Completed</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Official summit archives and proceedings preserved by ITAP.
                  </p>
                </div>

                {/* TechX Specific Portal Access */}
                {event.id === '2nd-gmm-2026-techx' && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 border border-brand-cyan/30 space-y-3">
                    <div className="flex items-center gap-2 text-brand-cyan">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="text-xs font-mono uppercase tracking-widest font-bold">TechX Portal</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      Explore the live attendee registry, conference agenda, and check-in portal.
                    </p>
                    <Link
                      to="/TechXSummit2026"
                      className="w-full py-3 rounded-xl bg-brand-cyan text-brand-ink font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-teal transition-colors shadow-lg"
                    >
                      <span>Visit TechX Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* Share Event Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Share Event</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-brand-blue transition-all flex items-center justify-center cursor-pointer"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center cursor-pointer"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleShare('linkedin')}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-[#0077b5] transition-all flex items-center justify-center cursor-pointer"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleShare('copy')}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                        copied ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-brand-cyan hover:text-brand-ink'
                      }`}
                      title={copied ? 'Copied!' : 'Copy Link'}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  className={`w-full py-3.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                  }`}
                  onClick={() => {
                    handleShare('copy');
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Link Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-brand-cyan" />
                      <span>Share Recap Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox Modal for Photo Gallery */}
      <AnimatePresence>
        {activePhotoIndex !== null && event.eventPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg"
            onClick={() => setActivePhotoIndex(null)}
          >
            <div 
              className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="absolute top-2 right-2 sm:-top-12 sm:right-0 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-30"
                title="Close Photo"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev / Next Buttons */}
              {event.eventPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev! > 0 ? prev! - 1 : event.eventPhotos!.length - 1))}
                    className="absolute left-2 sm:-left-16 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-brand-cyan hover:text-black text-white border border-white/20 transition-all cursor-pointer z-30 shadow-xl"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev! < event.eventPhotos!.length - 1 ? prev! + 1 : 0))}
                    className="absolute right-2 sm:-right-16 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-brand-cyan hover:text-black text-white border border-white/20 transition-all cursor-pointer z-30 shadow-xl"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl max-h-[80vh] flex items-center justify-center">
                <img
                  src={event.eventPhotos[activePhotoIndex]}
                  alt={`Event Photo ${activePhotoIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Footer info */}
              <div className="mt-3 text-center text-xs font-mono text-slate-400">
                Photo {activePhotoIndex + 1} of {event.eventPhotos.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


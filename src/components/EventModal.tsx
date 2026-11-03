import React, { useState, useEffect } from 'react';
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
  Check,
  ArrowLeft,
  Building2,
  BookmarkCheck
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
        <strong key={bIdx} className="text-white font-semibold">
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
              <em key={iIdx} className="text-brand-cyan/95 font-medium italic">
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
    <div className="space-y-6 text-slate-300 text-base sm:text-lg leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Heading 3 (###)
        if (trimmed.startsWith('###')) {
          return (
            <div key={pIdx} className="pt-6 pb-2 border-b border-white/10">
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2.5 tracking-tight">
                <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
                <span>{parseFormattedInline(trimmed.replace(/^###\s*/, ''))}</span>
              </h3>
            </div>
          );
        }

        // Bullet list
        const lines = trimmed.split('\n');
        const isBulletList = lines.some(l => l.trim().startsWith('*') || l.trim().startsWith('•') || l.trim().startsWith('-'));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-3.5 my-4 pl-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[\*\•\-]\s*/, '').trim();
                if (!cleanLine) return null;
                return (
                  <li key={lIdx} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3.5 sm:p-4 hover:border-brand-cyan/30 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan mt-2 shrink-0 shadow-[0_0_8px_rgba(0,210,255,0.7)]" />
                    <span className="leading-relaxed text-slate-200">{parseFormattedInline(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} className={`leading-relaxed sm:leading-loose text-slate-300 ${pIdx === 0 ? 'text-lg sm:text-xl font-medium text-slate-100 border-l-2 border-brand-cyan pl-4 py-1' : ''}`}>
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

  // Lock body scroll while full screen article is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePhotoIndex !== null) {
          setActivePhotoIndex(null);
        } else {
          onClose();
        }
      } else if (activePhotoIndex !== null && event.eventPhotos) {
        if (e.key === 'ArrowLeft') {
          setActivePhotoIndex((prev) => (prev! > 0 ? prev! - 1 : event.eventPhotos!.length - 1));
        } else if (e.key === 'ArrowRight') {
          setActivePhotoIndex((prev) => (prev! < event.eventPhotos!.length - 1 ? prev! + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhotoIndex, event.eventPhotos, onClose]);

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
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-slate-950 text-white overflow-y-auto w-full h-full"
      >
        {/* Sticky Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs sm:text-sm font-mono font-medium transition-colors cursor-pointer shrink-0"
              title="Return to Events"
            >
              <ArrowLeft className="w-4 h-4 text-brand-cyan" />
              <span>Back to Events</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 truncate">
              <span>/</span>
              <span className="text-brand-cyan truncate max-w-md">{event.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Share Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-white/10">
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 rounded-lg bg-white/5 hover:bg-[#1877f2] hover:text-white text-slate-300 transition-colors cursor-pointer"
                title="Share on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 rounded-lg bg-white/5 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer"
                title="Share on X (Twitter)"
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 rounded-lg bg-white/5 hover:bg-[#0077b5] hover:text-white text-slate-300 transition-colors cursor-pointer"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  copied ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/5 hover:bg-brand-cyan hover:text-brand-ink text-slate-300'
                }`}
                title={copied ? 'Link Copied!' : 'Copy Link'}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title="Close Full Screen View (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Full-Width Cover Image Hero (spans edge-to-edge of the page) */}
        {event.image ? (
          <div className="relative w-full overflow-hidden bg-slate-950 border-b border-white/10 min-h-[440px] sm:min-h-[520px] lg:min-h-[600px] flex flex-col justify-end">
            {/* Background Cover Image */}
            <img
              src={event.image}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />

            {/* Bottom-to-top subtle dark gradient overlay at the base (45-55%) for high legibility */}
            <div className="absolute inset-x-0 bottom-0 h-[48%] md:h-[55%] bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent pointer-events-none z-10" />

            {/* ONLY Event Title, Date, and Event Venue Inside Cover Image */}
            <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-8 sm:pb-12 pt-6">
              <div className="space-y-3 sm:space-y-4 max-w-4xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-[1.15] drop-shadow-2xl">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs sm:text-sm md:text-base font-mono text-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span className="font-semibold text-white">
                      {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {event.venue && event.venue !== 'N/A' && (
                    <>
                      <span className="text-white/40 hidden sm:inline">•</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-cyan shrink-0" />
                        <span className="text-slate-200 font-medium">{event.venue}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Article Body Container */}
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {/* Fallback Header when no cover image is provided */}
          {!event.image && (
            <div className="relative mb-10 sm:mb-14 p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-xl space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.12]">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-white/10 text-xs sm:text-sm font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-cyan shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {event.venue && event.venue !== 'N/A' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* The Rest of the Info Placed OUTSIDE the Cover Image */}
          <div className="mb-10 pb-8 border-b border-white/10 space-y-4">
            {/* Top Badges & Edition */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-brand-cyan font-bold bg-brand-cyan/10 border border-brand-cyan/30 px-3 py-1.5 rounded-full shadow-sm">
                  ITAP Official Article & Proceedings
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Official Archives
                </span>
              </div>

              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 shadow-sm">
                {new Date(event.date).getFullYear()} Edition
              </span>
            </div>

            {/* Subtitle if available */}
            {event.subtitle && (
              <p className="text-base sm:text-lg font-mono text-brand-cyan/90 font-medium leading-relaxed">
                {event.subtitle}
              </p>
            )}

            {/* Author, Photo & Video Indicators */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 pt-2 text-xs sm:text-sm font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-cyan shrink-0" />
                <span>ITAP Communications & Secretariat</span>
              </div>
              {hasPhotos && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <ImageIcon className="w-4 h-4 text-brand-cyan shrink-0" />
                  <span>{event.eventPhotos!.length} Photos in Gallery</span>
                </div>
              )}
              {(directVideoUrl || youtubeUrl) && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Play className="w-4 h-4 text-brand-cyan fill-brand-cyan shrink-0" />
                  <span>Video Coverage Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Editorial Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Article Content (8 columns) */}
            <article className="lg:col-span-8 space-y-10">
              {/* Formatted Article Prose */}
              <div className="prose prose-invert max-w-none">
                {renderFormattedOverview(event.overview)}
              </div>

              {/* Video Section */}
              {(directVideoUrl || youtubeUrl) && (
                <div className="space-y-4 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                      <Play className="w-4 h-4 fill-brand-cyan" />
                    </div>
                    <div>
                      <h2 className="text-lg font-display font-bold text-white tracking-tight">
                        Official Event Recap Video
                      </h2>
                      <p className="text-xs font-mono text-slate-400">
                        Watch highlights and milestone moments from the summit
                      </p>
                    </div>
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

              {/* Photo Gallery Grid */}
              {hasPhotos && (
                <div className="space-y-5 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-display font-bold text-white tracking-tight">
                          Summit Photo Gallery
                        </h2>
                        <p className="text-xs font-mono text-slate-400">
                          Click any photo to view full resolution
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-cyan">
                      {event.eventPhotos!.length} Photos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {event.eventPhotos!.map((photoUrl, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setActivePhotoIndex(pIdx)}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-900 cursor-pointer shadow-md hover:border-brand-cyan transition-all hover:scale-[1.02]"
                      >
                        <img
                          src={photoUrl}
                          alt={`Summit Photo ${pIdx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-2.5 rounded-full bg-brand-cyan text-brand-ink shadow-lg">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white/90">
                          Photo #{pIdx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Return Button */}
              <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-all border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-brand-cyan" />
                  <span>Back to All Events</span>
                </button>

                <button
                  onClick={() => handleShare('copy')}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-brand-cyan text-brand-ink hover:bg-brand-teal border-transparent shadow-md'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Article Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Article</span>
                    </>
                  )}
                </button>
              </div>
            </article>

            {/* Sidebar / Context Column (4 columns) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Event Metadata Card */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Event Information
                </h4>
                
                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-cyan mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Date</div>
                      <div className="font-semibold text-white">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-cyan mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Venue / Location</div>
                      <div className="text-white">
                        {event.venue !== 'N/A' ? event.venue : 'Official Venue'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookmarkCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Status</div>
                      <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Completed & Archived
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Share Card */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Share This Article
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="p-3 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-[#1877f2] transition-colors flex items-center justify-center cursor-pointer"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="p-3 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                    title="Share on X (Twitter)"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="p-3 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-[#0077b5] transition-colors flex items-center justify-center cursor-pointer"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare('copy')}
                    className={`p-3 rounded-xl transition-colors flex items-center justify-center cursor-pointer ${
                      copied ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-brand-cyan hover:text-brand-ink'
                    }`}
                    title={copied ? 'Link Copied!' : 'Copy Link'}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ITAP About Callout */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">About ITAP</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Infocomm Technology Association of the Philippines (ITAP) unites ICT leaders, innovators, and academia to champion technology excellence and sustainable progress.
                </p>
                <Link
                  to="/membership"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-cyan hover:underline pt-1"
                >
                  <span>Learn about membership</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </aside>
          </div>
        </main>
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
                  alt={`Summit Photo ${activePhotoIndex + 1}`}
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

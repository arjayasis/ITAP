import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Globe, 
  Users, 
  ShieldCheck, 
  Zap, 
  Network, 
  GraduationCap, 
  Handshake,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  User,
  Activity,
  Layers,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  X,
  Download
} from 'lucide-react';
import pptxgen from "pptxgenjs";
import { memberCompanies, newMembers } from '../data/membersData';

// --- Animation Variants ---

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// --- Helper Components ---

const GlobeNetwork = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-20">
      {/* Small Animated Grid Lines for Tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Large Globe Graphic (SVG) - Positioned more subtley */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute -right-[15%] -bottom-[15%] w-[90%] h-[90%] md:w-[70%] md:h-[70%] text-brand-cyan/15"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current stroke-[0.3]">
          <circle cx="50" cy="50" r="48" />
          <ellipse cx="50" cy="50" rx="48" ry="15" />
          <ellipse cx="50" cy="50" rx="15" ry="48" />
          <path d="M2 50 H98 M50 2 V98" />
        </svg>
      </motion.div>
    </div>
  );
};

const SlideWrapper = ({ children, className = "", dark = false, showGlobe = true, showLogo = true, isPortrait = false }: { children: React.ReactNode, className?: string, dark?: boolean, showGlobe?: boolean, showLogo?: boolean, isPortrait?: boolean }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    exit="exit"
    className={`w-full h-full flex flex-col items-center justify-center ${isPortrait ? 'p-8 md:p-12' : 'p-4 md:p-8 lg:p-12'} relative overflow-hidden ${className} ${dark ? 'bg-slate-950 text-white' : 'bg-white text-brand-ink'}`}
  >
    {showGlobe && <GlobeNetwork />}
    
    {/* Persistent Top Branding Logo (Optional) */}
    {showLogo && (
      <div className={`absolute ${isPortrait ? 'top-12 right-12' : 'top-6 right-8 md:top-8 md:right-12'} z-20 opacity-20 hover:opacity-50 transition-opacity`}>
        <img 
          src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
          alt="ITAP Branding" 
          className={`${isPortrait ? 'h-12' : 'h-6 md:h-8'} object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>
    )}

    <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center ${isPortrait ? 'max-w-[1000px]' : 'max-w-[1850px]'} mx-auto`}>
      {children}
    </div>
  </motion.div>
);

const SectionDivider = ({ title, tagline, isPortrait = false }: { title: string, tagline: string, isPortrait?: boolean }) => (
  <SlideWrapper dark className="overflow-hidden" showGlobe={false} isPortrait={isPortrait}>
    <div className="absolute inset-0 bg-slate-950">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.2)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
    </div>
    <motion.div
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="text-center relative z-10"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute -top-12 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent"
      />
      <h2 className={`font-display font-bold mb-12 tracking-tighter uppercase leading-none ${isPortrait ? 'text-8xl space-y-6' : 'text-6xl md:text-8xl lg:text-9xl'}`}>
        {isPortrait ? (
          title.split(' ').map((word, wi) => (
            <div key={wi} className="block">
              {word.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (wi * 5 + i) * 0.05 }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          ))
        ) : (
          title.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              {char}
            </motion.span>
          ))
        )}
      </h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-center gap-4"
      >
        <div className="h-px w-8 md:w-12 bg-brand-cyan/50" />
        <p className={`text-brand-cyan font-mono tracking-[0.4em] uppercase ${isPortrait ? 'text-2xl' : 'text-xs md:text-sm'}`}>
          {tagline}
        </p>
        <div className="h-px w-8 md:w-12 bg-brand-cyan/50" />
      </motion.div>
    </motion.div>
  </SlideWrapper>
);

interface SlideSettings {
  id: string;
  active: boolean;
}

const DeckManager = ({ 
  isOpen, 
  onClose, 
  slides, 
  registry, 
  onReorder, 
  onToggle,
  onReset,
  onExport
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  slides: SlideSettings[];
  registry: any[];
  onReorder: (newOrder: string[]) => void;
  onToggle: (id: string) => void;
  onReset: () => void;
  onExport: () => void;
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[200] border-l border-slate-100 flex flex-col pt-16"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-cyan/10 rounded-xl text-brand-cyan">
             <LayoutsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-brand-ink text-xl">Deck Manager</h3>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Drag to reorder</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Reorder.Group 
          axis="y" 
          values={slides.map(s => s.id)} 
          onReorder={onReorder}
          className="space-y-2"
        >
          {slides.map((slide) => {
            const config = registry.find(r => r.id === slide.id);
            if (!config) return null;

            return (
              <Reorder.Item 
                key={slide.id} 
                value={slide.id}
                className={`relative group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                  slide.active 
                    ? 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-brand-cyan/20' 
                    : 'bg-slate-50 border-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span className="text-brand-ink font-bold text-sm truncate">{config.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{config.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(slide.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.active 
                        ? 'text-slate-400 hover:text-brand-cyan hover:bg-brand-cyan/10' 
                        : 'text-slate-300 hover:text-slate-600 hover:bg-slate-200'
                    }`}
                    title={slide.active ? "Hide Slide" : "Show Slide"}
                  >
                    {slide.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <div className="p-2 text-slate-300 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>

                {!slide.active && (
                   <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none rounded-2xl" />
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-4 px-6 rounded-2xl bg-brand-ink text-white font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-3"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export to PowerPoint
            </>
          )}
        </button>
        <button
          onClick={onReset}
          className="w-full py-3 px-6 rounded-2xl border border-slate-200 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-brand-ink transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3 h-3" />
          Reset to Default
        </button>
        <p className="text-[10px] text-slate-400 text-center font-mono uppercase tracking-tighter">
          Changes are saved automatically to local storage.
        </p>
      </div>
    </motion.div>
  );
};

const LayoutsIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

const DeckGMM2026 = ({ isPortrait = false }: { isPortrait?: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const slideParam = searchParams.get('slide');
  
  const [showManager, setShowManager] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('slide');
    if (s) {
      const idx = parseInt(s) - 1;
      return !isNaN(idx) ? idx : 0;
    }
    return 0;
  });

  // --- Slide Registry ---
  const slideRegistry = useMemo(() => [
    { id: 'title', label: 'Title Slide', type: 'content' },
    { id: 'host', label: 'Session Host', type: 'content' },
    { id: 'opening-dark', label: 'Opening (Dark)', type: 'content' },
    { id: 'remarks', label: 'Opening Remarks', type: 'content' },
    { id: 'agenda', label: 'The Agenda', type: 'content' },
    { id: 'leadership-divider', label: 'Leadership Divider', type: 'divider', title: 'Leadership', tagline: 'Guiding ITAP forward in 2026' },
    { id: 'directors', label: 'Board of Directors', type: 'content' },
    { id: 'ecosystem', label: 'Member Logos', type: 'content' },
    { id: 'innovation-divider', label: 'Innovation Divider', type: 'divider', title: 'Innovation', tagline: 'Connecting members through better platforms' },
    { id: 'digital', label: 'Digital Presence', type: 'content' },
    { id: 'impact-divider', label: 'Impact Divider', type: 'divider', title: 'Impact', tagline: 'Building impact beyond the organization' },
    { id: 'events-overview', label: 'Events Overview', type: 'content' },
    { id: 'tree-planting', label: 'Tree Planting', type: 'content' },
    { id: 'golf', label: 'Golf Tournament', type: 'content' },
    { id: 'edge-bridge', label: 'EDGE Bridge', type: 'content' },
    { id: 'edge-impact', label: 'EDGE Impact', type: 'content' },
    { id: 'partnership-message', label: 'Partnership Message', type: 'content' },
    { id: 'induction', label: 'New Members Induction', type: 'content' },
    { id: 'closing-remarks', label: 'Closing Remarks', type: 'content' },
    { id: 'final', label: 'Final Slide', type: 'content' },
  ], [isPortrait]);

  // --- persistence ---
  const [managedSlides, setManagedSlides] = useState<{ id: string, active: boolean }[]>(() => {
    const saved = localStorage.getItem('itap-deck-settings');
    if (saved) return JSON.parse(saved);
    return slideRegistry.map(s => ({ id: s.id, active: true }));
  });

  useEffect(() => {
    localStorage.setItem('itap-deck-settings', JSON.stringify(managedSlides));
  }, [managedSlides]);

  const resetSlides = () => {
    const defaultOrder = slideRegistry.map(s => ({ id: s.id, active: true }));
    setManagedSlides(defaultOrder);
    setCurrentSlide(0);
    setSearchParams({ slide: '1' }, { replace: true });
  };

  const reorderSlides = (newOrderIds: string[]) => {
    const newManaged = newOrderIds.map(id => {
      const existing = managedSlides.find(ms => ms.id === id);
      return { id, active: existing ? existing.active : true };
    });
    setManagedSlides(newManaged);
  };

  const toggleSlide = (id: string) => {
    setManagedSlides(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleExportPPTX = async () => {
    const pres = new pptxgen();

    // Define custom 2:3 Portrait Layout
    // Width 6.67 inches, Height 10 inches (approx 2:3)
    pres.defineLayout({ name: 'PORTRAIT_P23', width: 6.67, height: 10 });
    pres.layout = 'PORTRAIT_P23';

    // Set Presentation Metadata
    pres.title = "ITAP GMM 2026 Presentation";
    pres.author = "ITAP Digital";
    pres.subject = "General Membership Meeting 2026";

    // Common Slide Styles
    const BRAND_CYAN = "22D3EE";
    const BRAND_BLUE = "3B82F6";
    const DARK_SLATE = "0F172A";
    const SLATE_400 = "94A3B8";

    activeSlideConfigs.forEach((slide) => {
      const s = pres.addSlide();

      // Add Background color based on slide type or ID
      const isDark = slide.id === 'title' || slide.id === 'final' || slide.id === 'opening-dark' || slide.id === 'digital' || slide.id.includes('divider');
      const textColor = isDark ? "FFFFFF" : "0F172A";

      if (isDark) {
        s.background = { fill: DARK_SLATE };
      } else {
        s.background = { fill: "FFFFFF" };
      }

      switch (slide.id) {
        case 'title':
          // ITAP Logo
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png", 
            x: 1.8, y: 1.5, w: 3, h: 1.5, 
            sizing: { type: 'contain', w: 3, h: 1.5 } 
          });
          s.addText("ITAP 1st General", { 
            x: 0.5, y: 3.5, w: 5.67, h: 0.8, 
            align: "center", fontSize: 48, bold: true, color: textColor 
          });
          s.addText("Membership Meeting 2026", { 
            x: 0.5, y: 4.2, w: 5.67, h: 0.8, 
            align: "center", fontSize: 36, bold: true, color: BRAND_CYAN 
          });
          s.addText("Manila Golf and Country Club", { 
            x: 0.5, y: 5.5, w: 5.67, h: 0.4, 
            align: "center", fontSize: 16, color: SLATE_400 
          });
          s.addText("April 28, 2026", { 
            x: 0.5, y: 5.9, w: 5.67, h: 0.4, 
            align: "center", fontSize: 16, color: SLATE_400 
          });
          break;

        case 'host':
          s.addText("Session Host", { 
            x: 1.5, y: 0.8, w: 3.67, h: 0.5, 
            align: "center", fontSize: 14, color: BRAND_CYAN, bold: true,
            fill: { color: "FFFFFF", transparency: 90 },
            shape: pres.ShapeType.rect
          });
          // Dennis Photo
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/deck/d.lumbao.png?v=2", 
            x: 0.5, y: 1.5, w: 5.67, h: 5.5, 
            sizing: { type: 'contain', w: 5.67, h: 5.5 } 
          });
          s.addText("Dennis John Lumbao", { 
            x: 0.5, y: 7.2, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          s.addText("ITAP Board Director", { 
            x: 0.5, y: 8.2, w: 5.67, h: 0.5, 
            align: "center", fontSize: 18, color: SLATE_400 
          });
          break;

        case 'opening-dark':
          s.addText("Welcome to", { 
            x: 0.5, y: 3.5, w: 5.67, h: 0.8, 
            align: "center", fontSize: 24, color: "FFFFFF" 
          });
          s.addText("ITAP GMM 2026", { 
            x: 0.5, y: 4.3, w: 5.67, h: 1, 
            align: "center", fontSize: 54, bold: true, color: BRAND_CYAN 
          });
          break;

        case 'remarks':
          s.addText("Opening Remarks", { 
            x: 1.5, y: 0.8, w: 3.67, h: 0.5, 
            align: "center", fontSize: 14, color: BRAND_CYAN, bold: true 
          });
          // Sunver Photo
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/deck/s.bastes.png?v=2", 
            x: 0.5, y: 1.5, w: 5.67, h: 5.5, 
            sizing: { type: 'contain', w: 5.67, h: 5.5 } 
          });
          s.addText("Sunver Z. Bastes", { 
            x: 0.5, y: 7.2, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          s.addText("ITAP President", { 
            x: 0.5, y: 8.2, w: 5.67, h: 0.5, 
            align: "center", fontSize: 18, color: SLATE_400 
          });
          break;

        case 'agenda':
          s.addText("The Agenda", { 
            x: 0.5, y: 1.5, w: 5.67, h: 1, 
            align: "center", fontSize: 48, bold: true, color: textColor 
          });
          const items = ["Leadership", "ITAP Live", "EDGE Program", "New Members"];
          items.forEach((item, idx) => {
            s.addText(`${idx + 1}. ${item}`, { 
              x: 1, y: 3.5 + (idx * 0.8), w: 4.67, h: 0.6, 
              fontSize: 24, color: textColor, bold: true 
            });
          });
          break;

        case 'leadership-divider':
        case 'innovation-divider':
        case 'impact-divider':
          s.addText(slide.title, { 
            x: 0.5, y: 3.5, w: 5.67, h: 1.5, 
            align: "center", fontSize: 64, bold: true, color: BRAND_CYAN 
          });
          s.addText(slide.tagline, { 
            x: 0.5, y: 5.2, w: 5.67, h: 0.8, 
            align: "center", fontSize: 24, color: "FFFFFF" 
          });
          break;

        case 'directors':
          s.addText("Board of Directors", { 
            x: 0.5, y: 0.8, w: 5.67, h: 0.8, 
            align: "center", fontSize: 32, bold: true, color: textColor 
          });
          const directors = [
            { name: 'Sunver Bastes', pos: 'President', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/s.bastes.png?v=2' },
            { name: 'Merrick Chua', pos: 'Vice President', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.chua.png?v=2' },
            { name: 'Michael Lee', pos: 'Corp. Secretary', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.lee.png' },
            { name: 'Kathleen Kho', pos: 'Treasurer', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/k.kho.png' },
            { name: 'Rodrigo Mendoza', pos: 'Director', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/r.mendoza.png' },
            { name: 'Dennis John Lumbao', pos: 'Director', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/d.lumbao.png?v=2' },
            { name: 'Michael Raymond Remoquillo', pos: 'Director', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.remoquillo.png' },
          ];
          directors.forEach((dir, idx) => {
            const yPos = 1.8 + (idx * 1.1);
            if (dir.img) {
              s.addImage({ 
                path: dir.img, 
                x: 0.8, y: yPos, w: 0.8, h: 0.8,
                sizing: { type: 'contain', w: 0.8, h: 0.8 } 
              });
            }
            s.addText(dir.name, { 
              x: 1.8, y: yPos, w: 4, h: 0.4, 
              fontSize: 18, bold: true, color: textColor 
            });
            s.addText(dir.pos, { 
              x: 1.8, y: yPos + 0.4, w: 4, h: 0.3, 
              fontSize: 12, color: BRAND_CYAN, bold: true 
            });
          });
          break;

        case 'ecosystem':
          s.addText("Member Organizations", { 
            x: 0.5, y: 0.8, w: 5.67, h: 1, 
            align: "center", fontSize: 36, bold: true, color: textColor 
          });
          s.addText(`${memberCompanies.length} Organizations Shaping the Future`, { 
            x: 0.5, y: 1.8, w: 5.67, h: 0.5, 
            align: "center", fontSize: 16, color: SLATE_400 
          });
          break;

        case 'digital':
          s.addText("ITAP Digital Presence", { 
            x: 0.5, y: 2.5, w: 5.67, h: 1, 
            align: "center", fontSize: 36, bold: true, color: "FFFFFF" 
          });
          s.addText("test.itaphil.com", { 
            x: 0.5, y: 3.8, w: 5.67, h: 0.5, 
            align: "center", fontSize: 24, color: BRAND_CYAN, bold: true 
          });
          break;

        case 'events-overview':
          s.addText("ITAP Key Events 2026", { 
            x: 0.5, y: 0.8, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          const events = [
            "ITAP EDGE Program Launch", 
            "Tree Planting Initiative", 
            "12th ITAP & Friends Golf"
          ];
          events.forEach((event, idx) => {
            s.addText(`• ${event}`, { 
              x: 1, y: 3 + (idx * 0.8), w: 4.67, h: 0.6, 
              fontSize: 24, color: textColor, bold: true 
            });
          });
          break;

        case 'tree-planting':
          s.addText("Tree Planting", { 
            x: 0.5, y: 0.8, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Tree Planting Activity with One Meralco Foundation.jpg", 
            x: 0.5, y: 2, w: 5.67, h: 4, 
            sizing: { type: 'contain', w: 5.67, h: 4 } 
          });
          s.addText("Sustainability with One Meralco", { 
            x: 0.5, y: 6.5, w: 5.67, h: 0.5, 
            align: "center", fontSize: 18, color: "10B981", bold: true 
          });
          break;

        case 'golf':
          s.addText("Golf Tournament", { 
            x: 0.5, y: 0.8, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/10th ITAP Golf Tournament.jpg", 
            x: 0.5, y: 2, w: 5.67, h: 4, 
            sizing: { type: 'contain', w: 5.67, h: 4 } 
          });
          s.addText("12th ITAP & Friends", { 
            x: 0.5, y: 6.5, w: 5.67, h: 0.5, 
            align: "center", fontSize: 18, color: BRAND_BLUE, bold: true 
          });
          break;

        case 'edge-bridge':
          s.addText("ITAP EDGE", { 
            x: 0.5, y: 1.2, w: 5.67, h: 1, 
            align: "center", fontSize: 54, bold: true, color: "0F172A" 
          });
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/deck/TIP_logo.png", 
            x: 0.835, y: 2.5, w: 5, h: 5, 
            sizing: { type: 'contain', w: 5, h: 5 } 
          });
          s.addText("Industry-Academe Bridge", { 
            x: 0.5, y: 7.8, w: 5.67, h: 0.5, 
            align: "center", fontSize: 24, color: BRAND_CYAN, bold: true 
          });
          break;

        case 'edge-impact':
          s.addText("EDGE Program Launch", { 
            x: 0.5, y: 0.8, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          s.addText("MoA Signing with Technological Institute of the Philippines", { 
            x: 0.5, y: 1.8, w: 5.67, h: 0.6, 
            align: "center", fontSize: 18, color: SLATE_400 
          });
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap-edge_program.jpg", 
            x: 0.5, y: 2.8, w: 5.67, h: 3.5, 
            sizing: { type: 'contain', w: 5.67, h: 3.5 } 
          });
          s.addText("A structured training initiative designed to prepare students for industry.", { 
            x: 0.5, y: 6.5, w: 5.67, h: 1.5, 
            align: "center", fontSize: 20, color: "64748B" 
          });
          break;

        case 'partnership-message':
          s.addText("Partnership Message", { 
            x: 1.5, y: 0.8, w: 3.67, h: 0.5, 
            align: "center", fontSize: 14, color: BRAND_CYAN, bold: true 
          });
          s.addImage({ 
            path: "https://marketing.timcorp.net.ph/hubfs/ITAP/deck/TIP_logo.png", 
            x: 1.835, y: 1.5, w: 3, h: 2, 
            sizing: { type: 'contain', w: 3, h: 2 } 
          });
          s.addText("Angelo Quirino Lahoz", { 
            x: 0.5, y: 4, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          s.addText("President, T.I.P.", { 
            x: 0.5, y: 5, w: 5.67, h: 0.5, 
            align: "center", fontSize: 20, color: SLATE_400 
          });
          break;

        case 'induction':
          s.addText("Induction", { 
            x: 0.5, y: 0.8, w: 5.67, h: 1, 
            align: "center", fontSize: 44, bold: true, color: textColor 
          });
          newMembers.forEach((member, idx) => {
            const yPos = 2.5 + (idx * 3.3);
            s.addImage({ 
              path: member.logo, 
              x: 1.335, y: yPos, w: 3, h: 1.5, 
              sizing: { type: 'contain', w: 3, h: 1.5 } 
            });
            s.addText(member.name, { 
              x: 0.5, y: yPos + 1.8, w: 5.67, h: 0.5, 
              align: "center", fontSize: 24, bold: true, color: textColor 
            });
            if (member.representedBy) {
              s.addText(`Represented by: ${member.representedBy}`, { 
                x: 0.5, y: yPos + 2.4, w: 5.67, h: 0.4, 
                align: "center", fontSize: 16, color: BRAND_CYAN, bold: true 
              });
            }
          });
          break;

        case 'closing-remarks':
          s.addText("Closing Remarks", { 
            x: 1.5, y: 0.8, w: 3.67, h: 0.5, 
            align: "center", fontSize: 14, color: BRAND_CYAN, bold: true 
          });
          s.addText("Merrick Chua", { 
            x: 0.5, y: 3.5, w: 5.67, h: 1, 
            align: "center", fontSize: 36, bold: true, color: textColor 
          });
          s.addText("ITAP Vice President", { 
            x: 0.5, y: 4.5, w: 5.67, h: 0.5, 
            align: "center", fontSize: 18, color: SLATE_400 
          });
          break;

        case 'final':
          s.addText("Thank You", { 
            x: 0.5, y: 3.5, w: 5.67, h: 1, 
            align: "center", fontSize: 64, bold: true, color: BRAND_CYAN 
          });
          s.addText("Building the future together.", { 
            x: 0.5, y: 5.2, w: 5.67, h: 0.8, 
            align: "center", fontSize: 24, color: "FFFFFF" 
          });
          break;

        default:
          s.addText(slide.label || "Slide Content", { 
            x: 0.5, y: 3, w: 5.67, h: 1, 
            align: "center", fontSize: 36, bold: true, color: textColor 
          });
          break;
      }

      // Add common footer to all slides
      s.addText("ITAP GMM 2026", { 
        x: 0.1, y: 9.7, w: 3, h: 0.3, 
        fontSize: 10, color: SLATE_400 
      });
    });

    try {
      await pres.writeFile({ fileName: `ITAP_GMM_2026_${new Date().toISOString().split('T')[0]}.pptx` });
    } catch (error) {
      console.error("PPTX Export Error:", error);
    }
  };

  const activeSlideConfigs = useMemo(() => {
    return managedSlides
      .filter(ms => ms.active)
      .map(ms => slideRegistry.find(sr => sr.id === ms.id))
      .filter(Boolean) as any[];
  }, [managedSlides, slideRegistry]);

  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSlideContent = (id: string): React.ReactNode => {
    switch (id) {
      case 'title': return (
        <SlideWrapper className="relative overflow-hidden" showLogo={false} isPortrait={isPortrait}>
          <div className="relative z-10 text-center w-full flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isPortrait ? 'mb-16 scale-150 transform-gpu' : 'mb-6'} inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-cyan/10 text-brand-cyan font-mono text-xs md:text-sm font-bold tracking-[0.4em] uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-brand-cyan/20`}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              ITAP GMM 2026
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "backOut" }}
              className={`${isPortrait ? 'mb-24 scale-150' : 'mb-14'} relative inline-block group`}
            >
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
                alt="ITAP Logo" 
                className={`${isPortrait ? 'h-60' : 'h-28 md:h-40'} mx-auto relative z-10 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-transform duration-700 group-hover:scale-105`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-cyan/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
            </motion.div>
            
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className={isPortrait ? 'mt-12' : ''}
            >
              <motion.h1 
                variants={fadeInUp}
                className={`${isPortrait ? 'text-7xl leading-[1.1] px-4' : 'text-5xl md:text-7xl lg:text-8xl'} font-display font-bold mb-8 tracking-tighter uppercase leading-tight text-brand-ink`}
              >
                ITAP 1st General <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">Membership Meeting 2026</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className={`${isPortrait ? 'text-3xl mt-12 mb-24 px-8 opacity-90 font-medium' : 'text-xl md:text-2xl text-slate-500 font-medium tracking-wide mb-16 max-w-4xl'} mx-auto`}
              >
                A Gathering of Leaders, Members, and Partners
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className={`flex flex-col ${isPortrait ? 'gap-12 mt-16 scale-125' : 'md:flex-row gap-8 md:gap-16 pt-12 border-t border-slate-200/60'} items-center justify-center max-w-4xl mx-auto`}
              >
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100 text-brand-cyan">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className={`font-medium ${isPortrait ? 'text-xl' : 'text-sm md:text-base'}`}>Manila Golf and Country Club</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100 text-brand-cyan">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className={`font-medium ${isPortrait ? 'text-xl' : 'text-sm md:text-base'}`}>April 28, 2026</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </SlideWrapper>
      );
      case 'host': return (
        <SlideWrapper showLogo={true} className="!pb-0" isPortrait={isPortrait}>
          <div className={`absolute ${isPortrait ? 'top-12 scale-125' : 'top-20'} left-1/2 -translate-x-1/2 z-20`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 px-10 py-3 rounded-full bg-brand-cyan shadow-[0_10px_40px_rgba(34,211,238,0.4)] text-white"
            >
              <Users className="w-6 h-6" />
              <span className="font-mono text-sm md:text-lg font-bold tracking-[0.4em] uppercase">Session Host</span>
            </motion.div>
          </div>

          <div className={`${isPortrait ? 'flex flex-col items-center pt-48' : 'grid lg:grid-cols-[0.9fr_1.1fr] items-end'} gap-0 w-full h-full max-w-[1900px] mx-auto`}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: isPortrait ? 0 : -100, y: isPortrait ? 50 : 0 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", damping: 25, duration: 1.5 }}
              className={`relative ${isPortrait ? 'w-full h-[55%] flex justify-center order-1' : 'h-full flex items-end justify-start -mb-px px-0'}`}
            >
              {/* Creative Background Elements */}
              <div className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2 bottom-0 w-[90%] h-[100%]' : 'left-[-5%] bottom-0 w-[110%] h-[75%]'} bg-gradient-to-t from-brand-cyan/15 to-transparent -z-10 rounded-t-[120px]`} />
              <div className="absolute -left-40 bottom-40 w-[45rem] h-[45rem] border-[64px] border-brand-cyan/5 rounded-full -z-10 animate-pulse" />
              
              <div className={`w-full ${isPortrait ? 'flex flex-col items-center justify-end' : 'h-full flex items-end'}`}>
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/deck/d.lumbao.png?v=2" 
                  alt="Dennis John Lumbao" 
                  className={`${isPortrait ? 'h-full w-auto max-w-[90%]' : 'w-full h-auto max-h-full'} object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)] ${isPortrait ? '' : 'ml-[-5%]'}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            <div className={`${isPortrait ? 'text-center px-8 flex-grow flex flex-col justify-center order-2' : 'pb-48 text-left pl-12 lg:pl-20'}`}>
              <motion.h2 
                initial={{ opacity: 0, x: isPortrait ? 0 : 50, y: isPortrait ? 30 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`${isPortrait ? 'text-7xl mb-4' : 'text-6xl md:text-8xl xl:text-[8rem] mb-6'} font-display font-bold text-brand-ink tracking-tighter leading-none`}
              >
                Dennis John Lumbao
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`${isPortrait ? 'text-3xl' : 'text-3xl md:text-5xl'} text-slate-400 font-light tracking-tight italic`}
              >
                ITAP Board Director
              </motion.p>
            </div>
          </div>
        </SlideWrapper>
      );
      case 'opening-dark': return (
        <SlideWrapper dark showGlobe={false} isPortrait={isPortrait}>
          <div className="absolute inset-0 bg-slate-950">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.2)_0%,_transparent_70%)]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-center relative z-10"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isPortrait ? 200 : 120 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-1.5 bg-brand-cyan mx-auto mb-16 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            />
            
            <h2 className={`${isPortrait ? 'text-7xl space-y-4' : 'text-6xl md:text-8xl lg:text-9xl'} font-display font-bold mb-14 tracking-tighter leading-none uppercase`}>
              Welcome to <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-blue">
                ITAP GMM 2026
              </span>
            </h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className={`${isPortrait ? 'text-3xl leading-relaxed' : 'text-lg md:text-2xl'} text-slate-300 font-mono uppercase tracking-[0.4em] max-w-4xl mx-auto`}
            >
              Driving collaboration. <br className={isPortrait ? 'block' : 'hidden'} /> Enabling growth. <br className={isPortrait ? 'block' : 'hidden'} /> Shaping the future.
            </motion.p>
          </motion.div>
        </SlideWrapper>
      );
      case 'remarks': return (
        <SlideWrapper showLogo={true} className="!pb-0" isPortrait={isPortrait}>
          <div className={`absolute ${isPortrait ? 'top-12 scale-125' : 'top-20'} left-1/2 -translate-x-1/2 z-20`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 px-12 py-3.5 rounded-full bg-brand-ink shadow-[0_15px_45px_rgba(0,0,0,0.3)] text-white"
            >
              <Sparkles className="w-6 h-6 text-brand-cyan" />
              <span className="font-mono text-sm md:text-lg font-bold tracking-[0.4em] uppercase">Opening Remarks</span>
            </motion.div>
          </div>

          <div className={`${isPortrait ? 'flex flex-col items-center pt-48' : 'grid lg:grid-cols-[0.9fr_1.1fr] items-end'} gap-0 w-full h-full max-w-[1900px] mx-auto`}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: isPortrait ? 0 : -100, y: isPortrait ? 50 : 0 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", damping: 25, duration: 1.5 }}
              className={`relative ${isPortrait ? 'w-full h-[55%] flex justify-center order-1' : 'h-full flex items-end justify-start -mb-px px-0'}`}
            >
              {/* Creative Background Elements */}
              <div className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2 bottom-0 w-[90%] h-[100%]' : 'left-[-5%] bottom-0 w-[110%] h-[75%]'} bg-gradient-to-t from-brand-blue/15 to-transparent -z-10 rounded-t-[120px]`} />
              <div className="absolute -left-40 bottom-60 w-[50rem] h-[50rem] border-[80px] border-brand-blue/5 rounded-full -z-10 animate-pulse" />
              
              <div className={`w-full ${isPortrait ? 'flex flex-col items-center justify-end' : 'h-full flex items-end'}`}>
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/deck/s.bastes.png?v=2" 
                  alt="Sunver Z. Bastes" 
                  className={`${isPortrait ? 'h-full w-auto max-w-[90%]' : 'w-full h-auto max-h-full'} object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)] ${isPortrait ? '' : 'ml-[-5%]'}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            <div className={`${isPortrait ? 'text-center px-8 flex-grow flex flex-col justify-center order-2' : 'pb-48 text-left pl-12 lg:pl-20'}`}>
              <motion.h2 
                initial={{ opacity: 0, x: isPortrait ? 0 : 50, y: isPortrait ? 30 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`${isPortrait ? 'text-7xl mb-4' : 'text-6xl md:text-8xl xl:text-[8rem] mb-6'} font-display font-bold text-brand-ink mb-6 tracking-tighter leading-none`}
              >
                Sunver Z. Bastes
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`${isPortrait ? 'text-4xl' : 'text-4xl md:text-6xl'} text-slate-400 font-light tracking-tight italic`}
              >
                ITAP President
              </motion.p>
            </div>
          </div>
        </SlideWrapper>
      );
      case 'agenda': return (
        <SlideWrapper isPortrait={isPortrait}>
          <div className={`${isPortrait ? 'max-w-full' : 'max-w-screen-2xl'} w-full h-full flex flex-col justify-center`}>
            <div className={`text-center ${isPortrait ? 'mb-20' : 'mb-32'}`}>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brand-cyan font-mono text-base font-bold tracking-[0.5em] uppercase mb-8 block"
              >
                Framework for 2026
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isPortrait ? 'text-[7rem] px-4' : 'text-8xl md:text-9xl'} font-display font-bold text-brand-ink tracking-tighter leading-none`}
              >
                The <span className="text-brand-cyan">Agenda</span>
              </motion.h2>
            </div>
            
            <div className={`grid ${isPortrait ? 'grid-cols-1 gap-12' : 'grid-cols-2 gap-12 md:gap-20'} px-8 md:px-20`}>
              {[
                { id: '01', title: 'Leadership', icon: <Users className="w-12 h-12" />, desc: 'Meet the visionaries behind the 2026 Board of Directors' },
                { id: '02', title: 'ITAP Live', icon: <Activity className="w-12 h-12" />, desc: 'Real-time showcase of our newly launched digital infrastructure' },
                { id: '03', title: 'EDGE Program', icon: <Layers className="w-12 h-12" />, desc: 'Bridging academia & industry through strategic partnerships' },
                { id: '04', title: 'New Members', icon: <Sparkles className="w-12 h-12" />, desc: 'Welcoming the newest organizations to the ITAP family' },
              ].map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1, type: "spring", damping: 20 }}
                  className={`flex items-center gap-12 ${isPortrait ? 'p-12' : 'p-14'} rounded-[50px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-brand-cyan/40 hover:-translate-y-2 transition-all duration-500 group`}
                >
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-brand-cyan/5 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan group-hover:text-white transition-all duration-500 shrink-0 shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-3">
                       <span className="text-xl font-mono font-black text-brand-cyan/20 tracking-tighter">{item.id}</span>
                       <h3 className={`${isPortrait ? 'text-5xl' : 'text-5xl'} font-display font-black text-brand-ink tracking-tight`}>{item.title}</h3>
                    </div>
                    <p className={`${isPortrait ? 'text-2xl' : 'text-xl'} text-slate-400 font-medium leading-relaxed max-w-sm`}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SlideWrapper>
      );
      case 'leadership-divider': return (
        <SectionDivider 
          title="Leadership" 
          tagline="Guiding ITAP forward in 2026" 
          isPortrait={isPortrait}
        />
      );
      case 'directors': return (
        <SlideWrapper className="bg-slate-50/50" isPortrait={isPortrait}>
          <div className={`text-center ${isPortrait ? 'mb-12 mt-12' : 'mb-10'}`}>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-brand-cyan font-mono ${isPortrait ? 'text-lg' : 'text-xs md:text-sm'} font-bold tracking-[0.4em] uppercase mb-4 block`}
            >
              Leadership
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isPortrait ? 'text-5xl px-2 whitespace-nowrap' : 'text-5xl md:text-7xl'} font-display font-bold text-brand-ink tracking-tight`}
            >
              Meet the ITAP Board of Directors
            </motion.h2>
          </div>
          
          <div className={`grid ${isPortrait ? 'grid-cols-1 gap-6' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-10'} w-full ${isPortrait ? 'max-w-[900px]' : 'max-w-[1400px]'} px-4`}>
            {[
              { name: 'Sunver Bastes', itapPos: 'President', company: 'TIM', companyPos: 'President', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/s.bastes.png?v=2', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/TIM.png' },
              { name: 'Merrick Chua', itapPos: 'Vice President', company: 'MEC Networks Corporation', companyPos: 'President/CEO', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.chua.png?v=2', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/member%20logos/MEC%20Networks%20Corporation.png' },
              { name: 'Michael Lee', itapPos: 'Corp. Secretary', company: 'AMD', companyPos: 'PH Lead', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.lee.png', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/member%20logos/Advanced%20Micro%20Devices%20(AMD).png' },
              { name: 'Kathleen Kho', itapPos: 'Treasurer', company: 'Metasystems', companyPos: 'CEO', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/k.kho.png', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/member%20logos/Metasystems%20Development%20Inc.png' },
              { name: 'Rodrigo Mendoza', itapPos: 'Director', company: 'AMTI', companyPos: 'AVP Leader', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/r.mendoza.png', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/member%20logos/Accent%20Micro%20Technologies%20Inc.%20(AMTI).png' },
              { name: 'Dennis Lumbao', itapPos: 'Director', company: 'Dell', companyPos: 'Sales Leader', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/d.lumbao.png?v=2', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/member%20logos/Dell%20Technologies.png' },
              { name: 'Michael Raymond Remoquillo', itapPos: 'Director', company: 'Lenovo', companyPos: 'Country Lead', img: 'https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.remoquillo.png', companyLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/member%20logos/Lenovo%20Philippines%20Inc..png' },
            ].map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white ${isPortrait ? 'p-8 flex-row justify-between text-left items-center' : 'p-8 flex-col items-center text-center'} rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-cyan/20 flex group transition-all`}
              >
                <div className={isPortrait ? 'flex flex-col' : ''}>
                  <h4 className={`${isPortrait ? 'text-4xl px-0' : 'text-xl md:text-2xl'} font-bold text-brand-ink mb-1 leading-tight`}>{member.name}</h4>
                  <p className={`${isPortrait ? 'text-lg' : 'text-[10px]'} text-brand-cyan font-mono uppercase tracking-widest mb-0 font-bold`}>{member.itapPos}</p>
                </div>
                
                {isPortrait ? (
                  <div className="flex items-center gap-10">
                    <div className="relative w-28 h-28 bg-slate-50 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner shrink-0">
                       {member.img ? (
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <User className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-right gap-3">
                      <div className="h-10 flex items-center justify-end transition-all">
                        <img src={member.companyLogo} alt={member.company} className="max-h-full max-w-[150px] object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <p className="text-sm text-slate-400 font-bold leading-tight uppercase tracking-wider">{member.companyPos}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-28 h-28 md:w-36 md:h-36 bg-slate-50 mb-6 rounded-full relative overflow-hidden border-2 border-slate-100 shadow-inner">
                      {member.img ? (
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <User className="w-14 h-14 md:w-20 md:h-20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="h-px w-10 bg-slate-100 mb-6" />
                    
                    <div className="flex flex-col items-center gap-3 mt-auto">
                      <div className="h-8 flex items-center justify-center transition-all">
                        <img src={member.companyLogo} alt={member.company} className="max-h-full max-w-[80px] object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-1">{member.companyPos}</p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </SlideWrapper>
      );
      case 'ecosystem': return (
        <SlideWrapper className="bg-slate-50/10" isPortrait={isPortrait}>
          <div className={`text-center ${isPortrait ? 'mb-16 mt-16' : 'mb-16 mt-8'} px-4`}>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-brand-cyan font-mono ${isPortrait ? 'text-[10px]' : 'text-sm'} font-bold tracking-[0.5em] uppercase mb-4 block`}
            >
              Our Ecosystem
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isPortrait ? 'text-5xl px-4' : 'text-5xl md:text-7xl'} font-display font-bold text-brand-ink tracking-tight mb-2`}
            >
              Our Member Organizations
            </motion.h2>
            <div className="h-1.5 w-24 bg-brand-cyan mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
          </div>
          
          <div className={`flex-1 w-full flex items-start justify-center ${isPortrait ? 'pt-2' : ''}`}>
            <div className={`grid ${isPortrait ? 'grid-cols-3 gap-x-6 gap-y-10 px-6' : 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-12 gap-y-16 px-10'} w-full max-w-[1750px] place-items-center mb-12`}>
              {memberCompanies.map((company, idx) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: (idx % 24) * 0.015,
                    duration: 0.5
                  }}
                  className={`${isPortrait ? 'h-16' : 'h-16 md:h-20 lg:h-28'} flex items-center justify-center w-full group`}
                >
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className={`${isPortrait ? 'w-28' : 'w-full'} h-full object-contain filter grayscale-0 opacity-100 transition-all duration-500`}
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </SlideWrapper>
      );
      case 'innovation-divider': return (
        <SectionDivider 
          title="Innovation" 
          tagline="Connecting members through better platforms" 
          isPortrait={isPortrait}
        />
      );
      case 'digital': return (
        <SlideWrapper dark showGlobe={false} isPortrait={isPortrait}>
          <div className="absolute inset-0 bg-slate-950">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>

            <div className={`relative z-10 w-full h-full flex flex-col items-center pt-10`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan mb-6">
                <Globe className="w-6 h-6 animate-spin-slow" />
                <span className="font-mono text-sm font-bold tracking-[0.4em] uppercase">Digital Transformation</span>
              </div>
              <h2 className={`${isPortrait ? 'text-6xl mb-4 px-4' : 'text-7xl md:text-9xl mb-4'} font-display font-bold text-white tracking-tighter`}>
                ITAP <span className="text-brand-cyan italic">Digital</span> Presence
              </h2>
              <p className="text-slate-400 font-mono text-sm md:text-2xl tracking-[0.3em] uppercase">Evolving the experience for our members</p>
            </motion.div>

            {/* Status Labels (Outside the browser) */}
            <div className={`w-full max-w-[1400px] flex justify-between items-end px-10 mb-6 h-10`}>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-4"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-slate-600" />
                <span className="font-mono text-slate-500 text-xs font-bold tracking-widest uppercase">Legacy Platform</span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 5 }}
                className="flex items-center gap-4 bg-brand-cyan/10 px-6 py-2.5 rounded-full border border-brand-cyan/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-brand-cyan animate-pulse" />
                <span className="font-mono text-brand-cyan text-xs font-black tracking-widest uppercase">Live: test.itaphil.com</span>
              </motion.div>
            </div>

            {/* Web Container Wrapper */}
            <div className={`flex-1 w-full flex items-center justify-center overflow-visible mb-16 px-10`}>
              <div 
                className="relative flex flex-col items-center group transition-all duration-500 origin-center scale-[0.45] md:scale-[0.55]"
                style={{ width: '1920px' }}
              >
                {/* Browser Header (Outside Viewport) */}
                <div className="w-full h-16 bg-slate-800 rounded-t-[40px] border-x-[16px] border-t-[16px] border-slate-900 flex items-center px-10 z-40">
                  <div className="flex gap-3 mr-12 scale-150">
                    <div className="w-4 h-4 rounded-full bg-red-500/80" />
                    <div className="w-4 h-4 rounded-full bg-yellow-500/80" />
                    <div className="w-4 h-4 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 max-w-2xl h-10 bg-slate-950/50 rounded-xl flex items-center px-5 border border-slate-700/50">
                    <Globe className="w-5 h-5 text-brand-cyan/50 mr-4" />
                    <span className="text-sm text-slate-400 font-mono">https://test.itaphil.com</span>
                  </div>
                </div>

                {/* Viewport Container */}
                <div 
                  className={`relative rounded-b-[40px] overflow-hidden border-x-[16px] border-b-[16px] border-slate-900 shadow-[0_60px_200px_rgba(0,0,0,0.6)] bg-slate-900 flex-shrink-0`}
                  style={{ 
                    width: '1920px',
                    height: '1080px',
                  }}
                >
                  {/* OLD WEBSITE (Bottom Layer) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                    <img 
                      src="https://marketing.timcorp.net.ph/hubfs/ITAP/old%20ITAP%20website.png" 
                      alt="Old Website" 
                      className="w-full h-full object-cover opacity-100 transition-all duration-[2000ms]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* NEW WEBSITE (Top Reveal Layer) */}
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.5, duration: 4, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute inset-0 z-10 border-r-[12px] border-brand-cyan shadow-[40px_0_120px_rgba(34,211,238,0.5)] overflow-hidden bg-white"
                  >
                    <div className="w-full h-full relative">
                      <iframe 
                        src="https://test.itaphil.com" 
                        className="w-full h-full border-none pointer-events-none bg-white"
                        title="New ITAP Website"
                      />
                      <div className="absolute inset-0 bg-transparent z-20 pointer-events-auto" />
                    </div>
                  </motion.div>

                  {/* Scanner Line Detail */}
                  <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: "100%" }}
                    transition={{ delay: 1.5, duration: 4, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute top-0 bottom-0 w-2 bg-brand-cyan/80 z-20 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5.5 }}
              className={`flex items-center gap-16 md:gap-32 mb-16`}
            >
              <div className="flex flex-col items-center gap-4">
                <p className="text-brand-cyan font-mono text-base md:text-2xl uppercase tracking-[0.4em] font-black">Responsive</p>
                <div className="h-0.5 w-24 md:w-32 bg-brand-cyan/40 rounded-full" />
              </div>
              <div className="flex flex-col items-center gap-4">
                <p className="text-brand-cyan font-mono text-base md:text-2xl uppercase tracking-[0.4em] font-black">Secure</p>
                <div className="h-0.5 w-24 md:w-32 bg-brand-cyan/40 rounded-full" />
              </div>
              <div className="flex flex-col items-center gap-4">
                <p className="text-brand-cyan font-mono text-base md:text-2xl uppercase tracking-[0.4em] font-black">Community Hub</p>
                <div className="h-0.5 w-24 md:w-32 bg-brand-cyan/40 rounded-full" />
              </div>
            </motion.div>
          </div>
        </SlideWrapper>
      );
      case 'impact-divider': return (
        <SectionDivider 
          title="Impact" 
          tagline="Building impact beyond the organization" 
          isPortrait={isPortrait}
        />
      );
      case 'events-overview': return (
        <SlideWrapper isPortrait={isPortrait}>
          <div className={`flex flex-col items-center w-full ${isPortrait ? 'justify-start pt-12 px-6' : 'justify-center'}`}>
            <div className={`text-center ${isPortrait ? 'mb-12' : 'mb-16'}`}>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-brand-cyan font-mono ${isPortrait ? 'text-lg mb-4' : 'text-xl mb-8'} font-bold tracking-[0.5em] uppercase block`}
              >
                Initiatives
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isPortrait ? 'text-[4.5rem] leading-[0.95] px-2' : 'text-8xl md:text-[10rem]'} font-display font-bold text-brand-ink tracking-tight shadow-text`}
              >
                ITAP Key Events 2026
              </motion.h2>
            </div>
            
            <div className={`grid ${isPortrait ? 'grid-cols-1 gap-10' : 'md:grid-cols-3 gap-10 md:gap-14'} w-full max-w-[1600px]`}>
              {[
                { title: 'EDGE Program', icon: <Cpu />, color: 'bg-brand-cyan', desc: 'Academe & Industry', accent: 'cyan' },
                { title: 'Tree Planting', icon: <Globe />, color: 'bg-emerald-500', desc: 'Sustainability & Community', accent: 'emerald' },
                { title: 'Golf Tournament', icon: <Zap />, color: 'bg-brand-blue', desc: 'Networking & Camaraderie', accent: 'blue' },
              ].map((event, idx) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, type: "spring" }}
                  className={`bg-white ${isPortrait ? 'p-12 rounded-[48px]' : 'p-12 rounded-[64px]'} border border-slate-100 shadow-sm hover:shadow-2xl hover:border-brand-cyan/20 text-center group transition-all relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 w-full h-2 bg-${event.accent}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <motion.div 
                     whileHover={{ rotate: 360 }}
                     transition={{ duration: 0.8 }}
                     className={`${isPortrait ? 'w-24 h-24' : 'w-20 h-20'} rounded-3xl ${event.color} text-white flex items-center justify-center mx-auto mb-8 shadow-lg`}
                  >
                    {React.cloneElement(event.icon as React.ReactElement, { className: isPortrait ? "w-12 h-12" : "w-10 h-10" })}
                  </motion.div>
                  
                  <h3 className={`${isPortrait ? 'text-5xl' : 'text-5xl md:text-6xl'} font-bold mb-6 text-brand-ink`}>{event.title}</h3>
                  <p className={`${isPortrait ? 'text-3xl' : 'text-2xl'} text-slate-500 font-medium mb-12 leading-relaxed px-4`}>
                    {event.desc}
                  </p>
                  
                  <div className={`flex items-center justify-center gap-4 text-brand-cyan font-mono ${isPortrait ? 'text-xl' : 'text-base'} font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all`}>
                    <span>Learn More</span>
                    <ArrowRight className={`${isPortrait ? 'w-8 h-8' : 'w-6 h-6'}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SlideWrapper>
      );
      case 'tree-planting': return (
        <SlideWrapper className="bg-emerald-50/10" isPortrait={isPortrait}>
          <div className={`${isPortrait ? 'flex flex-col' : 'grid lg:grid-cols-2'} gap-12 md:gap-20 items-center max-w-[1800px] w-full`}>
            <motion.div
              initial={{ x: isPortrait ? 0 : -40, opacity: 0, y: isPortrait ? 20 : 0 }}
              animate={{ x: 0, opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${isPortrait ? 'px-4 order-2 text-center flex flex-col items-center' : 'px-12 order-1'}`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-100 text-emerald-700 font-mono text-sm font-bold tracking-[0.3em] uppercase"
              >
                <Globe className="w-5 h-5" />
                Sustainability
              </motion.div>
              <h2 className={`${isPortrait ? 'text-7xl leading-none px-2 mb-12' : 'text-6xl md:text-8xl'} font-display font-bold text-brand-ink mb-10 tracking-tighter`}>
                Tree Planting <span className="text-emerald-600">Initiative</span>
              </h2>
              <div className={`flex items-center gap-6 mb-12 ${isPortrait ? 'justify-center' : ''}`}>
                <div className="h-px w-12 bg-emerald-200" />
                <p className={`text-slate-500 font-bold ${isPortrait ? 'text-3xl' : 'text-xl'}`}>with One Meralco</p>
              </div>
              <p className={`text-slate-600 ${isPortrait ? 'text-3xl mb-14' : 'text-xl md:text-2xl mb-16'} leading-relaxed max-w-2xl`}>
                Creating impact through sustainability. Supporting reforestation across the Philippines.
              </p>
              
              <motion.div 
                whileHover={{ x: isPortrait ? 0 : 10, y: isPortrait ? -5 : 0 }}
                className={`flex items-center gap-8 ${isPortrait ? 'p-6 w-full' : 'p-8'} bg-white rounded-[40px] border border-emerald-100 shadow-md`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-brand-ink text-lg uppercase tracking-tight leading-none mb-1">Community-Driven</h4>
                  <p className="text-slate-500 text-sm">Engaging members for a greener future.</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className={`relative ${isPortrait ? 'w-full h-[40%] flex justify-center order-1' : 'h-full flex items-center justify-center p-8 order-2'}`}
            >
              <div className="absolute -inset-2 border border-emerald-200 rounded-[48px] rotate-2 pointer-events-none" />
              <div className="rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white w-full h-full max-h-[500px] aspect-[4/3]">
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Tree Planting Activity with One Meralco Foundation.jpg" 
                  alt="Tree Planting" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </SlideWrapper>
      );
      case 'golf': return (
        <SlideWrapper className="bg-brand-blue/5" isPortrait={isPortrait}>
          <div className={`${isPortrait ? 'flex flex-col' : 'grid lg:grid-cols-2'} gap-12 md:gap-20 items-center max-w-[1800px] w-full`}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className={`relative ${isPortrait ? 'w-full h-[40%] flex justify-center order-1' : 'h-full flex items-center justify-center p-8 order-2 lg:order-1'}`}
            >
              <div className="absolute -inset-2 border border-brand-blue/20 rounded-[48px] -rotate-2 pointer-events-none" />
              <div className="rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white w-full h-full max-h-[500px] aspect-[4/3]">
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/10th ITAP Golf Tournament.jpg" 
                  alt="Golf Tournament" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: isPortrait ? 0 : 40, opacity: 0, y: isPortrait ? 20 : 0 }}
              animate={{ x: 0, opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${isPortrait ? 'px-4 order-2 text-center flex flex-col items-center' : 'px-12 order-1 lg:order-2'}`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-100 text-brand-blue font-mono text-sm font-bold tracking-[0.3em] uppercase"
              >
                <Zap className="w-5 h-5 text-brand-blue animate-pulse" />
                Networking
              </motion.div>
              <h2 className={`${isPortrait ? 'text-5xl leading-none px-4' : 'text-6xl md:text-8xl'} font-display font-bold text-brand-ink mb-10 tracking-tighter`}>
                12th ITAP & Friends <span className="text-brand-blue">Golf Tournament</span>
              </h2>
              <p className={`text-slate-600 ${isPortrait ? 'text-2xl mb-12' : 'text-xl md:text-2xl mb-16'} leading-relaxed max-w-2xl`}>
                Strengthening connections beyond the boardroom. A premier gathering of ICT leaders and partners.
              </p>
              
              <motion.div 
                 whileHover={{ x: isPortrait ? 0 : -10, y: isPortrait ? -5 : 0 }}
                className={`flex items-center gap-8 ${isPortrait ? 'p-6 w-full' : 'p-8'} bg-white rounded-[40px] border border-blue-100 shadow-md`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
                  <Handshake className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-brand-ink text-lg uppercase tracking-tight leading-none mb-1">Camaraderie</h4>
                  <p className="text-slate-500 text-sm">Building lasting industry relationships.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </SlideWrapper>
      );
      case 'edge-bridge': return (
        <SlideWrapper showGlobe={false} isPortrait={isPortrait}>
          <div className="absolute inset-0 bg-slate-50">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.3)_0%,_transparent_70%)]" />
          </div>
          
          <div className={`flex flex-col items-center w-full ${isPortrait ? 'justify-start pt-8 px-6' : 'justify-center'} relative z-10`}>
            <div className={`text-center ${isPortrait ? 'mb-10' : 'mb-32'}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan shadow-sm ${isPortrait ? 'mb-8 scale-110' : 'mb-10'}`}
              >
                <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" /> 
                <span className="font-mono text-sm font-bold tracking-[0.4em] uppercase">Industry-Academe Bridge</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isPortrait ? 'text-[5rem] leading-[0.95] mb-8' : 'text-7xl md:text-9xl mb-8'} font-display font-bold tracking-tighter text-brand-ink`}
              >
                ITAP <span className="text-brand-cyan">EDGE</span> <br/>Program
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.3 }}
                className={`${isPortrait ? 'text-2xl mt-4 px-8 leading-relaxed' : 'text-xl md:text-3xl'} text-slate-600 font-light tracking-wide max-w-4xl mx-auto`}
              >
                In partnership with Technological Institute of the Philippines
              </motion.p>
            </div>
            
            <div className={`flex ${isPortrait ? 'flex-col' : 'flex-col md:flex-row'} items-center justify-center gap-8 md:gap-40 relative mb-16`}>
              <motion.div 
                initial={{ x: isPortrait ? 0 : -60, opacity: 0, y: isPortrait ? -30 : 0 }}
                animate={{ x: 0, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center group"
              >
                <div className={`${isPortrait ? 'w-[400px] h-[400px]' : 'w-80 h-80 md:w-[480px] md:h-[480px]'} flex items-center justify-center transition-transform group-hover:scale-105 duration-500`}>
                  <img src="https://marketing.timcorp.net.ph/hubfs/ITAP/deck/TIP_logo.png" alt="TIP Logo" className="w-full h-full object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
                </div>
                <p className={`mt-10 font-mono ${isPortrait ? 'text-2xl' : 'text-sm'} tracking-[0.4em] text-brand-cyan uppercase font-bold`}>Academe</p>
              </motion.div>

              <div className={`${isPortrait ? 'relative h-20 flex flex-col items-center justify-center' : ''}`}>
                {isPortrait && <div className="absolute top-0 bottom-0 w-0.5 bg-brand-cyan/20" />}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className={`${isPortrait ? 'w-20 h-20' : 'w-20 h-20'} rounded-full bg-brand-cyan text-slate-950 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.5)] relative z-10`}
                >
                  <div className="absolute inset-0 rounded-full animate-ping bg-brand-cyan opacity-20" />
                  <Zap className={isPortrait ? 'w-10 h-10' : 'w-10 h-10'} />
                </motion.div>
              </div>

              <motion.div 
                initial={{ x: isPortrait ? 0 : 60, opacity: 0, y: isPortrait ? 30 : 0 }}
                animate={{ x: 0, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center group"
              >
                <div className={`${isPortrait ? 'w-[400px] h-[400px]' : 'w-80 h-80 md:w-[480px] md:h-[480px]'} flex items-center justify-center transition-transform group-hover:scale-105 duration-500`}>
                  <img src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" alt="ITAP Logo" className="w-full h-full object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
                </div>
                <p className={`mt-10 font-mono ${isPortrait ? 'text-2xl' : 'text-sm'} tracking-[0.3em] text-brand-cyan uppercase font-bold`}>Industry</p>
              </motion.div>
            </div>
          </div>
        </SlideWrapper>
      );
      case 'edge-impact': return (
        <SlideWrapper className="bg-slate-50" isPortrait={isPortrait}>
          <div className={`${isPortrait ? 'flex flex-col h-full items-center pt-8' : 'grid lg:grid-cols-2'} gap-12 md:gap-20 items-center w-full max-w-[1700px]`}>
            <motion.div
              initial={{ x: isPortrait ? 0 : -50, opacity: 0, y: isPortrait ? 30 : 0 }}
              animate={{ x: 0, opacity: 1, y: 0 }}
              className={`relative rounded-[32px] md:rounded-[64px] overflow-hidden shadow-2xl border-4 md:border-8 border-white ${isPortrait ? 'w-full aspect-[4/3] order-1' : ''}`}
            >
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/itap-edge_program.jpg" 
                alt="ITAP EDGE MOA Signing" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/60 via-transparent to-transparent" />
              <div className={`absolute ${isPortrait ? 'bottom-6 left-6 right-6' : 'bottom-8 left-8 right-8'} text-white`}>
                <p className="font-mono text-xs md:text-lg tracking-[0.3em] uppercase font-bold text-brand-cyan mb-2">MoA Signing Ceremony</p>
                <p className={`${isPortrait ? 'text-2xl' : 'text-3xl'} font-display font-bold leading-tight`}>T.I.P. x ITAP Partnership Launch</p>
              </div>
            </motion.div>

            <div className={`flex flex-col gap-6 md:gap-10 ${isPortrait ? 'order-2 text-center' : ''}`}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-brand-cyan font-mono text-sm md:text-lg font-bold tracking-[0.5em] uppercase mb-4 block">Collaboration Milestone</span>
                <h2 className={`${isPortrait ? 'text-7xl leading-none mb-10' : 'text-6xl md:text-8xl mb-8'} font-display font-bold text-brand-ink leading-tight tracking-tighter`}>
                  Launching the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-ink">EDGE Program</span>
                </h2>
                <div className={`w-32 h-2 bg-brand-cyan rounded-full mb-12 ${isPortrait ? 'mx-auto' : ''}`} />
                <p className={`${isPortrait ? 'text-3xl mb-10' : 'text-2xl md:text-4xl'} text-slate-500 font-light leading-relaxed mb-8`}>
                  T.I.P. and ITAP have signed a Memorandum of Agreement to launch the <span className="font-medium text-brand-ink italic">EDGE Program</span>.
                </p>
                <p className={`${isPortrait ? 'text-2xl' : 'text-xl md:text-2xl'} text-slate-500 leading-relaxed max-w-3xl ${isPortrait ? 'mx-auto' : ''}`}>
                  A structured training initiative designed to prepare students for industry by offering expert-led modules, hands-on workshops, mentorship, and real-world exposure.
                </p>
              </motion.div>
            </div>
          </div>
        </SlideWrapper>
      );
      case 'partnership-message': return (
        <SlideWrapper showLogo={true} className="!pb-0 overflow-hidden" isPortrait={isPortrait}>
          <div className={`absolute ${isPortrait ? 'top-12 scale-110' : 'top-20'} left-1/2 -translate-x-1/2 z-20`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 px-12 py-3.5 rounded-full bg-brand-ink shadow-[0_15px_45px_rgba(0,0,0,0.3)] text-white"
            >
              <Sparkles className="w-6 h-6 text-brand-cyan" />
              <span className="font-mono text-sm md:text-lg font-bold tracking-[0.4em] uppercase">Partnership Message</span>
            </motion.div>
          </div>
          
          <div className={`flex ${isPortrait ? 'flex-col pt-32' : 'flex-col md:flex-row'} items-center h-full w-full max-w-[1700px]`}>
            <div className={`flex flex-col ${isPortrait ? 'items-center text-center order-1 mt-0 mb-12' : 'flex-1 items-start justify-center pl-12 order-1'}`}>
              <motion.div
                initial={{ x: isPortrait ? 0 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {isPortrait && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                  >
                    <img 
                      src="https://marketing.timcorp.net.ph/hubfs/ITAP/deck/TIP_logo.png" 
                      alt="TIP Logo" 
                      className="h-44 md:h-44 object-contain mx-auto" 
                      referrerPolicy="no-referrer" 
                    />
                  </motion.div>
                )}
                <div className={`w-36 h-2 bg-brand-cyan rounded-full mb-10 ${isPortrait ? 'mx-auto' : ''}`} />
                <h3 className={`${isPortrait ? 'text-3xl' : 'text-3xl md:text-4xl'} font-mono uppercase text-brand-cyan tracking-[0.3em] font-bold mb-4`}>T.I.P. President</h3>
                <h2 className={`${isPortrait ? 'text-6xl mb-8 whitespace-nowrap px-4' : 'text-6xl md:text-8xl lg:text-9xl mb-12'} font-display font-bold text-brand-ink leading-tight tracking-tighter`}>
                  {isPortrait ? "Angelo Quirino Lahoz" : (
                    <>
                      Angelo <br />
                      Quirino <br />
                      Lahoz
                    </>
                  )}
                </h2>
                <div className={`flex items-center gap-6 ${isPortrait ? 'justify-center' : ''}`}>
                  {!isPortrait && <div className="h-10 w-px bg-slate-200 hidden md:block" />}
                  <p className={`${isPortrait ? 'text-2xl' : 'text-xl md:text-2xl'} font-semibold text-slate-400 tracking-wider uppercase font-mono`}>
                    Technological Institute <br className={isPortrait ? 'hidden' : 'block'} /> of the Philippines
                  </p>
                </div>
              </motion.div>
            </div>

            <div className={`flex flex-col ${isPortrait ? 'flex-1 order-2 w-full flex items-center h-[45%]' : 'flex-1 items-center justify-end order-2 h-full'}`}>
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`relative ${isPortrait ? 'w-[85%] h-full -mb-10' : 'h-[95%] w-auto'} flex items-end justify-center`}
              >
                <div className={`absolute bottom-0 ${isPortrait ? 'left-1/2 -translate-x-1/2 w-[110%] h-[90%]' : 'right-0 w-[120%] h-[85%] translate-x-[10%]'} bg-slate-100 rounded-[100px] -z-10`} />
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/a.%20lahoz.png" 
                  alt="Angelo Quirino Lahoz" 
                  className={`w-full ${isPortrait ? '' : 'h-full'} object-contain object-bottom relative z-10 ${isPortrait ? 'scale-[1.12]' : 'scale-[1.15] translate-y-[5%]'}`}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          </div>
        </SlideWrapper>
      );
      case 'induction': return (
        <SlideWrapper isPortrait={isPortrait}>
          <div className={`text-center ${isPortrait ? 'mb-16' : 'mb-24'} px-4`}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-3 px-8 py-3 rounded-full bg-brand-cyan/5 border border-brand-cyan/10 text-brand-cyan font-mono ${isPortrait ? 'text-lg scale-125 mb-12' : 'text-xs md:text-sm mb-8'} font-bold tracking-[0.4em] uppercase`}
            >
              Expansion
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isPortrait ? 'text-6xl leading-tight mb-8 px-4 whitespace-nowrap' : 'text-6xl md:text-8xl'} font-display font-bold text-brand-ink tracking-tight mb-8`}
            >
              Induction of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">New Members</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-slate-400 text-center max-w-4xl mx-auto ${isPortrait ? 'text-xl leading-relaxed' : 'text-xl md:text-3xl font-light leading-relaxed'}`}
            >
              Welcoming new partners into the ITAP community. Strengthening our collective impact through shared vision and collaboration.
            </motion.p>
          </div>
          
          <div className={`grid ${isPortrait ? 'grid-cols-1 gap-12' : 'grid-cols-2 gap-20'} w-full max-w-[1500px] px-8`}>
            {newMembers.map((company, idx) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, type: "spring", stiffness: 100 }}
                className={`relative flex flex-col items-center justify-center transition-all duration-700`}
              >
                {/* Branding Content - No Box */}
                <div className={`flex flex-col items-center justify-center ${isPortrait ? 'w-full' : 'w-full'}`}>
                  {/* Logo Container - Respectable size */}
                  <div className={`w-full flex items-center justify-center ${isPortrait ? 'h-[280px]' : 'h-[300px]'} transition-transform duration-1000 transform-gpu`}>
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className={`${isPortrait ? 'max-w-[75%] max-h-[75%]' : 'max-w-[70%] max-h-[70%]'} object-contain filter drop-shadow-xl transition-transform duration-700 hover:scale-105`} 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  
                  {/* Identity */}
                  <div className={`mt-6 text-center w-full`}>
                    <h3 className={`${isPortrait ? 'text-2xl' : 'text-3xl'} font-display font-bold text-brand-ink tracking-tight mb-3 uppercase`}>
                      {company.name}
                    </h3>
                    {company.representedBy && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.2 + 0.5 }}
                        className="inline-block px-6 py-2 rounded-xl bg-slate-50 border border-slate-100 shadow-sm"
                      >
                        <p className={`${isPortrait ? 'text-lg' : 'text-xl'} text-brand-cyan font-bold font-mono tracking-tight`}>
                          <span className="text-slate-400 font-medium text-sm mr-2 opacity-60">Represented by:</span>
                          {company.representedBy}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SlideWrapper>
      );
      case 'closing-remarks': return (
        <SlideWrapper showLogo={true} className="!pb-0" isPortrait={isPortrait}>
          <div className={`absolute ${isPortrait ? 'top-12 scale-125' : 'top-20'} left-1/2 -translate-x-1/2 z-20`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 px-10 py-3 rounded-full bg-brand-cyan shadow-[0_10px_40px_rgba(34,211,238,0.4)] text-white"
            >
              <Handshake className="w-6 h-6" />
              <span className="font-mono text-sm md:text-lg font-bold tracking-[0.4em] uppercase">Closing Remarks</span>
            </motion.div>
          </div>

          <div className={`${isPortrait ? 'flex flex-col items-center pt-48' : 'grid lg:grid-cols-[0.9fr_1.1fr] items-end'} gap-0 w-full h-full max-w-[1900px] mx-auto`}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: isPortrait ? 0 : -100, y: isPortrait ? 50 : 0 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", damping: 25, duration: 1.5 }}
              className={`relative ${isPortrait ? 'w-full h-[55%] flex justify-center order-1' : 'h-full flex items-end justify-start -mb-px px-0'}`}
            >
              {/* Creative Background Elements */}
              <div className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2 bottom-0 w-[90%] h-[100%]' : 'left-[-5%] bottom-0 w-[110%] h-[75%]'} bg-gradient-to-t from-brand-cyan/15 to-transparent -z-10 rounded-t-[120px]`} />
              <div className="absolute -left-40 bottom-40 w-[45rem] h-[45rem] border-[64px] border-brand-cyan/5 rounded-full -z-10 animate-pulse" />
              
              <div className={`w-full ${isPortrait ? 'flex flex-col items-center justify-end' : 'h-full flex items-end'}`}>
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/deck/m.chua.png?v=2" 
                  alt="Merrick Chua" 
                  className={`${isPortrait ? 'h-full w-auto max-w-[90%]' : 'w-full h-auto max-h-full'} object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)] ${isPortrait ? '' : 'ml-[-5%]'}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            <div className={`${isPortrait ? 'text-center px-8 flex-grow flex flex-col justify-center order-2' : 'pb-48 text-left pl-12 lg:pl-20'}`}>
              <motion.h2 
                initial={{ opacity: 0, x: isPortrait ? 0 : 50, y: isPortrait ? 30 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`${isPortrait ? 'text-7xl mb-4' : 'text-6xl md:text-8xl xl:text-[8rem] mb-6'} font-display font-bold text-brand-ink mb-6 tracking-tighter leading-none`}
              >
                Merrick Chua
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`${isPortrait ? 'text-4xl' : 'text-4xl md:text-6xl'} text-slate-400 font-light tracking-tight italic`}
              >
                ITAP Vice President
              </motion.p>
            </div>
          </div>
        </SlideWrapper>
      );
      case 'final': return (
        <SlideWrapper showGlobe={false} showLogo={false} isPortrait={isPortrait}>
          <div className={`text-center relative z-10 w-full flex flex-col items-center ${isPortrait ? 'justify-center h-full pt-12' : ''}`}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`${isPortrait ? 'mb-24 scale-110' : 'mb-20'} relative`}
            >
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
                alt="ITAP Logo" 
                className={`${isPortrait ? 'h-96' : 'h-64 md:h-96 lg:h-[32rem]'} mx-auto drop-shadow-[0_0_60px_rgba(34,211,238,0.4)]`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-cyan/20 blur-[120px] -z-10 opacity-30 animate-pulse" />
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className={`${isPortrait ? 'text-2xl mt-12 px-8' : 'text-xl md:text-3xl'} text-slate-500 font-mono tracking-[0.6em] uppercase mb-16`}
            >
              Building the future together.
            </motion.p>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 1, duration: 1 }}
              className="h-1 bg-brand-cyan mx-auto rounded-full" 
            />
          </div>
          
          {/* Animated Background Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-brand-cyan rounded-full"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * -200 - 100],
                  opacity: [0, 0.4, 0]
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5, 
                  repeat: Infinity, 
                  delay: Math.random() * 5 
                }}
              />
            ))}
          </div>
        </SlideWrapper>
      );
      default: return null;
    }
  };

  const slides = activeSlideConfigs;

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resetControlsTimeout);
    resetControlsTimeout();
    return () => {
      window.removeEventListener('mousemove', resetControlsTimeout);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  const nextSlide = useCallback(() => {
    const nextIdx = currentSlide === slides.length - 1 ? currentSlide : currentSlide + 1;
    if (nextIdx !== currentSlide) {
      setSearchParams({ slide: (nextIdx + 1).toString() }, { replace: true });
    }
    resetControlsTimeout();
  }, [currentSlide, slides.length, setSearchParams, resetControlsTimeout]);

  const prevSlide = useCallback(() => {
    const nextIdx = currentSlide === 0 ? 0 : currentSlide - 1;
    if (nextIdx !== currentSlide) {
      setSearchParams({ slide: (nextIdx + 1).toString() }, { replace: true });
    }
    resetControlsTimeout();
  }, [currentSlide, setSearchParams, resetControlsTimeout]);

  useEffect(() => {
    if (slideParam) {
      const slideIndex = parseInt(slideParam) - 1;
      if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < slides.length && slideIndex !== currentSlide) {
        setCurrentSlide(slideIndex);
      }
    }
  }, [slideParam, slides.length, currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key.toLowerCase() === 'f') {
        const doc = window.document as any;
        const docEl = doc.documentElement as any;

        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        const exitFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (requestFullScreen && !doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
          requestFullScreen.call(docEl);
        } else if (exitFullScreen) {
          exitFullScreen.call(doc);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="w-full h-full bg-white overflow-hidden relative">
      {/* Navigation Controls */}
      <motion.div 
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-8 right-8 z-[110] flex items-center gap-6"
      >
        <div className="flex items-center gap-2">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-3 rounded-2xl glass border-slate-200 transition-all ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100 hover:scale-110 hover:bg-white shadow-lg'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`p-3 rounded-2xl glass border-slate-200 transition-all ${currentSlide === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100 hover:scale-110 hover:bg-white shadow-lg'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="font-mono text-xs text-slate-400 tracking-[0.3em] uppercase flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-brand-cyan font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
          <div className="w-8 h-px bg-slate-200" />
          <span>{String(slides.length).padStart(2, '0')}</span>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 z-[110]">
        <motion.div 
          initial={false}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue shadow-[0_0_20px_rgba(34,211,238,0.8)]"
        />
      </div>

      {/* Slides Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="w-full h-full"
        >
          {getSlideContent(slides[currentSlide]?.id)}
        </motion.div>
      </AnimatePresence>

      {/* Settings Button */}
      <motion.button
        animate={{ opacity: showControls ? 0.6 : 0 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        onClick={() => setShowManager(true)}
        className="absolute bottom-32 right-8 z-[110] p-3 rounded-2xl glass border-slate-200 shadow-lg text-slate-400 hover:text-brand-cyan transition-all"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Deck Manager Overlay */}
      <AnimatePresence>
        {showManager && (
          <DeckManager 
            isOpen={showManager}
            onClose={() => setShowManager(false)}
            slides={managedSlides}
            registry={slideRegistry}
            onReorder={reorderSlides}
            onToggle={toggleSlide}
            onReset={resetSlides}
            onExport={handleExportPPTX}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeckGMM2026;

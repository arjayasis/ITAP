import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Network,
  Lightbulb,
  Zap,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Share2,
  Download,
  CalendarPlus,
  Building2,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Search,
  Check,
  QrCode,
  ShieldCheck,
  Menu,
  ChevronDown,
  Info,
  Layers,
  Award,
  Brain,
  Bot,
  TrendingUp,
  MessagesSquare,
  Scale,
  BookOpen,
  Compass,
  Play
} from 'lucide-react';
import { memberCompanies } from '../data/membersData';
import { submitRegistrationToFirestore } from '../lib/firebaseQa';

// Brand Assets
const ASSETS = {
  tipLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/tip%20logo.png',
  techxStandard: 'https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/techx%20logo.png',
  techxFullWhite: 'https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/techx%20full%20white.png',
  techxDark: 'https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/techx%20for%20dark.png',
  itapLogoWhite: 'https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 4@4x.png',
  itapLogoColor: 'https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 3@4x.png',
  witsaLogo: 'https://marketing.timcorp.net.ph/hubfs/ITAP/witsa.jpeg'
};

interface RegistrationForm {
  attendeeType: 'student' | 'faculty' | 'industry';
  fullName: string;
  email: string;
  mobile: string;
  campus: string;
  collegeOrDept: string;
  idNumber: string;
  interests: string[];
}

export const TechXSummit2026: React.FC = () => {
  // Navigation & Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Interactive Pillars
  const [selectedPillar, setSelectedPillar] = useState<number>(0);

  // Sponsor Search
  const [sponsorSearch, setSponsorSearch] = useState('');

  // Registration Modal & State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState<RegistrationForm>({
    attendeeType: 'student',
    fullName: '',
    email: '',
    mobile: '',
    campus: 'T.I.P. Quezon City',
    collegeOrDept: 'College of Information Technology Education (CITE)',
    idNumber: '',
    interests: ['AI & Cloud Innovation']
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regTicketId, setRegTicketId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Track active scroll section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'expect', 'why-join', 'date', 'sponsors', 'register'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const url = window.location.origin + '/TechXSummit2026';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TECHX SUMMIT 2026 | CREATING WHAT’S NEXT',
          text: 'Your Future in Tech Starts Here. Join us at TECHX SUMMIT 2026 on October 15, 2026 at T.I.P. Quezon City – Anniversary Hall!',
          url
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Google Calendar Link generator (8:00 AM to 5:00 PM PHT)
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent('TECHX SUMMIT 2026: CREATING WHAT’S NEXT');
    const details = encodeURIComponent(
      'TECHX SUMMIT 2026\nCREATING WHAT’S NEXT\n\nYour Future in Tech Starts Here.\n\nTechnology is changing fast. AI, cybersecurity, automation, and digital innovation are transforming the way we learn, work, and build.\n\nCome see what’s happening beyond the classroom and discover what’s next for your future in tech.\n\nDate: October 15, 2026 | Thursday\nTime: 8:00 AM – 5:00 PM\nVenue: T.I.P. Quezon City – Anniversary Hall\n\nMore details: https://itaphil.com/TechXSummit2026'
    );
    const location = encodeURIComponent('Anniversary Hall, T.I.P. Quezon City (938 Aurora Blvd, Cubao, Quezon City, Metro Manila)');
    // 2026-10-15 08:00:00 to 17:00:00 (UTC+8 -> 00:00:00 to 09:00:00 UTC)
    const dates = '20261015T000000Z/20261015T090000Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const validateRegistration = () => {
    const errs: Record<string, string> = {};
    if (!regForm.fullName.trim()) errs.fullName = 'Full name is required';
    if (!regForm.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!regForm.mobile.trim()) {
      errs.mobile = 'Mobile phone is required';
    }
    if (!regForm.idNumber.trim()) {
      errs.idNumber = regForm.attendeeType === 'student' ? 'Student ID is required' : 'Employee ID is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegistration()) return;

    setIsSubmitting(true);
    const ticketId = `TIP-TX-${Math.floor(100000 + Math.random() * 900000)}`;

    const registrationPayload = {
      registrationId: ticketId,
      fullName: regForm.fullName.trim(),
      email: regForm.email.trim().toLowerCase(),
      mobile: regForm.mobile.trim(),
      attendeeType: regForm.attendeeType,
      campus: regForm.campus,
      collegeOrDept: regForm.collegeOrDept,
      idNumber: regForm.idNumber.trim(),
      interests: regForm.interests,
      eventName: 'TECHX SUMMIT 2026',
      eventDate: 'October 15, 2026 (8:00 AM – 5:00 PM)',
      venue: 'T.I.P. Quezon City – Anniversary Hall',
      createdAt: Date.now()
    };

    try {
      await submitRegistrationToFirestore(registrationPayload);
    } catch (err) {
      console.warn('Fallback: stored locally', err);
    }

    // Save ticket locally for offline retrieval
    localStorage.setItem('techx_summit_ticket', JSON.stringify(registrationPayload));

    setIsSubmitting(false);
    setRegTicketId(ticketId);
    setIsRegistered(true);
  };

  // WHAT TO EXPECT Data (Exact items requested)
  const whatToExpectItems = [
    {
      id: 'ai-genai',
      title: 'AI & Generative AI',
      description: 'Explore how AI tools are changing the way we work, create, and solve problems.',
      icon: Brain,
      color: '#05BFE0', // Cyan
      bgGradient: 'from-[#05BFE0]/20 via-[#4F17A8]/10 to-transparent',
      borderColor: 'border-[#05BFE0]/30',
      badge: 'Artificial Intelligence'
    },
    {
      id: 'cybersecurity-live',
      title: 'Cybersecurity Live',
      description: 'Experience cybersecurity through an engaging live attack-and-defense simulation.',
      icon: ShieldCheck,
      color: '#FF2D8D', // Pink
      bgGradient: 'from-[#FF2D8D]/20 via-[#4F17A8]/10 to-transparent',
      borderColor: 'border-[#FF2D8D]/30',
      badge: 'Live Simulation'
    },
    {
      id: 'it-governance',
      title: 'IT Governance & Responsible Technology',
      description: 'Discover why managing risk, security, and responsible technology matters in the IT industry.',
      icon: Scale,
      color: '#A87FFB', // Purple
      bgGradient: 'from-[#4F17A8]/30 via-[#05BFE0]/10 to-transparent',
      borderColor: 'border-[#4F17A8]/40',
      badge: 'Governance & Ethics'
    },
    {
      id: 'agentic-ai',
      title: 'Agentic AI',
      description: 'Learn how AI agents can perform tasks, use tools, and support more automated workflows.',
      icon: Bot,
      color: '#05BFE0', // Cyan
      bgGradient: 'from-[#05BFE0]/20 via-[#FF2D8D]/10 to-transparent',
      borderColor: 'border-[#05BFE0]/30',
      badge: 'Autonomous Systems'
    },
    {
      id: 'future-tech-careers',
      title: 'Future Tech Careers',
      description: 'Hear from industry leaders about the skills, opportunities, and changes shaping the future of technology careers.',
      icon: TrendingUp,
      color: '#FF2D8D', // Pink
      bgGradient: 'from-[#FF2D8D]/20 via-[#4F17A8]/10 to-transparent',
      borderColor: 'border-[#FF2D8D]/30',
      badge: 'Career Pathways'
    },
    {
      id: 'industry-conversations',
      title: 'Industry Conversations',
      description: 'Listen, ask questions, and gain real-world insights from technology professionals.',
      icon: MessagesSquare,
      color: '#A87FFB', // Purple
      bgGradient: 'from-[#4F17A8]/30 via-[#05BFE0]/10 to-transparent',
      borderColor: 'border-[#4F17A8]/40',
      badge: 'Real-World Insights'
    }
  ];

  // WHY JOIN? Data (Exact 4 items requested)
  const whyJoinItems = [
    {
      action: 'LEARN',
      statement: 'beyond the classroom.',
      description: 'Gain practical knowledge from frontline industry practitioners on modern production stacks and architectures.',
      icon: BookOpen,
      color: '#05BFE0',
      accentBg: 'bg-[#05BFE0]/15 text-[#05BFE0] border-[#05BFE0]/30'
    },
    {
      action: 'EXPERIENCE',
      statement: 'technology through live demonstrations.',
      description: 'Witness real-time defensive hacking simulations, agentic autonomous tool runs, and live tech demos.',
      icon: Play,
      color: '#FF2D8D',
      accentBg: 'bg-[#FF2D8D]/15 text-[#FF2D8D] border-[#FF2D8D]/30'
    },
    {
      action: 'CONNECT',
      statement: 'with industry professionals.',
      description: 'Network directly with ITAP executives, hiring directors, engineering mentors, and industry pioneers.',
      icon: Users,
      color: '#A87FFB',
      accentBg: 'bg-[#4F17A8]/25 text-[#A87FFB] border-[#4F17A8]/40'
    },
    {
      action: 'DISCOVER',
      statement: 'the future of tech careers.',
      description: 'Understand which emerging disciplines, certifications, and skills will be in highest demand across 2026 and beyond.',
      icon: Compass,
      color: '#38BDF8',
      accentBg: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
    }
  ];

  // Filtered Sponsor Companies
  const filteredSponsors = memberCompanies.filter((company) =>
    company.name.toLowerCase().includes(sponsorSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F2B] text-slate-100 font-sans selection:bg-[#05BFE0]/30 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#05BFE0]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-[#4F17A8]/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 left-10 w-[26rem] h-[26rem] bg-[#FF2D8D]/10 rounded-full blur-[140px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* =========================================================================
          1. NAVIGATION / HEADER BAR
         ========================================================================= */}
      <header
        id="navbar"
        className="sticky top-0 z-50 w-full bg-[#0B0F2B]/90 backdrop-blur-xl border-b border-white/10 transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22">
            {/* Left: Brand Logos & Partnership Lockup */}
            <div className="flex items-center gap-2 sm:gap-3.5 md:gap-4 overflow-x-auto no-scrollbar py-1">
              {/* TechX Logo */}
              <Link to="/TechXSummit2026" className="flex items-center group shrink-0" title="TechX Summit 2026">
                <img
                  src={ASSETS.techxFullWhite}
                  alt="TechX Summit Logo"
                  className="h-7 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </Link>

              {/* IN PARTNERSHIP WITH */}
              <span className="text-[9px] sm:text-[10px] md:text-xs font-mono font-bold tracking-wider sm:tracking-widest uppercase text-slate-300/90 whitespace-nowrap shrink-0">
                IN PARTNERSHIP WITH
              </span>

              {/* ITAP Logo */}
              <Link to="/" className="flex items-center group shrink-0" title="Infocomm Technology Association of the Philippines (ITAP)">
                <img
                  src={ASSETS.itapLogoWhite}
                  alt="ITAP Logo"
                  className="h-6 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </Link>

              {/* Divider | */}
              <div className="h-5 sm:h-6 md:h-7 w-px bg-white/25 shrink-0" aria-hidden="true" />

              {/* TIP Logo */}
              <a
                href="https://www.tip.edu.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group shrink-0"
                title="Technological Institute of the Philippines (T.I.P.)"
              >
                <img
                  src={ASSETS.tipLogo}
                  alt="T.I.P. Logo"
                  className="h-6 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>

            {/* Right Action: Register CTA Button */}
            <div className="flex items-center shrink-0 ml-2">
              <button
                id="header-register-btn"
                onClick={() => setIsRegisterModalOpen(true)}
                className="relative group overflow-hidden px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-lg shadow-[#FF2D8D]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>Register Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
         ========================================================================= */}
      <section id="hero" className="relative pt-12 pb-0 md:pt-20 md:pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pre-Header Announcement Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#05BFE0]/40 bg-[#05BFE0]/10 text-xs sm:text-sm font-mono tracking-wider text-[#05BFE0] mb-6 shadow-sm shadow-[#05BFE0]/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF2D8D] animate-pulse" />
              <span className="font-semibold uppercase tracking-widest">
                SAVE THE DATE | ITAP & T.I.P. PRESENT
              </span>
            </motion.div>

            {/* TechX Full Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 relative flex flex-col items-center justify-center"
            >
              <div className="absolute -inset-8 bg-gradient-to-r from-[#05BFE0]/25 via-[#4F17A8]/35 to-[#FF2D8D]/25 rounded-3xl blur-3xl opacity-75 -z-10 pointer-events-none" />
              <img
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/techx%20for%20dark.png"
                alt="TechX Summit 2026 Logo"
                className="h-28 sm:h-40 md:h-48 lg:h-56 w-auto max-w-[92%] object-contain mx-auto drop-shadow-[0_12px_35px_rgba(0,0,0,0.65)]"
                referrerPolicy="no-referrer"
              />
              <h1 className="sr-only">TECHX SUMMIT 2026: CREATING WHAT’S NEXT</h1>
            </motion.div>

            {/* Theme & Tagline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-[#E5E7EB] uppercase font-mono mb-2">
                CREATING WHAT’S NEXT
              </p>
            </motion.div>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16"
            >
              <button
                id="hero-register-primary-btn"
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-xl shadow-[#FF2D8D]/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5"
              >
                <span>REGISTER NOW</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="hero-learn-more-btn"
                onClick={() => scrollToSection('about')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-slate-200 border border-white/20 hover:border-[#05BFE0] hover:text-white hover:bg-white/10 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Learn More</span>
                <ChevronDown className="w-4 h-4 text-[#05BFE0]" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Infinite Logo Marquee of All ITAP Members - Edge to Edge in White Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full bg-white border-y border-slate-200 py-6 sm:py-8 relative z-10 shadow-sm"
        >
          <div className="text-center mb-4 px-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500 font-bold block mb-1">
              ITAP MEMBER COMPANIES & INDUSTRY PARTNERS
            </span>
            <p className="text-xs text-slate-600 font-medium">
              Leading tech enterprises and innovators exhibiting at TechX Summit 2026
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            {/* White gradient edge masks */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/85 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/85 to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex items-center gap-4 sm:gap-6 w-max"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
                duration: 38
              }}
            >
              {[...memberCompanies, ...memberCompanies].map((company, idx) => (
                <a
                  key={idx}
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#05BFE0] flex items-center justify-center shrink-0 h-16 sm:h-20 w-40 sm:w-48 transition-all group"
                  title={company.name}
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="max-h-10 sm:max-h-12 max-w-[85%] w-auto object-contain transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          3. ABOUT & INTRODUCTION
         ========================================================================= */}
      <section id="about" className="py-16 md:py-24 relative border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#05BFE0] font-semibold block mb-2">
              BEYOND THE CLASSROOM
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mb-6">
              CREATING WHAT’S NEXT
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
              Technology is changing fast. <strong className="text-white">AI, cybersecurity, automation, and digital innovation</strong> are
              transforming the way we learn, work, and build.
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Presented by the <strong className="text-[#05BFE0]">Infocomm Technology Association of the Philippines (ITAP)</strong> in
              partnership with the <strong className="text-amber-400">Technological Institute of the Philippines (T.I.P.)</strong>,
              TechX Summit 2026 offers students and faculty a front-row seat to practical enterprise innovation.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. WHAT TO EXPECT
         ========================================================================= */}
      <section id="expect" className="py-20 md:py-28 relative border-t border-white/10 bg-[#0B0F2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#05BFE0] font-semibold block mb-2">
              DISCOVER THE EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-4 uppercase">
              WHAT TO EXPECT
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Come see what’s happening beyond the classroom and discover what’s next for your future in tech across these core interactive experiences.
            </p>
          </div>

          {/* 6 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {whatToExpectItems.map((item, index) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className={`rounded-3xl p-7 bg-white/5 border ${item.borderColor} hover:border-white/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group`}
                >
                  {/* Subtle Gradient Backdrop */}
                  <div
                    className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${item.bgGradient} rounded-full blur-3xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                        style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}50` }}
                      >
                        <IconComp className="w-7 h-7" style={{ color: item.color }} />
                      </div>
                      <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#05BFE0] transition-colors font-display">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                    <span className="font-mono text-slate-400 group-hover:text-white transition-colors">
                      Featured in Summit
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick CTA inside What to Expect */}
          <div className="text-center">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-white/10 border border-white/20 hover:bg-[#FF2D8D] hover:border-[#FF2D8D] transition-all shadow-md"
            >
              <span>Experience All 6 Tracks — Register for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. WHY JOIN?
         ========================================================================= */}
      <section id="why-join" className="py-20 md:py-28 relative border-t border-white/10 bg-[#06091A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF2D8D] font-semibold block mb-2">
              ELEVATE YOUR JOURNEY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-4 uppercase">
              WHY JOIN?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Four compelling reasons why every T.I.P. student, aspiring technologist, and educator should participate.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyJoinItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl p-7 bg-white/5 border border-white/10 hover:border-[#05BFE0]/40 transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}50` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: item.color }} />
                      </div>
                      <span className="text-xs font-mono text-slate-500 font-bold">0{idx + 1}</span>
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-black text-white uppercase tracking-tight block">
                        <span className="text-[#05BFE0]">{item.action}</span>
                      </span>
                      <span className="text-base font-bold text-slate-200">
                        {item.statement}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-medium border ${item.accentBg}`}>
                      {item.action} at TechX
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SAVE THE DATE & PROGRAM SCHEDULE
         ========================================================================= */}
      <section id="date" className="py-20 md:py-28 relative border-t border-white/10 bg-[#0B0F2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* SAVE THE DATE Highlight Card */}
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/15 backdrop-blur-xl relative overflow-hidden mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#FF2D8D] font-bold block mb-2">
                  MARK YOUR CALENDARS
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-4 uppercase">
                  📅 SAVE THE DATE
                </h2>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
                    <Calendar className="w-5 h-5 text-[#05BFE0]" />
                    <span>October 15, 2026 | Thursday</span>
                  </div>
                  <div className="flex items-center gap-3 text-base sm:text-lg font-semibold text-[#05BFE0]">
                    <Clock className="w-5 h-5 text-[#05BFE0]" />
                    <span>8:00 AM – 5:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-base sm:text-lg font-medium text-slate-200">
                    <MapPin className="w-5 h-5 text-[#FF2D8D]" />
                    <span>📍 T.I.P. Quezon City – Anniversary Hall</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Venue address: 938 Aurora Blvd, Cubao, Quezon City, Metro Manila. Early check-in opens at 8:00 AM.
                  Free admission for all verified T.I.P. students and faculty with valid university ID.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end justify-center">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-xl shadow-[#FF2D8D]/30 transition-all text-center"
                >
                  Register Now (Free)
                </button>
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-medium text-sm text-slate-200 border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4 text-[#05BFE0]" />
                  <span>Add to Google Calendar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================================
          5. SPONSORS & PARTNERS SECTION
         ========================================================================= */}
      <section id="sponsors" className="py-20 md:py-28 relative border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Institutional Partners Banner */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#05BFE0] font-semibold block mb-2">
              CO-ORGANIZERS & PARTNERS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display mb-4">
              In Partnership With
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Bringing together institutional academic leadership and industry-grade technological prowess.
            </p>
          </div>

          {/* Co-Host Logos Dual Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {/* T.I.P. Host Card */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center justify-between hover:border-amber-400/40 transition-colors">
              <div className="mb-6 flex flex-col items-center">
                <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest mb-3 font-semibold">
                  Host Academic Institution
                </span>
                <img
                  src={ASSETS.tipLogo}
                  alt="T.I.P. Logo"
                  className="h-16 w-auto object-contain mb-4"
                  referrerPolicy="no-referrer"
                />
                <h4 className="text-lg font-bold text-white">Technological Institute of the Philippines</h4>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">
                  Quezon City Campus • 938 Aurora Blvd, Cubao, Quezon City. Leading academic center in engineering, computing, and technology education.
                </p>
              </div>
              <a
                href="https://www.tip.edu.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[#05BFE0] hover:underline flex items-center gap-1"
              >
                <span>Visit tip.edu.ph</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* ITAP Organizer Card */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center justify-between hover:border-[#05BFE0]/40 transition-colors">
              <div className="mb-6 flex flex-col items-center">
                <span className="text-[10px] font-mono uppercase text-[#05BFE0] tracking-widest mb-3 font-semibold">
                  Major Event Sponsor & Prime Mover
                </span>
                <img
                  src={ASSETS.itapLogoWhite}
                  alt="ITAP Logo"
                  className="h-16 w-auto object-contain mb-4"
                  referrerPolicy="no-referrer"
                />
                <h4 className="text-lg font-bold text-white">ITAP (Infocomm Technology Association of the Philippines)</h4>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">
                  The prime mover in Philippine ICT since 1984. Uniting tier-1 enterprise leaders, hardware pioneers, and cloud innovators.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://witsa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                  title="World Innovation, Technology and Services Alliance (WITSA)"
                >
                  <img
                    src={ASSETS.witsaLogo}
                    alt="WITSA"
                    className="h-5 w-auto object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] font-mono">WITSA PH Partner</span>
                </a>
              </div>
            </div>
          </div>

          {/* ITAP Member Sponsors Showcase */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#FF2D8D] font-semibold block mb-1">
                  ENTERPRISE SPONSOR SHOWCASE
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  ITAP Member Companies & Tech Exhibitors
                </h3>
              </div>

              {/* Sponsor Search Filter */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter sponsor companies..."
                  value={sponsorSearch}
                  onChange={(e) => setSponsorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0]"
                />
              </div>
            </div>

            {/* White Background Logo Showcase Container */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                {filteredSponsors.map((sponsor, idx) => (
                  <a
                    key={idx}
                    id={`sponsor-item-${idx}`}
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#05BFE0] hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center group h-28 sm:h-32 relative overflow-hidden"
                    title={`${sponsor.name} - Click to view company profile`}
                  >
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-12 max-w-[85%] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <span className="text-[10px] text-slate-600 line-clamp-1 mt-1.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {sponsor.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#05BFE0] absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>

              {filteredSponsors.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No member companies matched "{sponsorSearch}".</p>
                  <button
                    onClick={() => setSponsorSearch('')}
                    className="mt-2 text-xs text-[#05BFE0] underline font-mono font-medium"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CLOSING CALL-TO-ACTION BANNER & REGISTRATION PROMPT
         ========================================================================= */}
      <section id="register" className="py-20 md:py-28 relative border-t border-white/10 overflow-hidden">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4F17A8]/10 to-[#05BFE0]/10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF2D8D]/20 via-[#4F17A8]/30 to-[#05BFE0]/20 border border-[#FF2D8D]/30 text-xs sm:text-sm font-mono tracking-widest text-white uppercase font-bold mb-4">
              OCTOBER 15, 2026 • T.I.P. QUEZON CITY
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight font-display leading-tight max-w-4xl mx-auto">
              READY TO CREATE
              <span className="block bg-gradient-to-r from-[#05BFE0] via-[#A87FFB] to-[#FF2D8D] bg-clip-text text-transparent">
                WHAT’S NEXT?
              </span>
            </h2>
          </motion.div>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Register now and be part of TechX Summit 2026.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="closing-cta-register-btn"
              onClick={() => setIsRegisterModalOpen(true)}
              className="w-full sm:w-auto py-4 px-10 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-xl shadow-[#FF2D8D]/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 tracking-wide"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="closing-cta-share-btn"
              onClick={handleShare}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl font-semibold text-sm text-slate-200 border border-white/15 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-[#05BFE0]" />
              <span>Share Event</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
         ========================================================================= */}
      <footer className="py-14 border-t border-white/10 bg-[#06091A] text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand & Route */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <img
                  src={ASSETS.techxFullWhite}
                  alt="TechX Summit"
                  className="h-8 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="h-6 w-px bg-white/20" />
                <img
                  src={ASSETS.tipLogo}
                  alt="T.I.P."
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                TechX Summit 2026: Creating What’s Next. Co-presented by the Infocomm Technology Association of the Philippines (ITAP)
                and the Technological Institute of the Philippines (T.I.P.).
              </p>
              <div className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-[#05BFE0]">
                Route: <code className="text-white">/TechXSummit2026</code>
              </div>
            </div>

            {/* Col 2: Event Quick Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                Summit Schedule
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#05BFE0]" />
                  <span>October 15, 2026 | Thursday</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#A87FFB]" />
                  <span>8:00 AM – 5:00 PM</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF2D8D] shrink-0 mt-0.5" />
                  <span>Anniversary Hall, T.I.P. Quezon City (938 Aurora Blvd, Cubao)</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                Direct Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/techx-qa" className="hover:text-[#05BFE0] transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#05BFE0]" />
                    <span>TechX Participant Live Q&A</span>
                  </Link>
                </li>
                <li>
                  <Link to="/techx-live-qa" className="hover:text-[#05BFE0] transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D8D]" />
                    <span>TechX Stage Live Display</span>
                  </Link>
                </li>
                <li>
                  <Link to="/techx-qa-host" className="hover:text-[#05BFE0] transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>TechX Host Moderation Room</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.tip.edu.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    T.I.P. Official Academic Portal
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Secretariat */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                Secretariat & Inquiries
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href="mailto:secretariat@itaphil.com" className="hover:text-white transition-colors">
                    secretariat@itaphil.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+63 917 1607557</span>
                </li>
                <li className="text-[11px] text-slate-500">
                  Makati Central Post Office Box 3240, Makati City, Philippines
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <p>© 2026 ITAP & Technological Institute of the Philippines (T.I.P.). All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => scrollToSection('hero')} className="hover:text-slate-300 transition-colors">
                Back to Top ↑
              </button>
              <Link to="/" className="hover:text-[#05BFE0] transition-colors">
                ITAP Home
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          REGISTRATION MODAL
         ========================================================================= */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0F1438] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#05BFE0]/20 text-[#05BFE0] uppercase font-bold">
                      Official Registration
                    </span>
                    <span className="text-xs text-slate-400">• T.I.P. Quezon City</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {isRegistered ? 'Your Registration Pass' : 'Reserve Your TechX Summit Pass'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              {!isRegistered ? (
                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  {/* Attendee Type Pill Selector */}
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-2 font-medium">
                      I am registering as:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'T.I.P. Student', value: 'student' },
                        { label: 'T.I.P. Faculty/Staff', value: 'faculty' },
                        { label: 'ITAP / Industry', value: 'industry' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setRegForm({ ...regForm, attendeeType: type.value as any })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            regForm.attendeeType === type.value
                              ? 'bg-[#05BFE0]/20 border-[#05BFE0] text-white shadow-sm'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Full Name <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Juan Dela Cruz"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.fullName ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white focus:outline-none focus:border-[#05BFE0]`}
                      />
                      {formErrors.fullName && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block">{formErrors.fullName}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Institutional Email <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder={regForm.attendeeType === 'student' ? 'e.g. jdelacruz@tip.edu.ph' : 'name@company.com'}
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.email ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white focus:outline-none focus:border-[#05BFE0]`}
                      />
                      {formErrors.email && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block">{formErrors.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Mobile & Student/Employee ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Mobile Phone <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={regForm.mobile}
                        onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.mobile ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white focus:outline-none focus:border-[#05BFE0]`}
                      />
                      {formErrors.mobile && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block">{formErrors.mobile}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        {regForm.attendeeType === 'student' ? 'Student ID Number' : 'Employee / PRC ID'}{' '}
                        <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={regForm.attendeeType === 'student' ? 'e.g. 21-10293' : 'e.g. TIP-FAC-8821'}
                        value={regForm.idNumber}
                        onChange={(e) => setRegForm({ ...regForm, idNumber: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.idNumber ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white focus:outline-none focus:border-[#05BFE0]`}
                      />
                      {formErrors.idNumber && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block">{formErrors.idNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Campus & College */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">T.I.P. Campus</label>
                      <select
                        value={regForm.campus}
                        onChange={(e) => setRegForm({ ...regForm, campus: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F2B] border border-white/15 text-sm text-white focus:outline-none focus:border-[#05BFE0]"
                      >
                        <option value="T.I.P. Quezon City">T.I.P. Quezon City (Host Campus)</option>
                        <option value="T.I.P. Manila">T.I.P. Manila Campus</option>
                        <option value="External / Partner Institution">External / ITAP Guest</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">College / Department</label>
                      <select
                        value={regForm.collegeOrDept}
                        onChange={(e) => setRegForm({ ...regForm, collegeOrDept: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F2B] border border-white/15 text-sm text-white focus:outline-none focus:border-[#05BFE0]"
                      >
                        <option value="College of Information Technology Education (CITE)">
                          College of Information Technology Education (CITE)
                        </option>
                        <option value="College of Engineering & Architecture (CEA)">
                          College of Engineering & Architecture (CEA)
                        </option>
                        <option value="College of Arts & Sciences">College of Arts & Sciences</option>
                        <option value="College of Business Education">College of Business Education</option>
                        <option value="ITAP Corporate Enterprise Delegate">ITAP Corporate Enterprise Delegate</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-2">
                    By clicking Register, you confirm your attendance at T.I.P. Quezon City Anniversary Hall on
                    October 15, 2026. Official electronic badge and certificate eligibility will be dispatched to your email.
                  </p>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRegisterModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-lg shadow-[#FF2D8D]/25 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Confirming Reservation...' : 'Complete Free Registration'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Ticket Confirmation Card */
                <div className="text-center py-4 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold text-white mb-1">Registration Confirmed!</h4>
                    <p className="text-sm text-slate-300">
                      Welcome, <span className="text-[#05BFE0] font-semibold">{regForm.fullName}</span>! You are officially
                      registered for TECHX SUMMIT 2026: CREATING WHAT’S NEXT.
                    </p>
                  </div>

                  {/* Pass Visual */}
                  <div className="p-6 rounded-3xl bg-[#0B0F2B] border border-white/15 max-w-md mx-auto text-left relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#05BFE0] uppercase tracking-widest block font-semibold">
                          TECHX SUMMIT 2026
                        </span>
                        <span className="text-sm font-bold text-white">DELEGATE ACCESS PASS</span>
                      </div>
                      <div className="px-2 py-1 rounded bg-[#FF2D8D]/20 border border-[#FF2D8D]/30 text-[10px] font-mono text-[#FF2D8D] uppercase font-bold">
                        {regForm.attendeeType.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Attendee</span>
                        <span className="text-white font-semibold">{regForm.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Pass Number</span>
                        <span className="text-[#05BFE0] font-mono font-bold">{regTicketId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Institution</span>
                        <span className="text-slate-300">{regForm.campus}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Date & Time</span>
                        <span className="text-slate-300">Oct 15, 2026 • 8:00 AM – 5:00 PM</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono text-slate-400">
                      <span>Venue: T.I.P. Anniversary Hall</span>
                      <span className="text-emerald-400 font-semibold">VALIDATED</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center justify-center gap-2"
                    >
                      <CalendarPlus className="w-4 h-4 text-[#05BFE0]" />
                      <span>Add to Calendar</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsRegistered(false);
                        setIsRegisterModalOpen(false);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#05BFE0] hover:bg-[#05BFE0]/90 text-white text-xs font-bold shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

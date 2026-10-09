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
  Play,
  FileSpreadsheet,
  Copy,
  Code2,
  Database,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Cpu,
  Coffee,
  Gift,
  ShieldAlert,
  Filter,
  CheckCircle,
  MessageSquare,
  Lock
} from 'lucide-react';
import { memberCompanies } from '../data/membersData';
import { submitRegistrationToFirestore, checkDuplicateRegistration, isStudentRegistrationClosed } from '../lib/firebaseQa';
import { submitStudentRegistrationToGoogleSheets } from '../lib/googleSheetsTechX';

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

interface StudentRegistrationForm {
  firstName: string;
  lastName: string;
  middleName: string;
  mobile: string;
  email: string;
  studentNumber?: string;
  college: string;
  program: string;
  location: 'Manila' | 'Quezon City';
  yearLevel: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | '5th Year' | 'Graduate / Masteral';
  // Legacy / compatibility aliases
  course?: string;
  campus?: string;
  collegeOrDept?: string;
  privacyConsent: boolean;
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
  const [customCollege, setCustomCollege] = useState('');
  const [regForm, setRegForm] = useState<StudentRegistrationForm>({
    firstName: '',
    lastName: '',
    middleName: '',
    mobile: '',
    email: '',
    college: 'College of Information Technology Education (CITE)',
    program: '',
    location: 'Quezon City',
    yearLevel: '4th Year',
    privacyConsent: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regTicketId, setRegTicketId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);

  // Quietly check registration capacity status on load and modal open (do not expose internal limits)
  useEffect(() => {
    isStudentRegistrationClosed()
      .then((closed) => setIsRegistrationClosed(closed))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isRegisterModalOpen) {
      isStudentRegistrationClosed()
        .then((closed) => setIsRegistrationClosed(closed))
        .catch(() => {});
    }
  }, [isRegisterModalOpen]);

  // Program Flow Schedule State
  const [programTrackFilter, setProgramTrackFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [programSearch, setProgramSearch] = useState('');
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  // Track active scroll section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'expect', 'why-join', 'program-flow', 'date', 'sponsors', 'register'];
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

  // Copy Complete Program Flow Schedule to Clipboard
  const handleCopySchedule = () => {
    const text = `TECHX SUMMIT 2026 — PROGRAM FLOW
CREATING WHAT’S NEXT
Date: October 15, 2026 | Thursday (8:00 AM – 5:00 PM)
Venue: Anniversary Hall, T.I.P. Quezon City

MORNING PLENARY:
• 8:00 – 8:30 AM : REGISTRATION, NETWORKING & TECHX SUMMIT OPENS
• 8:30 – 8:40 AM : INVOCATION & PHILIPPINE NATIONAL ANTHEM
• 8:40 – 9:00 AM : WELCOME REMARKS
• 9:00 – 9:10 AM : ACKNOWLEDGMENT OF GUESTS, PARTNERS & SPONSORS
• 9:10 – 9:25 AM : RIBBON CUTTING & OFFICIAL OPENING
• 9:25 – 9:55 AM : OPENING KEYNOTE: THE FUTURE OF TECH CAREERS IN THE AI ERA
• 9:55 – 10:25 AM : AI-READY DATA CENTERS: POWERING THE FUTURE OF INTELLIGENT TECHNOLOGY
• 10:25 – 10:45 AM : NETWORKING BREAK
• 10:45 – 11:15 AM : CYBERSECURITY LIVE: ATTACK & DEFENSE SIMULATION
• 11:15 AM – 12:00 PM : FIRESIDE CHAT / OPEN Q&A WITH INDUSTRY EXPERTS
• 12:00 – 1:30 PM : LUNCH BREAK

AFTERNOON | HANDS-ON & LEADERSHIP TRACKS:
• 1:30 – 2:00 PM : LEADING HIGH-PERFORMING TECH TEAMS: COMMUNICATION, COLLABORATION & LEADERSHIP
• 2:00 – 2:45 PM : TRUST BY DESIGN: IT GOVERNANCE, RISK & RESPONSIBLE TECHNOLOGY
• 2:45 – 3:05 PM : NETWORKING BREAK
• 3:05 – 3:50 PM : HUMAN IN THE LEAD: THE EVOLVING AI LANDSCAPE
• 3:50 – 4:35 PM : INDUSTRY ROUNDTABLE: THE NEXT 5 YEARS OF TECH CAREERS
• 4:35 – 5:00 PM : CLOSING REMARKS, RECOGNITION & RAFFLE DRAW

EXPLORE TECHNOLOGY. CONNECT WITH INNOVATORS.
NETWORK • COLLABORATE • INNOVATE • TRANSFORM
Official Summit Link: ${window.location.origin}/TechXSummit2026`;

    navigator.clipboard.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2500);
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
    if (!regForm.firstName.trim()) errs.firstName = 'First name is required';
    if (!regForm.lastName.trim()) errs.lastName = 'Last name is required';
    if (!regForm.college) {
      errs.college = 'Please select your College';
    }
    if (!regForm.program.trim()) {
      errs.program = 'Program is required';
    }
    if (!regForm.location) {
      errs.location = 'Please select a location (Manila / Quezon City)';
    }
    if (!regForm.yearLevel) {
      errs.yearLevel = 'Please select your Year Level';
    }
    if (!regForm.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    }
    if (!regForm.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!regForm.privacyConsent) {
      errs.privacyConsent = 'You must agree to the Data Privacy Notice to register';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegistration()) return;

    setDuplicateErrorMessage(null);
    setIsSubmitting(true);
    const fullName = `${regForm.firstName.trim()} ${regForm.middleName ? regForm.middleName.trim() + ' ' : ''}${regForm.lastName.trim()}`;

    // CAPACITY ENFORCEMENT: Close registration when limit reached (without publicizing the restriction number)
    try {
      const closed = await isStudentRegistrationClosed();
      if (closed) {
        setIsRegistrationClosed(true);
        const closedMessage = 'Registration for students is now closed as maximum capacity has been reached. Thank you for your interest in TechX Summit 2026.';
        setDuplicateErrorMessage(closedMessage);
        setIsSubmitting(false);
        return;
      }
    } catch (capErr) {
      console.warn('Capacity check warning:', capErr);
    }

    // STRICT DEDUPLICATION ENFORCEMENT: Do not accept duplicate entry
    try {
      const dupCheck = await checkDuplicateRegistration({
        attendeeType: 'student',
        email: regForm.email.trim(),
        fullName,
        mobile: regForm.mobile.trim()
      });

      if (dupCheck.isDuplicate) {
        const message = dupCheck.reason || 'This student email is already registered for TechX Summit 2026. Duplicate registrations are not accepted.';
        setDuplicateErrorMessage(message);
        setFormErrors((prev) => ({ ...prev, email: message }));
        setIsSubmitting(false);
        return;
      }
    } catch (checkErr) {
      console.warn('Duplicate pre-check warning:', checkErr);
    }

    const ticketId = `TIP-TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalCollege = regForm.college === 'Others' 
      ? (customCollege.trim() ? `Others (${customCollege.trim()})` : 'Others')
      : regForm.college;

    const registrationPayload = {
      registrationId: ticketId,
      attendeeType: 'student',
      firstName: regForm.firstName.trim(),
      lastName: regForm.lastName.trim(),
      middleName: (regForm.middleName || '').trim(),
      fullName,
      college: finalCollege,
      program: regForm.program.trim(),
      location: regForm.location,
      yearLevel: regForm.yearLevel,
      // Compatibility fields
      collegeOrDept: finalCollege,
      course: regForm.program.trim(),
      campus: `T.I.P. ${regForm.location}`,
      email: regForm.email.trim().toLowerCase(),
      mobile: regForm.mobile.trim(),
      dataPrivacyConsent: true,
      dataPrivacyAcceptedAt: new Date().toISOString(),
      eventName: 'TECHX SUMMIT 2026',
      eventDate: 'October 15, 2026 (8:00 AM – 5:00 PM)',
      venue: regForm.location === 'Quezon City' 
        ? 'T.I.P. Quezon City – Anniversary Hall' 
        : 'T.I.P. Quezon City – Anniversary Hall (Delegate from Manila)',
      createdAt: Date.now()
    };

    try {
      // 1. Submit to Cloud Firestore first with strict duplicate protection
      await submitRegistrationToFirestore(registrationPayload);
    } catch (err: any) {
      console.warn('Firestore registration error:', err);
      if (err?.message?.includes('Duplicate') || err?.message?.includes('already registered')) {
        setDuplicateErrorMessage(err.message);
        setFormErrors((prev) => ({ ...prev, email: err.message }));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // 2. Submit student registration to Google Sheets in background via server proxy / Apps Script Webhook
      await submitStudentRegistrationToGoogleSheets(registrationPayload);
    } catch (sheetErr) {
      console.warn('Google Sheets sync warning (non-blocking):', sheetErr);
    }

    // 3. Save ticket locally for offline retrieval
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

  // Official Program Flow Schedule (From Official TechX Summit 2026 Poster)
  const morningPlenaryFlow = [
    {
      id: 'm1',
      time: '8:00 – 8:30 AM',
      title: 'REGISTRATION, NETWORKING & TECHX SUMMIT OPENS',
      category: 'Registration & Welcome',
      badge: 'Arrival',
      badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/50',
      description: 'Check-in, badge assignment, student registration verification, and early morning delegate networking.'
    },
    {
      id: 'm2',
      time: '8:30 – 8:40 AM',
      title: 'INVOCATION & PHILIPPINE NATIONAL ANTHEM',
      category: 'Ceremonial Opening',
      badge: 'Ceremony',
      badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-950/40',
      description: 'Solemn invocation followed by the Philippine National Anthem.'
    },
    {
      id: 'm3',
      time: '8:40 – 9:00 AM',
      title: 'WELCOME REMARKS',
      category: 'Official Welcome',
      badge: 'Remarks',
      badgeColor: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/40',
      description: 'Welcome addresses by ITAP Board of Directors and T.I.P. Academic Leadership.'
    },
    {
      id: 'm4',
      time: '9:00 – 9:10 AM',
      title: 'ACKNOWLEDGMENT OF GUESTS, PARTNERS & SPONSORS',
      category: 'Honors & Partners',
      badge: 'Honors',
      badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-900/60',
      description: 'Special acknowledgment of institutional partners, university deans, and member tech sponsors.'
    },
    {
      id: 'm5',
      time: '9:10 – 9:25 AM',
      title: 'RIBBON CUTTING & OFFICIAL OPENING',
      category: 'Grand Ceremony',
      badge: 'Ribbon Cutting',
      badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-950/50',
      description: 'Formal ribbon-cutting ceremony and symbolic launch of TechX Summit 2026: Creating What’s Next.'
    },
    {
      id: 'm6',
      time: '9:25 – 9:55 AM',
      title: 'OPENING KEYNOTE: THE FUTURE OF TECH CAREERS IN THE AI ERA',
      category: 'Keynote Address',
      badge: 'Keynote',
      badgeColor: 'border-cyan-400/50 text-cyan-300 bg-cyan-950/70',
      description: 'Strategic keynote exploring generative AI impact, career transformation, and industry demand in the AI decade.'
    },
    {
      id: 'm7',
      time: '9:55 – 10:25 AM',
      title: 'AI-READY DATA CENTERS: POWERING THE FUTURE OF INTELLIGENT TECHNOLOGY',
      category: 'Cloud & Infrastructure',
      badge: 'AI & Data Centers',
      badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-950/50',
      description: 'Next-gen data centers, high-performance computing architectures, green power, and low-latency AI clusters.'
    },
    {
      id: 'm8',
      time: '10:25 – 10:45 AM',
      title: 'NETWORKING BREAK',
      category: 'Networking & Showcase',
      badge: 'Break',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
      description: 'Mid-morning coffee break, industry booths exhibition, and delegate interaction.'
    },
    {
      id: 'm9',
      time: '10:45 – 11:15 AM',
      title: 'CYBERSECURITY LIVE: ATTACK & DEFENSE SIMULATION',
      category: 'Live Cyber Simulation',
      badge: 'Live Demo',
      badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-950/60',
      description: 'High-stakes real-time attack simulation vs. active cyber defense mitigation by industry threat specialists.'
    },
    {
      id: 'm10',
      time: '11:15 AM – 12:00 PM',
      title: 'FIRESIDE CHAT / OPEN Q&A WITH INDUSTRY EXPERTS',
      category: 'Interactive Q&A Session',
      badge: 'Live Q&A',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/50',
      description: 'Open-floor interactive fireside chat where student delegates ask unvarnished questions directly to tech executives.'
    },
    {
      id: 'm11',
      time: '12:00 – 1:30 PM',
      title: 'LUNCH BREAK',
      category: 'Intermission & Exhibits',
      badge: 'Lunch',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
      description: 'Delegates lunch, sponsor networking booths, interactive showcase, and photo wall sessions.'
    }
  ];

  const afternoonTracksFlow = [
    {
      id: 'a1',
      time: '1:30 – 2:00 PM',
      title: 'LEADING HIGH-PERFORMING TECH TEAMS: COMMUNICATION, COLLABORATION & LEADERSHIP',
      category: 'Leadership & Teamwork',
      badge: 'Leadership Track',
      badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/50',
      description: 'Practices of high-velocity software and infrastructure teams, modern management styles, and cross-discipline collaboration.'
    },
    {
      id: 'a2',
      time: '2:00 – 2:45 PM',
      title: 'TRUST BY DESIGN: IT GOVERNANCE, RISK & RESPONSIBLE TECHNOLOGY',
      category: 'Governance & Ethics',
      badge: 'Governance & Risk',
      badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/50',
      description: 'Designing trustworthy systems, data privacy compliance, cybersecurity resilience, and ethical AI development.'
    },
    {
      id: 'a3',
      time: '2:45 – 3:05 PM',
      title: 'NETWORKING BREAK',
      category: 'Networking & Refreshments',
      badge: 'Break',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
      description: 'Afternoon coffee break, career advice corner, and portfolio consultations.'
    },
    {
      id: 'a4',
      time: '3:05 – 3:50 PM',
      title: 'HUMAN IN THE LEAD: THE EVOLVING AI LANDSCAPE',
      category: 'Frontier AI & Human Agency',
      badge: 'Human & AI',
      badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/60',
      description: 'Ensuring human discernment, creativity, and ethics stay at the helm of rapid AI automation.'
    },
    {
      id: 'a5',
      time: '3:50 – 4:35 PM',
      title: 'INDUSTRY ROUNDTABLE: THE NEXT 5 YEARS OF TECH CAREERS',
      category: 'Executive Panel',
      badge: 'Roundtable',
      badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-950/50',
      description: 'Cross-industry panel of CTOs, engineering directors, and tech founders forecasting high-demand roles from 2026 to 2031.'
    },
    {
      id: 'a6',
      time: '4:35 – 5:00 PM',
      title: 'CLOSING REMARKS, RECOGNITION & RAFFLE DRAW',
      category: 'Closing & Grand Raffle',
      badge: 'Raffle & Awards',
      badgeColor: 'border-amber-400/50 text-amber-300 bg-amber-950/60',
      description: 'Awarding certificate plaques, delegate recognition, student partner appreciation, and grand raffle draw prizes.'
    }
  ];

  // Filtered Program Flow sessions
  const programQuery = programSearch.trim().toLowerCase();
  const filteredMorningFlow = morningPlenaryFlow.filter((item) =>
    !programQuery ||
    item.title.toLowerCase().includes(programQuery) ||
    item.time.toLowerCase().includes(programQuery) ||
    item.category.toLowerCase().includes(programQuery) ||
    item.badge.toLowerCase().includes(programQuery)
  );
  const filteredAfternoonFlow = afternoonTracksFlow.filter((item) =>
    !programQuery ||
    item.title.toLowerCase().includes(programQuery) ||
    item.time.toLowerCase().includes(programQuery) ||
    item.category.toLowerCase().includes(programQuery) ||
    item.badge.toLowerCase().includes(programQuery)
  );
  const totalFilteredSessions = filteredMorningFlow.length + filteredAfternoonFlow.length;

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

            {/* Right Actions */}
            <div className="flex items-center shrink-0 ml-2 gap-2 sm:gap-3">
              {/* LIVE Q&A Portal Link */}
              <Link
                to="/techx-qa"
                id="header-live-qa-btn"
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-mono font-bold text-xs text-white bg-[#FF2D8D]/15 border border-[#FF2D8D]/50 hover:bg-[#FF2D8D]/30 hover:border-[#FF2D8D] shadow-sm shadow-[#FF2D8D]/15 transition-all"
                title="Join Summit Live Interactive Q&A"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D8D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2D8D]"></span>
                </span>
                <MessageSquare className="w-3.5 h-3.5 text-[#FF2D8D]" />
                <span className="hidden xs:inline sm:inline">LIVE Q&A</span>
              </Link>

              <button
                onClick={() => scrollToSection('program-flow')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono font-bold text-xs text-[#05BFE0] border border-[#05BFE0]/30 hover:bg-[#05BFE0]/10 hover:border-[#05BFE0] transition-all"
                title="View Full Summit Program Flow"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Program Flow</span>
              </button>

              <button
                id="header-register-btn"
                onClick={() => setIsRegisterModalOpen(true)}
                className={`relative group overflow-hidden px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white ${
                  isRegistrationClosed
                    ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-700'
                    : 'bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-lg shadow-[#FF2D8D]/25'
                } transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {isRegistrationClosed ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Registration Closed</span>
                    </>
                  ) : (
                    <>
                      <span>Register Now</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
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
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-12 sm:mb-16 flex-wrap"
            >
              <button
                id="hero-register-primary-btn"
                onClick={() => setIsRegisterModalOpen(true)}
                className={`w-full sm:w-auto px-9 py-4 rounded-2xl font-bold text-base text-white ${
                  isRegistrationClosed
                    ? 'bg-slate-800/95 border border-slate-700 hover:bg-slate-700'
                    : 'bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-xl shadow-[#FF2D8D]/30'
                } transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer`}
              >
                {isRegistrationClosed ? (
                  <>
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span>REGISTRATION CLOSED</span>
                  </>
                ) : (
                  <>
                    <span>REGISTER NOW</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* LIVE Q&A PORTAL LINK */}
              <Link
                to="/techx-qa"
                id="hero-live-qa-btn"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white border border-[#FF2D8D]/60 bg-gradient-to-r from-[#FF2D8D]/25 via-[#4F17A8]/20 to-[#05BFE0]/25 hover:bg-[#FF2D8D]/35 hover:border-[#FF2D8D] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 shadow-lg shadow-[#FF2D8D]/20"
                title="Join TechX Summit Live Q&A"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D8D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2D8D]"></span>
                </span>
                <MessageSquare className="w-5 h-5 text-[#FF2D8D]" />
                <span>LIVE Q&A PORTAL</span>
              </Link>

              <button
                id="hero-program-flow-btn"
                onClick={() => scrollToSection('program-flow')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-[#05BFE0] border border-[#05BFE0]/40 bg-[#05BFE0]/10 hover:bg-[#05BFE0]/20 hover:border-[#05BFE0] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-[#05BFE0]/10"
              >
                <Clock className="w-4 h-4 text-[#05BFE0]" />
                <span>Program Flow</span>
              </button>

              <button
                id="hero-learn-more-btn"
                onClick={() => scrollToSection('about')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-base text-slate-200 border border-white/20 hover:border-[#05BFE0] hover:text-white hover:bg-white/10 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg"
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
          LIVE SUMMIT Q&A FEATURE BANNER (Interactive real-time questions)
         ========================================================================= */}
      <section className="py-12 md:py-16 relative border-t border-white/10 bg-gradient-to-r from-[#0F1438] via-[#14103B] to-[#1A0B2E] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-3xl border border-[#FF2D8D]/40 bg-[#0B0F2B]/85 backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_50px_rgba(255,45,141,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2D8D]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#05BFE0]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF2D8D]/15 border border-[#FF2D8D]/40 text-[#FF2D8D] text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D8D] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2D8D]"></span>
                  </span>
                  <span>Interactive Summit Experience</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase font-display tracking-tight">
                  TECHX LIVE <span className="bg-gradient-to-r from-[#FF2D8D] via-[#A87FFB] to-[#05BFE0] bg-clip-text text-transparent">Q&A PORTAL</span>
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Engage directly with keynote speakers, industry executives, and fireside chat panelists. Submit your questions live, upvote queries from fellow delegates, and watch highlighted inquiries appear real-time on the plenary main stage display.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
                <Link
                  to="/techx-qa"
                  className="px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-xl shadow-[#FF2D8D]/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>OPEN LIVE Q&A</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/techx-live-qa"
                  className="px-6 py-4 rounded-2xl font-mono font-bold text-xs text-[#05BFE0] bg-[#05BFE0]/10 border border-[#05BFE0]/40 hover:bg-[#05BFE0]/20 transition-all flex items-center justify-center gap-2"
                  title="View Live Stage Display Screen"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Stage Display</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PROGRAM FLOW SECTION (Official TechX Summit 2026 Schedule)
         ========================================================================= */}
      <section id="program-flow" className="py-20 md:py-28 relative border-t border-white/10 bg-[#070B24] overflow-hidden">
        {/* Subtle Cyber Neon Grid & Radial Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#05BFE0]/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 -left-40 w-[600px] h-[500px] bg-[#4F17A8]/20 rounded-full blur-[160px]" />
          <div className="absolute bottom-10 right-0 w-[550px] h-[500px] bg-[#FF2D8D]/15 rounded-full blur-[160px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(to right, #05BFE0 1px, transparent 1px), linear-gradient(to bottom, #FF2D8D 1px, transparent 1px)`,
              backgroundSize: '48px 48px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Brand Header Lockup matching Official Poster */}
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            {/* Co-host Logos */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5">
              <img
                src={ASSETS.itapLogoWhite}
                alt="ITAP"
                className="h-8 sm:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-white/20" />
              <img
                src={ASSETS.tipLogo}
                alt="T.I.P."
                className="h-8 sm:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* TechX Logo Title */}
            <div className="flex justify-center mb-3">
              <img
                src={ASSETS.techxFullWhite}
                alt="TECHX SUMMIT 2026"
                className="h-10 sm:h-14 md:h-16 w-auto object-contain drop-shadow-[0_0_25px_rgba(5,191,224,0.3)]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Tagline */}
            <p className="text-sm sm:text-lg md:text-xl font-mono font-extrabold tracking-[0.3em] uppercase text-white mb-5">
              CREATING WHAT’S <span className="text-[#FF2D8D] drop-shadow-[0_0_12px_rgba(255,45,141,0.6)]">NEXT</span>
            </p>

            {/* Event Date & Location Capsule */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-[#05BFE0]/15 via-white/5 to-[#FF2D8D]/15 border border-[#05BFE0]/40 text-xs sm:text-sm font-mono text-slate-200 shadow-lg shadow-[#05BFE0]/10 mb-8">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Calendar className="w-3.5 h-3.5 text-[#05BFE0]" />
                OCTOBER 15, 2026
              </span>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <MapPin className="w-3.5 h-3.5 text-[#FF2D8D]" />
                ANNIVERSARY HALL, TIP QC
              </span>
            </div>

            {/* Glowing Cyber Title Banner: PROGRAM FLOW */}
            <div className="relative inline-block my-2">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#05BFE0] via-[#A87FFB] to-[#FF2D8D] opacity-75 blur-md" />
              <div className="relative px-8 sm:px-16 py-3.5 sm:py-4.5 rounded-2xl bg-[#070B24] border-2 border-[#05BFE0] shadow-[0_0_30px_rgba(5,191,224,0.4)]">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-white uppercase font-display drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                  PROGRAM FLOW
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-4 max-w-2xl mx-auto">
              Follow our official morning plenary and specialized afternoon tracks covering artificial intelligence, cybersecurity, cloud infrastructure, and tech leadership.
            </p>
          </div>

          {/* Interactive Navigation, Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-[#06091A]/80 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-xl">
            {/* Track Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => setProgramTrackFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shrink-0 ${
                  programTrackFilter === 'all'
                    ? 'bg-gradient-to-r from-[#05BFE0] to-[#0494AE] text-slate-950 shadow-md shadow-[#05BFE0]/25'
                    : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                All Sessions (17)
              </button>
              <button
                onClick={() => setProgramTrackFilter('morning')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shrink-0 ${
                  programTrackFilter === 'morning'
                    ? 'bg-[#05BFE0] text-slate-950 shadow-md shadow-[#05BFE0]/25'
                    : 'text-slate-300 hover:text-[#05BFE0] bg-white/5 hover:bg-white/10'
                }`}
              >
                Morning Plenary (11)
              </button>
              <button
                onClick={() => setProgramTrackFilter('afternoon')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shrink-0 ${
                  programTrackFilter === 'afternoon'
                    ? 'bg-[#FF2D8D] text-white shadow-md shadow-[#FF2D8D]/25'
                    : 'text-slate-300 hover:text-[#FF2D8D] bg-white/5 hover:bg-white/10'
                }`}
              >
                Afternoon Tracks (6)
              </button>
            </div>

            {/* Search Input & Action Utilities */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={programSearch}
                  onChange={(e) => setProgramSearch(e.target.value)}
                  placeholder="Filter sessions..."
                  className="w-full pl-9 pr-7 py-2 rounded-xl text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0]"
                />
                {programSearch && (
                  <button
                    onClick={() => setProgramSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Copy Schedule Button */}
              <button
                onClick={handleCopySchedule}
                className="px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shrink-0"
                title="Copy schedule as clean text"
              >
                {copiedSchedule ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#05BFE0]" />
                    <span className="hidden sm:inline">Copy Schedule</span>
                  </>
                )}
              </button>

              {/* Add to Calendar Link */}
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shrink-0"
                title="Add TechX Summit 2026 to Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#FF2D8D]" />
                <span className="hidden sm:inline">Calendar</span>
              </a>
            </div>
          </div>

          {/* Search Result Feedback if active */}
          {programSearch.trim() && (
            <div className="mb-6 flex items-center justify-between text-xs font-mono text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <span>Showing {totalFilteredSessions} sessions matching "{programSearch}"</span>
              <button onClick={() => setProgramSearch('')} className="text-[#05BFE0] hover:underline">
                Clear filter
              </button>
            </div>
          )}

          {/* =========================================================================
              TRACK 1: MORNING PLENARY
             ========================================================================= */}
          {(programTrackFilter === 'all' || programTrackFilter === 'morning') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative mb-12"
            >
              {/* Outer Cyber Box Container with Glowing Cyan Border */}
              <div className="relative rounded-3xl bg-[#060A22]/90 border-2 border-[#05BFE0]/60 shadow-[0_0_35px_rgba(5,191,224,0.18)] backdrop-blur-xl overflow-hidden">
                {/* Tech corner accent notches */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#05BFE0]/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-[#05BFE0]/20 to-transparent pointer-events-none" />

                {/* Section Header Badge on Top Left */}
                <div className="p-4 sm:p-6 pb-2 sm:pb-3 flex items-center justify-between border-b border-[#05BFE0]/20 bg-gradient-to-r from-[#05BFE0]/15 via-transparent to-transparent">
                  <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-[#05BFE0] to-[#0494AE] text-slate-950 font-display font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-md shadow-[#05BFE0]/30">
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>MORNING PLENARY</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-300 hidden sm:inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#05BFE0]" />
                    8:00 AM – 1:30 PM PHT
                  </span>
                </div>

                {/* Session Rows List */}
                <div className="divide-y divide-white/5">
                  {filteredMorningFlow.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm font-mono">
                      No morning sessions found for "{programSearch}".
                    </div>
                  ) : (
                    filteredMorningFlow.map((item, index) => {
                      const isKeynoteOrDemo = item.badge === 'Keynote' || item.badge === 'Live Demo' || item.badge === 'Ribbon Cutting';
                      return (
                        <div
                          key={item.id}
                          className={`group px-4 sm:px-8 py-3.5 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 transition-all duration-200 ${
                            isKeynoteOrDemo ? 'bg-[#05BFE0]/[0.03] hover:bg-[#05BFE0]/10' : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          {/* Time & Trace Lockup */}
                          <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:w-56 md:w-64">
                            <span className="w-2 h-2 rounded-full bg-[#05BFE0] group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_8px_#05BFE0]" />
                            <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-[#05BFE0] tracking-wide whitespace-nowrap">
                              {item.time}
                            </span>
                          </div>

                          {/* Session Title */}
                          <div className="flex-1 pr-2">
                            <h3 className="font-bold text-xs sm:text-sm md:text-base text-white uppercase tracking-wide leading-snug group-hover:text-cyan-200 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-all">
                              {item.description}
                            </p>
                          </div>

                          {/* Category Badge Pill & Live Q&A Link */}
                          <div className="shrink-0 flex items-center gap-2 mt-1 sm:mt-0 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-medium border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            {item.id === 'm10' && (
                              <Link
                                to="/techx-qa"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold bg-[#FF2D8D]/20 border border-[#FF2D8D]/60 text-white hover:bg-[#FF2D8D] hover:text-white transition-all shadow-sm shadow-[#FF2D8D]/20 shrink-0"
                                title="Open Live Q&A Portal for this session"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D8D] animate-ping" />
                                <MessageSquare className="w-3.5 h-3.5 text-[#FF2D8D] group-hover:text-white" />
                                <span>Enter Live Q&A →</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              TRACK 2: AFTERNOON | HANDS-ON & LEADERSHIP TRACKS
             ========================================================================= */}
          {(programTrackFilter === 'all' || programTrackFilter === 'afternoon') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mb-14"
            >
              {/* Outer Cyber Box Container with Glowing Magenta/Purple Border */}
              <div className="relative rounded-3xl bg-[#060A22]/90 border-2 border-[#FF2D8D]/60 shadow-[0_0_35px_rgba(255,45,141,0.18)] backdrop-blur-xl overflow-hidden">
                {/* Tech corner accent notches */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#FF2D8D]/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-[#FF2D8D]/20 to-transparent pointer-events-none" />

                {/* Section Header Badge on Top Left */}
                <div className="p-4 sm:p-6 pb-2 sm:pb-3 flex items-center justify-between border-b border-[#FF2D8D]/20 bg-gradient-to-r from-[#FF2D8D]/15 via-transparent to-transparent">
                  <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#8A1550] text-white font-display font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-md shadow-[#FF2D8D]/30">
                    <Zap className="w-4 h-4 text-white" />
                    <span>AFTERNOON | HANDS-ON & LEADERSHIP TRACKS</span>
                  </div>
                  <span className="text-xs font-mono text-pink-300 hidden sm:inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF2D8D]" />
                    1:30 PM – 5:00 PM PHT
                  </span>
                </div>

                {/* Session Rows List */}
                <div className="divide-y divide-white/5">
                  {filteredAfternoonFlow.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm font-mono">
                      No afternoon sessions found for "{programSearch}".
                    </div>
                  ) : (
                    filteredAfternoonFlow.map((item, index) => {
                      const isHighPriority = item.badge === 'Roundtable' || item.badge === 'Human & AI' || item.badge === 'Raffle & Awards';
                      return (
                        <div
                          key={item.id}
                          className={`group px-4 sm:px-8 py-3.5 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 transition-all duration-200 ${
                            isHighPriority ? 'bg-[#FF2D8D]/[0.03] hover:bg-[#FF2D8D]/10' : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          {/* Time & Trace Lockup */}
                          <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:w-56 md:w-64">
                            <span className="w-2 h-2 rounded-full bg-[#05BFE0] group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_8px_#05BFE0]" />
                            <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-[#05BFE0] tracking-wide whitespace-nowrap">
                              {item.time}
                            </span>
                          </div>

                          {/* Session Title */}
                          <div className="flex-1 pr-2">
                            <h3 className="font-bold text-xs sm:text-sm md:text-base text-white uppercase tracking-wide leading-snug group-hover:text-pink-200 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-all">
                              {item.description}
                            </p>
                          </div>

                          {/* Category Badge Pill */}
                          <div className="shrink-0 flex items-center gap-2 mt-1 sm:mt-0">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-medium border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              BOTTOM BANNER: EXPLORE TECHNOLOGY. CONNECT WITH INNOVATORS.
              4 PILLARS: NETWORK | COLLABORATE | INNOVATE | TRANSFORM
             ========================================================================= */}
          <div className="mt-12 rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 relative overflow-hidden backdrop-blur-xl">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05BFE0]/10 via-transparent to-[#FF2D8D]/10 pointer-events-none" />

            {/* Main Bottom Tagline */}
            <div className="text-center mb-8 relative z-10">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-widest uppercase text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                EXPLORE TECHNOLOGY. CONNECT WITH INNOVATORS.
              </h3>
            </div>

            {/* 4 Pillars Lockup */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
              {/* 1. NETWORK */}
              <div className="group p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(5,191,224,0.2)]">
                  <Network className="w-6 h-6" />
                </div>
                <span className="font-mono font-black text-sm sm:text-base tracking-widest text-cyan-300 uppercase">
                  NETWORK
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Connect with peer delegates & IT executives
                </span>
              </div>

              {/* 2. COLLABORATE */}
              <div className="group p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/20 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,127,251,0.2)]">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="font-mono font-black text-sm sm:text-base tracking-widest text-purple-300 uppercase">
                  COLLABORATE
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Cross-pollinate engineering ideas & projects
                </span>
              </div>

              {/* 3. INNOVATE */}
              <div className="group p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-950/20 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,45,141,0.2)]">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <span className="font-mono font-black text-sm sm:text-base tracking-widest text-pink-300 uppercase">
                  INNOVATE
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Discover autonomous tools & AI breakthroughs
                </span>
              </div>

              {/* 4. TRANSFORM */}
              <div className="group p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/20 transition-all text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="font-mono font-black text-sm sm:text-base tracking-widest text-blue-300 uppercase">
                  TRANSFORM
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Accelerate your professional trajectory
                </span>
              </div>
            </div>

            {/* Quick Register Bar at bottom */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-300">
              <span className="text-slate-400">
                Official TechX Summit 2026 • T.I.P. Anniversary Hall
              </span>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] text-white font-bold hover:shadow-lg hover:shadow-[#FF2D8D]/30 transition-all flex items-center gap-2"
              >
                <span>Reserve Pass Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <button
              id="closing-cta-register-btn"
              onClick={() => setIsRegisterModalOpen(true)}
              className={`w-full sm:w-auto py-4 px-10 rounded-2xl font-bold text-base text-white ${
                isRegistrationClosed
                  ? 'bg-slate-800/95 border border-slate-700 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-xl shadow-[#FF2D8D]/30'
              } transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 tracking-wide cursor-pointer`}
            >
              {isRegistrationClosed ? (
                <>
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>REGISTRATION CLOSED</span>
                </>
              ) : (
                <>
                  <span>REGISTER NOW</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <Link
              to="/techx-qa"
              className="w-full sm:w-auto py-4 px-8 rounded-2xl font-bold text-base text-white border border-[#FF2D8D]/60 bg-[#FF2D8D]/15 hover:bg-[#FF2D8D]/30 hover:border-[#FF2D8D] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-[#FF2D8D]/15"
            >
              <MessageSquare className="w-5 h-5 text-[#FF2D8D]" />
              <span>LIVE Q&A PORTAL</span>
            </Link>
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
                <li className="pt-1.5">
                  <button
                    onClick={() => scrollToSection('program-flow')}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#05BFE0] hover:text-white transition-colors"
                  >
                    <span>View Full Program Flow ↓</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Interactive Live Q&A */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF2D8D] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2D8D] animate-ping" />
                <span>Live Summit Q&A</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/techx-qa" className="flex items-center gap-2 text-white hover:text-[#FF2D8D] transition-colors font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-[#FF2D8D]" />
                    <span>Participant Q&A Portal</span>
                  </Link>
                </li>
                <li>
                  <Link to="/techx-live-qa" className="flex items-center gap-2 hover:text-[#05BFE0] transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-[#05BFE0]" />
                    <span>Live Stage Display</span>
                  </Link>
                </li>
                <li>
                  <Link to="/techx-qa-host" className="flex items-center gap-2 hover:text-purple-300 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Host Moderation Console</span>
                  </Link>
                </li>
                <li className="pt-1 text-[11px] text-slate-500">
                  Ask questions live during keynotes & fireside chats.
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
              <Link to="/techx-qa" className="hover:text-[#FF2D8D] text-slate-400 transition-colors">
                Live Q&A
              </Link>
              <Link to="/" className="hover:text-[#05BFE0] transition-colors">
                ITAP Home
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          FLOATING LIVE Q&A SHORTCUT (Available anywhere on /TechXSummit2026)
         ========================================================================= */}
      <Link
        to="/techx-qa"
        id="floating-live-qa-btn"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#0E1338]/95 border-2 border-[#FF2D8D] text-white shadow-2xl shadow-[#FF2D8D]/30 backdrop-blur-md hover:scale-105 hover:bg-[#FF2D8D] transition-all group"
        title="Access TechX Live Q&A Portal"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D8D] group-hover:bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2D8D] group-hover:bg-white"></span>
        </span>
        <MessageSquare className="w-4 h-4 text-[#FF2D8D] group-hover:text-white transition-colors" />
        <span className="font-mono font-bold text-xs uppercase tracking-wider">LIVE Q&A</span>
      </Link>

      {/* =========================================================================
          REGISTRATION MODAL
         ========================================================================= */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
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
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0F1438] border border-white/15 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden text-left"
            >
              {/* Header - Stays pinned at top so title and close button are always visible */}
              <div className="flex items-start justify-between p-5 sm:p-7 pb-4 border-b border-white/10 shrink-0 bg-[#0F1438]/95 backdrop-blur-sm z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isRegistrationClosed && !isRegistered ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#05BFE0]/20 text-[#05BFE0]'} uppercase font-bold`}>
                      {isRegistrationClosed && !isRegistered ? 'Registration Closed' : 'Student Registration'}
                    </span>
                    <span className="text-xs text-slate-400">• Exclusive to T.I.P. Students</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {isRegistered 
                      ? 'Your Student Delegate Pass' 
                      : (isRegistrationClosed ? 'Student Registration is Closed' : 'Reserve Your TechX Summit Student Pass')}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body Content */}
              <div className="overflow-y-auto flex-1 p-5 sm:p-7 pt-4 space-y-4">
                {isRegistrationClosed && !isRegistered ? (
                  <div className="py-8 px-2 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
                      <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h4 className="text-xl sm:text-2xl font-bold text-white font-display">
                        Student Registration is Now Closed
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Registration for TechX Summit 2026 has reached maximum capacity and is currently closed. Thank you to all students for the tremendous enthusiasm and interest!
                      </p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 max-w-md mx-auto space-y-2.5 text-left">
                      <p className="font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#05BFE0]" />
                        <span>You can still experience the Summit:</span>
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                        <li>Participate in the interactive <strong>Live Q&A Portal</strong> during sessions</li>
                        <li>Explore the full <strong>Summit Program Flow</strong> & expert keynotes</li>
                        <li>Connect with participating <strong>ITAP tech industry partners</strong></li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <Link
                        to="/techx-qa"
                        onClick={() => setIsRegisterModalOpen(false)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-lg shadow-[#FF2D8D]/25 flex items-center justify-center gap-2 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Go to Live Q&A Portal</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterModalOpen(false);
                          scrollToSection('program-flow');
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs text-[#05BFE0] border border-[#05BFE0]/30 hover:bg-[#05BFE0]/10 transition"
                      >
                        View Program Flow
                      </button>
                    </div>
                  </div>
                ) : !isRegistered ? (
                  <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  {/* Student Name: Separate First Name and Last Name */}
                  <div>
                    <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider font-mono block mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#05BFE0]" />
                      <span>Student Name</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          First Name <span className="text-[#FF2D8D]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Juan"
                          value={regForm.firstName}
                          onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border ${formErrors.firstName ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition`}
                        />
                        {formErrors.firstName && (
                          <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.firstName}</span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          Last Name <span className="text-[#FF2D8D]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dela Cruz"
                          value={regForm.lastName}
                          onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border ${formErrors.lastName ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition`}
                        />
                        {formErrors.lastName && (
                          <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.lastName}</span>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">
                          Middle Name <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Santos"
                          value={regForm.middleName}
                          onChange={(e) => setRegForm({ ...regForm, middleName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* College & Program */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        College <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <select
                        value={regForm.college}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegForm({ ...regForm, college: val, collegeOrDept: val });
                          if (formErrors.college) {
                            setFormErrors((prev) => ({ ...prev, college: '' }));
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F2B] border border-white/15 text-sm text-white focus:outline-none focus:border-[#05BFE0] transition"
                      >
                        <option value="College of Information Technology Education (CITE)">
                          College of Information Technology Education (CITE)
                        </option>
                        <option value="College of Engineering & Architecture (CEA)">
                          College of Engineering & Architecture (CEA)
                        </option>
                        <option value="College of Arts & Sciences (CAS)">
                          College of Arts & Sciences (CAS)
                        </option>
                        <option value="College of Business Education (CBE)">
                          College of Business Education (CBE)
                        </option>
                        <option value="College of Accountancy">
                          College of Accountancy
                        </option>
                        <option value="Others">
                          Others
                        </option>
                      </select>
                      {regForm.college === 'Others' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Specify College / Department / School"
                            value={customCollege}
                            onChange={(e) => setCustomCollege(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition"
                          />
                        </div>
                      )}
                      {formErrors.college && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.college}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Program <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BS Information Technology, BS Computer Science, etc."
                        value={regForm.program}
                        onChange={(e) => {
                          setRegForm({ ...regForm, program: e.target.value, course: e.target.value });
                          if (formErrors.program) {
                            setFormErrors((prev) => ({ ...prev, program: '' }));
                          }
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border ${formErrors.program ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition`}
                      />
                      {formErrors.program && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.program}</span>
                      )}
                    </div>
                  </div>

                  {/* Location (Manila / Quezon City) & Year Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Location <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <select
                        value={regForm.location}
                        onChange={(e) => setRegForm({ ...regForm, location: e.target.value as 'Manila' | 'Quezon City', campus: `T.I.P. ${e.target.value}` })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F2B] border border-white/15 text-sm text-white focus:outline-none focus:border-[#05BFE0] transition"
                      >
                        <option value="Quezon City">Quezon City</option>
                        <option value="Manila">Manila</option>
                      </select>
                      {formErrors.location && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.location}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Year Level <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <select
                        value={regForm.yearLevel}
                        onChange={(e) => setRegForm({ ...regForm, yearLevel: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F2B] border border-white/15 text-sm text-white focus:outline-none focus:border-[#05BFE0] transition"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                        <option value="Graduate / Masteral">Graduate / Masteral</option>
                      </select>
                      {formErrors.yearLevel && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.yearLevel}</span>
                      )}
                    </div>
                  </div>

                  {/* Contact Information Fields (Mobile & Email) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Mobile Number <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +63 912 345 6789"
                        value={regForm.mobile}
                        onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border ${formErrors.mobile ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition`}
                      />
                      {formErrors.mobile && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.mobile}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">
                        Email Address <span className="text-[#FF2D8D]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. jdelacruz@tip.edu.ph"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white/5 border ${formErrors.email ? 'border-[#FF2D8D]' : 'border-white/15'} text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] transition`}
                      />
                      {formErrors.email && (
                        <span className="text-[11px] text-[#FF2D8D] mt-1 block font-medium">{formErrors.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Data Privacy Notice & Disclaimer in Collecting Data */}
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-3 mt-2">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#05BFE0] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                          Data Privacy Notice (Republic Act No. 10173)
                        </h5>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          In compliance with the <strong>Data Privacy Act of 2012 (RA 10173)</strong>, the Technological Institute of the Philippines (T.I.P.) and ITAP are committed to protecting your personal information.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          The personal data collected in this registration form (Last Name, First Name, Middle Name, Mobile Number, Email Address, College, Program, Location, and Year Level) will be collected and processed solely for verifying student delegate eligibility, event admissions, delegate badge generation, attendance tracking, and issuing digital certificates for <strong>TECHX SUMMIT 2026</strong>.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Your information will be treated with strict confidentiality, stored securely, and will not be shared with unauthorized third parties.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 pt-2.5 border-t border-white/10 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={regForm.privacyConsent}
                        onChange={(e) => {
                          setRegForm({ ...regForm, privacyConsent: e.target.checked });
                          if (e.target.checked && formErrors.privacyConsent) {
                            setFormErrors((prev) => ({ ...prev, privacyConsent: '' }));
                          }
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#05BFE0] focus:ring-[#05BFE0] focus:ring-offset-0 transition cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 group-hover:text-white leading-snug">
                        I have read and understand the <strong>Data Privacy Notice</strong> and consent to the collection and processing of my personal student details for TECHX SUMMIT 2026. <span className="text-[#FF2D8D]">*</span>
                      </span>
                    </label>
                    {formErrors.privacyConsent && (
                      <span className="text-[11px] text-[#FF2D8D] block font-medium">
                        {formErrors.privacyConsent}
                      </span>
                    )}
                  </div>

                  {/* Duplicate Entry Warning Banner */}
                  {duplicateErrorMessage && (
                    <div className="p-3.5 rounded-2xl bg-[#FF2D8D]/15 border border-[#FF2D8D]/40 text-white text-xs flex items-start gap-3 animate-shake">
                      <AlertTriangle className="w-4 h-4 text-[#FF2D8D] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#FF2D8D] block uppercase tracking-wider text-[11px] font-mono">
                          Duplicate Entry Not Accepted
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">{duplicateErrorMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRegisterModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] shadow-lg shadow-[#FF2D8D]/25 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSubmitting ? 'Confirming Student Pass...' : 'Complete Free Registration'}
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
                      Welcome, <span className="text-[#05BFE0] font-semibold">{regForm.firstName} {regForm.middleName ? regForm.middleName + ' ' : ''}{regForm.lastName}</span>! Your official T.I.P. Student Pass has been confirmed for TECHX SUMMIT 2026.
                    </p>
                  </div>

                  {/* Pass Visual */}
                  <div className="p-6 rounded-3xl bg-[#0B0F2B] border border-white/15 max-w-md mx-auto text-left relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#05BFE0] uppercase tracking-widest block font-semibold">
                          TECHX SUMMIT 2026
                        </span>
                        <span className="text-sm font-bold text-white">STUDENT DELEGATE PASS</span>
                      </div>
                      <div className="px-2.5 py-1 rounded bg-[#05BFE0]/20 border border-[#05BFE0]/30 text-[10px] font-mono text-[#05BFE0] uppercase font-bold">
                        T.I.P. STUDENT
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">First Name</span>
                        <span className="text-white font-semibold">{regForm.firstName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Last Name</span>
                        <span className="text-white font-semibold">{regForm.lastName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">College</span>
                        <span className="text-slate-300 font-medium truncate block" title={regForm.college === 'Others' && customCollege.trim() ? customCollege.trim() : regForm.college}>
                          {regForm.college === 'Others' && customCollege.trim() ? customCollege.trim() : regForm.college}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Program</span>
                        <span className="text-slate-300 font-medium truncate block" title={regForm.program}>{regForm.program}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Location</span>
                        <span className="text-[#05BFE0] font-semibold">{regForm.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Year Level</span>
                        <span className="text-purple-300 font-semibold">{regForm.yearLevel}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Pass Number</span>
                        <span className="text-amber-400 font-mono font-bold">{regTicketId}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono text-slate-400">
                      <span>Venue: T.I.P. QC Anniversary Hall</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>VALIDATED PASS</span>
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Registration Confirmed</span>
                      </span>
                      <span className="flex items-center gap-1 text-[#05BFE0] font-medium">
                        <Database className="w-3.5 h-3.5 shrink-0" />
                        <span>Official Attendee Pass</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/techx-qa"
                      onClick={() => setIsRegisterModalOpen(false)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF4E9E] hover:from-[#FF4E9E] hover:to-[#FF2D8D] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Go to Live Q&A</span>
                    </Link>
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center justify-center gap-2 transition"
                    >
                      <CalendarPlus className="w-4 h-4 text-[#05BFE0]" />
                      <span>Add to Calendar</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsRegistered(false);
                        setIsRegisterModalOpen(false);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#05BFE0] hover:bg-[#05BFE0]/90 text-white text-xs font-bold shadow-md cursor-pointer transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechXSummit2026;

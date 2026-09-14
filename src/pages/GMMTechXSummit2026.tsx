import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Share2,
  Download,
  CalendarPlus,
  RefreshCw,
  Check,
  AlertCircle,
  Network,
  Cpu,
  Layers,
  Lightbulb,
  Award,
  Users,
  MessageSquarePlus
} from 'lucide-react';
import { memberCompanies } from '../data/membersData';
import { submitRegistrationToFirestore } from '../lib/firebaseQa';

interface FormData {
  fullName: string;
  companyName: string;
  jobTitle: string;
  email: string;
  mobile: string;
  hasCompanion: boolean;
  companionName: string;
  companionDesignation: string;
}

interface FormErrors {
  fullName?: string;
  companyName?: string;
  jobTitle?: string;
  email?: string;
  mobile?: string;
  companionName?: string;
  companionDesignation?: string;
}

export const GMMTechXSummit2026: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    companyName: '',
    jobTitle: '',
    email: '',
    mobile: '',
    hasCompanion: false,
    companionName: '',
    companionDesignation: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Please enter your complete name';
        return undefined;
      case 'companyName':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Company name is required';
        return undefined;
      case 'jobTitle':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Job title is required';
        return undefined;
      case 'email':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Work email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid work email';
        return undefined;
      case 'mobile':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Mobile number is required';
        if (!/^[0-9+()\s-]{7,20}$/.test(value)) return 'Please enter a valid contact number';
        return undefined;
      case 'companionName':
        if (formData.hasCompanion) {
          if (!value || typeof value !== 'string' || !value.trim()) return 'Companion full name is required';
          if (value.trim().length < 2) return "Please enter companion's complete name";
        }
        return undefined;
      case 'companionDesignation':
        if (formData.hasCompanion) {
          if (!value || typeof value !== 'string' || !value.trim()) return 'Companion designation is required';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name as keyof FormData, value)
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name as keyof FormData, value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      companyName: true,
      jobTitle: true,
      email: true,
      mobile: true,
      companionName: formData.hasCompanion,
      companionDesignation: formData.hasCompanion
    });

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      const generatedId = `TECHX-ITAP-${Math.floor(100000 + Math.random() * 900000)}`;
      setRegistrationId(generatedId);

      const payload = {
        timestamp: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
        registrationId: generatedId,
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        company: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        position: formData.jobTitle.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        phone: formData.mobile.trim(),
        hasCompanion: formData.hasCompanion ? 'Yes' : 'No',
        companionName: formData.hasCompanion ? (formData.companionName.trim() || 'N/A') : 'None',
        companionDesignation: formData.hasCompanion ? (formData.companionDesignation.trim() || 'N/A') : 'None',
        companionTitle: formData.hasCompanion ? (formData.companionDesignation.trim() || 'N/A') : 'None',
        // Direct compatibility with currently deployed Apps Script columns (H, I, J):
        event: formData.hasCompanion ? 'Yes' : 'No',
        eventName: formData.hasCompanion ? 'Yes' : 'No',
        venue: formData.hasCompanion ? (formData.companionName.trim() || 'N/A') : 'None',
        source: formData.hasCompanion ? (formData.companionDesignation.trim() || 'N/A') : 'None',
        attendance: 'yes'
      };

      // Purge any invalid /dev URLs that may have been previously stored in localStorage
      const stored = localStorage.getItem('techx_sheets_webhook');
      if (stored && (stored.includes('/dev') || !stored.endsWith('/exec') || stored.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq'))) {
        localStorage.removeItem('techx_sheets_webhook');
      }

      const DEFAULT_TECHX_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec';
      const activeWebhook = localStorage.getItem('techx_sheets_webhook') || (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_TECHX_WEBHOOK;

      try {
        // 1. Send to serverless / local dev proxy
        let serverSuccess = false;
        try {
          const res = await fetch('/api/submit-rsvp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          serverSuccess = res.ok;
        } catch (err) {
          console.warn('Server route RSVP forward error:', err);
        }

        // 2. If server failed or client webhook is configured, ensure Google Sheet receives submission
        if (!serverSuccess && activeWebhook && activeWebhook.startsWith('https://script.google.com/')) {
          const formParams = new URLSearchParams();
          Object.entries(payload).forEach(([k, v]) => formParams.append(k, String(v)));
          await fetch(activeWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formParams
          }).catch(e => console.warn('Direct Google Sheets send:', e));
        }

        // 3. Save to Firebase Firestore (itap-db)
        try {
          await submitRegistrationToFirestore(payload);
        } catch (fbErr) {
          console.warn('Firestore registration error:', fbErr);
        }
      } catch (error) {
        console.warn('RSVP stored in client state (network fallback):', error);
      } finally {
        setIsSubmitting(false);
        setIsSubmitted(true);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      companyName: '',
      jobTitle: '',
      email: '',
      mobile: '',
      hasCompanion: false,
      companionName: '',
      companionDesignation: ''
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setRegistrationId('');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent("ITAP 2nd General Membership Meeting 2026 @ Technological Institute of the Philippines (T.I.P.) Tech X Summit");
    const details = encodeURIComponent("Theme: Creating What’s Next | Stronger Together. Innovating Tomorrow. Shaping the Future.\n\nHosted by ITAP at Technological Institute of the Philippines (T.I.P.) Tech X Summit 2026.");
    const location = encodeURIComponent("Technological Institute of the Philippines (T.I.P.) Quezon City Anniversary Hall, 938 Aurora Blvd, Cubao, Quezon City, Metro Manila");
    const dates = "20261015T000000Z/20261015T090000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  const pillars = [
    { label: 'Network', icon: Network, desc: 'Connect with top C-level ICT executives and academic leaders' },
    { label: 'Collaborate', icon: Layers, desc: 'Build strategic technology partnerships and industry alliances' },
    { label: 'Innovate', icon: Cpu, desc: 'Explore breakthroughs in AI, Cloud, and Emerging Technologies' },
    { label: 'Transform', icon: Lightbulb, desc: 'Pioneer high-impact digital transformation initiatives' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F2B] text-[#E5E7EB] selection:bg-[#05BFE0]/30 selection:text-white relative overflow-x-hidden font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[500px] bg-gradient-to-b from-[#4F17A8]/30 via-[#05BFE0]/15 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-0 w-[550px] h-[550px] bg-[#FF2D8D]/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[400px] bg-[#05BFE0]/10 rounded-full blur-[150px]" />
        
        {/* Subtle Tech Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #05BFE0 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }} 
        />
      </div>

      {/* Main Full Page Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Top Centered Brand Hero Header */}
        <div className="text-center max-w-5xl mx-auto mb-10 sm:mb-14">
          
          {/* Collaboration Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4F17A8]/30 border border-[#05BFE0]/30 backdrop-blur-md mb-6 text-[11px] sm:text-xs font-mono tracking-wider sm:tracking-widest uppercase text-[#05BFE0]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF2D8D]" />
            <span>ITAP × Technological Institute of the Philippines (T.I.P.)</span>
          </motion.div>

          {/* Logo for Dark Backgrounds (techx for dark.png) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#05BFE0]/20 via-[#4F17A8]/30 to-[#FF2D8D]/20 rounded-3xl blur-2xl opacity-70 -z-10" />
            <img
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/techx%20for%20dark.png"
              alt="TechX Summit 2026 Logo"
              className="h-16 sm:h-24 md:h-28 w-auto object-contain mx-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-3"
          >
            <span className="font-mono font-black text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.28em] uppercase bg-gradient-to-r from-[#05BFE0] via-[#FF2D8D] to-[#05BFE0] bg-clip-text text-transparent">
              STRONG TOGETHER. INNOVATING TOMORROW. SHAPING THE FUTURE.
            </span>
          </motion.div>

          {/* Main Title - Single Line, Removed (2nd GMM 2026) */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-display font-bold text-white tracking-tight leading-tight mb-4 whitespace-normal lg:whitespace-nowrap"
          >
            ITAP 2nd General Membership Meeting 2026
          </motion.h1>

          {/* Theme Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Theme:</span>
            <span className="text-sm sm:text-base font-bold text-white tracking-wide">
              “Creating What’s Next”
            </span>
          </motion.div>

        </div>

        {/* 1 FULL PAGE SEPARATE COLUMN LAYOUT: DETAILS (LEFT) + REGISTRATION FORM (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ================= LEFT COLUMN: EVENT DETAILS, VENUE & PILLARS (5 Cols on LG) ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Event Summary Details Card */}
            <div className="rounded-3xl bg-[#0B0F2B]/85 backdrop-blur-xl border border-[#05BFE0]/25 p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#05BFE0] via-[#4F17A8] to-[#FF2D8D]" />
              
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#05BFE0] font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#FF2D8D]" />
                <span>Event Information</span>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#05BFE0]/10 border border-[#05BFE0]/30 flex items-center justify-center text-[#05BFE0] shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Date</span>
                    <span className="text-sm sm:text-base font-bold text-white">October 15, 2026</span>
                    <span className="text-xs text-[#05BFE0] font-mono block">One-day Event (Thursday)</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2D8D]/10 border border-[#FF2D8D]/30 flex items-center justify-center text-[#FF2D8D] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Schedule</span>
                    <span className="text-sm sm:text-base font-bold text-white">8:00 AM – 5:00 PM</span>
                    <span className="text-xs text-slate-400 font-mono block">Full-Day Program & Luncheon</span>
                  </div>
                </div>

                {/* Venue using full name of TIP */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#05BFE0]/10 border border-[#05BFE0]/30 flex items-center justify-center text-[#05BFE0] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Venue</span>
                    <span className="text-sm sm:text-base font-bold text-white leading-snug">
                      Technological Institute of the Philippines (T.I.P.)
                    </span>
                    <span className="text-xs text-slate-300 font-medium block">
                      Anniversary Hall, Quezon City Campus
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      938 Aurora Blvd, Cubao, Quezon City
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Map Directions Action */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-end">
                <a
                  href="https://maps.google.com/?q=Technological+Institute+of+the+Philippines+Quezon+City"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#05BFE0] hover:text-white transition-colors"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Event Pillars */}
            <div className="rounded-3xl bg-[#0B0F2B]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#05BFE0] font-bold">
                  Summit Pillars
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Network • Collaborate • Innovate • Transform
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.label}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#05BFE0]/40 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#05BFE0]/10 flex items-center justify-center text-[#05BFE0] mb-2">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
                        {pillar.label}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Campus Profile (Technological Institute of the Philippines) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#4F17A8]/30 via-[#0B0F2B]/90 to-[#05BFE0]/15 border border-white/10 p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#FF2D8D] font-bold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Host Institution</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Technological Institute of the Philippines (T.I.P.)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                T.I.P. is one of the country's top technological and engineering institutions, bringing together academia, industry partners, and tech visionaries for the Tech X Summit 2026.
              </p>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: REGISTRATION & RSVP FORM (7 Cols on LG) ================= */}
          <div ref={formRef} className="lg:col-span-7">
            <div className="relative">
              {/* Card Ambient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF2D8D]/25 via-[#4F17A8]/35 to-[#05BFE0]/25 rounded-3xl blur-xl opacity-70 pointer-events-none" />

              <div className="relative rounded-3xl bg-[#0B0F2B]/90 backdrop-blur-2xl border border-[#05BFE0]/30 p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                
                {/* Form Header */}
                <div className="pb-6 mb-6 border-b border-white/10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05BFE0]/10 border border-[#05BFE0]/30 text-[11px] font-mono uppercase tracking-widest text-[#05BFE0] mb-2 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official Delegate Registration</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    RSVP & Confirm Attendance
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Please provide your contact details to secure your badge and reserved seat for the 2nd GMM 2026 sessions.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form
                      key="registration-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      {/* Form Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Full Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="fullName" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                            Full Name <span className="text-[#FF2D8D]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="e.g. Juan Dela Cruz"
                              className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/60 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                errors.fullName && touched.fullName
                                  ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                  : 'border-white/10 hover:border-white/20 focus:border-[#05BFE0] focus:ring-1 focus:ring-[#05BFE0]'
                              }`}
                            />
                          </div>
                          {errors.fullName && touched.fullName && (
                            <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                              <AlertCircle className="w-3 h-3" /> {errors.fullName}
                            </p>
                          )}
                        </div>

                        {/* Company Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="companyName" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                            Company / Organization <span className="text-[#FF2D8D]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              id="companyName"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="e.g. Organization / Company Name"
                              className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/60 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                errors.companyName && touched.companyName
                                  ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                  : 'border-white/10 hover:border-white/20 focus:border-[#05BFE0] focus:ring-1 focus:ring-[#05BFE0]'
                              }`}
                            />
                          </div>
                          {errors.companyName && touched.companyName && (
                            <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                              <AlertCircle className="w-3 h-3" /> {errors.companyName}
                            </p>
                          )}
                        </div>

                        {/* Job Title */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="jobTitle" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                            Job Title / Position <span className="text-[#FF2D8D]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              id="jobTitle"
                              name="jobTitle"
                              value={formData.jobTitle}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="e.g. President"
                              className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/60 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                errors.jobTitle && touched.jobTitle
                                  ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                  : 'border-white/10 hover:border-white/20 focus:border-[#05BFE0] focus:ring-1 focus:ring-[#05BFE0]'
                              }`}
                            />
                          </div>
                          {errors.jobTitle && touched.jobTitle && (
                            <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                              <AlertCircle className="w-3 h-3" /> {errors.jobTitle}
                            </p>
                          )}
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                          <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                            Email Address <span className="text-[#FF2D8D]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="name@company.com"
                              className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/60 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                errors.email && touched.email
                                  ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                  : 'border-white/10 hover:border-white/20 focus:border-[#05BFE0] focus:ring-1 focus:ring-[#05BFE0]'
                              }`}
                            />
                          </div>
                          {errors.email && touched.email && (
                            <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                              <AlertCircle className="w-3 h-3" /> {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                          <label htmlFor="mobile" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                            Mobile Number <span className="text-[#FF2D8D]">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              id="mobile"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="+63 917 123 4567"
                              className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/60 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                errors.mobile && touched.mobile
                                  ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                  : 'border-white/10 hover:border-white/20 focus:border-[#05BFE0] focus:ring-1 focus:ring-[#05BFE0]'
                              }`}
                            />
                          </div>
                          {errors.mobile && touched.mobile && (
                            <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                              <AlertCircle className="w-3 h-3" /> {errors.mobile}
                            </p>
                          )}
                        </div>

                        {/* Companion Section (1 Companion Allowed) */}
                        <div className="pt-2 border-t border-white/10 space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-bold">
                              <Users className="w-3.5 h-3.5 text-[#05BFE0]" />
                              <span>Attending with a Companion? (Max 1)</span>
                            </label>
                            <span className="text-[11px] font-mono text-slate-400">1 Companion Seat Allowed</span>
                          </div>

                          {/* Companion Selector Toggle Buttons */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              id="btnCompanionNo"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, hasCompanion: false, companionName: '', companionDesignation: '' }));
                                setErrors(prev => ({ ...prev, companionName: undefined, companionDesignation: undefined }));
                              }}
                              className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center gap-2 ${
                                !formData.hasCompanion
                                  ? 'bg-[#05BFE0]/15 border-[#05BFE0] text-[#05BFE0] shadow-[0_0_15px_rgba(5,191,224,0.15)]'
                                  : 'bg-[#0B0F2B]/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                              }`}
                            >
                              <User className="w-3.5 h-3.5" />
                              <span>No (Attending Solo)</span>
                            </button>

                            <button
                              type="button"
                              id="btnCompanionYes"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, hasCompanion: true }));
                              }}
                              className={`py-2.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center gap-2 ${
                                formData.hasCompanion
                                  ? 'bg-[#FF2D8D]/15 border-[#FF2D8D] text-[#FF2D8D] shadow-[0_0_15px_rgba(255,45,141,0.2)]'
                                  : 'bg-[#0B0F2B]/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                              }`}
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Yes (Bringing 1 Companion)</span>
                            </button>
                          </div>

                          {/* Companion Details Fields (Conditional) */}
                          <AnimatePresence>
                            {formData.hasCompanion && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 rounded-2xl bg-[#070A1E] border border-[#FF2D8D]/30 space-y-3.5 mt-1 shadow-[0_0_20px_rgba(255,45,141,0.08)]">
                                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                    <span className="text-[11px] font-mono text-[#FF2D8D] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                      <Sparkles className="w-3 h-3 text-[#FF2D8D]" />
                                      <span>Companion Information</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">Delegate Badge #2</span>
                                  </div>

                                  {/* Companion Name */}
                                  <div className="space-y-1.5">
                                    <label htmlFor="companionName" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                                      Companion Full Name <span className="text-[#FF2D8D]">*</span>
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <User className="w-4 h-4" />
                                      </div>
                                      <input
                                        type="text"
                                        id="companionName"
                                        name="companionName"
                                        value={formData.companionName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g. Juan dela Cruz"
                                        className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/80 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                          errors.companionName && touched.companionName
                                            ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                            : 'border-white/15 hover:border-white/25 focus:border-[#FF2D8D] focus:ring-1 focus:ring-[#FF2D8D]'
                                        }`}
                                      />
                                    </div>
                                    {errors.companionName && touched.companionName && (
                                      <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                                        <AlertCircle className="w-3 h-3" /> {errors.companionName}
                                      </p>
                                    )}
                                  </div>

                                  {/* Companion Designation */}
                                  <div className="space-y-1.5">
                                    <label htmlFor="companionDesignation" className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                                      Companion Designation / Job Title <span className="text-[#FF2D8D]">*</span>
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Briefcase className="w-4 h-4" />
                                      </div>
                                      <input
                                        type="text"
                                        id="companionDesignation"
                                        name="companionDesignation"
                                        value={formData.companionDesignation}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g. Vice President / Executive Assistant"
                                        className={`w-full pl-10 pr-4 py-3 bg-[#0B0F2B]/80 text-white placeholder-slate-500 rounded-xl text-sm border transition-all duration-200 focus:outline-none ${
                                          errors.companionDesignation && touched.companionDesignation
                                            ? 'border-[#FF2D8D] ring-1 ring-[#FF2D8D]'
                                            : 'border-white/15 hover:border-white/25 focus:border-[#FF2D8D] focus:ring-1 focus:ring-[#FF2D8D]'
                                        }`}
                                      />
                                    </div>
                                    {errors.companionDesignation && touched.companionDesignation && (
                                      <p className="text-[11px] text-[#FF2D8D] flex items-center gap-1 font-mono">
                                        <AlertCircle className="w-3 h-3" /> {errors.companionDesignation}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </div>

                      {/* Submit CTA Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-white text-base tracking-wide flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.99] shadow-[0_0_25px_rgba(255,45,141,0.3)] hover:shadow-[0_0_35px_rgba(5,191,224,0.4)] ${
                          isSubmitting
                            ? 'bg-[#4F17A8] cursor-not-allowed opacity-90'
                            : 'bg-gradient-to-r from-[#FF2D8D] via-[#4F17A8] to-[#05BFE0] hover:brightness-110'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin text-[#05BFE0]" />
                            <span>Processing Registration...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Registration & Confirm RSVP</span>
                            <ArrowRight className="w-5 h-5 text-white" />
                          </>
                        )}
                      </button>

                      {/* Data Privacy & Terms Agreement Note */}
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          By submitting this form, you agree to the collection and processing of your details for event registration, delegate badge issuance, and official ITAP coordination in accordance with the Data Privacy Act.{' '}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            className="text-[#05BFE0] hover:text-white underline font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Privacy Policy</span>
                            <ExternalLink className="w-3 h-3 inline" />
                          </button>
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#05BFE0]" />
                        <span>Securely processed for ITAP 2nd General Membership Meeting 2026</span>
                      </div>
                    </motion.form>
                  ) : (
                    /* Stylized Registration Confirmation Screen */
                    <motion.div
                      key="confirmation-screen"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="py-4 text-center space-y-6"
                    >
                      {/* Success Badge */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#05BFE0] to-[#FF2D8D] p-0.5 mx-auto shadow-[0_0_30px_rgba(5,191,224,0.5)]">
                        <div className="w-full h-full bg-[#0B0F2B] rounded-[14px] flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-[#05BFE0]" />
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#05BFE0] font-bold">
                          Registration Confirmed
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                          You're Registered for 2nd GMM 2026!
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
                          Thank you, <strong className="text-white">{formData.fullName}</strong>. Your delegate access has been reserved.
                        </p>
                      </div>

                      {/* Attendee Digital Pass Card */}
                      <div className="rounded-2xl bg-white/[0.03] border border-[#05BFE0]/30 p-6 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF2D8D]/20 via-[#4F17A8]/20 to-transparent rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Delegate Pass</span>
                            <div className="text-lg font-bold text-white">{formData.fullName}</div>
                            <div className="text-xs text-[#05BFE0]">{formData.jobTitle} • {formData.companyName}</div>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Confirmation Ref</span>
                            <div className="font-mono font-bold text-sm text-[#FF2D8D] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 inline-block sm:block">
                              {registrationId}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">Event</span>
                            <span className="text-white font-medium">ITAP 2nd GMM 2026</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">Date & Time</span>
                            <span className="text-white font-medium">Oct 15, 2026 | 8AM-5PM</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">Venue</span>
                            <span className="text-white font-medium">Technological Institute of the Philippines (T.I.P.)</span>
                          </div>
                        </div>

                        {/* Companion Badge in Digital Pass */}
                        {formData.hasCompanion && formData.companionName && (
                          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="text-[10px] font-mono text-[#FF2D8D] uppercase tracking-widest flex items-center gap-1 font-bold">
                                <Users className="w-3 h-3 text-[#FF2D8D]" /> Accompanying Companion (1 Pass)
                              </span>
                              <div className="text-white font-medium mt-0.5">{formData.companionName}</div>
                              <div className="text-[11px] text-slate-400">{formData.companionDesignation}</div>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block font-semibold">
                                ✓ Companion Seat Reserved
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                          to="/techx-qa"
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#05BFE0] to-[#4F17A8] hover:from-[#05BFE0]/90 hover:to-[#4F17A8]/90 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <MessageSquarePlus className="w-4 h-4 text-white" />
                          <span>Interactive Live Q&A</span>
                        </Link>

                        <a
                          href={generateGoogleCalendarUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4 text-[#05BFE0]" />
                          <span>Add to Calendar</span>
                        </a>

                        <button
                          onClick={() => window.print()}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Print / Save Pass</span>
                        </button>

                        <button
                          onClick={handleReset}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#4F17A8] text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors hover:brightness-110"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Register Another Delegate</span>
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER SECTION: ITAP SPECIAL GUESTS & MEMBER ORGANIZATIONS MARQUEE */}
      <footer className="mt-16 sm:mt-24 pt-16 pb-12 border-t border-[#05BFE0]/20 bg-[#0B0F2B] relative overflow-hidden">
        
        {/* Marquee Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#05BFE0] font-bold block mb-2">
            Collaborative Ecosystem
          </span>
          <h2 className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Special Guests & Member Organizations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Connecting leading enterprise technology providers, ICT innovators, and academic partners.
          </p>
        </div>

        {/* Clean Infinite Logo Marquee - CRISP ORIGINAL LOGOS, NO COLOR OVERLAYS */}
        <div className="relative w-full overflow-hidden py-8 bg-[#070A1E]/80 border-y border-white/10 mb-16">
          {/* Subtle side fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0B0F2B] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0B0F2B] to-transparent z-10 pointer-events-none" />

          <div className="flex w-max gap-6 sm:gap-8 animate-marquee items-center">
            {/* 2 duplicates for continuous smooth loop */}
            {[...memberCompanies, ...memberCompanies].map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 w-48 sm:w-56 h-24 sm:h-28 px-6 py-4 rounded-2xl bg-white border border-slate-200/90 shadow-md flex items-center justify-center transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-12 sm:max-h-14 max-w-[140px] sm:max-w-[160px] object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const parent = (e.currentTarget as HTMLElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const span = document.createElement('span');
                      span.className = 'fallback-text text-xs font-mono font-bold text-slate-800 text-center line-clamp-2';
                      span.innerText = company.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/10 items-center">
            
            {/* Full White Logo */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/techx%20full%20white.png"
                alt="TechX Summit 2026 Full White Logo"
                className="h-12 sm:h-14 w-auto object-contain mb-3"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Technological Institute of the Philippines (T.I.P.) Tech X Summit 2026 in partnership with the Infocomm Technology Association of the Philippines (ITAP).
              </p>
            </div>

            {/* ITAP Organizers Link */}
            <div className="flex flex-col items-center text-center">
              <div className="text-[10px] font-mono text-[#05BFE0] uppercase tracking-widest mb-1">
                Prime Mover & Host
              </div>
              <div className="text-sm font-bold text-white mb-1">
                Infocomm Technology Association of the Philippines
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                P.O. Box 3240, Makati Central Post Office 1272 Makati City, Philippines
              </p>
              <div className="text-xs text-[#05BFE0] font-mono mt-1.5">
                secretariat@itaphil.com • +63 917 1607557
              </div>
            </div>

            {/* Quick Links & Back to ITAP */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:border-[#05BFE0]/40 transition-colors"
              >
                <span>Return to Main Website</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#05BFE0]" />
              </Link>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 font-mono">
                <Link to="/membership" className="hover:text-[#05BFE0] transition-colors">Membership</Link>
                <span>•</span>
                <Link to="/events" className="hover:text-[#05BFE0] transition-colors">Events</Link>
                <span>•</span>
                <button onClick={() => setShowPrivacyModal(true)} className="hover:text-[#05BFE0] transition-colors">Privacy</button>
              </div>
            </div>

          </div>

          {/* Copyright Note */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 text-center sm:text-left">
            <p>© 2026 ITAP & Technological Institute of the Philippines (T.I.P.) Tech X Summit. ALL RIGHTS RESERVED.</p>
            <p className="text-[11px] text-slate-600">
              STRONG TOGETHER. INNOVATING TOMORROW. SHAPING THE FUTURE.
            </p>
          </div>
        </div>
      </footer>

      {/* PRIVACY POLICY MODAL */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0B0F2B] border border-[#05BFE0]/30 rounded-3xl p-6 sm:p-8 text-left shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#05BFE0]" />
                  <h3 className="text-lg font-bold text-white font-display">Data Privacy Policy & Compliance</h3>
                </div>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed no-scrollbar flex-grow">
                <p>
                  The <strong>Infocomm Technology Association of the Philippines (ITAP)</strong> and <strong>Technological Institute of the Philippines (T.I.P.) Tech X Summit 2026</strong> are committed to protecting and respecting your personal data privacy in compliance with Republic Act No. 10173, also known as the <em>Data Privacy Act of 2012 (DPA)</em>.
                </p>

                <h4 className="text-xs font-mono uppercase tracking-wider text-[#05BFE0] font-bold">1. Information Collection</h4>
                <p>
                  When registering for the 2nd GMM 2026 @ Technological Institute of the Philippines (T.I.P.) Tech X Summit, we collect your full name, company or institutional affiliation, job title, work email address, contact telephone number, and dietary/accessibility preferences.
                </p>

                <h4 className="text-xs font-mono uppercase tracking-wider text-[#05BFE0] font-bold">2. Purpose and Usage</h4>
                <p>
                  Your information is strictly processed for:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Issuing official event delegate passes and access credentials.</li>
                  <li>Facilitating event coordination, schedule announcements, and catering logistics.</li>
                  <li>Providing post-event documentation, session presentations, and accredited certifications.</li>
                  <li>ITAP membership record validation and official organizational correspondence.</li>
                </ul>

                <h4 className="text-xs font-mono uppercase tracking-wider text-[#05BFE0] font-bold">3. Protection and Retention</h4>
                <p>
                  We implement organizational, physical, and technical security measures to ensure your data is kept confidential and protected from unauthorized access, loss, or disclosure. We do not sell or transfer your personal data to third-party marketing entities.
                </p>

                <h4 className="text-xs font-mono uppercase tracking-wider text-[#05BFE0] font-bold">4. Your Data Subject Rights</h4>
                <p>
                  Under the DPA, you have the right to access, rectify, or request deletion of your information by contacting the ITAP Secretariat at <code>secretariat@itaphil.com</code>.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#05BFE0] text-[#0B0F2B] font-bold text-xs hover:bg-[#05BFE0]/90 transition-colors"
                >
                  I Understand & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marquee Animation Keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default GMMTechXSummit2026;

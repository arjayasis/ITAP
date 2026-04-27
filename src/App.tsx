/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Cpu, 
  Globe, 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Menu, 
  X, 
  ChevronRight,
  Briefcase,
  GraduationCap,
  Handshake,
  Network,
  Mail,
  Building2,
  ExternalLink,
  Phone,
  MapPin,
  Facebook,
  Calendar
} from 'lucide-react';
import Membership from './pages/Membership';
import Events from './pages/Events';
import GMM2026 from './pages/GMM2026';
import DeckGMM2026 from './pages/DeckGMM2026';
import Page23 from './pages/Page23';
import PageVerticalDeck from './pages/PageVerticalDeck';
import JoinMembership from './pages/JoinMembership';
import { Event, EventModal } from './components/EventModal';
import { memberCompanies } from './data/membersData';

// --- Components ---

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxSection = ({ children, speed = 0.5, className = "" }: { children: React.ReactNode, speed?: number, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200 * speed]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  );
};

const TeamMemberCard = ({ member, index, isPrimary }: { member: any, index: number, isPrimary?: boolean, key?: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`relative group overflow-hidden glass rounded-2xl p-6 border-white/10 h-full flex flex-col ${isPrimary ? 'border-brand-cyan/30 glow-cyan bg-brand-cyan/5' : 'bg-white/2'}`}
    >
      {/* System Scan Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-cyan/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      <div className="relative z-10 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="px-2 py-1 rounded border border-brand-cyan/30 bg-brand-cyan/5 text-[10px] font-mono text-brand-cyan tracking-tighter">
            [{member.position.toUpperCase()}]
          </div>
          {isPrimary && <Zap className="w-4 h-4 text-brand-cyan animate-pulse" />}
        </div>

        <h3 className="font-display font-bold mb-1 tracking-tight text-brand-ink text-xl">
          {member.name}
        </h3>
        
        <div className="space-y-3 mt-4 flex-grow">
          <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 transition-colors">
            <Building2 className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs font-mono tracking-tight leading-tight">
              {member.company}
              {member.title && <span className="block text-[10px] opacity-60">{member.title}</span>}
            </span>
          </div>
          
          {member.email && (
            <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 transition-colors">
              <Mail className="w-4 h-4 text-brand-blue" />
              <span className="text-xs font-mono tracking-tight">{member.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Trace Corner */}
      <div className="absolute bottom-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
        <div className="w-4 h-4 border-r border-b border-brand-cyan"></div>
      </div>
    </motion.div>
  );
};

const DirectoryHub = () => {
  const team = [
    { 
      name: 'Sunver Bastes', 
      company: 'Total Information Management Corporation (TIM)', 
      position: 'President', 
      email: 'president@itaphil.com',
      isPrimary: true 
    },
    { 
      name: 'Merrick Chua', 
      company: 'MEC Networks Corporation', 
      title: 'President/CEO',
      position: 'Vice President', 
      email: 'vicepresident@itaphil.com',
      isPrimary: true 
    },
    { 
      name: 'Michael George Lee', 
      company: 'AMD', 
      title: 'Commercial Lead PH',
      position: 'Corporate Secretary', 
      email: 'corpsecretary@itaphil.com' 
    },
    { 
      name: 'Kathleen Kho', 
      company: 'Metasystems Development Inc.', 
      title: 'CEO',
      position: 'Treasurer', 
      email: 'treasurer@itaphil.com' 
    },
    { 
      name: 'Rodrigo Mendoza', 
      company: 'AMTI', 
      title: 'AVP and Head of Product Management Group',
      position: 'Director' 
    },
    { 
      name: 'Dennis John Lumbao', 
      company: 'Dell Technologies', 
      title: 'Ecosystem Channel and Sales Leader',
      position: 'Director' 
    },
    { 
      name: 'Raymond Remoquillo', 
      company: 'Lenovo Philippines Inc.', 
      title: 'Country Leader',
      position: 'Director' 
    },
  ];

  return (
    <section id="directory" className="py-24 bg-white relative overflow-hidden">
      <TechBackground />
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <SectionHeading 
            badge="Leadership"
            title="The Directory Hub"
            subtitle="Meet the visionaries leading the charge for the Philippine ICT industry. A network of primary and satellite nodes driving innovation."
          />
          <div className="flex items-center gap-4 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Active</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Nodes: 07</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <TeamMemberCard 
              key={member.name} 
              member={member} 
              index={idx} 
              isPrimary={member.isPrimary} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '/#about' },
    { name: 'Membership', href: '/membership' },
    { name: 'Events', href: '/events' },
    { name: 'V-Deck', href: '/v-deck' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#') && location.pathname === '/') {
      const id = href.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'pt-2 pb-4' : 'pt-4 pb-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-start gap-4">
        {/* Logo Badge aligned to left */}
        <Link 
          to="/" 
          className="bg-white/60 backdrop-blur-md border border-white/30 p-3 rounded-2xl shadow-2xl hover:bg-white/80 transition-all duration-300 group z-[60] shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img 
            src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
            alt="ITAP Badge" 
            className="h-20 md:h-[100px] w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </Link>

        <div className={`glass-dark rounded-full flex-grow px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-slate-900/90 border-slate-800 shadow-2xl' : ''}`}>
          <Link to="/" className="flex items-center" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 7@4x.png" 
              alt="ITAP Logo" 
              className="h-6 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-sm font-medium text-slate-300 hover:text-brand-cyan transition-colors"
                onClick={() => handleNavClick(link.href)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/join-membership" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md">
              Join Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 px-6 md:hidden"
          >
            <div className="glass-dark rounded-2xl p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-lg font-medium text-slate-300 hover:text-brand-cyan"
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/join-membership" 
                className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Join Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const NeuralBackground = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
      <motion.video 
        style={{ y }}
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="https://marketing.timcorp.net.ph/hubfs/ITAP/gradient-background-720.mp4" type="video/mp4" />
      </motion.video>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950"></div>
      
      {/* Grid Lines Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    </div>
  );
};

export const SectionHeading = ({ title, subtitle, badge, light }: { title: string, subtitle?: string, badge?: string, light?: boolean }) => (
  <div className="mb-12">
    {badge && (
      <span className={`inline-block px-3 py-1 rounded-full ${light ? 'bg-white/10 border-white/20 text-brand-cyan' : 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan'} text-[10px] font-mono uppercase tracking-widest mb-4`}>
        {badge}
      </span>
    )}
    <h2 className={`text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight ${light ? 'text-white' : 'text-brand-ink'}`}>{title}</h2>
    {subtitle && <p className={`${light ? 'text-slate-400' : 'text-slate-500'} max-w-2xl text-lg leading-relaxed`}>{subtitle}</p>}
  </div>
);

export const TechBackground = ({ variant = 'light', children, showMap }: { variant?: 'light' | 'dark' | 'cyan', children?: React.ReactNode, showMap?: boolean }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Grid Pattern */}
    <div className={`absolute inset-0 opacity-[0.03] ${variant === 'dark' ? 'invert' : ''}`} 
      style={{ backgroundImage: `radial-gradient(${variant === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} 
    />
    
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-full h-full">
      <div className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] ${variant === 'cyan' ? 'bg-brand-cyan/20' : 'bg-brand-blue/5'}`} />
      <div className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] ${variant === 'dark' ? 'bg-brand-cyan/10' : 'bg-brand-cyan/5'}`} />
    </div>

    {/* Philippine Map Silhouette (Subtle) */}
    {showMap && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-[0.03] flex items-center justify-center">
        <svg viewBox="0 0 500 800" className="h-full w-auto fill-current text-brand-blue">
          <path d="M250,50 L260,60 L255,80 L270,90 L265,110 L280,120 L275,140 L290,150 L285,170 L300,180 L295,200 L310,210 L305,230 L320,240 L315,260 L330,270 L325,290 L340,300 L335,320 L350,330 L345,350 L360,360 L355,380 L370,390 L365,410 L380,420 L375,440 L390,450 L385,470 L400,480 L395,500 L410,510 L405,530 L420,540 L415,560 L430,570 L425,590 L440,600 L435,620 L450,630 L445,650 L460,660 L455,680 L470,690 L465,710 L480,720 L475,740 L490,750 L485,770 L500,780 L250,750 L0,780 L15,770 L10,750 L25,740 L20,720 L35,710 L30,690 L45,680 L40,660 L55,650 L50,630 L65,620 L60,600 L75,590 L70,570 L85,560 L80,540 L95,530 L90,510 L105,500 L100,480 L115,470 L110,450 L125,440 L120,420 L135,410 L130,390 L145,380 L140,360 L155,350 L150,330 L165,320 L160,300 L175,290 L170,270 L185,260 L180,240 L195,230 L190,210 L205,200 L200,180 L215,170 L210,150 L225,140 L220,120 L235,110 L230,90 L245,80 L240,60 Z" />
        </svg>
      </div>
    )}

    {/* Tech Icons */}
    <div className={`absolute inset-0 opacity-[0.02] ${variant === 'dark' ? 'text-white' : 'text-brand-ink'}`}>
      <Cpu className="absolute top-10 right-10 w-32 h-32 rotate-12" />
      <Globe className="absolute bottom-20 left-10 w-48 h-48 -rotate-12" />
      <Network className="absolute top-1/2 right-1/4 w-40 h-40 opacity-50" />
      <Zap className="absolute bottom-1/4 right-10 w-24 h-24 rotate-45" />
    </div>
    
    {children}
  </div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const heroY1 = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const heroY2 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroY3 = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 md:pt-40 pb-20 overflow-hidden">
        <NeuralBackground />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="flex flex-col items-center text-center">
          <motion.div
            style={{ opacity: heroOpacity }}
            className="flex flex-col items-center"
          >
            <h1 className="flex flex-col font-display font-bold leading-[0.85] mb-8 tracking-tighter text-white w-full items-center">
              <motion.span style={{ y: heroY1 }} className="text-[clamp(2.5rem,15vw,9rem)] whitespace-nowrap">THE PRIME</motion.span>
              <motion.span style={{ y: heroY2 }} className="text-[clamp(1.86rem,12vw,6.8rem)] text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue whitespace-nowrap">
                MOVER OF ICT
              </motion.span>
              <motion.span style={{ y: heroY3 }} className="text-[clamp(1.5rem,8vw,5rem)] mt-2 sm:mt-4 opacity-70 font-medium tracking-normal uppercase whitespace-nowrap">
                IN THE PHILIPPINES
              </motion.span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed mx-auto">
              Home to leading Philippine product and service providers of Information Communication Technology solutions. <br className="hidden sm:block" /> A non-profit Organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8 sm:mt-12">
              <a href="#about" className="bg-brand-blue text-white px-10 py-5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand-blue/20">
                Explore Mission <ArrowRight className="w-5 h-5" />
              </a>
              <Link to="/join-membership" className="glass px-10 py-5 rounded-full font-bold hover:bg-slate-50 transition-colors text-brand-ink">
                Join Membership
              </Link>
            </div>
          </motion.div>
          
          </div>
        </div>
      </section>

      {/* About Section - Bento Grid */}
      <section id="about" className="py-24 relative overflow-hidden">
        <TechBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ParallaxSection speed={-0.1}>
            <SectionHeading 
              badge="About ITAP"
              title="Our Vision & Mission"
              subtitle="Since 1984, ITAP has been at the forefront of the Philippine ICT landscape, bridging the gap between technology and economic prosperity."
            />
          </ParallaxSection>
        </div>

        {/* Full-Width Group Photo Hero */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="my-16 relative w-full overflow-hidden group border-y border-white/10 bg-slate-950"
        >
          {/* Desktop Overlay UI (Hidden on Mobile) */}
          <div className="hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80 z-10" />
            
            <div className="absolute inset-0 flex flex-col justify-between z-20 p-12">
              <div className="max-w-7xl mx-auto w-full">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-8 bg-brand-cyan"></div>
                    <span className="text-brand-cyan text-[10px] font-mono uppercase tracking-[0.3em]">Established 1984</span>
                  </div>
                  <h3 className="text-4xl font-display font-bold text-white mb-2 tracking-tighter leading-tight">
                    The People Behind <br />
                    <span className="text-brand-cyan italic serif text-3xl">The Progress</span>
                  </h3>
                </motion.div>
              </div>

              <div className="max-w-7xl mx-auto w-full">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="flex items-end justify-between"
                >
                  <p className="text-slate-300 text-lg leading-relaxed font-light max-w-2xl">
                    ITAP is more than an association; it's a movement of dedicated professionals working tirelessly to elevate the Philippine ICT industry to global standards.
                  </p>
                  <Link to="/membership#members" className="flex -space-x-4 hover:scale-105 transition-transform cursor-pointer">
                    {memberCompanies.slice(0, 7).map((company, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-white overflow-hidden ring-4 ring-white/5 flex items-center justify-center p-1">
                        <img src={company.logo} alt="Member Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-brand-cyan flex items-center justify-center text-xs font-bold text-slate-950 ring-4 ring-white/5">
                      +
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Live Hub Badge - Desktop */}
            <div className="absolute top-12 right-12 z-20">
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="glass-dark p-4 rounded-2xl border border-white/10 backdrop-blur-2xl inline-block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
                  <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">Live Community Hub</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Stacked Layout (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col">
            {/* Top Text */}
            <div className="px-6 pt-10 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-brand-cyan"></div>
                <span className="text-brand-cyan text-[10px] font-mono uppercase tracking-[0.3em]">Established 1984</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-1 tracking-tighter leading-tight">
                The People Behind <br />
                <span className="text-brand-cyan italic serif text-xl">The Progress</span>
              </h3>
            </div>

            {/* Image */}
            <div className="w-full">
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/Group Photo.jpg"
                alt="ITAP Members"
                className="w-full h-auto object-cover bg-slate-950"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom Text */}
            <div className="px-6 pt-6 pb-10">
              <p className="text-slate-300 text-base leading-relaxed font-light mb-6">
                ITAP is more than an association; it's a movement of dedicated professionals working tirelessly to elevate the Philippine ICT industry to global standards.
              </p>
              <Link to="/membership#members" className="flex -space-x-3">
                {memberCompanies.slice(0, 7).map((company, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-white overflow-hidden ring-4 ring-white/5 flex items-center justify-center p-1">
                    <img src={company.logo} alt="Member Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-brand-cyan flex items-center justify-center text-[10px] font-bold text-slate-950 ring-4 ring-white/5">
                  +
                </div>
              </Link>
            </div>
          </div>

          {/* Background Image - Desktop Only */}
          <motion.div 
            className="hidden md:block z-0"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 2 }}
          >
            <img 
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/Group Photo.jpg"
              alt="ITAP Members"
              className="w-full h-auto min-h-[500px] object-cover bg-slate-950 transition-transform duration-1000 group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mission Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 glass rounded-3xl p-8 glass-hover flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/5 flex items-center justify-center mb-6">
                  <ShieldCheck className="text-brand-cyan w-6 h-6" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-brand-ink">The Mission</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  To promote the use of Information and Communications Technology (ICT) for the benefit of the Philippine economy and to be the prime mover in the ICT industry.
                </p>
              </div>
            </motion.div>

            {/* History Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass rounded-3xl p-8 glass-hover bg-gradient-to-b from-brand-blue/5 to-transparent"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center mb-6">
                <Users className="text-brand-blue w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-brand-ink">Our History</h3>
              <p className="text-slate-600 leading-relaxed">
                Founded in 1984, ITAP has grown from a small group of visionaries to the nation's premier ICT association.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="text-4xl font-display font-bold text-slate-200">1984</div>
              </div>
            </motion.div>

            {/* Values Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass rounded-3xl p-8 glass-hover relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl" />
              <h3 className="text-xl font-display font-bold mb-6 text-brand-ink">Core Values</h3>
              <ul className="space-y-4">
                {['Integrity', 'Innovation', 'Collaboration', 'Excellence'].map((value) => (
                  <li key={value} className="flex items-center gap-3 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>
                    {value}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Impact Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 glass rounded-3xl p-8 glass-hover bg-brand-cyan/5 relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold mb-4 text-brand-ink">Economic Catalyst</h3>
                <p className="text-slate-600 leading-relaxed max-w-xl">
                  We believe ICT is the backbone of modern economy. Our initiatives focus on creating a digital-ready nation that competes on a global scale.
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-5">
                <Network className="w-64 h-64 text-brand-cyan" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="pillars" className="py-24 bg-slate-900 relative overflow-hidden">
        <TechBackground variant="dark" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ParallaxSection speed={0.2}>
            <SectionHeading 
              badge="The Foundation"
              title="The Four Pillars"
              subtitle="Our strategic framework designed to empower the ICT ecosystem in the Philippines."
              light
            />
          </ParallaxSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Advocacy', 
                icon: <ShieldCheck className="w-6 h-6" />, 
                desc: 'Representing the interests of the ICT industry in policy-making and legislation.',
                color: 'text-brand-cyan'
              },
              { 
                title: 'Partnership', 
                icon: <Handshake className="w-6 h-6" />, 
                desc: 'Fostering collaboration between government, private sector, and international bodies.',
                color: 'text-brand-blue'
              },
              { 
                title: 'Professional Development', 
                icon: <GraduationCap className="w-6 h-6" />, 
                desc: 'Enhancing the skills and competencies of ICT professionals through training.',
                color: 'text-brand-teal'
              },
              { 
                title: 'Industry-Education Linkage', 
                icon: <Network className="w-6 h-6" />, 
                desc: 'Bridging the gap between academic curricula and industry requirements.',
                color: 'text-brand-blue'
              },
            ].map((pillar, idx) => (
              <motion.div 
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-dark rounded-3xl p-8 hover:bg-slate-800/50 transition-all duration-300 group h-full flex flex-col border-slate-800"
              >
                <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${pillar.color}`}>
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-4 text-white">{pillar.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <LatestEvents />
      <MembershipSection />
      <GlobalPartnership />
      <DirectoryHub />
      <ContactSection />
    </>
  );
};

const LatestEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const latestEvents: Event[] = [
    {
      title: "General Membership Meeting (GMM) and Christmas Party",
      date: "2025-11-19",
      image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/itap 2025 gmm.jpg",
      venue: "East-West Room, Manila Golf and Country Club",
      overview: `Time: 10:00 AM – 3:00 PM
Theme: "Explore Forward-Looking Strategies for Digital Advancement"

The ITAP Convergence Alliance Inc. successfully concluded its General Membership Meeting (GMM) and Christmas Party on November 19, 2025, at the Manila Golf and Country Club.

Event Highlights:

Strategic Insights: Keynote speaker DICT Secretary Henry Aguda discussed national digital advancement, while Michelle Alarcon (President, AAP) presented on building a robust AI ecosystem for the future.

Governance & Growth: The event marked a pivotal moment for the organization with the election of new officers and the induction of new members, strengthening ITAP’s role as the sole Philippine partner of WITSA.

Holiday Fellowship: Members transitioned from high-level tech discussions to a festive year-end celebration, fostering community and professional networking.

Under the leadership of President Michael Ngan, the event reinforced ITAP's commitment to driving digital innovation and collaboration within the Philippine ICT sector.`
    },
    {
      title: "11th ITAP & Friends Golf Tournament: A Celebration of Camaraderie and Connection",
      date: "2025-06-23",
      image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/10th ITAP Golf Tournament.jpg",
      venue: "Sta. Elena Golf & Country Club, Sta. Rosa, Laguna",
      overview: `Centered around the theme "Swinging for Camaraderie and Friendship," the event was far more than a sporting competition; it was a powerful day of networking, community building, and shared passion among leaders in the ICT industry.

Event Highlights:

The Tee-Off: Players from across the industry gathered for a high-spirited start, showcasing both competitive drive and great sportsmanship.

Networking on the Green: The lush backdrop of Sta. Elena provided the perfect setting for strengthening professional bonds and forging new friendships.

Awards & Recognition: The day concluded with a heartfelt awards ceremony, celebrating the standout performances of our spirited players and acknowledging the teamwork that made the day possible.

Recap Video: https://youtu.be/EFsuvbBv8AM`
    },
    {
      title: "The ITAP GMM and Christmas Party",
      date: "2024-11-21",
      image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/The ITAP GMM and Christmas Party.jpg",
      venue: "Manila Golf and Country Club",
      overview: "The ITAP GMM and Christmas Party on November 21 at the Manila Golf Country Club was a resounding success. We were honored to induct new members and are deeply grateful to our esteemed speakers, Paul Skaria from AMD and Ms. Abba Valbuena from Microsoft, who spoke on the future of responsible AI: Emerging Trends and Technology. A sincere thank you to all attendees and sponsors for their contributions to the success of the event."
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div style={{ y }} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-mono uppercase tracking-widest mb-4">
              Community Impact
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-ink tracking-tight">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">Events</span>
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              Stay updated with our recent gatherings, forums, and community initiatives.
            </p>
          </div>
          <Link 
            to="/events" 
            className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            See all events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestEvents.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedEvent(event)}
              className="group glass rounded-3xl overflow-hidden border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image || ''} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-md text-brand-ink px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-2 shadow-sm">
                    <Calendar className="w-3 h-3 text-brand-cyan" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-display font-bold text-brand-ink mb-4 line-clamp-2 group-hover:text-brand-cyan transition-colors">
                  {event.title}
                </h3>
                <div className="mt-auto flex items-center gap-2 text-slate-500 text-xs font-mono">
                  <MapPin className="w-3 h-3 text-brand-cyan" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const GlobalPartnership = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <TechBackground variant="cyan" showMap />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <SectionHeading 
              badge="Global Network"
              title="WITSA Partnership"
              subtitle="ITAP is proud to be the only recognized Partner of the World Innovation, Technology and Services Alliance (WITSA) in the Philippines."
            />
            <p className="text-slate-600 mb-8 leading-relaxed">
              As the sole Philippine representative in this global alliance, ITAP connects our local ICT industry to a worldwide network of technology leaders, innovators, and policy makers across 80 countries.
            </p>
            <a 
              href="https://witsa.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all"
            >
              Learn more about WITSA <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="glass p-12 rounded-[40px] border-slate-100 shadow-2xl flex items-center justify-center bg-white"
            >
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/witsa.jpeg" 
                alt="WITSA Logo" 
                className="h-32 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-slate-50 relative overflow-hidden">
      <TechBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading 
              badge="Contact Us"
              title="Get in Touch"
              subtitle="Have questions about membership or our initiatives? Reach out to the ITAP secretariat."
            />
            
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-cyan group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-ink mb-1">Mailing Address</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    P.O. Box 3240, Makati Central Post Office<br />
                    1272 Makati City, Philippines
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-ink mb-1">Mobile</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    +63 917 1607557
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-teal group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-ink mb-1">Email</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    secretariat@itaphil.com
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="font-display font-bold text-brand-ink mb-4">Follow us</h4>
                <div className="flex gap-4">
                  <a 
                    href="https://www.facebook.com/profile.php?id=100064552905539" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all hover:scale-110"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-[40px] p-6 sm:p-8 md:p-12 shadow-xl bg-white border-slate-100">
            <h3 className="text-2xl font-display font-bold mb-6 text-brand-ink">Send us a message</h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan transition-colors" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">Email</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan transition-colors" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">Subject</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan transition-colors" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">Message</label>
                <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan transition-colors" placeholder="Your message here..."></textarea>
              </div>
              <button type="button" className="w-full bg-brand-ink text-white py-4 rounded-xl font-bold hover:bg-brand-blue transition-colors shadow-lg">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

function App() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.toLowerCase().replace(/\/$/, '');
  const hideGlobalUI = normalizedPath === '/gmm2026' || normalizedPath === '/deck-gmm2026' || normalizedPath === '/2-3' || normalizedPath === '/v-deck' || normalizedPath === '/v';

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly to ensure content is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-cyan/30 overflow-x-hidden">
      {!hideGlobalUI && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/membership" element={<PageTransition><Membership /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/gmm2026" element={<PageTransition><GMM2026 /></PageTransition>} />
          <Route path="/deck-gmm2026" element={<PageTransition><div className="h-screen w-screen"><DeckGMM2026 /></div></PageTransition>} />
          <Route path="/2-3" element={<PageTransition><Page23 /></PageTransition>} />
          <Route path="/v-deck" element={<PageTransition><PageVerticalDeck /></PageTransition>} />
          <Route path="/v" element={<PageTransition><PageVerticalDeck /></PageTransition>} />
          <Route path="/join-membership" element={<PageTransition><JoinMembership /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {!hideGlobalUI && <Footer />}
    </div>
  );
}

export default App;

const MembershipSection = () => {
  return (
    <section id="membership" className="py-24 relative overflow-hidden">
      <TechBackground variant="light" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="glass rounded-[40px] p-6 sm:p-8 md:p-16 relative overflow-hidden shadow-xl bg-white/40 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-cyan/10 to-transparent pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading 
                badge="Join the Network"
                title="Membership Value Proposition"
                subtitle="Be part of the most influential ICT organization in the country. Connect with leaders, influence policy, and grow your business."
              />
              <ul className="space-y-4 mb-10">
                {[
                  'Business Opportunities & Strategic Alliances',
                  'Executive Networking & Industry Forums',
                  'Public Policy Advocacy & Legal Reform',
                  'Professional Development & Skills Certification'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-brand-cyan/10 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-brand-cyan" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/membership" className="inline-block bg-brand-ink text-white px-10 py-4 rounded-full font-bold hover:bg-brand-blue transition-colors shadow-lg">
                View All Benefits
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-3xl p-6 text-center flex flex-col items-center justify-center h-full">
                <Briefcase className="w-8 h-8 text-brand-cyan mx-auto mb-4" />
                <div className="text-sm font-medium text-slate-500">Business Growth</div>
              </div>
              <div className="glass rounded-3xl p-6 text-center flex flex-col items-center justify-center h-full">
                <Network className="w-8 h-8 text-brand-blue mx-auto mb-4" />
                <div className="text-sm font-medium text-slate-500">Strategic Alliances</div>
              </div>
              <div className="glass rounded-3xl p-6 text-center flex flex-col items-center justify-center h-full">
                <Users className="w-8 h-8 text-brand-teal mx-auto mb-4" />
                <div className="text-sm font-medium text-slate-500">Community</div>
              </div>
              <div className="glass rounded-3xl p-6 text-center flex flex-col items-center justify-center h-full">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                <div className="text-sm font-medium text-slate-500">Advocacy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col">
            <div className="mb-6">
              <a href="#">
                <img 
                  src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 4@4x.png" 
                  alt="ITAP Logo" 
                  className="h-16 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Information Technology Association of the Philippines. 
              The prime mover in ICT since 1984.
            </p>
            <a href="https://witsa.org/" target="_blank" rel="noopener noreferrer" className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-300 mb-1 tracking-widest uppercase">Only Recognized Partner in the PH</span>
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/witsa.jpeg" 
                alt="WITSA Logo" 
                className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                referrerPolicy="no-referrer"
              />
            </a>
          </div>
          <div>
            <h4 className="font-display font-bold mb-6 uppercase text-xs tracking-widest text-slate-300">Quick Links</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-brand-cyan transition-colors" onClick={() => window.scrollTo(0,0)}>Home</Link></li>
              <li><Link to="/membership" className="hover:text-brand-cyan transition-colors" onClick={() => window.scrollTo(0,0)}>Membership</Link></li>
              <li><Link to="/events" className="hover:text-brand-cyan transition-colors" onClick={() => window.scrollTo(0,0)}>Events</Link></li>
              <li><Link to="/v-deck" className="hover:text-brand-cyan transition-colors font-bold text-brand-blue" onClick={() => window.scrollTo(0,0)}>V-Deck 2026</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-6 uppercase text-xs tracking-widest text-slate-300">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                <span>P.O. Box 3240, Makati Central Post Office 1272 Makati City, Philippines</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                <span>+63 917 1607557</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-teal shrink-0" />
                <span>secretariat@itaphil.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-6 uppercase text-xs tracking-widest text-slate-300">Connect</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=100064552905539" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-blue transition-colors text-slate-400"
              >
                <Facebook className="w-5 h-5" />
              </a>
              {[Globe, Users, Network].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-blue transition-colors text-slate-400">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-300 font-mono">
          <p>© {new Date().getFullYear()} ITAP. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-ink transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-brand-ink transition-colors">TERMS OF SERVICE</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Network, 
  GraduationCap, 
  Handshake,
  ChevronRight,
  Building2,
  Zap,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { NeuralBackground } from '../App';
import { memberCompanies } from '../data/membersData';

const memberBenefits = [
  {
    title: "Business Opportunities",
    icon: <Briefcase className="w-6 h-6" />,
    items: [
      "Immediate notification of IT project opportunities and bids",
      "Information bulletins on local and international trade opportunities",
      "Venue for member firms to seek business alliances, joint technology development and marketing agreements"
    ],
    color: "brand-cyan"
  },
  {
    title: "General Membership Meetings",
    icon: <Users className="w-6 h-6" />,
    items: [
      "Executive networking through regular discussions on the most current topics and issues affecting the IT industry",
      "Forum for presenting company offerings",
      "Update on the latest policies of government, trends and directions of the ICT industry"
    ],
    color: "brand-blue"
  },
  {
    title: "Public Policy Advocacy",
    icon: <ShieldCheck className="w-6 h-6" />,
    items: [
      "Tariff reduction on IT products and services",
      "Export promotion",
      "Legal reform to improve ICT policies",
      "Workforce capability development (skills, standards, competencies certification)",
      "Efficiency in government procurement"
    ],
    color: "brand-teal"
  },
  {
    title: "Industry Research and Surveys",
    icon: <Network className="w-6 h-6" />,
    items: [
      "Conduct industry market research and other policy studies",
      "Access to market research and surveys conducted on technology companies, including compensation and employee benefits practices",
      "Discussion on global ICT market researcher reports"
    ],
    color: "brand-cyan"
  },
  {
    title: "Professional Development",
    icon: <GraduationCap className="w-6 h-6" />,
    items: [
      "Training for member organizations",
      "Participation in IT job fairs",
      "Standardization of IT profession accreditation",
      "Support for ICT Skills Certification"
    ],
    color: "brand-blue"
  },
  {
    title: "Fellowship",
    icon: <Handshake className="w-6 h-6" />,
    items: [
      "Camaraderie and healthy competition among peers through year-round sports, social and fellowship activities for member companies' employees"
    ],
    color: "brand-teal"
  }
];

const Membership = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'brand-cyan': return 'text-brand-cyan';
      case 'brand-blue': return 'text-brand-blue';
      case 'brand-teal': return 'text-brand-teal';
      default: return 'text-brand-cyan';
    }
  };

  const getBgClass = (color: string) => {
    switch (color) {
      case 'brand-cyan': return 'bg-brand-cyan';
      case 'brand-blue': return 'bg-brand-blue';
      case 'brand-teal': return 'bg-brand-teal';
      default: return 'bg-brand-cyan';
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Dark Header */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <NeuralBackground />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-cyan text-xs font-mono mb-6">
              <Zap className="w-3 h-3" /> JOIN THE NETWORK
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
              MEMBERSHIP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">BENEFITS</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Be part of the most influential ICT organization in the Philippines. 
              Connect with leaders, influence policy, and grow your business.
            </p>
          </motion.div>
        </div>
      </section>

      <div ref={ref} className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-24">
        {/* Benefits Grid */}
        <motion.div style={{ y }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {memberBenefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 glass-hover group h-full flex flex-col border-white/20 shadow-xl"
            >
              <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${getColorClass(benefit.color)}`}>
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-display font-bold mb-6 text-brand-ink">{benefit.title}</h3>
              <ul className="space-y-4 flex-grow">
                {benefit.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                    <div className={`w-1.5 h-1.5 rounded-full ${getBgClass(benefit.color)} mt-1.5 flex-shrink-0`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Member Companies */}
        <div id="members" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-brand-ink mb-4">Member Companies</h2>
            <p className="text-slate-500">Leading the ICT industry in the Philippines</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {memberCompanies.map((company, index) => (
              <motion.a
                key={company.name}
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center hover:bg-white/10 transition-all hover:border-brand-cyan/30 hover:shadow-2xl hover:shadow-brand-cyan/10"
              >
                <div className="w-24 h-24 sm:w-40 sm:h-40 relative flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500 mb-3 sm:mb-4">
                  <img 
                    src={company.logo}
                    alt={company.name}
                    className="max-w-[85%] max-h-[85%] object-contain transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f1f5f9&color=0f172a&bold=true&size=128`;
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center group-hover:text-brand-cyan transition-colors line-clamp-2">
                  {company.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Global Partnership */}
        <div className="mb-32">
          <div className="glass rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-xl bg-white border-slate-100">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-blue/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-mono uppercase tracking-widest mb-4">
                  Global Network
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-ink mb-6">WITSA Partnership</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  ITAP is the <span className="font-bold text-brand-blue">only recognized Partner</span> in the Philippines for the World Innovation, Technology and Services Alliance (WITSA).
                </p>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  This exclusive partnership provides our members with unparalleled access to international markets, global ICT trends, and a network spanning over 80 countries.
                </p>
                <a 
                  href="https://witsa.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-3 transition-all"
                >
                  Visit WITSA Website <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-3xl bg-slate-50 flex items-center justify-center p-8 border border-slate-100">
                  <img 
                    src="https://marketing.timcorp.net.ph/hubfs/ITAP/witsa.jpeg" 
                    alt="WITSA Logo" 
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="glass rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl bg-white text-brand-ink border-slate-100">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Ready to join ITAP?</h2>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
              Elevate your business and contribute to the growth of the Philippine ICT industry.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <Link to="/join-membership" className="bg-brand-ink text-white px-10 py-4 rounded-full font-bold hover:bg-brand-blue transition-all hover:scale-105 shadow-xl shadow-brand-ink/10">
                Apply for Membership
              </Link>
              <button className="glass border-slate-200 px-10 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors text-brand-ink">
                Contact Secretariat
              </button>
            </div>

            <div className="pt-12 border-t border-slate-100 grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-cyan/5 flex items-center justify-center text-brand-cyan">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  P.O. Box 3240, Makati Central Post Office<br />
                  1272 Makati City, Philippines
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/5 flex items-center justify-center text-brand-blue">
                  <Phone className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">
                  +63 917 1607557
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal/5 flex items-center justify-center text-brand-teal">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">
                  secretariat@itaphil.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;

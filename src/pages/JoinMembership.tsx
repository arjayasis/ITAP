import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { NeuralBackground } from '../App';

interface FormData {
  fullname: string;
  company: string;
  designation: string;
  email: string;
  mobile: string;
  website: string;
}

const JoinMembership = () => {
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    company: '',
    designation: '',
    email: '',
    mobile: '',
    website: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const to = 'secretariat@itaphil.com';
    const cc = 'president@itaphil.com, vicepresident@itaphil.com, corpsecretary@itaphil.com';
    const subject = `${formData.company} - ITAP Membership Application`;
    const body = `
ITAP Membership Application

Fullname: ${formData.fullname}
Company: ${formData.company}
Designation/Job Title: ${formData.designation}
Email: ${formData.email}
Mobile Number: ${formData.mobile}
Company Website: ${formData.website}
    `.trim();

    const mailtoLink = `mailto:${to}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    setIsSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-24 flex flex-col justify-between relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <NeuralBackground />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full flex-grow flex items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-2xl overflow-hidden w-full border border-slate-100 flex flex-col md:flex-row"
        >
          {/* Left Side - Info */}
          <div className="md:w-1/3 bg-brand-ink p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-brand-cyan text-[10px] font-mono uppercase tracking-widest mb-6">
                  Join ITAP
                </span>
                <h1 className="text-3xl font-display font-bold mb-4 leading-tight">
                  Membership Application
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Join the prime mover in the Philippine ICT industry. Connect with leaders and influence the future of technology.
                </p>
                
                <ul className="space-y-4 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                    <span>Executive Networking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                    <span>Policy Advocacy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                    <span>Business Opportunities</span>
                  </li>
                </ul>
             </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-2/3 p-8 md:p-12">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-brand-ink mb-2">Application Initiated</h2>
                <p className="text-slate-500 text-sm mb-8">
                  Your email client should have opened with the application details. Please send the email to complete your application.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-brand-blue font-semibold hover:underline text-sm"
                >
                  Back to form
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fullname</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Juan Dela Cruz"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Company</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Tech Solutions Inc."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Designation / Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Chief Executive Officer"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="juan@company.com"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="+63 900 000 0000"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Company Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.company.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-ink text-white py-4 rounded-xl font-bold hover:bg-brand-blue transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinMembership;

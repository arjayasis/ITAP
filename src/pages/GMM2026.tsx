import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Globe, 
  Mail, 
  CheckCircle2, 
  User,
  Building2,
  Briefcase,
  Phone
} from 'lucide-react';
import { Footer } from '../App';

interface FormData {
  company: string;
  name: string;
  position: string;
  email: string;
  mobile: string;
  attendance: 'yes' | 'no' | '';
}

interface FormErrors {
  company?: string;
  name?: string;
  position?: string;
  email?: string;
  attendance?: string;
}

const GMM2026 = () => {
  const [formData, setFormData] = useState<FormData>({
    company: '',
    name: '',
    position: '',
    email: '',
    mobile: '',
    attendance: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'company':
        return !value.trim() ? 'Company is required' : undefined;
      case 'name':
        return !value.trim() ? 'Name is required' : undefined;
      case 'position':
        return !value.trim() ? 'Position is required' : undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return undefined;
      case 'attendance':
        return !value ? 'Please confirm your attendance' : undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name as keyof FormData, value)
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name as keyof FormData, value)
    }));
  };

  const isFormValid = () => {
    const newErrors: FormErrors = {
      company: validateField('company', formData.company),
      name: validateField('name', formData.name),
      position: validateField('position', formData.position),
      email: validateField('email', formData.email),
      attendance: validateField('attendance', formData.attendance)
    };

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors: FormErrors = {
      company: validateField('company', formData.company),
      name: validateField('name', formData.name),
      position: validateField('position', formData.position),
      email: validateField('email', formData.email),
      attendance: validateField('attendance', formData.attendance)
    };
    
    setErrors(newErrors);

    if (!Object.values(newErrors).some(error => error !== undefined)) {
      setIsSubmitting(true);
      
      try {
        // Use the serverless function instead of direct client-side fetch
        // This avoids CORS issues and hides the webhook URL
        const response = await fetch('/api/submit-rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to submit';
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              console.error('Error parsing error JSON:', e);
            }
          } else {
            // Handle non-JSON error responses (like 404 or 500 HTML pages)
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            errorMessage = `Server Error (${response.status}): ${response.statusText || 'Unknown Error'}`;
          }
          
          throw new Error(errorMessage);
        }
        
        setIsSubmitted(true);
      } catch (error: any) {
        console.error('Error submitting form:', error);
        alert(error.message || 'There was an error submitting your RSVP. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 md:pt-24 flex flex-col justify-between">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full flex-grow flex items-center mb-12 md:mb-24">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full border border-slate-100">
          
          {/* Left Column - Event Info (Dark/Premium Theme) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-5/12 bg-brand-ink text-white p-10 md:p-14 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-cyan text-[10px] font-mono uppercase tracking-[0.2em] mb-8">
                Official Invitation
              </span>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight tracking-tight">
                ITAP 1st General Membership Meeting <span className="text-brand-cyan">2026</span>
              </h1>
              <p className="text-lg text-slate-300 font-light mb-12 border-l-2 border-brand-cyan pl-4">
                A Gathering of Leaders, Members, and Partners
              </p>

              <div className="space-y-6 mb-12">
                <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400">Agenda Highlights</h3>
                <ul className="space-y-4">
                  {[
                    'Meet the New Board of Directors',
                    'Key Initiatives for 2026', 
                    'Launch of ITAP EDGE Program', 
                    'Induction of New Members'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 mb-12">
                <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400">Featured Speakers</h3>
                <div className="grid gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold font-display">SB</div>
                    <div>
                      <div className="font-bold text-white">Sunver Bastes</div>
                      <div className="text-xs text-brand-cyan uppercase tracking-wider">ITAP President</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Opening Remarks</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold font-display">MC</div>
                    <div>
                      <div className="font-bold text-white">Merrick Chua</div>
                      <div className="text-xs text-brand-blue uppercase tracking-wider">ITAP Vice President</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Closing Remarks</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center text-slate-300 font-bold font-display">DL</div>
                    <div>
                      <div className="font-bold text-white">Dennis John Lumbao</div>
                      <div className="text-xs text-slate-300 uppercase tracking-wider">ITAP Board of Trustee</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Session Host</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto pt-8 border-t border-white/10">
              <div className="space-y-1">
                <div className="text-brand-cyan mb-2"><Calendar className="w-5 h-5" /></div>
                <div className="font-bold text-sm">April 28, 2026</div>
                <div className="text-xs text-slate-400">2:00 PM – 5:00 PM</div>
              </div>
              <div className="space-y-1">
                <div className="text-brand-cyan mb-2"><MapPin className="w-5 h-5" /></div>
                <div className="font-bold text-sm">Manila Golf & CC</div>
                <div className="text-xs text-slate-400">Makati City</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form (Clean/Light Theme) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-7/12 p-10 md:p-14 bg-white flex flex-col justify-center"
          >
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-brand-ink mb-4">RSVP Confirmed</h2>
                  <p className="text-slate-600 text-lg">
                    Thank you for your response. Your RSVP has been recorded.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ company: '', name: '', position: '', email: '', mobile: '', attendance: '' });
                      setTouched({});
                    }}
                    className="mt-8 text-brand-blue font-semibold hover:underline"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-10">
                    <h2 className="text-3xl font-display font-bold text-brand-ink mb-3">Confirm Attendance</h2>
                    <p className="text-slate-500">Please fill out the form below to secure your spot.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Attendance Radio */}
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-brand-ink uppercase tracking-wider">
                        Will you be attending? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all flex-1 ${formData.attendance === 'yes' ? 'border-brand-cyan bg-brand-cyan/5 shadow-md' : 'border-slate-100 hover:border-brand-cyan/30 bg-white'}`}>
                          <input 
                            type="radio" 
                            name="attendance" 
                            value="yes" 
                            checked={formData.attendance === 'yes'}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-5 h-5 text-brand-cyan focus:ring-brand-cyan border-slate-300"
                          />
                          <span className="font-bold text-slate-800">Yes, I will attend</span>
                        </label>
                        <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all flex-1 ${formData.attendance === 'no' ? 'border-slate-300 bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                          <input 
                            type="radio" 
                            name="attendance" 
                            value="no" 
                            checked={formData.attendance === 'no'}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-5 h-5 text-slate-600 focus:ring-slate-500 border-slate-300"
                          />
                          <span className="font-bold text-slate-800">No, I cannot attend</span>
                        </label>
                      </div>
                      {touched.attendance && errors.attendance && (
                        <p className="text-red-500 text-xs font-medium">{errors.attendance}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                      {/* Name */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`block w-full pl-12 pr-4 py-4 border-2 ${touched.name && errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-100 focus:ring-brand-cyan focus:border-brand-cyan'} rounded-2xl bg-slate-50 focus:bg-white transition-all text-base font-medium text-brand-ink`}
                            placeholder="Juan Dela Cruz"
                          />
                        </div>
                        {touched.name && errors.name && (
                          <p className="text-red-500 text-xs font-medium mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Company */}
                      <div className="space-y-2">
                        <label htmlFor="company" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building2 className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`block w-full pl-12 pr-4 py-4 border-2 ${touched.company && errors.company ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-100 focus:ring-brand-cyan focus:border-brand-cyan'} rounded-2xl bg-slate-50 focus:bg-white transition-all text-base font-medium text-brand-ink`}
                            placeholder="Company Name Inc."
                          />
                        </div>
                        {touched.company && errors.company && (
                          <p className="text-red-500 text-xs font-medium mt-1">{errors.company}</p>
                        )}
                      </div>

                      {/* Position */}
                      <div className="space-y-2">
                        <label htmlFor="position" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Position <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`block w-full pl-12 pr-4 py-4 border-2 ${touched.position && errors.position ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-100 focus:ring-brand-cyan focus:border-brand-cyan'} rounded-2xl bg-slate-50 focus:bg-white transition-all text-base font-medium text-brand-ink`}
                            placeholder="CEO / Director / Manager"
                          />
                        </div>
                        {touched.position && errors.position && (
                          <p className="text-red-500 text-xs font-medium mt-1">{errors.position}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`block w-full pl-12 pr-4 py-4 border-2 ${touched.email && errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-100 focus:ring-brand-cyan focus:border-brand-cyan'} rounded-2xl bg-slate-50 focus:bg-white transition-all text-base font-medium text-brand-ink`}
                            placeholder="juan@company.com"
                          />
                        </div>
                        {touched.email && errors.email && (
                          <p className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>
                        )}
                      </div>

                      {/* Mobile (Optional) */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="mobile" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Mobile Number <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="tel"
                            id="mobile"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="block w-full pl-12 pr-4 py-4 border-2 border-slate-100 focus:ring-brand-cyan focus:border-brand-cyan rounded-2xl bg-slate-50 focus:bg-white transition-all text-base font-medium text-brand-ink"
                            placeholder="+63 900 000 0000"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={!isFormValid() || isSubmitting}
                        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center ${
                          isFormValid() && !isSubmitting
                            ? 'bg-brand-ink text-white hover:bg-brand-blue hover:shadow-brand-blue/20 hover:-translate-y-1' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Submit RSVP'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default GMM2026;

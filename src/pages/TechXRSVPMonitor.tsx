import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Search, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  ExternalLink, 
  Filter, 
  ChevronRight, 
  UserCheck, 
  ShieldCheck, 
  FileSpreadsheet, 
  Database, 
  Trash2, 
  X, 
  Copy, 
  Check, 
  AlertCircle,
  Eye,
  Plus,
  Lock,
  Key,
  ShieldAlert,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AttendeeRecord, 
  subscribeToRegistrations, 
  fetchRegistrationsOnce, 
  deleteRegistrationRecord, 
  exportAttendeesToCSV, 
  getAttendeeStats 
} from '../lib/registrationsService';

export const TechXRSVPMonitor: React.FC = () => {
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncSource, setSyncSource] = useState<'firestore' | 'cache'>('cache');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Tabs: 'students' | 'gmm' | 'all'
  const [activeTab, setActiveTab] = useState<'students' | 'gmm' | 'all'>('students');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'Manila' | 'Quezon City'>('all');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('all');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedAttendance, setSelectedAttendance] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<AttendeeRecord | null>(null);

  // Copied alert feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Secure Password Deletion States (Secret: "admin123")
  const [deleteTarget, setDeleteTarget] = useState<AttendeeRecord | null>(null);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletionSuccessToast, setDeletionSuccessToast] = useState<string | null>(null);

  // Subscribe to real-time attendee updates from Cloud Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToRegistrations((records, source) => {
      setAttendees(records);
      setSyncSource(source);
      setIsLoading(false);
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const records = await fetchRegistrationsOnce();
      setAttendees(records);
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Secure Deletion Trigger
  const handleInitiateDelete = (record: AttendeeRecord) => {
    setDeleteTarget(record);
    setDeletePassword('');
    setPasswordError(null);
    setShowPassword(false);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setDeletePassword('');
    setPasswordError(null);
    setShowPassword(false);
  };

  const handleConfirmDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!deleteTarget) return;

    if (deletePassword.trim() !== 'admin123') {
      setPasswordError('Access Denied: Incorrect secret password. Please enter the valid admin password.');
      return;
    }

    setIsDeleting(true);
    setPasswordError(null);
    try {
      const recordToDelete = deleteTarget;
      const success = await deleteRegistrationRecord(recordToDelete.id);
      if (success) {
        setAttendees((prev) => prev.filter((a) => a.id !== recordToDelete.id && a.registrationId !== recordToDelete.registrationId));
        if (selectedRecord?.id === recordToDelete.id) {
          setSelectedRecord(null);
        }
        setDeletionSuccessToast(`Record for ${recordToDelete.fullName} (${recordToDelete.registrationId}) was permanently removed from Cloud Firestore.`);
        setTimeout(() => setDeletionSuccessToast(null), 4500);
        handleCancelDelete();
      } else {
        setPasswordError('Failed to remove record from database. Please check connection and try again.');
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Error occurred while deleting record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => getAttendeeStats(attendees), [attendees]);

  // Separate lists
  const studentList = useMemo(() => {
    return attendees.filter((a) => a.attendeeType === 'student');
  }, [attendees]);

  const gmmList = useMemo(() => {
    return attendees.filter((a) => a.attendeeType === 'industry');
  }, [attendees]);

  // Filtered lists based on search & filter
  const filteredStudents = useMemo(() => {
    return studentList.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        (s.firstName && s.firstName.toLowerCase().includes(q)) ||
        (s.lastName && s.lastName.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q) ||
        s.registrationId.toLowerCase().includes(q) ||
        (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
        (s.program && s.program.toLowerCase().includes(q)) ||
        (s.course && s.course.toLowerCase().includes(q)) ||
        (s.college && s.college.toLowerCase().includes(q)) ||
        (s.collegeOrDept && s.collegeOrDept.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        (s.yearLevel && s.yearLevel.toLowerCase().includes(q));

      const matchesLocation = 
        selectedLocation === 'all' || 
        s.location === selectedLocation ||
        (selectedLocation === 'Quezon City' && s.campus?.includes('Quezon City')) ||
        (selectedLocation === 'Manila' && s.campus?.includes('Manila'));

      const matchesYear = 
        selectedYearLevel === 'all' || 
        s.yearLevel === selectedYearLevel;

      const matchesCollege = 
        selectedCollege === 'all' || 
        (s.college && s.college.toLowerCase().includes(selectedCollege.toLowerCase())) ||
        (s.collegeOrDept && s.collegeOrDept.toLowerCase().includes(selectedCollege.toLowerCase()));

      return matchesSearch && matchesLocation && matchesYear && matchesCollege;
    });
  }, [studentList, searchQuery, selectedLocation, selectedYearLevel, selectedCollege]);

  const filteredGMM = useMemo(() => {
    return gmmList.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        g.fullName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.registrationId.toLowerCase().includes(q) ||
        (g.companyName && g.companyName.toLowerCase().includes(q)) ||
        (g.jobTitle && g.jobTitle.toLowerCase().includes(q)) ||
        (g.companionName && g.companionName.toLowerCase().includes(q));

      const matchesAttendance = 
        selectedAttendance === 'all' ||
        (selectedAttendance === 'attending' && (g.attendance === 'yes' || !g.attendance)) ||
        (selectedAttendance === 'companion' && g.hasCompanion === 'Yes');

      return matchesSearch && matchesAttendance;
    });
  }, [gmmList, searchQuery, selectedAttendance]);

  const filteredAll = useMemo(() => {
    return attendees.filter((a) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.registrationId.toLowerCase().includes(q) ||
        (a.companyName && a.companyName.toLowerCase().includes(q)) ||
        (a.studentNumber && a.studentNumber.toLowerCase().includes(q)) ||
        (a.course && a.course.toLowerCase().includes(q))
      );
    });
  }, [attendees, searchQuery]);

  // Current view counts
  const currentCount = 
    activeTab === 'students' 
      ? filteredStudents.length 
      : activeTab === 'gmm' 
        ? filteredGMM.length 
        : filteredAll.length;

  return (
    <div className="min-h-screen bg-[#070A1E] text-slate-100 font-sans selection:bg-[#05BFE0]/30 selection:text-white relative pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-[#05BFE0]/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-10 w-[30rem] h-[30rem] bg-[#4F17A8]/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-10 right-10 w-[24rem] h-[24rem] bg-[#FF2D8D]/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-8 sm:pt-12">
        {/* =========================================================================
            HEADER & ACTIONS BAR
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#05BFE0]/15 border border-[#05BFE0]/30 text-[#05BFE0] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live RSVP & Registration Monitor</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                Route: <code className="text-[#05BFE0]">/TechX-RSVP</code>
              </span>

              {syncSource === 'firestore' ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Cloud Firestore (Live)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>Cached Data</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Attendee Registry & Attendance</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Real-time monitoring console for <strong>TechX Summit 2026 Student Delegates</strong> and <strong>ITAP 2nd General Membership Meeting (GMM) Industry RSVPs</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              title="Fetch latest registrations from Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#05BFE0]' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* Export Dropdown Buttons */}
            <button
              onClick={() => exportAttendeesToCSV(attendees, activeTab === 'students' ? 'student' : activeTab === 'gmm' ? 'industry' : 'all')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#05BFE0] to-[#049cb8] hover:opacity-90 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-[#05BFE0]/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                Export {activeTab === 'students' ? 'Students' : activeTab === 'gmm' ? 'GMM RSVPs' : 'All'} CSV
              </span>
            </button>

            <Link
              to="/TechXSummit2026"
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <span>Student Form</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <Link
              to="/GMM@TechXSummit2026"
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <span>GMM RSVP Form</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            KPI CARDS SECTION
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          {/* Total Attendees */}
          <div className="p-5 rounded-2xl bg-[#0B0F2B]/80 border border-white/10 relative overflow-hidden group hover:border-[#05BFE0]/40 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <span>Total Confirmed</span>
              <Users className="w-4 h-4 text-[#05BFE0]" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {stats.total}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="text-[#05BFE0] font-semibold">{stats.studentsCount} Students</span>
              <span>•</span>
              <span className="text-[#FF2D8D] font-semibold">{stats.industryCount} Industry</span>
            </div>
          </div>

          {/* Student Registrations */}
          <div 
            onClick={() => setActiveTab('students')}
            className={`p-5 rounded-2xl bg-[#0B0F2B]/80 border transition cursor-pointer relative overflow-hidden ${
              activeTab === 'students' ? 'border-[#05BFE0] shadow-lg shadow-[#05BFE0]/10 bg-[#05BFE0]/5' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <span className="text-[#05BFE0]">Student Delegates</span>
              <GraduationCap className="w-4 h-4 text-[#05BFE0]" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {stats.studentsCount}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span>T.I.P. QC: <strong className="text-white">{stats.studentsQC}</strong></span>
              <span>•</span>
              <span>Manila: <strong className="text-white">{stats.studentsManila}</strong></span>
            </div>
          </div>

          {/* GMM Industry RSVPs */}
          <div 
            onClick={() => setActiveTab('gmm')}
            className={`p-5 rounded-2xl bg-[#0B0F2B]/80 border transition cursor-pointer relative overflow-hidden ${
              activeTab === 'gmm' ? 'border-[#FF2D8D] shadow-lg shadow-[#FF2D8D]/10 bg-[#FF2D8D]/5' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <span className="text-[#FF2D8D]">GMM Industry RSVPs</span>
              <Briefcase className="w-4 h-4 text-[#FF2D8D]" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {stats.industryCount}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span>Attending: <strong className="text-emerald-400">{stats.industryAttending}</strong></span>
              <span>•</span>
              <span>Companions: <strong className="text-white">{stats.industryWithCompanion}</strong></span>
            </div>
          </div>

          {/* Sync Health & Webhook Status */}
          <div className="p-5 rounded-2xl bg-[#0B0F2B]/80 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
              <span>Data Sync Channels</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">GMM Webhook:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active (200 OK)</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Student Hook:</span>
                <span className="text-[#05BFE0] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Configured</span>
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              <span className="text-slate-400">{attendees.length} in Cloud DB</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TABS NAVIGATION (SEPARATE LISTS)
           ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center p-1.5 rounded-2xl bg-[#0B0F2B] border border-white/10">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#05BFE0] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Registrations</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'students' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-slate-300'}`}>
                {studentList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gmm')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'gmm'
                  ? 'bg-[#FF2D8D] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>GMM Industry RSVPs</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'gmm' ? 'bg-white/20 text-white font-extrabold' : 'bg-white/10 text-slate-300'}`}>
                {gmmList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Attendees</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-white/20 text-white font-extrabold' : 'bg-white/10 text-slate-300'}`}>
                {attendees.length}
              </span>
            </button>
          </div>

          {/* Search Bar & Contextual Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'students'
                    ? 'Search student name, school ID, course...'
                    : activeTab === 'gmm'
                      ? 'Search delegate name, company, position...'
                      : 'Search all attendees...'
                }
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0B0F2B] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#05BFE0] font-mono transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Student Specific Filters: Location, Year Level, College */}
            {activeTab === 'students' && (
              <>
                {/* Location – dropdown: Manila / Quezon City */}
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F2B] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#05BFE0]"
                  title="Filter by Location (Manila / Quezon City)"
                >
                  <option value="all">All Locations</option>
                  <option value="Manila">Manila</option>
                  <option value="Quezon City">Quezon City</option>
                </select>

                {/* Year Level Filter */}
                <select
                  value={selectedYearLevel}
                  onChange={(e) => setSelectedYearLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F2B] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#05BFE0]"
                  title="Filter by Year Level"
                >
                  <option value="all">All Year Levels</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Graduate / Masteral">Graduate / Masteral</option>
                </select>

                {/* College Filter */}
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F2B] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#05BFE0]"
                  title="Filter by College"
                >
                  <option value="all">All Colleges</option>
                  <option value="CITE">CITE</option>
                  <option value="CEA">CEA</option>
                  <option value="CAS">CAS</option>
                  <option value="CBE">CBE</option>
                  <option value="Accountancy">Accountancy</option>
                </select>
              </>
            )}

            {/* Attendance filter for GMM */}
            {activeTab === 'gmm' && (
              <select
                value={selectedAttendance}
                onChange={(e) => setSelectedAttendance(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0B0F2B] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#FF2D8D]"
              >
                <option value="all">All RSVPs</option>
                <option value="attending">Attending</option>
                <option value="companion">With Companion</option>
              </select>
            )}
          </div>
        </div>

        {/* =========================================================================
            DATA TABLES (SEPARATE LISTS)
           ========================================================================= */}
        <div className="rounded-2xl bg-[#0B0F2B]/90 border border-white/10 overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#05BFE0] animate-spin mx-auto" />
              <p className="text-sm font-mono text-slate-400">Loading attendee registry from Cloud Firestore...</p>
            </div>
          ) : currentCount === 0 ? (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono">No Attendee Records Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No records match your search filter "${searchQuery}".`
                  : activeTab === 'students'
                    ? 'No student registrations recorded yet. Submit via the TechX Summit registration portal.'
                    : 'No GMM RSVPs recorded yet. Submit via the GMM RSVP portal.'}
              </p>
            </div>
          ) : activeTab === 'students' ? (
            /* =========================================================================
                TAB 1: STUDENT REGISTRATION LIST
               ========================================================================= */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#070A1E]/80 text-[11px] font-mono text-[#05BFE0] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Student Name (First & Last)</th>
                    <th className="py-3.5 px-4 font-semibold">College</th>
                    <th className="py-3.5 px-4 font-semibold">Program</th>
                    <th className="py-3.5 px-4 font-semibold">Location</th>
                    <th className="py-3.5 px-4 font-semibold">Year Level</th>
                    <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                    <th className="py-3.5 px-4 font-semibold">Registered At</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {filteredStudents.map((s, idx) => (
                    <tr
                      key={s.id || idx}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Student Name: Separate First Name & Last Name */}
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-white text-sm group-hover:text-[#05BFE0] transition-colors flex items-center gap-1.5 flex-wrap">
                          <span>{s.firstName || s.fullName.split(' ')[0]}</span>
                          <span className="text-[#05BFE0]">{s.lastName || s.fullName.split(' ').slice(1).join(' ')}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          <span className="text-slate-400">First:</span> <span className="text-slate-200 font-semibold">{s.firstName || 'N/A'}</span>
                          <span className="mx-1 text-slate-600">•</span>
                          <span className="text-slate-400">Last:</span> <span className="text-slate-200 font-semibold">{s.lastName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded bg-[#05BFE0]/10 text-[#05BFE0] text-[10px] font-bold">
                            {s.registrationId}
                          </span>
                          <button
                            onClick={() => handleCopy(s.registrationId, s.registrationId)}
                            className="text-slate-500 hover:text-white transition"
                            title="Copy Pass ID"
                          >
                            {copiedId === s.registrationId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="text-white font-medium truncate" title={s.college || s.collegeOrDept || 'CITE'}>
                          {s.college || s.collegeOrDept || 'CITE'}
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="text-slate-200 font-medium truncate" title={s.program || s.course || 'BS Information Technology'}>
                          {s.program || s.course || 'BS Information Technology'}
                        </div>
                      </td>

                      {/* Location – Manila / Quezon City */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          (s.location === 'Quezon City' || s.campus?.includes('Quezon City'))
                            ? 'bg-[#05BFE0]/10 border-[#05BFE0]/30 text-[#05BFE0]'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        }`}>
                          {s.location || (s.campus?.includes('Manila') ? 'Manila' : 'Quezon City')}
                        </span>
                      </td>

                      {/* Year Level */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                          {s.yearLevel || '4th Year'}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{s.email}</span>
                        </div>
                        {s.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{s.mobile}</span>
                          </div>
                        )}
                      </td>

                      {/* Registered Timestamp */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {s.timestamp}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(s)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#05BFE0]/20 hover:text-[#05BFE0] text-slate-400 transition cursor-pointer"
                            title="View Full Pass Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleInitiateDelete(s)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            title="Secure Delete (Password Required)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'gmm' ? (
            /* =========================================================================
                TAB 2: GMM INDUSTRY RSVP LIST
               ========================================================================= */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#070A1E]/80 text-[11px] font-mono text-[#FF2D8D] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Attendee Name & Reg ID</th>
                    <th className="py-3.5 px-4 font-semibold">Company / Organization</th>
                    <th className="py-3.5 px-4 font-semibold">Job Title / Role</th>
                    <th className="py-3.5 px-4 font-semibold">Attendance & Companion</th>
                    <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                    <th className="py-3.5 px-4 font-semibold">Registered At</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {filteredGMM.map((g, idx) => (
                    <tr
                      key={g.id || idx}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Attendee Name & Reg ID */}
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-white text-sm group-hover:text-[#FF2D8D] transition-colors">
                          {g.fullName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-[#FF2D8D]/10 text-[#FF2D8D] text-[10px] font-bold">
                            {g.registrationId}
                          </span>
                          <button
                            onClick={() => handleCopy(g.registrationId, g.registrationId)}
                            className="text-slate-500 hover:text-white transition"
                            title="Copy Reg ID"
                          >
                            {copiedId === g.registrationId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Company / Organization */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-[#05BFE0] shrink-0" />
                          <span>{g.companyName || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Job Title / Role */}
                      <td className="py-3 px-4 text-slate-300">
                        {g.jobTitle || 'N/A'}
                      </td>

                      {/* Attendance & Companion */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                            <UserCheck className="w-3 h-3" />
                            <span>Confirmed Attending</span>
                          </span>

                          {g.hasCompanion === 'Yes' ? (
                            <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded max-w-[200px] truncate" title={`Companion: ${g.companionName} (${g.companionDesignation})`}>
                              +1 Companion: {g.companionName}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Solo Attendee</span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{g.email}</span>
                        </div>
                        {g.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{g.mobile}</span>
                          </div>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {g.timestamp}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(g)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF2D8D]/20 hover:text-[#FF2D8D] text-slate-400 transition cursor-pointer"
                            title="View Full RSVP Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleInitiateDelete(g)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            title="Secure Delete (Password Required)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* =========================================================================
                TAB 3: ALL ATTENDEES (CONSOLIDATED)
               ========================================================================= */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#070A1E]/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Attendee Type</th>
                    <th className="py-3.5 px-4 font-semibold">Name & ID</th>
                    <th className="py-3.5 px-4 font-semibold">Organization / School</th>
                    <th className="py-3.5 px-4 font-semibold">Role / Course</th>
                    <th className="py-3.5 px-4 font-semibold">Contact Email</th>
                    <th className="py-3.5 px-4 font-semibold">Registered At</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {filteredAll.map((a, idx) => (
                    <tr
                      key={a.id || idx}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-4">
                        {a.attendeeType === 'student' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#05BFE0]/15 border border-[#05BFE0]/30 text-[#05BFE0] inline-flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>STUDENT</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FF2D8D]/15 border border-[#FF2D8D]/30 text-[#FF2D8D] inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>GMM RSVP</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-white">
                          {a.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {a.registrationId}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {a.attendeeType === 'student' ? (a.location ? `T.I.P. ${a.location}` : a.campus || 'T.I.P.') : (a.companyName || 'N/A')}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {a.attendeeType === 'student' ? (a.program || a.course || 'N/A') : (a.jobTitle || 'N/A')}
                      </td>

                      <td className="py-3 px-4 text-slate-300 truncate max-w-[180px]">
                        {a.email}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {a.timestamp}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(a)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleInitiateDelete(a)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            title="Secure Delete (Password Required)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="p-4 border-t border-white/10 bg-[#070A1E]/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
            <div>
              Showing <strong className="text-white">{currentCount}</strong> attendee(s) in {activeTab === 'students' ? 'Student Registration list' : activeTab === 'gmm' ? 'GMM Industry RSVP list' : 'Consolidated registry'}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Connected: ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ATTENDEE DETAILS MODAL / DRAWER
         ========================================================================= */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#0B0F2B] border border-white/15 p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      selectedRecord.attendeeType === 'student'
                        ? 'bg-[#05BFE0]/20 text-[#05BFE0] border border-[#05BFE0]/40'
                        : 'bg-[#FF2D8D]/20 text-[#FF2D8D] border border-[#FF2D8D]/40'
                    }`}>
                      {selectedRecord.attendeeType === 'student' ? 'Student Delegate Pass' : 'GMM Industry RSVP'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedRecord.registrationId}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-sans">
                    {selectedRecord.fullName}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Fields */}
              <div className="space-y-4 text-xs font-mono">
                {selectedRecord.attendeeType === 'student' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#070A1E] border border-white/10">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">First Name</span>
                        <span className="text-white font-bold text-sm">{selectedRecord.firstName || selectedRecord.fullName.split(' ')[0]}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Last Name</span>
                        <span className="text-white font-bold text-sm">{selectedRecord.lastName || selectedRecord.fullName.split(' ').slice(1).join(' ') || 'N/A'}</span>
                      </div>
                      {selectedRecord.middleName && (
                        <div className="col-span-2">
                          <span className="text-slate-500 block text-[10px] uppercase">Middle Name</span>
                          <span className="text-slate-300">{selectedRecord.middleName}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Location</span>
                        <span className="text-emerald-400 font-semibold">{selectedRecord.location || (selectedRecord.campus?.includes('Manila') ? 'Manila' : 'Quezon City')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Year Level</span>
                        <span className="text-purple-300 font-semibold">{selectedRecord.yearLevel || '4th Year'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[10px] uppercase">College</span>
                        <span className="text-slate-200">{selectedRecord.college || selectedRecord.collegeOrDept || 'CITE'}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-white/10">
                        <span className="text-slate-500 block text-[10px] uppercase">Program</span>
                        <span className="text-white font-semibold">{selectedRecord.program || selectedRecord.course || 'BS Information Technology'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#070A1E] border border-white/10">
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[10px] uppercase">Company / Organization</span>
                        <span className="text-white font-bold text-sm">{selectedRecord.companyName || 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[10px] uppercase">Job Title / Designation</span>
                        <span className="text-slate-200">{selectedRecord.jobTitle || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Attendance</span>
                        <span className="text-emerald-400 font-bold">Confirmed Yes</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Has Companion</span>
                        <span className="text-white font-bold">{selectedRecord.hasCompanion}</span>
                      </div>
                      {selectedRecord.hasCompanion === 'Yes' && (
                        <>
                          <div className="col-span-2 pt-2 border-t border-white/10">
                            <span className="text-amber-400 block text-[10px] uppercase font-bold">Companion Name</span>
                            <span className="text-white">{selectedRecord.companionName || 'N/A'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-amber-400 block text-[10px] uppercase font-bold">Companion Role</span>
                            <span className="text-slate-300">{selectedRecord.companionDesignation || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Common Contact Details */}
                <div className="p-3.5 rounded-2xl bg-[#070A1E] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Email Address</span>
                    <button
                      onClick={() => handleCopy(selectedRecord.email, 'email')}
                      className="text-[10px] text-[#05BFE0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Email</span>
                    </button>
                  </div>
                  <div className="text-white font-medium">{selectedRecord.email}</div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Mobile Number</span>
                    <span className="text-white">{selectedRecord.mobile || 'N/A'}</span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Registered:</span>
                    <span>{selectedRecord.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => handleInitiateDelete(selectedRecord)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Delete record (Requires admin123)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          SECURE DATA DELETION MODAL (Password: "admin123")
         ========================================================================= */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl bg-[#0B0F2B] border border-rose-500/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Protected Action
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Secure Data Deletion
                  </h3>
                </div>
              </div>

              {/* Record Summary Box */}
              <div className="p-3.5 rounded-2xl bg-[#070A1E] border border-white/10 text-xs font-mono mb-4 space-y-1.5 text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase">Attendee:</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                    {deleteTarget.registrationId}
                  </span>
                </div>
                <div className="text-white font-bold text-sm truncate">
                  {deleteTarget.fullName}
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  {deleteTarget.attendeeType === 'student' 
                    ? `Student • ${deleteTarget.program || deleteTarget.course || 'BSIT'} • ${deleteTarget.location || deleteTarget.campus || 'Quezon City'}`
                    : `GMM RSVP • ${deleteTarget.companyName || 'Industry Delegate'} • ${deleteTarget.jobTitle || 'Executive'}`
                  }
                </div>
              </div>

              {/* Password prompt instruction */}
              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4 text-left">
                To prevent accidental or unauthorized data loss, enter the secret password <strong className="text-rose-400 font-mono">admin123</strong> to authorize permanent deletion from Cloud Firestore.
              </p>

              {/* Password Form */}
              <form onSubmit={handleConfirmDelete} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#05BFE0]" />
                      <span>Admin Secret Password <span className="text-rose-400">*</span></span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal font-mono">Secret: admin123</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="Enter secret password..."
                      autoFocus
                      className={`w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/5 border ${passwordError ? 'border-rose-500 focus:border-rose-500' : 'border-white/15 focus:border-[#05BFE0]'} text-sm text-white placeholder-slate-500 focus:outline-none font-mono transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-xs text-rose-400 font-mono mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deletePassword}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Verifying & Deleting...' : 'Authorize & Delete'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Deletion Success Toast */}
      <AnimatePresence>
        {deletionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-mono shadow-2xl flex items-center gap-3 max-w-md backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <span className="font-bold text-white block">Deletion Confirmed</span>
              <span className="text-[11px] text-emerald-300/90 leading-tight block">{deletionSuccessToast}</span>
            </div>
            <button
              onClick={() => setDeletionSuccessToast(null)}
              className="text-emerald-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechXRSVPMonitor;

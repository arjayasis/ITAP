import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Search,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CameraOff,
  RefreshCw,
  X,
  ArrowRight,
  Users,
  UserCheck,
  RotateCcw,
  Sparkles,
  Download,
  Printer,
  ChevronDown,
  FlipHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

import { 
  AttendeeRecord, 
  subscribeToRegistrations, 
  fetchRegistrationsOnce 
} from '../lib/registrationsService';
import {
  TechXCheckin,
  StudentRecord,
  CheckinType,
  subscribeToCheckins,
  fetchCheckinsOnce,
  attendeeToStudentRecord,
  recordCheckin,
  registerWalkinStudent,
  playCheckinSuccessSound,
  playWarningSound,
  playErrorSound
} from '../lib/checkinService';

export const TechXRegistration: React.FC = () => {
  // Center Mode: 'scanner' (Big Camera QR Scanner) | 'event_qr' (Big Display QR Code for Attendees)
  const [centerMode, setCenterMode] = useState<'scanner' | 'event_qr'>('scanner');

  // Core Data States
  const [rawAttendees, setRawAttendees] = useState<AttendeeRecord[]>([]);
  const [checkins, setCheckins] = useState<TechXCheckin[]>([]);
  const [, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // QR Scanner States
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState<boolean>(false);
  const [isProcessingScan, setIsProcessingScan] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [mirrorCamera, setMirrorCamera] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('techx_scanner_mirror');
      return stored !== null ? stored === 'true' : true; // default to true (mirrored)
    } catch {
      return true;
    }
  });

  // Scan Outcome Results
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already_checked_in' | 'not_found' | 'invalid_format';
    student?: StudentRecord;
    checkin?: TechXCheckin;
    previousCheckin?: TechXCheckin;
    scannedText: string;
    timestamp: string;
  } | null>(null);

  // Generated Big Event Registration QR Code Data URL
  const [eventQrDataUrl, setEventQrDataUrl] = useState<string>('');

  // Optional Staff Drawer / Modal for Emergency Manual Search & Walk-in
  const [staffModalOpen, setStaffModalOpen] = useState<boolean>(false);
  const [staffTab, setStaffTab] = useState<'search' | 'walkin'>('search');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [walkinForm, setWalkinForm] = useState({
    firstName: '',
    lastName: '',
    college: 'College of Information Technology Education (CITE)',
    program: 'BS Information Technology',
    location: 'Quezon City',
    yearLevel: '4th Year',
    email: '',
    phone: ''
  });
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState<boolean>(false);
  const [walkinError, setWalkinError] = useState<string | null>(null);
  const [walkinSuccessModal, setWalkinSuccessModal] = useState<{
    student: StudentRecord;
    checkin: TechXCheckin;
    qrDataUrl: string;
  } | null>(null);

  // Quick manual input if camera not available
  const [manualInputId, setManualInputId] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  // HTML5 QR Code Scanner instance reference
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'techx-big-qr-reader';
  const autoNextTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // ---------------------------------------------------------------------------
  // Data Subscriptions
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setIsLoading(true);

    const unsubAttendees = subscribeToRegistrations((records) => {
      setRawAttendees(records);
      setIsLoading(false);
    });

    const unsubCheckins = subscribeToCheckins((checkinRecords) => {
      setCheckins(checkinRecords);
    });

    return () => {
      unsubAttendees();
      unsubCheckins();
    };
  }, []);

  // Compute Fast Lookup Map for Check-ins
  const checkinMap = useMemo(() => {
    const map = new Map<string, TechXCheckin>();
    checkins.forEach((c) => {
      if (c.student_id) {
        map.set(c.student_id.trim().toUpperCase(), c);
      }
    });
    return map;
  }, [checkins]);

  // Compute Students List
  const studentsList = useMemo(() => {
    return rawAttendees
      .filter((a) => a.attendeeType === 'student' || (!a.attendeeType && (a.studentNumber || a.registrationId?.startsWith('TIP-TX-'))))
      .map((a) => attendeeToStudentRecord(a, checkinMap));
  }, [rawAttendees, checkinMap]);

  const totalRegistered = studentsList.length;
  const totalCheckedIn = checkins.length;

  // Generate Event Registration QR Code for display mode
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://techx.tip.edu.ph';
    const regUrl = `${origin}/TechXSummit2026`;
    QRCode.toDataURL(regUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#030712',
        light: '#FFFFFF'
      }
    }).then((url) => {
      setEventQrDataUrl(url);
    }).catch((err) => {
      console.warn('QR generation notice:', err);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Camera Scanner Lifecycle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (centerMode === 'scanner') {
      // Auto-start camera scanner after DOM node is mounted
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
        clearCountdownTimers();
      };
    } else {
      stopScanner();
      clearCountdownTimers();
    }
  }, [centerMode]);

  const clearCountdownTimers = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdownSeconds(null);
  };

  const startScanner = async () => {
    setScannerError(null);
    setCameraPermissionDenied(false);

    try {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch {
          // ignore
        }
      }

      const container = document.getElementById(scannerContainerId);
      if (!container) return;

      const qrScanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleQrCodeScanned(decodedText);
        },
        () => {
          // ignore continuous scanning frame misses
        }
      );

      setScannerActive(true);
    } catch (err: any) {
      console.warn('Big QR scanner camera start:', err);
      setScannerActive(false);
      const msg = err?.message || String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
        setCameraPermissionDenied(true);
        setScannerError('Camera permission denied.');
      } else {
        setScannerError('Camera not available on this device.');
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.warn('Scanner stop notice:', e);
      }
    }
    setScannerActive(false);
  };

  // ---------------------------------------------------------------------------
  // Check-In Processing
  // ---------------------------------------------------------------------------
  const processStudentCheckin = async (
    rawInput: string,
    checkinType: CheckinType = 'qr_scan'
  ) => {
    if (isProcessingScan) return;
    setIsProcessingScan(true);
    clearCountdownTimers();

    const timestampStr = new Date().toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const match = rawInput.match(/TIP-TX-[A-Za-z0-9]+/i);
    const normalizedQrId = match ? match[0].toUpperCase() : rawInput.trim().toUpperCase();

    if (!normalizedQrId || !normalizedQrId.startsWith('TIP-TX-')) {
      playErrorSound();
      setScanResult({
        status: 'invalid_format',
        scannedText: rawInput,
        timestamp: timestampStr
      });
      setIsProcessingScan(false);
      autoResetResult(3000);
      return;
    }

    // 1. Check if already checked in
    const existingCheckin = checkinMap.get(normalizedQrId);
    if (existingCheckin) {
      playWarningSound();
      const student = studentsList.find((s) => s.qr_code_id.toUpperCase() === normalizedQrId);
      setScanResult({
        status: 'already_checked_in',
        student,
        checkin: existingCheckin,
        previousCheckin: existingCheckin,
        scannedText: normalizedQrId,
        timestamp: timestampStr
      });
      setIsProcessingScan(false);
      autoResetResult(4000);
      return;
    }

    // 2. Find student in database
    const student = studentsList.find((s) => s.qr_code_id.toUpperCase() === normalizedQrId);
    if (!student) {
      playErrorSound();
      setScanResult({
        status: 'not_found',
        scannedText: normalizedQrId,
        timestamp: timestampStr
      });
      setIsProcessingScan(false);
      autoResetResult(4000);
      return;
    }

    // 3. Process new check-in
    try {
      const result = await recordCheckin({
        student_id: normalizedQrId,
        checkin_type: checkinType,
        created_by: 'Entrance Desk',
        student
      });

      if (result.isAlreadyCheckedIn && result.previousCheckin) {
        playWarningSound();
        setScanResult({
          status: 'already_checked_in',
          student,
          checkin: result.previousCheckin,
          previousCheckin: result.previousCheckin,
          scannedText: normalizedQrId,
          timestamp: timestampStr
        });
        autoResetResult(4000);
      } else if (result.success && result.checkin) {
        playCheckinSuccessSound();
        setScanResult({
          status: 'success',
          student: {
            ...student,
            isCheckedIn: true,
            checkedInAt: result.checkin.checked_in_at,
            checkinType
          },
          checkin: result.checkin,
          scannedText: normalizedQrId,
          timestamp: timestampStr
        });
        autoResetResult(3000);
      }
    } catch (err) {
      console.error('Check-in error:', err);
      playErrorSound();
    } finally {
      setIsProcessingScan(false);
    }
  };

  const autoResetResult = (delayMs: number = 3000) => {
    let secondsLeft = Math.ceil(delayMs / 1000);
    setCountdownSeconds(secondsLeft);

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setCountdownSeconds(secondsLeft);
      } else {
        clearInterval(countdownIntervalRef.current);
        setCountdownSeconds(null);
      }
    }, 1000);

    autoNextTimerRef.current = setTimeout(() => {
      handleResetScan();
    }, delayMs);
  };

  const handleQrCodeScanned = (decodedText: string) => {
    if (isProcessingScan || scanResult) return;
    processStudentCheckin(decodedText, 'qr_scan');
  };

  const handleResetScan = () => {
    clearCountdownTimers();
    setScanResult(null);
    setManualInputId('');
  };

  // Handle Manual Table Check-In Action
  const handleManualTableCheckin = async (student: StudentRecord) => {
    if (student.isCheckedIn) return;
    try {
      const res = await recordCheckin({
        student_id: student.qr_code_id,
        checkin_type: 'manual_search',
        created_by: 'Entrance Desk',
        student
      });
      if (res.success) {
        playCheckinSuccessSound();
      }
    } catch (err) {
      console.error('Manual check-in error:', err);
      playErrorSound();
    }
  };

  // Walk-in Registration Submission
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinError(null);

    if (!walkinForm.firstName.trim() || !walkinForm.lastName.trim()) {
      setWalkinError('Please enter both First Name and Last Name.');
      return;
    }
    if (!walkinForm.email.trim() || !walkinForm.email.includes('@')) {
      setWalkinError('Please enter a valid email address.');
      return;
    }
    if (!walkinForm.phone.trim()) {
      setWalkinError('Please enter a contact phone number.');
      return;
    }

    setIsSubmittingWalkin(true);
    try {
      const { student, checkin } = await registerWalkinStudent({
        first_name: walkinForm.firstName,
        last_name: walkinForm.lastName,
        college: walkinForm.college,
        program: walkinForm.program,
        location: walkinForm.location,
        year_level: walkinForm.yearLevel,
        email: walkinForm.email,
        phone: walkinForm.phone,
        created_by: 'Entrance Desk'
      });

      const qrDataUrl = await QRCode.toDataURL(student.qr_code_id, {
        width: 320,
        margin: 2,
        color: { dark: '#030712', light: '#FFFFFF' }
      });

      playCheckinSuccessSound();
      setWalkinSuccessModal({ student, checkin, qrDataUrl });
      setWalkinForm({
        firstName: '',
        lastName: '',
        college: 'College of Information Technology Education (CITE)',
        program: 'BS Information Technology',
        location: 'Quezon City',
        yearLevel: '4th Year',
        email: '',
        phone: ''
      });
    } catch (err: any) {
      setWalkinError(err?.message || 'Failed to complete walk-in.');
      playErrorSound();
    } finally {
      setIsSubmittingWalkin(false);
    }
  };

  // Filtered Students for Staff Lookup
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return studentsList.slice(0, 30);
    return studentsList.filter((s) => {
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.qr_code_id.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q)
      );
    }).slice(0, 50);
  }, [studentsList, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070A1E] text-slate-100 font-sans selection:bg-[#05BFE0]/30 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Ambient Cyber Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#05BFE0]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-1/4 w-[24rem] h-[24rem] bg-[#4F17A8]/15 rounded-full blur-[150px]" />
      </div>

      {/* =========================================================================
          MINIMAL HEADER: Clean branding & minimal live attendance status
         ========================================================================= */}
      <header className="relative z-10 w-full px-4 sm:px-8 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/TechXSummit2026"
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-mono"
            title="TechX Summit Portal"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#05BFE0]/50 transition">
              <QrCode className="w-4 h-4 text-[#00d2ff]" />
            </div>
            <span className="font-bold tracking-wider text-slate-200 hidden sm:inline">
              TECHX SUMMIT 2026
            </span>
          </Link>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Checked In: <strong className="text-white">{totalCheckedIn}</strong> of {totalRegistered}</span>
          </span>
        </div>

        {/* Minimal Mode Switch: Camera Scanner vs Display Event QR */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B0F2B] p-1 rounded-xl border border-white/10 shadow-lg">
            <button
              onClick={() => {
                setCenterMode('scanner');
                handleResetScan();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                centerMode === 'scanner'
                  ? 'bg-[#00d2ff] text-black shadow-md shadow-[#00d2ff]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Pass</span>
            </button>

            <button
              onClick={() => {
                setCenterMode('event_qr');
                handleResetScan();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                centerMode === 'event_qr'
                  ? 'bg-[#00d2ff] text-black shadow-md shadow-[#00d2ff]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Display QR</span>
            </button>
          </div>

          <Link
            to="/TechX-RSVP"
            className="hidden md:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono items-center gap-1.5 transition"
            title="RSVP Table"
          >
            <Users className="w-3.5 h-3.5 text-[#00d2ff]" />
          </Link>
        </div>
      </header>

      {/* =========================================================================
          THE CENTER STAGE: ONLY THE BIG QR IN THE MIDDLE
         ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 w-full max-w-xl mx-auto text-center">
        {/* Dynamic Mode Title */}
        <motion.div
          key={centerMode}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            {centerMode === 'scanner' ? (
              <>
                <Camera className="w-5 h-5 text-[#00d2ff]" />
                <span>Present Student Pass</span>
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5 text-[#00d2ff]" />
                <span>Scan to Register / RSVP</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {centerMode === 'scanner'
              ? 'Hold your printed or mobile QR code in front of the lens'
              : 'Scan using your smartphone camera to access the portal'}
          </p>
        </motion.div>

        {/* -------------------------------------------------------------------
            THE BIG QR CONTAINER (Square, Centered, High-Tech Frame)
           ------------------------------------------------------------------- */}
        <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square mx-auto">
          {/* Cyber Corner Reticles */}
          <div className="absolute -top-2 -left-2 w-7 h-7 border-t-4 border-l-4 border-[#00d2ff] rounded-tl-xl pointer-events-none z-20" />
          <div className="absolute -top-2 -right-2 w-7 h-7 border-t-4 border-r-4 border-[#00d2ff] rounded-tr-xl pointer-events-none z-20" />
          <div className="absolute -bottom-2 -left-2 w-7 h-7 border-b-4 border-l-4 border-[#00d2ff] rounded-bl-xl pointer-events-none z-20" />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 border-b-4 border-r-4 border-[#00d2ff] rounded-br-xl pointer-events-none z-20" />

          {/* Outer Glowing Border */}
          <div className="w-full h-full rounded-2xl bg-[#0B0F2B] border-2 border-[#00d2ff]/40 shadow-[0_0_40px_rgba(0,210,255,0.18)] overflow-hidden relative flex items-center justify-center">
            
            {/* VIEW 1: BIG QR CAMERA SCANNER */}
            {centerMode === 'scanner' && (
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {/* HTML5 QR Code Mount Node (mirrored horizontally via CSS for front/operator camera) */}
                <div
                  id={scannerContainerId}
                  className={`w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover ${
                    mirrorCamera ? 'camera-mirrored [&_video]:-scale-x-100' : ''
                  }`}
                />

                {/* Mirror Toggle Badge (Top Right of viewfinder) */}
                {scannerActive && !scanResult && (
                  <button
                    onClick={() => {
                      const next = !mirrorCamera;
                      setMirrorCamera(next);
                      try {
                        localStorage.setItem('techx_scanner_mirror', String(next));
                      } catch {}
                    }}
                    title={mirrorCamera ? 'Camera Mirrored (Click to unmirror)' : 'Camera Unmirrored (Click to mirror)'}
                    className={`absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium flex items-center gap-1.5 backdrop-blur-md border transition cursor-pointer ${
                      mirrorCamera
                        ? 'bg-[#00d2ff]/20 border-[#00d2ff]/40 text-[#00d2ff] hover:bg-[#00d2ff]/30'
                        : 'bg-black/60 border-white/20 text-slate-300 hover:text-white hover:bg-black/80'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{mirrorCamera ? 'Mirrored' : 'Normal'}</span>
                  </button>
                )}

                {/* Laser Sweep Animation when scanning is active */}
                {scannerActive && !scanResult && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                    <div className="w-[78%] h-[78%] border border-[#00d2ff]/40 rounded-xl relative">
                      {/* Sweeping laser line */}
                      <div className="absolute inset-x-0 h-0.5 bg-[#00d2ff] shadow-[0_0_15px_#00d2ff] animate-bounce top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Camera Inactive / Permission Denied Fallback */}
                {!scannerActive && !scanResult && (
                  <div className="absolute inset-0 bg-[#070A1E]/95 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-20 h-20 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff] mb-4">
                      <QrCode className="w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-white font-bold text-base">
                      {cameraPermissionDenied ? 'Camera Access Needed' : 'Camera Ready'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-mono">
                      {cameraPermissionDenied
                        ? 'Please allow camera permission in browser or enter ID manually.'
                        : 'Tap below to activate camera scanner.'}
                    </p>
                    <button
                      onClick={startScanner}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-[#00d2ff] hover:bg-[#05BFE0] text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00d2ff]/20 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: BIG DISPLAY QR CODE (Event Registration) */}
            {centerMode === 'event_qr' && (
              <div className="relative w-full h-full bg-white p-6 flex flex-col items-center justify-center select-none">
                {eventQrDataUrl ? (
                  <img
                    src={eventQrDataUrl}
                    alt="TechX Summit Registration QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-900 animate-pulse" />
                  </div>
                )}
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="px-3 py-0.5 rounded-full bg-slate-950 text-[#00d2ff] font-mono text-[10px] font-bold tracking-wider uppercase">
                    /TechXSummit2026
                  </span>
                </div>
              </div>
            )}

            {/* OVERLAY: INSTANT SCAN RESULT CARD (Replaces the center on scan) */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-30 p-6 flex flex-col justify-between text-left"
                  style={{
                    backgroundColor:
                      scanResult.status === 'success'
                        ? 'rgba(6, 78, 59, 0.96)'
                        : scanResult.status === 'already_checked_in'
                        ? 'rgba(120, 53, 15, 0.96)'
                        : 'rgba(136, 19, 55, 0.96)'
                  }}
                >
                  {/* Top Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {scanResult.status === 'success' && (
                        <div className="w-9 h-9 rounded-xl bg-emerald-400 text-black flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      {scanResult.status === 'already_checked_in' && (
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                      {scanResult.status === 'not_found' && (
                        <div className="w-9 h-9 rounded-xl bg-rose-400 text-black flex items-center justify-center">
                          <X className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-extrabold text-white">
                          {scanResult.status === 'success' && 'Checked In!'}
                          {scanResult.status === 'already_checked_in' && 'Already Checked In'}
                          {scanResult.status === 'not_found' && 'Pass Not Found'}
                          {scanResult.status === 'invalid_format' && 'Invalid QR Format'}
                        </div>
                        <div className="text-[11px] font-mono opacity-80 text-white">
                          {scanResult.status === 'already_checked_in'
                            ? `First logged: ${scanResult.previousCheckin?.checked_in_at || 'Earlier'}`
                            : scanResult.timestamp}
                        </div>
                      </div>
                    </div>

                    {/* Auto-Next Countdown Badge */}
                    {countdownSeconds !== null && (
                      <span className="px-2 py-0.5 rounded-full bg-black/40 text-white font-mono text-[11px] font-bold">
                        {countdownSeconds}s
                      </span>
                    )}
                  </div>

                  {/* Student Details in Middle of Card */}
                  <div className="my-auto py-2">
                    {scanResult.student ? (
                      <div>
                        <div className="text-lg sm:text-xl font-black text-white leading-tight">
                          {scanResult.student.fullName}
                        </div>
                        <div className="text-xs font-mono font-bold text-[#00d2ff] mt-0.5">
                          {scanResult.student.qr_code_id}
                        </div>
                        <div className="text-xs text-white/90 mt-2 font-medium">
                          {scanResult.student.program}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-black/30 text-white text-[10px] font-mono">
                            {scanResult.student.location}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-black/30 text-white text-[10px] font-mono">
                            {scanResult.student.year_level}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-white/80 font-mono">
                        Code: {scanResult.scannedText}
                        <p className="mt-1 text-white/70">
                          This code was not found in the TechX participant list.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action: Manual Dismiss / Next */}
                  <button
                    onClick={handleResetScan}
                    className="w-full py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Scan Next Guest</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Manual Keyboard ID Input Option (Subtle fallback beneath Big QR) */}
        <div className="mt-4">
          {!showManualInput ? (
            <button
              onClick={() => setShowManualInput(true)}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition underline decoration-dotted cursor-pointer"
            >
              Enter Pass ID manually
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInputId.trim()) {
                  processStudentCheckin(manualInputId, 'manual_search');
                }
              }}
              className="flex items-center gap-2 max-w-xs mx-auto"
            >
              <input
                type="text"
                value={manualInputId}
                onChange={(e) => setManualInputId(e.target.value)}
                placeholder="TIP-TX-XXXXXX"
                autoFocus
                className="w-full bg-[#0B0F2B] border border-white/20 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#00d2ff] text-black font-mono font-bold text-xs cursor-pointer"
              >
                Scan
              </button>
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* =========================================================================
          MINIMAL FOOTER: Subtle Staff Lookup & Walk-in Access
         ========================================================================= */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Gate 1 Entrance Desk</span>

        {/* Staff Tools Drawer Toggle */}
        <button
          onClick={() => setStaffModalOpen(true)}
          className="text-slate-400 hover:text-[#00d2ff] transition flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Staff Search & Walk-in</span>
        </button>
      </footer>

      {/* =========================================================================
          STAFF MODAL / DRAWER (Opens on-demand only for search or walk-in)
         ========================================================================= */}
      <AnimatePresence>
        {staffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0B0F2B] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStaffTab('search')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      staffTab === 'search'
                        ? 'bg-[#00d2ff] text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Manual Search
                  </button>
                  <button
                    onClick={() => setStaffTab('walkin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      staffTab === 'walkin'
                        ? 'bg-purple-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Walk-in Registration
                  </button>
                </div>

                <button
                  onClick={() => setStaffModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TAB A: MANUAL SEARCH */}
              {staffTab === 'search' && (
                <div className="flex-1 overflow-y-auto pt-4 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, email, phone, or TIP-TX-XXXXXX"
                      className="w-full bg-[#070A1E] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                    />
                  </div>

                  <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 font-mono">
                        No attendees found matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredStudents.map((s) => (
                        <div
                          key={s.id}
                          className="py-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{s.fullName}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              <span className="text-[#00d2ff]">{s.qr_code_id}</span> • {s.program}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {s.isCheckedIn ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Checked In</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleManualTableCheckin(s)}
                                className="px-3 py-1.5 rounded-lg bg-[#00d2ff] hover:bg-[#05BFE0] text-black font-mono font-bold text-[11px] transition cursor-pointer"
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB B: WALKIN FORM */}
              {staffTab === 'walkin' && (
                <form onSubmit={handleWalkinSubmit} className="flex-1 overflow-y-auto pt-4 space-y-3 text-xs">
                  {walkinError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono">
                      {walkinError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-mono mb-1 block">First Name</label>
                      <input
                        type="text"
                        required
                        value={walkinForm.firstName}
                        onChange={(e) => setWalkinForm({ ...walkinForm, firstName: e.target.value })}
                        className="w-full bg-[#070A1E] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-mono mb-1 block">Last Name</label>
                      <input
                        type="text"
                        required
                        value={walkinForm.lastName}
                        onChange={(e) => setWalkinForm({ ...walkinForm, lastName: e.target.value })}
                        className="w-full bg-[#070A1E] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-mono mb-1 block">Email</label>
                      <input
                        type="email"
                        required
                        value={walkinForm.email}
                        onChange={(e) => setWalkinForm({ ...walkinForm, email: e.target.value })}
                        className="w-full bg-[#070A1E] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-mono mb-1 block">Phone</label>
                      <input
                        type="tel"
                        required
                        value={walkinForm.phone}
                        onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                        className="w-full bg-[#070A1E] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-mono mb-1 block">Location</label>
                      <select
                        value={walkinForm.location}
                        onChange={(e) => setWalkinForm({ ...walkinForm, location: e.target.value })}
                        className="w-full bg-[#070A1E] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      >
                        <option value="Quezon City">Quezon City</option>
                        <option value="Manila">Manila</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 font-mono mb-1 block">Year Level</label>
                      <select
                        value={walkinForm.yearLevel}
                        onChange={(e) => setWalkinForm({ ...walkinForm, yearLevel: e.target.value })}
                        className="w-full bg-[#070A1E] border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingWalkin}
                    className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-mono font-bold text-xs mt-3 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmittingWalkin ? 'Registering...' : 'Register & Check In Walk-in'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Walk-in Success Confirmation Pass Modal */}
      <AnimatePresence>
        {walkinSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0B0F2B] border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Walk-in Registered!</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Attendance recorded in database
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 text-black flex flex-col items-center">
                <img
                  src={walkinSuccessModal.qrDataUrl}
                  alt="Pass QR"
                  className="w-40 h-40"
                />
                <span className="mt-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-[#00d2ff] font-mono text-xs font-bold">
                  {walkinSuccessModal.student.qr_code_id}
                </span>
                <div className="font-extrabold text-slate-900 mt-1">
                  {walkinSuccessModal.student.fullName}
                </div>
              </div>

              <button
                onClick={() => setWalkinSuccessModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#00d2ff] text-black font-mono font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechXRegistration;

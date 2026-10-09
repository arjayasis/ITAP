/**
 * TechX Summit 2026 - Event Check-In & Attendance Service
 * Connects to Cloud Firestore collection: `techx_checkins` and `techx_registrations`
 * Real-time synchronization, QR Code scanning, manual check-ins, and walk-in registrations.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';
import { AttendeeRecord, fetchRegistrationsOnce, normalizeAttendeeRecord } from './registrationsService';

export type CheckinType = 'qr_scan' | 'manual_search' | 'walkin';

export interface TechXCheckin {
  id: string;
  student_id: string;
  checkin_type: CheckinType;
  checked_in_at: string;
  created_by: string;
  createdAt: number;
  
  // Denormalized student details for instant access and analytics
  student_name?: string;
  first_name?: string;
  last_name?: string;
  college?: string;
  program?: string;
  location?: string;
  year_level?: string;
  email?: string;
  phone?: string;
}

export interface StudentRecord {
  id: string;
  qr_code_id: string;
  first_name: string;
  last_name: string;
  fullName: string;
  college: string;
  program: string;
  location: string;
  year_level: string;
  email: string;
  phone: string;
  created_at: number | string;
  attendeeType?: string;
  isCheckedIn?: boolean;
  checkedInAt?: string;
  checkinType?: CheckinType;
  checkinId?: string;
}

const STORAGE_KEY_CHECKINS_CACHE = 'techx_checkins_cache_v1';
const TARGET_DATABASE_ID = (appletConfig as any).firestoreDatabaseId || "ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676";

let checkinDb: Firestore | null = null;

function getCheckinFirestore(): Firestore | null {
  if (checkinDb) return checkinDb;

  try {
    const firebaseConfig = {
      apiKey: (appletConfig as any).apiKey || "AIzaSyAJneQTXa5VXi63r4Av8CgOk4gK3JBToi4",
      authDomain: (appletConfig as any).authDomain || "itap-db.firebaseapp.com",
      projectId: (appletConfig as any).projectId || "itap-db",
      storageBucket: (appletConfig as any).storageBucket || "itap-db.appspot.com",
      messagingSenderId: (appletConfig as any).messagingSenderId || "768834139783",
      appId: (appletConfig as any).appId || "1:768834139783:web:83ef2135331ba1dd4a6a22",
    };

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    checkinDb = initializeFirestore(app, {}, TARGET_DATABASE_ID);
    return checkinDb;
  } catch (err) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(appletConfig as any);
      checkinDb = getFirestore(app, TARGET_DATABASE_ID);
      return checkinDb;
    } catch (e2) {
      console.warn('Checkin Firestore initialization notice:', e2);
      return null;
    }
  }
}

/**
 * Normalizes a raw check-in record.
 */
export function normalizeCheckin(id: string, raw: any): TechXCheckin {
  const parsedCreatedAt = typeof raw.createdAt === 'number'
    ? raw.createdAt
    : (raw.createdAt?.toMillis ? raw.createdAt.toMillis() : Date.now());

  return {
    id: id || raw.id || `CHK-${Date.now()}`,
    student_id: (raw.student_id || raw.studentId || raw.qr_code_id || raw.registrationId || id).trim(),
    checkin_type: (raw.checkin_type || raw.checkinType || 'qr_scan') as CheckinType,
    checked_in_at: raw.checked_in_at || raw.checkedInAt || new Date(parsedCreatedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
    created_by: raw.created_by || raw.createdBy || 'Entrance Staff',
    createdAt: parsedCreatedAt,
    student_name: raw.student_name || raw.studentName || raw.fullName || '',
    first_name: raw.first_name || raw.firstName || '',
    last_name: raw.last_name || raw.lastName || '',
    college: raw.college || '',
    program: raw.program || raw.course || '',
    location: raw.location || raw.campus || '',
    year_level: raw.year_level || raw.yearLevel || '',
    email: raw.email || '',
    phone: raw.phone || raw.mobile || ''
  };
}

/**
 * Reads local cached checkins
 */
export function getCachedCheckins(): TechXCheckin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKINS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Cached checkins read error:', err);
  }
  return [];
}

/**
 * Saves checkins to local cache
 */
export function saveCachedCheckins(checkins: TechXCheckin[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHECKINS_CACHE, JSON.stringify(checkins));
  } catch (err) {
    console.warn('Failed to cache checkins:', err);
  }
}

/**
 * Subscribes to real-time check-in attendance records from Firestore
 */
export function subscribeToCheckins(callback: (checkins: TechXCheckin[]) => void): () => void {
  // First deliver cached data instantly for zero latency
  const cached = getCachedCheckins();
  if (cached.length > 0) {
    callback(cached);
  }

  const db = getCheckinFirestore();
  if (!db) {
    callback(cached);
    return () => {};
  }

  try {
    const colRef = collection(db, 'techx_checkins');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const records: TechXCheckin[] = [];
        snapshot.forEach((docSnap) => {
          records.push(normalizeCheckin(docSnap.id, docSnap.data()));
        });

        // Sort descending by checked_in_at / createdAt
        records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        saveCachedCheckins(records);
        callback(records);
      },
      (err) => {
        console.warn('Firestore onSnapshot checkin notice:', err);
        callback(getCachedCheckins());
      }
    );

    return unsub;
  } catch (err) {
    console.error('Failed to attach checkin listener:', err);
    return () => {};
  }
}

/**
 * Fetches all check-in records once from Firestore
 */
export async function fetchCheckinsOnce(): Promise<TechXCheckin[]> {
  const db = getCheckinFirestore();
  if (!db) return getCachedCheckins();

  try {
    const colRef = collection(db, 'techx_checkins');
    const snapshot = await getDocs(colRef);
    const records: TechXCheckin[] = [];
    snapshot.forEach((docSnap) => {
      records.push(normalizeCheckin(docSnap.id, docSnap.data()));
    });
    records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveCachedCheckins(records);
    return records;
  } catch (err) {
    console.warn('Error fetching checkins:', err);
    return getCachedCheckins();
  }
}

/**
 * Converts AttendeeRecord to standardized StudentRecord format
 */
export function attendeeToStudentRecord(attendee: AttendeeRecord, checkinMap?: Map<string, TechXCheckin>): StudentRecord {
  const qrId = (attendee.registrationId || attendee.id).trim();
  const checkin = checkinMap ? checkinMap.get(qrId.toUpperCase()) : undefined;

  const firstName = attendee.firstName || attendee.fullName.split(' ')[0] || '';
  const lastName = attendee.lastName || attendee.fullName.split(' ').slice(1).join(' ') || '';

  return {
    id: attendee.id || qrId,
    qr_code_id: qrId,
    first_name: firstName,
    last_name: lastName,
    fullName: attendee.fullName || `${firstName} ${lastName}`.trim(),
    college: attendee.college || attendee.collegeOrDept || 'College of Information Technology Education (CITE)',
    program: attendee.program || attendee.course || 'BS Information Technology',
    location: attendee.location || 'Quezon City',
    year_level: attendee.yearLevel || '4th Year',
    email: attendee.email || 'N/A',
    phone: attendee.mobile || 'N/A',
    created_at: attendee.createdAt || attendee.timestamp,
    attendeeType: attendee.attendeeType,
    isCheckedIn: !!checkin,
    checkedInAt: checkin?.checked_in_at,
    checkinType: checkin?.checkin_type,
    checkinId: checkin?.id
  };
}

/**
 * Finds a student by qr_code_id or ID from Firestore / local data
 */
export async function findStudentByQrCodeId(
  qrCodeId: string, 
  cachedStudents: StudentRecord[]
): Promise<StudentRecord | null> {
  const cleanId = qrCodeId.trim().toUpperCase();

  // 1. Check cached list
  const localMatch = cachedStudents.find(
    (s) => s.qr_code_id.toUpperCase() === cleanId || s.id.toUpperCase() === cleanId
  );
  if (localMatch) return localMatch;

  // 2. Query Firestore directly
  const db = getCheckinFirestore();
  if (!db) return null;

  try {
    // Try direct doc get
    const docRef = doc(db, 'techx_registrations', cleanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const attendee = normalizeAttendeeRecord(docSnap.id, docSnap.data());
      return attendeeToStudentRecord(attendee);
    }

    // Try query by registrationId
    const q = query(collection(db, 'techx_registrations'), where('registrationId', '==', cleanId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firstDoc = snap.docs[0];
      const attendee = normalizeAttendeeRecord(firstDoc.id, firstDoc.data());
      return attendeeToStudentRecord(attendee);
    }
  } catch (err) {
    console.warn('Error querying student doc:', err);
  }

  return null;
}

/**
 * Records an attendance check-in
 */
export async function recordCheckin(params: {
  student_id: string;
  checkin_type: CheckinType;
  created_by?: string;
  student?: StudentRecord | AttendeeRecord;
}): Promise<{
  success: boolean;
  isAlreadyCheckedIn: boolean;
  checkin?: TechXCheckin;
  previousCheckin?: TechXCheckin;
  error?: string;
}> {
  const cleanStudentId = params.student_id.trim().toUpperCase();
  const currentCheckins = getCachedCheckins();

  // 1. Check if already checked in locally or in current snapshot
  const existing = currentCheckins.find(
    (c) => c.student_id.toUpperCase() === cleanStudentId
  );

  if (existing) {
    return {
      success: false,
      isAlreadyCheckedIn: true,
      previousCheckin: existing
    };
  }

  const db = getCheckinFirestore();
  const now = Date.now();
  const nowString = new Date(now).toLocaleString('en-PH', { 
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const checkinId = `CHK-${cleanStudentId}-${now}`;
  const student = params.student;

  const newCheckin: TechXCheckin = {
    id: checkinId,
    student_id: cleanStudentId,
    checkin_type: params.checkin_type,
    checked_in_at: nowString,
    created_by: params.created_by || 'Entrance Desk Staff',
    createdAt: now,
    student_name: student?.fullName || (student as any)?.first_name ? `${(student as any).first_name} ${(student as any).last_name || ''}`.trim() : '',
    first_name: (student as any)?.first_name || (student as any)?.firstName || '',
    last_name: (student as any)?.last_name || (student as any)?.lastName || '',
    college: student?.college || '',
    program: student?.program || (student as any)?.course || '',
    location: student?.location || '',
    year_level: (student as any)?.year_level || (student as any)?.yearLevel || '',
    email: student?.email || '',
    phone: (student as any)?.phone || (student as any)?.mobile || ''
  };

  // Optimistically update cache
  const updatedCache = [newCheckin, ...currentCheckins.filter(c => c.student_id.toUpperCase() !== cleanStudentId)];
  saveCachedCheckins(updatedCache);

  if (db) {
    try {
      // Double check in Firestore before writing to prevent race conditions
      const checkinDocRef = doc(db, 'techx_checkins', checkinId);
      
      // Also query to make sure this student hasn't checked in
      const q = query(collection(db, 'techx_checkins'), where('student_id', '==', cleanStudentId));
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        const found = normalizeCheckin(existingSnap.docs[0].id, existingSnap.docs[0].data());
        return {
          success: false,
          isAlreadyCheckedIn: true,
          previousCheckin: found
        };
      }

      await setDoc(checkinDocRef, {
        id: checkinId,
        student_id: cleanStudentId,
        checkin_type: params.checkin_type,
        checked_in_at: nowString,
        created_by: params.created_by || 'Entrance Desk Staff',
        createdAt: now,
        student_name: newCheckin.student_name,
        first_name: newCheckin.first_name,
        last_name: newCheckin.last_name,
        college: newCheckin.college,
        program: newCheckin.program,
        location: newCheckin.location,
        year_level: newCheckin.year_level,
        email: newCheckin.email,
        phone: newCheckin.phone
      });
    } catch (err: any) {
      console.error('Error saving check-in to Firestore:', err);
      // Still keep optimistic local check-in
    }
  }

  return {
    success: true,
    isAlreadyCheckedIn: false,
    checkin: newCheckin
  };
}

/**
 * Undoes or deletes a check-in record
 */
export async function undoCheckin(checkinId: string): Promise<boolean> {
  const cached = getCachedCheckins();
  saveCachedCheckins(cached.filter((c) => c.id !== checkinId));

  const db = getCheckinFirestore();
  if (!db) return true;

  try {
    await deleteDoc(doc(db, 'techx_checkins', checkinId));
    return true;
  } catch (err) {
    console.error('Error removing check-in record:', err);
    return false;
  }
}

/**
 * Registers a Walk-in Student and automatically records their check-in
 */
export async function registerWalkinStudent(data: {
  first_name: string;
  last_name: string;
  college: string;
  program: string;
  location: string;
  year_level: string;
  email: string;
  phone: string;
  created_by?: string;
}): Promise<{
  student: StudentRecord;
  checkin: TechXCheckin;
}> {
  const db = getCheckinFirestore();
  const now = Date.now();

  // Generate unique ID format: TIP-TX-XXXXXX (random 6-digit number)
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000).toString();
  const generatedId = `TIP-TX-${randomSixDigits}`;

  const cleanFirstName = data.first_name.trim();
  const cleanLastName = data.last_name.trim();
  const fullName = `${cleanFirstName} ${cleanLastName}`.trim();
  const cleanEmail = data.email.trim();
  const cleanPhone = data.phone.trim();
  const cleanLocation = data.location.trim() || 'Quezon City';
  const cleanCollege = data.college.trim() || 'College of Information Technology Education (CITE)';
  const cleanProgram = data.program.trim() || 'BS Information Technology';
  const cleanYearLevel = data.year_level.trim() || '4th Year';

  const newStudentPayload = {
    id: generatedId,
    registrationId: generatedId,
    qr_code_id: generatedId,
    attendeeType: 'student',
    first_name: cleanFirstName,
    last_name: cleanLastName,
    firstName: cleanFirstName,
    lastName: cleanLastName,
    fullName: fullName,
    college: cleanCollege,
    collegeOrDept: cleanCollege,
    program: cleanProgram,
    course: cleanProgram,
    location: cleanLocation,
    campus: `T.I.P. ${cleanLocation}`,
    year_level: cleanYearLevel,
    yearLevel: cleanYearLevel,
    email: cleanEmail,
    phone: cleanPhone,
    mobile: cleanPhone,
    created_at: now,
    createdAt: now,
    timestamp: new Date(now).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
    source: 'walkin_registration_desk',
    eventName: 'TECHX SUMMIT 2026',
    dataPrivacyConsent: true
  };

  // 1. Insert into main student database (techx_registrations)
  if (db) {
    try {
      await setDoc(doc(db, 'techx_registrations', generatedId), newStudentPayload);
      console.log('✅ Walk-in student registered in techx_registrations:', generatedId);
    } catch (err) {
      console.error('Error inserting walkin student into techx_registrations:', err);
    }
  }

  const studentRecord: StudentRecord = {
    id: generatedId,
    qr_code_id: generatedId,
    first_name: cleanFirstName,
    last_name: cleanLastName,
    fullName: fullName,
    college: cleanCollege,
    program: cleanProgram,
    location: cleanLocation,
    year_level: cleanYearLevel,
    email: cleanEmail,
    phone: cleanPhone,
    created_at: now,
    attendeeType: 'student',
    isCheckedIn: true
  };

  // 2. Immediately record check-in in techx_checkins with checkin_type: 'walkin'
  const checkinResult = await recordCheckin({
    student_id: generatedId,
    checkin_type: 'walkin',
    created_by: data.created_by || 'Walk-in Entrance Desk',
    student: studentRecord
  });

  const checkinRecord: TechXCheckin = checkinResult.checkin || {
    id: `CHK-${generatedId}-${now}`,
    student_id: generatedId,
    checkin_type: 'walkin',
    checked_in_at: new Date(now).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
    created_by: data.created_by || 'Walk-in Entrance Desk',
    createdAt: now,
    student_name: fullName,
    first_name: cleanFirstName,
    last_name: cleanLastName,
    college: cleanCollege,
    program: cleanProgram,
    location: cleanLocation,
    year_level: cleanYearLevel,
    email: cleanEmail,
    phone: cleanPhone
  };

  return {
    student: {
      ...studentRecord,
      checkinId: checkinRecord.id,
      checkedInAt: checkinRecord.checked_in_at,
      checkinType: 'walkin'
    },
    checkin: checkinRecord
  };
}

/**
 * Synthesizes clear audio feedback via Web Audio API.
 * Ensures 100% reliable sound playback without relying on external mp3 assets!
 */
export function playCheckinSuccessSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Nice futuristic double chime: Tone 1 (587.33 Hz - D5) -> Tone 2 (880 Hz - A5) -> Tone 3 (1174.66 Hz - D6)
    const playTone = (freq: number, start: number, duration: number, gainValue: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(523.25, 0.0, 0.15, 0.25); // C5
    playTone(659.25, 0.1, 0.15, 0.3);  // E5
    playTone(783.99, 0.2, 0.35, 0.35); // G5
    playTone(1046.50, 0.3, 0.45, 0.4); // C6
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Warning sound for already checked-in attendees
 */
export function playWarningSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Buzzing warning interval
    playTone(440, 0.0, 0.15);
    playTone(370, 0.18, 0.25);
  } catch (err) {
    console.warn('Warning sound error:', err);
  }
}

/**
 * Error sound for invalid or unrecognized scans
 */
export function playErrorSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.warn('Error sound error:', err);
  }
}

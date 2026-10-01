/**
 * Registrations & RSVP Monitoring Service
 * Connects to Cloud Firestore (database: ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676)
 * Real-time synchronization for TechX Summit Student Registrations & ITAP 2nd GMM RSVPs
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  onSnapshot, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

export interface AttendeeRecord {
  id: string;
  registrationId: string;
  attendeeType: 'student' | 'industry';
  fullName: string;
  email: string;
  mobile: string;
  timestamp: string;
  createdAt: number;

  // Student Specific Fields
  firstName?: string;
  lastName?: string;
  middleName?: string;
  college?: string;
  program?: string;
  location?: 'Manila' | 'Quezon City' | string;
  yearLevel?: string;
  studentNumber?: string;
  course?: string;
  campus?: string;
  collegeOrDept?: string;
  dataPrivacyConsent?: boolean;

  // GMM RSVP Specific Fields
  companyName?: string;
  jobTitle?: string;
  attendance?: 'yes' | 'no' | string;
  hasCompanion?: 'Yes' | 'No' | boolean | string;
  companionName?: string;
  companionDesignation?: string;
  source?: string;
  venue?: string;
  eventName?: string;
}

const STORAGE_KEY_REGISTRATIONS_CACHE = 'techx_registrations_cache_v1';
const TARGET_DATABASE_ID = (appletConfig as any).firestoreDatabaseId || "ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676";

let registrationDb: Firestore | null = null;

function getRegistrationFirestore(): Firestore | null {
  if (registrationDb) return registrationDb;

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
    registrationDb = initializeFirestore(app, {}, TARGET_DATABASE_ID);
    return registrationDb;
  } catch (err) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(appletConfig as any);
      registrationDb = getFirestore(app, TARGET_DATABASE_ID);
      return registrationDb;
    } catch (e2) {
      console.warn('Registration Firestore initialization notice:', e2);
      return null;
    }
  }
}

/**
 * Normalizes a raw Firestore or cached document into a standardized AttendeeRecord.
 */
export function normalizeAttendeeRecord(id: string, raw: any): AttendeeRecord {
  const isStudent = raw.attendeeType === 'student' || 
                    !!raw.studentNumber || 
                    !!raw.course || 
                    (raw.registrationId && raw.registrationId.startsWith('TIP-TX-'));

  const parsedCreatedAt = typeof raw.createdAt === 'number' 
    ? raw.createdAt 
    : (raw.createdAt?.toMillis ? raw.createdAt.toMillis() : Date.now());

  const hasComp = raw.hasCompanion === 'yes' || 
                  raw.hasCompanion === 'Yes' || 
                  raw.hasCompanion === true || 
                  raw.hasCompanion === 'true';

  const parsedFirstName = (raw.firstName || '').trim();
  const parsedLastName = (raw.lastName || '').trim();
  let computedFullName = (raw.fullName || raw.name || '').trim();

  if (!computedFullName && (parsedFirstName || parsedLastName)) {
    computedFullName = `${parsedFirstName} ${raw.middleName ? raw.middleName.trim() + ' ' : ''}${parsedLastName}`.trim();
  }

  // Fallback split for first/last name if not explicitly provided
  let finalFirstName = parsedFirstName;
  let finalLastName = parsedLastName;
  if (!finalFirstName && !finalLastName && computedFullName && computedFullName !== 'N/A') {
    const parts = computedFullName.split(' ').filter(Boolean);
    if (parts.length === 1) {
      finalFirstName = parts[0];
      finalLastName = '';
    } else if (parts.length > 1) {
      finalFirstName = parts.slice(0, -1).join(' ');
      finalLastName = parts[parts.length - 1];
    }
  }

  const rawLocation = raw.location || raw.campus || '';
  const normalizedLocation: 'Manila' | 'Quezon City' = 
    rawLocation.toLowerCase().includes('manila') ? 'Manila' : 'Quezon City';

  const normalizedCollege = raw.college || raw.collegeOrDept || raw.department || 'College of Information Technology Education (CITE)';
  const normalizedProgram = raw.program || raw.course || 'BS Information Technology';
  const normalizedYearLevel = raw.yearLevel || raw.year || '4th Year';

  return {
    id: id || raw.id || raw.registrationId || `REG-${Date.now()}`,
    registrationId: raw.registrationId || raw.ticketId || raw.id || id,
    attendeeType: isStudent ? 'student' : 'industry',
    fullName: computedFullName || (isStudent ? 'Student Delegate' : 'Industry Delegate'),
    email: (raw.email || raw.workEmail || 'N/A').trim(),
    mobile: (raw.mobile || raw.mobileNumber || raw.phone || 'N/A').trim(),
    timestamp: raw.timestamp || new Date(parsedCreatedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
    createdAt: parsedCreatedAt,

    // Student fields
    firstName: finalFirstName || (isStudent ? computedFullName : undefined),
    lastName: finalLastName || '',
    middleName: raw.middleName,
    college: normalizedCollege,
    program: normalizedProgram,
    location: normalizedLocation,
    yearLevel: normalizedYearLevel,
    studentNumber: raw.studentNumber || raw.idNumber,
    course: normalizedProgram,
    campus: `T.I.P. ${normalizedLocation}`,
    collegeOrDept: normalizedCollege,
    dataPrivacyConsent: raw.dataPrivacyConsent ?? true,

    // Industry / GMM fields
    companyName: (raw.companyName || raw.company || raw.organization || (isStudent ? undefined : 'N/A')),
    jobTitle: (raw.jobTitle || raw.position || raw.title || (isStudent ? undefined : 'N/A')),
    attendance: raw.attendance || (isStudent ? 'yes' : 'yes'),
    hasCompanion: hasComp ? 'Yes' : 'No',
    companionName: hasComp ? (raw.companionName && raw.companionName !== 'None' ? raw.companionName : 'N/A') : 'None',
    companionDesignation: hasComp ? (raw.companionDesignation || raw.companionTitle || 'N/A') : 'None',
    source: raw.source,
    venue: raw.venue,
    eventName: raw.eventName || (isStudent ? 'TECHX SUMMIT 2026' : 'ITAP 2nd GMM 2026')
  };
}

/**
 * Loads cached attendees from localStorage.
 */
export function getCachedAttendees(): AttendeeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTRATIONS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local attendee cache:', e);
  }

  // Also check local student ticket
  const studentTicketRaw = localStorage.getItem('techx_summit_ticket');
  if (studentTicketRaw) {
    try {
      const ticket = JSON.parse(studentTicketRaw);
      return [normalizeAttendeeRecord(ticket.registrationId || 'TICKET-1', ticket)];
    } catch (e) {
      // ignore
    }
  }

  return [];
}

/**
 * Saves attendees to localStorage cache.
 */
function saveCachedAttendees(records: AttendeeRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS_CACHE, JSON.stringify(records));
  } catch (e) {
    console.warn('Error saving local attendee cache:', e);
  }
}

/**
 * Subscribes to real-time attendee updates from Cloud Firestore.
 */
export function subscribeToRegistrations(
  callback: (records: AttendeeRecord[], source: 'firestore' | 'cache') => void
): () => void {
  // 1. Immediately emit cached attendees for instant page load
  const cached = getCachedAttendees();
  if (cached.length > 0) {
    callback(cached, 'cache');
  }

  const db = getRegistrationFirestore();
  if (!db) {
    console.warn('Firestore not initialized for registrations');
    return () => {};
  }

  try {
    const colRef = collection(db, 'techx_registrations');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const records: AttendeeRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(normalizeAttendeeRecord(docSnap.id, docSnap.data()));
        });

        // Sort descending by createdAt (latest first)
        records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        saveCachedAttendees(records);
        callback(records, 'firestore');
      },
      (err) => {
        console.warn('Firestore onSnapshot registration notice:', err);
        // Fallback to cache on network issue
        callback(getCachedAttendees(), 'cache');
      }
    );

    return unsub;
  } catch (err) {
    console.error('Failed to attach Firestore registration listener:', err);
    return () => {};
  }
}

/**
 * Manually fetches all attendees from Firestore once.
 */
export async function fetchRegistrationsOnce(): Promise<AttendeeRecord[]> {
  const db = getRegistrationFirestore();
  if (!db) return getCachedAttendees();

  try {
    const colRef = collection(db, 'techx_registrations');
    const snapshot = await getDocs(colRef);
    const records: AttendeeRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(normalizeAttendeeRecord(docSnap.id, docSnap.data()));
    });
    records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveCachedAttendees(records);
    return records;
  } catch (err) {
    console.warn('Manual fetch error, returning cache:', err);
    return getCachedAttendees();
  }
}

/**
 * Deletes a registration record from Firestore.
 */
export async function deleteRegistrationRecord(id: string): Promise<boolean> {
  // Always clean up local storage cache first
  try {
    const cached = getCachedAttendees();
    saveCachedAttendees(cached.filter((r) => r.id !== id && r.registrationId !== id));
  } catch (cErr) {
    console.warn('Cache clean notice:', cErr);
  }

  const db = getRegistrationFirestore();
  if (!db) return true;

  try {
    await deleteDoc(doc(db, 'techx_registrations', id));
    console.log('✅ Deleted registration document:', id);
    return true;
  } catch (err) {
    console.error('Failed to delete registration record from Firestore:', err);
    return false;
  }
}

/**
 * Calculates statistics and summary metrics for attendees.
 */
export function getAttendeeStats(records: AttendeeRecord[]) {
  const total = records.length;
  const students = records.filter((r) => r.attendeeType === 'student');
  const industry = records.filter((r) => r.attendeeType === 'industry');

  const studentsQC = students.filter((s) => s.location === 'Quezon City' || s.campus?.includes('Quezon City')).length;
  const studentsManila = students.filter((s) => s.location === 'Manila' || s.campus?.includes('Manila')).length;

  const industryAttending = industry.filter((i) => i.attendance === 'yes' || !i.attendance).length;
  const industryWithCompanion = industry.filter((i) => i.hasCompanion === 'Yes').length;

  return {
    total,
    studentsCount: students.length,
    studentsQC,
    studentsManila,
    industryCount: industry.length,
    industryAttending,
    industryWithCompanion,
  };
}

/**
 * Utility to export attendees to CSV format and trigger download.
 */
export function exportAttendeesToCSV(records: AttendeeRecord[], type: 'all' | 'student' | 'industry') {
  let filtered = records;
  if (type === 'student') {
    filtered = records.filter((r) => r.attendeeType === 'student');
  } else if (type === 'industry') {
    filtered = records.filter((r) => r.attendeeType === 'industry');
  }

  if (filtered.length === 0) {
    return;
  }

  let headers: string[] = [];
  let rows: string[][] = [];

  if (type === 'student') {
    headers = [
      'Registration ID',
      'First Name',
      'Last Name',
      'Full Name',
      'College',
      'Program',
      'Location',
      'Year Level',
      'Email',
      'Mobile Number',
      'Timestamp'
    ];
    rows = filtered.map((s) => [
      s.registrationId,
      s.firstName || 'N/A',
      s.lastName || 'N/A',
      s.fullName,
      s.college || s.collegeOrDept || 'N/A',
      s.program || s.course || 'N/A',
      s.location || 'Quezon City',
      s.yearLevel || '4th Year',
      s.email,
      s.mobile,
      s.timestamp
    ]);
  } else if (type === 'industry') {
    headers = [
      'Registration ID',
      'Full Name',
      'Company / Organization',
      'Job Title / Position',
      'Work Email',
      'Mobile Number',
      'Attending?',
      'With Companion?',
      'Companion Name',
      'Companion Designation',
      'Timestamp'
    ];
    rows = filtered.map((i) => [
      i.registrationId,
      i.fullName,
      i.companyName || 'N/A',
      i.jobTitle || 'N/A',
      i.email,
      i.mobile,
      i.attendance === 'yes' ? 'Yes' : 'No',
      i.hasCompanion === 'Yes' ? 'Yes' : 'No',
      i.companionName || 'None',
      i.companionDesignation || 'None',
      i.timestamp
    ]);
  } else {
    headers = [
      'Type',
      'Registration ID',
      'Name',
      'Email',
      'Mobile',
      'Organization / Campus',
      'Role / Course',
      'Details / Companion',
      'Timestamp'
    ];
    rows = filtered.map((r) => [
      r.attendeeType === 'student' ? 'Student Delegate' : 'GMM Industry RSVP',
      r.registrationId,
      r.fullName,
      r.email,
      r.mobile,
      r.attendeeType === 'student' ? (r.campus || 'T.I.P.') : (r.companyName || 'N/A'),
      r.attendeeType === 'student' ? (r.course || 'N/A') : (r.jobTitle || 'N/A'),
      r.attendeeType === 'student' ? (r.studentNumber || 'N/A') : (r.hasCompanion === 'Yes' ? `Companion: ${r.companionName} (${r.companionDesignation})` : 'No Companion'),
      r.timestamp
    ]);
  }

  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) => row.map((val) => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `TechX_RSVP_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

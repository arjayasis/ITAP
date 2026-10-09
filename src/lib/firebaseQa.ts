import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  getFirestore, 
  initializeFirestore,
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { QAQuestion, FirebaseQAConfig } from '../types/qa';
import appletConfig from '../../firebase-applet-config.json';

// Local storage keys
const STORAGE_KEY_QUESTIONS = 'techx_qa_questions_v1';
const STORAGE_KEY_CONFIG = 'techx_firebase_config_v2';
const BROADCAST_CHANNEL_NAME = 'techx_qa_realtime_channel';

export const TARGET_DATABASE_ID = (appletConfig as any).firestoreDatabaseId || "ai-studio-itap-e7777b86-5024-412f-845c-394e9eefe676";

// Default config strictly targeted to ITAP-db project and named database
export const defaultFirebaseConfig: FirebaseQAConfig = {
  apiKey: "AIzaSyAJneQTXa5VXi63r4Av8CgOk4gK3JBToi4",
  authDomain: "itap-db.firebaseapp.com",
  projectId: "itap-db",
  storageBucket: "itap-db.appspot.com",
  messagingSenderId: "768834139783",
  appId: "1:768834139783:web:83ef2135331ba1dd4a6a22",
  measurementId: "G-22V0GK2WMM",
  firestoreDatabaseId: TARGET_DATABASE_ID
};

export type ConnectionStatus = 'connecting' | 'connected' | 'error';

// Runtime state cache
let memoryQuestions: QAQuestion[] = [];
let listeners: Array<(questions: QAQuestion[]) => void> = [];
let statusListeners: Array<(status: ConnectionStatus) => void> = [];
let currentConnectionStatus: ConnectionStatus = 'connecting';
let broadcastChannel: BroadcastChannel | null = null;
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let isFirestoreActive = false;
let unsubscribeFirestore: (() => void) | null = null;

// Setup BroadcastChannel for zero-latency local multi-tab sync
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'SYNC_QUESTIONS') {
        memoryQuestions = event.data.questions || [];
        notifyListeners();
      }
    };
  }
} catch (err) {
  console.warn('BroadcastChannel not supported, falling back to storage listener', err);
}

// Storage listener fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_QUESTIONS && e.newValue) {
      try {
        memoryQuestions = JSON.parse(e.newValue);
        notifyListeners();
      } catch (err) {
        console.error('Storage sync parse error:', err);
      }
    }
  });
}

function loadInitialLocalQuestions(): QAQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local questions:', e);
  }
  return [];
}

memoryQuestions = loadInitialLocalQuestions();

function saveLocalQuestions(questions: QAQuestion[]) {
  memoryQuestions = [...questions];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'SYNC_QUESTIONS', questions });
      } catch (e) {
        // ignore
      }
    }
  }
  notifyListeners();
}

function notifyListeners() {
  const sorted = [...memoryQuestions].sort((a, b) => b.createdAt - a.createdAt);
  listeners.forEach((fn) => {
    try {
      fn(sorted);
    } catch (err) {
      console.error('Listener notify error:', err);
    }
  });
}

function setConnectionState(status: ConnectionStatus) {
  currentConnectionStatus = status;
  statusListeners.forEach((fn) => {
    try {
      fn(status);
    } catch (e) {
      console.error('Status listener error:', e);
    }
  });
}

export function subscribeConnectionStatus(callback: (status: ConnectionStatus) => void): () => void {
  statusListeners.push(callback);
  callback(currentConnectionStatus);
  return () => {
    statusListeners = statusListeners.filter((fn) => fn !== callback);
  };
}

// Retrieve active Firebase config, strictly enforcing database ID
export function getActiveFirebaseConfig(): FirebaseQAConfig {
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed.apiKey && parsed.projectId === 'itap-db') {
          // Reject (default) or empty database IDs to prevent permission errors
          const validDbId = (parsed.firestoreDatabaseId && parsed.firestoreDatabaseId !== '(default)' && parsed.firestoreDatabaseId.trim() !== '')
            ? parsed.firestoreDatabaseId.trim()
            : TARGET_DATABASE_ID;

          return {
            ...defaultFirebaseConfig,
            ...parsed,
            storageBucket: "itap-db.appspot.com",
            firestoreDatabaseId: validDbId
          };
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return defaultFirebaseConfig;
}

// Initialize Firebase & Firestore targeting the ITAP-db database
export function initFirebase(): { app: FirebaseApp | null; db: Firestore | null; isLive: boolean } {
  if (firestoreDb && isFirestoreActive) {
    return { app: firebaseApp, db: firestoreDb, isLive: true };
  }

  const config = getActiveFirebaseConfig();
  const dbId = config.firestoreDatabaseId || TARGET_DATABASE_ID;

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config as any);
    } else {
      firebaseApp = getApp();
    }

    // Initialize Firestore with ignoreUndefinedProperties, experimentalAutoDetectLongPolling and target database ID
    try {
      firestoreDb = initializeFirestore(firebaseApp, {
        ignoreUndefinedProperties: true,
        experimentalAutoDetectLongPolling: true
      }, dbId);
    } catch (initErr) {
      // If already initialized, retrieve instance
      firestoreDb = getFirestore(firebaseApp, dbId);
    }

    isFirestoreActive = true;

    // Initialize Analytics if supported in browser environment
    if (typeof window !== 'undefined' && config.measurementId) {
      isSupported().then((supported) => {
        if (supported && firebaseApp) {
          getAnalytics(firebaseApp);
        }
      }).catch(() => {});
    }

    // Attach real-time collection query
    if (!unsubscribeFirestore) {
      const colRef = collection(firestoreDb, 'techx_questions');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      unsubscribeFirestore = onSnapshot(
        q, 
        (snapshot) => {
          const list: QAQuestion[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as QAQuestion;
            list.push({
              ...data,
              id: docSnap.id
            });
          });
          saveLocalQuestions(list);
          setConnectionState('connected');
        }, 
        (err) => {
          // If network is transitioning or backend is temporarily unreachable, Firestore operates in offline mode
          if (err?.code === 'unavailable') {
            console.warn('Cloud Firestore backend offline or reconnecting; operating in resilient offline mode.');
          } else {
            console.warn('Firestore onSnapshot notice:', err);
            setConnectionState('error');
          }
        }
      );
    }

    return { app: firebaseApp, db: firestoreDb, isLive: true };
  } catch (err) {
    console.warn('Notice initializing Firebase Firestore SDK:', err);
    setConnectionState('error');
    return { app: null, db: null, isLive: false };
  }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  try {
    initFirebase();
  } catch (e) {
    console.warn('Auto init error:', e);
  }
}

// Subscribe to all questions
export function subscribeQuestions(callback: (questions: QAQuestion[]) => void): () => void {
  listeners.push(callback);
  
  // Connect to Firestore
  initFirebase();
  
  // Emit initial memory state
  callback([...memoryQuestions].sort((a, b) => b.createdAt - a.createdAt));

  return () => {
    listeners = listeners.filter((fn) => fn !== callback);
  };
}

// Subscribe to active question
export function subscribeActiveQuestion(callback: (question: QAQuestion | null) => void): () => void {
  return subscribeQuestions((questions) => {
    const active = questions.find((q) => q.isSelected && q.status === 'live');
    callback(active || null);
  });
}

// Submit question to Firestore
export async function submitQuestion(
  name: string, 
  questionText: string, 
  company: string = '',
  isAnonymous: boolean = false
): Promise<QAQuestion> {
  const id = 'qa_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-PH', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true, 
    timeZone: 'Asia/Manila' 
  });

  const originalName = name.trim();
  const displayName = isAnonymous ? 'Anonymous' : originalName;

  const newQuestion: QAQuestion = {
    id,
    name: displayName,
    submitterName: originalName,
    isAnonymous: Boolean(isAnonymous),
    company: company.trim() || '', // Never undefined
    question: questionText.trim(),
    timestamp: timeFormatted,
    createdAt: Date.now(),
    isSelected: false,
    status: 'pending',
    upvotes: 0
  };

  // 1. Immediate optimistic update to memory and local storage so the UI updates without delay
  const updated = [newQuestion, ...memoryQuestions.filter(q => q.id !== id)];
  saveLocalQuestions(updated);

  // 2. Write to Firestore ITAP-db
  const { db, isLive } = initFirebase();
  if (isLive && db) {
    try {
      const docPayload = {
        id: newQuestion.id,
        name: newQuestion.name,
        submitterName: newQuestion.submitterName || '',
        isAnonymous: newQuestion.isAnonymous || false,
        company: newQuestion.company || '',
        question: newQuestion.question,
        timestamp: newQuestion.timestamp,
        createdAt: newQuestion.createdAt,
        isSelected: false,
        status: 'pending',
        upvotes: 0
      };
      await setDoc(doc(db, 'techx_questions', id), docPayload);
      console.log('✅ Question saved to Cloud Firestore:', id);
    } catch (err) {
      console.error('❌ Firestore setDoc failed:', err);
      // Re-throw so UI can notify participant if there is an error
      throw new Error(`Cloud sync error: ${(err as Error).message}`);
    }
  } else {
    throw new Error('Cloud Firestore connection is not available.');
  }

  return newQuestion;
}

// Check for duplicate attendee registration (Strict deduplication enforcement)
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
  existingId?: string;
}

export async function checkDuplicateRegistration(params: {
  attendeeType: 'student' | 'industry';
  email: string;
  studentNumber?: string;
  mobile?: string;
  fullName?: string;
  companyName?: string;
}): Promise<DuplicateCheckResult> {
  const { db, isLive } = initFirebase();
  const normalizedEmail = (params.email || '').trim().toLowerCase();
  const normalizedStudentNum = (params.studentNumber || '').trim().toLowerCase();
  const normalizedMobile = (params.mobile || '').replace(/\D/g, '').slice(-10);
  const normalizedFullName = (params.fullName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const normalizedCompany = (params.companyName || '').trim().toLowerCase().replace(/\s+/g, ' ');

  if (!isLive || !db) {
    // Offline local storage cache check
    try {
      if (typeof window !== 'undefined') {
        const cachedRaw = localStorage.getItem('techx_registrations_cache_v1');
        if (cachedRaw) {
          const records = JSON.parse(cachedRaw);
          if (Array.isArray(records)) {
            for (const r of records) {
              const rIsStudent = r.attendeeType === 'student';
              if (params.attendeeType === 'student' && rIsStudent) {
                const rEmail = (r.email || '').trim().toLowerCase();
                const rStudNum = (r.studentNumber || '').trim().toLowerCase();
                if (normalizedEmail && rEmail && normalizedEmail === rEmail) {
                  return { isDuplicate: true, reason: `Email (${params.email}) is already registered for TechX Summit 2026.`, existingId: r.registrationId || r.id };
                }
                if (normalizedStudentNum && rStudNum && normalizedStudentNum === rStudNum) {
                  return { isDuplicate: true, reason: `Student ID Number (${params.studentNumber}) is already registered.`, existingId: r.registrationId || r.id };
                }
              } else if (params.attendeeType === 'industry' && !rIsStudent) {
                const rEmail = (r.email || r.workEmail || '').trim().toLowerCase();
                if (normalizedEmail && rEmail && normalizedEmail === rEmail) {
                  return { isDuplicate: true, reason: `Email (${params.email}) has already RSVP'd for ITAP 2nd GMM.`, existingId: r.registrationId || r.id };
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return { isDuplicate: false };
  }

  try {
    const colRef = collection(db, 'techx_registrations');
    const snapshot = await getDocs(colRef);
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const isStudentDoc = data.attendeeType === 'student' || (!data.attendeeType && (data.studentNumber || data.id?.startsWith('TIP-TX-')));
      const dEmail = (data.email || data.workEmail || '').trim().toLowerCase();
      const dStudNum = (data.studentNumber || data.idNumber || '').trim().toLowerCase();
      const dMobile = (data.mobile || data.mobileNumber || data.phone || '').replace(/\D/g, '').slice(-10);
      const dName = (data.fullName || data.name || `${data.firstName || ''} ${data.lastName || ''}`).trim().toLowerCase().replace(/\s+/g, ' ');
      const dComp = (data.companyName || data.company || data.organization || '').trim().toLowerCase().replace(/\s+/g, ' ');

      if (params.attendeeType === 'student') {
        if (!isStudentDoc) continue;
        // Check 1: Same email
        if (normalizedEmail && dEmail && normalizedEmail === dEmail && dEmail !== 'n/a') {
          return {
            isDuplicate: true,
            reason: `The email address "${params.email}" is already registered for TechX Summit 2026. Duplicate registrations are not accepted.`,
            existingId: data.registrationId || docSnap.id
          };
        }
        // Check 2: Same student ID
        if (normalizedStudentNum && dStudNum && normalizedStudentNum === dStudNum && dStudNum !== 'n/a') {
          return {
            isDuplicate: true,
            reason: `Student Number "${params.studentNumber}" is already registered. Duplicate registrations are not accepted.`,
            existingId: data.registrationId || docSnap.id
          };
        }
        // Check 3: Same Name AND same mobile
        if (normalizedFullName && dName && normalizedFullName === dName && normalizedMobile && dMobile && normalizedMobile === dMobile) {
          return {
            isDuplicate: true,
            reason: `A student registration for "${params.fullName}" with mobile ending in ...${normalizedMobile.slice(-4)} already exists. Duplicate registrations are not accepted.`,
            existingId: data.registrationId || docSnap.id
          };
        }
      } else {
        // Industry / GMM
        if (isStudentDoc) continue;
        // Check 1: Same email
        if (normalizedEmail && dEmail && normalizedEmail === dEmail && dEmail !== 'n/a') {
          return {
            isDuplicate: true,
            reason: `The email address "${params.email}" has already RSVP'd for ITAP 2nd GMM. Duplicate submissions are not accepted.`,
            existingId: data.registrationId || docSnap.id
          };
        }
        // Check 2: Same Name and Company
        if (normalizedFullName && dName && normalizedFullName === dName && normalizedCompany && dComp && normalizedCompany === dComp) {
          return {
            isDuplicate: true,
            reason: `An RSVP for "${params.fullName}" from "${params.companyName}" is already registered. Duplicate submissions are not accepted.`,
            existingId: data.registrationId || docSnap.id
          };
        }
        // Check 3: Same Name and mobile
        if (normalizedFullName && dName && normalizedFullName === dName && normalizedMobile && dMobile && normalizedMobile === dMobile) {
          return {
            isDuplicate: true,
            reason: `An RSVP for "${params.fullName}" with contact number ending in ...${normalizedMobile.slice(-4)} is already registered. Duplicate submissions are not accepted.`,
            existingId: data.registrationId || docSnap.id
          };
        }
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    console.warn('Error during duplicate check:', err);
    return { isDuplicate: false };
  }
}

// Capacity limit (internal enforcement: close registration when reached 700 students, not publicized)
export const STUDENT_REGISTRATION_CAP = 700;

export async function getStudentRegistrationCount(): Promise<number> {
  const { db, isLive } = initFirebase();
  if (!isLive || !db) {
    try {
      if (typeof window !== 'undefined') {
        const cachedRaw = localStorage.getItem('techx_registrations_cache_v1');
        if (cachedRaw) {
          const records = JSON.parse(cachedRaw);
          if (Array.isArray(records)) {
            return records.filter(r => r.attendeeType === 'student' || (!r.attendeeType && (r.studentNumber || r.id?.startsWith('TIP-TX-')))).length;
          }
        }
      }
    } catch {
      // ignore
    }
    return 0;
  }

  try {
    const colRef = collection(db, 'techx_registrations');
    const snapshot = await getDocs(colRef);
    let count = 0;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const isStudentDoc = data.attendeeType === 'student' || (!data.attendeeType && (data.studentNumber || data.id?.startsWith('TIP-TX-')));
      if (isStudentDoc) {
        count++;
      }
    }
    return count;
  } catch (err) {
    console.warn('Error counting student registrations:', err);
    return 0;
  }
}

export async function isStudentRegistrationClosed(): Promise<boolean> {
  try {
    const count = await getStudentRegistrationCount();
    return count >= STUDENT_REGISTRATION_CAP;
  } catch {
    return false;
  }
}

// Submit attendee registration to Cloud Firestore (with strict duplicate protection and capacity cap)
export async function submitRegistrationToFirestore(registration: any): Promise<void> {
  const { db, isLive } = initFirebase();
  if (isLive && db) {
    const isStudent = registration.attendeeType === 'student' || 
                      (!registration.attendeeType && (registration.studentNumber || registration.registrationId?.startsWith('TIP-TX-')));

    if (isStudent) {
      const closed = await isStudentRegistrationClosed();
      if (closed) {
        throw new Error('Registration for students is now closed as maximum capacity has been reached. Thank you for your interest in TechX Summit 2026.');
      }
    }

    const dupCheck = await checkDuplicateRegistration({
      attendeeType: isStudent ? 'student' : 'industry',
      email: registration.email || registration.workEmail,
      studentNumber: registration.studentNumber,
      mobile: registration.mobile || registration.mobileNumber,
      fullName: registration.fullName || `${registration.firstName || ''} ${registration.lastName || ''}`,
      companyName: registration.companyName || registration.company
    });

    if (dupCheck.isDuplicate) {
      console.warn('❌ Duplicate registration rejected:', dupCheck.reason);
      throw new Error(dupCheck.reason || 'Duplicate registration entry detected. Duplicate registrations are not accepted.');
    }

    const regId = registration.registrationId || `REG-${Date.now()}`;
    await setDoc(doc(db, 'techx_registrations', regId), {
      ...registration,
      id: regId,
      createdAt: registration.createdAt || Date.now()
    });
    console.log('✅ Registration saved to Cloud Firestore:', regId);
  }
}

// Display Live on stage
export async function setDisplayLive(questionId: string): Promise<void> {
  const { db, isLive } = initFirebase();

  // Optimistic local update
  const previousSelectedIds = memoryQuestions.filter((q) => q.isSelected && q.id !== questionId).map((q) => q.id);
  const updated = memoryQuestions.map((q) => {
    if (q.id === questionId) {
      return { ...q, isSelected: true, status: 'live' as const };
    }
    if (q.isSelected) {
      return { ...q, isSelected: false, status: q.status === 'live' ? 'pending' as const : q.status };
    }
    return q;
  });
  saveLocalQuestions(updated);

  // Firestore atomic batch update
  if (isLive && db) {
    try {
      const batch = writeBatch(db);
      
      // Reset currently selected question(s)
      previousSelectedIds.forEach((id) => {
        batch.update(doc(db, 'techx_questions', id), {
          isSelected: false,
          status: 'pending'
        });
      });

      // Set target question to live
      batch.update(doc(db, 'techx_questions', questionId), {
        isSelected: true,
        status: 'live'
      });

      await batch.commit();
      console.log('✅ Updated Live question in Cloud Firestore:', questionId);
    } catch (err) {
      console.error('Firestore setDisplayLive failed:', err);
    }
  }
}

// Clear display from live stage
export async function clearDisplayLive(): Promise<void> {
  const { db, isLive } = initFirebase();

  // Capture IDs of currently selected questions before updating local memory
  const selectedIds = memoryQuestions.filter((q) => q.isSelected || q.status === 'live').map((q) => q.id);

  const updated = memoryQuestions.map((q) => {
    if (q.isSelected || q.status === 'live') {
      return { ...q, isSelected: false, status: 'pending' as const };
    }
    return q;
  });
  saveLocalQuestions(updated);

  if (isLive && db && selectedIds.length > 0) {
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        batch.update(doc(db, 'techx_questions', id), {
          isSelected: false,
          status: 'pending'
        });
      });
      await batch.commit();
      console.log('✅ Cleared Live display in Cloud Firestore for', selectedIds.length, 'question(s)');
    } catch (err) {
      console.error('Firestore clearDisplayLive failed:', err);
    }
  }
}

// Mark question as answered
export async function markAnswered(questionId: string): Promise<void> {
  const { db, isLive } = initFirebase();

  const updated = memoryQuestions.map((q) => {
    if (q.id === questionId) {
      return { ...q, isSelected: false, status: 'answered' as const };
    }
    return q;
  });
  saveLocalQuestions(updated);

  if (isLive && db) {
    try {
      await updateDoc(doc(db, 'techx_questions', questionId), {
        isSelected: false,
        status: 'answered'
      });
      console.log('✅ Marked question answered in Cloud Firestore:', questionId);
    } catch (err) {
      console.error('Firestore markAnswered failed:', err);
    }
  }
}

// Delete question
export async function deleteQuestion(questionId: string): Promise<void> {
  const { db, isLive } = initFirebase();

  const updated = memoryQuestions.filter((q) => q.id !== questionId);
  saveLocalQuestions(updated);

  if (isLive && db) {
    try {
      await deleteDoc(doc(db, 'techx_questions', questionId));
      console.log('✅ Deleted question from Cloud Firestore:', questionId);
    } catch (err) {
      console.error('Firestore deleteQuestion failed:', err);
    }
  }
}

// Save custom configuration from UI
export function saveCustomFirebaseConfig(config: FirebaseQAConfig) {
  if (typeof window !== 'undefined') {
    const merged = {
      ...defaultFirebaseConfig,
      ...config,
      firestoreDatabaseId: config.firestoreDatabaseId || TARGET_DATABASE_ID
    };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(merged));
    firestoreDb = null;
    firebaseApp = null;
    isFirestoreActive = false;
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    initFirebase();
  }
}

// Seed sample questions to ITAP-db
export async function seedSampleQuestions(): Promise<void> {
  const samples: QAQuestion[] = [
    {
      id: 'sample_1',
      name: 'Engr. Rafael Mendoza',
      company: 'DataTech Analytics PH',
      question: 'How is ITAP addressing the AI workforce readiness gap among regional universities in Luzon and Visayas?',
      timestamp: '10:14 AM',
      createdAt: Date.now() - 1000 * 60 * 12,
      isSelected: false,
      status: 'pending',
      upvotes: 4
    },
    {
      id: 'sample_2',
      name: 'Sofia Valenzuela',
      company: 'CloudMatrix Solutions',
      question: 'With the rise of Sovereign Cloud mandates, what strategic initiatives can Philippine tech enterprises adopt this 2026?',
      timestamp: '10:22 AM',
      createdAt: Date.now() - 1000 * 60 * 5,
      isSelected: false,
      status: 'pending',
      upvotes: 7
    },
    {
      id: 'sample_3',
      name: 'Michael Angelo Tan',
      company: 'CyberGuard Alliance',
      question: 'What cybersecurity benchmarks should SMB members prioritize to comply with new DICT critical infrastructure guidelines?',
      timestamp: '10:28 AM',
      createdAt: Date.now() - 1000 * 60 * 1,
      isSelected: false,
      status: 'pending',
      upvotes: 9
    }
  ];

  const { db, isLive } = initFirebase();
  if (isLive && db) {
    try {
      const batch = writeBatch(db);
      samples.forEach((s) => {
        batch.set(doc(db, 'techx_questions', s.id), s);
      });
      await batch.commit();
      console.log('✅ Successfully seeded sample questions to Cloud Firestore');
    } catch (e) {
      console.error('Firestore seed batch failed:', e);
    }
  }

  saveLocalQuestions([...samples, ...memoryQuestions.filter((q) => !q.id.startsWith('sample_'))]);
}

export interface FirebaseConnectionTestResult {
  ok: boolean;
  message: string;
  databaseId: string;
  projectId: string;
  writeLatencyMs?: number;
  readLatencyMs?: number;
  totalLatencyMs?: number;
  questionCount?: number;
  registrationCount?: number;
  error?: string;
}

// Live interactive test function to verify write, read, delete and collection counts
export async function testFirebaseConnection(): Promise<FirebaseConnectionTestResult> {
  const config = getActiveFirebaseConfig();
  const startTime = Date.now();
  const { db, isLive } = initFirebase();

  if (!isLive || !db) {
    return {
      ok: false,
      message: 'Failed to initialize Firebase SDK',
      databaseId: config.firestoreDatabaseId || TARGET_DATABASE_ID,
      projectId: config.projectId,
      error: 'SDK initialization returned null database instance'
    };
  }

  try {
    const testDocId = `conn_test_${Date.now()}`;
    const testRef = doc(db, 'techx_questions', testDocId);

    // 1. Test write
    const writeStart = Date.now();
    await setDoc(testRef, {
      id: testDocId,
      name: 'System Ping',
      company: 'ITAP Live Test',
      question: 'Verification ping',
      timestamp: new Date().toLocaleTimeString(),
      createdAt: Date.now(),
      isSelected: false,
      status: 'pending',
      upvotes: 0,
      _isPingTest: true
    });
    const writeLatencyMs = Date.now() - writeStart;

    // 2. Test read
    const readStart = Date.now();
    const readSnap = await getDoc(testRef);
    const readLatencyMs = Date.now() - readStart;

    if (!readSnap.exists()) {
      throw new Error('Test document was written but could not be read back.');
    }

    // 3. Clean up test doc
    await deleteDoc(testRef);

    // 4. Read counts
    const qSnap = await getDocs(collection(db, 'techx_questions'));
    let rCount = 0;
    try {
      const rSnap = await getDocs(collection(db, 'techx_registrations'));
      rCount = rSnap.size;
    } catch {
      // techx_registrations optional count
    }

    const totalLatencyMs = Date.now() - startTime;

    return {
      ok: true,
      message: 'Cloud Firestore connected and verified successfully',
      databaseId: config.firestoreDatabaseId || TARGET_DATABASE_ID,
      projectId: config.projectId,
      writeLatencyMs,
      readLatencyMs,
      totalLatencyMs,
      questionCount: qSnap.size,
      registrationCount: rCount
    };
  } catch (err: any) {
    return {
      ok: false,
      message: 'Connection test failed',
      databaseId: config.firestoreDatabaseId || TARGET_DATABASE_ID,
      projectId: config.projectId,
      error: err?.message || String(err)
    };
  }
}

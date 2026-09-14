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
  getDoc,
  getDocFromServer
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

    // Initialize Firestore with ignoreUndefinedProperties and target database ID
    try {
      firestoreDb = initializeFirestore(firebaseApp, {
        ignoreUndefinedProperties: true
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

    // Attach real-time collection query and immediate server fetch
    if (!unsubscribeFirestore) {
      const colRef = collection(firestoreDb, 'techx_questions');
      const q = query(colRef, orderBy('createdAt', 'desc'));

      // 1. Immediate fetch from Cloud Firestore server
      getDocs(q).then((snapshot) => {
        const list: QAQuestion[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as QAQuestion;
          list.push({
            ...data,
            id: docSnap.id
          });
        });
        if (list.length > 0) {
          saveLocalQuestions(list);
        }
        setConnectionState('connected');
        console.log(`📡 Fetched ${list.length} question(s) from Cloud Firestore (${dbId})`);
      }).catch((fetchErr) => {
        console.warn('Initial Firestore getDocs warning:', fetchErr);
      });

      // 2. Continuous real-time synchronization
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
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
      }, (err) => {
        console.error('Firestore onSnapshot error:', err);
        setConnectionState('error');
      });
    }

    // Test server connection as recommended
    if (typeof window !== 'undefined') {
      getDocFromServer(doc(firestoreDb, 'test', 'connection')).catch(() => {
        // Expected test doc miss, but confirms network path
      });
    }

    console.log(`⚡ Firebase Firestore connected to itap-db [${dbId}]`);
    return { app: firebaseApp, db: firestoreDb, isLive: true };
  } catch (err) {
    console.error('Failed to initialize Firebase Firestore SDK:', err);
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
  company: string = ''
): Promise<QAQuestion> {
  const id = 'qa_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-PH', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true, 
    timeZone: 'Asia/Manila' 
  });

  const newQuestion: QAQuestion = {
    id,
    name: name.trim(),
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

// Submit attendee registration to Cloud Firestore
export async function submitRegistrationToFirestore(registration: any): Promise<void> {
  const { db, isLive } = initFirebase();
  if (isLive && db) {
    try {
      const regId = registration.registrationId || `REG-${Date.now()}`;
      await setDoc(doc(db, 'techx_registrations', regId), {
        ...registration,
        id: regId,
        createdAt: Date.now()
      });
      console.log('✅ Registration saved to Cloud Firestore:', regId);
    } catch (err) {
      console.error('❌ Firestore registration setDoc failed:', err);
    }
  }
}

// Display Live on stage
export async function setDisplayLive(questionId: string): Promise<void> {
  const { db, isLive } = initFirebase();

  // Optimistic local update
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
      memoryQuestions.forEach((q) => {
        if (q.isSelected && q.id !== questionId) {
          batch.update(doc(db, 'techx_questions', q.id), {
            isSelected: false,
            status: q.status === 'live' ? 'pending' : q.status
          });
        }
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

  const updated = memoryQuestions.map((q) => {
    if (q.isSelected) {
      return { ...q, isSelected: false, status: 'pending' as const };
    }
    return q;
  });
  saveLocalQuestions(updated);

  if (isLive && db) {
    try {
      const batch = writeBatch(db);
      memoryQuestions.forEach((q) => {
        if (q.isSelected) {
          batch.update(doc(db, 'techx_questions', q.id), {
            isSelected: false,
            status: 'pending'
          });
        }
      });
      await batch.commit();
      console.log('✅ Cleared Live display in Cloud Firestore');
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

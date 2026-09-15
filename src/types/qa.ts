export interface QAQuestion {
  id: string;
  name: string;
  submitterName?: string;
  isAnonymous?: boolean;
  company?: string;
  question: string;
  timestamp: string;
  createdAt: number;
  isSelected: boolean;
  status: 'pending' | 'live' | 'answered' | 'dismissed';
  upvotes?: number;
}

export interface FirebaseQAConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

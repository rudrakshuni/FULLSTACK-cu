import { initializeApp } from 'firebase/app';
import {
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyAIf2rVM4Cvb329ldtPGkPzotmd4527RSI",
  // Use firebaseapp.com domain — this is publicly reachable unlike localhost
  authDomain: "curator-app-pushed.firebaseapp.com",
  projectId: "curator-app-pushed",
  storageBucket: "curator-app-pushed.firebasestorage.app",
  messagingSenderId: "984659279877",
  appId: "1:984659279877:web:39957518b5781275655c6c",
  measurementId: "G-FY4Z68B8TN"
};

const app = initializeApp(firebaseConfig);
export const isNative = Capacitor.isNativePlatform();

export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const db = getFirestore(app);
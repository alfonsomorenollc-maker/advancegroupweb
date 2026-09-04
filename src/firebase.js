import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// La web pública LEE el CMS del ERP y ESCRIBE las aplicaciones de empleo a la
// misma base (orgs/org1/job_applicants) y su CV al mismo Storage
// (applicants/{id}/...). Así el equipo las ve en Reclutamiento del ERP sin que
// el aplicante salga de advancegrouppr.com.
const firebaseConfig = {
  projectId: "studio-6178025131-e7aab",
  appId: "1:596149376258:web:ad238b93583e5db4e65e1b",
  apiKey: "AIzaSyC1vft25sF8f2MLo9TvqBtggFaym-rcEbQ",
  authDomain: "studio-6178025131-e7aab.firebaseapp.com",
  storageBucket: "studio-6178025131-e7aab.firebasestorage.app",
  messagingSenderId: "596149376258"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

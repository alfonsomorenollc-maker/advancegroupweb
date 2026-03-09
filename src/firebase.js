import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-6178025131-e7aab",
  appId: "1:596149376258:web:ad238b93583e5db4e65e1b",
  apiKey: "AIzaSyC1vft25sF8f2MLo9TvqBtggFaym-rcEbQ",
  authDomain: "studio-6178025131-e7aab.firebaseapp.com",
  messagingSenderId: "596149376258"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

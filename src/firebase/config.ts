import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfTmdqaOgNgAPqRaB5F25EdiJg-mKXw3o",
  authDomain: "splitly-6af8f.firebaseapp.com",
  projectId: "splitly-6af8f",
  storageBucket: "splitly-6af8f.firebasestorage.app",
  messagingSenderId: "14159617816",
  appId: "1:14159617816:web:c7146385f433a923fac86d",
  measurementId: "G-Z0L7473VH9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
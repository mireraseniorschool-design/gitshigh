// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-3631852695-afdc4",
  "appId": "1:950383541649:web:d21281d468170d278aae30",
  "apiKey": "AIzaSyDsUbbjt6CoOEI72pFW-ZcOIAz2aGCdbCU",
  "authDomain": "studio-3631852695-afdc4.firebaseapp.com",
  "storageBucket": "studio-3631852695-afdc4.appspot.com",
  "messagingSenderId": "950383541649"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDummyKey", // Placeholder, user will need to replace with real key if needed, but project ID is the priority
  authDomain: "studio-3066950614-ac5b0.firebaseapp.com",
  projectId: "studio-3066950614-ac5b0",
  storageBucket: "studio-3066950614-ac5b0.appspot.com",
  messagingSenderId: "72338853613",
  appId: "1:72338853613:web:dummy"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

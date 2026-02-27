import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// INSTRUCCIONES: Una vez que crees tu "App Web" en la consola de Firebase,
// copia y pega aquí los valores del objeto firebaseConfig que te den.
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI", // Empieza con AIzaSy...
  authDomain: "studio-3066950614-ac5b0.firebaseapp.com",
  projectId: "studio-3066950614-ac5b0",
  storageBucket: "studio-3066950614-ac5b0.appspot.com",
  messagingSenderId: "72338853613",
  appId: "TU_APP_ID_AQUI" // Es algo como 1:72338853613:web:...
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

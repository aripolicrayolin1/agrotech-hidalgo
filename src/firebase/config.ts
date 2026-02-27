import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NOTA: Reemplaza 'TU_API_KEY_REAL' con la que aparece en la sección 
// "Configuración del SDK web" de tu captura de pantalla.
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey_RealProject", 
  authDomain: "studio-3066950614-ac5b0.firebaseapp.com",
  projectId: "studio-3066950614-ac5b0",
  storageBucket: "studio-3066950614-ac5b0.appspot.com",
  messagingSenderId: "72338853613",
  appId: "1:72338853613:web:72338853613"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

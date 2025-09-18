import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8Ikl7m0ej39HpfOFMxA8nn6nNz32zZ2o",
  authDomain: "arbor-fa572.firebaseapp.com",
  projectId: "arbor-fa572",
  storageBucket: "arbor-fa572.firebasestorage.app",
  messagingSenderId: "531566468709",
  appId: "1:531566468709:web:1f915958a3f32ccf2ff08c"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

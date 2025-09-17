import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import { attachCustomCommands } from 'cypress-firebase';

const fbConfig = {
  apiKey: "AIzaSyD8Ikl7m0ej39HpfOFMxA8nn6nNz32zZ2o",
  authDomain: "arbor-fa572.firebaseapp.com",
  projectId: "arbor-fa572",
  storageBucket: "arbor-fa572.firebasestorage.app",
  messagingSenderId: "531566468709",
  appId: "1:531566468709:web:1f915958a3f32ccf2ff08c"
};

firebase.initializeApp(fbConfig);

attachCustomCommands({ Cypress, cy, firebase });
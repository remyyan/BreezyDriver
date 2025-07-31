import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBL0NujG65BAV462Ut3OfdkvuhyVYsovBg",
  authDomain: "breezydrivr.firebaseapp.com",
  projectId: "breezydrivr",
  storageBucket: "breezydrivr.firebasestorage.app",
  messagingSenderId: "351751778424",
  appId: "1:351751778424:web:53fcb010a40feb3874bd8d",
  measurementId: "G-FF0NB3QPWT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

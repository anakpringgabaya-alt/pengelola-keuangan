import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBdsZo8WQ7N1iI3KaFjrCFBFDy0dfKNcoQ",
  authDomain: "pengelola-keuangan-1d08c.firebaseapp.com",
  databaseURL: "https://pengelola-keuangan-1d08c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pengelola-keuangan-1d08c",
  storageBucket: "pengelola-keuangan-1d08c.firebasestorage.app",
  messagingSenderId: "894218479241",
  appId: "1:894218479241:web:3e69b9053eb0dae607c858"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getDatabase(app);
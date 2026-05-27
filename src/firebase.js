import { initializeApp } from "firebase/app"

import {
  getAuth,
} from "firebase/auth"

import {
  getFirestore,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBdsZo8WQ7N1iI3KaFjrCFBFDy0dfKNcoQ",
  authDomain: "pengelola-keuangan-1d08c.firebaseapp.com",
  projectId: "pengelola-keuangan-1d08c",
  storageBucket: "pengelola-keuangan-1d08c.firebasestorage.app",
  messagingSenderId: "894218479241",
  appId: "1:894218479241:web:3e69b9053eb0dae607c858"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const db = getFirestore(app)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZTnsWBVZLME6pwQWBV_ImVZjIgMOg9c4",
  authDomain: "clinic-management-system-e7756.firebaseapp.com",
  projectId: "clinic-management-system-e7756",
  storageBucket: "clinic-management-system-e7756.firebasestorage.app",
  messagingSenderId: "174570586492",
  appId: "1:174570586492:web:9627847f63e06af34ca4f9",
  measurementId: "G-DTNP5Z9DDW",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Added local persistence for better offline/download experience
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

export const db = getFirestore(app);

// Added Firestore persistence for offline data access
enableIndexedDbPersistence(db).catch((error) => {
  console.error("Firestore persistence error:", error);
});

export default app;

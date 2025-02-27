import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7kbV9nBUWucwOawpGf9KJtwsTikBdil4",
  authDomain: "callapp-d9738.firebaseapp.com",
  databaseURL: "https://callapp-d9738-default-rtdb.firebaseio.com",
  projectId: "callapp-d9738",
  storageBucket: "callapp-d9738.appspot.com",
  messagingSenderId: "237062160021",
  appId: "1:237062160021:web:863302f5a713b544eae59c",
  measurementId: "G-EG7YYGCLS4"
};

let analytics; // Declare analytics outside the conditional block
let app;      // Declare app outside the conditional block
let db;       // Declare db outside the conditional block

if (typeof window !== 'undefined') { // Check if window is defined (browser environment)
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
} else {
  // You are in a server-side environment (e.g., during build or SSR)
  // You might not need analytics or Firestore initialized here,
  // or you might have server-side Firebase setup.
  console.warn("Firebase Analytics and Firestore not initialized on server-side.");

  // If you DO need Firestore server-side (for some specific purpose), you can initialize Firestore only:
  app = initializeApp(firebaseConfig); // You might still need to initialize the app for server-side Firestore
  db = getFirestore(app); // Initialize Firestore -  ensure your Firebase config is suitable for server-side if needed.
  analytics = null; // Set analytics to null as it's not available server-side
}


export { app, analytics, db };
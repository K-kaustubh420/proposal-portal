import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// Prevent multiple instances
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase Services
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, db, auth, analytics };

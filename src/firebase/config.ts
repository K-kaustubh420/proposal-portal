// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7kbV9nBUWucwOawpGf9KJtwsTikBdil4",
  authDomain: "callapp-d9738.firebaseapp.com",
  databaseURL: "https://callapp-d9738-default-rtdb.firebaseio.com",
  projectId: "callapp-d9738",
  storageBucket: "callapp-d9738.firebasestorage.app",
  messagingSenderId: "237062160021",
  appId: "1:237062160021:web:863302f5a713b544eae59c",
  measurementId: "G-EG7YYGCLS4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app); // Initialize and export Firestore
// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJMsh55gnALZEm2UVMSG7zHbUc3ZjY6RM",
    authDomain: "koko-97681.firebaseapp.com",
    projectId: "koko-97681",
    storageBucket: "koko-97681.firebasestorage.app",
    messagingSenderId: "154602341403",
    appId: "1:154602341403:web:0bb19bbcab19c2b8fee4be",
    measurementId: "G-EW5D7KPJ7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other files
export { app, analytics, auth, db, storage };

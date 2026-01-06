import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAUlYZEQGhrGVmMX5RZklA4pKzYyi6i9pE",
    authDomain: "mediguide-ca06e.firebaseapp.com",
    projectId: "mediguide-ca06e",
    storageBucket: "mediguide-ca06e.firebasestorage.app",
    messagingSenderId: "457909377346",
    appId: "1:457909377346:web:88887e91e8553a190790db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

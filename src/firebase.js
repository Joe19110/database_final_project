// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAsYtaKgtCsDd1sOVvUACQv6WRuM-hIwY8",
    authDomain: "cinema-booking-6b706.firebaseapp.com",
    projectId: "cinema-booking-6b706",
    storageBucket: "cinema-booking-6b706.appspot.com",
    messagingSenderId: "481792580245",
    appId: "1:481792580245:web:fdcabc280cb4a58a51199c",
    measurementId: "G-J3XLPLSXD4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

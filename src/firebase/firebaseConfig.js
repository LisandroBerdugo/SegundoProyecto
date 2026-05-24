import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJYtSgSKAwtBWnxpQZfD-gRmEUpgt-nDQ",
  authDomain: "comunidad-eventos.firebaseapp.com",
  projectId: "comunidad-eventos",
  storageBucket: "comunidad-eventos.firebasestorage.app",
  messagingSenderId: "642610408457",
  appId: "1:642610408457:web:dc762389aadee723db5cd8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
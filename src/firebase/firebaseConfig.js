import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCpfKahdDY-p6GWd3HABv_GqmEH6-3pDFw",
  authDomain: "jns-auto.firebaseapp.com",
  databaseURL: "https://jns-auto-default-rtdb.firebaseio.com",
  projectId: "jns-auto",
  storageBucket: "jns-auto.firebasestorage.app",
  messagingSenderId: "203270626590",
  appId: "1:203270626590:web:0422c009595adbeeff7d0f",
  measurementId: "G-W34FKD9D03"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

export { db, storage, auth, messaging };
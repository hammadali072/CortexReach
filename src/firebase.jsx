import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyBHndF-u2KEL_-qIaEtf6TYQADCWtF4SK4",
    authDomain: "cortexreach-755f6.firebaseapp.com",
    projectId: "cortexreach-755f6",
    storageBucket: "cortexreach-755f6.firebasestorage.app",
    messagingSenderId: "386374601636",
    appId: "1:386374601636:web:3363fad8cbde6c27a20f31",
    databaseURL: "https://cortexreach-755f6-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export default app;

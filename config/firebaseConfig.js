import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import {getFirestore, collection, addDoc, getDocs} from 'firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxB_Lf7lqH_XHLUmstvYAvxQZJullX9m8",
  authDomain: "petcare-2f3ba.firebaseapp.com",
  projectId: "petcare-2f3ba",
  storageBucket: "petcare-2f3ba.firebasestorage.app",
  messagingSenderId: "1036946798647",
  appId: "1:1036946798647:web:32bcbcf3d4eeacdc27e7b2",
  measurementId: "G-3Y9YLSS7QM"
};

const app = initializeApp(firebaseConfig);
const db= getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export {db, collection, addDoc, getDocs, auth};


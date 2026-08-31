import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDs1yfHSbvfB_W8Q9pUj1VB87med5rj7_g",
  authDomain: "smart-expense-tracker-8ebc5.firebaseapp.com",
  projectId: "smart-expense-tracker-8ebc5",
  storageBucket: "smart-expense-tracker-8ebc5.firebasestorage.app",
  messagingSenderId: "974034879516",
  appId: "1:974034879516:web:5089568194fb0974b64bd9",
  measurementId: "G-6T3YNEPG6R",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

export const storage = getStorage(app);
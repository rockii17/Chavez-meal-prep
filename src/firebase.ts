import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC3-ppEr1tzjIwQpiUSe93cbf7T7TVh3t8",
  authDomain: "chavez-meal-prep.firebaseapp.com",
  databaseURL: "https://chavez-meal-prep-default-rtdb.firebaseio.com",
  projectId: "chavez-meal-prep",
  storageBucket: "chavez-meal-prep.firebasestorage.app",
  messagingSenderId: "994836079360",
  appId: "1:994836079360:web:0b1507645065347a3349e5"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
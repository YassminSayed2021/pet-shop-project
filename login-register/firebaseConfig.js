// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js"; 
import { getStorage } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
const firebaseConfig = {
    apiKey: "AIzaSyB5yOKS1GEx11jkAqzGYXFVIoy1rmajvTE",
    authDomain: "pet-shop-d43b1.firebaseapp.com",
    projectId: "pet-shop-d43b1",
    storageBucket: "pet-shop-d43b1.appspot.com",
    messagingSenderId: "636548047608",
    appId: "1:636548047608:web:bdb8d1af6378af9745910d",
    measurementId: "G-JZ1WC81MBS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); 
const storage = getStorage(app);


export {storage,auth, provider,db };

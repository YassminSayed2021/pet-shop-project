import { auth } from './login-register/firebaseConfig.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const authLink = document.getElementById('authLink');

onAuthStateChanged(auth, (user) => {
  if (user) {
    authLink.textContent = 'logout';
    authLink.href = '#';
  } else {
    authLink.textContent = 'Login';
    authLink.href = './login-register/index.html';
  }
});

authLink.addEventListener('click', async (e) => {
  if (authLink.textContent === 'logout') {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = './login-register/index.html';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
});

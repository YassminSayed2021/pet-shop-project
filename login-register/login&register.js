// loginRegister.js
import { auth, provider } from"./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

function showLogin() {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginBtn.classList.add('active');
  registerBtn.classList.remove('active');
}

function showRegister() {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  loginBtn.classList.remove('active');
  registerBtn.classList.add('active');
}

loginBtn.addEventListener('click', showLogin);
registerBtn.addEventListener('click', showRegister);

// Validation functions
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isValidPassword(password) {
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return passwordPattern.test(password);
}

// Register
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  if (!isValidEmail(email)) {
    alert('❌ Invalid email format. Please enter a valid email.');
    return;
  }

  if (!isValidPassword(password)) {
    alert('❌ Password must be at least 8 characters long, contain uppercase, lowercase letters, and a number.');
    return;
  }

  if (password !== confirmPassword) {
    alert('❌ Passwords do not match. Please confirm your password.');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert(`✅ Registration successful! Welcome, ${userCredential.user.email}`);
      window.location.href = "/pet-shop-project/home.html";
    })
    .catch((error) => {
      alert(`❌ Registration failed: ${error.message}`);
    });
});

// Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!isValidEmail(email)) {
    alert('❌ Invalid email format. Please enter a valid email.');
    return;
  }

  if (password.length === 0) {
    alert('❌ Password cannot be empty.');
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert(`✅ Login successful! Welcome back, ${userCredential.user.email}`);
      window.location.href ="/pet-shop-project/home.html";
    })
    .catch((error) => {
      alert(`❌ Login failed: ${error.message}`);
    });
});

// Google sign-in handler
async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    alert(`✅ Welcome ${user.displayName}`);
    window.location.href ="/pet-shop-project/home.html";
  } catch (error) {
    alert(`❌ Error during Google Sign In: ${error.message}`);
  }
}

document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleSignIn);
document.getElementById('googleRegisterBtn').addEventListener('click', handleGoogleSignIn);
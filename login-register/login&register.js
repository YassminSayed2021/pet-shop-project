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
// register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  console.log("👉 Register Attempt: ", email, password);

  if (password !== confirmPassword) {
    alert('❌ Passwords do not match.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Registration Successful: ", userCredential);
    alert(`✅ Registration successful! Welcome, ${userCredential.user.email}`);
    window.location.href = "/pet-shop-project/home.html";
  } catch (error) {
    console.error("❌ Registration Error: ", error.message);
    alert(`❌ Registration failed: ${error.message}`);
  }
});

// login
loginForm.addEventListener('submit', async (e) => {
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

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert(`✅ Login successful! Welcome back, ${userCredential.user.email}`);
    window.location.href = "/pet-shop-project/home.html";
  } catch (error) {
    console.error("❌ Login Error: ", error.message);
    console.log('🔍 Error Code:', error.code);

    switch (error.code) {
      case 'auth/user-not-found':
        alert('❌ No user found with this email. Please register first.');
        break;
      case 'auth/wrong-password':
        alert('❌ Incorrect password. Please try again.');
        break;
      case 'auth/invalid-email':
        alert('❌ Invalid email format.');
        break;
      case 'auth/too-many-requests':
        alert('❌ Too many failed attempts. Please try again later.');
        break;
      case 'auth/invalid-login-credentials':
        alert('❌ Invalid login credentials. Please check your email and password.');
        break;
      default:
        alert(`❌ Login failed: ${error.message}`);
        break;
    }
  }
  }
);


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
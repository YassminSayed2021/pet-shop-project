import { auth, provider, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loadingDiv = document.getElementById('loading');

// Initialize loading state
if (loadingDiv) {
  loadingDiv.style.display = 'flex';
}

// Function to get redirect URL based on user role
async function getRedirectUrl(user) {
  try {
    console.log(`Fetching role for user: ${user.uid} (${user.email})`);
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn(`User document not found for UID: ${user.uid}`);
      return "../index.html"; // Default to user redirect
    }

    const userData = userDoc.data();
    const userRole = userData.role ? userData.role.trim().toLowerCase() : "user";
    console.log(`User role: ${userRole}, Data:`, userData);
    
    const redirectUrl = userRole === "admin" ? "../admin/admin.html" : "../index.html";
    console.log(`Redirect URL: ${redirectUrl}`);
    return redirectUrl;
  } catch (error) {
    console.error(`Error fetching user role: ${error.message} (Code: ${error.code})`);
    return "../index.html"; // Default to user redirect on error
  }
}

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
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  if (password !== confirmPassword) {
    alert('❌ Passwords do not match.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Set role based on email
    const isAdminEmail = email === "dr.hala.youssef@gmail.com";
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      provider: "email",
      createdAt: new Date(),
      role: isAdminEmail ? "admin" : "user"
    });
    console.log(`Created user document for ${user.email} with role: ${isAdminEmail ? "admin" : "user"}`);
    alert(`✅ Registration successful! Welcome, ${user.email}`);
    registerForm.reset();
    const redirectUrl = await getRedirectUrl(user);
    console.log(`Navigating to: ${redirectUrl}`);
    window.location.replace(redirectUrl);
  } catch (error) {
    console.error("❌ Registration Error:", error.message, error.code);
    alert(`❌ Registration failed: ${error.message}`);
  }
});

// Login
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
    const user = userCredential.user;
    console.log(`Logged in user: ${user.email}`);
    alert(`✅ Login successful! Welcome back, ${user.email}`);
    loginForm.reset();
    const redirectUrl = await getRedirectUrl(user);
    console.log(`Navigating to: ${redirectUrl}`);
    window.location.replace(redirectUrl);
  } catch (error) {
    console.error("❌ Login Error:", error.message, error.code);
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
});

// Google Sign-In
async function handleGoogleSignIn(isRegister) {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (isRegister) {
      if (docSnap.exists()) {
        alert("❌ This email is already registered. Please log in instead.");
        await auth.signOut();
        return;
      }
      // Set role based on email
      const isAdminEmail = user.email === "dr.hala.youssef@gmail.com";
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "User",
        provider: "google",
        createdAt: new Date(),
        role: isAdminEmail ? "admin" : "user"
      });
      console.log(`Created user document for ${user.email} with role: ${isAdminEmail ? "admin" : "user"}`);
      alert(`✅ Registration successful! Welcome, ${user.displayName || "User"}`);
      const redirectUrl = await getRedirectUrl(user);
      console.log(`Navigating to: ${redirectUrl}`);
      window.location.replace(redirectUrl);
    } else {
      if (!docSnap.exists()) {
        alert("❌ No account found. Please register first.");
        await auth.signOut();
        return;
      }
      const userData = docSnap.data();
      if (userData.provider !== "google") {
        alert("❌ This account was not registered with Google. Use email/password login.");
        await auth.signOut();
        return;
      }
      console.log(`Logged in user: ${user.email}`);
      alert(`✅ Welcome back, ${user.displayName || "User"}`);
      const redirectUrl = await getRedirectUrl(user);
      console.log(`Navigating to: ${redirectUrl}`);
      window.location.replace(redirectUrl);
    }
  } catch (error) {
    console.error("❌ Google Sign-In Error:", error.message, error.code);
    alert(`❌ Error during Google Sign-In: ${error.message}`);
  }
}

document.getElementById('googleLoginBtn').addEventListener('click', () => handleGoogleSignIn(false));
document.getElementById('googleRegisterBtn').addEventListener('click', () => handleGoogleSignIn(true));

// Handle authenticated users and loading state
onAuthStateChanged(auth, async (user) => {
  console.log("Auth state checked, user:", user ? { uid: user.uid, email: user.email } : null);
  if (user) {
    const isLoginOrRegisterPage = window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html");
    if (isLoginOrRegisterPage) {
      const redirectUrl = await getRedirectUrl(user);
      console.log(`Navigating to: ${redirectUrl}`);
      window.location.replace(redirectUrl);
    }
  } else {
    // Show page content for unauthenticated users
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
    document.body.style.visibility = 'visible';
  }
});
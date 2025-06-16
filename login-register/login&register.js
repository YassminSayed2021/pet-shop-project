import { auth, provider, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

// wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing login/register script');

  // get DOM elements
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const googleRegisterBtn = document.getElementById('googleRegisterBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');

  // Debug: Verify elements exist
  if (!loginForm || !registerForm || !loginBtn || !registerBtn || !googleLoginBtn || !googleRegisterBtn || !forgotPasswordForm || !forgotPasswordModal) {
    console.error('DOM elements missing:', {
      loginForm: !!loginForm,
      registerForm: !!registerForm,
      loginBtn: !!loginBtn,
      registerBtn: !!registerBtn,
      googleLoginBtn: !!googleLoginBtn,
      googleRegisterBtn: !!googleRegisterBtn,
      forgotPasswordForm: !!forgotPasswordForm,
      forgotPasswordModal: !!forgotPasswordModal
    });
    showToast('Page error: Please refresh and try again.', true);
    return;
  }

  // Show toast notification
  function showToast(message, isError = false) {
    console.log('Showing toast:', message, { isError });
    const toastEl = document.getElementById("appToast");
    if (!toastEl) {
      console.error('Toast element not found');
      return;
    }
    toastEl.querySelector(".toast-body").textContent = message;
    toastEl.querySelector(".toast-header").classList.toggle("bg-danger", isError);
    toastEl.querySelector(".toast-header").classList.toggle("bg-orange", !isError);
    const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
    toast.show();
  }

  // redirect based on user role
  async function getRedirectUrl(user) {
    try {
      console.log(`Fetching role for user: ${user.uid} (${user.email})`);
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.warn(`User document not found for UID: ${user.uid}`);
        return "../index.html";
      }

      const userData = userDoc.data();
      const userRole = userData.role ? userData.role.trim().toLowerCase() : "user";
      const redirectUrl = userRole === "admin" ? "../admin/admin.html" : "../index.html";
      console.log(`Redirect URL: ${redirectUrl}`);
      return redirectUrl;
    } catch (error) {
      console.error(`Error fetching user role: ${error.message}`);
      return "../index.html";
    }
  }

  // Switch between login and register forms
  function showLogin() {
    console.log('Switching to login form');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
  }

  function showRegister() {
    console.log('Switching to register form');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    loginBtn.classList.remove('active');
    registerBtn.classList.add('active');
  }

  // Attach event listeners for switching
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Login button clicked');
    showLogin();
  });
  registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Register button clicked');
    showRegister();
  });

  // validation
  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function isValidPassword(password) {
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordPattern.test(password);
  }

  // forgot Password
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Forgot password form submitted');
    
    const email = document.getElementById('reset-email').value.trim();

    if (!isValidEmail(email)) {
      showToast('Invalid email format. Please enter a valid email.', true);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`Password reset email sent to ${email}. Check your inbox or spam folder.`);
      forgotPasswordForm.reset();
      bootstrap.Modal.getInstance(forgotPasswordModal).hide();
    } catch (error) {
      console.error("Password Reset Error:", error.message, error.code);
      switch (error.code) {
        case 'auth/user-not-found':
          showToast('No user found with this email. Please register first.', true);
          break;
        case 'auth/invalid-email':
          showToast('Invalid email format.', true);
          break;
        default:
          showToast(`Password reset failed: ${error.message}`, true);
          break;
      }
    }
  });

  // register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (!isValidEmail(email)) {
      showToast('Invalid email format. Please enter a valid email.', true);
      return;
    }

    if (!isValidPassword(password)) {
      showToast('Password must be at least 8 characters, with a number, lowercase, and uppercase letter.', true);
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        provider: "email",
        createdAt: new Date(),
        role: "user",
        userId: user.uid
      });
      await sendEmailVerification(user);
      showToast(`Registration successful! Please verify your email (${user.email}) to log in.`);
      registerForm.reset();
      showLogin();
    } catch (error) {
      console.error("Registration Error:", error.message, error.code);
      switch (error.code) {
        case 'auth/email-already-in-use':
          showToast('This email is already registered. Please log in.', true);
          break;
        case 'auth/invalid-email':
          showToast('Invalid email format.', true);
          break;
        default:
          showToast(`Registration failed: ${error.message}`, true);
          break;
      }
    }
  });

  // login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!isValidEmail(email)) {
      showToast('Invalid email format. Please enter a valid email.', true);
      return;
    }

    if (password.length === 0) {
      showToast('Password cannot be empty.', true);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        showToast('Please verify your email before logging in.', true);
        await auth.signOut();
        return;
      }
      showToast(`Login successful! Welcome back, ${user.email}`);
      loginForm.reset();
      const redirectUrl = await getRedirectUrl(user);
      window.location.replace(redirectUrl);
    } catch (error) {
      console.error("Login Error:", error.message, error.code);
      switch (error.code) {
        case 'auth/user-not-found':
          showToast('No user found with this email. Please register first.', true);
          break;
        case 'auth/wrong-password':
          showToast('Incorrect password. Please try again.', true);
          break;
        case 'auth/invalid-email':
          showToast('Invalid email format.', true);
          break;
        case 'auth/too-many-requests':
          showToast('Too many failed attempts. Please try again later.', true);
          break;
        case 'auth/invalid-login-credentials':
          showToast('Invalid login credentials. Please check your email and password.', true);
          break;
        default:
          showToast(`Login failed: ${error.message}`, true);
          break;
      }
    }
  });

  // google Sign-In
  async function handleGoogleSignIn(isRegister) {
    console.log(`Google Sign-In triggered, isRegister: ${isRegister}`);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (isRegister) {
        if (docSnap.exists()) {
          showToast("This email is already registered. Please log in instead.", true);
          await auth.signOut();
          return;
        }
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "User",
          provider: "google",
          createdAt: new Date(),
          role: "user",
          userId: user.uid
        });
        showToast(`Registration successful! Welcome, ${user.displayName || "User"}`);
        const redirectUrl = await getRedirectUrl(user);
        window.location.replace(redirectUrl);
      } else {
        if (!docSnap.exists()) {
          showToast("No account found. Please register first.", true);
          await auth.signOut();
          return;
        }
        const userData = docSnap.data();
        if (userData.provider !== "google") {
          showToast("This account was not registered with Google. Use email/password login.", true);
          await auth.signOut();
          return;
        }
        showToast(`Welcome back, ${user.displayName || "User"}`);
        const redirectUrl = await getRedirectUrl(user);
        window.location.replace(redirectUrl);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error.message, error.code);
      showToast(`Error during Google Sign-In: ${error.message}`, true);
    }
  }

  googleLoginBtn.addEventListener('click', () => {
    console.log('Google Login button clicked');
    handleGoogleSignIn(false);
  });
  googleRegisterBtn.addEventListener('click', () => {
    console.log('Google Register button clicked');
    handleGoogleSignIn(true);
  });

  // handle authenticated users
  onAuthStateChanged(auth, async (user) => {
    console.log("Auth state checked, user:", user ? { uid: user.uid, email: user.email } : null);
    if (user) {
      const isLoginOrRegisterPage = window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html");
      if (isLoginOrRegisterPage) {
        if (user.providerData[0].providerId === "password" && !user.emailVerified) {
          showToast('Please verify your email before logging in.', true);
          await auth.signOut();
          showLogin();
          return;
        }
        try {
          const redirectUrl = await getRedirectUrl(user);
          window.location.replace(redirectUrl);
        } catch (error) {
          console.error(`Error determining redirect URL: ${error.message}`);
          window.location.replace("../index.html");
        }
      }
    } else {
      console.log('No user logged in, showing login form');
      document.body.style.visibility = 'visible';
      showLogin();
    }
  });

  // initialize with login form
  console.log('Initializing with login form');
  showLogin();
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
  getAuth,
  EmailAuthProvider,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5yOKS1GEx11jkAqzGYXFVIoy1rmajvTE",
  authDomain: "pet-shop-d43b1.firebaseapp.com",
  projectId: "pet-shop-d43b1",
  storageBucket: "pet-shop-d43b1.firebasestorage.app",
  messagingSenderId: "636548047608",
  appId: "1:636548047608:web:bdb8d1af6378af9745910d",
  measurementId: "G-JZ1WC81MBS",
  databaseURL: "https://pet-shop-d43b1-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userInfo = document.getElementById('userInfo');
const updateEmailForm = document.getElementById('updateEmailForm');
const updatePasswordForm = document.getElementById('updatePasswordForm');
const currentEmailInput = document.getElementById('currentEmail');
const newEmailInput = document.getElementById('newEmail');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please log in to access your profile.");
    window.location.href = "../index.html";
  } else {
    loadUserInfo(user);
  }
});

async function loadUserInfo(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
   // hide userid 
    userInfo.innerHTML = `
   <!-- <div class="form-group">
        <label>User ID</label>
        <input type="text" value="${user.uid}" readonly>
      </div> --> 
      <div class="form-group">
        <label>Email</label>
        <input type="email" value="${user.email}" readonly>
      </div>
      <div class="form-group">
        <label>Account Created</label>
        <input type="text" value="${new Date(user.metadata.creationTime).toLocaleString()}" readonly>
      </div>
    `;

    currentEmailInput.value = user.email;
  } catch (error) {
    console.error("Error loading user info:", error);
    userInfo.innerHTML = '<div class="error">Error loading user information. Please try again.</div>';
  }
}

updateEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newEmail = newEmailInput.value;
  const user = auth.currentUser;

  try {
    await updateEmail(user, newEmail);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { email: newEmail });

    alert('Email updated successfully!');
    currentEmailInput.value = newEmail;
    updateEmailForm.reset();
  } catch (error) {
    console.error("Error updating email:", error);
    alert("Error updating email. Please try again.");
  }
});

updatePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const user = auth.currentUser;

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match!");
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);

    alert('Password updated successfully!');
    updatePasswordForm.reset();
  } catch (error) {
    console.error("Error updating password:", error);
    if (error.code === 'auth/wrong-password') {
      alert("Current password is incorrect.");
    } else {
      alert("Error updating password. Please try again.");
    }
  }
});

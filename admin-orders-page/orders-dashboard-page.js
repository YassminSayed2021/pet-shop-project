import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  getDocs,
  query,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5yOKS1GEx11jkAqzGYXFVIoy1rmajvTE",
  authDomain: "pet-shop-d43b1.firebaseapp.com",
  projectId: "pet-shop-d43b1",
  storageBucket: "pet-shop-d43b1.firebasestorage.app",
  messagingSenderId: "636548047608",
  appId: "1:636548047608:web:bdb8d1af6378af9745910d",
  measurementId: "G-JZ1WC81MBS",
  databaseURL: "https://pet-shop-d43b1-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserRole = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in to access this page.");
    window.location.href = "../index.html";
    return;
  }

  // Get the user's document to check their role
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    alert("User record not found. Please contact support.");
    auth.signOut();
    return;
  }

  const userData = userDocSnap.data();
  currentUserRole = userData.role;

  if (currentUserRole !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "../index.html"; // or redirect to a user page
    return;
  }

  // If admin, load the users dropdown and enable admin features
  loadUsers();
});

async function loadUsers() {
  const userSelect = document.getElementById("userSelect");
  userSelect.innerHTML = `<option value="">Select a user</option>`; // reset options

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      const option = document.createElement("option");
      option.value = doc.id;  // Correct the ID usage here
      option.textContent = user.email;
      userSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    alert("Failed to load users.");
  }

  userSelect.addEventListener("change", (e) => {
    const userId = e.target.value;
    if (userId) {
      loadOrders(userId);
    } else {
      clearOrdersTable();
    }
  });
}

async function loadOrders(userId) {
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = ""; // Clear table

  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      limit(20)
    );
    const ordersSnapshot = await getDocs(q);

    if (ordersSnapshot.empty) {
      ordersTableBody.innerHTML = `<tr><td colspan="4" class="py-2 px-4 text-center text-gray-500">No orders found</td></tr>`;
      return;
    }

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${order.productTitle}</td>
        <td class="py-2 px-4 border-b">${order.quantity}</td>
        <td class="py-2 px-4 border-b">$${order.price}</td>
        <td class="py-2 px-4 border-b">${order.status}</td>
      `;
      ordersTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    ordersTableBody.innerHTML = `<tr><td colspan="4" class="py-2 px-4 text-center text-red-500">Error loading orders</td></tr>`;
  }
}

function clearOrdersTable() {
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = `<tr><td colspan="4" class="py-2 px-4 text-center text-gray-500">Select a user to view orders</td></tr>`;
}

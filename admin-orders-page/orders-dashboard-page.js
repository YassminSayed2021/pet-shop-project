
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5yOKS1GEx11jkAqzGYXFVIoy1rmajvTE",
  authDomain: "pet-shop-d43b1.firebaseapp.com",
  projectId: "pet-shop-d43b1",
  storageBucket: "pet-shop-d43b1.firebasestorage.app",
  messagingSenderId: "636548047608",
  appId: "1:636548047608:web:bdb8d1af6378af9745910d",
  measurementId: "G-JZ1WC81MBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Please log in as an admin to access this page.");
    window.location.href = "../index.html"; 
  } else {
    loadUsers();
  }
});


function loadUsers() {
  const userSelect = document.getElementById("userSelect");
  db.collection("users").get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const user = doc.data();
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = user.email;
      userSelect.appendChild(option);
    });
  }).catch(error => {
    console.error("Error loading users:", error);
    alert("Failed to load users.");
  });

  
  userSelect.addEventListener("change", (e) => {
    const userId = e.target.value;
    if (userId) {
      loadOrders(userId);
    } else {
      clearOrdersTable();
    }
  });
}


function loadOrders(userId) {
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = ""; // Clear table

  db.collection("orders")
    .where("userId", "==", userId)
    .limit(20)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        ordersTableBody.innerHTML = `<tr><td colspan="4" class="py-2 px-4 text-center text-gray-500">No orders found</td></tr>`;
        return;
      }
      querySnapshot.forEach(doc => {
        const order = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="py-2 px-4 border-b">${order.orderId}</td>
          <td class="py-2 px-4 border-b">${new Date(order.date.toDate()).toLocaleString()}</td>
          <td class="py-2 px-4 border-b">$${order.price}</td>
          <td class="py-2 px-4 border-b">${order.status}</td>
        `;
        ordersTableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Error loading orders:", error);
      ordersTableBody.innerHTML = `<tr><td colspan="4" class="py-2 px-4 text-center text-red-500">Error loading orders</td></tr>`;
    });
}

function clearOrdersTable() {
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = `<tr><td colspan="4" class="py-2 px-4 text-center text-gray-500">Select a user to view orders</td></tr>`;
}
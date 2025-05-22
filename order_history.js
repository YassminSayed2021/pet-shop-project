import { db, auth } from './login-register/firebaseConfig.js';
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

    const tbody = document.querySelector("tbody");

onAuthStateChanged(auth, async (user) => {

  if (user) {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    try {
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        tbody.innerHTML = `
          <tr><td colspan="5" style="text-align:center">No orders found</td></tr>
        `;
        return;
      }

      snapshot.forEach((doc) => {

        const order = doc.data();
        const row = document.createElement('tr');
let index =0;
        row.innerHTML = `
          <td>#${index+1}</td>
          <td>${order.productTitle || 'N/A'}</td>
          <td>${order.paymentMethod || 'N/A'}</td>
          <td><span class="status-${order.status?.toLowerCase()}">${order.status}</span></td>
          <td>$${order.total || 0}</td>
        `;

        tbody.appendChild(row);

      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  } else {
    window.location.href = "login.html"; 
  }
});
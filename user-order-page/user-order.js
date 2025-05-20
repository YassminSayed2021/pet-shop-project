import { db, auth } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const recentContainer = document.getElementById("recent-orders");
const testUID = "xKCBUtP9b4Rd1cUjERmREDiMuH13"; 

function displayOrder(order, container) {
  const div = document.createElement('div');
  div.className = 'order-card';
  div.innerHTML = `
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Date:</strong> ${order.date.toDate().toLocaleDateString()}</p>
    <p><strong>Items:</strong> ${order.items.join(', ')}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
  `;
  container.appendChild(div);
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      //where("userId", "==", testUID),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    const now = new Date();
    querySnapshot.forEach(doc => {
      const order = doc.data();
      order.id = doc.id;
      displayOrder(order, recentContainer);  
    });
  } else {
    alert("Please log in to view your orders.");
  }
});


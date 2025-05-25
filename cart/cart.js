
import { db, auth } from '../login-register/firebaseConfig.js';
import {
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const cartItemsContainer = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const emptyCartSection = document.getElementById("empty-cart");
const cartSection = document.querySelector(".cart-section");

// Retrieve cart from localStorage
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

function updateTotals() {
  let subtotal = 0;
  cartItems.forEach(item => subtotal += item.price * item.quantity);
  subtotalEl.textContent = subtotal.toFixed(2);
}

function renderCart() {
  cartItemsContainer.innerHTML = "";
  const hasItems = cartItems.length > 0;

  // Show/hide appropriate sections
  cartSection.style.display = hasItems ? "block" : "none";
  emptyCartSection.classList.toggle("hidden", hasItems);

  if (!hasItems) return;

  cartItems.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="item-cell">
        <img src="${item.image}" alt="${item.title}" class="item-img">
        <div><strong>${item.title}</strong></div>
      </td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <div class="quantity-controls">
          <button onclick="changeQty(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>
      </td>
      <td>
        $${(item.price * item.quantity).toFixed(2)}
        <button class="delete-btn" onclick="deleteItem(${index})">🗑️</button>
      </td>
    `;
    cartItemsContainer.appendChild(row);
  });

  updateTotals();
}

// Make these functions global so they can be called from HTML
window.changeQty = function(index, delta) {
  let newQty = cartItems[index].quantity + delta;
  if (newQty <= 0) {
    const confirmDelete = confirm("Quantity is 0. Do you want to remove this item?");
    if (confirmDelete) {
      deleteItem(index);
    } else {
      cartItems[index].quantity = 1;
    }
  } else {
    cartItems[index].quantity = newQty;
  }
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCart();
};

window.deleteItem = function(index) {
  cartItems.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCart();
};

window.goToShop = function() {
  window.location.href = "../index.html";
};

window.goToPay = function() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You need to log in before checking out.");
      window.location.href = "../login-register/login.html";
      return;
    }

    let subtotal = 0;
    cartItems.forEach(p => subtotal += p.price * p.quantity);
    const finalAmount = subtotal.toFixed(2);
    localStorage.setItem('finalAmount', finalAmount);

    try {
      for (const item of cartItems) {
        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          productTitle: item.title,
          quantity: item.quantity,
          price: item.price,
          status: "Pending",
          paymentMethod: "Card",
          total: item.price * item.quantity,

        });
      }

      // Clear the cart
      localStorage.removeItem('cart');
      cartItems = [];

      // Redirect to payment page
      window.location.href = "../payment-page/payment-page.html";

    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to place order. Try again.");
    }
  });
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
});



// import { db, auth } from '../login-register/firebaseConfig.js';
// import {
//   addDoc,
//   collection,
//   serverTimestamp
// } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
// import {
//   onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

// const cartItemsContainer = document.getElementById("cart-items");
// const subtotalEl = document.getElementById("subtotal");
// const emptyCartSection = document.getElementById("empty-cart");
// const cartSection = document.querySelector(".cart-section");

// let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// function updateTotals() {
//   let subtotal = 0;
//   cartItems.forEach(item => subtotal += item.price * item.quantity);
//   subtotalEl.textContent = subtotal.toFixed(2);
// }

// function renderCart() {
//   cartItemsContainer.innerHTML = "";
//   const hasItems = cartItems.length > 0;

//   cartSection.style.display = hasItems ? "block" : "none";
//   emptyCartSection.classList.toggle("hidden", hasItems);

//   if (!hasItems) return;

//   cartItems.forEach((item, index) => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td class="item-cell">
//         <img src="${item.image}" alt="${item.title}" class="item-img">
//         <div><strong>${item.title}</strong></div>
//       </td>
//       <td>$${item.price.toFixed(2)}</td>
//       <td>
//         <div class="quantity-controls">
//           <button onclick="changeQty(${index}, -1)">-</button>
//           <span>${item.quantity}</span>
//           <button onclick="changeQty(${index}, 1)">+</button>
//         </div>
//       </td>
//       <td>
//         $${(item.price * item.quantity).toFixed(2)}
//         <button class="delete-btn" onclick="deleteItem(${index})">🗑️</button>
//       </td>
//     `;
//     cartItemsContainer.appendChild(row);
//   });

//   updateTotals();
// }

// window.changeQty = function(index, delta) {
//   let newQty = cartItems[index].quantity + delta;
//   if (newQty <= 0) {
//     const confirmDelete = confirm("Quantity is 0. Do you want to remove this item?");
//     if (confirmDelete) {
//       deleteItem(index);
//     } else {
//       cartItems[index].quantity = 1;
//     }
//   } else {
//     cartItems[index].quantity = newQty;
//   }
//   localStorage.setItem('cart', JSON.stringify(cartItems));
//   renderCart();
// };

// window.deleteItem = function(index) {
//   cartItems.splice(index, 1);
//   localStorage.setItem('cart', JSON.stringify(cartItems));
//   renderCart();
// };

// window.goToShop = function() {
//   window.location.href = "../index.html";
// };

// window.goToPay = function() {
//   onAuthStateChanged(auth, async (user) => {
//     if (!user) {
//       alert("You need to log in before checking out.");
//       window.location.href = "../login-register/login.html";
//       return;
//     }

//     if (cartItems.length === 0) {
//       alert("Your cart is empty.");
//       return;
//     }

//     const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

//     const orderData = {
//       userId: user.uid,
//       products: cartItems.map(item => ({
//         title: item.title,
//         quantity: item.quantity,
//         price: item.price,
//         image: item.image,
//         total: item.price * item.quantity
//       })),
//       total: total.toFixed(2),
//       status: "Pending",
//       paymentMethod: "Card",
//       createdAt: serverTimestamp()
//     };

//     try {
//       await addDoc(collection(db, "orders"), orderData);

//       localStorage.removeItem('cart');
//       cartItems = [];

//       window.location.href = "../payment-page/payment-page.html";

//     } catch (error) {
//       console.error("Error saving order:", error);
//       alert("Failed to place order. Try again.");
//     }
//   });
// };

// document.addEventListener('DOMContentLoaded', function() {
//   renderCart();
// });


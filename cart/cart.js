// import { db } from '../login-register/firebaseConfig.js';
// import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

// function getProductIdFromUrl() {
//   const params = new URLSearchParams(window.location.search);
//   return params.get('id');
// }

    
  

//     const cartItemsContainer = document.getElementById("cart-items");
//     const subtotalEl = document.getElementById("subtotal");

//     function updateTotals() {
//       let subtotal = 0;
//       products.forEach(p => subtotal += p.price * p.quantity);
//       subtotalEl.textContent = subtotal.toFixed(2);
//     }

//     function renderCart() {
//       cartItemsContainer.innerHTML = "";
//       const hasItems = products.length > 0;

//       document.querySelector(".cart-section").style.display = hasItems ? "block" : "none";
//       document.getElementById("empty-cart").classList.toggle("hidden", hasItems);

//       if (!hasItems) return;

//       products.forEach((product, index) => {
//         const row = document.createElement("tr");
//         row.innerHTML = `
//           <td class="item-cell">
//             <img src="${product.image}" alt="${product.name}" class="item-img">
//             <div><strong>${product.name}</strong></div>
//           </td>
//           <td>$${product.price.toFixed(2)}</td>
//           <td>
//             <div class="quantity-controls">
//               <button onclick="changeQty(${index}, -1)">-</button>
//               <span>${product.quantity}</span>
//               <button onclick="changeQty(${index}, 1)">+</button>
//             </div>
//           </td>
//           <td>
//             $${(product.price * product.quantity).toFixed(2)}
//             <button class="delete-btn" onclick="deleteItem(${index})">🗑️</button>
//           </td>
//         `;
//         cartItemsContainer.appendChild(row);
//       });

//       updateTotals();
//     }

//     function changeQty(index, delta) {
//       let newQty = products[index].quantity + delta;
//       if (newQty <= 0) {
//         const confirmDelete = confirm("Quantity is 0. Do you want to remove this item?");
//         if (confirmDelete) {
//           deleteItem(index);
//         } else {
//           products[index].quantity = 1;
//         }
//       } else {
//         products[index].quantity = newQty;
//       }
//       renderCart();
//     }

//     function deleteItem(index) {
//       products.splice(index, 1);
//       renderCart();
//     }

//     function goToShop() {
//       window.location.href = "index.html";
//     }
//     function goToPay() {
//       window.location.href = "pay.html";
//     }

    // renderCart();
    // Cart functionality
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
  // Save changes to localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCart();
};

window.deleteItem = function(index) {
  cartItems.splice(index, 1);
  // Save changes to localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCart();
};

window.goToShop = function() {
  window.location.href = "../index.html";
};

window.goToPay = function() {
  const subtotal = document.getElementById('subtotal').textContent.trim();
  const amount = encodeURIComponent(subtotal);
  window.location.href = `../payment-page/payment-page.html?amount=${amount}`;
  // In a real app, this would go to a payment page
  alert("Proceeding to payment... (This would go to a payment page in a real app)");
  // For demo purposes, clear the cart after "checkout"
  localStorage.removeItem('cart');
  cartItems = [];
  renderCart();
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
});
// import { db } from '../login-register/firebaseConfig.js';
// import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";


// function getProductIdFromUrl() {
//   const params = new URLSearchParams(window.location.search);
//   return params.get('id');
// }




// function displayProductDetails(product) {
//   document.getElementById('productImg').src = product.images[0] || './img/default.jpg';

//   const detailSection = document.querySelector('.details');
//   detailSection.innerHTML = `
//     <div class="stock-info">
//       <h3>Price:</h3>
//       <h4>${product.price} EGP</h4>
//     </div>
//     <div class="stock-info">
//       <h3>Stock:</h3>
//       <h4>${product.stock || 'N/A'}</h4>
//     </div>
//     <div class="stock-info">
//       <h3>Category:</h3>
//       <h4>${product.category || 'N/A'}</h4>
//     </div>
//     <p>${product.description || 'No description available.'}</p>
//   `;
// }





// let currentProduct = null;



// async function fetchProductDetails(productId) {
  
//   try {
//     const productRef = doc(db, "products", productId);
//     const docSnap = await getDoc(productRef);

//     if (docSnap.exists()) {
//       const product = docSnap.data();
//       currentProduct = product;
//       displayProductDetails(product);
//     } else {
//       alert("Product not found");
//     }
//   } catch (error) {
//     console.error("Error getting product details:", error);
//   }
// }


// document.getElementById("buyNowBtn").addEventListener("click", () => {
//   if (!currentProduct) {
//     alert("Product not loaded yet.");
//     return;
//   }

//   const quantityInput = document.querySelector('input[name="quantity"]');
//   const quantity = parseInt(quantityInput.value) || 1;

//   const subtotal = currentProduct.price * quantity;
//   const finalAmount = subtotal.toFixed(2);

//   localStorage.setItem('finalAmount', finalAmount);
//   localStorage.setItem('productName', currentProduct.name ?? "Product");
//   localStorage.setItem('productImage', currentProduct.images?.[0] ?? './img/default.jpg');

//   window.location.href = "../payment-page/payment-page.html";
// });



// const productId = getProductIdFromUrl();
// if (productId) {
//   fetchProductDetails(productId);
// } else {
//   alert("No product ID provided in the URL.");
// }






















import { db, auth } from '../login-register/firebaseConfig.js';
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function displayProductDetails(product) {
  document.getElementById('productImg').src = product.images?.[0] || './img/default.jpg';

  const detailSection = document.querySelector('.details');
  detailSection.innerHTML = `
    <div class="stock-info">
      <h3>Price:</h3>
      <h4>${product.price} EGP</h4>
    </div>
    <div class="stock-info">
      <h3>Stock:</h3>
      <h4 id="stockDisplay">${product.stock ?? 'N/A'}</h4>
    </div>
    <div class="stock-info">
      <h3>Category:</h3>
      <h4>${product.category ?? 'N/A'}</h4>
    </div>
    <p>${product.description ?? 'No description available.'}</p>
  `;
}

let currentProduct = null;
let currentProductId = null;

async function fetchProductDetails(productId) {
  try {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      currentProduct = docSnap.data();
      currentProductId = productId;
      displayProductDetails(currentProduct);
    } else {
      alert("Product not found.");
    }
  } catch (error) {
    console.error("❌ Error getting product details:", error.message);
    alert("Failed to load product. Try again later.");
  }
}

async function updateStockAndRedirect(quantity) {
  try {
    const productRef = doc(db, "products", currentProductId);

    const newStock = currentProduct.stock - quantity;
    if (newStock < 0) {
      alert("Not enough stock available.");
      return;
    }

    await updateDoc(productRef, { stock: newStock });

    // Update stock on screen immediately
    document.getElementById("stockDisplay").textContent = newStock;

    // Store checkout data
    const subtotal = currentProduct.price * quantity;
    localStorage.setItem('finalAmount', subtotal.toFixed(2));
    localStorage.setItem('productName', currentProduct.name ?? "Product");
    localStorage.setItem('productImage', currentProduct.images?.[0] ?? './img/default.jpg');

    window.location.href = "../payment-page/payment-page.html";

  } catch (error) {
    console.error("❌ Failed to update stock:", error.message);
    alert("Failed to update product stock. " + error.message);
  }
}

document.getElementById("buyNowBtn").addEventListener("click", () => {
  const quantityInput = document.querySelector('input[name="quantity"]');
  const quantity = parseInt(quantityInput.value) || 1;

  if (!currentProduct) {
    alert("Product not loaded yet.");
    return;
  }

  // Ensure user is logged in
  onAuthStateChanged(auth, user => {
    if (!user) {
      alert("You must be logged in to make a purchase.");
      return;
    }

    updateStockAndRedirect(quantity);
  });
});

// Run on load
const productId = getProductIdFromUrl();
if (productId) {
  fetchProductDetails(productId);
} else {
  alert("No product ID provided in the URL.");
}

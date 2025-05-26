import { db } from '../login-register/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";


function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}




function displayProductDetails(product) {
  document.getElementById('productImg').src = product.images[0] || './img/default.jpg';

  const detailSection = document.querySelector('.details');
  detailSection.innerHTML = `
    <div class="stock-info">
      <h3>Price:</h3>
      <h4>${product.price} EGP</h4>
    </div>
    <div class="stock-info">
      <h3>Stock:</h3>
      <h4>${product.stock || 'N/A'}</h4>
    </div>
    <div class="stock-info">
      <h3>Category:</h3>
      <h4>${product.category || 'N/A'}</h4>
    </div>
    <p>${product.description || 'No description available.'}</p>
  `;
}





let currentProduct = null;



async function fetchProductDetails(productId) {
  
  try {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      const product = docSnap.data();
      currentProduct = product;
      displayProductDetails(product);
    } else {
      alert("Product not found");
    }
  } catch (error) {
    console.error("Error getting product details:", error);
  }
}


document.getElementById("buyNowBtn").addEventListener("click", () => {
  if (!currentProduct) {
    alert("Product not loaded yet.");
    return;
  }

  const quantityInput = document.querySelector('input[name="quantity"]');
  const quantity = parseInt(quantityInput.value) || 1;

  const subtotal = currentProduct.price * quantity;
  const finalAmount = subtotal.toFixed(2);

  localStorage.setItem('finalAmount', finalAmount);
  localStorage.setItem('productName', currentProduct.name ?? "Product");
  localStorage.setItem('productImage', currentProduct.images?.[0] ?? './img/default.jpg');

  window.location.href = "../payment-page/payment-page.html";
});



const productId = getProductIdFromUrl();
if (productId) {
  fetchProductDetails(productId);
} else {
  alert("No product ID provided in the URL.");
}









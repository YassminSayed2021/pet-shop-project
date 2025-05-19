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








async function fetchProductDetails(productId) {
  try {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      const product = docSnap.data();
      displayProductDetails(product);
    } else {
      alert("Product not found");
    }
  } catch (error) {
    console.error("Error getting product details:", error);
  }
}

const productId = getProductIdFromUrl();
if (productId) {
  fetchProductDetails(productId);
} else {
  alert("No product ID provided in the URL.");
}




// const productImg = document.getElementById('productImg');
// const leftArrow = document.querySelector('.left-arrow');
// const rightArrow = document.querySelector('.right-arrow');

// const images = [
//     'img/product-1.jpg',
//     'img/product-1_0.jpg',

// ];



// let currentIndex = 0;

// function updateImage(index) {
//     productImg.classList.add('fade-out');
//     setTimeout(() => {
//         productImg.src = images[index];
//         productImg.classList.remove('fade-out');
//         productImg.classList.add('fade-in');
//         setTimeout(() => productImg.classList.remove('fade-in'), 300);
//     }, 200);
// }


// leftArrow.addEventListener('click', () => {
//     currentIndex = (currentIndex - 1 + images.length) % images.length;
//     updateImage(currentIndex);
// });

// rightArrow.addEventListener('click', () => {
//     currentIndex = (currentIndex + 1) % images.length;
//     updateImage(currentIndex);
// });

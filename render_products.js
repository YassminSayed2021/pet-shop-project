
import { db } from './login-register/firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const productList = document.getElementById('product-list');
const paginationContainer = document.getElementById('pagination');
const priceRange = document.querySelectorAll('input[name="price"]');
const cartItems = document.querySelectorAll("cart-items");
const PRODUCTS_PER_PAGE = 6;
let currentPage = 1;
let allProducts = [];
let filteredProducts = [];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartBadge();

function renderProducts(page = 1) {
  productList.innerHTML = '';

  const source = filteredProducts.length ? filteredProducts : allProducts;
  
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const productsToShow = source.slice(start, end);

  if (productsToShow.length === 0) {
    productList.innerHTML = '<p style="text-align:center;padding:2rem;font-size:1.2rem;">No products found.</p>';
    paginationContainer.innerHTML = '';
    return;
  }




  productsToShow.forEach(product => {
    const li = document.createElement('li');
    li.classList.add('product-item');
  
    li.innerHTML = `
      <div class="product-card">
        <div class="card-banner img-holder">
         <img src="${product.images?.[0] || 'default.jpg'}" alt="${product.title}" class="img-cover default" />
<img src="${product.images?.[1] || product.images?.[0] || 'default.jpg'}" alt="${product.title}" class="img-cover hover" />

          <button class="card-action-btn" aria-label="add to cart" title="Add To Cart" onclick="addToCart('${product.id}')">
            <ion-icon name="bag-add-outline" aria-hidden="true"></ion-icon>
          </button>
        </div>
        <div class="card-content">
          <div class="wrapper">
            <div class="rating-wrapper gray">
              ${'<ion-icon name="star" aria-hidden="true"></ion-icon>'.repeat(product.rating)}
            </div>
          </div>
          <h3 class="h3"><a href="./product-detials/productdetials.html?id=${product.id}" class="card-title">${product.title}</a></h3>
          <data class="card-price" value="${product.price}">$${product.price}.00</data>
        </div>
      </div>
    `;

    const addToCartBtn = li.querySelector('.card-action-btn');
    addToCartBtn.addEventListener('click', () => addToCart(product));
    
    productList.appendChild(li);
  });

  renderPagination();



  
}


function renderPagination() {
  const source = filteredProducts.length ? filteredProducts : allProducts;
  const totalPages = Math.ceil(source.length / PRODUCTS_PER_PAGE);
  paginationContainer.innerHTML = '';
  if (totalPages <= 1) return; // No need to show pagination

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.toggle('active', i === currentPage);
    btn.addEventListener('click', () => {
      currentPage = i;
      renderProducts(currentPage);
    });
    paginationContainer.appendChild(btn);
  }
}
function addToCart(product) {
  const existingProductIndex = cart.findIndex(item => item.id === product.id);
  if (existingProductIndex !== -1) {
    cart[existingProductIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || './images/product-1.jpg',
      quantity: 1
    });
  }
    localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
  showAddToCartFeedback();
}
function updateCartBadge() {
  const badge = document.querySelector('.btn-badge');
  if (badge) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    badge.textContent = totalItems;
  }
}
function showAddToCartFeedback() {
   const feedback = document.createElement('div');
  feedback.classList.add('add-to-cart-feedback');
  feedback.textContent = 'Product added to cart!';
    document.body.appendChild(feedback);
      setTimeout(() => {
    feedback.remove();
  }, 2000);
}
async function fetchProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
allProducts = snapshot.docs.map(doc => {
  const product = doc.data();
  product.id = doc.id;
  return product;
});
    filteredProducts = allProducts;
    renderProducts(currentPage);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}
// function generateDummyProducts() {
//   const dummyProducts = [];
  
//   for (let i = 1; i <= 8; i++) {
//     dummyProducts.push({
//       id: `dummy-${i}`,
//       title: `Pet Product ${i}`,
//       price: Math.floor(Math.random() * 100) + 20,
//       rating: Math.floor(Math.random() * 5) + 1,
//       images: [`./images/product-${i % 7 + 1}.jpg`, `./images/product-${i % 7 + 1}_0.jpg`]
//     });
//   }
  
//   return dummyProducts;
// }
priceRange.forEach(radio => {
  radio.addEventListener('change', function () {
    const range = this.value;

    if (range === 'all') {
      filteredProducts = allProducts;
    } else {
      const [min, max] = range
        .replace(/\$/g, '')
        .replace(/\s/g, '')
        .split('-')
        .map(Number);

      filteredProducts = allProducts.filter(product => {
        const price = Number(product.price);
        return !isNaN(price) && price >= min && price <= max;
      });
    }

    currentPage = 1;
    renderProducts(currentPage);
  });
});

document.querySelector('.action-btn[aria-label="cart"]').addEventListener('click', () => {
  window.location.href = './cart/cart.html';
});

fetchProducts();

//================================================================================================================================================


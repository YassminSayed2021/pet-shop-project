import { db } from './login-register/firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const productList = document.getElementById('product-list');
const paginationContainer = document.getElementById('pagination');

const PRODUCTS_PER_PAGE = 6;
let currentPage = 1;
let allProducts = [];

function renderProducts(page = 1) {
  productList.innerHTML = '';

  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const productsToShow = allProducts.slice(start, end);

  productsToShow.forEach(product => {
    const li = document.createElement('li');
    li.classList.add('product-item');

    li.innerHTML = `
      <div class="product-card">
        <div class="card-banner img-holder">
          <img src="${product.images[0]}" alt="${product.title}" class="img-cover default" />
          <img src="${product.images[1]}" alt="${product.title}" class="img-cover hover" />
          <button class="card-action-btn" aria-label="add to cart" title="Add To Cart">
            <ion-icon name="bag-add-outline" aria-hidden="true"></ion-icon>
          </button>
        </div>
        <div class="card-content">
          <div class="wrapper">
            <div class="rating-wrapper gray">
              ${'<ion-icon name="star" aria-hidden="true"></ion-icon>'.repeat(product.rating)}
            </div>
          </div>
          <h3 class="h3"><a href="#" class="card-title">${product.title}</a></h3>
          <data class="card-price" value="${product.price}">$${product.price}.00</data>
        </div>
      </div>
    `;
    productList.appendChild(li);
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  paginationContainer.innerHTML = '';

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

async function fetchProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    allProducts = snapshot.docs.map(doc => doc.data());
    renderProducts(currentPage);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

fetchProducts();




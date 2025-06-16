import { db, auth } from "../login-register/firebaseConfig.js";
import {
  collection, addDoc, getDocs, doc, deleteDoc,
  updateDoc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dfcl3kecg/image/upload";
const uploadPreset = "petshop";

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const userList = document.getElementById("userList");
const logoutBtn = document.getElementById("logoutBtn");
const totalProducts = document.getElementById("totalProducts");
const totalAdmins = document.getElementById("totalAdmins");
const productSearch = document.getElementById("productSearch");
const userSearch = document.getElementById("userSearch");
const scrollTopBtn = document.getElementById("scrollTopBtn");

const productsCollection = collection(db, "products");
const usersCollection = collection(db, "users");
const defaultImage = "/admin/default image product.jpg";

let editProductId = null;
let productsData = [];
let usersData = [];

// Show toast notification
function showToast(message) {
  const toastEl = document.getElementById("appToast");
  toastEl.querySelector(".toast-body").textContent = message;
  const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
  toast.show();
}

// logout button
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("Signed out successfully!");
    setTimeout(() => window.location.replace("../login-register/index.html"), 1000);
  } catch (error) {
    showToast(`Logout failed: ${error.message}`);
  }
});

// check if user is logged in and has admin role
onAuthStateChanged(auth, async (user) => {
  if (!window.location.pathname.includes("admin.html")) return;
  if (!user) return window.location.replace("../login-register/index.html");

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      provider: "email",
      createdAt: new Date(),
      role: "user",
      userId: user.uid
    });
    return window.location.replace("../index.html");
  }

  const role = userSnap.data().role?.toLowerCase();
  if (role !== "admin") return window.location.replace("../index.html");

  fetchProducts();
  fetchUsers();
});

// upload images to Cloudinary
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const res = await fetch(cloudinaryUrl, { method: "POST", body: formData });
  const data = await res.json();
  return data.secure_url || null;
}

// add or edit product
productForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = productForm["productName"].value;
  const price = productForm["productPrice"].value;
  const stock = productForm["productStock"].value;
  const rating = productForm["productRating"].value;
  const description = productForm["productDescription"].value;
  const imageFile = productForm["productImage"].files[0];

  if (!name || !price || !stock || !rating) {
    showToast("Please fill in product name, price, stock quantity, and rating");
    return;
  }

  try {
    let imageUrl = imageFile ? await uploadImage(imageFile) : null;

    if (editProductId) {
      const ref = doc(db, "products", editProductId);
      await updateDoc(ref, {
        title: name,
        price: parseFloat(price),
        stock: parseInt(stock),
        rating: parseFloat(rating),
        description,
        ...(imageUrl && { images: [imageUrl] })
      });
      showToast("Product updated successfully!");
      editProductId = null;
    } else {
      if (!imageUrl) {
        showToast("Please select a product image!");
        return;
      }
      await addDoc(productsCollection, {
        title: name,
        price: parseFloat(price),
        stock: parseInt(stock),
        rating: parseFloat(rating),
        description,
        images: [imageUrl]
      });
      showToast("Product added successfully!");
    }

    productForm.reset();
    fetchProducts();
  } catch (err) {
    showToast(`Error: ${err.message}`);
  }
});

// display products
async function fetchProducts() {
  productList.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
  try {
    const snap = await getDocs(productsCollection);
    totalProducts.textContent = snap.size;
    productsData = [];
    productList.innerHTML = "";

    snap.forEach(docSnap => {
      const p = docSnap.data();
      p.id = docSnap.id;
      productsData.push(p);
      renderProduct(p);
    });

    if (productsData.length === 0) {
      productList.innerHTML = "<tr><td colspan='7'>No products found</td></tr>";
    }
  } catch (err) {
    showToast(`Error: ${err.message}`);
    productList.innerHTML = `<tr><td colspan='7'>Error: ${err.message}</td></tr>`;
  }
}

function renderProduct(p) {
  const img = p.imageUrl || (p.images?.[0] ?? defaultImage);
  const rating = p.rating || 0;
  const stars = Math.round(rating);
  let ratingHtml = '';
  for (let i = 1; i <= 5; i++) {
    ratingHtml += `<i class="fa${i <= stars ? '-solid' : '-regular'} fa-star" style="color: #ff7f50;"></i>`;
  }

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td data-label="Product Name"><i class="fa-solid fa-paw me-1"></i>${p.title}</td>
    <td data-label="Price">${p.price}</td>
    <td data-label="Stock Quantity">${p.stock || 'N/A'}</td>
    <td data-label="Rating">${ratingHtml} (${rating})</td>
    <td data-label="Description">${p.description ?? "No Description"}</td>
    <td data-label="Product Image"><img src="${img}" class="product-img"></td>
    <td data-label="Actions">
      <button class="btn btn-warning btn-sm btn-modern edit-btn"><i class="fa-solid fa-edit"></i></button>
      <button class="btn btn-danger btn-sm btn-modern delete-btn"><i class="fa-solid fa-trash"></i></button>
    </td>`;

  tr.querySelector(".edit-btn").onclick = () => {
    editProductId = p.id;
    const modalHTML = `
      <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editProductModalLabel"><i class="fa-solid fa-paw me-2"></i>Edit Product</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <label>Product Name:</label>
              <input id="modalProductName" type="text" class="form-control mb-2" value="${p.title || ''}">
              <label>Price:</label>
              <input id="modalProductPrice" type="number" step="0.01" class="form-control mb-2" value="${p.price || ''}">
              <label>Stock Quantity:</label>
              <input id="modalProductStock" type="number" class="form-control mb-2" value="${p.stock || 0}">
              <label>Rating (0-5):</label>
              <input id="modalProductRating" type="number" step="0.1" min="0" max="5" class="form-control mb-2" value="${p.rating || 0}">
              <label>Description:</label>
              <textarea id="modalProductDescription" class="form-control mb-2">${p.description || ''}></textarea>
              <label>Change Image (optional):</label>
              <input id="modalProductImage" type="file" class="form-control mb-2">
            </div>
            <div class="modal-footer">
              <button id="modalCancelBtn" type="button" class="btn btn-secondary btn-modern"><i class="fa-solid fa-times me-2"></i>Cancel</button>
              <button id="modalSaveBtn" type="button" class="btn btn-primary btn-modern"><i class="fa-solid fa-save me-2"></i>Save</button>
            </div>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const modal = new bootstrap.Modal(document.getElementById("editProductModal"));
    modal.show();

    const modalSaveBtn = document.getElementById("modalSaveBtn");
    modalSaveBtn.onclick = async () => {
      const updatedName = document.getElementById("modalProductName").value;
      const updatedPrice = document.getElementById("modalProductPrice").value;
      const updatedStock = document.getElementById("modalProductStock").value;
      const updatedRating = document.getElementById("modalProductRating").value;
      const updatedDescription = document.getElementById("modalProductDescription").value;
      const newImageFile = document.getElementById("modalProductImage").files[0];
      let newImageUrl = null;

      if (newImageFile) {
        newImageUrl = await uploadImage(newImageFile);
      }

      try {
        const ref = doc(db, "products", editProductId);
        await updateDoc(ref, {
          title: updatedName,
          price: parseFloat(updatedPrice),
          stock: parseInt(updatedStock),
          rating: parseFloat(updatedRating),
          description: updatedDescription,
          ...(newImageUrl && { images: [newImageUrl] })
        });
        showToast("Product updated successfully!");
        modal.hide();
        document.getElementById("editProductModal").remove();
        fetchProducts();
        editProductId = null;
      } catch (err) {
        showToast(`Error updating product: ${err.message}`);
      }
    };
  };

  tr.querySelector(".delete-btn").onclick = async () => {
    if (!confirm(`Delete ${p.title}?`)) return;
    await deleteDoc(doc(db, "products", p.id));
    showToast("Product deleted successfully!");
    fetchProducts();
  };

  productList.appendChild(tr);
}

// display users
async function fetchUsers() {
  userList.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  try {
    const snap = await getDocs(usersCollection);
    let admins = 0;
    usersData = [];
    userList.innerHTML = "";

    snap.forEach(docSnap => {
      const user = docSnap.data();
      user.id = docSnap.id;
      usersData.push(user);
      renderUser(user);
      if (user.role?.toLowerCase() === "admin") admins++;
    });

    totalAdmins.textContent = admins;
    if (usersData.length === 0) {
      userList.innerHTML = "<tr><td colspan='3'>No users found</td></tr>";
    }
  } catch (err) {
    showToast(`Error: ${err.message}`);
    userList.innerHTML = `<tr><td colspan='3'>Error: ${err.message}</td></tr>`;
  }
}

function renderUser(user) {
  const isAdmin = user.role?.toLowerCase() === "admin";
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td data-label="Email"><i class="fa-solid fa-envelope me-1"></i>${user.email}</td>
    <td data-label="Role">${user.role}</td>
    <td data-label="Actions">
      <button class="btn btn-sm ${isAdmin ? 'btn-danger' : 'btn-success'} btn-modern role-btn">
        <i class="fa-solid fa-${isAdmin ? 'user-minus' : 'user-plus'} me-1"></i>${isAdmin ? 'Remove Admin' : 'Make Admin'}
      </button>
    </td>`;

  tr.querySelector(".role-btn").onclick = async () => {
    const ref = doc(db, "users", user.id);
    await updateDoc(ref, { role: isAdmin ? "user" : "admin" });
    showToast(`User role updated to ${isAdmin ? 'user' : 'admin'}!`);
    fetchUsers();
  };

  userList.appendChild(tr);
}

// search functionality
productSearch?.addEventListener("input", () => {
  const query = productSearch.value.toLowerCase();
  productList.innerHTML = "";
  const filteredProducts = productsData.filter(p => p.title.toLowerCase().includes(query));
  if (filteredProducts.length === 0) {
    productList.innerHTML = "<tr><td colspan='7'>No products found</td></tr>";
  } else {
    filteredProducts.forEach(p => renderProduct(p));
  }
});

userSearch?.addEventListener("input", () => {
  const query = userSearch.value.toLowerCase();
  userList.innerHTML = "";
  const filteredUsers = usersData.filter(u => u.email.toLowerCase().includes(query));
  if (filteredUsers.length === 0) {
    userList.innerHTML = "<tr><td colspan='3'>No users found</td></tr>";
  } else {
    filteredUsers.forEach(u => renderUser(u));
  }
});

// Scroll to top
window.onscroll = () => {
  scrollTopBtn.style.display = window.scrollY > 100 ? "block" : "none";
};
scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
const userError = document.getElementById("userError");
const scrollTopBtn = document.getElementById("scrollTopBtn");

const productsCollection = collection(db, "products");
const usersCollection = collection(db, "users");
const defaultImage = "/admin/default image product.jpg";

let editProductId = null;

//logout btn
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Signed out successfully!");
    window.location.replace("../login-register/index.html");
  } catch (error) {
    alert(`Logout failed: ${error.message}`);
  }
});

// check if user is logged in/admin roll
onAuthStateChanged(auth, async (user) => {
  if (!window.location.pathname.includes("admin.html")) return;
  if (!user) return window.location.replace("../login-register/login.html");

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

// add\edit product
productForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = productForm["productName"].value;
  const price = productForm["productPrice"].value;
  const description = productForm["productDescription"].value;
  const imageFile = productForm["productImage"].files[0];

  if (!name || !price) return alert("Please fill in product name and price");

  try {
    let imageUrl = imageFile ? await uploadImage(imageFile) : null;

    if (editProductId) {
      const ref = doc(db, "products", editProductId);
      await updateDoc(ref, {
        title: name,
        price: parseFloat(price),
        description,
        ...(imageUrl && { images: [imageUrl] }),
        rating: 0
      });
      alert("Product updated!");
      editProductId = null;
    } else {
      if (!imageUrl) return alert("Please select a product image!");
      await addDoc(productsCollection, {
        title: name,
        price: parseFloat(price),
        description,
        images: [imageUrl],
        rating: 0
      });
      alert("Product added!");
    }

    productForm.reset();
    fetchProducts();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

// display products
async function fetchProducts() {
  productList.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";
  try {
    const snap = await getDocs(productsCollection);
    totalProducts.textContent = snap.size;
    productList.innerHTML = "";

    snap.forEach(docSnap => {
      const p = docSnap.data();
      const img = p.imageUrl || (p.images?.[0] ?? defaultImage);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.title}</td>
        <td>${p.price}</td>
        <td>${p.description ?? "No Description"}</td>
        <td><img src="${img}" width="70"></td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </td>`;

        //edit product-popup
      tr.querySelector(".edit-btn").onclick = () => {
        editProductId = docSnap.id;

        const modalHTML = `
        <div class="modal-overlay" style="
          position: fixed; top:0; left:0; width:100vw; height:100vh; 
          background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;">
          <div class="modal-content" style="
            background: white; padding: 20px; border-radius: 8px; width: 90%; max-width: 400px; position: relative;">
            <h3>Edit Product</h3>
            <label>Product Name:</label>
            <input id="modalProductName" type="text" class="form-control" value="${p.title || ''}">
            <label>Price:</label>
            <input id="modalProductPrice" type="number" class="form-control" value="${p.price || ''}">
            <label>Description:</label>
            <textarea id="modalProductDescription" class="form-control">${p.description || ''}</textarea>
            <label>Change Image (optional):</label>
            <input id="modalProductImage" type="file" class="form-control">
            <div style="margin-top:15px; text-align: right;">
              <button id="modalCancelBtn" class="btn btn-secondary" style="margin-right:10px;">Cancel</button>
              <button id="modalSaveBtn" class="btn btn-primary">Save</button>
            </div>
          </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const modalOverlay = document.querySelector(".modal-overlay");
        const modalProductName = document.getElementById("modalProductName");
        const modalProductPrice = document.getElementById("modalProductPrice");
        const modalProductDescription = document.getElementById("modalProductDescription");
        const modalProductImage = document.getElementById("modalProductImage");
        const modalCancelBtn = document.getElementById("modalCancelBtn");
        const modalSaveBtn = document.getElementById("modalSaveBtn");

        modalCancelBtn.onclick = () => modalOverlay.remove();

        modalSaveBtn.onclick = async () => {
          const updatedName = modalProductName.value;
          const updatedPrice = modalProductPrice.value;
          const updatedDescription = modalProductDescription.value;
          const newImageFile = modalProductImage.files[0];
          let newImageUrl = null;

          if (newImageFile) {
            newImageUrl = await uploadImage(newImageFile);
          }

          try {
            const ref = doc(db, "products", editProductId);
            await updateDoc(ref, {
              title: updatedName,
              price: parseFloat(updatedPrice),
              description: updatedDescription,
              ...(newImageUrl && { images: [newImageUrl] }),
              rating: 0
            });
            alert("Product updated successfully!");
            modalOverlay.remove();
            fetchProducts();
            editProductId = null;
          } catch (err) {
            alert(`Error updating product: ${err.message}`);
          }
        };
      };
//delete product
      tr.querySelector(".delete-btn").onclick = async () => {
        if (!confirm(`Delete ${p.title}?`)) return;
        await deleteDoc(doc(db, "products", docSnap.id));
        alert("Product deleted");
        fetchProducts();
      };

      productList.appendChild(tr);
    });
  } catch (err) {
    productList.innerHTML = `<tr><td colspan='5'>Error: ${err.message}</td></tr>`;
  }
}

// display users
async function fetchUsers() {
  userList.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  try {
    const snap = await getDocs(usersCollection);
    let admins = 0;
    userList.innerHTML = "";

    snap.forEach(docSnap => {
      const user = docSnap.data();
      const isAdmin = user.role?.toLowerCase() === "admin";
      if (isAdmin) admins++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td><button class="btn btn-sm ${isAdmin ? 'btn-danger' : 'btn-success'} role-btn">
          ${isAdmin ? 'Remove Admin' : 'Make Admin'}</button></td>`;

      tr.querySelector(".role-btn").onclick = async () => {
        const ref = doc(db, "users", docSnap.id);
        await updateDoc(ref, { role: isAdmin ? "user" : "admin" });
        fetchUsers();
      };

      userList.appendChild(tr);
    });

    totalAdmins.textContent = admins;
  } catch (err) {
    userList.innerHTML = `<tr><td colspan='3'>Error: ${err.message}</td></tr>`;
  }
}
// scroll up
window.onscroll = () => {
  scrollTopBtn.style.display = window.scrollY > 100 ? "block" : "none";
};
scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

import { db, storage } from "/login-register/firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

const productsCollection = collection(db, "products");
const defaultImage = "/admin/default image product.jpg";

let editProductId = null;
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const description = document.getElementById("productDescription").value;
  const imageFile = document.getElementById("productImage").files[0];

  console.log("Form Data:", {
    name,
    price,
    description,
    imageFile,
  });
  try {
    let imageUrl = null;

    
    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, `products/${fileName}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    if (editProductId) {
   
      const productDocRef = doc(db, "products", editProductId);

      
      const updatedData = { name, price, description };
      if (imageUrl) updatedData.imageUrl = imageUrl; 

      await updateDoc(productDocRef, updatedData);
      alert("Product updated successfully!");
      editProductId = null; 
    } else {
//add new product
      if (!imageUrl) {
        alert("Please select a product image!");
        return;
      }

      await addDoc(productsCollection, {
        title,
        price,
        description,
        imageUrl,
      });
      alert("Product added successfully!");
    }

    productForm.reset();
    fetchProducts();

  } catch (error) {
    console.error("Error saving product:", error);
    alert("An error occurred while saving the product.");
  }
});

const fetchProducts = async () => {
  productList.innerHTML = "";
  const querySnapshot = await getDocs(productsCollection);

  querySnapshot.forEach((docSnap) => {
    const product = docSnap.data();
    const id = docSnap.id;

    const productName = product.name || product.title || "No Name";
    let productImage = defaultImage;
    if (product.imageUrl) {
      productImage = product.imageUrl;
    } else if (product.images && product.images.length > 0) {
      productImage = product.images[0];
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${productName}</td>
      <td>${product.price || "N/A"}</td>
      <td>${product.description || "No Description"}</td>
      <td><img src="${productImage}" width="70" height="70" alt="Product Image"></td>
      <td>
        <button class="btn btn-warning btn-sm edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </td>
      
    `;

  //edit
 tr.querySelector(".edit-btn").addEventListener("click", () => {
  editProductId = id;

  // modal popup with the product details for editing
  const modalHTML = `
    <div class="modal-overlay" style="
      position: fixed; top:0; left:0; width:100vw; height:100vh; 
      background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;">
      <div class="modal-content" style="
        background: white; padding: 20px; border-radius: 8px; width: 90%; max-width: 400px; position: relative;">
        <h3>Edit Product</h3>
        <label>Product Name:</label>
        <input id="modalProductName" type="text" class="form-control" value="${product.title || ''}">
        <label>Price:</label>
        <input id="modalProductPrice" type="number" class="form-control" value="${product.price || ''}">
        <label>Description:</label>
        <textarea id="modalProductDescription" class="form-control">${product.description || ''}</textarea>
        <div style="margin-top:15px; text-align: right;">
          <button id="modalCancelBtn" class="btn btn-secondary" style="margin-right:10px;">Cancel</button>
          <button id="modalSaveBtn" class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modalOverlay = document.querySelector(".modal-overlay");
  const modalProductName = document.getElementById("modalProductName");
  const modalProductPrice = document.getElementById("modalProductPrice");
  const modalProductDescription = document.getElementById("modalProductDescription");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalSaveBtn = document.getElementById("modalSaveBtn");

  // Cancel button closes the modal
  modalCancelBtn.addEventListener("click", () => {
    modalOverlay.remove();
  });

  // Save button updates the product in Firebase
  modalSaveBtn.addEventListener("click", async () => {
    const updatedName = modalProductName.value;
    const updatedPrice = modalProductPrice.value;
    const updatedDescription = modalProductDescription.value;

    if (!updatedName || !updatedPrice) {
      alert("Please fill in product name and price");
      return;
    }

    try {
      const productDocRef = doc(db, "products", editProductId);
      await updateDoc(productDocRef, {
        name: updatedName,
        price: parseFloat(updatedPrice),
        description: updatedDescription,
      });
      alert("Product updated successfully!");
      modalOverlay.remove();
      fetchProducts();
      editProductId = null;
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An error occurred while updating the product.");
    }
  });
});

    // Delete
    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      const confirmed = confirm(`Are you sure you want to delete "${productName}"?`);
      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, "products", id));
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("An error occurred while deleting the product.");
      }
    });

    productList.appendChild(tr);
  });
};

fetchProducts();
console.log("Admin.js Loaded!");

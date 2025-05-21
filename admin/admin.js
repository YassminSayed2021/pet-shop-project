import { db, storage, auth } from "/login-register/firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dfcl3kecg/image/upload";
const uploadPreset = "petshop"; 

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");

// Check user role and protect admin page
onAuthStateChanged(auth, async (user) => {
  console.log("Admin.js: Auth state checked, user:", user ? { uid: user.uid, email: user.email } : null);
  
  // Check if we're on admin.html to avoid unnecessary redirects
  const isAdminPage = window.location.pathname.includes("admin.html");
  if (!isAdminPage) {
    console.log("Admin.js: Not on admin.html, skipping role check");
    return;
  }

  if (!user) {
    console.log("Admin.js: No user, redirecting to login.html");
    window.location.replace("../login-register/login.html");
    return;
  }

  try {
    console.log(`Admin.js: Fetching role for user: ${user.uid} (${user.email})`);
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn(`Admin.js: User document not found for UID: ${user.uid}`);
      // Set role based on email
      const isAdminEmail = user.email === "dr.hala.youssef@gmail.com";
      await setDoc(userDocRef, {
        email: user.email,
        provider: "email",
        createdAt: new Date(),
        role: isAdminEmail ? "admin" : "user"
      }, { merge: true });
      console.log(`Admin.js: Created user document with role: ${isAdminEmail ? "admin" : "user"}`);
      if (!isAdminEmail) {
        console.log("Admin.js: Non-admin document created, redirecting to index.html");
        window.location.replace("../index.html");
        return;
      }
    }

    const userData = userDoc.data();
    const rawRole = userData.role || "user";
    const userRole = rawRole.trim().toLowerCase();
    console.log("Admin.js: Raw role:", rawRole, "Normalized role:", userRole, "Full data:", userData);

    if (userRole !== "admin") {
      console.log("Admin.js: Non-admin, redirecting to index.html");
      window.location.replace("../index.html");
      return;
    }

    console.log("Admin.js: Admin access granted, loading products");
    fetchProducts();
  } catch (error) {
    console.error(`Admin.js: Error checking user role: ${error.message} (Code: ${error.code})`);
    if (productList) {
      productList.innerHTML = "<tr><td colspan='5'>Error loading admin access. Please refresh the page.</td></tr>";
    }
    setTimeout(() => {
      console.log("Admin.js: Retrying role check after error");
      window.location.reload();
    }, 3000);
  }
});

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
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      imageUrl = data.secure_url;
    }

    if (editProductId) {
      const productDocRef = doc(db, "products", editProductId);
      
      const updatedData = { 
        title: name, 
        price: parseFloat(price), 
        description,
        rating: 0
      };
      if (imageUrl) updatedData.images = [imageUrl];

      await updateDoc(productDocRef, updatedData);
      alert("Product updated successfully!");
      editProductId = null;
    } else {
      if (!imageUrl) {
        alert("Please select a product image!");
        return;
      }

      await addDoc(productsCollection, {
        title: name,
        price: parseFloat(price),
        description,
        images: [imageUrl],
        rating: 0
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
  console.log("Fetching products for admin");
  if (!productList) {
    console.error("Admin.js: productList element not found in DOM");
    alert("Error: Product list element not found. Please check admin.html.");
    return;
  }

  productList.innerHTML = "";
  try {
    const querySnapshot = await getDocs(productsCollection);
    console.log("Admin.js: Retrieved products count:", querySnapshot.size);
    if (querySnapshot.empty) {
      console.log("Admin.js: No products found in Firestore");
      productList.innerHTML = "<tr><td colspan='5'>No products available.</td></tr>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const product = docSnap.data();
      const id = docSnap.id;
      console.log("Admin.js: Product:", { id, ...product });

      const productName = product.title || "No Name";
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

      tr.querySelector(".edit-btn").addEventListener("click", () => {
        editProductId = id;

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

        modalCancelBtn.addEventListener("click", () => {
          modalOverlay.remove();
        });

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
              title: updatedName,
              price: parseFloat(updatedPrice),
              description: updatedDescription,
              rating: 0
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
  } catch (error) {
    console.error("Admin.js: Error fetching products:", error.message, error.code);
    productList.innerHTML = "<tr><td colspan='5'>Error loading products.</td></tr>";
  }
};

console.log("Admin.js Loaded!");
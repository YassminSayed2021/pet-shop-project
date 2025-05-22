import { db, storage, auth } from "../login-register/firebaseConfig.js";
import {
  collection,addDoc,getDocs,doc,deleteDoc,updateDoc,setDoc,getDoc} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
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

const productsCollection = collection(db, "products");
const usersCollection = collection(db, "users");
const defaultImage = "/admin/default image product.jpg";

let editProductId = null;

// logout 
async function handleLogout() {
  try {
    await signOut(auth);
    alert("✅ Signed out successfully!");
    window.location.replace("../login-register/index.html");
  } catch (error) {
    console.error("Admin.js: Logout Error:", error.message, error.code);
    alert(`❌ Error during logout: ${error.message}`);
  }
}

//  logout event listener
if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
} else {
  console.error("Admin.js: logoutBtn not found in DOM");
}

// check user role and protect admin page
onAuthStateChanged(auth, async (user) => {
  const isAdminPage = window.location.pathname.includes("admin.html");
  if (!isAdminPage) {
    return;
  }

  if (!user) {
    window.location.replace("../login-register/login.html");
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        provider: "email",
        createdAt: new Date(),
        role: "user",
        userId: user.uid
      }, { merge: true });
      window.location.replace("../index.html");
      return;
    }

    const userData = userDoc.data();
    const userRole = userData.role?.trim().toLowerCase() || "user";

    if (userRole !== "admin") {
      window.location.replace("../index.html");
      return;
    }

    fetchProducts();
    fetchUsers();

    // refresh data when switching tabs
    const productTab = document.getElementById("products-tab");
    const adminTab = document.getElementById("admins-tab");
    if (productTab) {
      productTab.addEventListener("shown.bs.tab", fetchProducts);
    } else {
      console.error("Admin.js: products-tab not found in DOM");
    }
    if (adminTab) {
      adminTab.addEventListener("shown.bs.tab", fetchUsers);
    } else {
      console.error("Admin.js: admins-tab not found in DOM");
    }
  } catch (error) {
    console.error(`Admin.js: Error checking user role: ${error.message} (Code: ${error.code})`);
    if (productList) {
      productList.innerHTML = `<tr><td colspan='5' class='error-message'>Error loading admin access: ${error.message}. Please refresh the page.</td></tr>`;
    }
    if (userList) {
      userList.innerHTML = `<tr><td colspan='3' class='error-message'>Error loading users: ${error.message}. Please refresh the page.</td></tr>`;
    }
    if (userError) {
      userError.textContent = `Error loading admin access: ${error.message}`;
      userError.style.display = "block";
    }
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
});

// product management
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("productName")?.value;
    const price = document.getElementById("productPrice")?.value;
    const description = document.getElementById("productDescription")?.value;
    const imageFile = document.getElementById("productImage")?.files[0];

    if (!name || !price) {
      console.error("Admin.js: Missing required fields in product form");
      alert("Please fill in product name and price");
      return;
    }

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
        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          console.error("Admin.js: Cloudinary upload failed:", data);
          throw new Error("Failed to upload image");
        }
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
          console.error("Admin.js: No image selected for new product");
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
      console.error("Admin.js: Error saving product:", error.message, error.code);
      alert(`An error occurred while saving the product: ${error.message}`);
    }
  });
} else {
  console.error("Admin.js: productForm not found in DOM");
}

// fetch products
const fetchProducts = async () => {
  if (!productList) {
    console.error("Admin.js: productList element not found in DOM");
    alert("Error: Product list element not found. Please check admin.html.");
    return;
  }

  productList.innerHTML = "<tr><td colspan='5' class='loading-message'>Loading products...</td></tr>";
  try {
    const querySnapshot = await getDocs(productsCollection);
    if (totalProducts) {
      totalProducts.textContent = querySnapshot.size;
    } else {
      console.error("Admin.js: totalProducts element not found in DOM");
    }

    if (querySnapshot.empty) {
      productList.innerHTML = "<tr><td colspan='5'>No products available.</td></tr>";
      return;
    }

    productList.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const product = docSnap.data();
      const id = docSnap.id;

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

        if (!modalOverlay || !modalProductName || !modalProductPrice || !modalProductDescription || !modalCancelBtn || !modalSaveBtn) {
          console.error("Admin.js: Modal elements not found");
          alert("Error: Failed to initialize edit modal");
          return;
        }

        modalCancelBtn.addEventListener("click", () => {
          modalOverlay.remove();
        });

        modalSaveBtn.addEventListener("click", async () => {
          const updatedName = modalProductName.value;
          const updatedPrice = modalProductPrice.value;
          const updatedDescription = modalProductDescription.value;

          if (!updatedName || !updatedPrice) {
            console.error("Admin.js: Missing required fields in edit modal");
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
            console.error("Admin.js: Error updating product:", error.message, error.code);
            alert(`An error occurred while updating the product: ${error.message}`);
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
          console.error("Admin.js: Error deleting product:", error.message, error.code);
          alert(`An error occurred while deleting the product: ${error.message}`);
        }
      });

      productList.appendChild(tr);
    });
  } catch (error) {
    console.error("Admin.js: Error fetching products:", error.message, error.code);
    productList.innerHTML = `<tr><td colspan='5' class='error-message'>Error loading products: ${error.message}</td></tr>`;
  }
};

// fetch users
const fetchUsers = async () => {
  if (!userList) {
    console.error("Admin.js: userList element not found in DOM");
    alert("Error: User list element not found. Please check admin.html.");
    if (userError) {
      userError.textContent = "Error: User list element not found in DOM.";
      userError.style.display = "block";
    }
    return;
  }

  userList.innerHTML = "<tr><td colspan='3' class='loading-message'>Loading users...</td></tr>";
  if (userError) {
    userError.textContent = "";
    userError.style.display = "none";
  }

  try {
    const querySnapshot = await getDocs(usersCollection);
    let adminCount = 0;
    const users = [];

    querySnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const id = docSnap.id;
      users.push({ id, ...user });
      if (user.role?.trim().toLowerCase() === "admin") {
        adminCount++;
      }
    });

    if (totalAdmins) {
      totalAdmins.textContent = adminCount;
    } else {
      console.error("Admin.js: totalAdmins element not found in DOM");
    }

    if (querySnapshot.empty) {
      userList.innerHTML = "<tr><td colspan='3'>No users available.</td></tr>";
      if (userError) {
        userError.textContent = "No users found in the database.";
        userError.style.display = "block";
      }
      return;
    }

    userList.innerHTML = "";
    users.forEach((user) => {
      const userEmail = user.email || "No Email";
      const userRole = user.role || "user";
      const isAdmin = userRole.trim().toLowerCase() === "admin";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${userEmail}</td>
        <td>${userRole}</td>
        <td>
          <button class="btn btn-sm ${isAdmin ? 'btn-danger' : 'btn-success'} role-btn">
            ${isAdmin ? 'Remove Admin' : 'Make Admin'}
          </button>
        </td>
      `;

      tr.querySelector(".role-btn").addEventListener("click", async () => {
        const action = isAdmin ? "remove admin role from" : "make admin";
        const confirmed = confirm(`Are you sure you want to ${action} "${userEmail}"?`);
        if (!confirmed) return;

        try {
          const userDocRef = doc(db, "users", user.id);
          await updateDoc(userDocRef, {
            role: isAdmin ? "user" : "admin"
          });
          alert(`✅ User "${userEmail}" ${isAdmin ? "is no longer an admin" : "is now an admin"}!`);
          fetchUsers();
        } catch (error) {
          console.error(`Admin.js: Error updating user role:`, error.message, error.code);
          alert(`An error occurred while updating the user role: ${error.message}`);
          if (userError) {
            userError.textContent = `Error updating user role: ${error.message}`;
            userError.style.display = "block";
          }
        }
      });

      userList.appendChild(tr);
    });
  } catch (error) {
    console.error("Admin.js: Error fetching users:", error.message, error.code);
    userList.innerHTML = `<tr><td colspan='3' class='error-message'>Error loading users: ${error.message}</td></tr>`;
    if (userError) {
      userError.textContent = `Error loading users: ${error.message}`;
      userError.style.display = "block";
    }
  }
};

// scroll up
let scrollTopBtn = document.getElementById("scrollTopBtn");

window.onscroll = function() {
  scrollTopBtn.style.display = (window.scrollY > 100) ? "block" : "none";
};

scrollTopBtn.onclick = function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
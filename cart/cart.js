
    const products = [
      {
        name: "Pi Pizza Oven",
        price: 469.99,
        quantity: 1,
        image: "img/9.jpg"
      },
      {
        name: "Grill Ultimate Bundle",
        price: 549.99,
        quantity: 1,
        image: "img/8.jpg"
      },
      {
        name: "Starters (4 pack)",
        price: 0.00,
        quantity: 1,
        image: "img/7.jpg"
      },
      {
        name: "Charcoal Grill Pack",
        price: 0.00,
        quantity: 1,
        image: "img/6.jpg"
      }
    ];

    const cartItemsContainer = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("subtotal");

    function updateTotals() {
      let subtotal = 0;
      products.forEach(p => subtotal += p.price * p.quantity);
      subtotalEl.textContent = subtotal.toFixed(2);
    }

    function renderCart() {
      cartItemsContainer.innerHTML = "";
      const hasItems = products.length > 0;

      document.querySelector(".cart-section").style.display = hasItems ? "block" : "none";
      document.getElementById("empty-cart").classList.toggle("hidden", hasItems);

      if (!hasItems) return;

      products.forEach((product, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="item-cell">
            <img src="${product.image}" alt="${product.name}" class="item-img">
            <div><strong>${product.name}</strong></div>
          </td>
          <td>$${product.price.toFixed(2)}</td>
          <td>
            <div class="quantity-controls">
              <button onclick="changeQty(${index}, -1)">-</button>
              <span>${product.quantity}</span>
              <button onclick="changeQty(${index}, 1)">+</button>
            </div>
          </td>
          <td>
            $${(product.price * product.quantity).toFixed(2)}
            <button class="delete-btn" onclick="deleteItem(${index})">🗑️</button>
          </td>
        `;
        cartItemsContainer.appendChild(row);
      });

      updateTotals();
    }

    function changeQty(index, delta) {
      let newQty = products[index].quantity + delta;
      if (newQty <= 0) {
        const confirmDelete = confirm("Quantity is 0. Do you want to remove this item?");
        if (confirmDelete) {
          deleteItem(index);
        } else {
          products[index].quantity = 1;
        }
      } else {
        products[index].quantity = newQty;
      }
      renderCart();
    }

    function deleteItem(index) {
      products.splice(index, 1);
      renderCart();
    }

    function goToShop() {
      window.location.href = "index.html";
    }
    function goToPay() {
      window.location.href = "pay.html";
    }

    renderCart();
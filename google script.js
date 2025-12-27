let cart = [];

const SHEET_ID = "1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.map(r => ({
      name: r.c[1]?.v || "",
      price: Number(r.c[2]?.v) || 0,
      image_url: r.c[3]?.v || "",
      description: r.c[4]?.v || ""
    }));

    window.products = products;

    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";

    products.forEach((item, index) => {
      productsDiv.innerHTML += `
        <div class="product-card">
          <img src="${item.image_url}">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p>₹${item.price}</p>

          <div class="qty-wrapper">
            <button onclick="changeQty(${index}, -1)">-</button>
            <input type="number" min="1" value="1" id="qty-${index}" 
                   onchange="updateCartQty(${index})">
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>

          <button onclick="addToCart(${index})">Add to Cart</button>
        </div>
      `;
    });
  });

// + / - button function
function changeQty(index, delta) {
  const input = document.getElementById(`qty-${index}`);
  let qty = Number(input.value) + delta;
  if (qty < 1) qty = 1;
  input.value = qty;

  // auto update cart if product already in cart
  const product = window.products[index];
  const existing = cart.find(p => p.name === product.name);
  if (existing) {
    existing.qty = qty;
    updateCartCount();
  }
}

// when user manually changes input
function updateCartQty(index) {
  const input = document.getElementById(`qty-${index}`);
  const qty = Number(input.value);
  const product = window.products[index];
  const existing = cart.find(p => p.name === product.name);
  if (existing) {
    existing.qty = qty;
    updateCartCount();
  }
}

function addToCart(index) {
  const qtyInput = document.getElementById(`qty-${index}`);
  const qty = Number(qtyInput.value);

  if (qty <= 0) {
    alert("Quantity sahi daal");
    return;
  }

  const product = window.products[index];
  const existing = cart.find(p => p.name === product.name);

  if (existing) {
    existing.qty = qty; // replace with current input
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      qty: qty
    });
  }

  updateCartCount();
}

function updateCartCount() {
  document.getElementById("cartCount").innerText =
    cart.reduce((sum, p) => sum + p.qty, 0);
}

// WhatsApp order
function orderWhatsApp() {
  if (cart.length === 0) {
    alert("Cart empty hai");
    return;
  }

  let message = "🛒 Order Details:%0A%0A";
  let grandTotal = 0;

  cart.forEach(p => {
    const total = p.price * p.qty;
    grandTotal += total;

    message += `${p.name}%0A`;
    message += `Rate: ₹${p.price}%0A`;
    message += `Qty: ${p.qty}%0A`;
    message += `Total: ₹${total}%0A%0A`;
  });

  message += `Grand Total = ₹${grandTotal}`;

  window.open(
    "https://wa.me/918624091826?text=" + message,
    "_blank"
  );
}

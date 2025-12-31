// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map((r, index) => ({
      id: r.c[0]?.v?.toString().trim() || `p${index}`,
      name: r.c[1]?.v || "Unnamed Product",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "https://via.placeholder.com/300").trim(),
      season: (r.c[4]?.v || "all").toLowerCase().trim()
    }));

    renderProducts(products);
    updateCartUI();
  })
  .catch(err => console.error("Sheet Error:", err));

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const div = document.getElementById("products");
  if (!div) return;

  div.innerHTML = "";

  if (list.length === 0) {
    div.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach(item => {
    div.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <div class="qty-box">
          <button onclick="changeQty('${item.id}', -1)">-</button>
          <input id="qty-${item.id}" type="number" value="1" min="1">
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>

        <button onclick="addToCart('${item.id}')">Add to Cart</button>
      </div>
    `;
  });
}

// ================= QTY =================
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;

  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

// ================= ADD TO CART =================
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  let qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }

  // ✅ RESET QTY TO 1 (IMPORTANT FIX)
  qtyInput.value = 1;

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// ================= CART COUNT =================
function updateCartUI() {
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;

  let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.innerText = totalQty;

  // WhatsApp button hide/show
  const orderBtn = document.querySelector(".order-btn");
  if (orderBtn) {
    orderBtn.style.display = totalQty > 0 ? "block" : "none";
  }
}

// ================= FILTER =================
function filtersSeason(season) {
  season = season.toLowerCase();
  if (season === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.season === season));
}

// ================= CART POPUP =================
function openCart() {
  document.getElementById("cartPopup").style.display = "flex";
  renderCartItems();
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

// ================= CART ITEMS =================
function renderCartItems() {
  const div = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  div.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    div.innerHTML = "<p>Cart empty hai</p>";
    totalEl.innerText = "Total: ₹0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.qty * item.price;
    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty}<br>
        Price: ₹${item.price}<br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  totalEl.innerText = "Total: ₹" + total;
}

// ================= REMOVE ITEM =================
function removeItem(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

// ================= WHATSAPP ORDER =================
function orderOnWhatsApp() {
  if (cart.length === 0) return alert("Cart empty hai");

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}%0AQty: ${item.qty}%0APrice: ₹${item.price}%0A%0A`;
    total += item.qty * item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`, "_blank");

  // ✅ RESET CART
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  renderCartItems();
  closeCart();
}

// ================= INIT =================
updateCartUI();
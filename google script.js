// ================= GLOBAL STATE =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ================= FETCH PRODUCTS =================
async function loadProducts() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => ({
      id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).substr(2, 9),
      name: r.c[1]?.v || "Unnamed Product",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "https://via.placeholder.com/300x300?text=No+Image").trim(),
      season: (r.c[4]?.v || "all").toLowerCase().trim()
    })).filter(p => p.price > 0);

    renderProducts(products);
    updateCartUI();
  } catch (err) {
    console.error("Sheet Error:", err);
    document.getElementById("products")?.insertAdjacentHTML('beforeend', 
      '<p style="text-align:center; grid-column: 1/-1;">Failed to load products. Please refresh.</p>');
  }
}

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const div = document.getElementById("products");
  if (!div) return;

  div.innerHTML = "";

  if (list.length === 0) {
    div.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No products found</p>";
    return;
  }

  list.forEach(item => {
    div.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}" alt="${item.name}" onclick="openImage('${item.image_url}')" 
             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
        <h3>${item.name}</h3>
        <p>₹${item.price.toLocaleString()}</p>
        <div class="qty-controls">
          <button onclick="changeQty('${item.id}', -1)">-</button>
          <input id="qty-${item.id}" type="number" value="1" min="1" max="99">
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <button onclick="addToCart('${item.id}')">Add to Cart</button>
      </div>
    `;
  });
}

// ================= CART FUNCTIONS =================
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;
  
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(99, val + delta));
  input.value = val;
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  qtyInput.value = 1; // Reset quantity
  
  // Visual feedback
  const btn = event?.target;
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "Added! ✓";
    btn.style.background = "#1DA851";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = "#25D366";
    }, 1500);
  }
}

function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (el) {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    el.textContent = total;
  }
}

// ================= FILTERS =================
function filtersSeason(season) {
  season = season.toLowerCase();
  const filtered = season === "all" 
    ? products 
    : products.filter(p => p.season === season);
  renderProducts(filtered);
}

// ================= CART POPUP =================
function openCart() {
  const popup = document.getElementById("cartPopup");
  if (popup) popup.style.display = "flex";
  renderCartItems();
}

function closeCart() {
  const popup = document.getElementById("cartPopup");
  if (popup) popup.style.display = "none";
}

function renderCartItems() {
  const div = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  
  if (!div || !totalEl) return;

  div.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    div.innerHTML = "<p style='text-align:center; color:#666;'>Your cart is empty</p>";
    totalEl.textContent = "Total: ₹0";
    return;
  }

  cart.forEach((item, i) => {
    const itemTotal = item.qty * item.price;
    total += itemTotal;
    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty} | ₹${item.price.toLocaleString()} 
        <br><small>₹${itemTotal.toLocaleString()}</small><br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  totalEl.textContent = `Total: ₹${total.toLocaleString()}`;
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

// ================= WHATSAPP ORDER =================
function orderOnWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let msg = "🛒 *New Order from Website* %0A%0A";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = item.qty * item.price;
    msg += `${i + 1}. *${item.name}*%0A`;
    msg += `Qty: ${item.qty} | ₹${item.price.toLocaleString()}%0A`;
    msg += `Total: ₹${itemTotal.toLocaleString()}%0A%0A`;
    total += itemTotal;
  });

  msg += `*Grand Total: ₹${total.toLocaleString()}*`;

  window.open(`https://wa.me/918624091826?text=${encodeURIComponent(msg)}`, "_blank");

  // Clear cart after order
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  renderCartItems();
  closeCart();
}

// ================= IMAGE PREVIEW =================
function openImage(src) {
  const previewImg = document.getElementById("previewImg");
  const imgPreview = document.getElementById("imgPreview");
  if (previewImg && imgPreview) {
    previewImg.src = src;
    imgPreview.style.display = "flex";
  }
}

function closeImage() {
  const imgPreview = document.getElementById("imgPreview");
  if (imgPreview) imgPreview.style.display = "none";
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  if (document.getElementById('products')) {
    loadProducts();
  }
});

// Close popups on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('cart-popup')) {
    closeCart();
  }
  if (e.target.classList.contains('img-preview')) {
    closeImage();
  }
});
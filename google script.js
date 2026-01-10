<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catalogue - Aakash Traders & Sai Collection</title>

  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  
  <!-- FIXED CART POSITION + WHITE BG -->
  <style>
    /* FIXED CART POSITION UP TOP */
    .cart-popup {
      position: fixed !important;
      top: 80px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 10000 !important;
      width: 90vw !important;
      max-width: 450px !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
      animation: cartSlideDown 0.3s ease !important;
      background: white !important;
      border-radius: 15px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
    }

    @keyframes cartSlideDown {
      from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    .cart-box {
      background: white !important;
      padding: 20px !important;
    }

    body.cart-open { overflow: hidden !important; }
    .top-bar { 
      position: fixed !important;
      top: 0 !important;
      z-index: 10001 !important;
      width: 100% !important;
    }
  </style>
</head>

<body>

<!-- TOP BAR (SAME AS YOUR SITE) -->
<header class="top-bar">
  <div class="logo">Aakash Traders & Sai Collection</div>

  <div class="cart-icon" onclick="openCart()">
    🛒 <span id="cartCount">0</span>
  </div>

  <div class="menu-toggle" onclick="toggleMenu()">
    <span></span><span></span><span></span>
  </div>
</header>

<!-- SIDE MENU -->
<nav id="sideMenu" class="side-menu">
  <a href="index.html">🏠 Home</a>
  <a href="catalogue.html" class="active">📦 Catalogue</a>
  <a href="about.html">ℹ️ About</a>
  <a href="contact.html">📞 Contact</a>
</nav>

<!-- PAGE TITLE -->
<section class="catalogue-hero">
  <h1>Our Collection</h1>
</section>

<!-- FILTERS -->
<div class="filters" style="text-align:center; margin:15px 0;">
  <button onclick="filterSeason('All')">All</button>
  <button onclick="filterSeason('Summer')">Summer</button>
  <button onclick="filterSeason('Winter')">Winter</button>
  <button onclick="filterSeason('Rainy')">Rainy</button>
</div>

<!-- PRODUCTS (GOOGLE SHEET SE AAYENGE) -->
<section class="products-grid" id="productsGrid"></section>

<!-- ZOOM MODAL -->
<div id="zoomModal" class="zoom-modal" style="display:none;">
  <span class="close" onclick="closeZoom()">&times;</span>
  <img id="zoomImg" src="" alt="Zoomed">
</div>

<!-- CART POPUP - WHITE BG + FIXED TOP -->
<div id="cartPopup" class="cart-popup" style="display:none;">
  <div class="cart-box">
    <span class="close" onclick="closeCart()">&times;</span>
    <h3>🛒 Your Cart</h3>
    <div id="cartItems"></div>
    <h4 id="cartTotal">Total: ₹0</h4>
    <button onclick="orderOnWhatsApp()">Order on WhatsApp</button>
    <button onclick="closeCart()">Close</button>
  </div>
</div>

<!-- WHATSAPP FLOAT -->
<a href="https://wa.me/918624091826" class="whatsapp-float">💬</a>

<!-- MENU FUNCTIONS -->
<script>
function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("open");
}

function openCart() {
  document.getElementById('cartPopup').style.display = 'block';
  document.body.classList.add('cart-open');
}

function closeCart() {
  document.getElementById('cartPopup').style.display = 'none';
  document.body.classList.remove('cart-open');
}

// Click outside to close
document.getElementById('cartPopup').onclick = function(e) {
  if (e.target === this) closeCart();
};
</script>

<!-- ========== YOUR MODIFIED GOOGLE SCRIPT (COUNT 0 AUTO) ========== -->
<script>
// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

// ================= CLOUDINARY CONFIG =================
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => ({
      id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).substr(2, 5),
      name: r.c[1]?.v || "Unnamed Product",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || CLOUDINARY_BASE_URL).toString().trim(),
      season: (r.c[4]?.v || "all").toLowerCase().trim()
    }));

    renderProducts(products);
    updateCartUI();
  })
  .catch(err => {
    console.error("Sheet error:", err);
    loadDemoProducts();
  });

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const div = document.getElementById("productsGrid");  // Fixed ID
  if (!div) return;

  div.innerHTML = "";

  if (list.length === 0) {
    div.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach(item => {
    const imageUrl = item.image_url && item.image_url !== "" ? item.image_url : CLOUDINARY_BASE_URL;

    div.innerHTML += `
      <div class="product-card">
        <img src="${imageUrl}"
             onerror="this.src='${CLOUDINARY_BASE_URL}'"
             style="width:100%; height:240px; object-fit:cover; border-radius:12px; cursor:zoom-in;"
             onclick="zoomImage('${imageUrl}')">

        <h3>${item.name}</h3>
        <div class="price-tag">₹${item.price}</div>

        <div class="qty-section" style="display:flex; gap:8px; margin:10px 0;">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <input id="qty-${item.id}" type="number" value="1" min="1"
                 style="width:50px; text-align:center;">
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>

        <button onclick="addToCart('${item.id}')"
                style="width:100%; background:#25D366; color:white;
                border:none; padding:10px; border-radius:6px;">
          🛒 Add to Cart
        </button>
      </div>
    `;
  });
}

// ================= QTY =================
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

// ================= ADD TO CART (COUNT 0 AUTO RESET) =================
function addToCart(id) {
  const p = products.find(pr => pr.id === id);
  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...p, qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  
  // ✅ COUNT AUTOMATIC 0 HO GAYGA!
  document.getElementById("cartCount").textContent = "0";
  
  alert('✅ Added to Cart! Count reset to 0');
}

// ================= CART COUNT =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  el.innerText = totalQty;
}

// ================= FILTER =================
function filterSeason(season) {
  season = season.toLowerCase();
  if (season === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.season === season));
}

// ================= CART ITEMS =================
function renderCartItems() {
  const div = document.getElementById("cartItems");
  div.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    div.innerHTML = "<p>Cart empty hai</p>";
    document.getElementById("cartTotal").innerText = "Total: ₹0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.qty * item.price;
    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty}<br>
        ₹${item.price}<br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = "Total: ₹" + total;
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
  if (cart.length === 0) {
    alert("Cart empty hai");
    return;
  }

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}%0AQty: ${item.qty}%0APrice: ₹${item.price}%0A%0A`;
    total += item.qty * item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`, "_blank");

  // Reset cart after order
  cart = [];
  localStorage.removeItem("cart");
  document.getElementById("cartCount").textContent = "0";
  renderCartItems();
  closeCart();
}

// ================= DEMO PRODUCTS =================
function loadDemoProducts() {
  products = [
    { id: "d1", name: "Formal Shirt", price: 599, image_url: CLOUDINARY_BASE_URL, season: "all" },
    { id: "d2", name: "Casual Jeans", price: 799, image_url: CLOUDINARY_BASE_URL, season: "all" }
  ];
  renderProducts(products);
}

// ================= ZOOM =================
function zoomImage(src) {
  document.getElementById("zoomImg").src = src;
  document.getElementById("zoomModal").style.display = "flex";
}

function closeZoom() {
  document.getElementById("zoomModal").style.display = "none";
}

// ================= INIT CALLS =================
updateCartUI();
</script>

</body>
</html>
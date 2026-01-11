// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

// ================= CLOUDINARY CONFIG =================
const CLOUDINARY_BASE_URL =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";

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
  const div =
    document.getElementById("products") ||
    document.getElementById("productsGrid");
  if (!div) return;

  div.innerHTML = "";

  if (list.length === 0) {
    div.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach(item => {
    const imageUrl =
      item.image_url && item.image_url !== ""
        ? item.image_url
        : CLOUDINARY_BASE_URL;

    div.innerHTML += `
      <div class="product-card">
        <img src="${imageUrl}"
             onerror="this.src='${CLOUDINARY_BASE_URL}'"
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

// ================= ADD TO CART =================
function addToCart(id) {
  const p = products.find(pr => pr.id === id);
  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...p, qty });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  qtyInput.value = 1;
}

// ================= CART COUNT =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  el.innerText = totalQty;
}

// ================= CART POPUP =================
function openCart() {
  document.getElementById("cartPopup").style.display = "block";
  renderCartItems();
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
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

// ================= ZOOM (WITH SWIPE CLOSE) =================
let startX = 0;
let startY = 0;

function zoomImage(src) {
  const modal = document.getElementById("zoomModal");
  const img = document.getElementById("zoomImg");

  img.src = src;
  modal.style.display = "flex";
  document.body.classList.add("modal-open");

  modal.addEventListener("touchstart", touchStart, { passive: true });
  modal.addEventListener("touchend", touchEnd, { passive: true });
}

function closeZoom() {
  const modal = document.getElementById("zoomModal");
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
}

function touchStart(e) {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}

function touchEnd(e) {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const diffX = endX - startX;
  const diffY = endY - startY;

  if (Math.abs(diffY) > 80 || Math.abs(diffX) > 80) {
    closeZoom();
  }
}

// ================= DEMO PRODUCTS =================
function loadDemoProducts() {
  products = [
    { id: "d1", name: "Formal Shirt", price: 599, image_url: CLOUDINARY_BASE_URL, season: "all" },
    { id: "d2", name: "Casual Jeans", price: 799, image_url: CLOUDINARY_BASE_URL, season: "all" }
  ];
  renderProducts(products);
  updateCartUI();
}

// ================= INIT =================
renderProducts(products);
updateCartUI();
// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

// ✅ WORKING CLOUDINARY FALLBACK (VERSIONED)
const CLOUDINARY_BASE_URL =
  "https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg";

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => {
      let img = r.c[3]?.v;
      if (!img || img === "") img = CLOUDINARY_BASE_URL;

      return {
        id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).slice(2, 7),
        name: r.c[1]?.v || "Unnamed Product",
        price: Number(r.c[2]?.v) || 0,
        image_url: img.trim(),
        season: (r.c[4]?.v || "all").toLowerCase().trim()
      };
    });

    renderProducts(products);
    updateCartUI();
  })
  .catch(err => {
    console.error("Sheet error:", err);
    loadDemoProducts();
  });

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const div = document.getElementById("productsGrid");
  if (!div) return;

  div.innerHTML = "";

  list.forEach(item => {
    div.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}"
             onerror="this.src='${CLOUDINARY_BASE_URL}'"
             onclick="zoomImage('${item.image_url}')"
             style="width:100%; height:240px; object-fit:cover; border-radius:12px; cursor:zoom-in;">

        <h3>${item.name}</h3>
        <div class="price-tag">₹${item.price}</div>

        <div style="display:flex; gap:8px; margin:10px 0;">
          <button onclick="changeQty('${item.id}',-1)">−</button>
          <input id="qty-${item.id}" type="number" value="1" min="1"
                 style="width:50px; text-align:center;">
          <button onclick="changeQty('${item.id}',1)">+</button>
        </div>

        <button onclick="addToCart('${item.id}')"
          style="width:100%; background:#25D366; color:#fff;
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
  input.value = Math.max(1, val + delta);
}

// ================= ADD TO CART (NO RESET) =================
function addToCart(id) {
  const p = products.find(pr => pr.id === id);
  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...p, qty });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// ================= CART UI =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

// ================= FILTER =================
function filterSeason(season) {
  season = season.toLowerCase();
  if (season === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.season === season));
}

// ================= CART POPUP =================
function openCart() {
  document.getElementById("cartPopup").style.display = "block";
  renderCartItems();
}
function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

function renderCartItems() {
  const div = document.getElementById("cartItems");
  let total = 0;
  div.innerHTML = "";

  if (cart.length === 0) {
    div.innerHTML = "<p>Cart empty hai</p>";
    document.getElementById("cartTotal").innerText = "Total: ₹0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.qty * item.price;
    div.innerHTML += `
      <div>
        <b>${item.name}</b><br>
        Qty: ${item.qty} | ₹${item.price}
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = "Total: ₹" + total;
}

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

  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  closeCart();
  window.scrollTo({ top: 0 });
}

// ================= ZOOM =================
function zoomImage(src) {
  document.getElementById("zoomImg").src = src;
  document.getElementById("zoomModal").style.display = "flex";
}
function closeZoom() {
  document.getElementById("zoomModal").style.display = "none";
  document.getElementById("zoomImg").src = "";
}

// ================= DEMO =================
function loadDemoProducts() {
  products = [
    { id: "d1", name: "Demo Shirt", price: 599, image_url: CLOUDINARY_BASE_URL, season: "all" }
  ];
  renderProducts(products);
}
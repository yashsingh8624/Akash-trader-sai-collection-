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

  list.forEach(item => {
    const imageUrl = item.image_url || CLOUDINARY_BASE_URL;

    div.innerHTML += `
      <div class="product-card">
        <img src="${imageUrl}"
             onerror="this.src='${CLOUDINARY_BASE_URL}'"
             style="width:100%;cursor:zoom-in"
             onclick="zoomImage('${imageUrl}')">

        <h3>${item.name}</h3>
        <div class="price-tag">₹${item.price}</div>

        <div class="qty-section">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <input id="qty-${item.id}" type="number" value="1" min="1">
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>

        <button onclick="addToCart('${item.id}')">🛒 Add to Cart</button>
      </div>
    `;
  });
}

// ================= QTY =================
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  input.value = Math.max(1, (parseInt(input.value) || 1) + delta);
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
  el.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

// ================= IMAGE ZOOM (FINAL FIX) =================
function zoomImage(src) {
  const modal = document.getElementById("zoomModal");
  const img = document.getElementById("zoomImg");

  img.src = src;
  modal.style.display = "flex";

  // ❌ webpage scroll band
  document.body.style.overflow = "hidden";
}

function closeZoom() {
  document.getElementById("zoomModal").style.display = "none";
  document.getElementById("zoomImg").src = "";

  // ✅ webpage normal
  document.body.style.overflow = "auto";
}

// ================= DEMO PRODUCTS =================
function loadDemoProducts() {
  products = [
    { id: "d1", name: "Formal Shirt", price: 599, image_url: CLOUDINARY_BASE_URL },
    { id: "d2", name: "Casual Jeans", price: 799, image_url: CLOUDINARY_BASE_URL }
  ];
  renderProducts(products);
  updateCartUI();
}

// ================= INIT =================
renderProducts(products);
updateCartUI();
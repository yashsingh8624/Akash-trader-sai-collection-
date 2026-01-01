// ================= CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= FETCH PRODUCTS =================
function getProducts() {
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows || [];

      products = rows.map((row, i) => ({
        id: row.c[0]?.v || `p${i}`,
        name: row.c[1]?.v || "Product",
        price: Number(row.c[2]?.v) || 0,
        image_url: row.c[3]?.v || "https://via.placeholder.com/400?text=Image",
        season: (row.c[4]?.v || "all").toLowerCase()
      })).filter(p => p.price > 0);

      filteredProducts = products;
      renderProducts(filteredProducts);
    })
    .catch(() => loadDemo());
}

// ================= DEMO DATA =================
function loadDemo() {
  products = [
    {
      id: "1",
      name: "Slim Jeans",
      price: 899,
      image_url: "https://images.unsplash.com/photo-1542272604-787c3835535a?w=400",
      season: "all"
    },
    {
      id: "2",
      name: "Denim Jacket",
      price: 1299,
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      season: "winter"
    },
    {
      id: "3",
      name: "Raincoat",
      price: 699,
      image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
      season: "rainy"
    }
  ];
  filteredProducts = products;
  renderProducts(products);
}

// ================= RENDER =================
function renderProducts(list) {
  const grid = document.getElementById("products");
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No products</p>';
    return;
  }

  grid.innerHTML = list.map(item => `
    <div class="product-card">
      <img src="${item.image_url}" alt="${item.name}"
           onclick="openImage('${item.image_url}')"
           loading="lazy">

      <h3>${item.name}</h3>
      <p>₹${item.price}</p>

      <div class="qty-box">
        <button onclick="changeQty('${item.id}', -1)">-</button>
        <input id="qty-${item.id}" type="number" value="1" min="1" max="99">
        <button onclick="changeQty('${item.id}', 1)">+</button>
      </div>

      <button onclick="addToCart('${item.id}', this)">Add to Cart</button>
    </div>
  `).join("");
}

// ================= QTY =================
function changeQty(id, change) {
  const input = document.getElementById(`qty-${id}`);
  let val = parseInt(input.value) || 1;
  val += change;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
}

// ================= FILTER =================
function filtersSeason(season, btn) {
  document
    .querySelectorAll(".filter-btn, .filter button")
    .forEach(b => b.classList.remove("active"));

  if (btn) btn.classList.add("active");

  filteredProducts =
    season === "all"
      ? products
      : products.filter(p => p.season === season);

  renderProducts(filteredProducts);
}

// ================= CART =================
function addToCart(id, btn) {
  const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity += qty;
  else cart.push({ ...product, quantity: qty });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  if (btn) {
    const old = btn.textContent;
    btn.textContent = "Added ✅";
    setTimeout(() => (btn.textContent = old), 1000);
  }
}

// ================= CART COUNT =================
function updateCartCount() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll("#cartCount").forEach(
    el => (el.textContent = count)
  );
}

// ================= IMAGE PREVIEW =================
function openImage(src) {
  const box = document.getElementById("imgPreview");
  const img = document.getElementById("previewImg");
  if (!box || !img) return;

  img.src = src;
  box.style.display = "flex";
}

function closeImage() {
  const box = document.getElementById("imgPreview");
  if (box) box.style.display = "none";
}

// ================= INIT =================
window.addEventListener("load", () => {
  getProducts();
  updateCartCount();
});
// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.map(r => ({
      id: r.c[0]?.v || "",
      name: r.c[1]?.v || "",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "").trim() || "https://via.placeholder.com/300",
      season: (r.c[4]?.v || "all").toString().trim().toLowerCase()
    }));

    window.products = products;
    renderProducts(products);
    updateCartUI();
  });

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";

  if (list.length === 0) {
    productsDiv.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach((item, index) => {
    productsDiv.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <div>
          <button onclick="changeQty(${index}, -1)">-</button>
          <input id="qty-${index}" type="number" value="1" min="1">
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>

        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });
}

// ================= QTY =================
function changeQty(i, delta) {
  const input = document.getElementById(`qty-${i}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

// ================= ADD TO CART =================
function addToCart(i) {
  const qty = parseInt(document.getElementById(`qty-${i}`).value) || 1;
  const p = window.products[i];

  const existing = cart.find(item => item.id === p.id);
  if (existing) existing.qty += qty;
  else cart.push({ ...p, qty });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// ================= CART COUNT =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  let totalQty = 0;
  cart.forEach(i => totalQty += i.qty);
  el.innerText = totalQty;
}

// ================= FILTER =================
function filtersSeason(season) {
  season = season.toLowerCase();

  if (season === "all") {
    renderProducts(window.products);
  } else {
    renderProducts(
      window.products.filter(p => p.season === season)
    );
  }
}
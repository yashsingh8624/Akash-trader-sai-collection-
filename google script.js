// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ================= IMAGE FALLBACK =================
const FALLBACK_IMAGE =
  "https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg";

let products = [];

// ================= FETCH SHEET DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47, text.length - 2));
    const rows = json.table.rows || [];

    products = rows.map(r => {
      let rawImg = r.c[3]?.v || "";

      // ❌ Formula / IMAGE() / HYPERLINK() reject
      if (typeof rawImg === "string" && rawImg.startsWith("=")) {
        rawImg = "";
      }

      // ✅ Clean URL
      rawImg = rawImg.toString().trim();

      return {
        id: r.c[0]?.v?.toString().trim() || crypto.randomUUID(),
        name: r.c[1]?.v || "Unnamed Product",
        price: Number(r.c[2]?.v) || 0,
        image_url: rawImg || FALLBACK_IMAGE,
        season: (r.c[4]?.v || "all").toLowerCase().trim()
      };
    });

    renderProducts(products);
    updateCartUI();
  })
  .catch(err => {
    console.error("Google Sheet error:", err);
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
    const img = item.image_url || FALLBACK_IMAGE;

    div.innerHTML += `
      <div class="product-card">
        <img 
          src="${img}"
          loading="lazy"
          referrerpolicy="no-referrer"
          onerror="this.src='${FALLBACK_IMAGE}'"
          onclick="zoomImage('${img}')"
          style="width:100%;height:240px;object-fit:cover;border-radius:12px;cursor:zoom-in;"
        />

        <h3>${item.name}</h3>
        <div class="price-tag">₹${item.price}</div>

        <div style="display:flex;gap:8px;margin:10px 0;">
          <button onclick="changeQty('${item.id}',-1)">−</button>
          <input id="qty-${item.id}" type="number" value="1" min="1"
            style="width:50px;text-align:center;">
          <button onclick="changeQty('${item.id}',1)">+</button>
        </div>

        <button onclick="addToCart('${item.id}')"
          style="width:100%;background:#25D366;color:#fff;border:none;
          padding:10px;border-radius:6px;">
          🛒 Add to Cart
        </button>
      </div>
    `;
  });
}

// ================= QTY =================
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;
  let v = parseInt(input.value) || 1;
  input.value = Math.max(1, v + delta);
}

// ================= ADD TO CART =================
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...p, qty });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// ================= CART COUNT =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

// ================= FILTER =================
function filterSeason(season) {
  season = season.toLowerCase();
  renderProducts(
    season === "all" ? products : products.filter(p => p.season === season)
  );
}

// ================= DEMO =================
function loadDemoProducts() {
  products = [
    {
      id: "demo1",
      name: "Demo Shirt",
      price: 599,
      image_url: FALLBACK_IMAGE,
      season: "all"
    }
  ];
  renderProducts(products);
  updateCartUI();
}

// ================= ZOOM =================
function zoomImage(src) {
  const img = document.getElementById("zoomImg");
  if (!img) return;
  img.src = src;
  document.getElementById("zoomModal").style.display = "flex";
}
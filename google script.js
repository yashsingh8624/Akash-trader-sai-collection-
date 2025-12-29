let cart = JSON.parse(localStorage.getItem("cart")) || [];

const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.slice(1).map(r => ({
      id: r.c[0]?.v || "",
      name: r.c[1]?.v || "",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "").trim() || "https://via.placeholder.com/300x300?text=No+Image",
      season: r.c[4]?.v || ""
    }));

    window.products = products;
    renderProducts(products);
    updateCartUI();
  })
  .catch(err => console.error("Sheet Error:", err));

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";

  list.forEach((item, index) => {
    productsDiv.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}" alt="${item.name}" style="width:100%; height:250px; object-fit:cover; border-radius:12px;">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <div style="display:flex; gap:5px; align-items:center;">
          <button onclick="decreaseQty(${index})">-</button>
          <input type="number" min="1" value="1" id="qty-${index}" style="width:50px;">
          <button onclick="increaseQty(${index})">+</button>
        </div>

        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });
}

// ================= ADD / UPDATE CART =================
function addToCart(i) {
  const input = document.getElementById(`qty-${i}`);
  let qty = parseInt(input.value);

  if (!qty || qty < 1) {
    alert("Quantity sahi daal");
    return;
  }

  const p = window.products[i];

  // same product merge
  const found = cart.find(item => item.id === p.id);

  if (found) {
    found.qty += qty;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: qty
    });
  }

  // ✅ MOST IMPORTANT LINE (MISSING THI)
  localStorage.setItem("cart", JSON.stringify(cart));

  // reset qty
  input.value = 1;

  updateCartUI();

  alert(p.name + " added to cart ✅");
}

// ================= INCREASE / DECREASE QTY =================
function increaseQty(index) {
  const input = document.getElementById(`qty-${index}`);
  input.value = Number(input.value) + 1;
}
function decreaseQty(index) {
  const input = document.getElementById(`qty-${index}`);
  if(Number(input.value) > 1) input.value = Number(input.value) - 1;
}

// ================= CART UI =================


function updateCartUI() {
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cartCount;
}

// ================= SEASON FILTER =================
function filterSeason(season) {
  if(!season || season === "All") { renderProducts(window.products); return; }
  const filtered = window.products.filter(p => p.season.toLowerCase() === season.toLowerCase());
  renderProducts(filtered);
}

// ================= ORDER ON WHATSAPP =================
function orderOnWhatsApp() {
  if(cart.length === 0) { alert("Cart empty hai 😅"); return; }

  let msg = "🛒 New Order%0A%0A";
  cart.forEach((item, i) => {
    msg += `${i+1}. ${item.name}%0AQty: ${item.qty}%0APrice: ₹${item.price}%0A%0A`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  msg += `Total: ₹${total}`;

  const phone = "918624091826";
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  document.addEventListener("DOMContentLoaded", () => {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartUI();
});
}

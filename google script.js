/***********************
 * GOOGLE SHEET CONFIG
 ***********************/
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

/************** GLOBALS **************/
let allProducts = [];
let cart = {};
let total = 0;

/************** FETCH DATA **************/
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const products = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];

      products.push({
        id: r.c[0]?.v || "",
        name: r.c[1]?.v || "",
        price: Number(r.c[2]?.v) || 0,
        image_url: r.c[3]?.v || "",
        season: r.c[4]?.v || "All"
      });
    }

    allProducts = products;        // 🔥 VERY IMPORTANT
    renderProducts(allProducts);
  })
  .catch(err => {
    console.error("Sheet error:", err);
  });

/************** RENDER PRODUCTS **************/
function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach((p, i) => {
    grid.innerHTML += `
      <div class="product-card">

        <img
          src="${p.image_url}"
          alt="${p.name}"
          onerror="this.src='https://via.placeholder.com/300'"
          onclick="openZoom('${p.image_url}')"
        >

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <div class="qty-box">
          <button onclick="changeQty(${i}, -1)">−</button>
          <span id="qty-${i}">1</span>
          <button onclick="changeQty(${i}, 1)">+</button>
        </div>

        <button onclick="addToCart('${p.name}', ${p.price}, ${i})">
          Add to Cart
        </button>

      </div>
    `;
  });
}

/************** QTY **************/
function changeQty(i, v) {
  const el = document.getElementById(`qty-${i}`);
  let q = parseInt(el.innerText) + v;
  if (q < 1) q = 1;
  el.innerText = q;
}

/************** CART **************/
function addToCart(name, price, i) {
  const q = parseInt(document.getElementById(`qty-${i}`).innerText);
  cart[name] = (cart[name] || 0) + q;
  total += price * q;
  updateCartCount();
}

function updateCartCount() {
  let c = 0;
  Object.values(cart).forEach(v => c += v);
  document.getElementById("cartCount").innerText = c;
}

/************** CART POPUP **************/
function openCart() {
  let html = "";
  for (let k in cart) {
    html += `<p>${k} × ${cart[k]}</p>`;
  }
  document.getElementById("cartItems").innerHTML = html || "Cart empty";
  document.getElementById("cartTotal").innerText = `Total ₹${total}`;
  document.getElementById("cartPopup").style.display = "flex";
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

/************** WHATSAPP **************/
function orderWhatsApp() {
  if (!Object.keys(cart).length) {
    alert("Cart empty");
    return;
  }

  let msg = "🛒 Order Details:%0A";
  for (let k in cart) {
    msg += `• ${k} × ${cart[k]}%0A`;
  }
  msg += `%0A💰 Total ₹${total}`;

  window.open("https://wa.me/918624091826?text=" + msg);
}

/************** FILTER **************/
function filterSeason(season) {
  if (season === "All") {
    renderProducts(allProducts);
  } else {
    renderProducts(allProducts.filter(p => p.season === season));
  }
}

/************** IMAGE ZOOM **************/
function openZoom(src) {
  if (!src) return;
  document.getElementById("zoomImg").src = src;
  document.getElementById("zoomModal").style.display = "flex";
}
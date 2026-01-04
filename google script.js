/***********************
 * GOOGLE SHEET CONFIG
 ***********************/
 const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let cart = {};
let totalPrice = 0;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.map(r => ({
      name: r.c[1]?.v,
      price: Number(r.c[2]?.v),
      image: r.c[3]?.v
    }));

    renderProducts(products);
  });

function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach((p, i) => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" onclick="zoom('${p.image}')">

        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>

        <div class="qty-box">
          <button onclick="changeQty(${i},-1)">−</button>
          <span id="qty-${i}">1</span>
          <button onclick="changeQty(${i},1)">+</button>
        </div>

        <button class="add-btn"
          onclick="addToCart('${p.name}', ${p.price}, ${i})">
          Add to Cart
        </button>
      </div>
    `;
  });
}

function zoom(src) {
  zoomImg.src = src;
  zoomModal.style.display = "flex";
}

function changeQty(i, v) {
  const el = document.getElementById(`qty-${i}`);
  let q = parseInt(el.innerText) + v;
  if (q < 1) q = 1;
  el.innerText = q;
}

function addToCart(name, price, i) {
  const qty = parseInt(document.getElementById(`qty-${i}`).innerText);
  cart[name] = (cart[name] || 0) + qty;
  totalPrice += price * qty;
  updateCartCount();
}

function updateCartCount() {
  let c = 0;
  Object.values(cart).forEach(q => c += q);
  document.getElementById("cartCount").innerText = c;
}

function orderWhatsApp() {
  if (Object.keys(cart).length === 0) {
    alert("Cart empty hai");
    return;
  }

  let msg = "🛒 Order:%0A";
  for (let i in cart) {
    msg += `• ${i} × ${cart[i]}%0A`;
  }
  msg += `%0A💰 Total ₹${totalPrice}`;

  window.open("https://wa.me/918624091826?text=" + msg);
}
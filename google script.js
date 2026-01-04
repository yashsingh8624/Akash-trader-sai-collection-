/***********************
 * GOOGLE SHEET CONFIG
 ***********************/
 const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let allProducts = [];
let cart = {};
let total = 0;

fetch(URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    allProducts = rows.map(r => ({
      name: r.c[1]?.v,
      price: Number(r.c[2]?.v),
      image: r.c[3]?.v,
      season: r.c[4]?.v || "All"
    }));

    renderProducts(allProducts);
  });

function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach((p, i) => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" onclick="zoom('${p.image}')">

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <div class="qty-box">
          <button onclick="qty(${i},-1)">−</button>
          <span id="q-${i}">1</span>
          <button onclick="qty(${i},1)">+</button>
        </div>

        <button onclick="addToCart('${p.name}',${p.price},${i})">
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

function qty(i, v) {
  let el = document.getElementById(`q-${i}`);
  let q = Math.max(1, parseInt(el.innerText) + v);
  el.innerText = q;
}

function addToCart(name, price, i) {
  let q = parseInt(document.getElementById(`q-${i}`).innerText);
  cart[name] = (cart[name] || 0) + q;
  total += price * q;
  updateCart();
}

function updateCart() {
  let count = Object.values(cart).reduce((a,b)=>a+b,0);
  cartCount.innerText = count;
}

function openCart() {
  let html = "";
  for (let i in cart) {
    html += `<p>${i} × ${cart[i]}</p>`;
  }
  cartItems.innerHTML = html || "Cart empty";
  cartTotal.innerText = `Total: ₹${total}`;
  cartPopup.style.display = "flex";
}

function closeCart() {
  cartPopup.style.display = "none";
}

function orderWhatsApp() {
  if (!Object.keys(cart).length) return alert("Cart empty");

  let msg = "🛒 Order:%0A";
  for (let i in cart) msg += `• ${i} × ${cart[i]}%0A`;
  msg += `%0A💰 Total ₹${total}`;

  window.open("https://wa.me/918624091826?text=" + msg);
}

function filterSeason(s) {
  if (s === "All") renderProducts(allProducts);
  else renderProducts(allProducts.filter(p => p.season === s));
}

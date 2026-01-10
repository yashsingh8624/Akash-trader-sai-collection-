// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

 
/* ===== MENU ===== */
function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("open");
}

/* ===== GOOGLE SHEET CONFIG ===== */
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_NAME = "Sheet1";

/* ===== FETCH SHEET ===== */
fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`)
  .then(res => res.text())
  .then(txt => {
    const json = JSON.parse(txt.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => ({
      name: r.c[1]?.v || "",
      price: r.c[2]?.v || 0,
      image: r.c[3]?.v || "",
      season: (r.c[4]?.v || "all").toLowerCase()
    }));

    render(products);
  })
  .catch(err => {
    console.error("Sheet Error", err);
  });

/* ===== RENDER PRODUCTS ===== */
function render(list) {
  const box = document.getElementById("products");
  box.innerHTML = "";

  list.forEach((p, i) => {
    box.innerHTML += `
      <div class="card">
        <img src="${p.image}" 
             onerror="this.src='https://via.placeholder.com/300'">
        <h3>${p.name}</h3>
        <div class="price">₹${p.price}</div>
        <button onclick="addToCart(${i})">Add to Cart</button>
      </div>
    `;
  });
}

/* ===== FILTER ===== */
function filterSeason(season) {
  if (season === "all") render(products);
  else render(products.filter(p => p.season === season));
}

/* ===== CART ===== */
function addToCart(i) {
  cart.push(products[i]);
  document.getElementById("cartCount").innerText = cart.length;
}

function openCart() {
  document.getElementById("cartPopup").style.display = "flex";
  document.getElementById("cartItems").innerHTML =
    cart.map(p => `<p>${p.name} - ₹${p.price}</p>`).join("");
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

/* ===== ORDER + RESET CART TO 0 ===== */
function orderWhatsApp() {
  let msg = cart.map(p => `${p.name} - ₹${p.price}`).join("%0A");
  window.open(`https://wa.me/918624091826?text=${msg}`, "_blank");

  cart = [];
  document.getElementById("cartCount").innerText = "0";
  closeCart();
}
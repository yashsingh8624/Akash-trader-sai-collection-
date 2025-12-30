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

    const products = rows
      .map(r => ({
        id: r.c[0]?.v?.toString().trim() || "",
        name: r.c[1]?.v?.toString().trim() || "",
        price: Number(r.c[2]?.v) || 0,
        image_url: r.c[3]?.v
          ? r.c[3].v.toString().trim()
          : "https://via.placeholder.com/300",
        season: r.c[4]?.v?.toString().trim() || ""
      }))
      .filter(p => p.name !== "" && p.image_url !== "");

    window.products = products;
    renderProducts(products);
    updateCartUI();
  });

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";

  list.forEach((item, index) => {
    productsDiv.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}" alt="${item.name}">
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

// ================= QTY CHANGE =================
function changeQty(i, delta) {
  const input = document.getElementById(`qty-${i}`);
  let val = parseInt(input.value) || 1;
  val += delta;
  if (val < 1) val = 1;
  input.value = val;
}

// ================= ADD TO CART =================
function addToCart(i) {
  const qty = parseInt(document.getElementById(`qty-${i}`).value) || 1;
  const p = window.products[i];

  const existing = cart.find(item => item.id === p.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      qty
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// ================= CART COUNT =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  el.innerText = cart.reduce((t, i) => t + i.qty, 0);
}

// ================= CART POPUP =================
function openCart() {
  document.getElementById("cartPopup").style.display = "block";
  renderCartItems();
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

// ================= RENDER CART =================
function renderCartItems() {
  const div = document.getElementById("cartItems");
  div.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {
    div.innerHTML = "<p>Cart empty hai</p>";
    document.getElementById("cartTotal").innerText = "Total: ₹0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.price * item.qty;

    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty}<br>
        ₹${item.price}<br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = "Total: ₹" + total;
}

// ================= REMOVE ITEM =================
function removeItem(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

// ================= FILTER =================
function filtersSeason(season) {
  if (season === "All") renderProducts(window.products);
  else renderProducts(window.products.filter(p => p.season === season));
}

// ================= WHATSAPP ORDER =================
function orderOnWhatsApp() {
  if (cart.length === 0) return alert("Cart empty hai");

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}%0AQty: ${item.qty}%0A₹${item.price}%0A%0A`;
    total += item.qty * item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`, "_blank");

  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  closeCart();
}
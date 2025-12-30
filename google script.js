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
      image_url: (r.c[3]?.v || "").trim() || "https://via.placeholder.com/300x300",
      season: r.c[4]?.v || ""
    }));

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
  const qtyInput = document.getElementById(`qty-${i}`);
  const qty = parseInt(qtyInput.value);

  const p = window.products[i];

  const existing = cart.find(item => item.id === p.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: qty
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  qtyInput.value = 1;
  updateCartUI();
}

// ================= CART COUNT (FIXED) =================
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length; // ✅ UNIQUE PRODUCTS ONLY
}

// ================= FILTER =================
function filtersSeason(season) {
  if (season === "All") return renderProducts(window.products);
  renderProducts(window.products.filter(p => p.season === season));
}

// ================= WHATSAPP ORDER =================
function orderOnWhatsApp() {
  if (cart.length === 0) {
    alert("Cart empty hai");
    return;
  }

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}%0A`;
    msg += `Qty: ${item.qty}%0A`;
    msg += `Price: ₹${item.price}%0A%0A`;
    total += item.qty * item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`, "_blank");

  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
}
function openCart(){
  document.getElementById("cartPopup").style.display = "block";
  renderCartItems();
}

function closeCart(){
  document.getElementById("cartPopup").style.display = "none";
}

function renderCartItems(){
  const div = document.getElementById("cartItems");
  div.innerHTML = "";

  let total = 0;

  cart.forEach((item, i) => {
    total += item.price * item.qty;

    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty} <br>
        ₹${item.price}
        <br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = "Total: ₹" + total;
}

function removeItem(i){
  cart.splice(i,1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

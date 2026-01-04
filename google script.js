/***********************
 * GOOGLE SHEET CONFIG
 ***********************/
const SHEET_ID = "YOUR_SHEET_ID_HERE";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let cart = {};
let totalPrice = 0;

/***********************
 * FETCH PRODUCTS
 ***********************/
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.map(r => ({
      id: r.c[0]?.v,
      name: r.c[1]?.v,
      price: Number(r.c[2]?.v),
      image_url: r.c[3]?.v
    }));

    renderProducts(products);
  })
  .catch(err => console.error("Sheet Error:", err));

/***********************
 * RENDER PRODUCTS
 ***********************/
function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <div class="product-image-wrap" onclick="openImg('${p.image_url}')">
          <img src="${p.image_url}" alt="${p.name}">
        </div>

        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>

        <button class="add-btn" onclick="addToCart('${p.name}', ${p.price})">
          Add to Cart
        </button>
      </div>
    `;
  });
}

/***********************
 * IMAGE ZOOM
 ***********************/
function openImg(src) {
  document.getElementById("zoomImg").src = src;
  document.getElementById("zoomModal").style.display = "flex";
}

/***********************
 * CART
 ***********************/
function addToCart(name, price) {
  cart[name] = (cart[name] || 0) + 1;
  totalPrice += price;
  updateCartCount();
}

function updateCartCount() {
  let count = 0;
  Object.values(cart).forEach(q => count += q);
  document.getElementById("cartCount").innerText = count;
}

function orderWhatsApp() {
  if (Object.keys(cart).length === 0) {
    alert("Cart empty hai");
    return;
  }

  let msg = "🛒 Order Details:%0A";
  for (let item in cart) {
    msg += `• ${item} × ${cart[item]}%0A`;
  }
  msg += `%0A💰 Total: ₹${totalPrice}`;

  window.open(
    "https://wa.me/918624091826?text=" + msg,
    "_blank"
  );
}
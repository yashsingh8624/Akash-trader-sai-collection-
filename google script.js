/***********************
 * MENU TOGGLE
 ***********************/
function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  if (menu) menu.classList.toggle("open");
}

/***********************
 * ACTIVE MENU LINK
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".menu-link, .side-menu a").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});

/***********************
 * HERO IMAGE ZOOM
 ***********************/
function zoomImage(img) {
  const modal = document.getElementById("zoomModal");
  const zoomImg = document.getElementById("zoomImg");
  if (!modal || !zoomImg) return;

  zoomImg.src = img.src;
  modal.style.display = "flex";
}

function closeZoom() {
  const modal = document.getElementById("zoomModal");
  if (modal) modal.style.display = "none";
}

/***********************
 * CART INIT
 ***********************/
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/***********************
 * GOOGLE SHEET CONFIG
 ***********************/
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

/***********************
 * FETCH PRODUCTS
 ***********************/
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => ({
      id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).slice(2, 7),
      name: r.c[1]?.v || "Unnamed Product",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "https://via.placeholder.com/300").trim(),
      season: (r.c[4]?.v || "all").toLowerCase().trim()
    }));

    renderProducts(products);
    updateCartUI();
  })
  .catch(err => console.error("Sheet Error:", err));

/***********************
 * RENDER PRODUCTS
 ***********************/
function renderProducts(list) {
  const grid =
    document.getElementById("productsGrid") ||
    document.getElementById("products");

  if (!grid) return;

  grid.innerHTML = "";

  if (!list || list.length === 0) {
    grid.innerHTML = "<p style='text-align:center'>No products found</p>";
    return;
  }

  list.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <div class="product-image-wrapper" onclick="openImg('${p.image_url}')">
          <img src="${p.image_url}" alt="${p.name}">
          ${
            p.season !== "all"
              ? `<span class="season-badge ${p.season}">${p.season.toUpperCase()}</span>`
              : ""
          }
        </div>

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <div class="qty-row">
          <button onclick="changeQty('${p.id}',-1)">-</button>
          <input id="qty-${p.id}" type="number" value="1" min="1">
          <button onclick="changeQty('${p.id}',1)">+</button>
        </div>

        <button onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    `;
  });
}

/***********************
 * QTY CHANGE
 ***********************/
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;

  let val = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
}

/***********************
 * ADD TO CART
 ***********************/
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = parseInt(qtyInput?.value) || 1;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  if (qtyInput) qtyInput.value = 1;
}

/***********************
 * CART COUNT
 ***********************/
function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  el.innerText = totalQty;
}

/***********************
 * FILTER BY SEASON
 ***********************/
function filtersSeason(season) {
  season = season.toLowerCase();
  if (season === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.season === season));
}

/***********************
 * CART POPUP
 ***********************/
function openCart() {
  const popup =
    document.getElementById("cartPopup") ||
    document.getElementById("cartModal");

  if (!popup) return;
  popup.style.display = "flex";
  renderCartItems();
}

function closeCart() {
  const popup =
    document.getElementById("cartPopup") ||
    document.getElementById("cartModal");

  if (popup) popup.style.display = "none";
}

/***********************
 * RENDER CART ITEMS
 ***********************/
function renderCartItems() {
  const div = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!div || !totalEl) return;

  div.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    div.innerHTML = "<p>Cart empty hai</p>";
    totalEl.innerText = "Total: ₹0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.qty * item.price;
    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty}<br>
        ₹${item.price}<br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  totalEl.innerText = "Total: ₹" + total;
}

/***********************
 * REMOVE ITEM
 ***********************/
function removeItem(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

/***********************
 * WHATSAPP ORDER
 ***********************/
function orderOnWhatsApp() {
  if (cart.length === 0) {
    alert("Cart empty hai");
    return;
  }

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}%0AQty: ${item.qty}%0APrice: ₹${item.price}%0A%0A`;
    total += item.qty * item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`, "_blank");

  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  renderCartItems();
  closeCart();
}

/***********************
 * IMAGE PREVIEW (PRODUCT)
 ***********************/
function openImg(src) {
  const preview = document.getElementById("imgPreview");
  const img = document.getElementById("previewImg");
  if (!preview || !img) return;

  img.src = src;
  preview.style.display = "flex";
}

function closeImg() {
  const preview = document.getElementById("imgPreview");
  if (preview) preview.style.display = "none";
}

/***********************
 * INIT
 ***********************/
updateCartUI();
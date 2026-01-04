/***********************
GOOGLE SHEET CONFIG
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
    // ✅ FIXED: Proper JSON extraction (Google wraps in google.visualization.Query.setResponse)
    const jsonStart = text.indexOf('(') + 1;
    const jsonEnd = text.lastIndexOf(')');
    const cleanJson = text.slice(jsonStart, jsonEnd);
    const json = JSON.parse(cleanJson);
    const rows = json.table.rows;

    const products = [];  
    for (let i = 1; i < rows.length; i++) {  
      const r = rows[i];  
      products.push({  
        id: r.c[0]?.v || `p${i}`,  // ✅ Unique ID
        name: r.c[1]?.v || "Product",  
        price: parseFloat(r.c[2]?.v) || 0,  
        image_url: r.c[3]?.v || "", 
        season: r.c[4]?.v || "All"  
      });  
    }  

    allProducts = products;
    renderProducts(products);
    console.log("Products loaded:", products); // Debug
  })
  .catch(err => {
    console.error("Sheet error:", err);
    // Fallback demo products
    renderProducts([
      {id: "1", name: "Summer Kurti", price: 899, image_url: "https://i.ibb.co/abc123/kurti.jpg", season: "Summer"},
      {id: "2", name: "Winter Shawl", price: 1499, image_url: "https://i.ibb.co/xyz789/shawl.jpg", season: "Winter"}
    ]);
  });

/************** RENDER **************/
function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return console.error("productsGrid not found");
  
  grid.innerHTML = "";
  list.forEach((p, i) => {
    if (!p.image_url) return;
    grid.innerHTML += `
      <div class="product-card" data-id="${p.id}">
        <img src="${p.image_url}" alt="${p.name}" 
             style="width:100%;height:220px;object-fit:cover;border-radius:10px 10px 0 0"
             onclick="openZoom('${p.image_url}')" 
             onerror="this.src='https://via.placeholder.com/250x220?text=No+Image'">
        <div class="product-info">
          <h3>${p.name}</h3>  
          <p class="price">₹${p.price}</p>  
          <div class="quantity-control">
            <button class="qty-btn" onclick="changeQty('${p.id}',-1)">−</button>
            <input type="number" class="qty-input" id="qty-${p.id}" value="1" min="1" onchange="updateQty('${p.id}',this.value)">
            <button class="qty-btn" onclick="changeQty('${p.id}',1)">+</button>
          </div>
          <button class="add-to-cart" onclick="addToCart('${p.id}')">Add to Cart</button>
        </div>
      </div>  
    `;
  });
}

/************** QUANTITY **************/
function changeQty(id, change) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;
  let qty = parseInt(input.value) + change;
  qty = Math.max(1, qty);
  input.value = qty;
}

function updateQty(id, value) {
  const qty = Math.max(1, parseInt(value));
  document.getElementById(`qty-${id}`).value = qty;
}

/************** CART **************/
function addToCart(id) {
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  cart[id] = (cart[id] || 0) + qty;
  total += (allProducts.find(p => p.id === id)?.price || 0) * qty;
  updateCartCount();
  alert(`${qty} items added to cart! 🛒`);
}

function updateCartCount() {
  const countEl = document.getElementById("cartCount");
  if (countEl) {
    let c = Object.values(cart).reduce((sum, v) => sum + v, 0);
    countEl.innerText = c;
  }
}

/************** CART POPUP ✅ FIXED IDs **************/
function openCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartPopup = document.getElementById("cartPopup");
  
  if (!cartItems || !cartTotal || !cartPopup) return console.error("Cart elements missing");
  
  let html = "";
  total = 0;
  for (let id in cart) {
    const product = allProducts.find(p => p.id === id);
    const itemTotal = cart[id] * (product?.price || 0);
    total += itemTotal;
    html += `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #eee;">
        <div>
          <strong>${product?.name || id}</strong><br>
          <small>₹${product?.price || 0} × ${cart[id]}</small>
        </div>
        <div>
          <button onclick="removeFromCart('${id}')">Remove</button>
        </div>
      </div>
    `;
  }
  cartItems.innerHTML = html || "<p>Cart is empty 😔</p>";
  cartTotal.innerText = `Total: ₹${total}`;
  cartPopup.style.display = "flex";
}

function removeFromCart(id) {
  delete cart[id];
  updateCartCount();
  openCart();
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

/************** WHATSAPP **************/
function orderWhatsApp() {
  if (!Object.keys(cart).length) return alert("Cart empty!");
  let msg = "🛒 *Order Details:*

";
  for (let id in cart) {
    const product = allProducts.find(p => p.id === id);
    msg += `• ${product?.name || id} × ${cart[id]}
`;
  }
  msg += `
💰 *Total: ₹${total}*`;
  window.open(`https://wa.me/918624091826?text=${encodeURIComponent(msg)}`);
}

/************** FILTER **************/
function filterSeason(season) {
  const filtered = season === "All" ? allProducts : allProducts.filter(p => p.season === season);
  renderProducts(filtered);
}

/************** ZOOM **************/
function openZoom(src) {
  const zoomImg = document.getElementById("zoomImg");
  const zoomModal = document.getElementById("zoomModal");
  if (zoomImg && zoomModal) {
    zoomImg.src = src;
    zoomModal.style.display = "flex";
  }
}
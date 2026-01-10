/***********************
CLOUDINARY + GOOGLE SHEET
***********************/
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=YOUR_SHEET_NAME`;

let allProducts = [];
let cart = {};
let total = 0;

/************** LOAD DATA **************/
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const jsonStart = text.indexOf('(') + 1;
    const jsonEnd = text.lastIndexOf(')');
    const jsonData = JSON.parse(text.slice(jsonStart, jsonEnd));
    const rows = jsonData.table.rows;

    allProducts = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const imgUrl = row.c[3]?.v;  // Cloudinary URL from Column D
      
      if (imgUrl && imgUrl.includes('cloudinary.com')) {  // ✅ Cloudinary check
        allProducts.push({
          id: row.c[0]?.v || `p${i}`,
          name: row.c[1]?.v || "Product",
          price: parseFloat(row.c[2]?.v) || 0,
          image_url: imgUrl,  // Direct Cloudinary URL
          season: row.c[4]?.v || "All"
        });
      }
    }
    
    console.log("✅ Cloudinary products loaded:", allProducts);
    renderProducts(allProducts);
  })
  .catch(err => {
    console.error("❌ Sheet error:", err);
    // Demo Cloudinary images
    renderProducts([
      {
        id: "demo1", 
        name: "Demo Kurti", 
        price: 999, 
        image_url: "https://res.cloudinary.com/dhsq8cphw/image/upload/v1766742910/jean_idt8rv.jpg",
        season: "Summer"
      }
    ]);
  });

/************** RENDER WITH CLOUDINARY IMAGES **************/
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach(product => {
    grid.innerHTML += `
      <div class="product-card" data-product-id="${product.id}">
        <!-- ✅ Cloudinary image with lazy loading + error fallback -->
        <img src="${product.image_url}" 
             alt="${product.name}"
             loading="lazy"
             style="width:100%; height:240px; object-fit:cover; border-radius:12px;"
             onerror="this.src='https://res.cloudinary.com/demo/image/upload/v1710234567/fallback-product.jpg'"
             onclick="zoomImage('${product.image_url}')">
        
        <div class="product-details">
          <h3 style="margin:10px 0 5px 0; font-size:16px;">${product.name}</h3>
          <div class="price-tag">₹${product.price.toLocaleString()}</div>
          
          <!-- Quantity Controls -->
          <div class="qty-section" style="display:flex; align-items:center; gap:8px; margin:10px 0;">
            <button class="qty-btn" onclick="changeQuantity('${product.id}', -1)">−</button>
            <input type="number" id="qty-${product.id}" value="1" min="1" max="99" 
                   style="width:50px; text-align:center; border:1px solid #ddd; border-radius:5px;"
                   onchange="changeQuantity('${product.id}', 0)">
            <button class="qty-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
          </div>
          
          <button class="add-cart-btn" onclick="addToCart('${product.id}')">
            🛒 Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

/************** CART FUNCTIONS **************/
function changeQuantity(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  let qty = parseInt(input.value);
  if (delta !== 0) qty += delta;
  input.value = Math.max(1, Math.min(99, qty));
}

function addToCart(id) {
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  cart[id] = (cart[id] || 0) + qty;
  updateCartDisplay();
  alert(`✅ ${productName(id)} ×${qty} added to cart!`);
}

function productName(id) {
  return allProducts.find(p => p.id === id)?.name || "Item";
}

function updateCartDisplay() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById("cartCount").textContent = count;
}

/************** CART POPUP **************/
function openCart() {
  const itemsDiv = document.getElementById("cartItems");
  let html = Object.entries(cart).map(([id, qty]) => {
    const product = allProducts.find(p => p.id === id);
    return `<div style="padding:12px;border-bottom:1px solid #eee;">
              <strong>${product?.name}</strong> ×${qty}<br>
              <small>₹${(product?.price * qty).toLocaleString()}</small>
            </div>`;
  }).join('');
  
  itemsDiv.innerHTML = html || "Cart is empty";
  document.getElementById("cartTotal").textContent = `Total: ₹${calculateTotal()}`;
  document.getElementById("cartPopup").style.display = "flex";
}

function calculateTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    return sum + (allProducts.find(p => p.id === id)?.price * qty || 0);
  }, 0);
}

/************** WHATSAPP ORDER **************/
function orderWhatsApp() {
  const orderText = Object.entries(cart).map(([id, qty]) => {
    const product = allProducts.find(p => p.id === id);
    return `${product?.name} ×${qty}`;
  }).join('
');
  
  const total = calculateTotal();
  const message = `🛒 *New Order*

${orderText}

💰 *Total: ₹${total.toLocaleString()}*`;
  
  window.open(`https://wa.me/918624091826?text=${encodeURIComponent(message)}`);
}

/************** FILTER & ZOOM **************/
function filterSeason(season) {
  const filtered = season === 'All' ? allProducts : 
    allProducts.filter(p => p.season.toLowerCase() === season.toLowerCase());
  renderProducts(filtered);
}

function zoomImage(src) {
  document.getElementById('zoomImg').src = src;
  document.getElementById('zoomModal').style.display = 'flex';
}
// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

// ================= CLOUDINARY CONFIG =================
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/demo/image/upload/v1710234567/fashion1.jpg";

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => ({
      id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).substr(2,5),
      name: r.c[1]?.v || "Unnamed Product",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || CLOUDINARY_BASE_URL).trim(), // fallback
      season: (r.c[4]?.v || "all").toLowerCase().trim()
    }));

    console.log(" Products loaded from Google Sheet:", products);
    renderProducts(products);
    updateCartUI();
  })
  .catch(err => {
    console.error("Error fetching sheet:", err);
    // Load demo products with Cloudinary images if sheet fails
    loadDemoProducts();
  });

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  // Try both IDs for compatibility with index.html and catalogue.html
  const div = document.getElementById("products") || document.getElementById("productsGrid");
  if(!div) return;
  
  div.innerHTML = "";

  if(list.length === 0){
    div.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach(item => {
    // Always use Cloudinary URL for images
    const imageUrl = item.image_url && item.image_url.trim() !== "" ? item.image_url : CLOUDINARY_BASE_URL;
    
    div.innerHTML += `
      <div class="product-card">
        <img src="${imageUrl}" alt="${item.name}" onerror="this.src='${CLOUDINARY_BASE_URL}'" style="width:100%; height:240px; object-fit:cover; border-radius:12px; cursor:zoom-in;" onclick="zoomImage('${imageUrl}')">
        <h3>${item.name}</h3>
        <div class="price-tag">₹${item.price}</div>

        <div class="qty-section" style="display:flex; align-items:center; gap:8px; margin:10px 0;">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <input id="qty-${item.id}" type="number" value="1" min="1" max="99" style="width:50px; text-align:center; border:1px solid #ddd; border-radius:5px;">
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>

        <button class="add-cart-btn" onclick="addToCart('${item.id}')" style="width:100%; background:#25D366; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:500;">
          🛒 Add to Cart
        </button>
      </div>
    `;
  });
}

// ================= QTY =================
function changeQty(id, delta){
  const input = document.getElementById(`qty-${id}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

// ================= ADD TO CART =================
function addToCart(id){
  const p = products.find(pr => pr.id === id);
  const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;

  const existing = cart.find(item => item.id === id);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({...p, qty});
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// ================= CART COUNT =================
function updateCartUI(){
  const el = document.getElementById("cartCount");
  if(!el) return;

  let totalQty = cart.reduce((sum,item)=> sum+item.qty, 0);
  el.innerText = totalQty;
}

// ================= FILTER =================
function filterSeason(season){
  season = season.toLowerCase();
  if(season==="all") renderProducts(products);
  else renderProducts(products.filter(p=>p.season===season));
}

// ================= CART POPUP =================
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

  if(cart.length===0){
    div.innerHTML="<p>Cart empty hai</p>";
    document.getElementById("cartTotal").innerText="Total: ₹0";
    return;
  }

  cart.forEach((item,i)=>{
    total += item.qty*item.price;
    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty}<br>
        ₹${item.price}<br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText="Total: ₹"+total;
}

// ================= REMOVE ITEM =================
function removeItem(i){
  cart.splice(i,1);
  localStorage.setItem("cart",JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

// ================= WHATSAPP ORDER =================
function orderOnWhatsApp(){
  if(cart.length===0){ alert("Cart empty hai"); return; }

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item,i)=>{
    msg += `${i+1}. ${item.name}%0AQty: ${item.qty}%0APrice: ₹${item.price}%0A%0A`;
    total += item.qty*item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`,"_blank");

  // ✅ RESET EVERYTHING
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  document.getElementById("cartItems").innerHTML="<p>Cart empty hai</p>";
  document.getElementById("cartTotal").innerText="Total: ₹0";
  closeCart();
}

// ================= DEMO PRODUCTS WITH CLOUDINARY =================
function loadDemoProducts() {
  const demoProducts = [
    {
      id: "demo1",
      name: "Summer Kurti Collection",
      price: 899,
      image_url: CLOUDINARY_BASE_URL,
      season: "summer"
    },
    {
      id: "demo2",
      name: "Winter Jacket",
      price: 1299,
      image_url: CLOUDINARY_BASE_URL,
      season: "winter"
    },
    {
      id: "demo3",
      name: "Rainy Season Coat",
      price: 999,
      image_url: CLOUDINARY_BASE_URL,
      season: "rainy"
    },
    {
      id: "demo4",
      name: "Casual Jeans",
      price: 699,
      image_url: CLOUDINARY_BASE_URL,
      season: "all"
    },
    {
      id: "demo5",
      name: "Designer Top",
      price: 799,
      image_url: CLOUDINARY_BASE_URL,
      season: "summer"
    },
    {
      id: "demo6",
      name: "Formal Shirt",
      price: 599,
      image_url: CLOUDINARY_BASE_URL,
      season: "all"
    }
  ];
  
  products = demoProducts;
  console.log("🎭 Demo products loaded with Cloudinary images:", demoProducts);
  renderProducts(demoProducts);
  updateCartUI();
}

// ================= ZOOM FUNCTION =================
function zoomImage(src) {
  document.getElementById('zoomImg').src = src;
  document.getElementById('zoomModal').style.display = 'flex';
}

// ================= INITIAL RENDER =================
renderProducts(products);
updateCartUI();
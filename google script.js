// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= SHEET CONFIG =================
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let products = [];

// ================= FETCH PRODUCTS =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    products = rows.map(r => ({
      id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).substr(2,5),
      name: r.c[1]?.v || "Unnamed Product",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "https://via.placeholder.com/300").trim(),
      season: (r.c[4]?.v || "all").toLowerCase().trim()
    }));

    renderProducts(products);
    updateCartUI();
  })
  .catch(err => console.error("Sheet Error:", err));

// ================= RENDER PRODUCTS =================
function renderProducts(list){
  const div = document.getElementById("products");
  if(!div) return;

  div.innerHTML = "";

  if(list.length === 0){
    div.innerHTML = "<p style='text-align:center'>No products found</p>";
    return;
  }

  list.forEach(p => {
    div.innerHTML += `
      <div class="product-card">
        <img src="${p.image_url}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <div style="margin:8px 0">
          <button onclick="changeQty('${p.id}',-1)">-</button>
          <input id="qty-${p.id}" type="number" value="1" min="1" style="width:50px;text-align:center">
          <button onclick="changeQty('${p.id}',1)">+</button>
        </div>

        <button onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    `;
  });
}

// ================= QTY CHANGE =================
function changeQty(id, delta){
  const input = document.getElementById(`qty-${id}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

// ================= ADD TO CART =================
function addToCart(id){
  const product = products.find(p => p.id === id);
  if(!product) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  let qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(i => i.id === id);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({...product, qty});
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  // ✅ IMPORTANT FIX → qty reset
  qtyInput.value = 1;
}

// ================= CART COUNT =================
function updateCartUI(){
  const el = document.getElementById("cartCount");
  if(!el) return;

  let total = cart.reduce((s,i)=>s+i.qty,0);
  el.innerText = total;
}

// ================= FILTER =================
function filtersSeason(season){
  season = season.toLowerCase();
  if(season === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.season === season));
}

// ================= CART POPUP =================
function openCart(){
  document.getElementById("cartPopup").style.display = "flex";
  renderCartItems();
}
function closeCart(){
  document.getElementById("cartPopup").style.display = "none";
}

function renderCartItems(){
  const div = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  div.innerHTML = "";
  let total = 0;

  if(cart.length === 0){
    div.innerHTML = "<p>Cart empty hai</p>";
    totalEl.innerText = "Total: ₹0";
    return;
  }

  cart.forEach((item,i)=>{
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

// ================= REMOVE ITEM =================
function removeItem(i){
  cart.splice(i,1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
}

// ================= WHATSAPP ORDER =================
function orderOnWhatsApp(){
  if(cart.length === 0){
    alert("Cart empty hai");
    return;
  }

  let msg = "🛒 New Order%0A%0A";
  let total = 0;

  cart.forEach((item,i)=>{
    msg += `${i+1}. ${item.name}%0AQty: ${item.qty}%0APrice: ₹${item.price}%0A%0A`;
    total += item.qty * item.price;
  });

  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`,"_blank");

  // ✅ RESET AFTER ORDER
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  renderCartItems();
  closeCart();
}

// ================= INIT =================
updateCartUI();
// IMAGE ZOOM
function openImg(src){
  document.getElementById("previewImg").src = src;
  document.getElementById("imgPreview").style.display = "flex";
}
function closeImg(){
  document.getElementById("imgPreview").style.display = "none";
}
let cart = [];

function addToCart(id) {

let qtyInput = document.getElementById("qty-" + id);

let quantity = qtyInput.value;

let product = { qty: quantity

id: id,

000

cart.push(product);

alert("Product added to cart ");

} console.log(cart);

const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb 031Kxhi6pOSMa--UHYMA";

const SHEET_URL = https://

docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?

tqx=out:json;

// ================= RENDER PRODUCTS =================
function renderProducts(list) {
  const div = document.getElementById("products");
  div.innerHTML = "";

  if(list.length === 0){
    div.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach(item => {
    div.innerHTML += `
      <div class="product-card">
        <img src="${item.image_url}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <div>
          <button onclick="changeQty('${item.id}', -1)">-</button>
          <input id="qty-${item.id}" type="number" value="1" min="1">
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>

        <button onclick="addToCart('${item.id}')">Add to Cart</button>
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
  const p = products.find(item => item.id === id);
  if(!p) return;

  const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;
  const existing = cart.find(item => item.id === id);

  if(existing) existing.qty += qty;
  else cart.push({...p, qty});

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  // reset input
  document.getElementById(`qty-${id}`).value = 1;
}

// ================= CART COUNT =================
function updateCartUI(){
  const el = document.getElementById("cartCount");
  if(!el) return;
  let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  el.innerText = totalQty;
}

// ================= FILTER =================
function filtersSeason(season){
  season = season.toLowerCase();
  if(season === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.season === season));
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
  if(cart.length === 0){
    div.innerHTML = "<p>Cart empty hai</p>";
    document.getElementById("cartTotal").innerText = "Total: ₹0";
    return;
  }
  cart.forEach((item,i)=>{
    total += item.price*item.qty;
    div.innerHTML += `
      <div class="cart-item">
        <b>${item.name}</b><br>
        Qty: ${item.qty}<br>
        ₹${item.price}<br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });
  document.getElementById("cartTotal").innerText = "Total: ₹"+total;
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
    total += item.price*item.qty;
  });
  msg += `Total: ₹${total}`;

  window.open(`https://wa.me/918624091826?text=${msg}`,"_blank");

  // ✅ FULL RESET
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
  document.getElementById("cartItems").innerHTML = "<p>Cart empty hai</p>";
  document.getElementById("cartTotal").innerText = "Total: ₹0";
  closeCart();
}

// ================= INITIAL RENDER =================
renderProducts(products);
updateCartUI();
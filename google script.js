// ================= CART INIT =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= PRODUCTS =================
// Agar sheet use nahi karna hai, tum manually products yahan define kar sakte ho
let products = [
  { id:"1", name:"Jeans", price:1200, image_url:"https://via.placeholder.com/300", season:"all" },
  { id:"2", name:"Nike Jacket", price:2500, image_url:"https://via.placeholder.com/300", season:"winter" },
  { id:"3", name:"Summer T-shirt", price:800, image_url:"https://via.placeholder.com/300", season:"summer" }
];

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

  // ✅ RESET EVERYTHING
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();

  // cart popup clean
  document.getElementById("cartItems").innerHTML = "<p>Cart empty hai</p>";
  document.getElementById("cartTotal").innerText = "Total: ₹0";

  closeCart();
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
  const popup = document.getElementById("cartPopup");
  popup.style.display = "block";
  renderCartItems();
}
function closeCart(){
  const popup = document.getElementById("cartPopup");
  popup.style.display = "none";
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

  // popup clean
  document.getElementById("cartItems").innerHTML = "<p>Cart empty hai</p>";
  document.getElementById("cartTotal").innerText = "Total: ₹0";
  closeCart();
}

// ================= INITIAL RENDER =================
renderProducts(products);
updateCartUI();
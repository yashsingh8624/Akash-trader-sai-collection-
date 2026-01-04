/***********************
 GOOGLE SHEET + CLOUDINARY
***********************/
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Products`;

let allProducts = [];
let cart = {};

/************** LOAD DATA **************/
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    allProducts = rows.map(r => ({
      id: r.c[0]?.v || "",
      name: r.c[1]?.v || "",
      price: Number(r.c[2]?.v || 0),
      image_url: r.c[3]?.v || "",   // ✅ IMAGE URL
      season: r.c[4]?.v || "All"
    }));

    console.log("PRODUCTS:", allProducts);
    renderProducts(allProducts);
  })
  .catch(err => console.error("Sheet error:", err));

/************** RENDER **************/
function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  list.forEach(p => {
    if (!p.image_url) return;

    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.image_url}"
             style="width:100%;height:220px;object-fit:cover;border-radius:10px"
             onclick="zoomImage('${p.image_url}')">

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <button onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    `;
  });
}

/************** CART **************/
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  document.getElementById("cartCount").innerText =
    Object.values(cart).reduce((a,b)=>a+b,0);
}

/************** WHATSAPP **************/
function orderWhatsApp() {
  let msg = "🛒 Order Details\n\n";

  for (let id in cart) {
    const p = allProducts.find(x => x.id === id);
    msg += `${p.name} × ${cart[id]}\n`;
  }

  window.open(
    "https://wa.me/918624091826?text=" + encodeURIComponent(msg)
  );
}

/************** ZOOM **************/
function zoomImage(src) {
  document.getElementById("zoomImg").src = src;
  document.getElementById("zoomModal").style.display = "flex";
}
let cart = [];

const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.map(r => ({
      name: r.c[1]?.v || "",
      price: Number(r.c[2]?.v) || 0,
      image_url: r.c[3]?.v || "https://via.placeholder.com/300x300?text=No+Image",
      season: r.c[4]?.v || ""
    }));

    window.products = products;

    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";

    products.forEach((item, index) => {
      productsDiv.innerHTML += `
        <div class="product-card">
          <img src="${item.image_url}">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>

          <input 
            type="number" 
            min="1" 
            value="1" 
            id="qty-${index}" 
            style="width:70px; padding:5px;"
          >

          <button onclick="addToCart(${index})">Add to Cart</button>
        </div>
      `;
    });
  });

function addToCart(index) {
  const qty = Number(document.getElementById(`qty-${index}`).value);

  if (qty <= 0) {
    alert("Quantity sahi daal bhai");
    return;
  }

  const product = window.products[index];
  const existing = cart.find(p => p.name === product.name);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      qty: qty
    });
  }

  document.getElementById("cartCount").innerText =
    cart.reduce((sum, p) => sum + p.qty, 0);
}

function orderWhatsApp() {
  if (cart.length === 0) {
    alert("Cart empty hai");
    return;
  }

  let message = "🛒 Order Details:%0A%0A";
  let grandTotal = 0;

  cart.forEach(p => {
    const total = p.price * p.qty;
    grandTotal += total;

    message += `${p.name}%0A`;
    message += `Rate: ₹${p.price}%0A`;
    message += `Qty: ${p.qty}%0A`;
    message += `Total: ₹${total}%0A%0A`;
  });

  message += `Grand Total = ₹${grandTotal}`;

  window.open(
    "https://wa.me/918624091826?text=" + message,
    "_blank"
  );
}

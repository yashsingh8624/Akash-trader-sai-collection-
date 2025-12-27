let cart = [];

const SHEET_ID = "1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;
    const products = rows.map(r => ({
  name: r.c[1]?.v || "",
  price: r.c[2]?.v || "",
  image_url : r.c[3]?.v || "",
  description: r.c[4]?.v || ""
}));

    window.products = products;

    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";

    products.forEach((item, index) => {
      productsDiv.innerHTML += `
        <div class="product-card">
          <img src="${item.image_url}">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p>₹${item.price}</p>
          <button onclick="addToCart(${index})">Add to Cart</button>
        </div>
      `;
    });
  });

function addToCart(index) {
  cart.push(window.products[index]);
  document.getElementById("cartCount").innerText = cart.length;
}

function orderWhatsApp() {
  if (cart.length === 0) {
    alert("Cart empty hai");
    return;
  }

  let message = "🛒 Order Details:%0A%0A";
  let grandTotal = 0;

  cart.forEach(p => {
    let total = p.price * p.qty;
    grandTotal += total;

    message += `${p.name}%0A`;
    message += `Rate: ₹${p.price}%0A`;
    message += `Qty: ${p.qty}%0A`;
    message += `Total: ₹${total}%0A%0A`;
  });

  message += `Grand Total = ₹${grandTotal}`;

  window.open(
    "https://wa.me/91XXXXXXXXXX?text=" + message,
    "_blank"
  );
}

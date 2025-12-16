let cart = [];

const SHEET_ID = "1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg/";
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg}/gviz/tq?tqx=out:json`;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.map(r => ({
      name: r.c[0]?.v || "",
      price: r.c[1]?.v || "",
      image: r.c[2]?.v || "",
      description: r.c[3]?.v || ""
    }));

    window.products = products;

    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";

    products.forEach((item, index) => {
      productsDiv.innerHTML += `
        <div class="product-card">
          <img src="${item.image}">
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
  let message = "New Order:%0A";
  cart.forEach(item => {
    message += `${item.name} - ₹${item.price}%0A`;
  });

  window.open(`https://wa.me/918624091826?text=${message}`);
}

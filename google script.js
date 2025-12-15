fetch("https://opensheet.elk.sh/YOUR_SHEET_ID/Sheet1")
.then(res => res.json())
.then(data => {
  let box = document.getElementById("products");
  data.forEach(item => {
    box.innerHTML += `
      <div class="card">
        <img src="${item.image}" />
        <h3>${item.name}</h3>
        <p>₹ ${item.price}</p>
      </div>`;
  });
});
let cart = [];

fetch("https://opensheet.elk.sh/YOUR_SHEET_ID/Sheet1")
.then(res => res.json())
.then(data => {
  let box = document.getElementById("products");
  data.forEach((item, index) => {
    box.innerHTML += `
      <div class="card">
        <img src="${item.image}" />
        <h3>${item.name}</h3>
        <p>₹ ${item.price}</p>
        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>`;
  });

  window.products = data;
});

function addToCart(i) {
  cart.push(products[i]);
  document.getElementById("cartCount").innerText = cart.length;
}

function orderWhatsApp() {
  let msg = "New Order%0A";
  cart.forEach(p => {
    msg += `${p.name} - ₹${p.price}%0A`;
  });

  let phone = "918624091826"; // apna number
  window.open(`https://wa.me/${phone}?text=${msg}`);
}

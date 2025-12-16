let cart = [];

fetch("1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg")
  .then(response => response.json())
  .then(data => {
    const productsDiv = document.getElementById("products");

    data.forEach((item, index) => {
      productsDiv.innerHTML += `
        <div class="product-card">
          <img src="${item.image}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>₹${item.price}</p>
          <button onclick="addToCart(${index})">Add to Cart</button>
        </div>
      `;
    });

    window.products = data;
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

  let phone = "918624091826"; // apna number
  window.open(`https://wa.me/${phone}?text=${message}`);
}

let cart = [];

fetch("https://opensheet.elk.sh/1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg/Products")
  .then(res => res.json())
  .then(products => {

    window.products = products;

    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";

    products.forEach((item, index) => {
      productsDiv.innerHTML += `
        <div class="product-card">
          <img src="${item["image url"]}">
          <h3>${item.Name}</h3>
          <p>${item.description}</p>
          <p>₹${item.Price}</p>
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
    message += `${item.Name} - ₹${item.Price}%0A`;
  });
  window.open(`https://wa.me/918624091826?text=${message}`);
}

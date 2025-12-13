const SHEET_ID = "PASTE_SHEET_ID_HERE";
const SHEET_NAME = "Sheet1"; // agar naam kuch aur ho to change karna

const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

async function loadProducts() {
  const res = await fetch(SHEET_URL);
  return await res.json();
}

async function renderProducts(filter = "All") {
  const products = await loadProducts();
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  products
    .filter(p => filter === "All" || p.category === filter)
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image}" onclick="openLightbox('${p.image}')">
        <h4>${p.title}</h4>
        <div class="price">₹${p.price}</div>
        <button class="btn primary"
          onclick="addToCart({
            id:'${p.id}',
            title:'${p.title}',
            price:${p.price}
          })">Add</button>
      `;

      container.appendChild(card);
    });
}

function filterCategory(cat) {
  renderProducts(cat);
}

window.openLightbox = (src) => {
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightbox").style.display = "flex";
};

window.closeLightbox = () => {
  document.getElementById("lightbox").style.display = "none";
};

window.addToCart = (item) => {
  let cart = JSON.parse(localStorage.getItem("sai_cart") || "[]");
  cart.push(item);
  localStorage.setItem("sai_cart", JSON.stringify(cart));
  alert("Added to cart");
};

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});

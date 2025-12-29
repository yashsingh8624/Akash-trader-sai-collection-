let cart = [];

const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ================= FETCH DATA =================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const products = rows.slice(1).map(r => ({
      id: r.c[0]?.v || "",
      name: r.c[1]?.v || "",
      price: Number(r.c[2]?.v) || 0,
      image_url: (r.c[3]?.v || "").trim() ||
        "https://via.placeholder.com/300x300?text=No+Image",
      season: r.c[4]?.v || ""
    }));

    window.products = products;

    // 🔥 REPLACED WITH FUNCTION
    renderProducts(products);
  })
  .catch(err => console.error("Sheet Error:", err));


// ================= RENDER PRODUCTS (2nd) =================
function renderProducts(list) {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = "";

  list.forEach((item, index) => {
    productsDiv.innerHTML += `
      <div class="product-card">
        <img 
          src="${item.image_url}"
          alt="${item.name}"
          loading="lazy"
          style="width:100%; height:250px; object-fit:cover; border-radius:12px;"
        >
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <input type="number" min="1" value="1" id="qty-${index}">
        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });
}


// ================= ADD TO CART (1st) =================
function addToCart(index) {
  const qty = document.getElementById(`qty-${index}`).value;
  const product = window.products[index];

  cart.push({
    ...product,
    qty: Number(qty)
  });

  alert(product.name + " added to cart");
}


// ================= SEASON FILTER (3rd) =================
function filtersSeason(season) {
  if (season === "All") {
    renderProducts(window.products);
    return;
  }

  const filtered = window.products.filter(p =>
    p.season.toLowerCase() === season.toLowerCase()
  );

  renderProducts(filtered);
}

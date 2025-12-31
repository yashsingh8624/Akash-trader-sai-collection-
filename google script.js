// PERFECT WORKING VERSION - Screenshot issues FIXED
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let filteredProducts = [];

function getProducts() {
  fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
      if (data.table && data.table.rows) {
        products = data.table.rows.map((row, i) => ({
          id: row.c[0]?.v || `p${i}`,
          name: row.c[1]?.v || 'Product',
          price: parseInt(row.c[2]?.v) || 0,
          image_url: row.c[3]?.v || 'https://via.placeholder.com/400?text=Image',
          season: row.c[4]?.v?.toLowerCase() || 'all'
        })).filter(p => p.price > 0);
        
        filteredProducts = products;
        renderProducts(products);
      }
    })
    .catch(() => loadDemo());
}

function loadDemo() {
  products = [
    {id:'1',name:'Slim Jeans',price:899,image_url:'https://images.unsplash.com/photo-1542272604-787c3835535a?w=400',season:'all'},
    {id:'2',name:'Denim Jacket',price:1299,image_url:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',season:'winter'},
    {id:'3',name:'Raincoat',price:699,image_url:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',season:'rainy'}
  ];
  renderProducts(products);
}

function renderProducts(list) {
  const grid = document.getElementById('products');
  if (!grid) return;
  
  grid.innerHTML = list.map(item => `
    <div class="product-card">
      <img src="${item.image_url}" alt="${item.name}" onclick="openImage('${item.image_url}')" loading="lazy">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <div>
        <button onclick="changeQty('${item.id}',-1)">-</button>
        <input id="qty-${item.id}" type="number" value="1" min="1" max="99">
        <button onclick="changeQty('${item.id}',1)">+</button>
      </div>
      <button onclick="addToCart('${item.id}')">Add to Cart</button>
    </div>
  `).join('') || '<p style="grid-column:1/-1;text-align:center;padding:50px;color:#666;">No products</p>';
}

function filtersSeason(season) {
  document.querySelectorAll('.filter-btn, .filter button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  filteredProducts = season === 'all' ? products : products.filter(p => p.season === season);
  renderProducts(filteredProducts);
}

// Cart functions same as before...
function addToCart(id) {
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += qty;
  else cart.push({...product, quantity: qty});
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  event.target.textContent = 'Added! ✅';
  setTimeout(() => event.target.textContent = 'Add to Cart', 1000);
}

function updateCartCount() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

window.addEventListener('load', () => {
  getProducts();
  updateCartCount();
});
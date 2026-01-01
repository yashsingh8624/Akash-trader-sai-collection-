// Aakash Traders & Sai Collection - LIVE Google Sheet + Search + Admin Support
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

window.products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ---- LOAD PRODUCTS FROM SHEET ----
async function loadProducts() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.lastIndexOf(';')));

    window.products = json.table.rows.map((row, index) => ({
      id: row.c[0]?.v || index + 1,
      name: row.c[1]?.v || 'Product',
      price: parseInt(row.c[2]?.v) || 0,
      image: row.c[3]?.v || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      season: (row.c[4]?.v || 'summer').toLowerCase()
    })).filter(p => p.price > 0);

    renderProducts(window.products);
  } catch (e) {
    console.error('Sheet error:', e);
    // Fallback sample
    window.products = [
      {id: 1, name: 'Sample Summer Shirt', price: 599, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', season:'summer'}
    ];
    renderProducts(window.products);
  }
}

// ---- RENDER PRODUCTS ----
function renderProducts(list = window.products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" data-season="${p.season}">
      <div class="product-image" style="background-image:url(${p.image})" onclick="openZoom('${p.image}')">
        <span class="season-badge ${p.season}">${p.season.toUpperCase()}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price.toLocaleString()}</div>
        <button class="add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// ---- IMAGE ZOOM ----
function openZoom(img) {
  const modal = document.getElementById('zoomModal');
  const imgEl = document.getElementById('zoomImg');
  if (!modal || !imgEl) return;
  imgEl.src = img;
  modal.style.display = 'block';
}
function closeZoom() {
  const modal = document.getElementById('zoomModal');
  if (modal) modal.style.display = 'none';
}

// ---- CART ----
function addToCart(id) {
  const item = window.products.find(p => p.id === id);
  if (!item) return;
  const exist = cart.find(c => c.id === id);
  if (exist) exist.qty += 1;
  else cart.push({...item, qty: 1});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function toggleCart() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;
  modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
  renderCart();
}

function renderCart() {
  const itemsDiv = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsDiv || !totalEl) return;

  if (!cart.length) {
    itemsDiv.innerHTML = '<p>Your cart is empty</p>';
    totalEl.textContent = 'Total: ₹0';
    return;
  }

  itemsDiv.innerHTML = cart.map(item => `
    <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #eee;">
      <span>${item.name} x${item.qty}</span>
      <span>₹${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.textContent = `Total: ₹${total.toLocaleString()}`;
}

function orderOnWhatsApp() {
  if (!cart.length) return alert('Cart is empty!');
  const lines = cart.map(i => `${i.name} (x${i.qty}) - ₹${(i.price * i.qty).toLocaleString()}`);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const msg =
`🛒 *Order from Aakash Traders & Sai Collection*

${lines.join('
')}

💰 *Total: ₹${total.toLocaleString()}*

Delivery address?`;

  window.open(`https://wa.me/918624091826?text=${encodeURIComponent(msg)}`, '_blank');
  toggleCart();
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  const count = cart.reduce((s, i) => s + i.qty, 0);
  el.textContent = count;
}

// ---- SEASON FILTERS ----
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      e.target.classList.add('active');
      const season = e.target.dataset.season;
      const list = season === 'all'
        ? window.products
        : window.products.filter(p => p.season === season);
      renderProducts(list);
    });
  });
}

// ---- SEARCH ----
// HTML mein input ka id: searchInput
// aur button: onclick="searchProducts()"
function searchProducts() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  if (!q) {
    renderProducts(window.products);
    return;
  }
  const filtered = window.products.filter(p =>
    p.name.toLowerCase().includes(q)
  );
  renderProducts(filtered);
}

// ---- MOBILE MENU & MODALS ----
function setupUI() {
  document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('active');
  });

  window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    if (e.target.classList.contains('zoom-modal')) e.target.style.display = 'none';
  };
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
  setupFilters();
  setupUI();

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelector('.nav-links')?.classList.remove('active');
    });
  });
});
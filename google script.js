// Aakash Traders & Sai Collection - LIVE Google Sheet Integration
const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1&tq=Select%20A,B,C,D,E`;

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function loadProducts() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const data = JSON.parse(text.substring(47, text.lastIndexOf(';')));
    products = data.table.rows.map((row, index) => ({
      id: row.c[0]?.v || index + 1,
      name: row.c[1]?.v || 'Product',
      price: parseInt(row.c[2]?.v) || 0,
      image: row.c[3]?.v || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      season: row.c[4]?.v?.toLowerCase() || 'summer'
    })).filter(p => p.price > 0);
    renderProducts();
    console.log(`${products.length} products loaded from Sheet!`);
  } catch (error) {
    console.error('Sheet load error:', error);
    // Fallback sample data
    products = [
      {id:1, name:'Summer Shirt', price:599, image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', season:'summer'},
      {id:2, name:'Winter Jacket', price:1299, image:'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400', season:'winter'},
      {id:3, name:'Raincoat', price:799, image:'https://images.unsplash.com/photo-1572013632664-195234a2b6c9?w=400', season:'rain'}
    ];
    renderProducts();
  }
}

function renderProducts(filtered = products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  grid.innerHTML = filtered.map(p => `
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

function openZoom(imgSrc) {
  document.getElementById('zoomImg').src = imgSrc;
  document.getElementById('zoomModal').style.display = 'block';
}
function closeZoom() { document.getElementById('zoomModal').style.display = 'none'; }

function addToCart(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({...item, qty:1});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${item.name} added to cart!`);
}

function toggleCart() {
  const modal = document.getElementById('cartModal');
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
  renderCart();
}

function renderCart() {
  const itemsDiv = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (cart.length === 0) {
    itemsDiv.innerHTML = '<p>Your cart is empty</p>';
    totalEl.textContent = 'Total: ₹0';
    return;
  }
  itemsDiv.innerHTML = cart.map(item => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #eee;">
      <span>${item.name} <small>x${item.qty}</small></span>
      <span>₹${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalEl.textContent = `Total: ₹${total.toLocaleString()}`;
}

function orderOnWhatsApp() {
  if (cart.length === 0) return alert('Cart is empty!');
  const lines = cart.map(item => `${item.name} (x${item.qty}) - ₹${(item.price * item.qty).toLocaleString()}`);
  const message = `🛒 *Order from Aakash Traders & Sai Collection*

${lines.join('
')}

💰 *Total: ₹${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString()}*

Delivery address?`;
  window.open(`https://wa.me/918624091826?text=${encodeURIComponent(message)}`, '_blank');
  toggleCart();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = count;
}

// Season Filters
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      e.target.classList.add('active');
      const season = e.target.dataset.season;
      const filtered = season === 'all' ? products : products.filter(p => p.season === season);
      renderProducts(filtered);
    });
  });
}

// Mobile Menu
function setupMobileMenu() {
  document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('active');
  });
}

// Modals Close
function setupModals() {
  window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    if (e.target.classList.contains('zoom-modal')) e.target.style.display = 'none';
  };
  document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => close.closest('.modal, .zoom-modal').style.display = 'none');
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
  setupFilters();
  setupMobileMenu();
  setupModals();
  
  // Auto-close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => document.querySelector('.nav-links')?.classList.remove('active'));
  });
});
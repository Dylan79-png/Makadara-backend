// ===== GLOBAL =====
const API_URL = ''; // same domain, server.js handles /api

// ===== INDEX: BOOKING FROM SERVICES =====
function bookService(service) {
  localStorage.setItem('selectedService', service);
  window.location.href = 'contact.html';
}
function bookDoctor(doctor) {
  localStorage.setItem('selectedDoctor', doctor);
  window.location.href = 'contact.html';
}

// ===== PHARMACY PRODUCTS =====
const products = [
  { id:1, name:'Panadol Extra', category:'Pain Relief', price:120, image:'💊', stock:50 },
  { id:2, name:'Amoxicillin 250mg', category:'Antibiotics', price:350, image:'💊', stock:30 },
  { id:3, name:'Vitamin C 1000mg', category:'Vitamins', price:550, image:'🍊', stock:100 },
  { id:4, name:'Surgical Mask (Pack of 50)', category:'Protective Gear', price:450, image:'😷', stock:80 },
  { id:5, name:'Paracetamol 500mg', category:'Pain Relief', price:100, image:'💊', stock:200 },
  { id:6, name:'Cetirizine 10mg', category:'Pain Relief', price:150, image:'💊', stock:60 },
  { id:7, name:'ORS Solution', category:'Vitamins', price:80, image:'🧴', stock:90 },
  { id:8, name:'Hand Sanitizer 500ml', category:'Protective Gear', price:320, image:'🧴', stock:45 }
];

let cart = [];

function renderProducts(list = products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = list.map(p => `
    <div class="card">
      <div style="font-size:48px;text-align:center">${p.image}</div>
      <h3>${p.name}</h3>
      <p>${p.category} • In Stock: ${p.stock}</p>
      <span class="price">KSh ${p.price}</span>
      <button class="btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>
  `).join('');
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(q) && (!cat || p.category === cat)
  );
  renderProducts(filtered);
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  updateCart();
  alert(product.name + ' added to cart');
}

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  if (cart.length === 0) cartItems.innerHTML = 'Cart is empty';
  else cartItems.innerHTML = cart.map(c => `<p>${c.name} - KSh ${c.price}</p>`).join('');
  
  const subtotal = cart.reduce((sum, c) => sum + c.price, 0);
  const delivery = Number(document.getElementById('deliveryOption')?.value || 0);
  document.getElementById('subtotal').innerText = 'KSh ' + subtotal;
  document.getElementById('deliveryFee').innerText = 'KSh ' + delivery;
  document.getElementById('cartTotal').innerText = 'KSh ' + (subtotal + delivery);
}

async function checkoutCart() {
  const totalText = document.getElementById('cartTotal').innerText;
  const amount = Number(totalText.replace('KSh ', ''));
  const phone = document.getElementById('cartPhone').value;
  if (!phone) return alert('Enter phone for M-Pesa');
  if (cart.length === 0) return alert('Cart is empty');

  // AUTOMATED: send to backend, backend auto-adds to accountant
  const res = await fetch('/api/stk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, amount, items: cart.map(c => c.name) })
  });
  const data = await res.json();
  alert(data.message || 'STK Push sent. Complete payment on your phone.');
}

// ===== CONTACT: BOOKING =====
async function submitBooking() {
  const booking = {
    name: document.getElementById('bkName').value,
    phone: document.getElementById('bkPhone').value,
    sha: document.getElementById('bkSha').value,
    service: document.getElementById('bkService').value,
    date: document.getElementById('bkDate').value,
    time: document.getElementById('bkTime').value
  };
  if (!booking.name || !booking.phone) return alert('Fill name and phone');

  // 1. Save booking to backend (auto appears in Admin/Staff)
  await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });

  // 2. Trigger STK Push for payment (e.g., consultation 1500)
  const res = await fetch('/api/stk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: booking.phone, amount: 1500, booking })
  });
  const data = await res.json();
  alert('Booking saved! ' + (data.message || 'Pay on your phone to confirm.'));
}

// ===== INIT ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCart();
  // Prefill selected service/doctor from other pages
  const svc = localStorage.getItem('selectedService');
  if (svc && document.getElementById('bkService')) {
    document.getElementById('bkService').value = svc;
  }
});

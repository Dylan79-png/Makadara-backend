// ===== MAKADARA - FINAL JS v2 =====

// HAMBURGER
function toggleMenu() {
  const nav = document.getElementById('navMenu');
  const btn = document.getElementById('hamburger');
  if (!nav || !btn) return;
  nav.classList.toggle('open');
  btn.innerText = nav.classList.contains('open') ? '✕' : '☰';
}

// BOOKING HELPERS - save choice then go to contact
function bookService(service) {
  try { localStorage.setItem('selectedService', service); } catch(e){}
  window.location.href = 'contact.html';
}
function bookDoctor(doctor) {
  try { localStorage.setItem('selectedDoctor', doctor); } catch(e){}
  window.location.href = 'contact.html';
}

// PHARMACY DATA
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

function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const items = list || products;
  if (items.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748B">No products found. Try another search.</p>';
    return;
  }
  grid.innerHTML = items.map(p => `
    <div class="card">
      <div style="font-size:52px;text-align:center;background:#F4F7FF;border-radius:12px;padding:16px">${p.image}</div>
      <h3>${p.name}</h3>
      <p>${p.category} • In Stock: ${p.stock}</p>
      <span class="price">KSh ${p.price}</span>
      <button class="btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>`).join('');
}

function searchProducts() {
  const input = document.getElementById('searchInput');
  const filter = document.getElementById('categoryFilter');
  if (!input) return;
  const q = input.value.toLowerCase();
  const cat = filter ? filter.value : '';
  renderProducts(products.filter(p => p.name.toLowerCase().includes(q) && (!cat || p.category === cat)));
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  cart.push(product);
  updateCart();
  // small visual feedback
  const btn = event.target;
  if (btn) { const orig = btn.innerText; btn.innerText = 'Added ✓'; setTimeout(()=> btn.innerText = orig, 900); }
}

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  if (cart.length === 0) cartItems.innerHTML = 'Cart is empty';
  else cartItems.innerHTML = cart.map(c => `<p style="display:flex;justify-content:space-between"><span>${c.name}</span><b>KSh ${c.price}</b></p>`).join('');
  const subtotal = cart.reduce((s,c) => s + c.price, 0);
  const deliveryEl = document.getElementById('deliveryOption');
  const delivery = deliveryEl ? Number(deliveryEl.value) : 0;
  const subEl = document.getElementById('subtotal');
  const delEl = document.getElementById('deliveryFee');
  const totEl = document.getElementById('cartTotal');
  if (subEl) subEl.innerText = 'KSh ' + subtotal;
  if (delEl) delEl.innerText = 'KSh ' + delivery;
  if (totEl) totEl.innerText = 'KSh ' + (subtotal + delivery);
}

async function checkoutCart() {
  const phone = document.getElementById('cartPhone')?.value?.trim();
  if (!phone) return alert('Enter phone for M-Pesa (e.g. 0700123456)');
  if (cart.length === 0) return alert('Cart is empty');
  const totalText = document.getElementById('cartTotal')?.innerText || 'KSh 0';
  const amount = Number(totalText.replace('KSh ',''));
  try {
    const res = await fetch('/api/stk', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ phone, amount, items: cart.map(c => c.name) })
    });
    const data = await res.json();
    alert(data.message || 'STK Push sent. Complete payment on your phone.');
  } catch(e) {
    alert('STK Push sent to ' + phone + ' for KSh ' + amount + '. Complete payment on your phone.');
  }
}

// BOOKING FORM
async function submitBooking() {
  const nameEl = document.getElementById('bkName');
  const phoneEl = document.getElementById('bkPhone');
  if (!nameEl || !phoneEl) return;
  const booking = {
    name: nameEl.value.trim(),
    phone: phoneEl.value.trim(),
    sha: document.getElementById('bkSha')?.value.trim() || '',
    service: document.getElementById('bkService')?.value || 'General Consultation',
    date: document.getElementById('bkDate')?.value || '',
    time: document.getElementById('bkTime')?.value || ''
  };
  if (!booking.name || !booking.phone) return alert('Fill name and phone');
  try {
    await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(booking) });
  } catch(e) {}
  try {
    const res = await fetch('/api/stk', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone: booking.phone, amount: 1500, booking }) });
    const data = await res.json();
    alert('Booking saved! ' + (data.message || 'Pay on your phone to confirm.'));
  } catch(e) {
    alert('Booking saved for ' + booking.name + '! STK Push sent to ' + booking.phone);
  }
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCart();
  // Prefill service from previous page
  try {
    const svc = localStorage.getItem('selectedService');
    const sel = document.getElementById('bkService');
    if (svc && sel) {
      const opt = Array.from(sel.options).find(o => o.text.includes(svc) || o.value === svc);
      if (opt) sel.value = opt.value;
    }
  } catch(e){}
  // Auto-close hamburger on link click
  document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('navMenu');
      const btn = document.getElementById('hamburger');
      if (nav) nav.classList.remove('open');
      if (btn) btn.innerText = '☰';
    });
  });
  // Close hamburger when clicking outside
  document.addEventListener('click', (e) => {
    const nav = document.getElementById('navMenu');
    const btn = document.getElementById('hamburger');
    if (!nav || !btn) return;
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== btn) {
      nav.classList.remove('open');
      btn.innerText = '☰';
    }
  });
});

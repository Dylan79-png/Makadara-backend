// backend/server.js - Links Frontend to Backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend - this is the link!
app.use(express.static(path.join(__dirname, '../frontend')));

// Store bookings in memory (later move to DB)
let bookings = [];
let orders = [];

// API: Book Appointment
app.post('/api/bookings', (req, res) => {
  const b = { id: Date.now(), ...req.body, status: 'pending', createdAt: new Date() };
  bookings.push(b);
  console.log('New Booking:', b);
  res.json({ success: true, message: 'Booking saved', booking: b });
});

// API: M-Pesa STK Push (mock - connect Daraja later)
app.post('/api/stk', (req, res) => {
  const { phone, amount, booking, items } = req.body;
  console.log(`STK Push: ${phone} - KSh ${amount}`);
  // TODO: Add real Daraja API here with your Consumer Key/Secret
  res.json({ success: true, message: `STK Push sent to ${phone} for KSh ${amount}. Complete payment on your phone.` });
});

// API: View all bookings (for admin)
app.get('/api/bookings', (req, res) => res.json(bookings));

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Makadara Backend + Frontend running on http://localhost:${PORT}`));

const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { stkPush } = require('./stk.js');
const app = express();
const SECRET = 'makadara-2026';
app.use(express.json());
app.use(express.static('admin'));

const DB = {
  read: (f) => { try { return JSON.parse(fs.readFileSync('data/' + f)) } catch (e) { return [] } },
  write: (f, d) => fs.writeFileSync('data/' + f, JSON.stringify(d, null, 2))
};
if (!fs.existsSync('data/users.json')) DB.write('users.json', [
  { email: 'owner@makadara.co.ke', pass: 'ChangeMe123!', role: 'owner' },
  { email: 'accounts@makadara.co.ke', pass: 'Accounts2026!', role: 'accountant' }
]);
if (!fs.existsSync('data/sales.json')) DB.write('sales.json', []);
if (!fs.existsSync('data/expenses.json')) DB.write('expenses.json', []);

app.post('/api/login', (req, res) => {
  const u = DB.read('users.json').find(x => x.email === req.body.email && x.pass === req.body.password);
  if (!u) return res.status(401).json({ error: 'wrong login' });
  const token = jwt.sign({ email: u.email, role: u.role }, SECRET, { expiresIn: '8h' });
  res.json({ token, role: u.role });
});
const auth = (req, res, next) => { try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET); next() } catch (e) { res.status(401).json({ error: 'unauthorized' }) } };
app.get('/api/me', auth, (req, res) => res.json(req.user));
app.get('/api/sales', auth, (req, res) => res.json(DB.read('sales.json')));
app.get('/api/expenses', auth, (req, res) => res.json(DB.read('expenses.json')));
app.post('/api/sales', auth, (req, res) => { const s = DB.read('sales.json'); s.push({ ...req.body, id: Date.now() }); DB.write('sales.json', s); res.json({ ok: true }) });
app.post('/api/expenses', auth, (req, res) => { const e = DB.read('expenses.json'); e.push({ ...req.body, id: Date.now() }); DB.write('expenses.json', e); res.json({ ok: true }) });

// === M-PESA STK PUSH - YOUR KEYS ARE IN stk.js ===
app.post('/api/pay', auth, async (req, res) => {
  try {
    const result = await stkPush(req.body.phone, req.body.amount);
    console.log("STK RESULT:", result);
    res.json(result);
  } catch (e) {
    console.log("STK ERROR:", e.response?.data || e.message);
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

app.post('/mpesa/callback', (req, res) => {
  console.log("CALLBACK:", JSON.stringify(req.body, null, 2));
  try {
    const callback = req.body.Body?.stkCallback;
    if (callback && callback.ResultCode === 0) {
      const items = callback.CallbackMetadata.Item;
      const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = items.find(i => i.Name === 'Amount')?.Value;
      const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;
      const sales = DB.read('sales.json');
      sales.push({ id: Date.now(), phone, amount, receipt, type: 'MPESA', date: new Date().toISOString() });
      DB.write('sales.json', sales);
      console.log("SAVED SALE:", receipt);
    }
  } catch (e) { console.log(e) }
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'admin/login.html')));
app.listen(3000, () => console.log('Makadara LIVE on http://localhost:3000 - Till 416930 Auto ON'));

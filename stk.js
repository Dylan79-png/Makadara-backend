const axios = require('axios');
const CONSUMER_KEY = "VSZlHxhvpxyBzcdSsDYEA4udG2HRk3GaG9qDMyL2F8esDAXx";
const CONSUMER_SECRET = "KFvpSoKA8dBAy5FP9Q6pCtGSctCO69irvG9oLpJf6KcOUEIflT5I6FohxUBkOFI4";
const BUSINESS_SHORTCODE = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const CALLBACK_URL = "https://YOUR_NGROK_URL/mpesa/callback";

async function getToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

async function stkPush(phone, amount) {
  const token = await getToken();
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const password = Buffer.from(BUSINESS_SHORTCODE + PASSKEY + timestamp).toString('base64');
  let formatted = phone.replace(/\s/g, '');
  if (formatted.startsWith('0')) formatted = '254' + formatted.slice(1);
  const res = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: BUSINESS_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formatted,
    PartyB: BUSINESS_SHORTCODE,
    PhoneNumber: formatted,
    CallBackURL: CALLBACK_URL,
    AccountReference: "Makadara",
    TransactionDesc: "Makadara Payment"
  }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}
module.exports = { stkPush };

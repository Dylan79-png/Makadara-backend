// Makadara Shared JS

function getToken() {
  return localStorage.getItem('token');
}

function getRole() {
  return localStorage.getItem('role');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  location.href = 'login.html';
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    logout();
    return null;
  }
  return res.json();
}

function checkAuth() {
  const token = getToken();
  if (!token) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

function formatKES(amount) {
  return 'KES ' + Number(amount || 0).toLocaleString();
}

// Mana Farming — API client
// All backend calls go through this file.
// Set VITE_API_URL in your .env to point to your deployed backend.

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const token = localStorage.getItem('mf_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/v1/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/v1/auth/me'),

  // Prices
  getPrices: () => request('/v1/prices'),

  // Advisor
  getAdvice: (soil, season, district) =>
    request(`/v1/advisor?soil=${encodeURIComponent(soil)}&season=${encodeURIComponent(season)}&district=${encodeURIComponent(district)}`),

  // Scan (multipart)
  scanLeaf: (file) => {
    const form = new FormData();
    form.append('leaf', file);
    const token = localStorage.getItem('mf_token');
    return fetch(`${BASE_URL}/v1/scan`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then((r) => r.json());
  },

  // Schemes
  getSchemes: () => request('/v1/schemes'),

  // Marketplace
  getProducts: () => request('/v1/products'),

  // Orders
  placeOrder: (body) => request('/v1/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrders:  ()     => request('/v1/orders'),
};

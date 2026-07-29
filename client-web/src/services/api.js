const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('goagri_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/applications/dashboard-summary`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchApplications() {
  const res = await fetch(`${API_BASE}/applications`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchApplicationDetails(id) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function registerFarmer(data) {
  const res = await fetch(`${API_BASE}/farmers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function transitionWorkflow(appId, data) {
  const res = await fetch(`${API_BASE}/applications/${appId}/transition`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function addHistoricalYield(appId, data) {
  const res = await fetch(`${API_BASE}/applications/${appId}/historical-yield`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateHistoricalYield(appId, yieldId, data) {
  const res = await fetch(`${API_BASE}/applications/${appId}/historical-yield/${yieldId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteHistoricalYield(appId, yieldId) {
  const res = await fetch(`${API_BASE}/applications/${appId}/historical-yield/${yieldId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchBusinessRules() {
  const res = await fetch(`${API_BASE}/rules`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function updateBusinessRule(type, config) {
  const res = await fetch(`${API_BASE}/rules/${type}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ config_json: config })
  });
  return res.json();
}

export async function fetchRateTable() {
  const res = await fetch(`${API_BASE}/rates`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function updateCropRate(id, data) {
  const res = await fetch(`${API_BASE}/rates/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchBanks() {
  const res = await fetch(`${API_BASE}/banks`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

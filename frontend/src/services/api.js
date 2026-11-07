const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const TOKEN_KEY = 'a4-helpdesk-api-token';
const SESSION_KEY = 'a4-helpdesk-demo-session';

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearApiSession() {
  setAccessToken(null);
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('a4-helpdesk-session-expired'));
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
  if (!response.ok) {
    let message = `Yêu cầu API thất bại (${response.status}).`;
    try {
      const error = await response.json();
      const detail = error.detail;
      if (typeof detail === 'string') message = detail;
      else if (Array.isArray(detail)) message = detail.map(item => item.msg).join(', ');
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    if (response.status === 401 && token) clearApiSession();
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export { SESSION_KEY };

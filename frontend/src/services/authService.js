import { apiRequest, clearApiSession, SESSION_KEY, setAccessToken } from './api.js';

export function toSessionUser(user) {
  return {
    id: user.id,
    user_code: user.username,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role === 'tech' ? 'technician' : user.role,
    status: user.is_active ? 'active' : 'locked',
    available: user.is_available,
    skills: user.skills || [],
    mustChangePassword: false
  };
}

export async function login({ account, password }) {
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: { username: account, password }
  });
  const sessionUser = toSessionUser(result.user);
  setAccessToken(result.access_token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export function logout() { clearApiSession(); }

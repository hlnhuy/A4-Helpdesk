import { apiRequest } from './api.js';

export function login(credentials) {
  return apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
}

import { apiRequest } from './api.js';

export function getUsers() { return apiRequest('/users'); }
export function createUser(payload) { return apiRequest('/users', { method: 'POST', body: JSON.stringify(payload) }); }

import { apiRequest } from './api.js';

export function getTickets() { return apiRequest('/tickets'); }
export function createTicket(payload) { return apiRequest('/tickets', { method: 'POST', body: JSON.stringify(payload) }); }

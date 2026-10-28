import { apiRequest } from './api.js';

export function getDashboardReport() { return apiRequest('/reports/dashboard'); }

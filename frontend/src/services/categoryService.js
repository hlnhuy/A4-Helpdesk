import { apiRequest } from './api.js';

export function getCategories() { return apiRequest('/categories'); }

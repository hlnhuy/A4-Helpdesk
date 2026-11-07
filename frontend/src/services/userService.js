import { approveAccount, changePassword, declineAccount, deleteUser, getPasswordRequests, getPendingAccounts, getUsers, requestAccount, requestPasswordReset, resetUserPassword, resolvePasswordRequest, saveUser, setUserStatus, updateTechnicianAttendance, updateTechnicianSkills } from './demoDataService.js';
import { apiRequest } from './api.js';
import { toSessionUser } from './authService.js';

export { approveAccount, changePassword, declineAccount, deleteUser, getPasswordRequests, getPendingAccounts, getUsers, requestAccount, requestPasswordReset, resetUserPassword, resolvePasswordRequest, saveUser, setUserStatus, updateTechnicianAttendance, updateTechnicianSkills };

function toAccount(user) {
  return {
    ...toSessionUser(user),
    id: String(user.id),
    user_code: user.username,
    role: user.role === 'tech' ? 'technician' : user.role,
    skills: user.skills || []
  };
}

export async function listApiAccounts() {
  return (await apiRequest('/users')).map(toAccount);
}

export async function listApiAccountRequests() {
  return apiRequest('/account-requests');
}

export async function submitApiAccountRequest(form) {
  return apiRequest('/account-requests', {
    method: 'POST',
    body: { ...form, role: form.role === 'technician' ? 'tech' : form.role || 'user' }
  });
}

export async function approveApiAccountRequest(requestId) {
  return toAccount(await apiRequest(`/account-requests/${requestId}/approve`, { method: 'POST' }));
}

export async function declineApiAccountRequest(requestId) {
  return apiRequest(`/account-requests/${requestId}/reject`, { method: 'POST' });
}

export async function saveApiAccount(account) {
  const body = {
    username: account.user_code,
    email: account.email,
    full_name: account.full_name,
    role: account.role === 'technician' ? 'tech' : account.role,
    phone: account.phone || null,
    skills: account.skills || []
  };
  const saved = account.id
    ? await apiRequest(`/users/${account.id}`, { method: 'PUT', body })
    : await apiRequest('/users', { method: 'POST', body: { ...body, password: account.password } });
  return toAccount(saved);
}

export async function toggleApiAccountStatus(accountId) {
  return toAccount(await apiRequest(`/users/${accountId}/toggle-lock`, { method: 'POST' }));
}

export async function resetApiAccountPassword(accountId) {
  return apiRequest(`/users/${accountId}/reset-password`, { method: 'POST' });
}

export async function changeApiPassword(currentPassword, nextPassword) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: { old_password: currentPassword, new_password: nextPassword }
  });
}

export async function updateApiProfile(profile) {
  return toSessionUser(await apiRequest('/auth/profile', {
    method: 'PUT',
    body: { full_name: profile.full_name, phone: profile.phone }
  }));
}

export async function requestApiPasswordReset(email) {
  return apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
}

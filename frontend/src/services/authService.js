import { clearSession, findAccount, getDemoAccounts, setSession } from './demoDataService.js';

export async function login({ account, password }) {
  const user = findAccount(account);
  if (!user || user.password !== password) {
    throw new Error('Mã tài khoản/email hoặc mật khẩu không chính xác.');
  }
  if (user.status !== 'active') {
    throw new Error('Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên.');
  }
  const sessionUser = {
    id: user.id,
    user_code: user.user_code,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  };
  setSession(sessionUser);
  return sessionUser;
}

export function logout() { clearSession(); }
export { getDemoAccounts };

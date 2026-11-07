import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { login as authenticate, logout as endSession } from '../services/authService.js';
import { getAccessToken, SESSION_KEY } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      if (!getAccessToken()) return null;
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
      console.error('Không thể khôi phục phiên đăng nhập:', error);
      return null;
    }
  });

  useEffect(() => {
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('a4-helpdesk-session-expired', handleExpiredSession);
    return () => window.removeEventListener('a4-helpdesk-session-expired', handleExpiredSession);
  }, []);

  const login = useCallback(async (credentials) => {
    const account = await authenticate(credentials);
    setUser(account);
    return account;
  }, []);

  const logout = useCallback(() => {
    endSession();
    setUser(null);
  }, []);
  const updateUser = useCallback((nextUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser
  }), [user, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { createContext, useCallback, useMemo, useState } from 'react';
import { login as authenticate, logout as endSession } from '../services/authService.js';
import { setSession } from '../services/demoDataService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('a4-helpdesk-demo-session') || 'null');
    } catch (error) {
      console.error('Không thể khôi phục phiên đăng nhập:', error);
      return null;
    }
  });

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
    setSession(nextUser);
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

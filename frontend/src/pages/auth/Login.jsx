import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await login({ account, password });
      const requestedPath = new URLSearchParams(location.search).get('next');
      navigate(requestedPath?.startsWith(`/${session.role}/`) ? requestedPath : `/${session.role}/dashboard`, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return (
    <section className="auth-card">
      <h1>Đăng nhập</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="account">Mã tài khoản hoặc email</label>
        <input id="account" value={account} onChange={e => setAccount(e.target.value)} required autoComplete="username" />
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
      <p className="muted small">Dữ liệu demo được lưu trên trình duyệt này. <Link to="/welcome">Trang giới thiệu</Link></p>
    </section>
  );
}

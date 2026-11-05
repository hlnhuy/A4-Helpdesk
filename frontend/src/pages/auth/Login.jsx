import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import routeGroups from '../../routes/routeGroups.js';

function isValidDestination(role, requestedPath) {
  if (!requestedPath?.startsWith('/') || requestedPath.startsWith('//') || requestedPath.includes('\\')) return false;
  const pathname = requestedPath.split(/[?#]/, 1)[0];
  return (routeGroups[role] || []).some(route => {
    const routeSegments = route.split('/');
    const destinationSegments = pathname.split('/');
    return routeSegments.length === destinationSegments.length
      && routeSegments.every((segment, index) => segment.startsWith(':') || segment === destinationSegments[index]);
  });
}

function getPasswordChangePath(role) {
  return role === 'admin' ? '/admin/change-password' : `/${role}/profile`;
}

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = new URLSearchParams(location.search).get('next');
  const destination = isValidDestination(user?.role, requestedPath) ? requestedPath : `/${user?.role}/dashboard`;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await login({ account, password });
      navigate(session.mustChangePassword
        ? getPasswordChangePath(session.role)
        : isValidDestination(session.role, requestedPath) ? requestedPath : `/${session.role}/dashboard`, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) return <Navigate to={user.mustChangePassword ? getPasswordChangePath(user.role) : destination} replace />;

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
      <p className="muted small"><Link to="/forgot-password">Quên mật khẩu?</Link> · <Link to="/request-account">Yêu cầu cấp tài khoản</Link></p>
      <p className="muted small">Dữ liệu demo được lưu trên trình duyệt này. <Link to="/welcome">Trang giới thiệu</Link></p>
    </section>
  );
}

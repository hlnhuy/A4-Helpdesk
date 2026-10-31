import NotificationCenter from './NotificationCenter.jsx';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

export default function Header({ title, role, onMenuToggle, navigationOpen }) {
  const {logout,user}=useAuth();
  const navigate=useNavigate();
  function signOut(){logout();navigate('/login');}
  function search(event) {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      navigate(`/admin/tickets?q=${encodeURIComponent(event.currentTarget.value.trim())}`);
    }
  }
  return <header className="app-topbar">
    <div className="topbar-leading">
      <button className="menu-toggle" type="button" aria-label={navigationOpen ? 'Đóng điều hướng' : 'Mở điều hướng'} aria-expanded={navigationOpen} onClick={onMenuToggle}>{navigationOpen ? '×' : '☰'}</button>
      <span className="topbar-brand-mark" aria-hidden="true">⌁</span>
      <h1>{title}</h1>
      {role === 'admin' && <input className="global-search" aria-label="Tìm kiếm nhanh" placeholder="Tìm kiếm nhanh... (Enter)" onKeyDown={search}/>}
    </div>
    <div className="topbar-actions">
      <NotificationCenter role={role}/>
      <div className="topbar-user"><span className="topbar-avatar">{(user?.full_name || 'A').slice(0, 1)}</span><span><strong>{user?.full_name}</strong><small>{role === 'admin' ? 'Admin' : role === 'technician' ? 'Kỹ thuật viên' : 'Người dùng'}⌄</small></span></div>
      <button className="mobile-logout" type="button" onClick={signOut}>Đăng xuất</button>
    </div>
  </header>;
}

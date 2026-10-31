import NotificationCenter from './NotificationCenter.jsx';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

export default function Header({ title, role }) {
  const {logout}=useAuth();
  const navigate=useNavigate();
  function signOut(){logout();navigate('/login');}
  return <header className="app-topbar"><h1>{title}</h1><div className="topbar-actions"><NotificationCenter role={role}/><button className="mobile-logout" type="button" onClick={signOut}>Đăng xuất</button></div></header>;
}

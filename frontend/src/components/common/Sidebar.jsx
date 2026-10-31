import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Navbar from './Navbar.jsx';

const roleLabel={user:'Người dùng',technician:'Kỹ thuật viên',admin:'Admin — Quản trị viên'};

export default function Sidebar({ role, links, pathname }) {
  const {user,logout}=useAuth();
  const navigate=useNavigate();
  return <aside className="app-sidebar">
    <Link className="app-brand" to={`/${role}/dashboard`}><span className="app-brand-mark">A4</span><span>A4 Helpdesk</span></Link>
    <Navbar role={role} links={links} pathname={pathname}/>
    <div className="sidebar-account"><strong>{user?.full_name}</strong><span>{roleLabel[role]}</span>
      <button type="button" className="logout-button" onClick={()=>{logout();navigate('/login');}}>Đăng xuất</button>
    </div>
  </aside>;
}

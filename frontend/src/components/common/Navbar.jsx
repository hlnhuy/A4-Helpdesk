import { Link } from 'react-router-dom';
import useDemoData from '../../hooks/useDemoData.js';
import { getPasswordRequests, getPendingAccounts } from '../../services/userService.js';

export default function Navbar({ role, links, pathname, onNavigate }) {
  const [pending]=useDemoData(getPendingAccounts);
  const [passwordRequests]=useDemoData(getPasswordRequests);
  const accountRequests = pending.length + passwordRequests.length;
  function isActive(href) {
    const path = href.split('?')[0];
    if (path === `/${role}/dashboard`) return pathname === path;
    if (path.endsWith('/tickets')) return pathname === path || pathname.startsWith(`${path}/`);
    return pathname === path;
  }
  return <nav className="app-nav" aria-label="Điều hướng chính">
    {links.map(([icon,label,href])=><Link className={isActive(href)?'app-nav-link active':'app-nav-link'} key={label} to={href} onClick={onNavigate}>
      <span aria-hidden="true">{icon}</span>{label}{role==='admin'&&label==='Tài khoản'&&accountRequests>0&&<b className="nav-badge">{accountRequests}</b>}
    </Link>)}
  </nav>;
}

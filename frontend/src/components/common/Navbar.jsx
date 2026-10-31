import { Link } from 'react-router-dom';
import useDemoData from '../../hooks/useDemoData.js';
import { getPendingAccounts } from '../../services/userService.js';

export default function Navbar({ role, links, pathname }) {
  const [pending]=useDemoData(getPendingAccounts);
  function isActive(href) {
    const path = href.split('?')[0];
    if (path === `/${role}/dashboard`) return pathname === path;
    return pathname === path || (path.includes('/tickets') && pathname.startsWith(`${path}/`));
  }
  return <nav className="app-nav" aria-label="Điều hướng chính">
    {links.map(([icon,label,href])=><Link className={isActive(href)?'app-nav-link active':'app-nav-link'} key={label} to={href}>
      <span aria-hidden="true">{icon}</span>{label}{role==='admin'&&label==='Tài khoản'&&pending.length>0&&<b className="nav-badge">{pending.length}</b>}
    </Link>)}
  </nav>;
}

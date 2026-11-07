import { Link } from 'react-router-dom';

export default function Navbar({ role, links, pathname, onNavigate }) {
  function isActive(href) {
    const path = href.split('?')[0];
    if (path === `/${role}/dashboard`) return pathname === path;
    if (path.endsWith('/tickets')) return pathname === path || pathname.startsWith(`${path}/`);
    return pathname === path;
  }
  return <nav className="app-nav" aria-label="Điều hướng chính">
    {links.map(([icon,label,href])=><Link className={isActive(href)?'app-nav-link active':'app-nav-link'} key={label} to={href} onClick={onNavigate}>
      <span aria-hidden="true">{icon}</span>{label}
    </Link>)}
  </nav>;
}

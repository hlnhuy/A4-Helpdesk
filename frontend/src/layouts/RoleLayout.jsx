import AdminLayout from './AdminLayout.jsx';
import TechnicianLayout from './TechnicianLayout.jsx';
import UserLayout from './UserLayout.jsx';

export default function RoleLayout({ role, title, children }) {
  const Layout = role === 'admin' ? AdminLayout : role === 'technician' ? TechnicianLayout : UserLayout;
  return <Layout title={title}>{children}</Layout>;
}

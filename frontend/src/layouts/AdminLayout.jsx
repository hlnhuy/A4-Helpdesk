import AppShell from '../components/common/AppShell.jsx';

export default function AdminLayout({ title, children }) {
  return <AppShell role="admin" title={title}><div className="admin-layout">{children}</div></AppShell>;
}

import AppShell from '../components/common/AppShell.jsx';

export default function UserLayout({ title, children }) {
  return <AppShell role="user" title={title}><div className="user-layout">{children}</div></AppShell>;
}

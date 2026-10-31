import AppShell from '../components/common/AppShell.jsx';

export default function TechnicianLayout({ title, children }) {
  return <AppShell role="technician" title={title}><div className="technician-layout">{children}</div></AppShell>;
}

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const navigation = {
  user: [
    ['📊', 'Dashboard', '/user/dashboard'],
    ['➕', 'Tạo phiếu sự cố', '/user/tickets/create'],
    ['🎫', 'Phiếu của tôi', '/user/tickets'],
    ['⚙', 'Hồ sơ', '/user/profile']
  ],
  technician: [
    ['📊', 'Dashboard', '/technician/dashboard'],
    ['🎫', 'Phiếu được giao', '/technician/tickets'],
    ['◷', 'Lịch sử & thống kê', '/technician/tickets?status=Đã giải quyết'],
    ['⚙', 'Hồ sơ', '/technician/profile']
  ],
  admin: [
    ['📊', 'Dashboard', '/admin/dashboard'],
    ['🎫', 'Quản lý phiếu', '/admin/tickets'],
    ['🔀', 'Phân công', '/admin/assignments'],
    ['👥', 'Tài khoản', '/admin/users'],
    ['⚒', 'Chuyên môn', '/admin/categories'],
    ['📈', 'Báo cáo & thống kê', '/admin/reports'],
    ['⚙', 'Hồ sơ', '/admin/profile']
  ]
};

export default function AppShell({ role, title, children }) {
  const { pathname } = useLocation();
  const links = navigation[role];
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className={`app-shell app-shell-${role}${navigationOpen ? ' navigation-open' : ''}`}>
      {navigationOpen && <button className="navigation-backdrop" type="button" aria-label="Đóng điều hướng" onClick={() => setNavigationOpen(false)} />}
      <Sidebar role={role} links={links} pathname={pathname} onNavigate={() => setNavigationOpen(false)}/>
      <div className="app-main">
        <Header role={role} title={title} navigationOpen={navigationOpen} onMenuToggle={() => setNavigationOpen(value => !value)}/>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

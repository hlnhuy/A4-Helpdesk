import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [allTickets] = useDemoData(getTickets);
  const tickets = allTickets.filter(ticket => ticket.requesterId === user.id);
  const rows = ['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'].map(status => [status, tickets.filter(ticket => ticket.status === status).length]);
  return <RoleLayout role="user" title="Dashboard">
    <div className="metric-grid user-metrics">
      <MetricCard label="Tổng phiếu" value={tickets.length} />
      <MetricCard label="Mới tiếp nhận" value={rows[0][1]} />
      <MetricCard label="Đang xử lý" value={rows[1][1]} />
      <MetricCard label="Đã hoàn thành" value={rows[2][1] + rows[3][1]} />
    </div>
    <Panel className="user-welcome"><div><h2>Xin chào, {user.full_name}</h2><p>Theo dõi tiến độ hoặc gửi yêu cầu hỗ trợ mới.</p></div><Link className="button button-primary" to="/user/tickets/create">＋ Tạo phiếu sự cố</Link></Panel>
    <Panel className="table-card"><h2>Phiếu gần đây</h2><TicketTable tickets={tickets.slice(0, 5)} linkPrefix="/user/tickets" /></Panel>
  </RoleLayout>;
}

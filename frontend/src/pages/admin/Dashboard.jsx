import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';

export default function Dashboard() {
  const [tickets] = useDemoData(getTickets);
  const states = ['Mới tiếp nhận', 'Đang xử lý', 'Đã giải quyết', 'Đã đóng'];
  const values = states.map(status => tickets.filter(ticket => ticket.status === status).length);
  const recent = tickets.slice(0, 3);
  const overdue = tickets.filter(ticket => !['Đã giải quyết', 'Đã đóng'].includes(ticket.status) && new Date(ticket.slaAt) < new Date()).length;

  return <RoleLayout role="admin" title="Dashboard quản trị">
    <div className="metric-grid admin-metrics">
      <MetricCard label="Tổng số phiếu" value={tickets.length} icon="▤" tone="blue"/>
      <MetricCard label="Mới tiếp nhận" value={values[0]} icon="✉" tone="green"/>
      <MetricCard label="Đang xử lý" value={values[1]} icon="⚙" tone="orange"/>
      <MetricCard label="Đã giải quyết / đóng" value={values[2] + values[3]} icon="✓" tone="purple"/>
      <MetricCard label="Quá hạn SLA" value={overdue} note="phiếu đang mở" icon="!" tone="red"/>
    </div>
    <Panel className="table-card admin-recent-panel">
      <div className="panel-heading-row"><h2><span className="dashboard-panel-icon">▤</span>Phiếu mới nhất</h2><Link to="/admin/tickets">Xem tất cả →</Link></div>
      <TicketTable tickets={recent} linkPrefix="/admin/tickets" showTechnician/>
    </Panel>
  </RoleLayout>;
}

import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import DonutChart from '../../components/common/DonutChart.jsx';
import BarList from '../../components/common/BarList.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [allTickets] = useDemoData(getTickets);
  const tickets = allTickets.filter(ticket => ticket.technicianId === user.id);
  const pending = tickets.filter(ticket => ticket.status === 'Mới tiếp nhận').length;
  const processing = tickets.filter(ticket => ticket.status === 'Đang xử lý').length;
  const completed = tickets.filter(ticket => ['Đã giải quyết','Đã đóng'].includes(ticket.status)).length;
  const categoryRows = [...new Set(tickets.map(ticket => ticket.category))]
    .map(category => [category, tickets.filter(ticket => ticket.category === category).length]);

  return <RoleLayout role="technician" title="Bảng làm việc của tôi">
    <div className="metric-grid tech-metrics">
      <MetricCard label="Được giao" value={tickets.length} />
      <MetricCard label="Chờ tiếp nhận" value={pending} />
      <MetricCard label="Đang xử lý" value={processing} />
      <MetricCard label="Đã hoàn thành" value={completed} />
      <Panel className="availability"><span>Tình trạng</span><strong><i /> {user.available === false ? 'Bận' : 'Sẵn sàng'}</strong><Link to="/technician/profile">Đổi trong Hồ sơ</Link></Panel>
    </div>
    <Panel className="table-card"><h2>Việc cần làm</h2><TicketTable tickets={tickets.filter(ticket => !['Đã đóng'].includes(ticket.status)).slice(0, 10)} linkPrefix="/technician/tickets" /></Panel>
    <div className="two-column">
      <Panel><h2>Trạng thái phiếu của tôi</h2><div className="chart-legend"><DonutChart total={tickets.length} values={['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'].map(status => tickets.filter(ticket => ticket.status === status).length)} /><ul>
        {['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'].map((status,index) => <li key={status}><i className={['legend-blue','legend-orange','legend-green','legend-gray'][index]} />{status}: <b>{tickets.filter(ticket => ticket.status === status).length}</b></li>)}
      </ul></div></Panel>
      <Panel><h2>Loại sự cố đã xử lý</h2><BarList rows={categoryRows} /></Panel>
    </div>
  </RoleLayout>;
}

import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import DonutChart from '../../components/common/DonutChart.jsx';
import BarList from '../../components/common/BarList.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';

export default function Dashboard() {
  const [tickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const states = ['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'];
  const values = states.map(status => tickets.filter(ticket => ticket.status === status).length);
  const techs = users.filter(user => user.role === 'technician');
  const recent = tickets.slice(0, 6);
  const overdue = tickets.filter(ticket => !['Đã giải quyết','Đã đóng'].includes(ticket.status) && new Date(ticket.slaAt) < new Date()).length;

  return <RoleLayout role="admin" title="Dashboard quản trị">
    <div className="metric-grid admin-metrics">
      <MetricCard label="Tổng số phiếu" value={tickets.length} />
      <MetricCard label="Mới tiếp nhận" value={values[0]} />
      <MetricCard label="Đang xử lý" value={values[1]} />
      <MetricCard label="Đã giải quyết / đóng" value={values[2] + values[3]} />
      <MetricCard label="Quá hạn SLA" value={overdue} note="phiếu đang mở" />
    </div>
    <div className="dashboard-grid">
      <Panel><h2>Phiếu theo trạng thái</h2><div className="chart-legend"><DonutChart total={tickets.length} values={values} /><ul>{states.map((status,index) => <li key={status}><i className={['legend-blue','legend-orange','legend-green','legend-gray'][index]} />{status}: <b>{values[index]}</b></li>)}</ul></div></Panel>
      <Panel><h2>Phiếu tạo trong 7 ngày qua</h2><div className="simple-bars">{Array.from({length:7},(_,i) => {const day=new Date();day.setDate(day.getDate()-6+i);const count=tickets.filter(ticket => new Date(ticket.createdAt).toDateString()===day.toDateString()).length;return <div key={i}><strong>{count}</strong><i style={{height:`${Math.max(4,count*16)}px`}}/><small>{day.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}</small></div>;})}</div></Panel>
      <Panel><h2>Thời gian trung bình</h2><p className="summary-line"><span>Chờ phân công</span><b>2 phút</b></p><p className="summary-line"><span>Phản hồi</span><b>45 phút</b></p><p className="summary-line"><span>Xử lý</span><b>1 giờ 56 phút</b></p></Panel>
      <Panel><h2>Khối lượng của kỹ thuật viên</h2><BarList rows={techs.map(tech => [tech.full_name,tickets.filter(ticket=>ticket.technicianId===tech.id&&ticket.status==='Đang xử lý').length])} /></Panel>
    </div>
    <Panel className="table-card"><div className="panel-heading-row"><h2>Phiếu mới nhất</h2><Link to="/admin/tickets">Xem tất cả</Link></div><TicketTable tickets={recent} linkPrefix="/admin/tickets" showTechnician /></Panel>
    <Panel><h2>Lịch sử thao tác gần đây</h2><ul className="activity-list">{tickets.slice(0,6).map(ticket => <li key={ticket.id}>{ticket.history[0]?.actor} · {ticket.history[0]?.label} · {new Date(ticket.history[0]?.createdAt).toLocaleString('vi-VN')}</li>)}</ul></Panel>
  </RoleLayout>;
}

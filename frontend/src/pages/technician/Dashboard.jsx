import { useState } from 'react';
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
import { getUsers, updateTechnicianAttendance } from '../../services/userService.js';
import FaceCheckModal from '../../components/technician/FaceCheckModal.jsx';
import Notification from '../../components/common/Notification.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [allTickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const [faceAction, setFaceAction] = useState(null);
  const [error, setError] = useState('');
  const tickets = allTickets.filter(ticket => ticket.technicianId === user.id || ticket.assistantTechnicianId === user.id);
  const newAssignments = tickets.filter(ticket => ticket.status === 'Mới tiếp nhận');
  const technician = users.find(account => account.id === user.id);
  const checkedIn = technician?.checkedIn === true;
  const processing = tickets.filter(ticket => ticket.status === 'Đang xử lý').length;
  const completed = tickets.filter(ticket => ['Đã giải quyết','Đã đóng'].includes(ticket.status)).length;
  const categoryRows = [...new Set(tickets.map(ticket => ticket.category))]
    .map(category => [category, tickets.filter(ticket => ticket.category === category).length]);

  return <RoleLayout role="technician" title="Bảng làm việc của tôi">
    <Notification message={error} type="error" />
    <div className="metric-grid tech-metrics">
      <MetricCard label="Được giao" value={tickets.length} />
      <MetricCard label="Đang xử lý" value={processing} />
      <MetricCard label="Đã hoàn thành" value={completed} />
      <Panel className={`availability ${checkedIn ? 'checked-in' : 'checked-out'}`}>
        <span>Tình trạng</span>
        <strong><i /> {checkedIn ? 'Đã Check in' : 'Chưa Check in'}</strong>
        <button className={`button ${checkedIn ? 'button-secondary' : 'button-primary'}`} type="button" onClick={() => setFaceAction(checkedIn ? 'check-out' : 'check-in')}>
          {checkedIn ? 'Check out' : 'Check in'}
        </button>
      </Panel>
    </div>
    {newAssignments.length > 0 && <Panel className="table-card">
      <div className="panel-heading-row"><h2>Phiếu mới được phân công ({newAssignments.length})</h2><Link to="/technician/tickets">Mở danh sách →</Link></div>
      <TicketTable tickets={newAssignments} linkPrefix="/technician/tickets"/>
    </Panel>}
    <Panel className="table-card"><div className="panel-heading-row"><h2>Việc cần làm</h2><Link to="/technician/tickets">Xem tất cả →</Link></div><TicketTable tickets={tickets.filter(ticket => !['Đã đóng'].includes(ticket.status)).slice(0, 10)} linkPrefix="/technician/tickets" /></Panel>
    <div className="two-column">
      <Panel><h2>Trạng thái phiếu của tôi</h2><div className="chart-legend"><DonutChart total={tickets.length} values={['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'].map(status => tickets.filter(ticket => ticket.status === status).length)} /><ul>
        {['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'].map((status,index) => <li key={status}><i className={['legend-blue','legend-orange','legend-green','legend-gray'][index]} />{status}: <b>{tickets.filter(ticket => ticket.status === status).length}</b></li>)}
      </ul></div></Panel>
      <Panel><h2>Loại sự cố đã xử lý</h2><BarList rows={categoryRows} /></Panel>
    </div>
    {faceAction && <FaceCheckModal
      action={faceAction}
      onClose={() => setFaceAction(null)}
      onConfirm={() => {
        updateTechnicianAttendance(user.id, faceAction);
        setError('');
        setFaceAction(null);
      }}
    />}
  </RoleLayout>;
}

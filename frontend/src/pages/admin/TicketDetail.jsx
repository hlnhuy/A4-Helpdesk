import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getTicket, assignTicket, unassignTicket, updateTicket } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const [ticket] = useDemoData(() => getTicket(ticketId));
  const [users] = useDemoData(getUsers);
  const technicians = users.filter(user => user.role === 'technician' && user.status === 'active');
  if (!ticket) return <RoleLayout role="admin" title="Không tìm thấy phiếu"><Panel>Phiếu không tồn tại.</Panel></RoleLayout>;
  function assign(event) {
    if (event.target.value) assignTicket(ticket.id, event.target.value);
    else unassignTicket(ticket.id);
  }
  function close() {
    updateTicket(ticket.id, current => {
      const now = new Date().toISOString();
      return { ...current, status: 'Đã đóng', closedAt: now, history: [{id:`${ticket.id}-${Date.now()}`,type:'closed',label:'Admin đóng phiếu',actor:'Quản trị viên',createdAt:now}, ...current.history] };
    });
  }
  return <RoleLayout role="admin" title={`Phiếu ${ticket.id}`}>
    <Link className="back-link" to="/admin/tickets">← Danh sách phiếu</Link>
    <div className="detail-grid">
      <TicketDetails ticket={ticket} actions={<div className="admin-ticket-actions">
        <label className="field">Kỹ thuật viên phụ trách
          <select value={ticket.technicianId || ''} onChange={assign}><option value="">Chưa phân công</option>{technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}</select>
        </label>
        {ticket.status === 'Đã giải quyết' && <button className="button button-primary" onClick={close}>Đóng phiếu</button>}
      </div>} />
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}

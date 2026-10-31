import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getTicket, assignTicket, priorityLevels, unassignTicket, updateTicket, updateTicketPriority } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';
import useAuth from '../../hooks/useAuth.js';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const [ticket] = useDemoData(() => getTicket(ticketId));
  const [users] = useDemoData(getUsers);
  const { user } = useAuth();
  const [priority, setPriority] = useState(ticket?.priority || '');
  const [error, setError] = useState('');
  useEffect(() => setPriority(ticket?.priority || ''), [ticket?.id, ticket?.priority]);
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
  function approvePriority(event) {
    event.preventDefault();
    try {
      updateTicketPriority(ticket.id, priority, user.full_name);
      setError('');
    } catch (approvalError) {
      setError(approvalError.message);
    }
  }
  return <RoleLayout role="admin" title={`Phiếu ${ticket.id}`}>
    <Link className="back-link" to="/admin/tickets">← Danh sách phiếu</Link>
    <Notification message={error} type="error" />
    <div className="detail-grid">
      <TicketDetails ticket={ticket} actions={<div className="admin-ticket-actions">
        <form className="priority-approval-form" onSubmit={approvePriority}>
          <label className="field">Duyệt mức độ ưu tiên
            <select required value={priority} onChange={event => setPriority(event.target.value)}>
              <option value="" disabled>Chưa duyệt</option>
              {priorityLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
          <button className="button button-primary" type="submit">{ticket.priority ? 'Cập nhật ưu tiên' : 'Duyệt ưu tiên'}</button>
        </form>
        <label className="field">Kỹ thuật viên phụ trách
          <select value={ticket.technicianId || ''} onChange={assign}><option value="">Chưa phân công</option>{technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}</select>
        </label>
        {ticket.status === 'Đã giải quyết' && <button className="button button-primary" onClick={close}>Đóng phiếu</button>}
      </div>} />
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}

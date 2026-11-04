import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getTicket, getTickets, assignTicketTeam, priorityLevels, unassignTicket, updateTicket, updateTicketPriority } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';
import useAuth from '../../hooks/useAuth.js';
import { getSystemSettings } from '../../services/demoDataService.js';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const [ticket] = useDemoData(() => getTicket(ticketId));
  const [users] = useDemoData(getUsers);
  const [allTickets] = useDemoData(getTickets);
  const { user } = useAuth();
  const [priority, setPriority] = useState(ticket?.priority || '');
  const [technicianId, setTechnicianId] = useState(ticket?.technicianId || '');
  const [assistantTechnicianId, setAssistantTechnicianId] = useState(ticket?.assistantTechnicianId || '');
  const [error, setError] = useState('');
  useEffect(() => setPriority(ticket?.priority || ''), [ticket?.id, ticket?.priority]);
  useEffect(() => setTechnicianId(ticket?.technicianId || ''), [ticket?.id, ticket?.technicianId]);
  useEffect(() => setAssistantTechnicianId(ticket?.assistantTechnicianId || ''), [ticket?.id, ticket?.assistantTechnicianId]);
  const checkedInTechnicians = users.filter(user => user.role === 'technician' && user.status === 'active'
    && user.checkedIn === true);
  const technicians = checkedInTechnicians.filter(user => (user.skills || []).includes(ticket?.category));
  const currentTechnician = users.find(account => account.id === ticket?.technicianId && account.role === 'technician');
  const currentAssistant = users.find(account => account.id === ticket?.assistantTechnicianId && account.role === 'technician');
  const canSaveTechnician = technicians.some(technician => technician.id === technicianId);
  const canSaveAssistant = !assistantTechnicianId || checkedInTechnicians.some(technician => technician.id === assistantTechnicianId);
  const busyWorkCount = technicianId => allTickets.filter(item => (item.technicianId === technicianId || item.assistantTechnicianId === technicianId)
    && item.status === 'Đang xử lý').length;
  const workloadLabel = technician => {
    const count = busyWorkCount(technician.id);
    return count ? `Bận · ${count} việc đang xử lý` : 'Sẵn sàng';
  };
  if (!ticket) return <RoleLayout role="admin" title="Không tìm thấy phiếu"><Panel>Phiếu không tồn tại.</Panel></RoleLayout>;
  function saveAssignment(event) {
    event.preventDefault();
    try {
      if (technicianId) assignTicketTeam(ticket.id, technicianId, assistantTechnicianId || null, user.full_name);
      else if (ticket.technicianId) unassignTicket(ticket.id, user.full_name);
      setError('');
    } catch (assignmentError) {
      setError(assignmentError.message);
    }
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
      if (!ticket.priority && !ticket.technicianId && getSystemSettings().autoAssign) {
        const suggestedTechnician = technicians
          .map(technician => ({
            technician,
            activeTickets: allTickets.filter(item => (item.technicianId === technician.id || item.assistantTechnicianId === technician.id)
              && ['Mới tiếp nhận', 'Đang xử lý'].includes(item.status)).length
          }))
          .sort((left, right) => left.activeTickets - right.activeTickets
            || left.technician.id.localeCompare(right.technician.id))[0]?.technician;
        setTechnicianId(suggestedTechnician?.id || '');
      }
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
          <button className="button button-primary" type="submit">{ticket.priority ? 'Cập nhật' : 'Duyệt ưu tiên'}</button>
        </form>
        <form className="priority-approval-form" onSubmit={saveAssignment}>
          <label className="field">Kỹ thuật viên phụ trách
            <select value={technicianId} onChange={event => {
              const nextTechnicianId = event.target.value;
              setTechnicianId(nextTechnicianId);
              if (nextTechnicianId && nextTechnicianId === assistantTechnicianId) setAssistantTechnicianId('');
            }} disabled={!ticket.priority}>
              <option value="">Chưa phân công</option>
              {currentTechnician && !technicians.some(tech => tech.id === currentTechnician.id) && <option value={currentTechnician.id} disabled>{currentTechnician.full_name} (chưa Check in hoặc không đúng chuyên môn)</option>}
              {technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name} · {workloadLabel(tech)}</option>)}
            </select>
          </label>
          <label className="field">Kỹ thuật viên hỗ trợ (không bắt buộc)
            <select value={assistantTechnicianId} onChange={event => setAssistantTechnicianId(event.target.value)} disabled={!ticket.priority}>
              <option value="">Không cần hỗ trợ</option>
              {currentAssistant && !checkedInTechnicians.some(tech => tech.id === currentAssistant.id) && <option value={currentAssistant.id} disabled>{currentAssistant.full_name} (chưa Check in)</option>}
              {checkedInTechnicians.filter(tech => tech.id !== technicianId).map(tech => <option key={tech.id} value={tech.id}>{tech.full_name} · {workloadLabel(tech)}</option>)}
            </select>
          </label>
          <button className="button button-primary" type="submit" disabled={!ticket.priority || (technicianId ? !canSaveTechnician || !canSaveAssistant || technicianId === assistantTechnicianId : !ticket.technicianId)}>
            Lưu
          </button>
        </form>
        {!ticket.priority && <p className="muted small">Duyệt mức độ ưu tiên trước khi chọn và lưu kỹ thuật viên.</p>}
        {ticket.status === 'Đã giải quyết' && <button className="button button-primary" onClick={close}>Đóng phiếu</button>}
      </div>} />
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}

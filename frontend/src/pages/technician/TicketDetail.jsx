import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketUpdateForm from '../../components/technician/TicketUpdateForm.jsx';
import Notification from '../../components/common/Notification.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTicket, updateTicket } from '../../services/ticketService.js';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket] = useDemoData(() => getTicket(ticketId));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!ticket || ticket.technicianId !== user.id) return <RoleLayout role="technician" title="Không tìm thấy phiếu"><Panel>Phiếu không tồn tại hoặc chưa được giao cho bạn.</Panel></RoleLayout>;

  function startWork() {
    try {
      updateTicket(ticket.id, current => {
        const now = new Date().toISOString();
        return { ...current, status: 'Đang xử lý', startedAt: now, history: [{ id: `${ticket.id}-${Date.now()}`, type: 'started', label: 'Tiếp nhận và bắt đầu xử lý', actor: user.full_name, createdAt: now }, ...current.history] };
      });
      setError('');
    } catch (actionError) { setError(actionError.message); }
  }

  function resolveTicket(resolution) {
    setSaving(true);
    try {
      updateTicket(ticket.id, current => {
        const now = new Date().toISOString();
        const event = resolution.note ? [{ id: `${ticket.id}-${Date.now()}-note`, type: 'note', label: `Ghi chú: ${resolution.note}`, actor: user.full_name, createdAt: now }] : [];
        return { ...current, status: 'Đã giải quyết', resolution, resolvedAt: now, history: [
          { id: `${ticket.id}-${Date.now()}`, type: 'resolved', label: `Đã giải quyết: ${resolution.action}`, actor: user.full_name, createdAt: now },
          ...event, ...current.history
        ] };
      });
      setError('');
    } catch (actionError) { setError(actionError.message); }
    finally { setSaving(false); }
  }

  return <RoleLayout role="technician" title={`Phiếu ${ticket.id}`}>
    <Link className="back-link" to="/technician/tickets">← Danh sách phiếu</Link>
    <Notification message={error} type="error" />
    <div className="detail-grid">
      <TicketDetails ticket={ticket} actions={ticket.status === 'Mới tiếp nhận'
        ? <button className="button button-primary detail-action" onClick={startWork}>▶ Tiếp nhận &amp; bắt đầu xử lý</button>
        : ticket.status === 'Đang xử lý' ? <TicketUpdateForm ticket={ticket} onSave={resolveTicket} saving={saving} /> : null} />
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}

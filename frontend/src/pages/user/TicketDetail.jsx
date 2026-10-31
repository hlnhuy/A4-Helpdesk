import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketDetails from '../../components/common/TicketDetails.jsx';
import TicketTimeline from '../../components/common/TicketTimeline.jsx';
import TicketHistory from '../../components/common/TicketHistory.jsx';
import Notification from '../../components/common/Notification.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTicket, updateTicket } from '../../services/ticketService.js';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket] = useDemoData(() => getTicket(ticketId));
  const [error, setError] = useState('');

  const ownTicket = useMemo(() => ticket?.requesterId === user.id, [ticket, user.id]);
  if (!ticket || !ownTicket) return <RoleLayout role="user" title="Không tìm thấy phiếu"><Panel>Phiếu không tồn tại hoặc bạn không có quyền xem.</Panel></RoleLayout>;

  function closeTicket() {
    try {
      updateTicket(ticket.id, current => ({
        ...current, status: 'Đã đóng', closedAt: new Date().toISOString(),
        history: [{ id: `${ticket.id}-${Date.now()}`, type: 'closed', label: 'Người gửi xác nhận và đóng phiếu', actor: user.full_name, createdAt: new Date().toISOString() }, ...current.history]
      }));
      setError('');
    } catch (updateError) { setError(updateError.message); }
  }

  return <RoleLayout role="user" title={`Phiếu ${ticket.id}`}>
    <Link className="back-link" to="/user/tickets">← Danh sách phiếu</Link>
    <Notification message={error} type="error" />
    <div className="detail-grid">
      <TicketDetails ticket={ticket} actions={ticket.status === 'Đã giải quyết' && <button className="button button-primary detail-action" onClick={closeTicket}>Xác nhận và đóng phiếu</button>} />
      <div className="detail-aside"><TicketTimeline ticket={ticket} /><TicketHistory ticket={ticket} /></div>
    </div>
  </RoleLayout>;
}

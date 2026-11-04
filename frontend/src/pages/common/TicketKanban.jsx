import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Notification from '../../components/common/Notification.jsx';
import Panel from '../../components/common/Panel.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTicket, getTickets, updateTicket } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';

const columns = [
  { status: 'Mới tiếp nhận', color: 'blue' },
  { status: 'Đang xử lý', color: 'orange' },
  { status: 'Đã giải quyết', color: 'green' },
  { status: 'Đã đóng', color: 'gray' }
];

export default function TicketKanban({ role }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allTickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('');
  const [error, setError] = useState('');
  const checkedIn = users.find(account => account.id === user.id)?.checkedIn === true;
  const isAssignedToTechnician = ticket => ticket.technicianId === user.id || ticket.assistantTechnicianId === user.id;
  const tickets = useMemo(() => (role === 'technician'
    ? allTickets.filter(ticket => ticket.technicianId === user.id || ticket.assistantTechnicianId === user.id)
    : allTickets
  ).filter(ticket => !priority || ticket.priority === priority)
    .filter(ticket => `${ticket.id} ${ticket.title} ${ticket.location}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),
  [allTickets, role, user.id, priority, query]);

  function moveToProcessing(ticketId) {
    if (role !== 'technician' || !checkedIn) {
      setError('Chỉ kỹ thuật viên đã Check in mới được cập nhật trạng thái.');
      return;
    }
    try {
      const ticket = getTicket(ticketId);
      if (!ticket || !isAssignedToTechnician(ticket) || ticket.status !== 'Mới tiếp nhận') {
        throw new Error('Phiếu không còn ở trạng thái có thể tiếp nhận.');
      }
      updateTicket(ticketId, current => {
        const now = new Date().toISOString();
        return {
          ...current,
          status: 'Đang xử lý',
          startedAt: now,
          history: [{ id: `${ticketId}-started-${Date.now()}`, type: 'started', label: 'Tiếp nhận và bắt đầu xử lý', actor: user.full_name, createdAt: now }, ...current.history]
        };
      });
      setError('');
    } catch (moveError) {
      setError(moveError.message);
    }
  }

  function dropTicket(event, status) {
    event.preventDefault();
    const ticketId = event.dataTransfer.getData('text/plain');
    if (status === 'Đang xử lý') moveToProcessing(ticketId);
  }

  return <RoleLayout role={role} title="Bảng Kanban">
    <Notification message={error} type="error" />
    <Panel className="kanban-toolbar">
      <input aria-label="Tìm phiếu" placeholder="🔎 Tìm mã, tiêu đề, vị trí..." value={query} onChange={event => setQuery(event.target.value)} />
      <select aria-label="Lọc mức ưu tiên" value={priority} onChange={event => setPriority(event.target.value)}>
        <option value="">Mọi mức ưu tiên</option>
        {['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'].map(level => <option key={level}>{level}</option>)}
      </select>
      <span>{role === 'technician' ? 'Kéo thẻ sang Đang xử lý hoặc dùng nút Tiếp nhận. Kết quả xử lý được nhập tại chi tiết phiếu.' : 'Chế độ xem tổng quan — trạng thái chỉ do KTV được giao cập nhật.'}</span>
    </Panel>
    <div className="kanban-board">
      {columns.map(column => {
        const cards = tickets.filter(ticket => ticket.status === column.status);
        return <section
          className={`kanban-column kanban-${column.color}`}
          key={column.status}
          onDragOver={event => { if (role === 'technician' && column.status === 'Đang xử lý') event.preventDefault(); }}
          onDrop={event => dropTicket(event, column.status)}
        >
          <header><span><i />{column.status}</span><b>{cards.length}</b></header>
          <div className="kanban-cards">
            {cards.map(ticket => {
              const overdue = ticket.slaAt && !['Đã giải quyết', 'Đã đóng'].includes(ticket.status) && new Date(ticket.slaAt) < new Date();
              return <article
                className={`kanban-card${overdue ? ' kanban-overdue' : ''}`}
                key={ticket.id}
                draggable={role === 'technician' && checkedIn && ticket.status === 'Mới tiếp nhận'}
                onDragStart={event => event.dataTransfer.setData('text/plain', ticket.id)}
              >
                <div className="kanban-card-heading"><button type="button" onClick={() => navigate(`/${role}/tickets/${ticket.id}`)}>{ticket.id}</button><StatusBadge value={ticket.priority || 'Chưa duyệt'} /></div>
                <button className="kanban-card-title" type="button" onClick={() => navigate(`/${role}/tickets/${ticket.id}`)}>{ticket.title}</button>
                <p>📍 {ticket.location} · {ticket.category}</p>
                <small>{role === 'admin' ? `👤 ${ticket.technician || 'Chưa phân công'}${ticket.assistantTechnician ? ` · Hỗ trợ: ${ticket.assistantTechnician}` : ''}` : `Gửi bởi ${ticket.requester}`}</small>
                {overdue && <b className="kanban-overdue-label">⚠ Quá hạn</b>}
                {role === 'technician' && ticket.status === 'Mới tiếp nhận' && <button className="button button-primary kanban-card-action" type="button" disabled={!checkedIn} onClick={() => moveToProcessing(ticket.id)}>▶ Tiếp nhận</button>}
                {role === 'technician' && ticket.status === 'Đang xử lý' && <button className="button button-primary kanban-card-action" type="button" onClick={() => navigate(`/technician/tickets/${ticket.id}`)}>✓ Cập nhật xử lý</button>}
              </article>;
            })}
            {!cards.length && <p className="kanban-empty">Trống</p>}
          </div>
        </section>;
      })}
    </div>
  </RoleLayout>;
}

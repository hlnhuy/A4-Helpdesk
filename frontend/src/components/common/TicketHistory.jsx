import Panel from './Panel.jsx';

export default function TicketHistory({ ticket }) {
  return <Panel><h3>Lịch sử xử lý</h3><ol className="history-list">
    {(ticket.history || []).map(event => <li key={event.id}><strong>{event.label}</strong><small>{event.actor} · {new Date(event.createdAt).toLocaleString('vi-VN')}</small></li>)}
  </ol></Panel>;
}

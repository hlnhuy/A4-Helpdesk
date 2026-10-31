import { Link } from 'react-router-dom';
import TicketStatus from './TicketStatus.jsx';

export default function TicketCard({ ticket }) {
  return <article className="panel ticket-card">
    <div><small>{ticket.id} · {ticket.category}</small><h2>{ticket.title}</h2><p>{ticket.location} · {new Date(ticket.createdAt).toLocaleString('vi-VN')}</p></div>
    <TicketStatus status={ticket.status} />
    <Link className="button button-secondary" to={`/user/tickets/${ticket.id}`}>Chi tiết</Link>
  </article>;
}

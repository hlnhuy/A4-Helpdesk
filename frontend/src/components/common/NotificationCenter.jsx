import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../../services/ticketService.js';
import useDemoData from '../../hooks/useDemoData.js';

export default function NotificationCenter({ role }) {
  const [open, setOpen] = useState(false);
  const [tickets] = useDemoData(getTickets);
  const recent = tickets.filter(ticket => role === 'admin'
    || (role === 'user' && ticket.requesterId === JSON.parse(localStorage.getItem('a4-helpdesk-demo-session') || 'null')?.id)
    || (role === 'technician' && ticket.technicianId === JSON.parse(localStorage.getItem('a4-helpdesk-demo-session') || 'null')?.id)).slice(0, 3);
  return <div className="notification-wrap">
    <button className="notification-button" type="button" aria-label="Thông báo" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true">🔔</span>{recent.length > 0 && <i />}
    </button>
    {open && <div className="notification-menu">
      <strong>Thông báo gần đây</strong>
      {recent.map(ticket => <Link key={ticket.id} to={`/${role}/tickets/${ticket.id}`} onClick={() => setOpen(false)}>
        <span>{ticket.id} · {ticket.title}</span><small>{ticket.status}</small>
      </Link>)}
      {!recent.length && <p>Chưa có thông báo.</p>}
    </div>}
  </div>;
}

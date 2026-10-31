import { useMemo, useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import TicketCard from '../../components/user/TicketCard.jsx';
import TicketFilters from '../../components/common/TicketFilters.jsx';
import Panel from '../../components/common/Panel.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';
import { getCategories } from '../../services/categoryService.js';

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets] = useDemoData(getTickets);
  const [categories] = useDemoData(getCategories);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const visible = useMemo(() => tickets.filter(ticket => ticket.requesterId === user.id)
    .filter(ticket => !status || ticket.status === status)
    .filter(ticket => !category || ticket.category === category)
    .filter(ticket => `${ticket.id} ${ticket.title} ${ticket.location}`.toLowerCase().includes(query.toLowerCase())), [tickets, user.id, status, category, query]);

  return <RoleLayout role="user" title="Phiếu sự cố của tôi">
    <Panel><TicketFilters query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} category={category} onCategoryChange={setCategory} categories={categories} /></Panel>
    <div className="ticket-card-list">{visible.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}</div>
    {visible.length === 0 && <Panel><p>Không tìm thấy phiếu phù hợp.</p></Panel>}
  </RoleLayout>;
}

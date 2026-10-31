import { useMemo, useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import TicketFilters from '../../components/common/TicketFilters.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';
import { getCategories } from '../../services/categoryService.js';

export default function AssignedTickets() {
  const { user } = useAuth();
  const [tickets] = useDemoData(getTickets);
  const [categories] = useDemoData(getCategories);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(new URLSearchParams(location.search).get('status') || '');
  const [category, setCategory] = useState('');
  const filtered = useMemo(() => tickets.filter(ticket => ticket.technicianId === user.id)
    .filter(ticket => !status || ticket.status === status)
    .filter(ticket => !category || ticket.category === category)
    .filter(ticket => `${ticket.id} ${ticket.title} ${ticket.location}`.toLowerCase().includes(query.toLowerCase())), [tickets,user.id,status,category,query]);
  return <RoleLayout role="technician" title={status === 'Đã giải quyết' ? 'Lịch sử xử lý' : 'Phiếu được giao'}>
    <Panel><TicketFilters query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} category={category} onCategoryChange={setCategory} categories={categories} /></Panel>
    <Panel className="table-card"><TicketTable tickets={filtered} linkPrefix="/technician/tickets" /></Panel>
    {!filtered.length && <Panel><p>Không có phiếu phù hợp.</p></Panel>}
  </RoleLayout>;
}

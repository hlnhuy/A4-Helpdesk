import { useMemo, useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketFilters from '../../components/common/TicketFilters.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';
import { getCategories } from '../../services/categoryService.js';

export default function Tickets() {
  const [tickets] = useDemoData(getTickets);
  const [categories] = useDemoData(getCategories);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const visible = useMemo(() => tickets.filter(ticket => !status || ticket.status === status)
    .filter(ticket => !category || ticket.category === category)
    .filter(ticket => `${ticket.id} ${ticket.title} ${ticket.location} ${ticket.requester}`.toLowerCase().includes(query.toLowerCase())), [tickets,status,category,query]);
  return <RoleLayout role="admin" title="Quản lý phiếu sự cố">
    <Panel><TicketFilters query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} category={category} onCategoryChange={setCategory} categories={categories} /></Panel>
    <Panel className="table-card"><TicketTable tickets={visible} linkPrefix="/admin/tickets" showTechnician /></Panel>
    {!visible.length && <Panel><p>Không có phiếu phù hợp bộ lọc.</p></Panel>}
  </RoleLayout>;
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState('');
  const section = searchParams.get('section');
  useEffect(() => {
    setStatus(searchParams.get('status') || '');
  }, [searchParams]);
  const filtered = useMemo(() => tickets.filter(ticket => ticket.technicianId === user.id || ticket.assistantTechnicianId === user.id)
    .filter(ticket => {
      if (!status) return true;
      if (status === 'Đã hoàn thành') return ['Đã giải quyết', 'Đã đóng'].includes(ticket.status);
      return ticket.status === status;
    })
    .filter(ticket => !category || ticket.category === category)
    .filter(ticket => `${ticket.id} ${ticket.title} ${ticket.location}`.toLowerCase().includes(query.toLowerCase())), [tickets,user.id,status,category,query]);
  const title = status || (section === 'assigned' ? 'Được giao' : 'Phiếu được giao');
  return <RoleLayout role="technician" title={title}>
    <h2 className="ticket-list-title">{title}</h2>
    <Panel><TicketFilters query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} category={category} onCategoryChange={setCategory} categories={categories} /></Panel>
    <Panel className="table-card"><TicketTable tickets={filtered} linkPrefix="/technician/tickets" /></Panel>
    {!filtered.length && <Panel><p>Không có phiếu phù hợp.</p></Panel>}
  </RoleLayout>;
}

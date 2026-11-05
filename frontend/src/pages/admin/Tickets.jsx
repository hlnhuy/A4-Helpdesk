import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import AdminTicketTable from '../../components/admin/AdminTicketTable.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { exportCsv, getTickets } from '../../services/demoDataService.js';
import { getCategories } from '../../services/categoryService.js';

const pageSize = 12;

export default function Tickets() {
  const [tickets, refresh] = useDemoData(getTickets);
  const [categories] = useDemoData(getCategories);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const section = searchParams.get('section');
  const sectionTitle = status || (section === 'total' ? 'Tổng số phiếu' : 'Quản lý phiếu sự cố');
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
    setStatus(searchParams.get('status') || '');
    setPage(1);
  }, [searchParams]);
  const filtered = useMemo(() => tickets.filter(ticket => {
    if (!status) return true;
    if (status === 'Đã giải quyết / đóng') return ['Đã giải quyết', 'Đã đóng'].includes(ticket.status);
    if (status === 'Quá hạn SLA') return ticket.slaAt
      && !['Đã giải quyết', 'Đã đóng'].includes(ticket.status)
      && new Date(ticket.slaAt) < new Date();
    return ticket.status === status;
  })
    .filter(ticket => !category || ticket.category === category)
    .filter(ticket => !from || ticket.createdAt.slice(0, 10) >= from)
    .filter(ticket => !to || ticket.createdAt.slice(0, 10) <= to)
    .filter(ticket => `${ticket.id} ${ticket.title} ${ticket.location} ${ticket.requester} ${ticket.technician || ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())),
  [tickets, status, category, from, to, query]);

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setStatus('');
    setCategory('');
    setFrom('');
    setTo('');
    setPage(1);
    setSearchParams({});
  }

  function downloadCsv() {
    const blob = new Blob([exportCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'a4-helpdesk-tickets.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <RoleLayout role="admin" title={sectionTitle}>
    <section className="tickets-page-hero">
      <div className="tickets-page-title"><span className="tickets-hero-icon" aria-hidden="true">⌁</span><div><h2>{sectionTitle}</h2><p>{sectionTitle === 'Quản lý phiếu sự cố' ? 'Theo dõi và quản lý tất cả phiếu sự cố mạng trong hệ thống' : `Danh sách phiếu thuộc mục "${sectionTitle}"`}</p></div></div>
      <div className="tickets-total"><span>▥</span><strong>Tổng: {tickets.length} phiếu</strong><button type="button" aria-label="Làm mới danh sách" onClick={refresh}>↻</button></div>
    </section>
    <Panel className="admin-ticket-filter-panel">
      <form className="admin-ticket-filters" onSubmit={applyFilters}>
        <label className="ticket-search-field"><span aria-hidden="true">⌕</span><input aria-label="Tìm phiếu" placeholder="Tìm theo mã phiếu, tiêu đề..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></label>
        <select aria-label="Lọc trạng thái" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Mọi trạng thái</option>{['Mới tiếp nhận', 'Đang xử lý', 'Đã giải quyết', 'Đã đóng', 'Đã giải quyết / đóng', 'Quá hạn SLA'].map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Lọc loại sự cố" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">Mọi loại sự cố</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
        <label className="date-range-field"><span aria-hidden="true">▦</span><input aria-label="Từ ngày" type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }}/><span>—</span><input aria-label="Đến ngày" type="date" value={to} onChange={event => { setTo(event.target.value); setPage(1); }}/></label>
        <button className="button button-primary ticket-search-button" type="submit">⌕ <span>Tìm kiếm</span></button>
        <button className="button button-secondary ticket-export-button" type="button" onClick={downloadCsv}>⇩ <span>Xuất báo cáo</span></button>
        {(query || status || category || from || to) && <button type="button" className="text-button clear-ticket-filters" onClick={clearFilters}>Xóa lọc</button>}
      </form>
    </Panel>
    <Panel className="table-card admin-ticket-table-panel">
      <AdminTicketTable tickets={filtered} page={page} pageSize={pageSize} onPageChange={setPage}/>
    </Panel>
  </RoleLayout>;
}

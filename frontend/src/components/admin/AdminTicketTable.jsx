import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge.jsx';

function formatCreatedAt(value) {
  const date = new Date(value);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function AdminTicketTable({ tickets, page, pageSize, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(tickets.length / pageSize));
  const visible = tickets.slice((page - 1) * pageSize, page * pageSize);
  const pageButtons = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(number => number === 1 || number === pageCount || Math.abs(number - page) <= 1);
  return <>
    <div className="admin-ticket-table-wrap">
      <table className="data-table admin-ticket-table">
        <thead><tr><th>#</th><th>Mã phiếu</th><th>Tiêu đề</th><th>Loại</th><th>Ưu tiên</th><th>Trạng thái</th><th>KTV</th><th>Người gửi</th><th>Tạo lúc</th><th>Thao tác</th></tr></thead>
        <tbody>{visible.map((ticket, index) => <tr key={ticket.id}>
          <td>{(page - 1) * pageSize + index + 1}</td>
          <td><Link to={`/admin/tickets/${ticket.id}`}><strong>{ticket.id}</strong></Link></td>
          <td><strong className="ticket-row-title">{ticket.title}</strong><small className="table-secondary">{ticket.location}</small></td>
          <td><span className="table-category"><span aria-hidden="true">{ticket.category === 'Wi-Fi' ? '◉' : ticket.category === 'Internet' ? '⌁' : '▦'}</span>{ticket.category}</span></td>
          <td><StatusBadge value={ticket.priority || 'Chờ duyệt'}/></td>
          <td><StatusBadge value={ticket.status}/></td>
          <td><span className="table-person">♙ {ticket.technician || 'Chưa phân công'}</span></td>
          <td><span className="table-person">♧ {ticket.requester}</span></td>
          <td className="ticket-created-at">{formatCreatedAt(ticket.createdAt)}</td>
          <td className="ticket-action-cell"><Link className="ticket-view-button" aria-label={`Xem phiếu ${ticket.id}`} to={`/admin/tickets/${ticket.id}`}>◉</Link><details className="ticket-action-menu"><summary aria-label={`Thao tác ${ticket.id}`}>⋮</summary><Link to={`/admin/tickets/${ticket.id}`}>Xem chi tiết</Link><Link to={`/admin/assignments?ticket=${encodeURIComponent(ticket.id)}`}>Phân công</Link></details></td>
        </tr>)}
          {!visible.length && <tr><td colSpan="10" className="empty-message">Không có phiếu phù hợp bộ lọc.</td></tr>}
        </tbody>
      </table>
    </div>
    <footer className="admin-table-footer">
      <span>Hiển thị {tickets.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, tickets.length)} trong tổng số {tickets.length} phiếu</span>
      <div className="admin-pagination" aria-label="Phân trang danh sách phiếu">
        <button type="button" aria-label="Trang đầu" disabled={page <= 1} onClick={() => onPageChange(1)}>«</button>
        <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
        {pageButtons.map((number, index) => <span className="pagination-page-group" key={number}>
          {index > 0 && number - pageButtons[index - 1] > 1 && <span className="pagination-ellipsis">…</span>}
          <button type="button" aria-current={page === number ? 'page' : undefined} className={page === number ? 'active' : ''} onClick={() => onPageChange(number)}>{number}</button>
        </span>)}
        <button type="button" aria-label="Trang sau" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>›</button>
        <button type="button" aria-label="Trang cuối" disabled={page >= pageCount} onClick={() => onPageChange(pageCount)}>»</button>
        <span className="page-size-label">{pageSize} / trang</span>
      </div>
    </footer>
  </>;
}

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

export default function TicketTable({ tickets, linkPrefix, showTechnician = false }) {
  return <div className="table-scroll"><table className="data-table">
    <thead><tr><th>Mã</th><th>Tiêu đề</th><th>Loại</th><th>Ưu tiên</th><th>Trạng thái</th>{showTechnician && <th>KTV</th>}<th>Người gửi</th><th>Tạo lúc</th></tr></thead>
    <tbody>{tickets.map(ticket => <tr key={ticket.id}>
      <td><Link to={`${linkPrefix}/${ticket.id}`}><strong>{ticket.id}</strong></Link></td>
      <td>{ticket.title}<small className="table-secondary">{ticket.location}</small></td>
      <td>{ticket.category}</td><td><StatusBadge value={ticket.priority || 'Chờ duyệt'} /></td><td><StatusBadge value={ticket.status} /></td>
      {showTechnician && <td>{ticket.technician || 'Chưa phân công'}</td>}
      <td>{ticket.requester}</td><td>{new Date(ticket.createdAt).toLocaleString('vi-VN')}</td>
    </tr>)}</tbody>
  </table></div>;
}

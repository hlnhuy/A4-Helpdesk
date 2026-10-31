import { useMemo } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { assignTicket, getTickets } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';

export default function Assignments() {
  const [tickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const technicians = users.filter(user => user.role === 'technician' && user.status === 'active');
  const waiting = useMemo(() => tickets.filter(ticket => !ticket.technicianId || ticket.status === 'Mới tiếp nhận'), [tickets]);
  function assign(ticketId, event) {
    if (event.target.value) assignTicket(ticketId,event.target.value);
  }
  return <RoleLayout role="admin" title="Theo dõi & phân công">
    <Panel className="table-card"><h2>Phiếu chờ phân công ({waiting.filter(ticket=>!ticket.technicianId).length})</h2>
      {waiting.filter(ticket=>!ticket.technicianId).length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Mã</th><th>Tiêu đề</th><th>Loại</th><th>Ưu tiên</th><th>Người gửi</th><th>Giao cho KTV</th></tr></thead><tbody>
        {waiting.filter(ticket=>!ticket.technicianId).map(ticket=>{const qualified=technicians.filter(tech=>(tech.skills||[]).includes(ticket.category));const choices=qualified.length?qualified:technicians;return <tr key={ticket.id}><td>{ticket.id}</td><td>{ticket.title}</td><td>{ticket.category}</td><td><StatusBadge value={ticket.priority}/></td><td>{ticket.requester}</td><td><select defaultValue="" onChange={event=>assign(ticket.id,event)}><option value="" disabled>Chọn kỹ thuật viên</option>{choices.map(tech=><option key={tech.id} value={tech.id}>{tech.full_name}</option>)}</select></td></tr>;})}
      </tbody></table></div> : <p className="empty-message">Tất cả phiếu đã có người phụ trách ✅</p>}
    </Panel>
    <Panel><h2>Quy tắc tự động phân công</h2><ol className="rules-list"><li>Lọc kỹ thuật viên đang hoạt động và có chuyên môn phù hợp.</li><li>So sánh số phiếu đang xử lý của từng kỹ thuật viên.</li><li>Ưu tiên giao cho người đang có ít phiếu nhất.</li><li>Admin có thể đổi người phụ trách tại trang chi tiết phiếu.</li></ol></Panel>
    <Panel className="table-card"><h2>Tải công việc của kỹ thuật viên</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>Kỹ thuật viên</th><th>Chuyên môn</th><th>Tình trạng</th><th>Đang xử lý</th><th>Đã giải quyết</th></tr></thead><tbody>
      {technicians.map(tech=><tr key={tech.id}><td><strong>{tech.full_name}</strong></td><td>{tech.skills.join(', ')}</td><td><StatusBadge value={tech.available===false?'Bận':'Sẵn sàng'}/></td><td>{tickets.filter(ticket=>ticket.technicianId===tech.id&&ticket.status==='Đang xử lý').length}</td><td>{tickets.filter(ticket=>ticket.technicianId===tech.id&&['Đã giải quyết','Đã đóng'].includes(ticket.status)).length}</td></tr>)}
    </tbody></table></div></Panel>
  </RoleLayout>;
}

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Notification from '../../components/common/Notification.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { assignTicketTeam, getTickets } from '../../services/ticketService.js';
import { getUsers } from '../../services/userService.js';

export default function Assignments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const [error, setError] = useState('');
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const technicians = users.filter(user => user.role === 'technician' && user.status === 'active');
  const assignableTechnicians = technicians.filter(user => user.checkedIn === true);
  const selectedTicket = tickets.find(ticket => ticket.id === searchParams.get('ticket'));
  const waiting = useMemo(() => tickets.filter(ticket => !ticket.technicianId || ticket.status === 'Mới tiếp nhận'), [tickets]);
  function activeWorkCount(technicianId) {
    return tickets.filter(ticket => (ticket.technicianId === technicianId || ticket.assistantTechnicianId === technicianId)
      && ['Mới tiếp nhận', 'Đang xử lý'].includes(ticket.status)).length;
  }
  function busyWorkCount(technicianId) {
    return tickets.filter(ticket => (ticket.technicianId === technicianId || ticket.assistantTechnicianId === technicianId)
      && ticket.status === 'Đang xử lý').length;
  }
  function updateDraft(ticketId, field, value) {
    setAssignmentDrafts(current => {
      const draft = { ...(current[ticketId] || {}), [field]: value };
      if (field === 'technicianId' && value === draft.assistantTechnicianId) draft.assistantTechnicianId = '';
      return { ...current, [ticketId]: draft };
    });
  }
  function assign(ticketId, leadId, assistantId) {
    if (!leadId) return;
    try {
      assignTicketTeam(ticketId, leadId, assistantId || null);
      setAssignmentDrafts(current => ({ ...current, [ticketId]: undefined }));
      setError('');
    } catch (assignmentError) {
      setError(assignmentError.message);
    }
  }
  return <RoleLayout role="admin" title="Theo dõi & phân công">
    <Notification message={error} type="error" />
    {selectedTicket && <Panel className="table-card selected-assignment-panel">
      <div className="panel-heading-row"><h2>Phân công phiếu {selectedTicket.id}</h2><button className="text-button" type="button" onClick={() => setSearchParams({})}>Đóng</button></div>
      <p>{selectedTicket.title} · {selectedTicket.category} · {selectedTicket.location}</p>
      {['technicianId', 'assistantTechnicianId'].map((field, index) => {
        const draft = assignmentDrafts[selectedTicket.id] || {};
        const options = index === 0 ? assignableTechnicians.filter(tech => (tech.skills || []).includes(selectedTicket.category))
          : assignableTechnicians.filter(tech => tech.id !== (draft.technicianId ?? selectedTicket.technicianId));
        const value = draft[field] ?? selectedTicket[field] ?? '';
        return <label className="field" key={field}>{index === 0 ? 'Kỹ thuật viên phụ trách' : 'Kỹ thuật viên hỗ trợ (không bắt buộc)'}
          <select aria-label={index === 0 ? 'Kỹ thuật viên phụ trách' : 'Kỹ thuật viên hỗ trợ'} disabled={!selectedTicket.priority} value={value}
            onChange={event => updateDraft(selectedTicket.id, field, event.target.value)}>
            <option value="">{index === 0 ? 'Chọn KTV đúng chuyên môn' : 'Không cần hỗ trợ'}</option>
            {options.map(tech => <option key={tech.id} value={tech.id}>{tech.full_name} · {busyWorkCount(tech.id) ? `Bận · ${busyWorkCount(tech.id)} việc` : 'Sẵn sàng'}</option>)}
          </select>
        </label>;
      })}
      <button className="button button-primary" type="button" disabled={!selectedTicket.priority || !(assignmentDrafts[selectedTicket.id]?.technicianId ?? selectedTicket.technicianId)}
        onClick={() => assign(selectedTicket.id, assignmentDrafts[selectedTicket.id]?.technicianId ?? selectedTicket.technicianId, assignmentDrafts[selectedTicket.id]?.assistantTechnicianId ?? selectedTicket.assistantTechnicianId)}>Lưu</button>
      {!selectedTicket.priority && <p className="muted small">Duyệt mức độ ưu tiên tại chi tiết phiếu trước khi phân công.</p>}
    </Panel>}
    <Panel className="table-card"><h2>Phiếu chờ phân công ({waiting.filter(ticket=>!ticket.technicianId).length})</h2>
      {waiting.filter(ticket=>!ticket.technicianId).length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Mã</th><th>Tiêu đề</th><th>Loại</th><th>Ưu tiên</th><th>Người gửi</th><th>Giao cho KTV</th></tr></thead><tbody>
      {waiting.filter(ticket=>!ticket.technicianId).map(ticket=>{const qualified=assignableTechnicians.filter(tech=>(tech.skills||[]).includes(ticket.category));const draft=assignmentDrafts[ticket.id]||{};return <tr key={ticket.id}><td>{ticket.id}</td><td>{ticket.title}</td><td>{ticket.category}</td><td><StatusBadge value={ticket.priority || 'Chưa duyệt'}/></td><td>{ticket.requester}</td><td>{qualified.length ? <div className="assignment-team-fields">
        <label className="field">KTV đúng chuyên môn<select value={draft.technicianId||''} disabled={!ticket.priority} onChange={event=>updateDraft(ticket.id,'technicianId',event.target.value)}><option value="">Chọn KTV phụ trách</option>{qualified.map(tech=><option key={tech.id} value={tech.id}>{tech.full_name} · {busyWorkCount(tech.id)?`Bận · ${busyWorkCount(tech.id)} việc`:'Sẵn sàng'}</option>)}</select></label>
        <label className="field">KTV hỗ trợ<select value={draft.assistantTechnicianId||''} disabled={!ticket.priority} onChange={event=>updateDraft(ticket.id,'assistantTechnicianId',event.target.value)}><option value="">Không cần hỗ trợ</option>{assignableTechnicians.filter(tech=>tech.id!==draft.technicianId).map(tech=><option key={tech.id} value={tech.id}>{tech.full_name} · {busyWorkCount(tech.id)?`Bận · ${busyWorkCount(tech.id)} việc`:'Sẵn sàng'}</option>)}</select></label>
        <button className="button button-primary" type="button" disabled={!ticket.priority||!draft.technicianId} onClick={()=>assign(ticket.id,draft.technicianId,draft.assistantTechnicianId)}>Lưu</button></div> : <span>{ticket.priority ? 'Chưa có KTV phù hợp đã Check in' : 'Chờ duyệt mức độ ưu tiên'}</span>}</td></tr>;})}
      </tbody></table></div> : <p className="empty-message">Tất cả phiếu đã có người phụ trách ✅</p>}
    </Panel>
    <Panel><h2>Quy tắc phân công</h2><ol className="rules-list"><li>Phiếu mới cần Admin duyệt mức độ ưu tiên trước khi phân công.</li><li>KTV phụ trách phải Check in và đúng chuyên môn; KTV hỗ trợ chỉ cần Check in, không giới hạn chuyên môn.</li><li>KTV đang xử lý công việc khác được báo “Bận” nhưng vẫn có thể được điều phối.</li><li>KTV chỉ nhận phiếu sau khi Admin chọn người phụ trách và bấm Lưu.</li></ol></Panel>
    <Panel className="table-card"><h2>Tải công việc của kỹ thuật viên</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>Kỹ thuật viên</th><th>Chuyên môn</th><th>Tình trạng</th><th>Phiếu đang mở</th><th>Đã giải quyết</th></tr></thead><tbody>
      {technicians.map(tech=>{const activeCount=activeWorkCount(tech.id);const busyCount=busyWorkCount(tech.id);return <tr key={tech.id}><td><strong>{tech.full_name}</strong></td><td>{tech.skills.join(', ')}</td><td><StatusBadge value={!tech.checkedIn?'Đã Check out':busyCount?'Bận':'Đã Check in'}/></td><td>{activeCount}</td><td>{tickets.filter(ticket=>(ticket.technicianId===tech.id||ticket.assistantTechnicianId===tech.id)&&['Đã giải quyết','Đã đóng'].includes(ticket.status)).length}</td></tr>;})}
    </tbody></table></div></Panel>
  </RoleLayout>;
}

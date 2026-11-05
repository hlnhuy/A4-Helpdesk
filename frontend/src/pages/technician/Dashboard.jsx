import { useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import useAuth from '../../hooks/useAuth.js';
import useDemoData from '../../hooks/useDemoData.js';
import { getTickets } from '../../services/ticketService.js';
import { getUsers, updateTechnicianAttendance } from '../../services/userService.js';
import FaceCheckModal from '../../components/technician/FaceCheckModal.jsx';
import Notification from '../../components/common/Notification.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [allTickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const [faceAction, setFaceAction] = useState(null);
  const [error, setError] = useState('');
  const tickets = allTickets.filter(ticket => ticket.technicianId === user.id || ticket.assistantTechnicianId === user.id);
  const newAssignments = tickets.filter(ticket => ticket.status === 'Mới tiếp nhận');
  const technician = users.find(account => account.id === user.id);
  const checkedIn = technician?.checkedIn === true;

  return <RoleLayout role="technician" title="Bảng làm việc của tôi">
    <Notification message={error} type="error" />
    <div className="technician-attendance-grid">
      <Panel className="technician-profile-card">
        {technician?.avatar
          ? <img className="technician-profile-avatar" src={technician.avatar} alt={`Ảnh đại diện ${technician.full_name}`} />
          : <span className="technician-profile-avatar technician-profile-avatar-fallback" aria-hidden="true">{(technician?.full_name || user.full_name || 'KTV').trim().charAt(0).toLocaleUpperCase()}</span>}
        <div className="technician-profile-info" aria-label="Thông tin kỹ thuật viên">
          <div className="technician-profile-field"><strong>Mã tài khoản:</strong><span>{technician?.user_code || user.user_code}</span></div>
          <div className="technician-profile-field"><strong>Họ tên:</strong><span>{technician?.full_name || user.full_name}</span></div>
          <div className="technician-profile-field"><strong>Email:</strong><span>{technician?.email || user.email}</span></div>
          <div className="technician-profile-field"><strong>Vai trò:</strong><span>Kỹ thuật viên</span></div>
          <div className="technician-profile-field"><strong>Chuyên môn:</strong><span>{technician?.skills?.length ? technician.skills.join(', ') : 'Chưa cập nhật'}</span></div>
        </div>
      </Panel>
      <Panel className={`availability ${checkedIn ? 'checked-in' : 'checked-out'}`}>
        <span>Tình trạng</span>
        <strong><i /> {checkedIn ? 'Đã Check in' : 'Chưa Check in'}</strong>
        <button className={`button ${checkedIn ? 'button-secondary' : 'button-primary'}`} type="button" onClick={() => setFaceAction(checkedIn ? 'check-out' : 'check-in')}>
          {checkedIn ? 'Check out' : 'Check in'}
        </button>
      </Panel>
    </div>
    {newAssignments.length > 0 && <Panel className="table-card">
      <div className="panel-heading-row"><h2>Phiếu mới được phân công ({newAssignments.length})</h2><Link to="/technician/tickets">Mở danh sách →</Link></div>
      <TicketTable tickets={newAssignments} linkPrefix="/technician/tickets"/>
    </Panel>}
    <Panel className="table-card"><div className="panel-heading-row"><h2>Việc cần làm</h2><Link to="/technician/tickets">Xem tất cả →</Link></div><TicketTable tickets={tickets.filter(ticket => !['Đã đóng'].includes(ticket.status)).slice(0, 10)} linkPrefix="/technician/tickets" /></Panel>
    {faceAction && <FaceCheckModal
      action={faceAction}
      onClose={() => setFaceAction(null)}
      onConfirm={() => {
        updateTechnicianAttendance(user.id, faceAction);
        setError('');
        setFaceAction(null);
      }}
    />}
  </RoleLayout>;
}

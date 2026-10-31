import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Notification from '../../components/common/Notification.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { approveAccount, declineAccount, getPendingAccounts, getUsers, resetUserPassword, setUserStatus } from '../../services/userService.js';

export default function Users() {
  const [users] = useDemoData(getUsers);
  const [pending] = useDemoData(getPendingAccounts);
  const [query,setQuery]=useState('');
  const [role,setRole]=useState('');
  const [feedback,setFeedback]=useState({message:'',type:'success'});
  const filtered=useMemo(()=>users.filter(user=>!role||user.role===role).filter(user=>`${user.full_name} ${user.user_code} ${user.email}`.toLowerCase().includes(query.toLowerCase())),[users,role,query]);
  function act(callback,success) {
    try { const result=callback();setFeedback({message:typeof success==='function'?success(result):success,type:'success'}); }
    catch(error) { setFeedback({message:error.message,type:'error'}); }
  }
  return <RoleLayout role="admin" title="Quản lý tài khoản">
    <Notification message={feedback.message} type={feedback.type}/>
    <Panel className="table-card"><h2>Yêu cầu cấp tài khoản ({pending.length})</h2>
      {pending.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Ghi chú</th><th>Gửi lúc</th><th>Thao tác</th></tr></thead><tbody>
        {pending.map(request=><tr key={request.id}><td><strong>{request.full_name}</strong></td><td>{request.email}</td><td>{request.role}</td><td>{request.note}</td><td>{new Date(request.createdAt).toLocaleString('vi-VN')}</td><td className="actions-cell"><button className="button button-approve" onClick={()=>act(()=>approveAccount(request.id),account=>`Đã cấp tài khoản ${account.user_code}; mật khẩu ban đầu: welcome123.`)}>Duyệt &amp; cấp</button><button className="button button-danger" onClick={()=>act(()=>declineAccount(request.id),'Đã từ chối yêu cầu.')}>Từ chối</button></td></tr>)}
      </tbody></table></div>:<p>Không còn yêu cầu cấp tài khoản.</p>}
    </Panel>
    <Panel className="table-card"><div className="toolbar">
      <input aria-label="Tìm tài khoản" placeholder="🔍 Tìm tên, mã, email..." value={query} onChange={event=>setQuery(event.target.value)}/>
      <select aria-label="Lọc vai trò" value={role} onChange={event=>setRole(event.target.value)}><option value="">Mọi vai trò</option><option value="admin">Admin</option><option value="technician">Kỹ thuật viên</option><option value="user">Người dùng</option></select>
      <Link className="button button-primary push-right" to="/admin/users/create">＋ Tạo tài khoản</Link>
    </div><div className="table-scroll"><table className="data-table"><thead><tr><th>Họ tên</th><th>Mã TK</th><th>Email</th><th>Vai trò</th><th>Chuyên môn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      {filtered.map(user=><tr key={user.id}><td><strong>{user.full_name}</strong></td><td>{user.user_code}</td><td>{user.email}</td><td>{user.role}</td><td>{user.skills?.join(', ')||'—'}</td><td><StatusBadge value={user.status==='active'?'Hoạt động':'Đã khóa'}/></td><td className="actions-cell">
        <Link className="button button-secondary" to={`/admin/users/${user.id}/edit`}>Sửa</Link>
        <button className="button button-secondary" onClick={()=>act(()=>resetUserPassword(user.id),'Đã đặt lại mật khẩu thành welcome123.')}>Đặt lại MK</button>
        {user.role!=='admin'&&<button className="button button-danger" onClick={()=>act(()=>setUserStatus(user.id,user.status==='active'?'locked':'active'),user.status==='active'?'Đã khóa tài khoản.':'Đã mở khóa tài khoản.')}>{user.status==='active'?'Khóa':'Mở khóa'}</button>}
      </td></tr>)}
    </tbody></table></div>
    {!filtered.length&&<p>Không tìm thấy tài khoản phù hợp.</p>}</Panel>
  </RoleLayout>;
}

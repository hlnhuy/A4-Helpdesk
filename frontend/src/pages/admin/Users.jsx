import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Notification from '../../components/common/Notification.jsx';
import {
  approveApiAccountRequest,
  declineApiAccountRequest,
  listApiAccountRequests,
  listApiAccounts,
  resetApiAccountPassword,
  toggleApiAccountStatus
} from '../../services/userService.js';

const roleLabels = { admin: 'Admin', technician: 'Kỹ thuật viên', user: 'Người dùng', tech: 'Kỹ thuật viên' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [accounts, requests] = await Promise.all([listApiAccounts(), listApiAccountRequests()]);
      setUsers(accounts);
      setPending(requests.filter(request => request.status === 'pending'));
      setFeedback({ message: '', type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => users
    .filter(user => !role || user.role === role)
    .filter(user => `${user.full_name} ${user.user_code} ${user.email}`.toLowerCase().includes(query.toLowerCase())),
  [users, role, query]);

  async function act(callback, success) {
    try {
      const result = await callback();
      await refresh();
      setFeedback({ message: typeof success === 'function' ? success(result) : success, type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  return <RoleLayout role="admin" title="Quản lý tài khoản">
    <Notification message={feedback.message} type={feedback.type}/>
    <Panel className="table-card"><h2>Yêu cầu cấp tài khoản ({pending.length})</h2>
      {loading ? <p>Đang tải tài khoản...</p> : pending.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Ghi chú</th><th>Gửi lúc</th><th>Thao tác</th></tr></thead><tbody>
        {pending.map(request=><tr key={request.id}><td><strong>{request.full_name}</strong></td><td>{request.email}</td><td>{roleLabels[request.role] || request.role}</td><td>{request.note || '—'}</td><td>{new Date(request.created_at).toLocaleString('vi-VN')}</td><td className="actions-cell"><button className="button button-approve" onClick={()=>act(()=>approveApiAccountRequest(request.id),account=>`Đã cấp tài khoản ${account.user_code}; mật khẩu ban đầu: 123456.`)}>Duyệt &amp; cấp</button><button className="button button-danger" onClick={()=>act(()=>declineApiAccountRequest(request.id),'Đã từ chối yêu cầu.')}>Từ chối</button></td></tr>)}
      </tbody></table></div>:<p>Không còn yêu cầu cấp tài khoản.</p>}
    </Panel>
    <Panel className="table-card"><p>Đặt lại mật khẩu sẽ cấp mật khẩu tạm <code>123456</code>. Hãy thông báo người dùng đổi mật khẩu sau khi đăng nhập.</p></Panel>
    <Panel className="table-card"><div className="toolbar">
      <input aria-label="Tìm tài khoản" placeholder="🔍 Tìm tên, mã, email..." value={query} onChange={event=>setQuery(event.target.value)}/>
      <select aria-label="Lọc vai trò" value={role} onChange={event=>setRole(event.target.value)}><option value="">Mọi vai trò</option><option value="admin">Admin</option><option value="technician">Kỹ thuật viên</option><option value="user">Người dùng</option></select>
      <Link className="button button-primary push-right" to="/admin/users/create">＋ Tạo tài khoản</Link>
    </div><div className="table-scroll"><table className="data-table"><thead><tr><th>Họ tên</th><th>Mã TK</th><th>Email</th><th>Vai trò</th><th>Chuyên môn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      {filtered.map(user=><tr key={user.id}><td><strong>{user.full_name}</strong></td><td>{user.user_code}</td><td>{user.email}</td><td>{roleLabels[user.role] || user.role}</td><td>{user.skills?.join(', ')||'—'}</td><td><StatusBadge value={user.status==='active'?'Hoạt động':'Đã khóa'}/></td><td className="actions-cell">
        <Link className="button button-secondary" to={`/admin/users/${user.id}/edit`}>Sửa</Link>
        <button className="button button-secondary" type="button" onClick={()=>act(()=>resetApiAccountPassword(user.id),result=>result.message)}>Đặt lại MK</button>
        {user.role!=='admin'&&<button className="button button-danger" type="button" onClick={()=>act(()=>toggleApiAccountStatus(user.id),result=>result.status==='active'?'Đã mở khóa tài khoản.':'Đã khóa tài khoản.')}>{user.status==='active'?'Khóa':'Mở khóa'}</button>}
      </td></tr>)}
    </tbody></table></div>
    {!loading&&!filtered.length&&<p>Không tìm thấy tài khoản phù hợp.</p>}</Panel>
  </RoleLayout>;
}

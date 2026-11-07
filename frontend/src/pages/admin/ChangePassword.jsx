import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import useAuth from '../../hooks/useAuth.js';
import { changeApiPassword } from '../../services/userService.js';

export default function ChangePassword() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });

  async function submit(event) {
    event.preventDefault();
    if (form.next !== form.confirm) {
      setFeedback({ message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    try {
      await changeApiPassword(form.current, form.next);
      updateUser({ ...user, mustChangePassword: false });
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  return <RoleLayout role="admin" title="Đổi mật khẩu">
    <Panel>
      {user.mustChangePassword && <p className="muted small">Vui lòng đổi mật khẩu tạm thời trước khi tiếp tục sử dụng hệ thống.</p>}
      <Notification message={feedback.message} type={feedback.type} />
      <form className="account-form" onSubmit={submit}>
        <label className="field">Mật khẩu hiện tại<input type="password" autoComplete="current-password" value={form.current} onChange={event => setForm(current => ({ ...current, current: event.target.value }))} required /></label>
        <label className="field">Mật khẩu mới<input type="password" autoComplete="new-password" value={form.next} onChange={event => setForm(current => ({ ...current, next: event.target.value }))} minLength="8" required /></label>
        <label className="field">Xác nhận mật khẩu mới<input type="password" autoComplete="new-password" value={form.confirm} onChange={event => setForm(current => ({ ...current, confirm: event.target.value }))} minLength="8" required /></label>
        <div className="form-actions"><button className="button button-primary" type="submit">Đổi mật khẩu</button></div>
      </form>
    </Panel>
  </RoleLayout>;
}

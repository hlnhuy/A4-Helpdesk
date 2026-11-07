import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { changeApiPassword, updateApiProfile } from '../../services/userService.js';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import RoleLayout from '../../layouts/RoleLayout.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      const saved = await updateApiProfile(form);
      updateUser({ ...user, ...saved });
      setMessage('Đã cập nhật hồ sơ trên máy chủ.');
      setError('');
    } catch (saveError) {
      setError(saveError.message);
      setMessage('');
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      setPasswordMessage('');
      return;
    }
    try {
      await changeApiPassword(passwordForm.current, passwordForm.next);
      updateUser({ ...user, mustChangePassword: false });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordMessage('Đã đổi mật khẩu trên máy chủ.');
      setPasswordError('');
    } catch (passwordChangeError) {
      setPasswordError(passwordChangeError.message);
      setPasswordMessage('');
    }
  }
  return <RoleLayout role={user.role} title="Hồ sơ cá nhân">
    <Panel className="profile-panel">
      <Notification message={error} type="error"/>
      <Notification message={message} type="success"/>
      <form className="account-form" onSubmit={submit}>
        <label className="field">Họ tên<input value={form.full_name} onChange={event=>setForm(current=>({...current,full_name:event.target.value}))} required maxLength="120"/></label>
        <label className="field">Email<input value={user.email} disabled/></label>
        <label className="field">Số điện thoại<input value={form.phone} onChange={event=>setForm(current=>({...current,phone:event.target.value}))} maxLength="30"/></label>
        <label className="field">Mã tài khoản<input value={user.user_code} disabled/></label>
        <label className="field">Vai trò<input value={user.role} disabled/></label>
        <button className="button button-primary">Lưu thay đổi</button>
      </form>
    </Panel>
    <Panel className="profile-panel">
      <h2>Đổi mật khẩu</h2>
      {user.mustChangePassword && <p className="muted small">Vui lòng đổi mật khẩu tạm thời trước khi tiếp tục sử dụng hệ thống.</p>}
      <Notification message={passwordError} type="error" />
      <Notification message={passwordMessage} type="success" />
      <form className="account-form" onSubmit={updatePassword}>
        <label className="field">Mật khẩu hiện tại<input type="password" autoComplete="current-password" value={passwordForm.current} onChange={event => setPasswordForm(current => ({ ...current, current: event.target.value }))} required /></label>
        <label className="field">Mật khẩu mới<input type="password" autoComplete="new-password" value={passwordForm.next} onChange={event => setPasswordForm(current => ({ ...current, next: event.target.value }))} minLength="8" required /></label>
        <label className="field">Xác nhận mật khẩu mới<input type="password" autoComplete="new-password" value={passwordForm.confirm} onChange={event => setPasswordForm(current => ({ ...current, confirm: event.target.value }))} minLength="8" required /></label>
        <button className="button button-primary">Đổi mật khẩu</button>
      </form>
    </Panel>
  </RoleLayout>;
}

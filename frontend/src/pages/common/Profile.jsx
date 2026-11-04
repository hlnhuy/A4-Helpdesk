import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { changePassword, getUsers, saveUser } from '../../services/userService.js';
import useDemoData from '../../hooks/useDemoData.js';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import RoleLayout from '../../layouts/RoleLayout.jsx';

export default function Profile() {
  const { user, updateUser }=useAuth();
  const [users]=useDemoData(getUsers);
  const current=users.find(item=>item.id===user.id);
  const [form,setForm]=useState({full_name:user.full_name,email:user.email});
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [passwordForm,setPasswordForm]=useState({ current: '', next: '', confirm: '' });
  const [passwordMessage,setPasswordMessage]=useState('');
  const [passwordError,setPasswordError]=useState('');
  const role=user.role;
  function submit(event) {
    event.preventDefault();
    try {
      const updated={...current,...form};
      saveUser(updated);
      updateUser({...user,full_name:form.full_name,email:form.email});
      setMessage('Đã cập nhật hồ sơ.');
      setError('');
    } catch(saveError) { setError(saveError.message); }
  }
  function updatePassword(event) {
    event.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      setPasswordMessage('');
      return;
    }
    try {
      changePassword(user.id, passwordForm.current, passwordForm.next);
      updateUser({ ...user, mustChangePassword: false });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordMessage('Đã đổi mật khẩu.');
      setPasswordError('');
    } catch (passwordChangeError) {
      setPasswordError(passwordChangeError.message);
      setPasswordMessage('');
    }
  }
  return <RoleLayout role={role} title="Hồ sơ cá nhân">
    <Panel className="profile-panel"><Notification message={error} type="error"/><Notification message={message} type="success"/>
      <form className="account-form" onSubmit={submit}>
        <label className="field">Họ tên<input value={form.full_name} onChange={event=>setForm(current=>({...current,full_name:event.target.value}))} required maxLength="100"/></label>
        <label className="field">Email<input type="email" value={form.email} onChange={event=>setForm(current=>({...current,email:event.target.value}))} required/></label>
        <label className="field">Mã tài khoản<input value={user.user_code} disabled/></label>
        <label className="field">Vai trò<input value={role} disabled/></label>
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

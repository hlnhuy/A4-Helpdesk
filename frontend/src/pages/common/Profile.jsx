import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import { getUsers, saveUser } from '../../services/userService.js';
import useDemoData from '../../hooks/useDemoData.js';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import RoleLayout from '../../layouts/RoleLayout.jsx';

export default function Profile() {
  const { user, updateUser }=useAuth();
  const [users]=useDemoData(getUsers);
  const current=users.find(item=>item.id===user.id);
  const [form,setForm]=useState({full_name:user.full_name,email:user.email,available:current?.available!==false});
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
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
  return <RoleLayout role={role} title="Hồ sơ cá nhân">
    <Panel className="profile-panel"><Notification message={error} type="error"/><Notification message={message} type="success"/>
      <form className="account-form" onSubmit={submit}>
        <label className="field">Họ tên<input value={form.full_name} onChange={event=>setForm(current=>({...current,full_name:event.target.value}))} required maxLength="100"/></label>
        <label className="field">Email<input type="email" value={form.email} onChange={event=>setForm(current=>({...current,email:event.target.value}))} required/></label>
        <label className="field">Mã tài khoản<input value={user.user_code} disabled/></label>
        <label className="field">Vai trò<input value={role} disabled/></label>
        {role==='technician'&&<label className="availability-toggle"><input type="checkbox" checked={form.available} onChange={event=>setForm(current=>({...current,available:event.target.checked}))}/> Sẵn sàng nhận phiếu</label>}
        <button className="button button-primary">Lưu thay đổi</button>
      </form>
    </Panel>
  </RoleLayout>;
}

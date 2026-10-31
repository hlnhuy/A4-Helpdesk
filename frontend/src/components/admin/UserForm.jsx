import { useState } from 'react';
import RoleSelector from './RoleSelector.jsx';
import Notification from '../common/Notification.jsx';

export default function UserForm({ initialUser, onSave }) {
  const [form,setForm] = useState(initialUser || {full_name:'',user_code:'',email:'',role:'user',password:'welcome123',skills:[]});
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);
  function change(event) { setForm(current=>({...current,[event.target.name]:event.target.value})); }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);setError('');
    try { await onSave(form); }
    catch(saveError) { setError(saveError.message); }
    finally { setSaving(false); }
  }
  return <form className="account-form" onSubmit={submit}>
    <Notification message={error} type="error"/>
    <label className="field">Họ tên *<input name="full_name" value={form.full_name} onChange={change} required maxLength="100"/></label>
    <label className="field">Mã tài khoản *<input name="user_code" value={form.user_code} onChange={change} required maxLength="30"/></label>
    <label className="field">Email *<input name="email" type="email" value={form.email} onChange={change} required/></label>
    <label className="field">Vai trò *<RoleSelector value={form.role} onChange={role=>setForm(current=>({...current,role}))}/></label>
    {!form.id && <label className="field">Mật khẩu ban đầu *<input name="password" value={form.password} onChange={change} required minLength="6"/></label>}
    <div className="form-actions"><button className="button button-primary" disabled={saving}>{saving?'Đang lưu...':'Lưu tài khoản'}</button></div>
  </form>;
}

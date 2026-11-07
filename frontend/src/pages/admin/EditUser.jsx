import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import UserForm from '../../components/admin/UserForm.jsx';
import Notification from '../../components/common/Notification.jsx';
import { listApiAccounts, saveApiAccount } from '../../services/userService.js';

export default function EditUser() {
  const { userId }=useParams();
  const navigate=useNavigate();
  const [user,setUser]=useState(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    listApiAccounts()
      .then(accounts=>setUser(accounts.find(item=>item.id===userId) || null))
      .catch(loadError=>setError(loadError.message))
      .finally(()=>setLoading(false));
  },[userId]);
  async function save(form) {
    await saveApiAccount(form);
    navigate('/admin/users');
  }
  return <RoleLayout role="admin" title="Chỉnh sửa tài khoản"><Panel>
    {error&&<Notification message={error} type="error"/>}
    {loading&&<p>Đang tải tài khoản...</p>}
    {!loading&&!error&&!user&&<p>Tài khoản không tồn tại.</p>}
    {user&&<UserForm key={user.id} initialUser={user} onSave={save}/>}
  </Panel></RoleLayout>;
}

import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import UserForm from '../../components/admin/UserForm.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { getUsers, saveUser } from '../../services/userService.js';

export default function EditUser() {
  const { userId }=useParams();
  const navigate=useNavigate();
  const [users]=useDemoData(getUsers);
  const user=users.find(item=>item.id===userId);
  if(!user)return <RoleLayout role="admin" title="Không tìm thấy tài khoản"><Panel>Tài khoản không tồn tại.</Panel></RoleLayout>;
  return <RoleLayout role="admin" title="Chỉnh sửa tài khoản"><Panel><UserForm initialUser={user} onSave={form=>{saveUser(form);navigate('/admin/users');}}/></Panel></RoleLayout>;
}

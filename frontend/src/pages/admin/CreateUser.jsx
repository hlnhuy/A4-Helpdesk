import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import UserForm from '../../components/admin/UserForm.jsx';
import { saveApiAccount } from '../../services/userService.js';

export default function CreateUser() {
  const navigate=useNavigate();
  async function save(form) {
    await saveApiAccount(form);
    navigate('/admin/users');
  }
  return <RoleLayout role="admin" title="Cấp tài khoản mới"><Panel><UserForm onSave={save}/></Panel></RoleLayout>;
}

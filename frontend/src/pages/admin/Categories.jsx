import { useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { deleteCategory, getCategories, saveCategory } from '../../services/categoryService.js';
import { getTickets } from '../../services/ticketService.js';
import { getUsers, updateTechnicianSkills } from '../../services/userService.js';

export default function Categories() {
  const [categories]=useDemoData(getCategories);
  const [tickets]=useDemoData(getTickets);
  const [users]=useDemoData(getUsers);
  const technicians=users.filter(user=>user.role==='technician');
  const [newCategory,setNewCategory]=useState('');
  const [feedback,setFeedback]=useState({message:'',type:'success'});
  function add(event) {
    event.preventDefault();
    try { saveCategory(newCategory);setNewCategory('');setFeedback({message:'Đã thêm chuyên môn.',type:'success'}); }
    catch(error) { setFeedback({message:error.message,type:'error'}); }
  }
  function remove(category) {
    try { deleteCategory(category);setFeedback({message:`Đã xóa chuyên môn ${category}.`,type:'success'}); }
    catch(error) { setFeedback({message:error.message,type:'error'}); }
  }
  function toggle(technician,category) {
    const skills=technician.skills||[];
    updateTechnicianSkills(technician.id,skills.includes(category)?skills.filter(item=>item!==category):[...skills,category]);
  }
  return <RoleLayout role="admin" title="Quản lý chuyên môn kỹ thuật">
    <Notification message={feedback.message} type={feedback.type}/>
    <div className="two-column category-columns">
      <Panel><h2>Danh sách chuyên môn / loại sự cố</h2><div className="table-scroll"><table className="data-table category-table"><thead><tr><th>Chuyên môn</th><th>Số KTV</th><th>Phiếu</th><th /></tr></thead><tbody>
        {categories.map(category=><tr key={category}><td><strong>{category}</strong></td><td>{technicians.filter(tech=>tech.skills?.includes(category)).length}</td><td>{tickets.filter(ticket=>ticket.category===category).length}</td><td><button className="button button-danger" onClick={()=>remove(category)}>Xóa</button></td></tr>)}
      </tbody></table></div><form className="add-category" onSubmit={add}><input value={newCategory} onChange={event=>setNewCategory(event.target.value)} placeholder="Chuyên môn mới, vd: Camera / Máy chủ" required/><button className="button button-primary">Thêm</button></form></Panel>
      <Panel><h2>Phân bổ chuyên môn cho KTV</h2><p className="muted small">Bấm vào chuyên môn để bật/tắt cho từng kỹ thuật viên.</p>
        {technicians.map(tech=><div className="skill-group" key={tech.id}><strong>{tech.full_name}</strong><div>{categories.map(category=><button type="button" key={category} aria-pressed={tech.skills?.includes(category)} className={tech.skills?.includes(category)?'skill-chip selected':'skill-chip'} onClick={()=>toggle(tech,category)}>{category}</button>)}</div></div>)}
      </Panel>
    </div>
  </RoleLayout>;
}

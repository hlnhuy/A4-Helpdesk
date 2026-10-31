import { useMemo, useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { deleteCategory, getCategories, renameCategory, saveCategory } from '../../services/categoryService.js';
import { getTickets } from '../../services/ticketService.js';
import { getUsers, updateTechnicianSkills } from '../../services/userService.js';

const categoryIcons = ['◉', '◍', '▦', '♧', '⌁', '✦'];

export default function Categories() {
  const [categories] = useDemoData(getCategories);
  const [tickets] = useDemoData(getTickets);
  const [users] = useDemoData(getUsers);
  const technicians = users.filter(user => user.role === 'technician');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [draftSkills, setDraftSkills] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: 'success' });
  const pageSize = 5;

  const visibleCategories = useMemo(() => categories.filter(category =>
    category.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
    && (!categoryFilter || (categoryFilter === 'used'
      ? tickets.some(ticket => ticket.category === category)
      : !tickets.some(ticket => ticket.category === category)))
  ), [categories, tickets, query, categoryFilter]);
  const pageCount = Math.max(1, Math.ceil(visibleCategories.length / pageSize));
  const currentCategories = visibleCategories.slice((page - 1) * pageSize, page * pageSize);
  const selectedSkills = draftSkills || Object.fromEntries(technicians.map(tech => [tech.id, tech.skills || []]));

  function startEdit(category) {
    setEditingCategory(category);
    setNewCategory(category);
  }

  function save(event) {
    event.preventDefault();
    try {
      if (editingCategory) {
        renameCategory(editingCategory, newCategory);
        setFeedback({ message: 'Đã cập nhật chuyên môn và các phiếu liên quan.', type: 'success' });
      } else {
        saveCategory(newCategory);
        setFeedback({ message: 'Đã thêm chuyên môn.', type: 'success' });
      }
      setNewCategory('');
      setEditingCategory('');
      setPage(1);
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  function remove(category) {
    try {
      deleteCategory(category);
      setFeedback({ message: `Đã xóa chuyên môn ${category}.`, type: 'success' });
      setPage(current => Math.min(current, Math.max(1, Math.ceil((visibleCategories.length - 1) / pageSize))));
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    }
  }

  function toggle(technician, category) {
    const currentSkills = selectedSkills[technician.id] || [];
    setDraftSkills({
      ...selectedSkills,
      [technician.id]: currentSkills.includes(category)
        ? currentSkills.filter(item => item !== category)
        : [...currentSkills, category]
    });
  }

  function saveAssignments() {
    technicians.forEach(technician => updateTechnicianSkills(technician.id, selectedSkills[technician.id] || []));
    setDraftSkills(null);
    setFeedback({ message: 'Đã cập nhật phân công chuyên môn.', type: 'success' });
  }

  return <RoleLayout role="admin" title="Quản lý chuyên môn kỹ thuật">
    <Notification message={feedback.message} type={feedback.type}/>
    <div className="two-column category-columns category-page">
      <Panel className="category-panel">
        <div className="category-panel-heading">
          <div><h2>Danh sách chuyên môn / loại sự cố</h2><p>Quản lý các chuyên môn và loại sự cố trong hệ thống</p></div>
          <span className="category-total">{categories.length} mục</span>
        </div>
        <div className="category-toolbar">
          <label className="category-search"><span aria-hidden="true">⌕</span><input aria-label="Tìm chuyên môn" placeholder="Tìm theo chuyên môn hoặc loại sự cố..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></label>
          <select aria-label="Lọc chuyên môn" value={categoryFilter} onChange={event => { setCategoryFilter(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option><option value="used">Đang được sử dụng</option><option value="unused">Chưa sử dụng</option>
          </select>
          <button type="button" className="icon-button" aria-label="Xóa bộ lọc" onClick={() => { setQuery(''); setCategoryFilter(''); setPage(1); }}>↻</button>
        </div>
        <div className="table-scroll">
          <table className="data-table category-table">
            <thead><tr><th>#</th><th>Chuyên môn</th><th>Số KTV</th><th>Phiếu xử lý</th><th>Thao tác</th></tr></thead>
            <tbody>{currentCategories.map((category, index) => <tr key={category}>
              <td>{(page - 1) * pageSize + index + 1}</td>
              <td><span className={`category-icon category-icon-${index % categoryIcons.length}`}>{categoryIcons[index % categoryIcons.length]}</span><strong>{category}</strong></td>
              <td>{technicians.filter(tech => (selectedSkills[tech.id] || []).includes(category)).length}</td>
              <td>{tickets.filter(ticket => ticket.category === category).length}</td>
              <td className="category-actions">
                <button type="button" className="icon-button edit-category" aria-label={`Sửa ${category}`} onClick={() => startEdit(category)}>✎</button>
                <button type="button" className="icon-button delete-category" aria-label={`Xóa ${category}`} onClick={() => remove(category)}>▣</button>
              </td>
            </tr>)}
              {!currentCategories.length && <tr><td colSpan="5" className="empty-message">Không tìm thấy chuyên môn phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="category-list-footer"><span>Hiển thị {visibleCategories.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, visibleCategories.length)} trong tổng số {visibleCategories.length} mục</span><Pagination page={page} pageCount={pageCount} onPageChange={setPage}/></div>
        <form className="add-category category-add-form" onSubmit={save}>
          <span className="category-add-icon" aria-hidden="true">▣</span>
          <input aria-label={editingCategory ? 'Tên chuyên môn cần sửa' : 'Chuyên môn mới'} value={newCategory} onChange={event => setNewCategory(event.target.value)} placeholder="Chuyên môn mới, vd: Camera / Máy chủ" required/>
          {editingCategory && <button className="button button-secondary" type="button" onClick={() => { setEditingCategory(''); setNewCategory(''); }}>Hủy</button>}
          <button className="button button-primary" type="submit">{editingCategory ? 'Lưu' : '+ Thêm'}</button>
        </form>
      </Panel>

      <Panel className="skills-panel">
        <div className="category-panel-heading">
          <div><h2>Phân bổ chuyên môn cho KTV</h2><p>Phân công kỹ thuật viên theo chuyên môn và vai trò</p></div>
          <span className="category-total">♧ Tổng: {technicians.length} nhân sự</span>
        </div>
        <p className="muted small skill-hint">Chọn chuyên môn để phân công hoặc bỏ phân công cho từng kỹ thuật viên.</p>
        <div className="technician-skill-list">{technicians.map((tech, index) => {
          const skills = selectedSkills[tech.id] || [];
          return <section className="technician-skill-card" key={tech.id}>
            <div className="technician-skill-heading">
              <span className={`technician-avatar technician-avatar-${index % 3}`}>{tech.full_name.slice(0, 1)}</span>
              <div><strong>{tech.full_name}</strong><small>Chuyên môn: {skills.length ? skills.join(', ') : 'Chưa phân công'}</small></div>
              <span className="assignment-status">{skills.length ? '● Đã phân bổ' : '○ Chưa phân bổ'}</span>
            </div>
            <div className="skill-chip-list">{categories.map(category => <button type="button" key={category} aria-pressed={skills.includes(category)} className={skills.includes(category) ? 'skill-chip selected' : 'skill-chip'} onClick={() => toggle(tech, category)}>{category}{skills.includes(category) ? ' ✓' : ''}</button>)}</div>
          </section>;
        })}</div>
        <div className="assignment-footer"><span>{draftSkills ? 'Có thay đổi chưa lưu' : 'Phân công đang được cập nhật'}</span><button type="button" className="button button-primary" onClick={saveAssignments}>♧ Cập nhật phân công</button></div>
      </Panel>
    </div>
  </RoleLayout>;
}

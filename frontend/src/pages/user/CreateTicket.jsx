import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import Notification from '../../components/common/Notification.jsx';
import useAuth from '../../hooks/useAuth.js';
import { createTicket } from '../../services/ticketService.js';
import { getCategories } from '../../services/categoryService.js';
import useDemoData from '../../hooks/useDemoData.js';

function readAttachment(file) {
  if (!file) return Promise.resolve([]);
  if (file.size > 2 * 1024 * 1024) return Promise.reject(new Error('Tệp đính kèm phải nhỏ hơn 2 MB.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve([{ name: file.name, dataUrl: reader.result }]);
    reader.onerror = () => reject(new Error('Không thể đọc tệp đính kèm.'));
    reader.readAsDataURL(file);
  });
}

export default function CreateTicket() {
  const navigate = useNavigate();
  const pageLocation = useLocation();
  const { user } = useAuth();
  const [categories] = useDemoData(getCategories);
  const [form, setForm] = useState({ title: '', category: 'Wi-Fi', priority: 'Trung bình', location: new URLSearchParams(pageLocation.search).get('location') || '', description: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const attachments = await readAttachment(file);
      const ticket = createTicket({ ...form, attachments }, user);
      navigate(`/user/tickets/${ticket.id}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return <RoleLayout role="user" title="Tạo phiếu sự cố">
    <Panel className="form-panel">
      <Notification message={error} type="error" />
      <form className="ticket-form" onSubmit={submit}>
        <label className="field field-full">Tiêu đề sự cố *
          <input name="title" value={form.title} onChange={change} required maxLength="160" placeholder="vd: Wi-Fi phòng A4-201 không kết nối được" />
        </label>
        <label className="field">Loại sự cố *
          <select name="category" value={form.category} onChange={change} required>{categories.map(item => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="field">Mức độ ưu tiên *
          <select name="priority" value={form.priority} onChange={change}>{['Thấp','Trung bình','Cao','Khẩn cấp'].map(item => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="field field-full">Vị trí xảy ra sự cố *
          <input name="location" value={form.location} onChange={change} required maxLength="100" placeholder="vd: A4-201" />
        </label>
        <label className="field field-full">Mô tả chi tiết *
          <textarea name="description" value={form.description} onChange={change} required maxLength="2000" rows="4" placeholder="Mô tả hiện tượng, thời điểm xảy ra, số người bị ảnh hưởng..." />
        </label>
        <label className="field field-full">Ảnh hoặc tệp đính kèm (tối đa 2 MB)
          <input type="file" accept="image/*,.pdf,.txt" onChange={event => setFile(event.target.files?.[0] || null)} />
        </label>
        <div className="form-actions field-full">
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi phiếu'}</button>
          <button className="button button-secondary" type="button" onClick={() => navigate('/user/tickets')}>Hủy</button>
        </div>
      </form>
    </Panel>
  </RoleLayout>;
}

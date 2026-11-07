import { useState } from 'react';

export default function TicketUpdateForm({ ticket, onSave, saving = false }) {
  const [form, setForm] = useState(ticket.resolution || { note: '', cause: '', action: '', result: '' });
  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }
  function submit(event) {
    event.preventDefault();
    onSave(form);
  }
  return <form className="work-form" onSubmit={submit}>
    <h3>Cập nhật kết quả xử lý</h3>
    <label className="field">Ghi chú xử lý<textarea name="note" rows="2" value={form.note || ''} onChange={change} maxLength="1000" /></label>
    <label className="field">Nguyên nhân<input name="cause" value={form.cause || ''} onChange={change} required maxLength="250" /></label>
    <label className="field">Biện pháp<input name="action" value={form.action || ''} onChange={change} required maxLength="250" /></label>
    <label className="field">Kết quả<input name="result" value={form.result || ''} onChange={change} required maxLength="250" /></label>
    <button className="button button-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Đánh dấu đã giải quyết'}</button>
  </form>;
}

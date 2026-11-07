import { useState } from 'react';
import { Link } from 'react-router-dom';
import Notification from '../../components/common/Notification.jsx';
import { submitApiAccountRequest } from '../../services/userService.js';

export default function RequestAccount() {
  const [form, setForm] = useState({ full_name: '', email: '', note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await submitApiAccountRequest(form);
      setMessage('Yêu cầu đã được gửi. Admin sẽ xem xét và cấp tài khoản nếu phù hợp.');
      setError('');
      setForm({ full_name: '', email: '', note: '' });
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  }

  return <section className="auth-card">
    <h1>Yêu cầu cấp tài khoản</h1>
    <p className="muted small">Tài khoản chỉ được kích hoạt sau khi Admin xem xét.</p>
    <Notification message={error} type="error" />
    <Notification message={message} type="success" />
    <form onSubmit={submit}>
      <label htmlFor="request-name">Họ tên</label>
      <input id="request-name" value={form.full_name} onChange={event => setForm(current => ({ ...current, full_name: event.target.value }))} required maxLength="100" />
      <label htmlFor="request-email">Email</label>
      <input id="request-email" type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} required maxLength="254" />
      <label htmlFor="request-note">Thông tin bổ sung</label>
      <input id="request-note" value={form.note} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} maxLength="300" />
      <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
    </form>
    <p className="muted small"><Link to="/login">Quay lại đăng nhập</Link></p>
  </section>;
}

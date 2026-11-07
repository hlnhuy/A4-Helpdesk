import { useState } from 'react';
import { Link } from 'react-router-dom';
import Notification from '../../components/common/Notification.jsx';
import { requestApiPasswordReset } from '../../services/userService.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await requestApiPasswordReset(email);
      setMessage('Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.');
      setError('');
      setEmail('');
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  }

  return <section className="auth-card">
    <h1>Yêu cầu đặt lại mật khẩu</h1>
    <p className="muted small">Nhập email đã đăng ký. Máy chủ cần được cấu hình SMTP để gửi email.</p>
    <Notification message={error} type="error" />
    <Notification message={message} type="success" />
    <form onSubmit={submit}>
      <label htmlFor="reset-account">Email</label>
      <input id="reset-account" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" />
      <button className="primary-button" type="submit">Gửi yêu cầu</button>
    </form>
    <p className="muted small"><Link to="/login">Quay lại đăng nhập</Link></p>
  </section>;
}

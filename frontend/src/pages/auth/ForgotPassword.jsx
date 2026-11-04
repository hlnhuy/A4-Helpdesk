import { useState } from 'react';
import { Link } from 'react-router-dom';
import Notification from '../../components/common/Notification.jsx';
import { requestPasswordReset } from '../../services/userService.js';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    try {
      requestPasswordReset(identifier);
      setMessage('Nếu tài khoản tồn tại, yêu cầu đặt lại mật khẩu đã được gửi đến Admin xem xét.');
      setError('');
      setIdentifier('');
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  }

  return <section className="auth-card">
    <h1>Yêu cầu đặt lại mật khẩu</h1>
    <p className="muted small">Admin sẽ xác minh yêu cầu và cấp mật khẩu tạm thời.</p>
    <Notification message={error} type="error" />
    <Notification message={message} type="success" />
    <form onSubmit={submit}>
      <label htmlFor="reset-account">Mã tài khoản hoặc email</label>
      <input id="reset-account" value={identifier} onChange={event => setIdentifier(event.target.value)} required autoComplete="username" />
      <button className="primary-button" type="submit">Gửi yêu cầu</button>
    </form>
    <p className="muted small"><Link to="/login">Quay lại đăng nhập</Link></p>
  </section>;
}

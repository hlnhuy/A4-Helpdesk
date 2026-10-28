import { useState } from 'react';

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    window.alert('Giao diện đăng nhập mẫu. Chức năng xác thực sẽ được kết nối với FastAPI sau.');
  }

  return (
    <section className="auth-card">
      <h1>Đăng nhập</h1>
      <p className="muted">Sử dụng tài khoản do Admin cấp.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="account">Mã tài khoản hoặc email</label>
        <input id="account" value={account} onChange={e => setAccount(e.target.value)} required autoComplete="username" />
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        <button className="primary-button" type="submit">Đăng nhập</button>
      </form>
      <p className="muted small">Chưa có tài khoản? Vui lòng liên hệ Admin.</p>
    </section>
  );
}

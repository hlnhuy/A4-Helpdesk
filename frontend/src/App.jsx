import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';
import NotFound from './pages/public/NotFound.jsx';

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">A4 Helpdesk</Link>
        <nav aria-label="Điều hướng chính">
          <Link to="/">Trang chủ</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>
      </header>
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">A4 Helpdesk · Hệ thống tiếp nhận và xử lý sự cố mạng</footer>
    </>
  );
}

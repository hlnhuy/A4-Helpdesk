import { Link } from 'react-router-dom';

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <header className="public-header">
        <Link className="public-brand" to="/" aria-label="A4 Helpdesk - Trang chủ">
          <span className="public-brand-mark" aria-hidden="true">A4</span>
          <span>A4 Helpdesk</span>
        </Link>
        <nav className="public-header-actions" aria-label="Điều hướng chính">
          <Link className="button button-primary" to="/login">Đăng nhập</Link>
        </nav>
      </header>
      <main className="public-main">{children}</main>
    </div>
  );
}

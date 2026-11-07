import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';

export default function NotFound() {
  return (
    <PublicLayout><section className="auth-card">
      <h1>Không tìm thấy trang</h1><p>Đường dẫn bạn truy cập không tồn tại.</p><Link to="/welcome">Quay về trang chủ</Link>
    </section></PublicLayout>
  );
}

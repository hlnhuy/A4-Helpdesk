import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="content-card">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link to="/">Quay về trang chủ</Link>
    </section>
  );
}

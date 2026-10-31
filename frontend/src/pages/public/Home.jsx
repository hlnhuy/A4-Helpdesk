import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-intro">
          <p className="landing-eyebrow">Hệ thống báo sự cố mạng — Trường A4</p>
          <h1>Báo sự cố mạng nhanh, kỹ thuật viên đến đúng người, đúng việc</h1>
          <p className="landing-description">
            Quét mã QR, chọn loại sự cố, mức độ ưu tiên và vị trí. Hệ thống tự động giao
            cho kỹ thuật viên phù hợp, ít việc nhất và theo dõi đến khi xử lý xong.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" to="/login">Báo sự cố ngay</Link>
            <Link className="button button-secondary" to="/login">Đăng nhập</Link>
          </div>
        </div>
      </section>

      <section className="landing-steps" aria-label="Quy trình báo sự cố">
        <article className="step-card">
          <span className="step-number">1</span>
          <p>Quét mã QR bằng điện thoại</p>
        </article>
        <article className="step-card" id="account-instructions">
          <span className="step-number">2</span>
          <p>Đăng nhập (tài khoản do Admin cấp)</p>
        </article>
        <article className="step-card">
          <span className="step-number">3</span>
          <p>Tạo phiếu: loại, ưu tiên, vị trí, mô tả</p>
        </article>
        <article className="step-card">
          <span className="step-number">4</span>
          <p>Theo dõi trạng thái &amp; đánh giá kết quả</p>
        </article>
      </section>
    </div>
  );
}

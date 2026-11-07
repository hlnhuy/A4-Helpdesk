import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const formPath = '/user/tickets/create';
  const loginPath = `/login?next=${encodeURIComponent(formPath)}`;
  const qrUrl = `${window.location.origin}${loginPath}`;
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-intro">
          <p className="landing-eyebrow">Hệ thống báo sự cố mạng — Trường A4</p>
          <h1>Báo sự cố mạng nhanh, kỹ thuật viên đến đúng người, đúng việc</h1>
          <p className="landing-description">
            Quét mã QR, đăng nhập, chọn loại sự cố và vị trí. Admin sẽ duyệt mức độ ưu tiên
            trước khi kỹ thuật viên phù hợp tiếp nhận và xử lý.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" to={loginPath}>Báo sự cố ngay</Link>
            <Link className="button button-secondary" to="/login">Đăng nhập</Link>
          </div>
        </div>
      </section>

      <section className="landing-steps" aria-label="Quy trình báo sự cố">
        <article className="step-card">
          <span className="step-number">1</span>
          <p>Quét mã QR bằng điện thoại</p>
        </article>
        <article className="step-card">
          <span className="step-number">2</span>
          <p>Đăng nhập (tài khoản do Admin cấp)</p>
        </article>
        <article className="step-card">
          <span className="step-number">3</span>
          <p>Tạo phiếu: loại, vị trí, mô tả</p>
        </article>
        <article className="step-card">
          <span className="step-number">4</span>
          <p>Theo dõi trạng thái và kết quả xử lý</p>
        </article>
      </section>
      <section className="shared-qr-panel" aria-labelledby="shared-qr-title">
        <div>
          <h2 id="shared-qr-title">Mã QR dùng chung</h2>
          <p>Quét mã để mở trang đăng nhập và tạo phiếu sự cố. Sau khi đăng nhập, bạn sẽ được chuyển thẳng đến biểu mẫu.</p>
        </div>
        <a href={qrUrl} aria-label="Mở trang tạo phiếu sự cố">
          <QRCodeSVG value={qrUrl} size={160} level="M" includeMargin />
        </a>
      </section>
    </div>
  );
}

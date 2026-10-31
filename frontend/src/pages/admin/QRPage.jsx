import { QRCodeSVG } from 'qrcode.react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';

const locations=['A4-101','A4-102','A4-201','A4-202','A4-301','Thư viện'];

export default function QRPage() {
  const origin=window.location.origin;
  function qrUrl(location) {
    return `${origin}/login?next=${encodeURIComponent(`/user/tickets/create?location=${encodeURIComponent(location)}`)}`;
  }
  return <RoleLayout role="admin" title="Mã QR báo sự cố">
    <Panel className="qr-overview"><div><h2>Mã QR chung</h2><p>Quét mã để mở hệ thống báo sự cố và chọn vị trí.</p>
      <div className="qr-large"><QRCodeSVG value={`${origin}/login?next=${encodeURIComponent('/user/tickets/create')}`} size={180} level="H" includeMargin/></div>
      <div className="form-actions"><button className="button button-primary" onClick={()=>window.print()}>In mã QR</button><a className="button button-secondary" href={qrUrl('')} target="_blank" rel="noreferrer">Mở thử liên kết</a></div>
    </div><div><h2>Quy trình sau khi quét</h2><ol className="rules-list"><li>Quét QR bằng điện thoại</li><li>Website yêu cầu đăng nhập</li><li>Tạo phiếu và nhập vị trí</li><li>Kỹ thuật viên nhận và xử lý phiếu</li></ol><p className="muted small">Các mã phòng bên dưới tự điền sẵn vị trí báo sự cố.</p></div></Panel>
    <Panel><h2>QR theo phòng (tự điền vị trí)</h2><div className="qr-grid">{locations.map(location=><div className="qr-room" key={location}>
      <div className="qr-small"><QRCodeSVG value={qrUrl(location)} size={140} level="H" includeMargin/></div><strong>{location}</strong>
      <a className="button button-secondary" href={qrUrl(location)} target="_blank" rel="noreferrer">Mở thử liên kết</a>
    </div>)}</div></Panel>
  </RoleLayout>;
}

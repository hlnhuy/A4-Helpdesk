import Panel from './Panel.jsx';
import StatusBadge from './StatusBadge.jsx';

function formattedDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

export default function TicketDetails({ ticket, actions }) {
  return <Panel className="ticket-info-card">
    <div className="ticket-title-row"><h2>{ticket.title}</h2><div><StatusBadge value={ticket.status} /><StatusBadge value={ticket.priority || 'Chờ duyệt'} /></div></div>
    <dl className="details-list">
      <dt>Loại sự cố</dt><dd>{ticket.category}</dd><dt>Vị trí</dt><dd>{ticket.location}</dd>
      <dt>Người gửi</dt><dd>{ticket.requester}</dd><dt>KTV phụ trách</dt><dd>{ticket.technician || 'Chưa phân công'}</dd>
      <dt>Mô tả</dt><dd>{ticket.description}</dd><dt>Đính kèm</dt><dd>
        {ticket.attachments?.length ? ticket.attachments.map(file => <a className="attachment-link" key={file.name} href={file.dataUrl} download={file.name}>{file.name}</a>) : '—'}
      </dd>
      <dt>Hạn xử lý (SLA)</dt><dd>{formattedDate(ticket.slaAt)}</dd>
    </dl>
    {ticket.resolution && <div className="resolution-block"><h3>Kết quả xử lý</h3><dl className="details-list">
      <dt>Nguyên nhân</dt><dd>{ticket.resolution.cause || '—'}</dd>
      <dt>Biện pháp</dt><dd>{ticket.resolution.action || '—'}</dd>
      <dt>Kết quả</dt><dd>{ticket.resolution.result || '—'}</dd>
    </dl></div>}
    {actions}
  </Panel>;
}

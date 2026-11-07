import Panel from './Panel.jsx';

export default function TicketTimeline({ ticket }) {
  const priorityEvent = ticket.history?.find(event => ['priority-updated', 'priority-selected', 'priority-approved'].includes(event.type));
  const rows = [
    ['Tạo phiếu', ticket.createdAt],
    ['Chọn mức độ ưu tiên', priorityEvent?.createdAt || ticket.priorityApprovedAt],
    ['Phân công', ticket.technicianId ? ticket.history?.find(event => event.type === 'assigned')?.createdAt : null],
    ['Bắt đầu xử lý', ticket.startedAt],
    ['Giải quyết', ticket.resolvedAt],
    ['Đóng phiếu', ticket.closedAt]
  ];
  return <Panel><h3>Mốc thời gian</h3><dl className="details-list timeline-dates">
    {rows.map(([label, value]) => <div className="timeline-row" key={label}><dt>{label}</dt><dd>{value ? new Date(value).toLocaleString('vi-VN') : '—'}</dd></div>)}
  </dl></Panel>;
}

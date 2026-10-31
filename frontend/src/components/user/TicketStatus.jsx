import StatusBadge from '../common/StatusBadge.jsx';

export default function TicketStatus({ status = 'Mới tiếp nhận' }) {
  return <StatusBadge value={status} />;
}

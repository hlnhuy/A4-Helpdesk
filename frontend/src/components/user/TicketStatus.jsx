export default function TicketStatus({ status = 'Mới tiếp nhận' }) {
  return <span className="ticket-status">{status}</span>;
}

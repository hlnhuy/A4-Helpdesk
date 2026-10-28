export default function TicketCard({ ticket }) {
  return <article><h3>{ticket.title}</h3><p>{ticket.status}</p></article>;
}

export default function TicketRow({ ticket }) {
  return <tr><td>{ticket.id}</td><td>{ticket.title}</td><td>{ticket.status}</td></tr>;
}

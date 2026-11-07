export default function StatCard({ title, value = 0 }) {
  return <article className="content-card"><p>{title}</p><strong>{value}</strong></article>;
}

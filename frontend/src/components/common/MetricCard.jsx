import Panel from './Panel.jsx';

export default function MetricCard({ label, value, note }) {
  return <Panel className="metric-card"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</Panel>;
}

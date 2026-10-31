import Panel from './Panel.jsx';

export default function MetricCard({ label, value, note, icon = '◉', tone = 'blue' }) {
  return <Panel className={`metric-card metric-${tone}`}><span className="metric-icon" aria-hidden="true">{icon}</span><div className="metric-copy"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div><span className="metric-trend" aria-hidden="true">↗</span></Panel>;
}

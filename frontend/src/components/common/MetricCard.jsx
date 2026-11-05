import { Link } from 'react-router-dom';
import Panel from './Panel.jsx';

export default function MetricCard({ label, value, note, icon = '◉', tone = 'blue', to }) {
  const card = <Panel className={`metric-card metric-${tone}${to ? ' metric-card-clickable' : ''}`}><span className="metric-icon" aria-hidden="true">{icon}</span><div className="metric-copy"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div><span className="metric-trend" aria-hidden="true">↗</span></Panel>;
  return to ? <Link className="metric-card-link" to={to} aria-label={`${label}: ${value}`}>{card}</Link> : card;
}

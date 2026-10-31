export default function BarList({ rows }) {
  const max = Math.max(...rows.map(([, value]) => value), 1);
  return <div className="bar-list">{rows.map(([label, value]) => (
    <div className="bar-row" key={label}><span>{label}</span><i><b style={{ width: `${value / max * 100}%` }} /></i><strong>{value}</strong></div>
  ))}</div>;
}

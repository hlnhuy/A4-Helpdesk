export default function DonutChart({ total, values }) {
  const colors = ['#3983ed', '#f4a000', '#22bf68', '#9aa8bb'];
  const sum = values.reduce((result, value) => result + value, 0) || 1;
  let offset = 0;
  const stops = values.map((value, index) => {
    const start = offset / sum * 100;
    offset += value;
    return `${colors[index]} ${start}% ${offset / sum * 100}%`;
  }).join(', ');
  return <div className="donut" style={{ background: `conic-gradient(${stops})` }}><span>{total}</span></div>;
}

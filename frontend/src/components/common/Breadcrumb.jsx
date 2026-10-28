export default function Breadcrumb({ items = [] }) {
  return <nav aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item}-${index}`}>{index > 0 ? ' / ' : ''}{item}</span>)}</nav>;
}

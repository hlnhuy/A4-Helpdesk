export default function Panel({ as: Element = 'section', className = '', children }) {
  return <Element className={`panel ${className}`.trim()}>{children}</Element>;
}

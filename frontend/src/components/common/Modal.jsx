export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-label={title}><h2>{title}</h2>{children}<button onClick={onClose}>Đóng</button></div>;
}

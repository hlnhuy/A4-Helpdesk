export default function Notification({ message, type = 'info' }) {
  if (!message) return null;
  return <div role="status" data-type={type}>{message}</div>;
}

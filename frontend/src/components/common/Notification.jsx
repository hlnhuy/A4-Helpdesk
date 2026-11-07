export default function Notification({ message, type = 'info' }) {
  if (!message) return null;
  return <div className={`app-notification notification-${type}`} role={type === 'error' ? 'alert' : 'status'}>{message}</div>;
}

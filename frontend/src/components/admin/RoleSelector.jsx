export default function RoleSelector({ value, onChange }) {
  return <select value={value} onChange={event => onChange?.(event.target.value)}><option value="user">Người dùng</option><option value="technician">Kỹ thuật viên</option><option value="admin">Admin — Quản trị viên</option></select>;
}

export default function UserTable({ users = [] }) {
  return <table><thead><tr><th>Mã tài khoản</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.user_code}</td><td>{user.full_name}</td><td>{user.role}</td><td>{user.status}</td></tr>)}</tbody></table>;
}

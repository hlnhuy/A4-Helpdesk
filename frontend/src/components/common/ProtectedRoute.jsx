import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // TODO: kiểm tra phiên đăng nhập và quyền từ AuthContext trước khi triển khai production.
  return children ?? <Navigate to="/login" replace />;
}

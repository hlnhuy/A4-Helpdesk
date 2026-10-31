import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getUsers } from '../../services/userService.js';

export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const account = getUsers().find(item => item.id === user.id);
  if (!account || account.status !== 'active') return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

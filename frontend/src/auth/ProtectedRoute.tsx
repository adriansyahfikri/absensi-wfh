import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Role } from '../api/types';

interface ProtectedRouteProps {
  allow: Role[];
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}

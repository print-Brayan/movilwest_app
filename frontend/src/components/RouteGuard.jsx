import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}

export function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

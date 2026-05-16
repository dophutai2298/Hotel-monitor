import { ReactNode, memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

// Memoize component to prevent unnecessary re-renders (rerender-memo)
const ProtectedRoute = memo(function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Early return for loading state (js-early-exit)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Early return for unauthenticated users (js-early-exit)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Early return for non-admin users when admin is required (js-early-exit)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
});

export default ProtectedRoute;

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from '@carbon/react';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, token, loadUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token && !isAuthenticated && !isLoading) {
      loadUser();
    }
  }, [token, isAuthenticated, isLoading, loadUser]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Loading description="Carregando..." withOverlay={false} />
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

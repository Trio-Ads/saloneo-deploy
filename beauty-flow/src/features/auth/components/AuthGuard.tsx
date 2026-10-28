import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';
import LoadingFallback from '../../../components/LoadingFallback';

export const AuthGuard: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    // Sauvegarder l'URL actuelle pour rediriger après la connexion
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicOnlyGuard: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'supplier' ? '/fournisseur' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

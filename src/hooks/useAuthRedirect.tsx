import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to handle automatic redirects based on authentication state
 * Redirects authenticated users away from auth pages to dashboard
 * Redirects unauthenticated users to login page when accessing protected routes
 */
export const useAuthRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (loading) return;

    const currentPath = location.pathname;
    const isAuthPage = ['/login', '/register', '/'].includes(currentPath);
    const isProtectedRoute = !['/login', '/register', '/', '/auth/verify', '/verify', '/reset-password', '/auth/reset-password'].includes(currentPath);

    // If user is authenticated and on auth pages, redirect to dashboard
    if (isAuthenticated && isAuthPage) {
      navigate('/dashboard', { replace: true });
    }
    
    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && isProtectedRoute) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return {
    isAuthenticated,
    loading,
    shouldShowAuthPages: !isAuthenticated && !loading,
    shouldShowProtectedContent: isAuthenticated && !loading,
  };
};

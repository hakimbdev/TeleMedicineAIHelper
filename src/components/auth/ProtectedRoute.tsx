import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  loading?: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({
  isAuthenticated,
  loading = false,
  redirectPath = '/login'
}: ProtectedRouteProps) => {
  console.log('ProtectedRoute check:', { isAuthenticated, loading, redirectPath });

  // Show loading spinner while authentication is being checked
  if (loading) {
    console.log('ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('ProtectedRoute: Authenticated, allowing access');
  return <Outlet />;
};

export default ProtectedRoute;
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Public routes that don't need sidebar
  const isPublicRoute = ['/login', '/register', '/'].includes(location.pathname);
  
  if (isPublicRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-grow">
        {isAuthenticated && <Sidebar />}
        <main className="flex-grow p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
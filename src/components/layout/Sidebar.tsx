import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  VideoIcon,
  FileText,
  MessageSquare,
  MessageCircle,
  Stethoscope,
  Bell,
  User,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['patient', 'doctor', 'admin'],
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: <Calendar className="h-5 w-5" />,
      roles: ['patient', 'doctor', 'admin'],
    },
    {
      name: 'Consultations',
      path: '/consultation/active',
      icon: <VideoIcon className="h-5 w-5" />,
      roles: ['patient', 'doctor'],
    },
    {
      name: 'Medical Records',
      path: '/medical-records',
      icon: <FileText className="h-5 w-5" />,
      roles: ['patient', 'doctor'],
    },
    {
      name: 'Messages',
      path: '/chat',
      icon: <MessageCircle className="h-5 w-5" />,
      roles: ['patient', 'doctor', 'admin'],
    },
    {
      name: 'AI Assistant',
      path: '/chatbot',
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ['patient', 'doctor', 'admin'],
    },
    {
      name: 'Prescriptions',
      path: '/prescriptions',
      icon: <Stethoscope className="h-5 w-5" />,
      roles: ['patient', 'doctor'],
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: <Bell className="h-5 w-5" />,
      roles: ['patient', 'doctor', 'admin'],
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
      roles: ['patient', 'doctor', 'admin'],
    },
    {
      name: 'Admin',
      path: '/admin',
      icon: <ShieldCheck className="h-5 w-5" />,
      roles: ['admin'],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="h-full flex flex-col">
        <div className="py-6 px-5 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-500">
            {user?.role === 'doctor' ? 'Doctor Portal' : 
             user?.role === 'admin' ? 'Admin Portal' : 'Patient Portal'}
          </h2>
          <div className="mt-2 flex items-center">
            {user?.avatar ? (
              <img 
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {user?.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'doctor' ? user.specialization : user?.email}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-primary-50 text-primary-700" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <span className={cn(
                "mr-3",
                isActive(item.path) ? "text-primary-500" : "text-gray-500"
              )}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="px-3 py-4 border-t border-gray-200">
          <Link
            to="/settings"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-500" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
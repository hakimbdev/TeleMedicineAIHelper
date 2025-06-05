import { Bell, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Notification } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface NotificationsListProps {
  notifications: Notification[];
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="h-5 w-5 text-primary-500" />;
    case 'message':
      return <MessageSquare className="h-5 w-5 text-accent-500" />;
    case 'prescription':
      return <Bell className="h-5 w-5 text-secondary-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-warning-500" />;
  }
};

const NotificationsList = ({ notifications }: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-6">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
        <p className="text-gray-500">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Link
          key={notification.id}
          to={notification.link || '#'}
          className={`
            block p-3 rounded-lg transition-colors
            ${notification.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-primary-50 hover:bg-primary-100 border-l-4 border-primary-500'}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-grow">
              <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-primary-900'}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-0.5 ${notification.read ? 'text-gray-500' : 'text-primary-700'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(notification.date)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NotificationsList;
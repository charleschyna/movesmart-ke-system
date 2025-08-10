import React, { useState } from 'react';
import { Bell, Check, Map, AlertTriangle, Wrench } from 'lucide-react';

// Define notification types
type NotificationType = 'MAP_UPDATE' | 'ALERT' | 'MAINTENANCE' | 'GENERAL';

// Updated mock data with types
const mockNotifications = [
  {
    id: '1',
    type: 'MAP_UPDATE' as NotificationType,
    title: 'New Map Data Available',
    description: 'Updated traffic patterns for Nairobi are now available.',
    time: '15m ago',
    read: false,
  },
  {
    id: '2',
    type: 'ALERT' as NotificationType,
    title: 'High Congestion Alert',
    description: 'Unusual traffic volume on Thika Road. Consider rerouting.',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    type: 'MAINTENANCE' as NotificationType,
    title: 'System Maintenance',
    description: 'Scheduled maintenance will occur tonight at 11 PM.',
    time: '3h ago',
    read: true,
  },
  {
    id: '4',
    type: 'GENERAL' as NotificationType,
    title: 'Welcome to MoveSmart!',
    description: 'Get started by exploring real-time traffic data.',
    time: '1d ago',
    read: true,
  },
];

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const iconProps = { className: "h-6 w-6" };
  switch (type) {
    case 'MAP_UPDATE':
      return <Map {...iconProps} />;
    case 'ALERT':
      return <AlertTriangle {...iconProps} />;
    case 'MAINTENANCE':
      return <Wrench {...iconProps} />;
    case 'GENERAL':
    default:
      return <Bell {...iconProps} />;
  }
};

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-6 flex items-start space-x-4 transition-all duration-300 ease-in-out ${
                    notification.read ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-gray-100`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.read ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'
                    }`}>
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                      aria-label="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              // Empty State
              <div className="text-center py-20 px-6">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">You're all caught up!</h3>
                <p className="mt-2 text-sm text-gray-500">New notifications will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

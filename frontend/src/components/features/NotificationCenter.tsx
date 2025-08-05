import React, { useState } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Mock data for notifications
const mockNotifications = [
  {
    id: '1',
    title: 'New Map Data Available',
    description: 'Updated traffic patterns for Nairobi are now available.',
    time: '15m ago',
    read: false,
  },
  {
    id: '2',
    title: 'High Congestion Alert',
    description: 'Unusual traffic volume on Thika Road. Consider rerouting.',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    title: 'System Maintenance',
    description: 'Scheduled maintenance will occur tonight at 11 PM.',
    time: '3h ago',
    read: true,
  },
];

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notification Center</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <BellIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg flex items-start space-x-4 transition-colors ${
              notification.read ? 'bg-gray-50' : 'bg-blue-50'
            }`}
          >
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
              <p className="text-gray-600">{notification.description}</p>
              <p className="text-sm text-gray-400 mt-1">{notification.time}</p>
            </div>
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {notifications.length === 0 && (
        <div className="text-center py-8">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

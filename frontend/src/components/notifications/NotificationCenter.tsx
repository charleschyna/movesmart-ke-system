import React, { useMemo } from 'react';
import { CheckCircleIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationsContext';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, toggleRead, deleteOne } = useNotifications();

  const items = useMemo(
    () => notifications.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notifications]
  );

  const openMap = (lat?: number, lng?: number) => {
    if (lat != null && lng != null) alert(`Open map at: ${lat}, ${lng}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={markAllAsRead} className="text-blue-600 hover:text-blue-700">Mark all as read</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                No notifications.
              </motion.div>
            ) : (
              items.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`group relative rounded-xl border border-gray-200 p-4 hover:shadow-md transition ${n.read ? 'bg-white' : 'bg-blue-50/70'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                        n.severity === 'critical' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{n.title}</h3>
                          <p className="mt-1 text-sm text-gray-700 line-clamp-2">{n.message}</p>
                          <div className="mt-2 text-xs text-gray-500">{timeAgo(n.createdAt)} • {n.city}{n.location ? ` • ${n.location}` : ''}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {n.coordinates && (
                            <button onClick={() => openMap(n.coordinates?.lat, n.coordinates?.lng)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
                              <MapPinIcon className="h-4 w-4" /> Map
                            </button>
                          )}
                          <button onClick={() => toggleRead(n.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                            {n.read ? 'Mark as unread' : 'Mark as read'}
                          </button>
                          <button onClick={() => deleteOne(n.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100">
                            <TrashIcon className="h-4 w-4" /> Delete
                          </button>
                          <CheckCircleIcon className={`h-5 w-5 ${n.read ? 'text-emerald-500' : 'text-gray-300'}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 
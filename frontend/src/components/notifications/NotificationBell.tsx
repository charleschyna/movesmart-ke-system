import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext';

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';
export type NotificationCategory = 'accident' | 'road_closure' | 'construction' | 'congestion' | 'resolved' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  city: 'Nairobi' | 'Mombasa' | 'Kisumu' | 'Nakuru' | 'Eldoret';
  location?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string; // ISO
  read: boolean;
}

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

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, deleteOne, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = useMemo(
    () => notifications.filter(i => !i.read).slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notifications]
  );

  const goToAll = () => {
    setOpen(false);
    navigate('/dashboard');
    window.dispatchEvent(new Event('navigate-to-notifications'));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-sm border border-gray-200"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button onClick={markAllAsRead} className="text-blue-600 hover:text-blue-700">Mark all as read</button>
                <button onClick={goToAll} className="text-gray-500 hover:text-gray-700">View all</button>
              </div>
            </div>

            <div className="max-h-96 overflow-auto p-2">
              {unread.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">You're all caught up.</div>
              ) : (
                unread.slice(0, 6).map(n => (
                  <div key={n.id} className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50">
                    <div className="mt-0.5">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                        n.severity === 'critical' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-gray-900">{n.title}</p>
                        <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{n.message}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          <CheckIcon className="h-4 w-4" /> Mark read
                        </button>
                        <button
                          onClick={() => deleteOne(n.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  CommandLineIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  unread: boolean;
}

interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  initials: string;
  email: string;
}

interface NavbarProps {
  user: UserProfile;
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  onProfileAction?: (action: 'profile' | 'settings' | 'logout') => void;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onSearch,
  onNotificationClick,
  onProfileAction,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Traffic Alert',
      message: 'Heavy congestion detected on Uhuru Highway',
      time: '2 min ago',
      type: 'warning',
      unread: true
    },
    {
      id: '2',
      title: 'System Update',
      message: 'AI traffic prediction model updated successfully',
      time: '15 min ago',
      type: 'success',
      unread: true
    },
    {
      id: '3',
      title: 'Route Optimization',
      message: 'New optimal route found for CBD area',
      time: '1 hour ago',
      type: 'info',
      unread: false
    },
    {
      id: '4',
      title: 'Incident Resolved',
      message: 'Road closure on Mombasa Road has been cleared',
      time: '2 hours ago',
      type: 'success',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'warning': return <span className={`${iconClass} text-yellow-500`}>⚠️</span>;
      case 'error': return <span className={`${iconClass} text-red-500`}>🚨</span>;
      case 'success': return <span className={`${iconClass} text-green-500`}>✅</span>;
      default: return <span className={`${iconClass} text-blue-500`}>ℹ️</span>;
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-lg ${className}`}
    >
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-blue-50/50 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Logo & Brand */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <MapPinIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  MoveSmart
                </h1>
                <span className="text-xs text-emerald-600 font-semibold tracking-wide">KENYA</span>
              </div>
            </div>
          </motion.div>

          {/* Center Section - Search */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
          >
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locations, routes, or incidents..."
                  className="w-full pl-12 pr-16 py-3.5 bg-white/80 border border-gray-200/60 rounded-2xl text-sm placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 
                           shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-gray-500 bg-gray-100/80 rounded border font-mono">
                    ⌘K
                  </kbd>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    <CommandLineIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Right Section - Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            
            {/* Current Time & System Status */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <ClockIcon className="w-4 h-4" />
                <span className="font-mono font-medium">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </span>
              </div>
              <div className="w-px h-5 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600 font-medium">System Online</span>
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </motion.button>

            {/* AI Assistant */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
            >
              <CpuChipIcon className="w-5 h-5 group-hover:animate-pulse" />
            </motion.button>

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </motion.div>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/60 backdrop-blur-xl overflow-hidden z-50"
                  >
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onNotificationClick?.(notification)}
                          className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <button className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div ref={profileRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 bg-white/80 border border-gray-200/60 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">{user.initials}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role}
                  </p>
                </div>
                
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/60 backdrop-blur-xl overflow-hidden z-50"
                  >
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold">{user.initials}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {[
                        { icon: UserCircleIcon, label: 'View Profile', action: 'profile' as const },
                        { icon: Cog6ToothIcon, label: 'Settings', action: 'settings' as const },
                        { icon: ArrowRightOnRectangleIcon, label: 'Sign Out', action: 'logout' as const, danger: true }
                      ].map((item, index) => (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            onProfileAction?.(item.action);
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

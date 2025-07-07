import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  FireIcon,
  SignalIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'traffic' | 'incident' | 'system' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  location?: string;
  relatedId?: string;
  category: 'traffic' | 'incidents' | 'system' | 'reports' | 'sustainability' | 'user' | 'security';
  metadata?: {
    route?: string;
    severity?: string;
    affectedArea?: string;
    estimatedDuration?: string;
    source?: string;
  };
}

interface NotificationFilters {
  category: string;
  type: string;
  priority: string;
  read: string;
  timeRange: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  trafficAlerts: boolean;
  incidentAlerts: boolean;
  systemUpdates: boolean;
  reportNotifications: boolean;
  sustainabilityUpdates: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'templates'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<NotificationFilters>({
    category: 'all',
    type: 'all',
    priority: 'all',
    read: 'all',
    timeRange: 'all'
  });

  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    trafficAlerts: true,
    incidentAlerts: true,
    systemUpdates: true,
    reportNotifications: false,
    sustainabilityUpdates: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '06:00'
    },
    frequency: 'immediate'
  });

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'traffic',
      priority: 'urgent',
      title: 'Heavy Traffic Alert',
      message: 'Severe congestion detected on Uhuru Highway. Expected delay: 25-30 minutes. Consider alternative routes.',
      timestamp: '2024-01-15T14:30:00Z',
      read: false,
      actionRequired: true,
      location: 'Uhuru Highway, CBD',
      category: 'traffic',
      metadata: {
        route: 'Uhuru Highway',
        severity: 'high',
        affectedArea: 'CBD to Westlands',
        estimatedDuration: '30 minutes',
        source: 'AI Traffic Analysis'
      }
    },
    {
      id: '2',
      type: 'incident',
      priority: 'high',
      title: 'Road Accident Reported',
      message: 'Multi-vehicle accident on Mombasa Road near Industrial Area. Emergency services dispatched.',
      timestamp: '2024-01-15T13:45:00Z',
      read: false,
      actionRequired: false,
      location: 'Mombasa Road, Industrial Area',
      category: 'incidents',
      metadata: {
        severity: 'high',
        affectedArea: 'Mombasa Road',
        source: 'User Report'
      }
    },
    {
      id: '3',
      type: 'system',
      priority: 'medium',
      title: 'AI Model Updated',
      message: 'Traffic prediction model has been updated with improved accuracy. Expect better route recommendations.',
      timestamp: '2024-01-15T12:00:00Z',
      read: true,
      actionRequired: false,
      category: 'system',
      metadata: {
        source: 'System Maintenance'
      }
    },
    {
      id: '4',
      type: 'success',
      priority: 'low',
      title: 'Weekly Report Generated',
      message: 'Your weekly traffic analysis report is ready for download. View insights on your commute patterns.',
      timestamp: '2024-01-15T09:00:00Z',
      read: false,
      actionRequired: true,
      category: 'reports',
      metadata: {
        source: 'Report Generator'
      }
    },
    {
      id: '5',
      type: 'info',
      priority: 'medium',
      title: 'Sustainability Goal Update',
      message: 'You\'re 85% towards your monthly CO2 reduction goal! Keep using eco-friendly routes.',
      timestamp: '2024-01-15T08:30:00Z',
      read: true,
      actionRequired: false,
      category: 'sustainability',
      metadata: {
        source: 'Sustainability Tracker'
      }
    },
    {
      id: '6',
      type: 'warning',
      priority: 'medium',
      title: 'Weather Alert',
      message: 'Heavy rainfall expected between 3-6 PM. Road flooding possible in low-lying areas.',
      timestamp: '2024-01-15T08:00:00Z',
      read: false,
      actionRequired: true,
      location: 'Nairobi Metropolitan',
      category: 'traffic',
      metadata: {
        severity: 'medium',
        estimatedDuration: '3 hours',
        source: 'Weather Service'
      }
    },
    {
      id: '7',
      type: 'info',
      priority: 'low',
      title: 'Profile Settings Updated',
      message: 'Your notification preferences have been successfully updated.',
      timestamp: '2024-01-14T16:45:00Z',
      read: true,
      actionRequired: false,
      category: 'user',
      metadata: {
        source: 'User Settings'
      }
    },
    {
      id: '8',
      type: 'alert',
      priority: 'high',
      title: 'Security Alert',
      message: 'New login detected from an unrecognized device. If this wasn\'t you, please secure your account.',
      timestamp: '2024-01-14T14:20:00Z',
      read: false,
      actionRequired: true,
      category: 'security',
      metadata: {
        source: 'Security Monitor'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading notifications
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'traffic': return TruckIcon;
      case 'incident': return ExclamationTriangleIcon;
      case 'system': return CogIcon;
      case 'alert': return BellAlertIcon;
      case 'info': return InformationCircleIcon;
      case 'success': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'error': return XCircleIcon;
      default: return BellIcon;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200';
    
    switch (type) {
      case 'traffic': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'incident': return 'text-red-600 bg-red-50 border-red-200';
      case 'system': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'alert': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'traffic': return TruckIcon;
      case 'incidents': return ExclamationTriangleIcon;
      case 'system': return CogIcon;
      case 'reports': return DocumentTextIcon;
      case 'sustainability': return GlobeAltIcon;
      case 'user': return UserIcon;
      case 'security': return ShieldCheckIcon;
      default: return BellIcon;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    toast.success('Notification marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && notification.category !== filters.category) return false;
    
    // Type filter
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    
    // Priority filter
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
    
    // Read status filter
    if (filters.read !== 'all') {
      if (filters.read === 'read' && !notification.read) return false;
      if (filters.read === 'unread' && notification.read) return false;
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const notificationTime = new Date(notification.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60);
      
      switch (filters.timeRange) {
        case 'today':
          if (diffHours > 24) return false;
          break;
        case 'week':
          if (diffHours > 168) return false;
          break;
        case 'month':
          if (diffHours > 720) return false;
          break;
      }
    }

    return true;
  });

  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const urgent = notifications.filter(n => n.priority === 'urgent').length;
    const actionRequired = notifications.filter(n => n.actionRequired && !n.read).length;

    return { total, unread, urgent, actionRequired };
  };

  const stats = getNotificationStats();

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Settings updated');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              <p className="text-gray-600">Manage your alerts and system notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Mark All Read</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <BellIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center space-x-2 mb-2">
              <EyeSlashIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Unread</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{stats.unread}</div>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center space-x-2 mb-2">
              <BellAlertIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Urgent</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{stats.urgent}</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Action Required</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{stats.actionRequired}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon },
            { id: 'templates', label: 'Templates', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearAllNotifications}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
              >
                <TrashIcon className="w-4 h-4" />
                <span className="text-sm">Clear All</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="traffic">Traffic</option>
                    <option value="incidents">Incidents</option>
                    <option value="system">System</option>
                    <option value="reports">Reports</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="user">User</option>
                    <option value="security">Security</option>
                  </select>

                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="traffic">Traffic</option>
                    <option value="incident">Incident</option>
                    <option value="system">System</option>
                    <option value="alert">Alert</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>

                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={filters.read}
                    onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
                  </select>

                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type);
                const CategoryIcon = getCategoryIcon(notification.category);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-gray-300 shadow-sm'
                    }`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Notification Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            {notification.actionRequired && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-700 bg-orange-100">
                                Action Required
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-3 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <CategoryIcon className="w-3 h-3" />
                              <span className="capitalize">{notification.category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
                            </div>
                            {notification.location && (
                              <div className="flex items-center space-x-1">
                                <MapPinIcon className="w-3 h-3" />
                                <span>{notification.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
          
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">General Preferences</h4>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
                  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{setting.label}</h5>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange(setting.key as keyof NotificationSettings, !settings[setting.key as keyof NotificationSettings])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[setting.key as keyof NotificationSettings]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[setting.key as keyof NotificationSettings]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Settings */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Category Preferences</h4>
              <div className="space-y-4">
                {[
                  { key: 'trafficAlerts', label: 'Traffic Alerts', description: 'Get notified about traffic conditions' },
                  { key: 'incidentAlerts', label: 'Incident Alerts', description: 'Receive alerts about road incidents' },
                  { key: 'systemUpdates', label: 'System Updates', description: 'Get updates about system changes' },
                  { key: 'reportNotifications', label: 'Report Notifications', description: 'Notifications about generated reports' },
                  { key: 'sustainabilityUpdates', label: 'Sustainability Updates', description: 'Updates on your environmental impact' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{setting.label}</h5>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange(setting.key as keyof NotificationSettings, !settings[setting.key as keyof NotificationSettings])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[setting.key as keyof NotificationSettings]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[setting.key as keyof NotificationSettings]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quiet Hours</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Enable Quiet Hours</h5>
                    <p className="text-sm text-gray-600">Suppress non-urgent notifications during specified hours</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSettingChange('quietHours', { ...settings.quietHours, enabled: !settings.quietHours.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
                
                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => handleSettingChange('quietHours', { ...settings.quietHours, start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => handleSettingChange('quietHours', { ...settings.quietHours, end: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Frequency Settings */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Notification Frequency</h4>
              <div className="space-y-3">
                {[
                  { value: 'immediate', label: 'Immediate', description: 'Receive notifications as they happen' },
                  { value: 'hourly', label: 'Hourly', description: 'Receive hourly digest of notifications' },
                  { value: 'daily', label: 'Daily', description: 'Receive daily summary of notifications' },
                  { value: 'weekly', label: 'Weekly', description: 'Receive weekly summary of notifications' }
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSettingChange('frequency', option.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      settings.frequency === option.value
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        settings.frequency === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {settings.frequency === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{option.label}</h5>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Templates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Traffic Alert Template',
                description: 'Standard template for traffic congestion alerts',
                category: 'traffic',
                icon: TruckIcon,
                color: 'blue'
              },
              {
                title: 'Incident Report Template',
                description: 'Template for road incident notifications',
                category: 'incidents',
                icon: ExclamationTriangleIcon,
                color: 'red'
              },
              {
                title: 'System Update Template',
                description: 'Template for system maintenance notifications',
                category: 'system',
                icon: CogIcon,
                color: 'purple'
              },
              {
                title: 'Weather Alert Template',
                description: 'Template for weather-related traffic alerts',
                category: 'weather',
                icon: CloudIcon,
                color: 'gray'
              },
              {
                title: 'Report Ready Template',
                description: 'Template for report generation notifications',
                category: 'reports',
                icon: DocumentTextIcon,
                color: 'green'
              },
              {
                title: 'Security Alert Template',
                description: 'Template for security-related notifications',
                category: 'security',
                icon: ShieldCheckIcon,
                color: 'orange'
              }
            ].map((template, index) => (
              <motion.div
                key={template.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 bg-${template.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <template.icon className={`w-6 h-6 text-${template.color}-600`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-${template.color}-700 bg-${template.color}-100`}>
                    {template.category}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit Template
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getNotificationColor(selectedNotification.type, selectedNotification.priority)}`}>
                    {React.createElement(getNotificationIcon(selectedNotification.type), { className: "w-6 h-6" })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedNotification.title}</h4>
                    <p className="text-gray-700 mb-4">{selectedNotification.message}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Type:</span>
                        <span className="ml-2 text-gray-600 capitalize">{selectedNotification.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Priority:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                          {selectedNotification.priority}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Category:</span>
                        <span className="ml-2 text-gray-600 capitalize">{selectedNotification.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Time:</span>
                        <span className="ml-2 text-gray-600">{new Date(selectedNotification.timestamp).toLocaleString()}</span>
                      </div>
                      {selectedNotification.location && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-900">Location:</span>
                          <span className="ml-2 text-gray-600">{selectedNotification.location}</span>
                        </div>
                      )}
                    </div>

                    {selectedNotification.metadata && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Additional Information</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="ml-2 text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {!selectedNotification.read && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        markAsRead(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Mark as Read
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      deleteNotification(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;

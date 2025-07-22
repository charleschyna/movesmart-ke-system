import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  PencilIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  ChartBarIcon,
  TruckIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  CogIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { User, NotificationPreferences } from '../../types';
import { toast } from 'react-hot-toast';

interface ProfileStats {
  totalTrips: number;
  co2Saved: number;
  timesSaved: number;
  reportsGenerated: number;
  averageRating: number;
  memberSince: string;
}

interface ActivityItem {
  id: string;
  type: 'trip' | 'report' | 'incident' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'activity' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Get dynamic user data from localStorage
  const [profileData, setProfileData] = useState<User>(() => {
    // Try to get user from demo storage (from signup)
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      return {
        id: userData.id?.toString() || '1',
        email: userData.email,
        name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userData.username,
        defaultCity: 'Nairobi',
        savedRoutes: [],
        notificationPreferences: {
          emailNotifications: true,
          pushNotifications: true,
          trafficAlerts: true,
          incidentAlerts: true,
          routeUpdates: false
        },
        createdAt: new Date().toISOString()
      };
    }
    
    // Try to get user from regular auth storage
    const authUser = localStorage.getItem('user');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        return {
          id: userData.id?.toString() || '1',
          email: userData.email,
          name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userData.username,
          defaultCity: 'Nairobi',
          savedRoutes: [],
          notificationPreferences: {
            emailNotifications: true,
            pushNotifications: true,
            trafficAlerts: true,
            incidentAlerts: true,
            routeUpdates: false
          },
          createdAt: userData.createdAt || new Date().toISOString()
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Fallback to demo user
    return {
      id: '1',
      email: 'demo@movesmart.ke',
      name: 'Demo User',
      defaultCity: 'Nairobi',
      savedRoutes: [],
      notificationPreferences: {
        emailNotifications: true,
        pushNotifications: true,
        trafficAlerts: true,
        incidentAlerts: true,
        routeUpdates: false
      },
      createdAt: new Date().toISOString()
    };
  });

  const [editData, setEditData] = useState(() => ({
    name: profileData.name,
    email: profileData.email,
    phone: '+254 712 345 678',
    location: 'Nairobi, Kenya',
    bio: 'Traffic analyst passionate about smart city solutions and sustainable transportation.',
    company: 'MoveSmart Kenya',
    role: 'Traffic Analyst'
  }));

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Mock stats data
  const profileStats: ProfileStats = {
    totalTrips: 1247,
    co2Saved: 342.8, // kg
    timesSaved: 156, // hours
    reportsGenerated: 89,
    averageRating: 4.8,
    memberSince: '2023-06-15'
  };

  // Mock activity data
  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'trip',
      title: 'Optimized Route Taken',
      description: 'CBD to Westlands - Saved 12 minutes',
      timestamp: '2024-01-15T14:30:00Z',
      icon: '🚗'
    },
    {
      id: '2',
      type: 'report',
      title: 'Traffic Report Generated',
      description: 'Uhuru Highway - Morning congestion analysis',
      timestamp: '2024-01-15T09:15:00Z',
      icon: '📊'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Eco Warrior Badge Earned',
      description: 'Reduced CO2 emissions by 50kg this month',
      timestamp: '2024-01-14T16:45:00Z',
      icon: '🌱'
    },
    {
      id: '4',
      type: 'incident',
      title: 'Incident Reported',
      description: 'Road closure on Mombasa Road',
      timestamp: '2024-01-14T11:20:00Z',
      icon: '⚠️'
    }
  ];

  const handleSaveProfile = () => {
    // Simulate API call
    setTimeout(() => {
      setProfileData(prev => ({
        ...prev,
        name: editData.name,
        email: editData.email
      }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }, 1000);
  };

  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    setProfileData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
    toast.success('Notification preferences updated!');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      toast.success('Password updated successfully!');
    }, 1000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trip': return TruckIcon;
      case 'report': return ChartBarIcon;
      case 'incident': return ExclamationTriangleIcon;
      case 'achievement': return StarIcon;
      default: return InformationCircleIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'trip': return 'text-blue-600 bg-blue-50';
      case 'report': return 'text-green-600 bg-green-50';
      case 'incident': return 'text-red-600 bg-red-50';
      case 'achievement': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{profileData.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50"
              >
                <CameraIcon className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
              <p className="text-gray-600">{editData.role}</p>
              <p className="text-sm text-emerald-600 font-medium">{editData.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-900">{profileStats.averageRating}</span>
              </div>
              <p className="text-xs text-gray-500">Member since {new Date(profileStats.memberSince).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Trips</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{profileStats.totalTrips.toLocaleString()}</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <GlobeAltIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">CO₂ Saved</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{profileStats.co2Saved}kg</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Time Saved</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{profileStats.timesSaved}h</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Reports</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{profileStats.reportsGenerated}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-6">
          {[
            { id: 'profile', label: 'Profile Info', icon: UserIcon },
            { id: 'preferences', label: 'Preferences', icon: CogIcon },
            { id: 'activity', label: 'Recent Activity', icon: ClockIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isEditing
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditing ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{editData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{editData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{editData.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{editData.location}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.company}
                    onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{editData.company}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.role}
                    onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{editData.role}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tell us about yourself..."
              />
            </div>
          )}

          {!isEditing && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">{editData.bio}</span>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
          
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
              { key: 'trafficAlerts', label: 'Traffic Alerts', description: 'Get notified about traffic conditions' },
              { key: 'incidentAlerts', label: 'Incident Alerts', description: 'Receive alerts about road incidents' },
              { key: 'routeUpdates', label: 'Route Updates', description: 'Get updates about your saved routes' }
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{pref.label}</h4>
                  <p className="text-sm text-gray-600">{pref.description}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNotificationChange(pref.key as keyof NotificationPreferences)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    profileData.notificationPreferences[pref.key as keyof NotificationPreferences]
                      ? 'bg-emerald-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profileData.notificationPreferences[pref.key as keyof NotificationPreferences]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl">{activity.icon}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">Last updated 30 days ago</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                >
                  <KeyIcon className="w-4 h-4" />
                  <span>Change Password</span>
                </motion.button>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Account Security</h4>
                  <p className="text-sm text-green-700">Your account is secure and protected</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
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
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                >
                  Update Password
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;

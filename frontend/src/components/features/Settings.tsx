import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  MapPinIcon,
  LanguageIcon,
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  CloudIcon,
  ChartBarIcon,
  WifiIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CameraIcon,
  FolderIcon,
  ServerIcon,
  CircleStackIcon,
  BeakerIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    timezone: string;
    language: string;
    defaultCity: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    traffic: boolean;
    incidents: boolean;
    system: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    locationTracking: boolean;
    dataSharing: boolean;
    analytics: boolean;
    personalizedContent: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'green' | 'blue' | 'purple' | 'orange';
    compactMode: boolean;
    animations: boolean;
  };
  data: {
    cacheSize: string;
    lastBackup: string;
    autoBackup: boolean;
    dataRetention: '30' | '90' | '365' | 'forever';
  };
  advanced: {
    developerMode: boolean;
    apiLogging: boolean;
    debugMode: boolean;
    experimentalFeatures: boolean;
  };
}

interface SystemInfo {
  version: string;
  buildNumber: string;
  lastUpdate: string;
  platform: string;
  browser: string;
  deviceId: string;
}

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'appearance' | 'data' | 'advanced' | 'about'>('general');
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: 'Charles Chyna',
      email: 'charles.chyna@movesmart.ke',
      phone: '+254 712 345 678',
      timezone: 'Africa/Nairobi',
      language: 'en',
      defaultCity: 'Nairobi'
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      traffic: true,
      incidents: true,
      system: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '06:00'
      }
    },
    privacy: {
      locationTracking: true,
      dataSharing: false,
      analytics: true,
      personalizedContent: true
    },
    appearance: {
      theme: theme,
      colorScheme: 'green',
      compactMode: false,
      animations: true
    },
    data: {
      cacheSize: '125 MB',
      lastBackup: '2024-01-15T10:30:00Z',
      autoBackup: true,
      dataRetention: '365'
    },
    advanced: {
      developerMode: false,
      apiLogging: false,
      debugMode: false,
      experimentalFeatures: false
    }
  });

  const [systemInfo] = useState<SystemInfo>({
    version: '2.1.0',
    buildNumber: '2024.01.15.001',
    lastUpdate: '2024-01-15T08:00:00Z',
    platform: 'Web Application',
    browser: 'Chrome 120.0.0.0',
    deviceId: 'web_' + Math.random().toString(36).substr(2, 9)
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    // Special handling for theme changes
    if (section === 'appearance' && key === 'theme') {
      setTheme(value);
    }
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    toast.success('Setting updated');
  };

  const handleNestedSettingChange = (section: keyof UserSettings, parentKey: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...(prev[section] as any)[parentKey],
          [key]: value
        }
      }
    }));
    toast.success('Setting updated');
  };

  const handleResetSettings = () => {
    setLoading(true);
    setTimeout(() => {
      // Reset to default settings
      setSettings({
        profile: {
          name: 'Charles Chyna',
          email: 'charles.chyna@movesmart.ke',
          phone: '+254 712 345 678',
          timezone: 'Africa/Nairobi',
          language: 'en',
          defaultCity: 'Nairobi'
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          traffic: true,
          incidents: true,
          system: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '06:00'
          }
        },
        privacy: {
          locationTracking: true,
          dataSharing: false,
          analytics: true,
          personalizedContent: true
        },
        appearance: {
          theme: 'light',
          colorScheme: 'green',
          compactMode: false,
          animations: true
        },
        data: {
          cacheSize: '0 MB',
          lastBackup: new Date().toISOString(),
          autoBackup: true,
          dataRetention: '365'
        },
        advanced: {
          developerMode: false,
          apiLogging: false,
          debugMode: false,
          experimentalFeatures: false
        }
      });
      setShowResetModal(false);
      setLoading(false);
      toast.success('Settings reset to defaults');
    }, 2000);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `movesmart-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported successfully');
    setShowExportModal(false);
  };

  const clearCache = () => {
    setLoading(true);
    setTimeout(() => {
      handleSettingChange('data', 'cacheSize', '0 MB');
      setLoading(false);
      toast.success('Cache cleared successfully');
    }, 1500);
  };

  const triggerBackup = () => {
    setLoading(true);
    setTimeout(() => {
      handleSettingChange('data', 'lastBackup', new Date().toISOString());
      setLoading(false);
      toast.success('Backup completed successfully');
    }, 2000);
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
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your application preferences and configuration</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>Export Settings</span>
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'general', label: 'General', icon: UserIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
            { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
            { id: 'data', label: 'Data', icon: CircleStackIcon },
            { id: 'advanced', label: 'Advanced', icon: BeakerIcon },
            { id: 'about', label: 'About', icon: InformationCircleIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
          
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Profile Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default City</label>
                  <select
                    value={settings.profile.defaultCity}
                    onChange={(e) => handleSettingChange('profile', 'defaultCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Eldoret">Eldoret</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Regional Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.profile.language}
                    onChange={(e) => handleSettingChange('profile', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="sw">Kiswahili</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.profile.timezone}
                    onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
          
          <div className="space-y-6">
            {/* Delivery Methods */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Delivery Methods</h4>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email', icon: EnvelopeIcon },
                  { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications', icon: DevicePhoneMobileIcon },
                  { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS', icon: PhoneIcon }
                ].map((method) => (
                  <div key={method.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <method.icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <h5 className="font-medium text-gray-900">{method.label}</h5>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange('notifications', method.key, !settings.notifications[method.key as keyof typeof settings.notifications])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications[method.key as keyof typeof settings.notifications]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications[method.key as keyof typeof settings.notifications]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Types */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Notification Types</h4>
              <div className="space-y-4">
                {[
                  { key: 'traffic', label: 'Traffic Alerts', description: 'Get notified about traffic conditions and congestion' },
                  { key: 'incidents', label: 'Incident Alerts', description: 'Receive alerts about road incidents and closures' },
                  { key: 'system', label: 'System Updates', description: 'Get updates about system maintenance and new features' }
                ].map((type) => (
                  <div key={type.key} className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{type.label}</h5>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange('notifications', type.key, !settings.notifications[type.key as keyof typeof settings.notifications])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications[type.key as keyof typeof settings.notifications]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications[type.key as keyof typeof settings.notifications]
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
                    onClick={() => handleNestedSettingChange('notifications', 'quietHours', 'enabled', !settings.notifications.quietHours.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
                
                {settings.notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={settings.notifications.quietHours.start}
                        onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={settings.notifications.quietHours.end}
                        onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Security</h3>
          
          <div className="space-y-6">
            {/* Privacy Controls */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Privacy Controls</h4>
              <div className="space-y-4">
                {[
                  { 
                    key: 'locationTracking', 
                    label: 'Location Tracking', 
                    description: 'Allow the app to access your location for traffic updates',
                    icon: MapPinIcon,
                    color: 'text-blue-600'
                  },
                  { 
                    key: 'dataSharing', 
                    label: 'Data Sharing', 
                    description: 'Share anonymous usage data to improve the service',
                    icon: CloudIcon,
                    color: 'text-green-600'
                  },
                  { 
                    key: 'analytics', 
                    label: 'Analytics', 
                    description: 'Allow collection of analytics data for app improvement',
                    icon: ChartBarIcon,
                    color: 'text-purple-600'
                  },
                  { 
                    key: 'personalizedContent', 
                    label: 'Personalized Content', 
                    description: 'Show personalized recommendations based on your usage',
                    icon: SparklesIcon,
                    color: 'text-orange-600'
                  }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <setting.icon className={`w-5 h-5 ${setting.color}`} />
                      <div>
                        <h5 className="font-medium text-gray-900">{setting.label}</h5>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange('privacy', setting.key, !settings.privacy[setting.key as keyof typeof settings.privacy])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy[setting.key as keyof typeof settings.privacy]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy[setting.key as keyof typeof settings.privacy]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Security Status</h4>
                  <p className="text-sm text-green-700">Your data is encrypted and secure. Last security scan: Today</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance & Display</h3>
          
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Theme</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', label: 'Light', icon: SunIcon },
                  { value: 'dark', label: 'Dark', icon: MoonIcon },
                  { value: 'auto', label: 'Auto', icon: ComputerDesktopIcon }
                ].map((theme) => (
                  <motion.div
                    key={theme.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSettingChange('appearance', 'theme', theme.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      theme === theme.value
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <theme.icon className="w-8 h-8 text-gray-600" />
                      <span className="font-medium text-gray-900">{theme.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Color Scheme</h4>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: 'green', label: 'Green', color: 'bg-green-500' },
                  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
                  { value: 'orange', label: 'Orange', color: 'bg-orange-500' }
                ].map((scheme) => (
                  <motion.div
                    key={scheme.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSettingChange('appearance', 'colorScheme', scheme.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      settings.appearance.colorScheme === scheme.value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 ${scheme.color} rounded-full`} />
                      <span className="font-medium text-gray-900">{scheme.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Display Options</h4>
              <div className="space-y-4">
                {[
                  { key: 'compactMode', label: 'Compact Mode', description: 'Use more compact layout to show more content' },
                  { key: 'animations', label: 'Animations', description: 'Enable smooth animations and transitions' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{option.label}</h5>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange('appearance', option.key, !settings.appearance[option.key as keyof typeof settings.appearance])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.appearance[option.key as keyof typeof settings.appearance]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.appearance[option.key as keyof typeof settings.appearance]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
          
          <div className="space-y-6">
            {/* Storage Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Storage Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CircleStackIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Cache Size</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{settings.data.cacheSize}</div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearCache}
                    disabled={loading}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Clearing...' : 'Clear Cache'}
                  </motion.button>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ServerIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Last Backup</span>
                  </div>
                  <div className="text-sm text-gray-900">
                    {new Date(settings.data.lastBackup).toLocaleDateString()}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={triggerBackup}
                    disabled={loading}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Backing up...' : 'Backup Now'}
                  </motion.button>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Data Retention</span>
                  </div>
                  <select
                    value={settings.data.dataRetention}
                    onChange={(e) => handleSettingChange('data', 'dataRetention', e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Backup Settings */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Backup Settings</h4>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Automatic Backup</h5>
                  <p className="text-sm text-gray-600">Automatically backup your data weekly</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('data', 'autoBackup', !settings.data.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.data.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.data.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-4">Danger Zone</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-red-900">Reset All Settings</h5>
                    <p className="text-sm text-red-700">This will reset all settings to their default values</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowResetModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Reset Settings
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Advanced Settings</h3>
          
          <div className="space-y-6">
            {/* Developer Options */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Developer Options</h4>
              <div className="space-y-4">
                {[
                  { 
                    key: 'developerMode', 
                    label: 'Developer Mode', 
                    description: 'Enable developer tools and advanced features',
                    icon: CommandLineIcon
                  },
                  { 
                    key: 'apiLogging', 
                    label: 'API Logging', 
                    description: 'Log API requests and responses for debugging',
                    icon: DocumentTextIcon
                  },
                  { 
                    key: 'debugMode', 
                    label: 'Debug Mode', 
                    description: 'Show detailed error messages and debug information',
                    icon: BeakerIcon
                  },
                  { 
                    key: 'experimentalFeatures', 
                    label: 'Experimental Features', 
                    description: 'Enable experimental features (may be unstable)',
                    icon: SparklesIcon
                  }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <setting.icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <h5 className="font-medium text-gray-900">{setting.label}</h5>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSettingChange('advanced', setting.key, !settings.advanced[setting.key as keyof typeof settings.advanced])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.advanced[setting.key as keyof typeof settings.advanced]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.advanced[setting.key as keyof typeof settings.advanced]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">System Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Device ID:</span>
                    <span className="text-sm font-mono text-gray-900">{systemInfo.deviceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform:</span>
                    <span className="text-sm text-gray-900">{systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Browser:</span>
                    <span className="text-sm text-gray-900">{systemInfo.browser}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Version:</span>
                    <span className="text-sm text-gray-900">{systemInfo.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Build:</span>
                    <span className="text-sm font-mono text-gray-900">{systemInfo.buildNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Update:</span>
                    <span className="text-sm text-gray-900">{new Date(systemInfo.lastUpdate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">About MoveSmart Kenya</h3>
          
          <div className="space-y-6">
            {/* App Info */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">MoveSmart Kenya</h4>
              <p className="text-lg text-gray-600 mb-4">Version {systemInfo.version}</p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Smart traffic management and route optimization platform for Kenya. 
                Empowering commuters with AI-powered insights and real-time traffic data.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <SignalIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">Real-time Data</h5>
                <p className="text-sm text-gray-600">Live traffic updates and incident reporting</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BeakerIcon className="w-6 h-6 text-green-600" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">AI-Powered</h5>
                <p className="text-sm text-gray-600">Machine learning for predictive analytics</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GlobeAltIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">Sustainable</h5>
                <p className="text-sm text-gray-600">Promoting eco-friendly transportation</p>
              </div>
            </div>

            {/* Legal */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Legal Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>© 2024 MoveSmart Kenya. All rights reserved.</p>
                <div className="flex space-x-4">
                  <button className="text-blue-600 hover:text-blue-700">Privacy Policy</button>
                  <button className="text-blue-600 hover:text-blue-700">Terms of Service</button>
                  <button className="text-blue-600 hover:text-blue-700">Open Source Licenses</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reset Settings Modal */}
      <AnimatePresence>
        {showResetModal && (
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reset All Settings</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset all settings to their default values? 
                This will clear all your preferences and customizations.
              </p>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetSettings}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Settings'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Settings Modal */}
      <AnimatePresence>
        {showExportModal && (
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Export Settings</h3>
                  <p className="text-sm text-gray-600">Download your configuration</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                This will download a JSON file containing all your current settings. 
                You can use this file to restore your preferences later.
              </p>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Download Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;

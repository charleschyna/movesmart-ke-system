import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';

const NavbarDemo: React.FC = () => {
  // Mock user data
  const mockUser = {
    name: 'Charles Chyna',
    role: 'Traffic Analyst',
    avatar: '/api/placeholder/40/40',
    initials: 'CC',
    email: 'charles.chyna@movesmart.ke'
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Handle search logic here
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
    // Handle notification click logic here
  };

  const handleProfileAction = (action: 'profile' | 'settings' | 'logout') => {
    console.log('Profile action:', action);
    // Handle profile actions here
    switch (action) {
      case 'profile':
        // Navigate to profile page
        break;
      case 'settings':
        // Navigate to settings page
        break;
      case 'logout':
        // Handle logout
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      {/* Modern Navbar */}
      <Navbar
        user={mockUser}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        onProfileAction={handleProfileAction}
      />

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Cool Modern Navbar Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            This navbar features a modern glassmorphism design with interactive elements, 
            real-time notifications, profile dropdown, search functionality, and smooth animations.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              {
                title: 'Interactive Search',
                description: 'Advanced search with keyboard shortcuts and real-time suggestions',
                icon: '🔍',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Smart Notifications',
                description: 'Real-time alerts with categorized notifications and unread counts',
                icon: '🔔',
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Profile Management',
                description: 'Dropdown with profile actions, settings, and quick logout',
                icon: '👤',
                color: 'from-emerald-500 to-teal-500'
              },
              {
                title: 'Dark Mode Toggle',
                description: 'Seamless theme switching with system preference detection',
                icon: '🌙',
                color: 'from-gray-500 to-gray-700'
              },
              {
                title: 'AI Assistant',
                description: 'Quick access to AI-powered traffic insights and recommendations',
                icon: '🤖',
                color: 'from-orange-500 to-red-500'
              },
              {
                title: 'Live Status',
                description: 'Real-time system status, current time, and connection indicators',
                icon: '📊',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Try the Interactive Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Search Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click the search bar or press ⌘K</li>
                  <li>• Type to search locations, routes, or incidents</li>
                  <li>• Submit with Enter or click the command icon</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notifications:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click the bell icon to view notifications</li>
                  <li>• See unread count badge</li>
                  <li>• Click individual notifications</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Profile Menu:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click your profile to open dropdown</li>
                  <li>• Access profile, settings, or logout</li>
                  <li>• View user details and status</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Other Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Toggle dark/light mode</li>
                  <li>• Access AI assistant</li>
                  <li>• View live system status</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NavbarDemo;

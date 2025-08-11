import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  SignalIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  MapPinIcon,
  BoltIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Mock data for traffic signals
const mockSignals = [
  {
    id: 'TL001',
    name: 'Kenyatta Ave & Uhuru Highway',
    status: 'online',
    mode: 'automatic',
    currentPhase: 'green-ns',
    timeRemaining: 42,
    cycleTime: 120,
    location: { lat: -1.2921, lng: 36.8219 },
    lastUpdate: '2 mins ago'
  },
  {
    id: 'TL002', 
    name: 'Tom Mboya St & Haile Selassie Ave',
    status: 'online',
    mode: 'manual',
    currentPhase: 'yellow-ew',
    timeRemaining: 8,
    cycleTime: 90,
    location: { lat: -1.2840, lng: 36.8238 },
    lastUpdate: '1 min ago'
  },
  {
    id: 'TL003',
    name: 'Moi Ave & University Way',
    status: 'offline',
    mode: 'automatic',
    currentPhase: 'red-all',
    timeRemaining: 0,
    cycleTime: 100,
    location: { lat: -1.2906, lng: 36.8206 },
    lastUpdate: '15 mins ago'
  },
  {
    id: 'TL004',
    name: 'Jogoo Rd & Landhies Rd',
    status: 'maintenance',
    mode: 'flashing',
    currentPhase: 'yellow-flash',
    timeRemaining: 30,
    cycleTime: 110,
    location: { lat: -1.2884, lng: 36.8511 },
    lastUpdate: '5 mins ago'
  }
];

import { useAuth } from '../../contexts/AuthContext';

const TrafficSignalControl: React.FC = () => {
  const { hasPerm } = useAuth();
  if (!hasPerm('control:write')) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Traffic Signal Control</h2>
          <p className="text-gray-600">You do not have permission to control traffic signals.</p>
        </div>
      </div>
    );
  }
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [overrideMode, setOverrideMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'timing'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseColor = (phase: string) => {
    if (phase.includes('green')) return 'bg-green-500';
    if (phase.includes('yellow')) return 'bg-yellow-500';
    if (phase.includes('red')) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="w-5 h-5" />;
      case 'offline': return <XCircleIcon className="w-5 h-5" />;
      case 'maintenance': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Traffic Signal Control</h2>
            <p className="text-gray-600">Monitor and manage traffic signals across the city</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">System Online</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Online</span>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-1">2</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Offline</span>
            </div>
            <p className="text-2xl font-bold text-red-800 mt-1">1</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Maintenance</span>
            </div>
            <p className="text-2xl font-bold text-yellow-800 mt-1">1</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <BoltIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Manual Mode</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-1">1</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Signal Overview', icon: SignalIcon },
              { id: 'control', label: 'Manual Control', icon: Cog6ToothIcon },
              { id: 'timing', label: 'Timing Settings', icon: ClockIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Traffic Signals</h3>
              <div className="grid gap-4">
                {mockSignals.map((signal) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedSignal(selectedSignal === signal.id ? null : signal.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{signal.name}</h4>
                            <p className="text-sm text-gray-500">{signal.id}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Signal Phase Indicator */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${getPhaseColor(signal.currentPhase)}`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {signal.timeRemaining}s
                          </span>
                        </div>
                        
                        {/* Status */}
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(signal.status)
                        }`}>
                          {getStatusIcon(signal.status)}
                          <span className="capitalize">{signal.status}</span>
                        </div>
                        
                        {/* Mode */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          signal.mode === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {signal.mode}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedSignal === signal.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Cycle Time:</span>
                            <p className="font-medium">{signal.cycleTime}s</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Current Phase:</span>
                            <p className="font-medium capitalize">{signal.currentPhase.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Update:</span>
                            <p className="font-medium">{signal.lastUpdate}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'control' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Manual Override Controls</h3>
                <button
                  onClick={() => setOverrideMode(!overrideMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                    overrideMode
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {overrideMode ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  <span>{overrideMode ? 'Disable Override' : 'Enable Override'}</span>
                </button>
              </div>

              {overrideMode ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Manual Override Active</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-4">
                    You have manual control over selected traffic signals. Use with caution.
                  </p>
                  
                  {/* Manual Control Interface */}
                  <div className="grid grid-cols-2 gap-4">
                    {mockSignals.filter(s => s.status === 'online').map((signal) => (
                      <div key={signal.id} className="bg-white p-4 rounded-lg border">
                        <h5 className="font-medium text-gray-900 mb-3">{signal.name}</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium">
                            Green NS
                          </button>
                          <button className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium">
                            Green EW
                          </button>
                          <button className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">
                            Yellow All
                          </button>
                          <button className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">
                            Red All
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Cog6ToothIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enable override mode to manually control traffic signals</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Signal Timing Configuration</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Timing Optimization</h4>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Adjust signal timings based on traffic flow patterns and peak hours.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Peak Hours (07:00 - 09:00)</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cycle Time:</span>
                        <span className="text-sm font-medium">150s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Green Time (NS):</span>
                        <span className="text-sm font-medium">65s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Green Time (EW):</span>
                        <span className="text-sm font-medium">70s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Off-Peak Hours</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cycle Time:</span>
                        <span className="text-sm font-medium">90s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Green Time (NS):</span>
                        <span className="text-sm font-medium">35s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Green Time (EW):</span>
                        <span className="text-sm font-medium">40s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficSignalControl;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
  TruckIcon,
  CloudIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PhotoIcon,
  FireIcon,
  SignalIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Incident } from '../../types';
import { toast } from 'react-hot-toast';

interface IncidentForm {
  type: 'accident' | 'police' | 'roadworks' | 'weather' | 'other';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  severity: 'low' | 'medium' | 'high';
  photo?: File | null;
}

interface IncidentFilters {
  type: string;
  severity: string;
  timeRange: string;
  location: string;
  status: string;
}

const IncidentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all' | 'map' | 'analytics'>('pending');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<IncidentFilters>({
    type: 'all',
    severity: 'all',
    timeRange: 'today',
    location: 'all',
    status: 'all'
  });

  const [incidentForm, setIncidentForm] = useState<IncidentForm>({
    type: 'accident',
    location: {
      lat: -1.2921,
      lng: 36.8219,
      address: ''
    },
    description: '',
    severity: 'medium',
    photo: null
  });

  // Mock incidents data
  const mockIncidents: Incident[] = [
    {
      id: '1',
      type: 'accident',
      location: { lat: -1.2921, lng: 36.8219, address: 'Uhuru Highway, CBD' },
      description: 'Multi-vehicle collision blocking two lanes. Emergency services on scene.',
      severity: 'high',
      timestamp: '2024-01-15T14:30:00Z',
      userId: 'user1',
      verified: true,
      photo: '/api/placeholder/300/200'
    },
    {
      id: '2',
      type: 'roadworks',
      location: { lat: -1.3032, lng: 36.8083, address: 'Mombasa Road, Industrial Area' },
      description: 'Road maintenance in progress. Expect delays for the next 3 hours.',
      severity: 'medium',
      timestamp: '2024-01-15T08:00:00Z',
      userId: 'user2',
      verified: true
    },
    {
      id: '3',
      type: 'weather',
      location: { lat: -1.2865, lng: 36.8172, address: 'Kenyatta Avenue' },
      description: 'Heavy rainfall causing flooding. Road partially impassable.',
      severity: 'high',
      timestamp: '2024-01-15T12:15:00Z',
      userId: 'user3',
      verified: false
    },
    {
      id: '4',
      type: 'police',
      location: { lat: -1.2884, lng: 36.8233, address: 'Harambee Avenue' },
      description: 'Police checkpoint in operation. Minor traffic delays expected.',
      severity: 'low',
      timestamp: '2024-01-15T10:45:00Z',
      userId: 'user4',
      verified: true
    },
    {
      id: '5',
      type: 'other',
      location: { lat: -1.2795, lng: 36.8077, address: 'Waiyaki Way' },
      description: 'Broken down vehicle in the left lane. Towing service contacted.',
      severity: 'medium',
      timestamp: '2024-01-15T16:20:00Z',
      userId: 'user5',
      verified: false
    }
  ];

  useEffect(() => {
    // Simulate loading incidents
    setLoading(true);
    setTimeout(() => {
      setIncidents(mockIncidents);
      setLoading(false);
    }, 1000);
  }, []);

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'accident': return ExclamationTriangleIcon;
      case 'police': return ShieldExclamationIcon;
      case 'roadworks': return WrenchScrewdriverIcon;
      case 'weather': return CloudIcon;
      case 'other': return ExclamationCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getIncidentColor = (type: string) => {
    switch (type) {
      case 'accident': return 'text-red-600 bg-red-50 border-red-200';
      case 'police': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'roadworks': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'weather': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'other': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const handleSubmitIncident = async () => {
    if (!incidentForm.location.address || !incidentForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newIncident: Incident = {
        id: Math.random().toString(36).substr(2, 9),
        type: incidentForm.type,
        location: incidentForm.location,
        description: incidentForm.description,
        severity: incidentForm.severity,
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        verified: false,
        photo: incidentForm.photo ? '/api/placeholder/300/200' : undefined
      };

      setIncidents(prev => [newIncident, ...prev]);
      setShowReportModal(false);
      setIncidentForm({
        type: 'accident',
        location: { lat: -1.2921, lng: 36.8219, address: '' },
        description: '',
        severity: 'medium',
        photo: null
      });
      
      toast.success('Incident reported successfully! Thank you for keeping the community informed.');
    } catch (error) {
      toast.error('Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo size must be less than 5MB');
        return;
      }
      setIncidentForm(prev => ({ ...prev, photo: file }));
      toast.success('Photo uploaded successfully');
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filters.type !== 'all' && incident.type !== filters.type) return false;
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'verified' && !incident.verified) return false;
      if (filters.status === 'unverified' && incident.verified) return false;
    }
    return true;
  });

  const getIncidentStats = () => {
    const total = incidents.length;
    const verified = incidents.filter(i => i.verified).length;
    const highSeverity = incidents.filter(i => i.severity === 'high').length;
    const recent = incidents.filter(i => {
      const incidentTime = new Date(i.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - incidentTime.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length;

    return { total, verified, highSeverity, recent };
  };

  const stats = getIncidentStats();

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
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Incident Management Dashboard</h1>
              <p className="text-gray-600">Review and manage traffic incidents reported by users</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live Dashboard</span>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
              <ArrowPathIcon className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Reports</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Verified</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.verified}</div>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">High Severity</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{stats.highSeverity}</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Last 24h</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{stats.recent}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'map', label: 'Live Map', icon: MapPinIcon },
            { id: 'list', label: 'Incident List', icon: InformationCircleIcon },
            { id: 'analytics', label: 'Analytics', icon: SignalIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Map Tab */}
      {activeTab === 'map' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Live Incident Map</h3>
            <div className="flex items-center space-x-3">
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

          {/* Map Container */}
          <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
              {/* Mock Map Grid */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }} />
              
              {/* Mock Roads */}
              <svg className="absolute inset-0 w-full h-full">
                <path d="M0 200 L800 200" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
                <path d="M200 0 L200 400" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
                <path d="M0 300 Q400 250 800 300" stroke="#6b7280" strokeWidth="2" opacity="0.6" />
                <path d="M100 0 Q450 200 600 400" stroke="#6b7280" strokeWidth="2" opacity="0.6" />
              </svg>

              {/* Incident Markers */}
              {incidents.slice(0, 5).map((incident, index) => {
                const IconComponent = getIncidentIcon(incident.type);
                return (
                  <motion.div
                    key={incident.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`
                    }}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${getIncidentColor(incident.type)} animate-pulse`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {incident.severity === 'high' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                  </motion.div>
                );
              })}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <span className="text-lg font-bold text-gray-700">+</span>
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <span className="text-lg font-bold text-gray-700">−</span>
                </button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Incident Types</h4>
                <div className="space-y-2">
                  {[
                    { type: 'accident', label: 'Accidents' },
                    { type: 'roadworks', label: 'Road Works' },
                    { type: 'weather', label: 'Weather' },
                    { type: 'police', label: 'Police' },
                    { type: 'other', label: 'Other' }
                  ].map(item => {
                    const IconComponent = getIncidentIcon(item.type);
                    return (
                      <div key={item.type} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${getIncidentColor(item.type)}`}>
                          <IconComponent className="w-2 h-2" />
                        </div>
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Incident Details */}
          <AnimatePresence>
            {selectedIncident && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIncidentColor(selectedIncident.type)}`}>
                        {React.createElement(getIncidentIcon(selectedIncident.type), { className: "w-4 h-4" })}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 capitalize">{selectedIncident.type} Incident</h4>
                        <p className="text-sm text-gray-600">{selectedIncident.location.address}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{selectedIncident.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Severity: <span className={`px-2 py-1 rounded-full ${getSeverityColor(selectedIncident.severity)}`}>{selectedIncident.severity}</span></span>
                      <span>Reported: {new Date(selectedIncident.timestamp).toLocaleString()}</span>
                      <span>{selectedIncident.verified ? '✅ Verified' : '⏳ Pending verification'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Incident List Tab */}
      {activeTab === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">All Incidents</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="accident">Accidents</option>
                <option value="roadworks">Road Works</option>
                <option value="weather">Weather</option>
                <option value="police">Police</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Incidents List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading incidents...</p>
              </div>
            ) : (
              filteredIncidents.map((incident, index) => {
                const IconComponent = getIncidentIcon(incident.type);
                return (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIncidentColor(incident.type)}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 capitalize">{incident.type} Incident</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            {incident.verified && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-3 h-3" />
                            <span>{incident.location.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{new Date(incident.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-3 h-3" />
                            <span>Reporter: {incident.userId}</span>
                          </div>
                        </div>
                      </div>
                      {incident.photo && (
                        <img
                          src={incident.photo}
                          alt="Incident"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Incident Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incident Types Chart */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Incidents by Type</h4>
              <div className="space-y-3">
                {['accident', 'roadworks', 'weather', 'police', 'other'].map(type => {
                  const count = incidents.filter(i => i.type === type).length;
                  const percentage = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${getIncidentColor(type)}`} />
                      <span className="flex-1 text-sm font-medium text-gray-700 capitalize">{type}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Severity Distribution</h4>
              <div className="space-y-3">
                {['high', 'medium', 'low'].map(severity => {
                  const count = incidents.filter(i => i.severity === severity).length;
                  const percentage = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
                  return (
                    <div key={severity} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${getSeverityColor(severity)}`} />
                      <span className="flex-1 text-sm font-medium text-gray-700 capitalize">{severity}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Incident Modal */}
      <AnimatePresence>
        {showReportModal && (
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
                <h3 className="text-lg font-semibold text-gray-900">Report New Incident</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Incident Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Incident Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { type: 'accident', label: 'Accident', icon: ExclamationTriangleIcon },
                      { type: 'roadworks', label: 'Road Works', icon: WrenchScrewdriverIcon },
                      { type: 'weather', label: 'Weather', icon: CloudIcon },
                      { type: 'police', label: 'Police', icon: ShieldExclamationIcon },
                      { type: 'other', label: 'Other', icon: ExclamationCircleIcon }
                    ].map(item => (
                      <motion.button
                        key={item.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIncidentForm(prev => ({ ...prev, type: item.type as any }))}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          incidentForm.type === item.type
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <item.icon className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={incidentForm.location.address}
                      onChange={(e) => setIncidentForm(prev => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value }
                      }))}
                      placeholder="Enter incident location (e.g., Uhuru Highway, CBD)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="Provide detailed description of the incident..."
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Severity Level</label>
                  <div className="flex space-x-3">
                    {[
                      { level: 'low', label: 'Low', color: 'green' },
                      { level: 'medium', label: 'Medium', color: 'yellow' },
                      { level: 'high', label: 'High', color: 'red' }
                    ].map(item => (
                      <motion.button
                        key={item.level}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIncidentForm(prev => ({ ...prev, severity: item.level as any }))}
                        className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                          incidentForm.severity === item.level
                            ? `border-${item.color}-300 bg-${item.color}-50 text-${item.color}-700`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {incidentForm.photo ? incidentForm.photo.name : 'Click to upload photo'}
                      </span>
                      <span className="text-xs text-gray-400">Maximum file size: 5MB</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitIncident}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Reporting...' : 'Report Incident'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentManagement;

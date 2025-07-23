import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MapIcon, 
  ChartBarIcon, 
  BeakerIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BellIcon,
  MapPinIcon,
  ClockIcon,
  LightBulbIcon,
  HomeIcon,
  ChevronRightIcon,
  UserIcon,
  GlobeAltIcon,
  ExclamationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { City, TrafficData, Incident } from '../../types';
import { DEFAULT_CITY, STORAGE_KEYS, KENYA_CITIES } from '../../constants';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import RouteOptimization from '../features/RouteOptimization';
import PredictiveAnalytics from '../features/PredictiveAnalytics';
import ScenarioSimulation from '../features/ScenarioSimulation';
import ReportsExports from '../features/ReportsExports';
import SustainabilityPanel from '../features/SustainabilityPanel';
import UserProfile from '../features/UserProfile';
import IncidentReporting from '../features/IncidentReporting';
import NotificationCenter from '../features/NotificationCenter';
import Settings from '../features/Settings';
import StatsCards from './StatsCards';
import TrafficReportSection from '../features/TrafficReportSection';
import AITrafficReports from '../features/AITrafficReports';
import IncidentsPage from '../incidents/IncidentsPage';

const Dashboard: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const citySelectorRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch real data from backend
      const [trafficResponse, incidentsResponse] = await Promise.all([
        apiService.getTrafficData(selectedCity.id),
        apiService.getIncidents(selectedCity.id)
      ]);

      if (trafficResponse.success) {
        setTrafficData(trafficResponse.data);
      } else {
        toast.error(trafficResponse.message || 'Failed to fetch traffic data.');
        setTrafficData(null);
      }

      if (incidentsResponse.success) {
        setIncidents(incidentsResponse.data);
      } else {
        // toast.error(incidentsResponse.message || 'Failed to fetch incidents data.');
        setIncidents([]);
      }
    } catch (error: any) {
      console.error('Backend data fetch failed:', error.message);
      toast.error('Failed to fetch real-time traffic data. Please check your connection.');
      setTrafficData(null);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity.id]);

  // Load selected city from localStorage
  useEffect(() => {
    const savedCityId = localStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
    if (savedCityId) {
      const city = KENYA_CITIES.find(c => c.id === savedCityId) || DEFAULT_CITY;
      setSelectedCity(city);
    }
  }, []);

  // Fetch data when city changes
  useEffect(() => {
    fetchDashboardData();
    // Save selected city
    localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, selectedCity.id);
  }, [selectedCity, fetchDashboardData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Close city selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySelectorRef.current && !citySelectorRef.current.contains(event.target as Node)) {
        setIsCitySelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateToAiReports = () => {
      setActiveNavItem('aiReports');
    };

    window.addEventListener('navigate-to-ai-reports', handleNavigateToAiReports);
    return () => window.removeEventListener('navigate-to-ai-reports', handleNavigateToAiReports);
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get TomTom API key from environment variables
    const tomTomApiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    
    if (!tomTomApiKey) {
      console.error('TomTom API key not found in environment variables');
      return;
    }

    // Create map style with TomTom tiles
    const mapStyle = {
      version: 8,
      sources: {
        'tomtom-base': {
          type: 'raster',
          tiles: [
            `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomTomApiKey}`
          ],
          tileSize: 256,
          attribution: '© TomTom'
        },
        'tomtom-traffic': {
          type: 'raster',
          tiles: [
            `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${tomTomApiKey}`
          ],
          tileSize: 256,
          attribution: '© TomTom Traffic'
        }
      },
      layers: [
        {
          id: 'base-tiles',
          type: 'raster',
          source: 'tomtom-base',
          minzoom: 0,
          maxzoom: 22
        },
        {
          id: 'traffic-tiles',
          type: 'raster',
          source: 'tomtom-traffic',
          minzoom: 0,
          maxzoom: 22,
          paint: {
            'raster-opacity': 0.8
          }
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: selectedCity.coordinates, // coordinates is [longitude, latitude]
      zoom: 12,
      pitch: 45,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add empty sources for traffic and incidents
    map.current.on('load', () => {
      if (!map.current) return;

      // Add traffic source for route data
      map.current.addSource('traffic', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add incidents source
      map.current.addSource('incidents', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add traffic layer for route overlays
      map.current.addLayer({
        id: 'traffic-layer',
        type: 'line',
        source: 'traffic',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'congestion'],
            'free', '#22c55e',
            'slow', '#eab308',
            'heavy', '#ef4444',
            '#6b7280'
          ],
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Add incidents layer
      map.current.addLayer({
        id: 'incidents-layer',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'low', '#22c55e',
            'medium', '#eab308',
            'high', '#ef4444',
            '#6b7280'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add click handler for incidents
      map.current.on('click', 'incidents-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const incident = e.features[0];
        const coordinates = (incident.geometry as any).coordinates.slice();
        const properties = incident.properties;

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2">
              <h4 class="font-semibold text-gray-900">${properties?.type || 'Incident'}</h4>
              <p class="text-sm text-gray-600">${properties?.description || 'No description'}</p>
              <p class="text-xs text-gray-500 mt-1">Severity: ${properties?.severity || 'Unknown'}</p>
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'incidents-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'incidents-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center when city changes
  useEffect(() => {
    if (!map.current) return;

    map.current.flyTo({
      center: selectedCity.coordinates, // coordinates is [longitude, latitude]
      zoom: 12,
      duration: 2000
    });
  }, [selectedCity]);

  // Update map with traffic and incidents data
  useEffect(() => {
    if (!map.current || !map.current.getSource('traffic')) return;

    // Update traffic data
    if (trafficData && trafficData.routes) {
      const trafficFeatures = trafficData.routes.map(route => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        },
        properties: {
          congestion: route.congestionLevel,
          speed: route.averageSpeed,
          routeId: route.id
        }
      }));

      (map.current.getSource('traffic') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: trafficFeatures
      });
    }

    // Update incidents data
    if (incidents && incidents.length > 0) {
      const incidentFeatures = incidents.map(incident => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [incident.longitude, incident.latitude]
        },
        properties: {
          type: incident.type,
          severity: incident.severity,
          description: incident.description,
          status: incident.status,
          id: incident.id
        }
      }));

      (map.current.getSource('incidents') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: incidentFeatures
      });
    }
  }, [trafficData, incidents]);




  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: HomeIcon, active: true },
    { id: 'routes', label: 'Route Optimization', icon: MapIcon, active: false },
    { id: 'analytics', label: 'Predictive Analytics', icon: ChartBarIcon, active: false },
    { id: 'simulation', label: 'Scenario Simulation', icon: BeakerIcon, active: false },
    { id: 'reports', label: 'Reports & Exports', icon: DocumentTextIcon, active: false },
    { id: 'aiReports', label: 'AI Traffic Reports', icon: LightBulbIcon, active: false },
    { id: 'sustainability', label: 'Sustainability Panel', icon: GlobeAltIcon, active: false },
    { id: 'profile', label: 'User Profile', icon: UserIcon, active: false },
    { id: 'liveIncidents', label: 'Live Incidents', icon: ExclamationTriangleIcon, active: false },
    { id: 'incidents', label: 'Incident Reporting', icon: ExclamationCircleIcon, active: false },
    { id: 'notifications', label: 'Notification Center', icon: BellIcon, active: false },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, active: false },
  ];

  // Get dynamic user data from localStorage or context
  const [currentUser, setCurrentUser] = useState(() => {
    // Try to get user from demo storage (from signup)
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      const firstInitial = userData.first_name ? userData.first_name.charAt(0).toUpperCase() : userData.username.charAt(0).toUpperCase();
      const lastInitial = userData.last_name ? userData.last_name.charAt(0).toUpperCase() : (userData.username.length > 1 ? userData.username.charAt(1).toUpperCase() : userData.email.charAt(0).toUpperCase());
      return {
        name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userData.username,
        role: 'Traffic Analyst',
        avatar: '/api/placeholder/40/40',
        initials: `${firstInitial}${lastInitial}`,
        email: userData.email
      };
    }
    
    // Try to get user from regular auth storage
    const authUser = localStorage.getItem('user');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        const firstInitial = userData.first_name ? userData.first_name.charAt(0).toUpperCase() : userData.username.charAt(0).toUpperCase();
        const lastInitial = userData.last_name ? userData.last_name.charAt(0).toUpperCase() : (userData.username.length > 1 ? userData.username.charAt(1).toUpperCase() : userData.email.charAt(0).toUpperCase());
        return {
          name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userData.username,
          role: 'Traffic Analyst',
          avatar: '/api/placeholder/40/40',
          initials: `${firstInitial}${lastInitial}`,
          email: userData.email
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Fallback to demo user
    return {
      name: 'Demo User',
      role: 'Traffic Analyst',
      avatar: '/api/placeholder/40/40',
      initials: 'DU',
      email: 'demo@movesmart.ke'
    };
  });

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
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    setIsCitySelectorOpen(false);
    localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, city.id);
    toast.success(`Switched to ${city.name}`);
  };

  const handleLiveIncidentsClick = () => {
    setActiveNavItem('liveIncidents');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex">
        {/* Enhanced Left Sidebar */}
        <motion.div 
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white shadow-xl border-r border-gray-100 flex flex-col transition-all duration-300 relative sticky top-0 h-screen`}
        >
        {/* Modern Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <MapPinIcon className="w-6 h-6 text-white" />
            </motion.div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  MoveSmart
                </h1>
                <p className="text-sm text-green-600 font-semibold tracking-wide">KENYA</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 z-10"
        >
          <ChevronRightIcon className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
        </button>

        {/* Enhanced Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = activeNavItem === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => setActiveNavItem(item.id)}
                    className={`w-full group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-[1.02]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl"
                        transition={{ type: "spring", duration: 0.6 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center space-x-3">
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                      {!isSidebarCollapsed && (
                        <span className={`font-medium ${isActive ? 'text-white' : 'group-hover:text-gray-900'}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Enhanced AI Insights Section */}
        {!isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 border-t border-gray-100"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <LightBulbIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">AI Insights</span>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Get AI-powered traffic recommendations and predictive analytics
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
              >
                Explore Features
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Simplified Top Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 relative sticky top-0 z-40"
        >
          {/* Left Section - Title and City Selector */}
          <div className="flex items-center space-x-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
            </motion.div>
            
            {/* City Selector */}
            <motion.div 
              ref={citySelectorRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <button
                onClick={() => setIsCitySelectorOpen(!isCitySelectorOpen)}
                className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-all duration-200 group"
              >
                <MapPinIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{selectedCity.name}</span>
                <ChevronDownIcon className={`w-4 h-4 text-green-500 transition-transform duration-200 ${
                  isCitySelectorOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* City Dropdown */}
              {isCitySelectorOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-700">Select City</p>
                  </div>
                  
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {KENYA_CITIES.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCityChange(city)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                          selectedCity.id === city.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        }`}
                      >
                        <MapPinIcon className={`w-4 h-4 ${
                          selectedCity.id === city.id ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{city.name}</p>
                        </div>
                        {selectedCity.id === city.id && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Section - Simplified */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-3"
          >
            {/* Live Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 font-medium">Live Data Active</span>
            </div>
            
            {/* Time */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span className="font-medium">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </button>

            {/* User Profile - Simplified */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">{currentUser.initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              </div>
            </div>
          </motion.div>
        </motion.header>

        {/* Main Content - Conditional rendering based on activeNavItem */}
        <div className="flex-1 bg-gray-50">
          {activeNavItem === 'dashboard' && (
            <div className="p-6">
              {/* Stats Cards */}
              <div className="mb-6">
                <StatsCards data={trafficData} loading={loading} onLiveIncidentsClick={handleLiveIncidentsClick} />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Map Section */}
                <div className="col-span-2">
                  <div className="bg-white rounded-lg shadow-sm h-96">
                    {/* Real Map */}
                    <div className="h-full rounded-lg relative overflow-hidden">
                      <div ref={mapContainer} className="w-full h-full" />
                      
                      {/* City Name Overlay */}
                      <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-sm z-10">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">{selectedCity.name}</span>
                        </div>
                      </div>

                      {/* Traffic Legend */}
                      <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-sm z-10">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Live Traffic Conditions</h4>
                        <p className="text-xs text-gray-500 mb-2">
                          Last updated: {new Date().toLocaleTimeString()}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Free flow</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Slow traffic</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Traffic jam</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Live traffic data from TomTom</p>
                      </div>

                      {/* Map Attribution */}
                      <div className="absolute bottom-4 right-4 text-xs text-gray-500 z-10">
                        © TomTom, © OpenStreetMap contributors
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Congestion Trends</h3>
                      <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                        <span className="text-gray-400">Chart placeholder</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Comparison</h3>
                      <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                        <span className="text-gray-400">Chart placeholder</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Enhanced Traffic Report Section */}
                <div className="space-y-6">
                  <TrafficReportSection selectedCity={selectedCity} />
                </div>
              </div>
            </div>
          )}

          {activeNavItem === 'routes' && (
            <RouteOptimization />
          )}

          {activeNavItem === 'analytics' && (
            <PredictiveAnalytics />
          )}

          {activeNavItem === 'simulation' && (
            <ScenarioSimulation />
          )}

          {activeNavItem === 'reports' && (
            <ReportsExports />
          )}

          {activeNavItem === 'aiReports' && (
            <AITrafficReports />
          )}

          {activeNavItem === 'sustainability' && (
            <SustainabilityPanel />
          )}

          {activeNavItem === 'profile' && (
            <UserProfile />
          )}

          {activeNavItem === 'liveIncidents' && (
            <IncidentsPage />
          )}

          {activeNavItem === 'incidents' && (
            <IncidentReporting />
          )}

          {activeNavItem === 'notifications' && (
            <NotificationCenter />
          )}

          {activeNavItem === 'settings' && (
            <div className="p-6">
              <div className="bg-white rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings Component Debug</h2>
                <p className="text-gray-600 mb-4">Active nav item: {activeNavItem}</p>
                <Settings />
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

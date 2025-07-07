import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon,
  CloudIcon,
  SunIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { CITY_ROADS } from '../../constants';

interface AnalyticsFilter {
  city: string;
  road: string;
  timeRange: 'day' | 'week' | 'month';
}

interface TrafficPattern {
  time: string;
  congestion: number;
  volume: number;
  speed: number;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
}

interface WeatherImpact {
  condition: string;
  icon: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  delayMinutes: number;
}

interface EventForecast {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  expectedAttendees: number;
  trafficImpact: 'low' | 'medium' | 'high';
  affectedRoutes: string[];
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
}

const PredictiveAnalytics: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilter>({
    city: 'Nairobi',
    road: 'all',
    timeRange: 'week'
  });

  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'heatmap'>('line');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Mock weather impact data
  const weatherImpacts: WeatherImpact[] = [
    {
      condition: 'Heavy Rain',
      icon: '🌧️',
      impact: 'high',
      description: 'Expected 15-20 minute delays on major highways',
      delayMinutes: 18
    },
    {
      condition: 'Clear Skies',
      icon: '☀️',
      impact: 'low',
      description: 'Optimal driving conditions with minimal impact',
      delayMinutes: 0
    }
  ];

  // Mock event forecasts
  const eventForecasts: EventForecast[] = [
    {
      id: '1',
      name: 'Nairobi Marathon',
      date: 'Today',
      time: '6:00 AM - 12:00 PM',
      location: 'CBD Area',
      expectedAttendees: 15000,
      trafficImpact: 'high',
      affectedRoutes: ['Uhuru Highway', 'Moi Avenue', 'Kenyatta Avenue']
    },
    {
      id: '2',
      name: 'Business Conference',
      date: 'Tomorrow',
      time: '8:00 AM - 6:00 PM',
      location: 'KICC',
      expectedAttendees: 2500,
      trafficImpact: 'medium',
      affectedRoutes: ['Parliament Road', 'City Hall Way']
    }
  ];

  // Mock alerts
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Heavy Traffic Alert',
      message: 'Unusually heavy traffic detected on Mombasa Road. Consider alternative routes.',
      timestamp: '2 minutes ago',
      isNew: true
    },
    {
      id: '2',
      type: 'info',
      title: 'Weather Update',
      message: 'Light rain expected in 30 minutes. Traffic may slow down.',
      timestamp: '5 minutes ago',
      isNew: true
    },
    {
      id: '3',
      type: 'success',
      title: 'Route Cleared',
      message: 'Traffic congestion on Waiyaki Way has been cleared.',
      timestamp: '10 minutes ago',
      isNew: false
    }
  ];

  // Initialize alerts
  useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  // Auto-refresh for live mode
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        console.log('Refreshing live data...');
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  // Handle city change and reset road filter
  const handleCityChange = (city: string) => {
    setFilters({
      ...filters,
      city,
      road: 'all' // Reset to 'all' when city changes
    });
  };

  // Mock data
  const trafficData: TrafficPattern[] = [
    { time: '06:00', congestion: 25, volume: 120, speed: 45 },
    { time: '07:00', congestion: 60, volume: 280, speed: 25 },
    { time: '08:00', congestion: 85, volume: 420, speed: 15 },
    { time: '09:00', congestion: 70, volume: 350, speed: 20 },
    { time: '10:00', congestion: 45, volume: 200, speed: 35 },
    { time: '11:00', congestion: 30, volume: 150, speed: 40 },
    { time: '12:00', congestion: 50, volume: 250, speed: 30 },
    { time: '13:00', congestion: 55, volume: 270, speed: 28 },
    { time: '14:00', congestion: 40, volume: 180, speed: 38 },
    { time: '15:00', congestion: 35, volume: 160, speed: 42 },
    { time: '16:00', congestion: 45, volume: 220, speed: 32 },
    { time: '17:00', congestion: 75, volume: 380, speed: 18 },
    { time: '18:00', congestion: 90, volume: 450, speed: 12 },
    { time: '19:00', congestion: 65, volume: 320, speed: 22 },
    { time: '20:00', congestion: 40, volume: 190, speed: 36 },
    { time: '21:00', congestion: 25, volume: 130, speed: 44 },
  ];

  const weeklyData = [
    { day: 'Mon', congestion: 75, incidents: 12 },
    { day: 'Tue', congestion: 80, incidents: 15 },
    { day: 'Wed', congestion: 72, incidents: 8 },
    { day: 'Thu', congestion: 78, incidents: 11 },
    { day: 'Fri', congestion: 85, incidents: 18 },
    { day: 'Sat', congestion: 45, incidents: 5 },
    { day: 'Sun', congestion: 35, incidents: 3 },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'prediction',
      title: 'Peak Hour Prediction',
      description: 'Tuesday evenings on Mombasa Road show 80% congestion by 6 PM based on historical patterns',
      confidence: 92,
      timeframe: 'Next 3 days'
    },
    {
      id: '2',
      type: 'pattern',
      title: 'Weekly Pattern Detected',
      description: 'Fridays consistently show 15% higher traffic volume compared to weekday average',
      confidence: 88,
      timeframe: 'Ongoing'
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Route Optimization',
      description: 'Alternative routes via Waiyaki Way could reduce travel time by 12 minutes during peak hours',
      confidence: 85,
      timeframe: 'Immediate'
    }
  ];

  // Import city and road data
  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  
  // Dynamic roads based on selected city
  const getCityRoads = (city: string) => {
    const cityKey = city.toLowerCase() as keyof typeof CITY_ROADS;
    return CITY_ROADS[cityKey] || CITY_ROADS.nairobi;
  };
  
  const roads = getCityRoads(filters.city);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return ArrowTrendingUpIcon;
      case 'pattern': return ChartBarIcon;
      case 'recommendation': return LightBulbIcon;
      default: return CpuChipIcon;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'from-blue-500 to-cyan-500';
      case 'pattern': return 'from-purple-500 to-pink-500';
      case 'recommendation': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
              <p className="text-gray-600">AI-powered traffic insights and forecasting</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Real-time AI Analysis</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <select
              value={filters.city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Road</label>
            <select
              value={filters.road}
              onChange={(e) => setFilters({...filters, road: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {roads.map(road => (
                <option key={road.id} value={road.id}>{road.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Range</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setFilters({...filters, timeRange: range})}
                  className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-all ${
                    filters.timeRange === range
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Chart Type</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['line', 'bar', 'heatmap'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveChart(type)}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    activeChart === type
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Congestion Patterns</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>Last updated: 2 minutes ago</span>
            </div>
          </div>

          <div className="h-80">
            {activeChart === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="congestion" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fill="url(#congestionGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="congestion" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'heatmap' && (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChartBarIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Heatmap View</h4>
                  <p className="text-gray-600">Interactive heatmap visualization coming soon</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Key Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Congestion</p>
                  <p className="text-2xl font-bold text-gray-900">68%</p>
                </div>
                <div className="flex items-center space-x-1 text-red-500">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span className="text-sm">+5%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peak Hours</p>
                  <p className="text-2xl font-bold text-gray-900">7-9 AM</p>
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                  <span className="text-sm">-12min</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incidents Today</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                  <span className="text-sm">-15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Accuracy */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Prediction Accuracy</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '94%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pattern Recognition</span>
                  <span className="font-medium">89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '89%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Confidence Level</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Commentary & Insights</h3>
            <p className="text-sm text-gray-600">Machine learning powered traffic analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getInsightColor(insight.type)} text-white`}>
                      {insight.type}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {insight.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Confidence:</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full" 
                          style={{width: `${insight.confidence}%`}}
                        ></div>
                      </div>
                      <span className="font-medium">{insight.confidence}%</span>
                    </div>
                  </div>
                  <span className="text-gray-500">{insight.timeframe}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PredictiveAnalytics;

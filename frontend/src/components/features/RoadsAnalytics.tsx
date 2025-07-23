import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import {
  ChartBarIcon,
  MapIcon,
  ClockIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CubeTransparentIcon,
  ChartPieIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import { KENYA_CITIES } from '../../constants';

interface RoadData {
  name: string;
  congestion: number;
  avgSpeed: number;
  incidents: number;
  travelTime: number;
  status: 'free' | 'slow' | 'heavy';
  coordinates?: [number, number][];
}

interface CityRoadsData {
  [key: string]: RoadData[];
}

const cityRoadsData: CityRoadsData = {
  nairobi: [
    { 
      name: 'Uhuru Highway', 
      congestion: 75, 
      avgSpeed: 25, 
      incidents: 3, 
      travelTime: 35, 
      status: 'heavy',
      coordinates: [[-1.2921, 36.8219], [-1.2931, 36.8229]]
    },
    { 
      name: 'Waiyaki Way', 
      congestion: 60, 
      avgSpeed: 35, 
      incidents: 2, 
      travelTime: 28, 
      status: 'slow',
      coordinates: [[-1.2621, 36.7219], [-1.2631, 36.7229]]
    },
    { 
      name: 'Mombasa Road', 
      congestion: 55, 
      avgSpeed: 40, 
      incidents: 1, 
      travelTime: 25, 
      status: 'slow',
      coordinates: [[-1.3221, 36.8519], [-1.3231, 36.8529]]
    },
    { 
      name: 'Thika Road', 
      congestion: 70, 
      avgSpeed: 30, 
      incidents: 4, 
      travelTime: 32, 
      status: 'heavy',
      coordinates: [[-1.2521, 36.8819], [-1.2531, 36.8829]]
    },
    { 
      name: 'Ngong Road', 
      congestion: 45, 
      avgSpeed: 45, 
      incidents: 1, 
      travelTime: 20, 
      status: 'slow',
      coordinates: [[-1.3021, 36.7819], [-1.3031, 36.7829]]
    },
    { 
      name: 'Jogoo Road', 
      congestion: 65, 
      avgSpeed: 32, 
      incidents: 2, 
      travelTime: 30, 
      status: 'heavy',
      coordinates: [[-1.2821, 36.8619], [-1.2831, 36.8629]]
    },
    { 
      name: 'Lang\'ata Road', 
      congestion: 40, 
      avgSpeed: 50, 
      incidents: 0, 
      travelTime: 18, 
      status: 'free',
      coordinates: [[-1.3321, 36.7719], [-1.3331, 36.7729]]
    },
    { 
      name: 'Kiambu Road', 
      congestion: 58, 
      avgSpeed: 38, 
      incidents: 2, 
      travelTime: 26, 
      status: 'slow',
      coordinates: [[-1.2421, 36.8419], [-1.2431, 36.8429]]
    }
  ],
  mombasa: [
    { 
      name: 'Moi Avenue', 
      congestion: 65, 
      avgSpeed: 30, 
      incidents: 2, 
      travelTime: 25, 
      status: 'heavy',
      coordinates: [[-4.0435, 39.6682], [-4.0445, 39.6692]]
    },
    { 
      name: 'Nyali Bridge', 
      congestion: 80, 
      avgSpeed: 20, 
      incidents: 3, 
      travelTime: 40, 
      status: 'heavy',
      coordinates: [[-4.0235, 39.6882], [-4.0245, 39.6892]]
    },
    { 
      name: 'Digo Road', 
      congestion: 45, 
      avgSpeed: 40, 
      incidents: 1, 
      travelTime: 20, 
      status: 'slow',
      coordinates: [[-4.0535, 39.6482], [-4.0545, 39.6492]]
    },
    { 
      name: 'Makupa Causeway', 
      congestion: 70, 
      avgSpeed: 25, 
      incidents: 2, 
      travelTime: 35, 
      status: 'heavy',
      coordinates: [[-4.0335, 39.6582], [-4.0345, 39.6592]]
    }
  ],
  kisumu: [
    { 
      name: 'Oginga Odinga Street', 
      congestion: 40, 
      avgSpeed: 35, 
      incidents: 1, 
      travelTime: 15, 
      status: 'slow',
      coordinates: [[-0.1022, 34.7617], [-0.1032, 34.7627]]
    },
    { 
      name: 'Kenyatta Avenue', 
      congestion: 50, 
      avgSpeed: 30, 
      incidents: 2, 
      travelTime: 20, 
      status: 'slow',
      coordinates: [[-0.0922, 34.7717], [-0.0932, 34.7727]]
    },
    { 
      name: 'Nairobi Road', 
      congestion: 35, 
      avgSpeed: 40, 
      incidents: 0, 
      travelTime: 12, 
      status: 'free',
      coordinates: [[-0.1122, 34.7517], [-0.1132, 34.7527]]
    }
  ],
  nakuru: [
    { 
      name: 'Kenyatta Avenue', 
      congestion: 45, 
      avgSpeed: 35, 
      incidents: 1, 
      travelTime: 18, 
      status: 'slow',
      coordinates: [[-0.3031, 36.0800], [-0.3041, 36.0810]]
    },
    { 
      name: 'West Road', 
      congestion: 35, 
      avgSpeed: 45, 
      incidents: 0, 
      travelTime: 15, 
      status: 'free',
      coordinates: [[-0.3131, 36.0700], [-0.3141, 36.0710]]
    }
  ],
  eldoret: [
    { 
      name: 'Uganda Road', 
      congestion: 40, 
      avgSpeed: 40, 
      incidents: 1, 
      travelTime: 16, 
      status: 'slow',
      coordinates: [[0.5143, 35.2697], [0.5153, 35.2707]]
    },
    { 
      name: 'Kenyatta Street', 
      congestion: 30, 
      avgSpeed: 50, 
      incidents: 0, 
      travelTime: 12, 
      status: 'free',
      coordinates: [[0.5043, 35.2797], [0.5053, 35.2807]]
    }
  ]
};

type ChartType = 'bar' | 'line' | 'pie' | 'area';

const RoadsAnalytics: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState(KENYA_CITIES[0]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [roadsData, setRoadsData] = useState<RoadData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'congestion' | 'avgSpeed' | 'incidents' | 'travelTime'>('congestion');

  // Load roads data for selected city
  useEffect(() => {
    setLoading(true);
    const data = cityRoadsData[selectedCity.id] || [];
    
    // Simulate API delay and add some randomization
    setTimeout(() => {
      const updatedData = data.map(road => ({
        ...road,
        congestion: Math.max(0, Math.min(100, road.congestion + (Math.random() - 0.5) * 10)),
        avgSpeed: Math.max(10, road.avgSpeed + (Math.random() - 0.5) * 5),
        incidents: Math.max(0, road.incidents + Math.floor((Math.random() - 0.7) * 2)),
        travelTime: Math.max(5, road.travelTime + (Math.random() - 0.5) * 3)
      }));
      
      setRoadsData(updatedData);
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  }, [selectedCity.id]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        const data = cityRoadsData[selectedCity.id] || [];
        const updatedData = data.map(road => ({
          ...road,
          congestion: Math.max(0, Math.min(100, road.congestion + (Math.random() - 0.5) * 5)),
          avgSpeed: Math.max(10, road.avgSpeed + (Math.random() - 0.5) * 3),
          incidents: Math.max(0, road.incidents + Math.floor((Math.random() - 0.8) * 2)),
          travelTime: Math.max(5, road.travelTime + (Math.random() - 0.5) * 2)
        }));
        
        setRoadsData(updatedData);
        setLastUpdate(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCity.id, loading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free': return 'text-green-600 bg-green-50';
      case 'slow': return 'text-yellow-600 bg-yellow-50';
      case 'heavy': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMetricColor = (value: number, metric: string) => {
    if (metric === 'congestion') {
      if (value < 30) return '#22c55e';
      if (value < 70) return '#eab308';
      return '#ef4444';
    }
    if (metric === 'avgSpeed') {
      if (value > 40) return '#22c55e';
      if (value > 25) return '#eab308';
      return '#ef4444';
    }
    if (metric === 'incidents') {
      if (value === 0) return '#22c55e';
      if (value < 3) return '#eab308';
      return '#ef4444';
    }
    return '#3b82f6';
  };

  const chartData = roadsData.map(road => ({
    name: road.name.replace(' Road', '').replace(' Highway', '').replace(' Street', ''),
    congestion: road.congestion,
    avgSpeed: road.avgSpeed,
    incidents: road.incidents,
    travelTime: road.travelTime,
    fill: getMetricColor(road[selectedMetric], selectedMetric)
  }));

  const pieData = roadsData.map((road, index) => ({
    name: road.name.replace(' Road', '').replace(' Highway', '').replace(' Street', ''),
    value: road[selectedMetric],
    fill: `hsl(${(index * 45) % 360}, 70%, 60%)`
  }));

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 400,
      data: chartType === 'pie' ? pieData : chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-blue-600">
                          {`${selectedMetric}: ${payload[0].value}${selectedMetric === 'congestion' ? '%' : selectedMetric === 'avgSpeed' ? ' km/h' : selectedMetric === 'incidents' ? ' incidents' : ' min'}`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey={selectedMetric} 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'bar': return ChartBarIcon;
      case 'line': return ArrowTrendingUpIcon;
      case 'area': return CubeTransparentIcon;
      case 'pie': return ChartPieIcon;
    }
  };

  const totalIncidents = roadsData.reduce((sum, road) => sum + road.incidents, 0);
  const avgCongestion = roadsData.length > 0 ? roadsData.reduce((sum, road) => sum + road.congestion, 0) / roadsData.length : 0;
  const avgSpeed = roadsData.length > 0 ? roadsData.reduce((sum, road) => sum + road.avgSpeed, 0) / roadsData.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Roads Analytics</h1>
                <p className="text-gray-600">Comprehensive analysis of major roads traffic conditions</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-4">
              {/* City Selector */}
              <div className="relative">
                <select
                  value={selectedCity.id}
                  onChange={(e) => {
                    const city = KENYA_CITIES.find(c => c.id === e.target.value);
                    if (city) setSelectedCity(city);
                  }}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {KENYA_CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Metric Selector */}
              <div className="relative">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="congestion">Congestion Level</option>
                  <option value="avgSpeed">Average Speed</option>
                  <option value="incidents">Active Incidents</option>
                  <option value="travelTime">Travel Time</option>
                </select>
              </div>

              {/* Live Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Live Data</span>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roads</p>
                <p className="text-2xl font-bold text-gray-900">{roadsData.length}</p>
              </div>
              <MapIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Congestion</p>
                <p className="text-2xl font-bold text-gray-900">{avgCongestion.toFixed(0)}%</p>
              </div>
              <ArrowTrendingUpIcon className={`w-8 h-8 ${avgCongestion > 50 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900">{avgSpeed.toFixed(0)} km/h</p>
              </div>
              <SparklesIcon className={`w-8 h-8 ${avgSpeed > 35 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{totalIncidents}</p>
              </div>
              <ExclamationTriangleIcon className={`w-8 h-8 ${totalIncidents > 3 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {/* Chart Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                {selectedCity.name} Major Roads - {selectedMetric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h2>
              
              <div className="flex items-center space-x-2">
                {(['bar', 'line', 'area', 'pie'] as ChartType[]).map((type) => {
                  const IconComponent = getChartIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        chartType === type
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading roads data...</p>
                </div>
              </div>
            ) : (
              <div className="h-96">
                {renderChart()}
              </div>
            )}
          </motion.div>

          {/* Roads Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Roads Overview</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {roadsData.map((road, index) => (
                <motion.div
                  key={road.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{road.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(road.status)}`}>
                      {road.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Congestion:</span>
                      <span className="ml-1 font-medium">{road.congestion.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Speed:</span>
                      <span className="ml-1 font-medium">{road.avgSpeed.toFixed(0)} km/h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Incidents:</span>
                      <span className="ml-1 font-medium">{road.incidents}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-1 font-medium">{road.travelTime.toFixed(0)} min</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Traffic Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Most Congested</h4>
              <p className="text-sm text-blue-700">
                {roadsData.length > 0 && roadsData.reduce((prev, current) => 
                  prev.congestion > current.congestion ? prev : current
                ).name}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Fastest Route</h4>
              <p className="text-sm text-green-700">
                {roadsData.length > 0 && roadsData.reduce((prev, current) => 
                  prev.avgSpeed > current.avgSpeed ? prev : current
                ).name}
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Most Incidents</h4>
              <p className="text-sm text-red-700">
                {roadsData.length > 0 && roadsData.reduce((prev, current) => 
                  prev.incidents > current.incidents ? prev : current
                ).name}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoadsAnalytics;

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
import { KENYA_CITIES, CITY_ROADS } from '../../constants';

interface RoadData {
  name: string;
  congestion: number;
  avgSpeed: number;
  incidents: number;
  travelTime: number;
  status: 'free' | 'slow' | 'heavy';
  isRealtime?: boolean;
  coordinates?: [number, number][];
}

interface CityRoadsData {
  [key: string]: RoadData[];
}

// This data structure will hold real road data fetched from API
const cityRoadsData: CityRoadsData = {};

type ChartType = 'bar' | 'line' | 'pie' | 'area';

const RoadsAnalytics: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState(KENYA_CITIES[0]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [roadsData, setRoadsData] = useState<RoadData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'congestion' | 'avgSpeed' | 'incidents' | 'travelTime'>('congestion');
  const [selectedRoadId, setSelectedRoadId] = useState<string>('all');

  // Load roads data for selected city using TomTom-derived metrics per road
  useEffect(() => {
    const fetchRoadsData = async () => {
      setLoading(true);
      try {
        const roads = CITY_ROADS[selectedCity.id as keyof typeof CITY_ROADS] || [];
        const targets = selectedRoadId === 'all' ? roads.filter(r => r.id !== 'all') : roads.filter(r => r.id === selectedRoadId);

        const results = await Promise.all(
          targets.map(async (road) => {
            const res = await apiService.getRoadMetrics(selectedCity.id, road.id);
            if (res.success) {
              return {
                name: road.name,
                congestion: res.data.congestion,
                avgSpeed: res.data.avgSpeed,
                incidents: res.data.incidents,
                travelTime: res.data.travelTime,
                status: res.data.status,
                isRealtime: res.data.isRealtime,
              } as RoadData;
            }
            return {
              name: road.name,
              congestion: 0,
              avgSpeed: 0,
              incidents: 0,
              travelTime: 0,
              status: 'free'
            } as RoadData;
          })
        );

        setRoadsData(results);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch roads data:', error);
        setRoadsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadsData();
  }, [selectedCity.id, selectedRoadId]);

  // Auto-refresh data every 30 seconds using real API data
  useEffect(() => {
    const refreshData = async () => {
      if (!loading) {
        try {
          const roads = CITY_ROADS[selectedCity.id as keyof typeof CITY_ROADS] || [];
          const targets = selectedRoadId === 'all' ? roads.filter(r => r.id !== 'all') : roads.filter(r => r.id === selectedRoadId);
          const results = await Promise.all(
            targets.map(async (road) => {
              const res = await apiService.getRoadMetrics(selectedCity.id, road.id);
              if (res.success) {
                return {
                  name: road.name,
                  congestion: res.data.congestion,
                  avgSpeed: res.data.avgSpeed,
                  incidents: res.data.incidents,
                  travelTime: res.data.travelTime,
                  status: res.data.status,
                  isRealtime: res.data.isRealtime,
                } as RoadData;
              }
              return {
                name: road.name,
                congestion: 0,
                avgSpeed: 0,
                incidents: 0,
                travelTime: 0,
                status: 'free'
              } as RoadData;
            })
          );
          setRoadsData(results);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error refreshing road data:', error);
        }
      }
    };

    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [selectedCity.id, selectedRoadId, loading]);

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
                    if (city) {
                      setSelectedCity(city);
                      setSelectedRoadId('all');
                    }
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

              {/* Road Selector */}
              <div className="relative">
                <select
                  value={selectedRoadId}
                  onChange={(e) => setSelectedRoadId(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(CITY_ROADS[selectedCity.id as keyof typeof CITY_ROADS] || []).map(road => (
                    <option key={road.id} value={road.id}>{road.name}</option>
                  ))}
                </select>
              </div>

              {/* Live Status */}
              {(() => {
                const anyData = roadsData.length > 0;
                const allRealtime = anyData && roadsData.every(r => r.isRealtime);
                if (allRealtime) {
                  return (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 font-medium">Live Data</span>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 font-medium">System Offline (Simulated)</span>
                  </div>
                );
              })()}
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

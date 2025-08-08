import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import {
  ClockIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  CubeTransparentIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { KENYA_CITIES } from '../../constants';
import apiService from '../../services/api';

interface CongestionDataPoint {
  time: string;
  congestion: number;
  speed: number;
  incidents: number;
}

type ChartType = 'line' | 'bar' | 'area' | 'pie';
type TimeRange = '24h' | '7d' | '30d';
type MetricType = 'congestion' | 'speed' | 'incidents' | 'all';

const CongestionAnalytics: React.FC = () => {
  const [data, setData] = useState<CongestionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState(KENYA_CITIES[0]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('all');

  // Initialize empty data array - will be populated from API
  const initializeEmptyData = (): CongestionDataPoint[] => {
    return [];
  };

  const fetchTrafficData = async () => {
    try {
      const response = await apiService.getTrafficData(selectedCity.id);

      if (response.success && response.data) {
        const now = new Date();
        const newDataPoint: CongestionDataPoint = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          congestion: response.data.congestionLevel || 0,
          speed: Math.round(60 - (response.data.congestionLevel * 0.4)) || 50,
          incidents: response.data.liveIncidents || 0
        };

        setData(prevData => {
          const updatedData = [...prevData, newDataPoint];
          return updatedData.slice(-24);
        });

        setLastUpdate(now);
      }
    } catch (error) {
      console.error('Failed to fetch traffic data for trends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize with empty data array
    setData([]);
    setLoading(true);

    // Fetch real traffic data immediately
    fetchTrafficData();

    // Set up interval for real-time updates
    const interval = setInterval(fetchTrafficData, 30000);

    return () => clearInterval(interval);
  }, [selectedCity.id]);

  const totalIncidents = data.reduce((sum, point) => sum + point.incidents, 0);
  const avgCongestion = data.length > 0 ? data.reduce((sum, point) => sum + point.congestion, 0) / data.length : 0;
  const avgSpeed = data.length > 0 ? data.reduce((sum, point) => sum + point.speed, 0) / data.length : 0;
  const peakCongestion = data.length > 0 ? Math.max(...data.map(d => d.congestion)) : 0;
  const minSpeed = data.length > 0 ? Math.min(...data.map(d => d.speed)) : 0;

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'bar': return ChartBarIcon;
      case 'line': return ArrowTrendingUpIcon;
      case 'area': return CubeTransparentIcon;
      case 'pie': return ChartPieIcon;
    }
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{`Time: ${label}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'congestion' ? '%' : entry.dataKey === 'speed' ? ' km/h' : ''}`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
              <Line 
                type="monotone" 
                dataKey="congestion" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'speed') && (
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
              <Line 
                type="monotone" 
                dataKey="incidents" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
              <Bar dataKey="congestion" fill="#ef4444" radius={[2, 2, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'speed') && (
              <Bar dataKey="speed" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
              <Bar dataKey="incidents" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            )}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
              <Area 
                type="monotone" 
                dataKey="congestion" 
                stackId="1"
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.6}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'speed') && (
              <Area 
                type="monotone" 
                dataKey="speed" 
                stackId="2"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
              <Area 
                type="monotone" 
                dataKey="incidents" 
                stackId="3"
                stroke="#f59e0b" 
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        );
      case 'pie':
        const pieData = [
          { name: 'High Congestion', value: data.filter(d => d.congestion > 70).length, fill: '#ef4444' },
          { name: 'Medium Congestion', value: data.filter(d => d.congestion > 30 && d.congestion <= 70).length, fill: '#f59e0b' },
          { name: 'Low Congestion', value: data.filter(d => d.congestion <= 30).length, fill: '#22c55e' }
        ];
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return null;
    }
  };

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
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Congestion Analytics</h1>
                <p className="text-gray-600">Real-time traffic congestion trends and insights</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-4">
              {/* City Selector */}
              <div className="relative">
                <select
                  value={selectedCity.id}
                  onChange={(e) => setSelectedCity(KENYA_CITIES.find(c => c.id === e.target.value) || KENYA_CITIES[0])}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {KENYA_CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              {/* Metric Selector */}
              <div className="relative">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Metrics</option>
                  <option value="congestion">Congestion Only</option>
                  <option value="speed">Speed Only</option>
                  <option value="incidents">Incidents Only</option>
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
                <p className="text-sm font-medium text-gray-600">Peak Congestion</p>
                <p className="text-2xl font-bold text-gray-900">{peakCongestion.toFixed(0)}%</p>
              </div>
              <ExclamationTriangleIcon className={`w-8 h-8 ${peakCongestion > 70 ? 'text-red-500' : 'text-orange-500'}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{totalIncidents}</p>
              </div>
              <MapIcon className={`w-8 h-8 ${totalIncidents > 10 ? 'text-red-500' : 'text-green-500'}`} />
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
                {selectedCity.name} Traffic Trends - {timeRange.toUpperCase()}
              </h2>
              
              <div className="flex items-center space-x-2">
                {(['line', 'bar', 'area', 'pie'] as ChartType[]).map((type) => {
                  const IconComponent = getChartIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        chartType === type
                          ? 'bg-red-100 text-red-700 border border-red-200'
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading congestion data...</p>
                </div>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4">
              {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Congestion %</span>
                </div>
              )}
              {(selectedMetric === 'all' || selectedMetric === 'speed') && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Speed km/h</span>
                </div>
              )}
              {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-600">Incidents</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Insights Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Insights</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Rush Hour Analysis</h4>
                <p className="text-sm text-red-700">
                  Peak congestion occurs between 7-9 AM and 5-7 PM with average levels of {peakCongestion.toFixed(0)}%
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Speed Analysis</h4>
                <p className="text-sm text-blue-700">
                  Average speed is {avgSpeed.toFixed(0)} km/h. Minimum speed recorded: {minSpeed} km/h
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Incident Pattern</h4>
                <p className="text-sm text-yellow-700">
                  {totalIncidents} incidents recorded in the last 24 hours. Higher incident rates correlate with peak traffic times.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Avoid travel during 7-9 AM and 5-7 PM</p>
                  <p>• Consider alternative routes during peak hours</p>
                  <p>• Monitor live updates for incidents</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Congestion Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Low Congestion (0-30%)</h4>
              <p className="text-2xl font-bold text-green-700">
                {data.filter(d => d.congestion <= 30).length}
              </p>
              <p className="text-sm text-green-600">time periods</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Medium Congestion (31-70%)</h4>
              <p className="text-2xl font-bold text-yellow-700">
                {data.filter(d => d.congestion > 30 && d.congestion <= 70).length}
              </p>
              <p className="text-sm text-yellow-600">time periods</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">High Congestion (71-100%)</h4>
              <p className="text-2xl font-bold text-red-700">
                {data.filter(d => d.congestion > 70).length}
              </p>
              <p className="text-sm text-red-600">time periods</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CongestionAnalytics;


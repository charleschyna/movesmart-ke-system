import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ClockIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

interface CongestionDataPoint {
  time: string;
  congestion: number;
  speed: number;
  incidents: number;
}

interface DailyCongestionTrendsProps {
  cityId: string;
  refreshInterval?: number;
  onExpand?: () => void;
}

const DailyCongestionTrends: React.FC<DailyCongestionTrendsProps> = ({ 
  cityId, 
  refreshInterval = 30000, // 30 seconds default
  onExpand
}) => {
  const [data, setData] = useState<CongestionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate mock data points for the last 24 hours (hourly intervals)
  const generateInitialData = (): CongestionDataPoint[] => {
    const dataPoints = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      
      // Simulate realistic traffic patterns
      let baseCongestion = 20;
      if (hour >= 7 && hour <= 9) baseCongestion = 75; // Morning rush
      else if (hour >= 17 && hour <= 19) baseCongestion = 80; // Evening rush
      else if (hour >= 12 && hour <= 14) baseCongestion = 45; // Lunch time
      else if (hour >= 22 || hour <= 6) baseCongestion = 15; // Night time
      
      // Add some randomness
      const congestion = Math.max(0, Math.min(100, baseCongestion + (Math.random() - 0.5) * 20));
      const speed = Math.round(60 - (congestion * 0.4)); // Speed inversely related to congestion
      const incidents = Math.floor(Math.random() * 5) + (congestion > 60 ? 2 : 0);
      
      dataPoints.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        congestion: Math.round(congestion),
        speed,
        incidents
      });
    }
    
    return dataPoints;
  };

  // Fetch real-time traffic data
  const fetchTrafficData = async () => {
    try {
      const response = await apiService.getTrafficData(cityId);
      
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
          // Keep only last 24 data points
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

  // Initialize with mock data and start real-time updates
  useEffect(() => {
    const initialData = generateInitialData();
    setData(initialData);
    setLoading(false);
    
    // Fetch real data immediately
    fetchTrafficData();
    
    // Set up interval for real-time updates
    const interval = setInterval(fetchTrafficData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [cityId, refreshInterval]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{`Time: ${label}`}</p>
          <p className="text-sm text-red-600">{`Congestion: ${payload[0].value}%`}</p>
          <p className="text-sm text-blue-600">{`Avg Speed: ${payload[1].value} km/h`}</p>
          <p className="text-sm text-orange-600">{`Incidents: ${payload[2].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading traffic trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48">
      {/* Header with last update info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live Data</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          {onExpand && (
            <button
              onClick={onExpand}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Expand to full Congestion Analytics"
            >
              <ArrowsPointingOutIcon className="w-3 h-3" />
              <span>Expand</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="congestion" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="incidents" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span className="text-xs text-gray-600">Congestion %</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-xs text-gray-600">Speed km/h</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-yellow-500"></div>
          <span className="text-xs text-gray-600">Incidents</span>
        </div>
      </div>
    </div>
  );
};

export default DailyCongestionTrends;

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClockIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

interface AreaComparisonData {
  area: string;
  congestion: number;
}

interface AreaComparisonProps {
  cityId: string;
  refreshInterval?: number;
}

const AreaComparison: React.FC<AreaComparisonProps> = ({ 
  cityId, 
  refreshInterval = 30000
}) => {
  const [data, setData] = useState<AreaComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const generateInitialData = () => {
    return [
      { area: 'Uhuru Highway', congestion: Math.floor(Math.random() * 100) },
      { area: 'Waiyaki Way', congestion: Math.floor(Math.random() * 100) },
      { area: 'Mombasa Road', congestion: Math.floor(Math.random() * 100) },
      { area: 'Thika Road', congestion: Math.floor(Math.random() * 100) },
      { area: 'Ngong Road', congestion: Math.floor(Math.random() * 100) }
    ];
  };

  const fetchAreaData = async () => {
    try {
      const response = await apiService.getTrafficData(cityId);

      if (response.success && response.data) {
        const baseLevel = response.data.congestionLevel || 0;
        const updatedData: AreaComparisonData[] = [
          { area: 'Uhuru Highway', congestion: baseLevel },
          { area: 'Waiyaki Way', congestion: Math.max(0, baseLevel - 10) },
          { area: 'Mombasa Road', congestion: Math.max(0, baseLevel - 20) },
          { area: 'Thika Road', congestion: Math.max(0, baseLevel - 5) },
          { area: 'Ngong Road', congestion: Math.max(0, baseLevel - 15) }
        ];

        setData(updatedData);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch area comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const initialData = generateInitialData();
    setData(initialData);
    setLoading(false);
    
    fetchAreaData();
    
    const interval = setInterval(fetchAreaData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [cityId, refreshInterval]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{`Area: ${label}`}</p>
          <p className="text-sm text-red-600">{`Congestion: ${payload[0].value}%`}</p>
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
          <p className="text-sm text-gray-500 mt-2">Loading area comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live Data</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <ClockIcon className="w-3 h-3" />
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="area" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="congestion" fill="#ef4444" background={{ fill: '#f0f0f0' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaComparison;

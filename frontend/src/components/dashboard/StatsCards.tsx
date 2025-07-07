import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { TrafficData } from '../../types';
import { TRAFFIC_COLORS } from '../../constants';

interface StatsCardsProps {
  data: TrafficData | null;
  loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ data, loading = false }) => {
  const getTrafficColor = (level: number) => {
    if (level < 25) return TRAFFIC_COLORS.LOW;
    if (level < 50) return TRAFFIC_COLORS.MEDIUM;
    if (level < 75) return TRAFFIC_COLORS.HIGH;
    return TRAFFIC_COLORS.SEVERE;
  };

  const getTrafficLabel = (level: number) => {
    if (level < 25) return 'Light';
    if (level < 50) return 'Moderate';
    if (level < 75) return 'Heavy';
    return 'Severe';
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          {subtitle && !loading && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend && !loading && (
          <div className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
            trend === 'up' ? 'bg-red-100 text-red-800' :
            trend === 'down' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Traffic Congestion"
        value={loading ? '' : `${data?.congestionLevel || 0}%`}
        icon={ChartBarIcon}
        color={data ? getTrafficColor(data.congestionLevel) : TRAFFIC_COLORS.MEDIUM}
        subtitle={data ? getTrafficLabel(data.congestionLevel) : undefined}
        trend={data?.congestionLevel && data.congestionLevel > 60 ? 'up' : 
               data?.congestionLevel && data.congestionLevel < 30 ? 'down' : 'neutral'}
      />
      
      <StatCard
        title="Avg Travel Time"
        value={loading ? '' : `${data?.avgTravelTime || 0} min`}
        icon={ClockIcon}
        color="#0ea5e9"
        subtitle="Per 10km journey"
      />
      
      <Link to="/incidents" className="contents">
        <StatCard
          title="Live Incidents"
          value={loading ? '' : data?.liveIncidents || 0}
          icon={ExclamationTriangleIcon}
          color="#f59e0b"
          subtitle="Click to view details"
        />
      </Link>
      
      <StatCard
        title="AI Insight"
        value={loading ? '' : '🤖'}
        icon={SparklesIcon}
        color="#8b5cf6"
        subtitle={data?.aiForecast || 'Analyzing traffic patterns...'}
      />
    </div>
  );
};

export default StatsCards;

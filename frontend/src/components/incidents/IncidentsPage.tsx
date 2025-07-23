import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Define the structure of a traffic incident
interface TrafficIncident {
  type: string;
  properties: {
    id: string;
    iconCategory: string;
    magnitudeOfDelay: string;
    startTime: string;
    endTime: string;
    from: string;
    to: string;
    length: number;
    delay: number;
    roadNumbers: string[];
    events: {
      description: string;
      code: number;
    }[];
  };
}

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Hardcoding 'nairobi' for now, this can be made dynamic later
      const response = await apiService.getLiveIncidents('nairobi');
      if (response.success) {
        setIncidents(response.data || []);
        setLastUpdated(new Date());
      } else {
        setError(response.message || 'Failed to fetch incidents.');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (magnitudeOfDelay: any) => {
    const severity = String(magnitudeOfDelay || '').toLowerCase();
    switch (severity) {
      case 'minor':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'moderate':
        return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'major':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatDelay = (delaySeconds: number) => {
    const minutes = Math.round(delaySeconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Traffic Incidents</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time traffic incident monitoring for Nairobi</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchIncidents}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Live Status Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between bg-white rounded-lg p-4 mb-6 shadow-sm border"
        >
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2" />
            <span className="text-sm font-medium text-gray-700">Live Data Active</span>
          </div>
          <div className="text-sm text-gray-500">
            Total Incidents: <span className="font-semibold text-gray-900">{incidents.length}</span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && incidents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">Loading live incidents...</p>
            <p className="text-sm text-gray-500 mt-1">Fetching real-time data from TomTom</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Incidents</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchIncidents}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* No Incidents State */}
        {!loading && !error && incidents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
          >
            <InformationCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">All Clear!</h3>
            <p className="text-green-600 text-lg">No traffic incidents reported at the moment.</p>
            <p className="text-sm text-green-500 mt-2">Data updates automatically every 30 seconds</p>
          </motion.div>
        )}

        {/* Incidents Grid */}
        {!loading && !error && incidents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {incidents.map((incident, index) => (
              <motion.div
                key={incident.properties.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Incident Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {incident.properties.events[0]?.description || 'Traffic Incident'}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        getSeverityColor(incident.properties.magnitudeOfDelay)
                      }`}>
                        {incident.properties.magnitudeOfDelay || 'Unknown'} Delay
                      </div>
                    </div>
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 flex-shrink-0 ml-2" />
                  </div>

                  {/* Incident Details */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-gray-600"><span className="font-medium">From:</span> {incident.properties.from}</p>
                        <p className="text-gray-600 mt-1"><span className="font-medium">To:</span> {incident.properties.to}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Delay:</span>
                        <span className="ml-1 text-red-600 font-semibold">
                          {formatDelay(incident.properties.delay)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Started:</span>
                        <span className="ml-1 text-gray-600">
                          {new Date(incident.properties.startTime).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {incident.properties.roadNumbers && incident.properties.roadNumbers.length > 0 && (
                      <div className="flex items-center">
                        <InformationCircleIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Roads:</span>
                          <span className="ml-1 text-gray-600">
                            {incident.properties.roadNumbers.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IncidentsPage;

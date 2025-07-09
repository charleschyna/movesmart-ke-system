import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon,
  LocationOnIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';

interface TrafficReport {
  id: string;
  location: string;
  coordinates: [number, number];
  timestamp: string;
  congestionLevel: number;
  avgTravelTime: number;
  incidents: number;
  aiAnalysis: {
    summary: string;
    recommendations: string[];
    severity: 'low' | 'medium' | 'high';
    alternativeRoutes: string[];
  };
  rawData: any;
}

interface TrafficReportGeneratorProps {
  selectedCity: string;
}

const TrafficReportGenerator: React.FC<TrafficReportGeneratorProps> = ({ selectedCity }) => {
  const [location, setLocation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<TrafficReport | null>(null);
  const [reportHistory, setReportHistory] = useState<TrafficReport[]>([]);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  // Load report history from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem('trafficReportHistory');
    if (savedReports) {
      try {
        setReportHistory(JSON.parse(savedReports));
      } catch (error) {
        console.error('Error loading report history:', error);
      }
    }
  }, []);

  // Save report history to localStorage
  const saveReportHistory = (reports: TrafficReport[]) => {
    try {
      localStorage.setItem('trafficReportHistory', JSON.stringify(reports));
      setReportHistory(reports);
    } catch (error) {
      console.error('Error saving report history:', error);
    }
  };

  // Get user's current location
  const getCurrentLocation = async () => {
    setIsUsingCurrentLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsUsingCurrentLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      try {
        const response = await apiService.reverseGeocode(latitude, longitude);
        setLocation(response.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        toast.success('Current location set successfully');
      } catch (error) {
        // Fallback to coordinates if reverse geocoding fails
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        toast.success('Current location set (coordinates)');
      }
    } catch (error: any) {
      console.error('Error getting current location:', error);
      
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location services.');
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please try again.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Error accessing location. Please enter manually.');
      }
    } finally {
      setIsUsingCurrentLocation(false);
    }
  };

  // Generate traffic report
  const generateReport = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location or use current location');
      return;
    }

    setIsGenerating(true);
    
    try {
      // First, geocode the location to get coordinates
      const geocodedLocation = await apiService.geocode(location);
      
      // Generate the traffic report
      const reportResponse = await apiService.generateTrafficReport({
        location: location,
        coordinates: [geocodedLocation.lng, geocodedLocation.lat],
        city: selectedCity
      });

      if (reportResponse.success) {
        const newReport: TrafficReport = {
          id: Date.now().toString(),
          location: location,
          coordinates: [geocodedLocation.lng, geocodedLocation.lat],
          timestamp: new Date().toISOString(),
          congestionLevel: reportResponse.data.congestionLevel || 0,
          avgTravelTime: reportResponse.data.avgTravelTime || 0,
          incidents: reportResponse.data.incidents || 0,
          aiAnalysis: reportResponse.data.aiAnalysis || {
            summary: 'Traffic analysis is being processed...',
            recommendations: [],
            severity: 'medium',
            alternativeRoutes: []
          },
          rawData: reportResponse.data.rawData || {}
        };

        setCurrentReport(newReport);
        
        // Add to history (keep last 10 reports)
        const updatedHistory = [newReport, ...reportHistory].slice(0, 10);
        saveReportHistory(updatedHistory);
        
        toast.success('Traffic report generated successfully!');
      } else {
        toast.error(reportResponse.message || 'Failed to generate traffic report');
      }
    } catch (error: any) {
      console.error('Error generating traffic report:', error);
      toast.error('Failed to generate traffic report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear current report
  const clearReport = () => {
    setCurrentReport(null);
  };

  // Load report from history
  const loadFromHistory = (report: TrafficReport) => {
    setCurrentReport(report);
    setLocation(report.location);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Input Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Traffic Report</h3>
          <SparklesIcon className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="space-y-4">
          {/* Location Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter location or address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={getCurrentLocation}
              disabled={isUsingCurrentLocation || isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUsingCurrentLocation ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <MapPinIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isUsingCurrentLocation ? 'Getting Location...' : 'Use Current Location'}
              </span>
            </button>

            <button
              onClick={generateReport}
              disabled={isGenerating || !location.trim()}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <DocumentTextIcon className="w-4 h-4" />
              )}
              <span>
                {isGenerating ? 'Generating Report...' : 'Generate Traffic Report'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Report Display */}
      {currentReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Traffic Report</h3>
            <button
              onClick={clearReport}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Report Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{currentReport.location}</p>
                <p className="text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  {formatTimestamp(currentReport.timestamp)}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(currentReport.aiAnalysis.severity)}`}>
                {currentReport.aiAnalysis.severity.toUpperCase()}
              </div>
            </div>

            {/* Traffic Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentReport.congestionLevel}%</div>
                <div className="text-sm text-blue-600">Congestion Level</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{currentReport.avgTravelTime}m</div>
                <div className="text-sm text-yellow-600">Avg Travel Time</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{currentReport.incidents}</div>
                <div className="text-sm text-red-600">Active Incidents</div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-yellow-500" />
                AI Analysis
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentReport.aiAnalysis.summary}
              </p>
              
              {currentReport.aiAnalysis.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {currentReport.aiAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Report History */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report History</h3>
        
        {reportHistory.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">
            No reports saved yet. Generate a new report to see it here.
          </p>
        ) : (
          <div className="space-y-3">
            {reportHistory.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => loadFromHistory(report)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{report.location}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(report.timestamp)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${report.aiAnalysis.severity === 'high' ? 'bg-red-500' : report.aiAnalysis.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="text-xs text-gray-500">{report.congestionLevel}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficReportGenerator;

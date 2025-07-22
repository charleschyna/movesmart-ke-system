import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookmarkIcon,
  ShareIcon,
  PrinterIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';
import { DEFAULT_COORDINATES } from '../../constants';
import TrafficReportDisplay from './TrafficReportDisplay';

interface TrafficReport {
  id: number;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  ai_analysis: string;
  ai_recommendations: string;
  congestion_level: number;
  avg_speed: number;
  incident_count: number;
  created_at: string;
  detailed_metrics?: {
    congested_areas_count: number;
    major_routes_analyzed: number;
    analysis_radius_km: number;
    sampling_points: number;
    report_type: string;
  };
}

interface TrafficReportSectionProps {
  selectedCity: { id: string; name: string };
}

const TrafficReportSection: React.FC<TrafficReportSectionProps> = ({ selectedCity }) => {
  const [location, setLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [reportType, setReportType] = useState<'basic' | 'detailed'>('detailed');
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<TrafficReport | null>(null);
  const [reportHistory, setReportHistory] = useState<TrafficReport[]>([]);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Load report history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`traffic_reports_${selectedCity.id}`);
    if (savedHistory) {
      try {
        setReportHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading report history:', error);
      }
    }
  }, [selectedCity.id]);

  // Save report history to localStorage
  const saveReportHistory = (reports: TrafficReport[]) => {
    localStorage.setItem(`traffic_reports_${selectedCity.id}`, JSON.stringify(reports));
    setReportHistory(reports);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use our backend reverse geocoding endpoint
          const response = await fetch('http://localhost:8000/api/traffic/reports/reverse-geocode/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: latitude,
              longitude: longitude
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.address) {
            const address = data.address;
            
            setLocation(address);
            setUseCurrentLocation(true);
            setGettingLocation(false);
            toast.success(`Location detected: ${address}`);
            return;
          }
          
          throw new Error('No results from backend');
        } catch (error) {
          console.warn('Backend reverse geocoding failed:', error);
          
          // Try alternative: Use a simple location name based on coordinates
          const locationName = getLocationNameFromCoords(latitude, longitude);
          if (locationName) {
            setLocation(locationName);
            setUseCurrentLocation(true);
            setGettingLocation(false);
            toast.success(`Location detected: ${locationName}`);
            return;
          }
          
          // Final fallback to coordinates - but we'll store coordinates for the backend
          // and show a user-friendly message
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setUseCurrentLocation(true);
          setGettingLocation(false);
          toast.success('Location detected - will be resolved during report generation');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        toast.error('Unable to get your location. Please enter manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Helper function to get approximate location name from coordinates
  const getLocationNameFromCoords = (lat: number, lng: number): string | null => {
    // Kenya major cities with their approximate coordinates
    const cities = [
      { name: 'Nairobi CBD', lat: -1.2921, lng: 36.8219, radius: 0.05 },
      { name: 'Westlands, Nairobi', lat: -1.2672, lng: 36.8074, radius: 0.03 },
      { name: 'Karen, Nairobi', lat: -1.3195, lng: 36.7073, radius: 0.03 },
      { name: 'Mombasa', lat: -4.0435, lng: 39.6682, radius: 0.1 },
      { name: 'Kisumu', lat: -0.1022, lng: 34.7617, radius: 0.1 },
      { name: 'Nakuru', lat: -0.3031, lng: 36.0800, radius: 0.1 },
      { name: 'Eldoret', lat: 0.5143, lng: 35.2698, radius: 0.1 },
      { name: 'Thika', lat: -1.0332, lng: 37.0692, radius: 0.05 },
      { name: 'Kikuyu, Nairobi', lat: -1.2467, lng: 36.6636, radius: 0.03 },
      { name: 'Kasarani, Nairobi', lat: -1.2284, lng: 36.8979, radius: 0.03 },
      { name: 'Embakasi, Nairobi', lat: -1.3119, lng: 36.8947, radius: 0.03 },
      { name: 'Kiambu', lat: -1.1712, lng: 36.8356, radius: 0.05 },
    ];

    // Find the closest city
    for (const city of cities) {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance <= city.radius) {
        return city.name;
      }
    }

    // If no city found, return a general area description
    if (lat >= -1.5 && lat <= -1.1 && lng >= 36.6 && lng <= 37.1) {
      return 'Nairobi Area';
    }
    if (lat >= -4.2 && lat <= -3.8 && lng >= 39.4 && lng <= 39.9) {
      return 'Mombasa Area';
    }
    if (lat >= -0.3 && lat <= 0.1 && lng >= 34.5 && lng <= 35.0) {
      return 'Kisumu Area';
    }
    
    return null;
  };

  // Generate traffic report
const [showReportPopup, setShowReportPopup] = useState(false);

  const handleDownload = (report: TrafficReport) => {
    // Assume report.downloadUrl is correctly set
    window.open(report.downloadUrl, '_blank');
  };

  const generateReport = async () => {
    if (!location.trim() && !useCurrentLocation) {
      toast.error('Please enter a location or use current location');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        location: location.trim() || selectedCity.name,
        report_type: 'location',
        use_current_location: useCurrentLocation,
        ...(reportType === 'detailed' && { radius_km: radius })
      };

      // Parse coordinates if provided
      if (location.includes(',')) {
        const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          requestData.latitude = lat;
          requestData.longitude = lng;
        }
      }

      const response = reportType === 'detailed' 
        ? await apiService.generateDetailedTrafficReport(requestData)
        : await apiService.generateTrafficReport(requestData);

      if (response.success) {
        const report = response.data;
setCurrentReport(report);
        setShowReportPopup(true); // Show the popup

        // Add to history
        const newHistory = [report, ...reportHistory.slice(0, 9)]; // Keep last 10 reports
        saveReportHistory(newHistory);
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate traffic report');
    } finally {
      setLoading(false);
    }
  };

  // Get congestion level color and text
  const getCongestionInfo = (level: number) => {
    if (level < 25) return { color: 'text-green-600', bg: 'bg-green-50', text: 'Good' };
    if (level < 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Moderate' };
    if (level < 75) return { color: 'text-orange-600', bg: 'bg-orange-50', text: 'Heavy' };
    return { color: 'text-red-600', bg: 'bg-red-50', text: 'Severe' };
  };

  // Format AI analysis with emoji support
  const formatAIAnalysis = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Check for headers (lines starting with emojis and **text**)
      if (line.includes('**') && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(line)) {
        return (
          <div key={index} className="font-semibold text-gray-900 mb-2 flex items-center">
            <span className="text-lg mr-2">{line.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || ''}</span>
            <span>{line.replace(/\*\*/g, '').replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim()}</span>
          </div>
        );
      }
      
      return (
        <div key={index} className="text-gray-700 mb-1">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Generation Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DocumentTextIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generate Traffic Report</h3>
        </div>
        
        <div className="space-y-4">
          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location or Address
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={`Enter location (e.g., "Nairobi CBD", "Westlands") or coordinates`}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Current Location Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </span>
            </button>
          </div>

          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setReportType('basic')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  reportType === 'basic'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Basic Report
              </button>
              <button
                onClick={() => setReportType('detailed')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  reportType === 'detailed'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Detailed Report
              </button>
            </div>
          </div>

          {/* Radius Selection for Detailed Reports */}
          {reportType === 'detailed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Radius: {radius} km
              </label>
              <input
                type="range"
                min="5"
                max="25"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 km</span>
                <span>25 km</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateReport}
            disabled={loading || (!location.trim() && !useCurrentLocation)}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-4 h-4" />
                <span>Generate {reportType === 'detailed' ? 'Detailed' : 'Basic'} Report</span>
              </>
            )}
          </button>
        </div>
      </div>


      {/* Report History */}
      {reportHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-2">
            {reportHistory.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{report.location}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getCongestionInfo(report.congestion_level).bg} ${getCongestionInfo(report.congestion_level).color}`}>
                      {report.congestion_level}%
                    </div>
                    {expandedReport === report.id ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {expandedReport === report.id && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{report.congestion_level}%</div>
                        <div className="text-sm text-gray-500">Congestion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{report.avg_speed.toFixed(1)} km/h</div>
                        <div className="text-sm text-gray-500">Avg Speed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{report.incident_count}</div>
                        <div className="text-sm text-gray-500">Incidents</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentReport(report)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      View Full Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

{/* Report Popup */}
      {showReportPopup && currentReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Report Ready</h3>
            <p className="text-gray-600">Your report for {currentReport.location} is ready.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowReportPopup(false); setCurrentReport(null); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => { setShowReportPopup(false); setCurrentReport(null); handleDownload(currentReport); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download
              </button>
              <button
                onClick={() => { setShowReportPopup(false); window.location.href = '/reports-page'; }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Getting Started Help */}
      {!currentReport && reportHistory.length === 0 && (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <InformationCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Generate Your First Report?</h3>
          <p className="text-blue-700 mb-4">
            Enter a location above and click "Generate Report" to get real-time traffic analysis with AI-powered insights.
          </p>
          <p className="text-sm text-blue-600">
            Try: "Nairobi CBD", "Westlands", or use coordinates like "-1.2921, 36.8219"
          </p>
        </div>
      )}
    </div>
  );
};

export default TrafficReportSection;

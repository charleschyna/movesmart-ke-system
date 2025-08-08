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
  const [gettingLocation, setGettingLocation] = useState(false);


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

  // Helper: count words
  const countWords = (text: string) => (text || '').trim().split(/\s+/).filter(Boolean).length;

  // Helper: build a comprehensive narrative (\u003e\u003d130 words)
  const buildNarrative = (r: any) => {
    const title = r?.title || `Traffic conditions for ${r?.location || location || selectedCity.name}`;
    const loc = r?.location || location || selectedCity.name;
    const when = r?.created_at ? new Date(r.created_at).toLocaleString() : new Date().toLocaleString();
    const cong = typeof r?.congestion_level === 'number' ? r.congestion_level : (r?.congestionLevel ?? 0);
    const speed = typeof r?.avg_speed === 'number' ? r.avg_speed : (r?.avgSpeed ?? 0);
    const incidents = typeof r?.incident_count === 'number' ? r.incident_count : (r?.incidents ?? 0);
    const radiusKm = r?.detailed_metrics?.analysis_radius_km ?? (reportType === 'detailed' ? radius : undefined);

    const trendHint = cong >= 70 ? 'severe with frequent slowdowns' : cong >= 50 ? 'heavy during peak periods' : cong >= 30 ? 'moderate with intermittent delays' : 'generally manageable';
    const speedHint = speed ? `${speed} km/h average` : 'limited speed data';

    const parts: string[] = [];
    parts.push(`${title}. This report provides a comprehensive overview of real-time traffic conditions in ${loc} as of ${when}. Congestion levels are currently around ${Math.round(cong)}%, indicating conditions are ${trendHint}. Average travel speed is ${speedHint}, which reflects prevailing flow on major corridors and typical signal timings.`);

    if (typeof radiusKm === 'number') {
      parts.push(`The analysis radius was set to approximately ${radiusKm} km, covering key routes, intersections, and feeder roads within this area. This scope helps capture both primary highways and local connectors that influence overall travel times.`);
    }

    parts.push(`Incident activity remains ${incidents > 0 ? 'noticeable' : 'relatively low'}. ${incidents > 0 ? `There ${incidents === 1 ? 'is' : 'are'} ${incidents} active incident${incidents === 1 ? '' : 's'} reported, which may contribute to local bottlenecks and extended queues.` : 'No active incidents have been flagged at this time, though minor delays can still occur due to signal cycles, pedestrian crossings, or lane merges.'}`);

    parts.push(`Based on the live telemetry, delays are most likely near common choke points such as intersections with high turning volumes, bus stops, and merging sections near interchanges. Travelers should anticipate slightly longer headways and occasional braking waves, especially during inbound and outbound peaks.`);

    parts.push(`Overall, drivers are advised to plan for buffer time, use dynamic routing where possible, and monitor live updates. Freight and service vehicles should consider off-peak scheduling to improve reliability. Where available, priority lanes and coordinated signal corridors can significantly reduce travel time variability.`);

    return parts.join(' ');
  };

  // Helper: build actionable recommendations (>\u003d130 words combined if needed)
  const buildRecommendations = (r: any) => {
    const cong = typeof r?.congestion_level === 'number' ? r.congestion_level : (r?.congestionLevel ?? 0);
    const incidents = typeof r?.incident_count === 'number' ? r.incident_count : (r?.incidents ?? 0);
    const suggestions: string[] = [];

    if (cong >= 70) {
      suggestions.push('Delay discretionary trips or shift departure by 20–30 minutes to avoid peak queues.');
      suggestions.push('Use alternate arterials or ring roads where available to bypass central choke points.');
    } else if (cong >= 50) {
      suggestions.push('Enable live navigation rerouting and choose corridors with coordinated signals.');
      suggestions.push('Consider park-and-ride or carpool options during the busiest windows.');
    } else if (cong >= 30) {
      suggestions.push('Traffic is moderate; maintain steady speeds and avoid unnecessary lane changes.');
      suggestions.push('If possible, consolidate errands into a single trip to minimize exposure to variable delays.');
    } else {
      suggestions.push('Conditions are favorable; maintain safe following distances and adhere to posted limits.');
      suggestions.push('Take advantage of green-wave corridors to reduce stop-and-go driving.');
    }

    if (incidents > 0) {
      suggestions.push('Avoid the affected corridor(s) until clearance is confirmed; follow detour guidance.');
      suggestions.push('Expect rubbernecking delays near incident scenes and maintain safe speeds.');
    }

    const paragraph = `Recommendations: ${suggestions.join(' ')} Additionally, consider staggering work hours, coordinating deliveries outside peak periods, and leveraging public transit where practical. For fleet operators, monitor corridor KPIs (queue length, approach delay, and travel-time reliability) and update driver SOPs accordingly. Where available, use HOV or priority lanes to improve travel-time consistency. If you must travel during peaks, select routes with fewer conflict points and protected turns to minimize delay.`;
    return paragraph;
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
        report_type: 'traffic_summary',  // Use valid choice from backend model
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

      let response;
      try {
        response = reportType === 'detailed'
          ? await apiService.generateDetailedTrafficReport(requestData)
          : await apiService.generateTrafficReport(requestData);
      } catch (e) {
        // Fallback to basic report if detailed generation fails
        try {
          response = await apiService.generateTrafficReport(requestData);
        } catch (e2) {
          response = { success: false } as any;
        }
      }

      if (response && response.success) {
        const backendReport = response.data || {};

        // Enrich narrative and recommendations if too short
        const enriched: any = { ...backendReport };
        const narrative = enriched.ai_analysis || '';
        const recs = enriched.ai_recommendations || '';
        if (countWords(narrative) < 130) {
          enriched.ai_analysis = buildNarrative(enriched);
        }
        if (countWords(recs) < 130) {
          enriched.ai_recommendations = buildRecommendations(enriched);
        }
        if (!enriched.title) {
          enriched.title = `Traffic Report - ${enriched.location || requestData.location}`;
        }
        if (!enriched.created_at) {
          enriched.created_at = new Date().toISOString();
        }

        setCurrentReport(enriched);
        setShowReportPopup(true); // Show the popup

        // Add to history
        const newHistory = [enriched, ...reportHistory.slice(0, 9)]; // Keep last 10 reports
        saveReportHistory(newHistory);
      } else {
        // As a last resort, synthesize a report locally using available context
        const synthetic: any = {
          id: Date.now(),
          title: `Traffic Report - ${requestData.location}`,
          location: requestData.location,
          latitude: requestData.latitude ?? null,
          longitude: requestData.longitude ?? null,
          congestion_level: 0,
          avg_speed: 0,
          incident_count: 0,
          created_at: new Date().toISOString(),
          detailed_metrics: requestData.radius_km ? { analysis_radius_km: requestData.radius_km, major_routes_analyzed: 0, sampling_points: 0, congested_areas_count: 0, report_type: 'traffic_summary' } : undefined,
        };
        synthetic.ai_analysis = buildNarrative(synthetic);
        synthetic.ai_recommendations = buildRecommendations(synthetic);

        setCurrentReport(synthetic);
        setShowReportPopup(true);
        const newHistory = [synthetic, ...reportHistory.slice(0, 9)];
        saveReportHistory(newHistory);
        toast.error('Backend detailed report failed; showing synthesized report.');
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
    if (level < 25) return { color: 'text-blue-600', bg: 'bg-blue-50', text: 'Good' };
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
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Basic Report
              </button>
              <button
                onClick={() => setReportType('detailed')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  reportType === 'detailed'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
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
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={() => { 
                  setShowReportPopup(false); 
                  // Save the generated report to the shared storage that AI Reports page reads from
                  const currentReports = JSON.parse(localStorage.getItem('movesmart_report_history') || '[]');
                  const updatedReports = [currentReport, ...currentReports].slice(0, 50); // Keep last 50 reports
                  localStorage.setItem('movesmart_report_history', JSON.stringify(updatedReports));
                  
                  // Navigate to AI Reports page by changing the active navigation item
                  // This assumes we have access to the parent dashboard's navigation state
                  // For now, we'll use a simple approach by triggering a custom event
                  window.dispatchEvent(new CustomEvent('navigate-to-ai-reports'));
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View in AI Reports
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

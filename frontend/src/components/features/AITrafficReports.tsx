import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  ChevronRightIcon, 
  EyeIcon, 
  TrashIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  LightBulbIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { STORAGE_KEYS } from '../../constants';
import { toast } from 'react-hot-toast';

interface TrafficReport {
  id: string | number;
  title: string;
  location: string;
  report_type: string;
  created_at: string;
  ai_analysis?: string;
  ai_recommendations?: string;
  congestion_level?: number;
  avg_speed?: number;
  incident_count?: number;
  detailed_metrics?: {
    congested_areas_count: number;
    major_routes_analyzed: number;
    analysis_radius_km: number;
    sampling_points: number;
    report_type: string;
  };
  downloadUrl?: string;
}

const AITrafficReports: React.FC = () => {
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TrafficReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'basic' | 'detailed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'location' | 'type'>('date');

  // Load reports from localStorage and backend API on component mount
  useEffect(() => {
    loadReports();
    
    // Set up interval to check for new reports
    const interval = setInterval(() => {
      loadReports();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    try {
      // Load reports from backend API
      const response = await fetch('http://localhost:8000/api/traffic/reports/');
      if (response.ok) {
        const apiReports = await response.json();
        
        // If the response has a results array (paginated), use that
        const backendReports = Array.isArray(apiReports) ? apiReports : apiReports.results || [];
        
        // Also load from localStorage for any local reports not yet synced
        const savedReports = localStorage.getItem(STORAGE_KEYS.REPORT_HISTORY);
        let localReports = [];
        if (savedReports) {
          try {
            const parsedReports = JSON.parse(savedReports);
            localReports = Array.isArray(parsedReports) ? parsedReports : [];
          } catch (error) {
            console.error('Error parsing local reports:', error);
          }
        }
        
        // Combine backend and local reports, removing duplicates by ID
        const allReports = [...backendReports, ...localReports];
        const uniqueReports = allReports.filter((report, index, self) => 
          index === self.findIndex(r => r.id === report.id)
        );
        
        setReports(uniqueReports);
      } else {
        // Fallback to localStorage only if API fails
        console.warn('Failed to load reports from backend, using localStorage only');
        const savedReports = localStorage.getItem(STORAGE_KEYS.REPORT_HISTORY);
        if (savedReports) {
          try {
            const parsedReports = JSON.parse(savedReports);
            setReports(Array.isArray(parsedReports) ? parsedReports : []);
          } catch (error) {
            console.error('Error parsing local reports:', error);
            setReports([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      // Fallback to localStorage if network fails
      const savedReports = localStorage.getItem(STORAGE_KEYS.REPORT_HISTORY);
      if (savedReports) {
        try {
          const parsedReports = JSON.parse(savedReports);
          setReports(Array.isArray(parsedReports) ? parsedReports : []);
        } catch (error) {
          console.error('Error parsing local reports:', error);
          setReports([]);
        }
      }
    }
  };

  const handleViewReport = (report: TrafficReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleDeleteReport = (reportId: string | number) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(updatedReports));
    toast.success('Report deleted successfully');
  };

  const handleDownloadReport = (report: TrafficReport) => {
    // Generate a simple text report
    const reportContent = `
MOVESMART KENYA - AI TRAFFIC REPORT
===================================

Report Title: ${report.title}
Location: ${report.location}
Generated: ${new Date(report.created_at).toLocaleString()}
Report Type: ${report.report_type?.toUpperCase() || 'BASIC'}

${report.detailed_metrics ? `
DETAILED METRICS:
- Analysis Radius: ${report.detailed_metrics.analysis_radius_km} km
- Major Routes Analyzed: ${report.detailed_metrics.major_routes_analyzed}
- Sampling Points: ${report.detailed_metrics.sampling_points}
- Congested Areas: ${report.detailed_metrics.congested_areas_count}
` : ''}

TRAFFIC CONDITIONS:
- Congestion Level: ${report.congestion_level || 0}%
- Average Speed: ${report.avg_speed || 0} km/h
- Active Incidents: ${report.incident_count || 0}

${report.ai_analysis ? `
AI TRAFFIC ANALYSIS:
${report.ai_analysis}
` : ''}

${report.ai_recommendations ? `
AI RECOMMENDATIONS:
${report.ai_recommendations}
` : ''}

Generated by MoveSmart Kenya Traffic Management System
© ${new Date().getFullYear()} MoveSmart Kenya. All rights reserved.
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic_report_${report.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully');
  };

  const clearAllReports = () => {
    if (window.confirm('Are you sure you want to delete all reports? This action cannot be undone.')) {
      setReports([]);
      localStorage.removeItem(STORAGE_KEYS.REPORT_HISTORY);
      toast.success('All reports cleared');
    }
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'detailed' && report.detailed_metrics) ||
                           (filterType === 'basic' && !report.detailed_metrics);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'location':
          return a.location.localeCompare(b.location);
        case 'type':
          return (b.detailed_metrics ? 'detailed' : 'basic').localeCompare(
                 a.detailed_metrics ? 'detailed' : 'basic'
          );
        default:
          return 0;
      }
    });

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Traffic Reports</h1>
                <p className="text-gray-600">View and manage your generated traffic reports</p>
              </div>
            </div>
            
            {reports.length > 0 && (
              <button
                onClick={clearAllReports}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Clear All Reports
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow-sm mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Reports</option>
                  <option value="basic">Basic Reports</option>
                  <option value="detailed">Detailed Reports</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">Date</option>
                  <option value="location">Location</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reports Grid */}
        {filteredAndSortedReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 
                `No reports match your search for "${searchQuery}"` : 
                'Generate your first AI traffic report from the dashboard to see it here.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Report Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.detailed_metrics 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {report.detailed_metrics ? 'Detailed' : 'Basic'}
                        </span>
                        {report.congestion_level !== undefined && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.congestion_level < 25 ? 'bg-green-100 text-green-700' :
                            report.congestion_level < 50 ? 'bg-yellow-100 text-yellow-700' :
                            report.congestion_level < 75 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {report.congestion_level}% Congestion
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {report.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="truncate">{report.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Stats */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {report.avg_speed || 0}
                      </div>
                      <div className="text-xs text-gray-500">km/h avg</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {report.incident_count || 0}
                      </div>
                      <div className="text-xs text-gray-500">incidents</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {report.detailed_metrics?.major_routes_analyzed || 1}
                      </div>
                      <div className="text-xs text-gray-500">routes</div>
                    </div>
                  </div>
                </div>

                {/* Report Footer */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                    <span>{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Report Detail Modal */}
        {isDetailModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedReport.title}
                  </h2>
                  <p className="text-gray-600">{selectedReport.location}</p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Report Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500">Generated</div>
                    <div className="font-medium">
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Report Type</div>
                    <div className="font-medium">
                      {selectedReport.detailed_metrics ? 'Detailed' : 'Basic'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Congestion</div>
                    <div className="font-medium">
                      {selectedReport.congestion_level || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Avg Speed</div>
                    <div className="font-medium">
                      {selectedReport.avg_speed || 0} km/h
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                {selectedReport.detailed_metrics && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2" />
                      Analysis Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-sm text-blue-600">Analysis Radius</div>
                        <div className="font-bold text-blue-900">
                          {selectedReport.detailed_metrics.analysis_radius_km} km
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-600">Routes Analyzed</div>
                        <div className="font-bold text-blue-900">
                          {selectedReport.detailed_metrics.major_routes_analyzed}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-600">Sampling Points</div>
                        <div className="font-bold text-blue-900">
                          {selectedReport.detailed_metrics.sampling_points}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-600">Congested Areas</div>
                        <div className="font-bold text-blue-900">
                          {selectedReport.detailed_metrics.congested_areas_count}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {selectedReport.ai_analysis && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <LightBulbIcon className="w-5 h-5 mr-2" />
                      AI Traffic Analysis
                    </h3>
                    <div className="p-4 bg-green-50 rounded-lg prose prose-sm max-w-none">
                      {formatAIAnalysis(selectedReport.ai_analysis)}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {selectedReport.ai_recommendations && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      AI Recommendations
                    </h3>
                    <div className="p-4 bg-amber-50 rounded-lg prose prose-sm max-w-none">
                      {formatAIAnalysis(selectedReport.ai_recommendations)}
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download Report</span>
                  </button>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITrafficReports;

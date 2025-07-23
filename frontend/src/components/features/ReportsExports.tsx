import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ShareIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  PrinterIcon,
  EnvelopeIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  PlusCircleIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  MapPinIcon,
  TruckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CITY_ROADS } from '../../constants';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';

interface Report {
  id: string;
  name: string;
  type: 'traffic_summary' | 'incident_analysis' | 'route_performance' | 'city_comparison' | 'predictive' | 'custom';
  description: string;
  city: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: 'generated' | 'generating' | 'scheduled' | 'failed';
  generatedAt: string;
  size: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  downloadUrl?: string;
  insights: {
    totalIncidents: number;
    avgCongestion: number;
    peakHours: string;
    topRoutes: string[];
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    nextRun: string;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  estimatedTime: string;
  sections: string[];
}

interface ExportSettings {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    city: string;
    roads: string[];
    incidentTypes: string[];
  };
}

const ReportsExports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'scheduled' | 'analytics'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [useDropdown, setUseDropdown] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    filters: {
      city: 'Nairobi',
      roads: [],
      incidentTypes: []
    }
  });

  // Mock report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Daily Traffic Summary',
      type: 'traffic_summary',
      description: 'Comprehensive daily traffic analysis with congestion levels, incident reports, and route performance',
      icon: '📊',
      estimatedTime: '2-3 minutes',
      sections: ['Traffic Overview', 'Incident Analysis', 'Peak Hours', 'Route Performance', 'Recommendations']
    },
    {
      id: '2',
      name: 'Incident Analysis Report',
      type: 'incident_analysis',
      description: 'Detailed analysis of traffic incidents including patterns, causes, and impact assessment',
      icon: '⚠️',
      estimatedTime: '3-4 minutes',
      sections: ['Incident Summary', 'Geographic Distribution', 'Time Patterns', 'Impact Analysis', 'Prevention Strategies']
    },
    {
      id: '3',
      name: 'Route Performance Report',
      type: 'route_performance',
      description: 'Analysis of specific routes including travel times, bottlenecks, and optimization opportunities',
      icon: '🛣️',
      estimatedTime: '4-5 minutes',
      sections: ['Route Overview', 'Travel Time Analysis', 'Bottleneck Identification', 'Optimization Recommendations']
    },
    {
      id: '4',
      name: 'City Comparison Report',
      type: 'city_comparison',
      description: 'Comparative analysis between different cities including traffic patterns and performance metrics',
      icon: '🏙️',
      estimatedTime: '5-6 minutes',
      sections: ['City Metrics', 'Comparative Analysis', 'Best Practices', 'Improvement Opportunities']
    },
    {
      id: '5',
      name: 'Predictive Analytics Report',
      type: 'predictive',
      description: 'AI-powered predictions for future traffic patterns and potential issues',
      icon: '🔮',
      estimatedTime: '6-8 minutes',
      sections: ['Traffic Forecasts', 'Risk Assessment', 'Seasonal Patterns', 'AI Recommendations']
    },
    {
      id: '6',
      name: 'Custom Report Builder',
      type: 'custom',
      description: 'Build your own custom report with specific metrics, timeframes, and analysis',
      icon: '🔧',
      estimatedTime: '3-10 minutes',
      sections: ['Custom Sections', 'Selected Metrics', 'Filtered Data', 'Personalized Insights']
    }
  ];

  // Mock reports data
  const mockReports: Report[] = [
    {
      id: '1',
      name: 'Daily Traffic Summary - January 15, 2024',
      type: 'traffic_summary',
      description: 'Comprehensive analysis of traffic patterns for Nairobi on January 15, 2024',
      city: 'Nairobi',
      dateRange: {
        start: '2024-01-15',
        end: '2024-01-15'
      },
      status: 'generated',
      generatedAt: '2024-01-15T23:30:00Z',
      size: '2.4 MB',
      format: 'pdf',
      downloadUrl: '/reports/daily-summary-jan-15.pdf',
      insights: {
        totalIncidents: 23,
        avgCongestion: 68,
        peakHours: '7:30-9:00 AM, 5:00-7:30 PM',
        topRoutes: ['Uhuru Highway', 'Mombasa Road', 'Waiyaki Way']
      }
    },
    {
      id: '2',
      name: 'Weekly Incident Analysis - Week 2, January 2024',
      type: 'incident_analysis',
      description: 'Analysis of traffic incidents for the second week of January 2024',
      city: 'Nairobi',
      dateRange: {
        start: '2024-01-08',
        end: '2024-01-14'
      },
      status: 'generated',
      generatedAt: '2024-01-14T22:15:00Z',
      size: '3.7 MB',
      format: 'pdf',
      downloadUrl: '/reports/incident-analysis-week-2.pdf',
      insights: {
        totalIncidents: 156,
        avgCongestion: 72,
        peakHours: '8:00-9:30 AM, 5:30-7:00 PM',
        topRoutes: ['Thika Road', 'Jogoo Road', 'Langata Road']
      }
    },
    {
      id: '3',
      name: 'Mombasa Route Performance - December 2023',
      type: 'route_performance',
      description: 'Monthly route performance analysis for Mombasa',
      city: 'Mombasa',
      dateRange: {
        start: '2023-12-01',
        end: '2023-12-31'
      },
      status: 'generating',
      generatedAt: '2024-01-10T14:20:00Z',
      size: '5.2 MB',
      format: 'excel',
      insights: {
        totalIncidents: 89,
        avgCongestion: 54,
        peakHours: '7:00-8:30 AM, 4:30-6:00 PM',
        topRoutes: ['Digo Road', 'Malindi Road', 'Nyali Bridge']
      }
    }
  ];

  // Mock scheduled reports
  const scheduledReports = [
    {
      id: '1',
      name: 'Daily Traffic Summary',
      city: 'Nairobi',
      frequency: 'daily',
      nextRun: '2024-01-16T06:00:00Z',
      recipients: ['manager@movesmart.ke', 'analyst@movesmart.ke'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Weekly City Comparison',
      city: 'All Cities',
      frequency: 'weekly',
      nextRun: '2024-01-21T08:00:00Z',
      recipients: ['director@movesmart.ke'],
      status: 'active'
    }
  ];

  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'traffic_summary', label: 'Traffic Summary' },
    { value: 'incident_analysis', label: 'Incident Analysis' },
    { value: 'route_performance', label: 'Route Performance' },
    { value: 'city_comparison', label: 'City Comparison' },
    { value: 'predictive', label: 'Predictive Analytics' },
    { value: 'custom', label: 'Custom Reports' }
  ];

useEffect(() => {
    async function fetchReports() {
      try {
        const response = await apiService.get('/reports');
        if (response.success) {
          setReports(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch reports.');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch reports. Please try again.');
      }
    }
    fetchReports();
  }, []);

  const getCityRoads = (city: string) => {
    const cityKey = city.toLowerCase() as keyof typeof CITY_ROADS;
    return CITY_ROADS[cityKey] || CITY_ROADS.nairobi;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'text-green-600 bg-green-50 border-green-200';
      case 'generating': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scheduled': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return CheckCircleIcon;
      case 'generating': return PlayIcon;
      case 'scheduled': return ClockIcon;
      case 'failed': return ExclamationTriangleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return DocumentTextIcon;
      case 'excel': return TableCellsIcon;
      case 'csv': return DocumentArrowDownIcon;
      case 'json': return CogIcon;
      default: return DocumentTextIcon;
    }
  };

const generateReport = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    toast.loading('Generating report...', { duration: 3000 });

    try {
      const response = await apiService.post('/generate-comprehensive-report', {
        location: useDropdown ? selectedLocation : locationInput,
        city: exportSettings.filters.city,
        report_type: selectedTemplate.type,
        date_start: exportSettings.dateRange.start,
        date_end: exportSettings.dateRange.end,
        format: exportSettings.format,
      });

      if (response.success) {
        setReports([response.data, ...reports]);
        toast.success('Report generated successfully!');
      } else {
        toast.error(response.message || 'Failed to generate report.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
      setShowGenerateModal(false);
      setShowLocationModal(false);
      setSelectedTemplate(null);
      setSelectedLocation('');
      setLocationInput('');
    }
  };

  const downloadReport = (report: Report) => {
    toast.success(`Downloading ${report.name}...`);
    // Simulate download
    console.log('Downloading report:', report.downloadUrl);
  };

  const shareReport = (report: Report) => {
    toast.success('Share link copied to clipboard!');
    // Simulate sharing
    console.log('Sharing report:', report.id);
  };

const scheduleReport = (template: ReportTemplate) => {
    setSelectedReport(template);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (frequency: 'daily' | 'weekly' | 'monthly', recipients: string[]) => {
    try {
      const response = await apiService.post('/schedule-report', {
        templateId: selectedReport?.id,
        frequency,
        recipients,
        city: exportSettings.filters.city,
        format: exportSettings.format
      });
      
      if (response.success) {
        toast.success('Report scheduled successfully!');
        setShowScheduleModal(false);
      } else {
        toast.error(response.message || 'Failed to schedule the report.');
      }
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule the report. Please try again.');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesCity = filterCity === 'all' || report.city === filterCity;
    
    return matchesSearch && matchesType && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
              <p className="text-gray-600">Generate, schedule, and export traffic analytics reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>Generate Report</span>
            </motion.button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'reports', label: 'All Reports', icon: DocumentTextIcon },
            { id: 'templates', label: 'Templates', icon: TableCellsIcon },
            { id: 'scheduled', label: 'Scheduled', icon: ClockIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Reports</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or description..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Report Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actions</label>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <FunnelIcon className="w-4 h-4 inline mr-1" />
                    Filter
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterCity('all');
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Generated Reports ({filteredReports.length})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Total size: {reports.reduce((acc, report) => acc + parseFloat(report.size), 0).toFixed(1)} MB</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h4>
                  <p className="text-gray-600 mb-4">No reports match your current filters</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGenerateModal(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Generate Your First Report
                  </motion.button>
                </div>
              ) : (
                filteredReports.map((report, index) => {
                  const StatusIcon = getStatusIcon(report.status);
                  const FormatIcon = getFormatIcon(report.format);
                  
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <FormatIcon className="w-6 h-6 text-indigo-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{report.name}</h4>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                <StatusIcon className="w-3 h-3" />
                                <span>{report.status}</span>
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {report.format.toUpperCase()}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                            
                            <div className="flex items-center space-x-6 text-xs text-gray-500 mb-4">
                              <span>📍 {report.city}</span>
                              <span>📅 {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}</span>
                              <span>📊 {report.size}</span>
                              <span>🕒 {new Date(report.generatedAt).toLocaleDateString()}</span>
                            </div>
                            
                            {/* Quick Insights */}
                            <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-lg p-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{report.insights.totalIncidents}</div>
                                <div className="text-xs text-gray-600">Incidents</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{report.insights.avgCongestion}%</div>
                                <div className="text-xs text-gray-600">Avg Congestion</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{report.insights.peakHours}</div>
                                <div className="text-xs text-gray-600">Peak Hours</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{report.insights.topRoutes.length}</div>
                                <div className="text-xs text-gray-600">Top Routes</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedReport(report)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </motion.button>
                          
                          {report.status === 'generated' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => downloadReport(report)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download Report"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => shareReport(report)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Share Report"
                              >
                                <ShareIcon className="w-5 h-5" />
                              </motion.button>
                            </>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setReports(reports.filter(r => r.id !== report.id));
                              toast.success('Report deleted');
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Templates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{template.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500">Est. {template.estimatedTime}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                <div className="mb-4">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Includes:</h5>
                  <div className="space-y-1">
                    {template.sections.map((section, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                        <span className="text-xs text-gray-600">{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowLocationModal(true);
                    }}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scheduleReport(template)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Schedule
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <ClockIcon className="w-4 h-4" />
              <span>Schedule Report</span>
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {scheduledReports.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📍 {schedule.city}</span>
                        <span>🔄 {schedule.frequency}</span>
                        <span>⏰ Next: {new Date(schedule.nextRun).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'active' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-600 bg-gray-50'
                    }`}>
                      {schedule.status}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      <CogIcon className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Recipients:</p>
                  <div className="flex flex-wrap gap-2">
                    {schedule.recipients.map((email, i) => (
                      <span key={i} className="px-2 py-1 bg-white text-xs text-gray-700 rounded border">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Generation Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Generation Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="font-medium">{reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scheduled</span>
                  <span className="font-medium">{scheduledReports.length}</span>
                </div>
              </div>
            </div>

            {/* Popular Templates */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <FireIcon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Popular Templates</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Traffic Summary</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">75%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Incident Analysis</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">58%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Route Performance</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">42%</span>
                </div>
              </div>
            </div>

            {/* Export Formats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <CloudArrowDownIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Export Formats</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">PDF</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Excel</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CSV</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">10%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Generate Report</h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Export Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <select
                        value={exportSettings.filters.city}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          filters: { ...exportSettings.filters, city: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Format</label>
                      <select
                        value={exportSettings.format}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          format: e.target.value as any
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={exportSettings.dateRange.start}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          dateRange: { ...exportSettings.dateRange, start: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={exportSettings.dateRange.end}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          dateRange: { ...exportSettings.dateRange, end: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeCharts}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          includeCharts: e.target.checked
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Include charts and visualizations</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeRawData}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          includeRawData: e.target.checked
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Include raw data tables</span>
                    </label>
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Select Template</label>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {reportTemplates.map(template => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateReport(template)}
                        className="p-4 border border-gray-200 rounded-lg text-left hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{template.icon}</span>
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{template.description}</p>
                        <p className="text-xs text-indigo-600 mt-1">Est. {template.estimatedTime}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={useDropdown}
                      onChange={() => setUseDropdown(true)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Choose from predefined options</span>
                  </label>
                </div>
                {useDropdown && (
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!useDropdown}
                      onChange={() => setUseDropdown(false)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Enter a location directly</span>
                  </label>
                </div>
                {!useDropdown && (
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter a location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                <button
                  onClick={generateReport}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsExports;

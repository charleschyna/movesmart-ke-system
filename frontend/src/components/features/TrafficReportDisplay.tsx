import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  InformationCircleIcon,
  BookmarkIcon,
  ShareIcon,
  PrinterIcon,
  ChartBarIcon,
  LightBulbIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

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

interface TrafficReportDisplayProps {
  report: TrafficReport;
  onClose?: () => void;
}

const TrafficReportDisplay: React.FC<TrafficReportDisplayProps> = ({ report, onClose }) => {
  // Get congestion level info
  const getCongestionInfo = (level: number) => {
    if (level < 25) return { color: 'text-green-600', bg: 'bg-green-50', text: 'Good', icon: '🟢' };
    if (level < 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Moderate', icon: '🟡' };
    if (level < 75) return { color: 'text-orange-600', bg: 'bg-orange-50', text: 'Heavy', icon: '🟠' };
    return { color: 'text-red-600', bg: 'bg-red-50', text: 'Severe', icon: '🔴' };
  };

  const congestionInfo = getCongestionInfo(report.congestion_level);

  // Format AI analysis with better typography
  const formatAIAnalysis = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No analysis available</p>;

    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Check for headers (lines starting with emojis and **text**)
      if (line.includes('**') && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(line)) {
        return (
          <div key={index} className="font-semibold text-gray-900 mb-3 flex items-center text-base">
            <span className="text-xl mr-3">{line.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || ''}</span>
            <span>{line.replace(/\*\*/g, '').replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim()}</span>
          </div>
        );
      }
      
      // Check for bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex items-start space-x-3 mb-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 leading-relaxed">{line.replace(/^[•-]\s*/, '')}</span>
          </div>
        );
      }
      
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-white/5 opacity-50">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {report.title}
              </h1>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="font-medium">{report.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{new Date(report.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <BookmarkIcon className="w-5 h-5" />
            </button>
            <button className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <PrinterIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <SignalIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl">{congestionInfo.icon}</span>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {report.congestion_level}%
              </div>
              <div className="text-sm font-medium text-green-800">
                Congestion
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium uppercase tracking-wide">
              {congestionInfo.text}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {report.avg_speed.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-blue-800">
                Avg Speed
              </div>
            </div>
            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">
              KM/H
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {report.incident_count}
              </div>
              <div className="text-sm font-medium text-orange-800">
                Incidents
              </div>
            </div>
            <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">
              ACTIVE
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl">🕐</span>
            </div>
            <div className="mb-2">
              <div className="text-lg font-bold text-purple-600 mb-1">
                {new Date(report.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-purple-800">
                Generated
              </div>
            </div>
            <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">
              {new Date(report.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Detailed Analysis Metrics */}
        {report.detailed_metrics && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-indigo-900">Detailed Analysis Metrics</h3>
                <p className="text-indigo-600">Comprehensive traffic analysis data</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 text-center border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {report.detailed_metrics.congested_areas_count}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Congested Areas
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {report.detailed_metrics.major_routes_analyzed}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Routes Analyzed
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {report.detailed_metrics.analysis_radius_km}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Analysis Radius (km)
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {report.detailed_metrics.sampling_points}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Sampling Points
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Analysis */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Traffic Analysis</h3>
                <p className="text-gray-600">AI-powered insights and patterns</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-gray-700">
                {formatAIAnalysis(report.ai_analysis)}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">AI Recommendations</h3>
                <p className="text-green-700">Actionable insights for optimization</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-100 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none text-green-800">
                {formatAIAnalysis(report.ai_recommendations)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficReportDisplay;

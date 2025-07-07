import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon,
  // LeafIcon and TreePineIcon - don't exist in Heroicons v2, using SparklesIcon as alternative
  LightBulbIcon,
  FireIcon,
  CloudIcon,
  TruckIcon,
  BoltIcon,
  SunIcon,
  AcademicCapIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  EyeIcon,
  ShareIcon,
  CogIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CITY_ROADS } from '../../constants';
import { toast } from 'react-hot-toast';

interface CarbonMetrics {
  totalEmissions: number; // kg CO2
  dailyAverage: number;
  weeklyTrend: number; // percentage change
  vehicleBreakdown: {
    cars: number;
    buses: number;
    trucks: number;
    motorcycles: number;
  };
}

interface GreenInitiative {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'infrastructure' | 'policy' | 'technology';
  status: 'planning' | 'active' | 'completed' | 'paused';
  impact: {
    co2Reduction: number; // kg per day
    costSavings: number; // KSh per month
    peopleAffected: number;
  };
  progress: number; // percentage
  startDate: string;
  estimatedCompletion: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
}

interface EcoRecommendation {
  id: string;
  type: 'route' | 'transport_mode' | 'timing' | 'policy';
  title: string;
  description: string;
  potentialImpact: {
    co2Savings: number;
    timeSavings: number;
    costSavings: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  icon: string;
}

interface SustainabilityGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'emissions' | 'efficiency' | 'adoption' | 'infrastructure';
  description: string;
}

const SustainabilityPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'initiatives' | 'recommendations' | 'goals' | 'insights'>('overview');
  const [selectedCity, setSelectedCity] = useState('Nairobi');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showNewInitiativeModal, setShowNewInitiativeModal] = useState(false);
  const [carbonMetrics, setCarbonMetrics] = useState<CarbonMetrics | null>(null);

  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

  // Mock carbon metrics
  const mockCarbonMetrics: CarbonMetrics = {
    totalEmissions: 15420, // kg CO2 per day
    dailyAverage: 15420,
    weeklyTrend: -3.2, // 3.2% reduction
    vehicleBreakdown: {
      cars: 8250,
      buses: 2100,
      trucks: 3850,
      motorcycles: 1220
    }
  };

  // Mock green initiatives
  const greenInitiatives: GreenInitiative[] = [
    {
      id: '1',
      title: 'Electric Bus Fleet Expansion',
      description: 'Introducing 200 electric buses to replace diesel buses on major routes in Nairobi',
      category: 'transport',
      status: 'active',
      impact: {
        co2Reduction: 2400,
        costSavings: 850000,
        peopleAffected: 50000
      },
      progress: 65,
      startDate: '2024-01-15',
      estimatedCompletion: '2024-12-31',
      location: 'Nairobi',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Green Traffic Light Optimization',
      description: 'AI-powered traffic light systems to reduce idle time and fuel consumption',
      category: 'infrastructure',
      status: 'planning',
      impact: {
        co2Reduction: 1800,
        costSavings: 450000,
        peopleAffected: 200000
      },
      progress: 25,
      startDate: '2024-03-01',
      estimatedCompletion: '2024-09-30',
      location: 'Nairobi, Mombasa',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Bicycle Lane Network',
      description: 'Development of protected bicycle lanes across the city center',
      category: 'infrastructure',
      status: 'active',
      impact: {
        co2Reduction: 950,
        costSavings: 120000,
        peopleAffected: 15000
      },
      progress: 40,
      startDate: '2023-11-01',
      estimatedCompletion: '2024-08-15',
      location: 'Nairobi',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Carbon Offset Program',
      description: 'Tree planting initiative to offset transport emissions',
      category: 'policy',
      status: 'completed',
      impact: {
        co2Reduction: 3200,
        costSavings: 0,
        peopleAffected: 100000
      },
      progress: 100,
      startDate: '2023-06-01',
      estimatedCompletion: '2023-12-31',
      location: 'All Cities',
      priority: 'medium'
    }
  ];

  // Mock eco recommendations
  const ecoRecommendations: EcoRecommendation[] = [
    {
      id: '1',
      type: 'route',
      title: 'Optimize High-Traffic Routes',
      description: 'Implement dynamic routing to reduce congestion on Uhuru Highway during peak hours',
      potentialImpact: {
        co2Savings: 1200,
        timeSavings: 15,
        costSavings: 320000
      },
      difficulty: 'medium',
      timeframe: '3-6 months',
      icon: '🛣️'
    },
    {
      id: '2',
      type: 'transport_mode',
      title: 'Promote Public Transport',
      description: 'Incentivize public transport usage through reduced fares and improved services',
      potentialImpact: {
        co2Savings: 2800,
        timeSavings: 0,
        costSavings: 180000
      },
      difficulty: 'hard',
      timeframe: '6-12 months',
      icon: '🚌'
    },
    {
      id: '3',
      type: 'timing',
      title: 'Flexible Work Hours',
      description: 'Encourage staggered work hours to reduce peak traffic congestion',
      potentialImpact: {
        co2Savings: 1800,
        timeSavings: 25,
        costSavings: 0
      },
      difficulty: 'easy',
      timeframe: '1-3 months',
      icon: '⏰'
    },
    {
      id: '4',
      type: 'technology',
      title: 'Smart Parking Solutions',
      description: 'Implement smart parking systems to reduce time spent searching for parking',
      potentialImpact: {
        co2Savings: 850,
        timeSavings: 12,
        costSavings: 95000
      },
      difficulty: 'medium',
      timeframe: '4-8 months',
      icon: '🅿️'
    }
  ];

  // Mock sustainability goals
  const sustainabilityGoals: SustainabilityGoal[] = [
    {
      id: '1',
      title: 'Reduce Transport Emissions',
      target: 20,
      current: 12.5,
      unit: '% reduction',
      deadline: '2024-12-31',
      category: 'emissions',
      description: 'Achieve 20% reduction in transport-related CO2 emissions by end of 2024'
    },
    {
      id: '2',
      title: 'Electric Vehicle Adoption',
      target: 5000,
      current: 1850,
      unit: 'vehicles',
      deadline: '2025-06-30',
      category: 'adoption',
      description: 'Reach 5,000 registered electric vehicles in the city'
    },
    {
      id: '3',
      title: 'Public Transport Efficiency',
      target: 85,
      current: 72,
      unit: '% efficiency',
      deadline: '2024-09-30',
      category: 'efficiency',
      description: 'Improve public transport efficiency to 85%'
    },
    {
      id: '4',
      title: 'Green Infrastructure',
      target: 50,
      current: 28,
      unit: 'km of bike lanes',
      deadline: '2025-03-31',
      category: 'infrastructure',
      description: 'Build 50km of protected bicycle lanes'
    }
  ];

  useEffect(() => {
    setCarbonMetrics(mockCarbonMetrics);
  }, [selectedCity, timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'active': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'planning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'paused': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return TruckIcon;
      case 'infrastructure': return BuildingOffice2Icon;
      case 'policy': return DocumentTextIcon;
      case 'technology': return BeakerIcon;
      case 'emissions': return CloudIcon;
      case 'efficiency': return BoltIcon;
      case 'adoption': return UserGroupIcon;
      default: return GlobeAltIcon;
    }
  };

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
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sustainability Panel</h1>
              <p className="text-gray-600">Environmental impact tracking and green initiatives</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <SparklesIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Carbon Neutral Goal: 2030</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewInitiativeModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>New Initiative</span>
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'initiatives', label: 'Green Initiatives', icon: SparklesIcon },
            { id: 'recommendations', label: 'Recommendations', icon: LightBulbIcon },
            { id: 'goals', label: 'Sustainability Goals', icon: SparklesIcon },
            { id: 'insights', label: 'AI Insights', icon: BeakerIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Carbon Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <CloudIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex items-center space-x-1 text-red-500">
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">-3.2%</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">
                  {carbonMetrics?.totalEmissions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">kg CO₂ today</div>
              </div>
              <div className="text-xs text-green-600">
                ↓ {Math.abs(carbonMetrics?.weeklyTrend || 0)}% vs last week
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">2,450</div>
                <div className="text-sm text-gray-600">Trees Planted</div>
              </div>
              <div className="text-xs text-green-600">
                ↑ 12% vs last month
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BoltIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-1 text-blue-500">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">+8%</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">1,850</div>
                <div className="text-sm text-gray-600">EVs Registered</div>
              </div>
              <div className="text-xs text-blue-600">
                ↑ 8% vs last month
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">+15%</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">KSh 2.1M</div>
                <div className="text-sm text-gray-600">Monthly Savings</div>
              </div>
              <div className="text-xs text-green-600">
                ↑ 15% vs last month
              </div>
            </motion.div>
          </div>

          {/* Charts and Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Emissions Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Emissions Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Cars</span>
                    </div>
                    <span className="text-sm font-medium">{carbonMetrics?.vehicleBreakdown.cars.toLocaleString()} kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Buses</span>
                    </div>
                    <span className="text-sm font-medium">{carbonMetrics?.vehicleBreakdown.buses.toLocaleString()} kg</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Trucks</span>
                    </div>
                    <span className="text-sm font-medium">{carbonMetrics?.vehicleBreakdown.trucks.toLocaleString()} kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Motorcycles</span>
                    </div>
                    <span className="text-sm font-medium">{carbonMetrics?.vehicleBreakdown.motorcycles.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
              
              {/* Mock Chart Area */}
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive emissions chart</p>
                  <p className="text-sm text-gray-400">Real-time carbon footprint tracking</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions & Impact Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Environmental Impact */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BeakerIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Water Saved</span>
                    </div>
                    <span className="text-sm font-medium">12,450 L</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FireIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Fuel Saved</span>
                    </div>
                    <span className="text-sm font-medium">2,850 L</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Health Score</span>
                    </div>
                    <span className="text-sm font-medium">+8.5%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">View Carbon Report</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <LightBulbIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Get Eco Tips</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShareIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Share Progress</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Green Initiatives Tab */}
      {activeTab === 'initiatives' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Green Initiatives</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{greenInitiatives.length} Active Projects</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {greenInitiatives.map((initiative, index) => {
                const CategoryIcon = getCategoryIcon(initiative.category);
                return (
                  <motion.div
                    key={initiative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{initiative.title}</h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(initiative.status)}`}>
                              {initiative.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(initiative.priority)}`}>
                              {initiative.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{initiative.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{initiative.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${initiative.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{initiative.impact.co2Reduction}</div>
                        <div className="text-xs text-gray-600">kg CO₂/day</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">KSh {(initiative.impact.costSavings / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-600">savings/month</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{(initiative.impact.peopleAffected / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-600">people affected</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>📍 {initiative.location}</span>
                      <span>📅 {new Date(initiative.estimatedCompletion).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Eco-Friendly Recommendations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ecoRecommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="text-3xl">{recommendation.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                          {recommendation.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">⏱️ {recommendation.timeframe}</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Potential Impact</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CO₂ Savings</span>
                        <span className="text-sm font-medium">{recommendation.potentialImpact.co2Savings} kg/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Time Savings</span>
                        <span className="text-sm font-medium">{recommendation.potentialImpact.timeSavings} min/trip</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cost Savings</span>
                        <span className="text-sm font-medium">KSh {(recommendation.potentialImpact.costSavings / 1000).toFixed(0)}K/month</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Implement Recommendation
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sustainability Goals Tab */}
      {activeTab === 'goals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sustainability Goals</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sustainabilityGoals.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100;
                const CategoryIcon = getCategoryIcon(goal.category);
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">
                          {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">{progress.toFixed(1)}% Complete</span>
                        <span className="text-sm text-gray-600">Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        progress >= 100 ? 'text-green-600 bg-green-50' :
                        progress >= 50 ? 'text-blue-600 bg-blue-50' :
                        'text-yellow-600 bg-yellow-50'
                      }`}>
                        {progress >= 100 ? 'Completed' :
                         progress >= 50 ? 'On Track' :
                         'Needs Attention'}
                      </span>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <CogIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Sustainability Insights</h3>
                <p className="text-sm text-gray-600">Powered by MoveSmart AI Engine</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Predictive Analysis */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center space-x-2 mb-4">
                  <BeakerIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Predictive Analysis</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Emission Forecast:</strong> 8% reduction expected by Q3 2024
                    </p>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>EV Adoption:</strong> On track to meet 2024 targets
                    </p>
                  </div>
                </div>
              </div>

              {/* Optimization Opportunities */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center space-x-2 mb-4">
                  <LightBulbIcon className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Optimization Opportunities</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Traffic Light Timing:</strong> 15% fuel savings potential on Uhuru Highway
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Route Optimization:</strong> Alternative routes could reduce emissions by 12%
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                <div className="flex items-center space-x-2 mb-4">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Risk Assessment</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Weather Impact:</strong> Rainy season may increase emissions by 5-8%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Infrastructure:</strong> Low risk to current sustainability projects
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
              <h4 className="font-semibold text-purple-900 mb-4">AI Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">Priority Action</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Implement smart traffic signals on Mombasa Road to reduce idle time by 20%
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <InformationCircleIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">Long-term Strategy</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Expand electric bus fleet to achieve 25% reduction in public transport emissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SustainabilityPanel;

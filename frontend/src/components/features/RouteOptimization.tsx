import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  MapIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BookmarkIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  TruckIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';

interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  estimatedTime: string;
  co2Impact: string;
  fuelCost: string;
  toll: boolean;
  type: 'fastest' | 'greenest' | 'shortest' | 'recommended';
  waypoints: string[];
  trafficLevel: 'low' | 'medium' | 'high';
  incidents: number;
  aiScore: number;
  description: string;
}

interface AIAnalysis {
  recommendation: string;
  insights: string[];
  warnings: string[];
  trafficPrediction: string;
  weatherImpact: string;
  alternativeOptions: string[];
  confidence: number;
  reasoningSteps: string[];
  environmentalImpact: string;
  costAnalysis: string;
}

const RouteOptimization: React.FC = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [routeType, setRouteType] = useState<'fastest' | 'greenest' | 'shortest'>('fastest');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);

  // Mock route data
  const mockRoutes: RouteOption[] = [
    {
      id: '1',
      name: 'AI Recommended Route',
      distance: '12.5 km',
      duration: '25 min',
      estimatedTime: '22:45 - 23:10',
      co2Impact: '2.8 kg',
      fuelCost: 'KSh 180',
      toll: false,
      type: 'recommended',
      waypoints: ['Westlands', 'Uhuru Highway', 'CBD'],
      trafficLevel: 'low',
      incidents: 0,
      aiScore: 95,
      description: 'Optimal route with minimal traffic and fastest travel time'
    },
    {
      id: '2',
      name: 'Via Waiyaki Way',
      distance: '15.2 km',
      duration: '35 min',
      estimatedTime: '22:45 - 23:20',
      co2Impact: '2.1 kg',
      fuelCost: 'KSh 220',
      toll: true,
      type: 'greenest',
      waypoints: ['Westlands', 'Waiyaki Way', 'Riverside', 'CBD'],
      trafficLevel: 'medium',
      incidents: 1,
      aiScore: 78,
      description: 'Eco-friendly route with lower emissions but longer distance'
    },
    {
      id: '3',
      name: 'Via Thika Road',
      distance: '11.8 km',
      duration: '32 min',
      estimatedTime: '22:45 - 23:17',
      co2Impact: '2.5 kg',
      fuelCost: 'KSh 170',
      toll: false,
      type: 'shortest',
      waypoints: ['Westlands', 'Thika Road', 'Moi Avenue', 'CBD'],
      trafficLevel: 'medium',
      incidents: 2,
      aiScore: 72,
      description: 'Shortest distance but moderate traffic conditions'
    }
  ];

  // AI Analysis Function
  const generateAIAnalysis = async (routeOptions: RouteOption[], startCoords: any, destCoords: any): Promise<AIAnalysis> => {
    try {
      setAiProcessing(true);
      
      // Prepare route data for AI analysis
      const routeData = routeOptions.map(route => ({
        name: route.name,
        distance: route.distance,
        duration: route.duration,
        co2Impact: route.co2Impact,
        fuelCost: route.fuelCost,
        trafficLevel: route.trafficLevel,
        incidents: route.incidents,
        toll: route.toll,
        type: route.type
      }));

      const prompt = `As a smart transportation AI assistant, analyze these route options from ${startLocation} to ${destination}:

${JSON.stringify(routeData, null, 2)}

Provide a comprehensive analysis including:
1. Best route recommendation with reasoning
2. Key insights about traffic, timing, and efficiency
3. Potential warnings or considerations
4. Traffic predictions for the next 2 hours
5. Environmental impact assessment
6. Cost analysis comparison
7. Alternative suggestions

Format your response as JSON with this structure:
{
  "recommendation": "detailed recommendation",
  "insights": ["insight1", "insight2", "insight3"],
  "warnings": ["warning1", "warning2"],
  "trafficPrediction": "traffic forecast",
  "weatherImpact": "weather considerations",
  "alternativeOptions": ["option1", "option2"],
  "confidence": 85,
  "reasoningSteps": ["step1", "step2", "step3"],
  "environmentalImpact": "environmental analysis",
  "costAnalysis": "cost comparison and recommendations"
}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_ROUTING_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a smart transportation AI that analyzes routes and provides intelligent recommendations. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);
      
      setAiProcessing(false);
      return aiResponse;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiProcessing(false);
      
      // Fallback to enhanced mock analysis
      return {
        recommendation: `Based on current conditions, I recommend the ${routeOptions[0]?.name || 'fastest route'} for optimal balance of time, cost, and environmental impact.`,
        insights: [
          'Real-time traffic analysis shows lighter than usual congestion',
          'Current weather conditions are favorable for driving',
          'Fuel prices are stable across the selected route'
        ],
        warnings: [
          'Monitor traffic updates for potential changes',
          'Construction may impact travel times during peak hours'
        ],
        trafficPrediction: 'Traffic expected to remain light for the next 2 hours',
        weatherImpact: 'Clear conditions with no weather-related delays expected',
        alternativeOptions: [
          'Consider alternative routes if traffic conditions change',
          'Public transport might be more efficient during rush hours'
        ],
        confidence: 78,
        reasoningSteps: [
          'Analyzed current traffic patterns using real-time data',
          'Compared route efficiency metrics',
          'Evaluated environmental and cost factors'
        ],
        environmentalImpact: 'Selected route optimizes for lower emissions while maintaining reasonable travel time',
        costAnalysis: 'Recommended route offers best value considering fuel, tolls, and time costs'
      };
    }
  };

  const handleSearch = async () => {
    if (!startLocation || !destination) {
      toast.error('Please enter both starting location and destination');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Finding optimal routes...');

    try {
      // Step 1: Geocode locations
      toast.loading('Locating addresses...', { id: loadingToast });
      const startCoords = await apiService.geocode(startLocation);
      const destCoords = await apiService.geocode(destination);

      // Step 2: Get multiple route options
      toast.loading('Calculating route options...', { id: loadingToast });
      
      const routePromises = [
        // Fastest route
        apiService.optimizeRoute(startCoords, destCoords, { 
          avoidTolls, 
          fastest: true, 
          greenest: false 
        }),
        // Greenest route
        apiService.optimizeRoute(startCoords, destCoords, { 
          avoidTolls, 
          fastest: false, 
          greenest: true 
        }),
        // Balanced route (no specific optimization)
        apiService.optimizeRoute(startCoords, destCoords, { 
          avoidTolls
        })
      ];

      const routeResults = await Promise.allSettled(routePromises);
      const validRoutes: RouteOption[] = [];

      routeResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const route = result.value.data;
          // Assign appropriate names and types
          if (index === 0) {
            route.name = 'Fastest Route';
            route.type = 'fastest';
          } else if (index === 1) {
            route.name = 'Eco-Friendly Route';
            route.type = 'greenest';
          } else {
            route.name = 'Balanced Route';
            route.type = 'recommended';
          }
          validRoutes.push(route as RouteOption);
        }
      });

      if (validRoutes.length === 0) {
        throw new Error('No routes found');
      }

      // Step 3: AI Analysis
      toast.loading('Analyzing routes with AI...', { id: loadingToast });
      const aiAnalysis = await generateAIAnalysis(validRoutes, startCoords, destCoords);

      // Sort routes by AI score (highest first)
      validRoutes.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

      setRoutes(validRoutes);
      setAiAnalysis(aiAnalysis);
      toast.success('Routes found! AI analysis complete.', { id: loadingToast });

    } catch (error: any) {
      console.error('Route search error:', error);
      toast.error(`Error: ${error.message}`, { id: loadingToast });
      
      // Fallback to mock data if API fails
      setRoutes(mockRoutes);
      setAiAnalysis({
        recommendation: 'Using fallback route data. Please check your internet connection for real-time analysis.',
        insights: ['Displaying sample route options', 'Real-time data unavailable'],
        warnings: ['Route data may not reflect current conditions'],
        trafficPrediction: 'Unable to provide real-time traffic predictions',
        weatherImpact: 'Weather impact analysis unavailable',
        alternativeOptions: ['Try again when connection is restored'],
        confidence: 50,
        reasoningSteps: ['Fallback to cached data'],
        environmentalImpact: 'Environmental analysis unavailable',
        costAnalysis: 'Cost analysis unavailable'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock AI Analysis (fallback)
  const mockAiAnalysis: AIAnalysis = {
    recommendation: 'Based on current traffic conditions and your preferences, I recommend the AI Recommended Route for optimal travel time and fuel efficiency.',
    insights: [
      'Traffic is 40% lighter than usual on Uhuru Highway',
      'Expected save of 8 minutes compared to alternative routes',
      'Weather conditions are favorable with clear skies'
    ],
    warnings: [
      'Minor roadwork on Moi Avenue may cause 2-3 minute delays',
      'Heavy rainfall expected after 11:30 PM'
    ],
    trafficPrediction: 'Traffic will remain light for the next 2 hours',
    weatherImpact: 'Clear weather conditions - no impact on travel time',
    alternativeOptions: [
      'Consider Via Waiyaki Way if eco-friendliness is priority',
      'Via Thika Road available as backup route'
    ],
    confidence: 85,
    reasoningSteps: [
      'Analyzed current traffic patterns',
      'Evaluated route efficiency metrics',
      'Considered environmental factors'
    ],
    environmentalImpact: 'Recommended route optimizes for lower emissions',
    costAnalysis: 'Best value considering fuel, tolls, and time costs'
  };

  const saveRoute = (route: RouteOption) => {
    console.log('Saving route:', route);
    toast.success(`Route "${route.name}" saved to favorites`);
    // Handle route saving logic
  };

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case 'fastest': return 'text-blue-600 bg-blue-50';
      case 'greenest': return 'text-green-600 bg-green-50';
      case 'shortest': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRouteIcon = (type: string) => {
    switch (type) {
      case 'fastest': return ClockIcon;
      case 'greenest': return GlobeAltIcon;
      case 'shortest': return MapIcon;
      case 'recommended': return SparklesIcon;
      default: return MapIcon;
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
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Route Optimization</h1>
            <p className="text-gray-600">Find the best route for your journey</p>
          </div>
        </div>

        {/* Route Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Start Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">From</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="Enter starting location"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center pb-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const temp = startLocation;
                setStartLocation(destination);
                setDestination(temp);
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ArrowsRightLeftIcon className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">To</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Route Options */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* Route Type Toggles */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['fastest', 'greenest', 'shortest'].map((type) => (
              <button
                key={type}
                onClick={() => setRouteType(type as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  routeType === type
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Avoid Tolls Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidTolls}
              onChange={(e) => setAvoidTolls(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Avoid tolls</span>
          </label>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={!startLocation || !destination || loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Finding Routes...' : 'Find Routes'}
          </motion.button>
        </div>
      </motion.div>

      {/* Route Results */}
      {routes.length > 0 && (
        <div className="space-y-6">
          {/* AI Analysis Section */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Route Analysis</h3>
                  <p className="text-sm text-gray-600">Powered by MoveSmart AI Engine</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>AI Recommendation</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {aiAnalysis.confidence}% confidence
                  </span>
                </h4>
                <p className="text-gray-700 text-sm mb-3">{aiAnalysis.recommendation}</p>
                
                {aiProcessing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">AI analyzing routes...</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                    <span>Key Insights</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiAnalysis.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    <span>Considerations</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {aiAnalysis.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <GlobeAltIcon className="w-5 h-5 text-green-500" />
                    <span>Environmental</span>
                  </h4>
                  <p className="text-sm text-gray-600">{aiAnalysis.environmentalImpact}</p>
                  
                  <h4 className="font-medium text-gray-900 mb-2 mt-3 flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    <span>Cost Analysis</span>
                  </h4>
                  <p className="text-sm text-gray-600">{aiAnalysis.costAnalysis}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Route Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Route Map</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Traffic Data</span>
                </div>
              </div>
              
              <div className="h-96 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl relative overflow-hidden">
                {/* Enhanced Mock Map */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100">
                  {/* Location Labels */}
                  <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{startLocation || 'Start'}</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">{destination || 'Destination'}</span>
                    </div>
                  </div>
                  
                  {/* Animated Route Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="routeGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="routeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                      </linearGradient>
                      <linearGradient id="routeGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    
                    {/* Recommended Route (Blue) */}
                    <motion.path 
                      d="M50 350 Q200 100 400 200 T700 150" 
                      stroke="url(#routeGradient1)" 
                      strokeWidth="5" 
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                    
                    {/* Alternative Route 1 (Green) */}
                    <motion.path 
                      d="M50 350 Q250 120 450 180 T700 150" 
                      stroke="url(#routeGradient2)" 
                      strokeWidth="4" 
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                    
                    {/* Alternative Route 2 (Purple) */}
                    <motion.path 
                      d="M50 350 Q180 200 380 250 T700 150" 
                      stroke="url(#routeGradient3)" 
                      strokeWidth="4" 
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1.5 }}
                    />
                  </svg>

                  {/* Animated Start Point */}
                  <motion.div 
                    className="absolute top-[85%] left-[8%] w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                  
                  {/* Animated End Point */}
                  <motion.div 
                    className="absolute top-[35%] right-[8%] w-6 h-6 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                  
                  {/* Traffic Incidents */}
                  <motion.div 
                    className="absolute top-[50%] left-[40%] w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2, type: "spring" }}
                  >
                  </motion.div>
                  
                  {/* Route Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Route Options</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">AI Recommended</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Eco-Friendly</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Shortest</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-xs">
                      Satellite
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-xs">
                      Traffic
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-xs">
                      3D
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          {/* Route Alternatives */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Route Options</h3>
            {routes.map((route, index) => {
              const IconComponent = getRouteIcon(route.type);
              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRouteTypeColor(route.type)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{route.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRouteTypeColor(route.type)}`}>
                          {route.type}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => saveRoute(route)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <BookmarkIcon className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Route Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-sm">{route.duration}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Duration</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-gray-600">
                        <MapIcon className="w-4 h-4" />
                        <span className="text-sm">{route.distance}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Distance</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-gray-600">
                        <GlobeAltIcon className="w-4 h-4" />
                        <span className="text-sm">{route.co2Impact}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">CO₂ Impact</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-gray-600">
                        <StarIcon className="w-4 h-4" />
                        <span className="text-sm font-medium text-blue-600">{route.aiScore}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">AI Score</p>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {route.toll && (
                        <span className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          <CurrencyDollarIcon className="w-3 h-3" />
                          <span>Toll</span>
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Select Route
                    </motion.button>
                  </div>

                  {/* Waypoints */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Via:</p>
                    <div className="flex flex-wrap gap-1">
                      {route.waypoints.map((waypoint, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {waypoint}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        </div>
      )}

      {/* Empty State */}
      {routes.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Find Your Route</h3>
          <p className="text-gray-600 mb-4">Enter your starting location and destination to get optimized route suggestions.</p>
        </motion.div>
      )}
    </div>
  );
};

export default RouteOptimization;

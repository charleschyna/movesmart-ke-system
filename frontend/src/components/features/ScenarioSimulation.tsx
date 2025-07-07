import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  CogIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon,
  PlusCircleIcon,
  TrashIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { CITY_ROADS } from '../../constants';
import { toast } from 'react-hot-toast';

interface ScenarioEvent {
  id: string;
  type: 'accident' | 'roadwork' | 'weather' | 'event' | 'closure';
  name: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  duration: number; // in minutes
  startTime: string;
  description: string;
  impact: {
    delayMinutes: number;
    affectedRoutes: string[];
    trafficIncrease: number; // percentage
  };
}

interface SimulationParams {
  city: string;
  timeOfDay: string;
  dayOfWeek: string;
  weatherCondition: string;
  baseTrafficLevel: number;
  duration: number; // simulation duration in minutes
}

interface SavedScenario {
  id: string;
  name: string;
  description: string;
  city: string;
  events: ScenarioEvent[];
  params: SimulationParams;
  createdAt: string;
  lastModified: string;
}

interface SimulationResult {
  timePoint: number;
  congestionLevel: number;
  affectedRoutes: number;
  avgDelay: number;
  trafficVolume: number;
}

const ScenarioSimulation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'create' | 'simulate' | 'results' | 'saved'>('create');
  const [selectedCity, setSelectedCity] = useState('Nairobi');
  const [events, setEvents] = useState<ScenarioEvent[]>([]);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    city: 'Nairobi',
    timeOfDay: '08:00',
    dayOfWeek: 'monday',
    weatherCondition: 'clear',
    baseTrafficLevel: 60,
    duration: 120
  });
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScenarioEvent | null>(null);

  // Mock saved scenarios
  const mockSavedScenarios: SavedScenario[] = [
    {
      id: '1',
      name: 'Morning Rush Hour Accident',
      description: 'Simulation of major accident during peak morning hours on Uhuru Highway',
      city: 'Nairobi',
      events: [],
      params: simulationParams,
      createdAt: '2024-01-15',
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marathon Event Impact',
      description: 'Road closures and traffic rerouting during Nairobi Marathon',
      city: 'Nairobi',
      events: [],
      params: simulationParams,
      createdAt: '2024-01-14',
      lastModified: '2024-01-14'
    }
  ];

  useEffect(() => {
    setSavedScenarios(mockSavedScenarios);
  }, []);

  // Simulation playback
  useEffect(() => {
    if (isPlaying && currentTime < simulationParams.duration) {
      const interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + speed, simulationParams.duration));
      }, 1000 / speed);
      return () => clearInterval(interval);
    } else if (currentTime >= simulationParams.duration) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentTime, speed, simulationParams.duration]);

  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const weatherConditions = ['clear', 'rain', 'heavy_rain', 'fog', 'storm'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getCityRoads = (city: string) => {
    const cityKey = city.toLowerCase() as keyof typeof CITY_ROADS;
    return CITY_ROADS[cityKey] || CITY_ROADS.nairobi;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'accident': return ExclamationTriangleIcon;
      case 'roadwork': return CogIcon;
      case 'weather': return CloudIcon;
      case 'event': return UserGroupIcon;
      case 'closure': return XMarkIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'accident': return 'from-red-500 to-red-600';
      case 'roadwork': return 'from-orange-500 to-orange-600';
      case 'weather': return 'from-blue-500 to-blue-600';
      case 'event': return 'from-purple-500 to-purple-600';
      case 'closure': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const createNewEvent = (): ScenarioEvent => ({
    id: Date.now().toString(),
    type: 'accident',
    name: 'New Event',
    location: getCityRoads(selectedCity)[1]?.name || 'Unknown Road',
    severity: 'medium',
    duration: 60,
    startTime: '08:00',
    description: 'Event description',
    impact: {
      delayMinutes: 15,
      affectedRoutes: [getCityRoads(selectedCity)[1]?.name || 'Unknown Road'],
      trafficIncrease: 25
    }
  });

  const addEvent = () => {
    setEditingEvent(createNewEvent());
    setShowEventModal(true);
  };

  const saveEvent = (event: ScenarioEvent) => {
    if (editingEvent && events.find(e => e.id === editingEvent.id)) {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      setEvents([...events, event]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
    toast.success('Event saved successfully');
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast.success('Event deleted');
  };

  const runSimulation = () => {
    toast.loading('Running simulation...', { duration: 2000 });
    
    // Mock simulation results
    const results: SimulationResult[] = [];
    for (let i = 0; i <= simulationParams.duration; i += 5) {
      const baseLevel = simulationParams.baseTrafficLevel;
      const timeMultiplier = Math.sin((i / simulationParams.duration) * Math.PI) * 0.3 + 0.7;
      const eventImpact = events.reduce((impact, event) => {
        const eventStart = parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]);
        const eventEnd = eventStart + event.duration;
        if (i >= eventStart && i <= eventEnd) {
          return impact + event.impact.trafficIncrease;
        }
        return impact;
      }, 0);
      
      results.push({
        timePoint: i,
        congestionLevel: Math.min(100, Math.max(0, baseLevel * timeMultiplier + eventImpact)),
        affectedRoutes: events.filter(e => {
          const eventStart = parseInt(e.startTime.split(':')[0]) * 60 + parseInt(e.startTime.split(':')[1]);
          const eventEnd = eventStart + e.duration;
          return i >= eventStart && i <= eventEnd;
        }).length,
        avgDelay: Math.round(eventImpact * 0.6),
        trafficVolume: Math.round(300 + (baseLevel * timeMultiplier + eventImpact) * 5)
      });
    }
    
    setSimulationResults(results);
    setActiveTab('results');
    
    setTimeout(() => {
      toast.success('Simulation completed successfully');
    }, 2000);
  };

  const saveScenario = () => {
    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name: `Scenario - ${new Date().toLocaleDateString()}`,
      description: `Custom scenario with ${events.length} events`,
      city: selectedCity,
      events: [...events],
      params: { ...simulationParams },
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setSavedScenarios([...savedScenarios, newScenario]);
    toast.success('Scenario saved successfully');
  };

  const loadScenario = (scenario: SavedScenario) => {
    setSelectedCity(scenario.city);
    setEvents(scenario.events);
    setSimulationParams(scenario.params);
    setActiveTab('create');
    toast.success(`Loaded scenario: ${scenario.name}`);
  };

  const resetSimulation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    toast.success('Simulation reset');
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BeakerIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scenario Simulation</h1>
              <p className="text-gray-600">Test traffic scenarios and analyze their impact</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Simulation Ready</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'create', label: 'Create Scenario', icon: PlusCircleIcon },
            { id: 'simulate', label: 'Run Simulation', icon: PlayIcon },
            { id: 'results', label: 'Results', icon: ChartBarIcon },
            { id: 'saved', label: 'Saved Scenarios', icon: FolderOpenIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Create Scenario Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenario Parameters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Parameters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSimulationParams({...simulationParams, city: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Time of Day</label>
                  <input
                    type="time"
                    value={simulationParams.timeOfDay}
                    onChange={(e) => setSimulationParams({...simulationParams, timeOfDay: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Day of Week</label>
                  <select
                    value={simulationParams.dayOfWeek}
                    onChange={(e) => setSimulationParams({...simulationParams, dayOfWeek: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Weather</label>
                  <select
                    value={simulationParams.weatherCondition}
                    onChange={(e) => setSimulationParams({...simulationParams, weatherCondition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {weatherConditions.map(weather => (
                      <option key={weather} value={weather}>
                        {weather.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Base Traffic Level: {simulationParams.baseTrafficLevel}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={simulationParams.baseTrafficLevel}
                    onChange={(e) => setSimulationParams({...simulationParams, baseTrafficLevel: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    min="30"
                    max="480"
                    value={simulationParams.duration}
                    onChange={(e) => setSimulationParams({...simulationParams, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Events */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Scenario Events</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addEvent}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <PlusCircleIcon className="w-4 h-4" />
                  <span>Add Event</span>
                </motion.button>
              </div>

              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <BeakerIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No events added yet</p>
                    <p className="text-sm text-gray-400">Add events to simulate their impact on traffic</p>
                  </div>
                ) : (
                  events.map((event, index) => {
                    const IconComponent = getEventIcon(event.type);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${getEventColor(event.type)} rounded-lg flex items-center justify-center`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{event.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(event.severity)}`}>
                                  {event.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>📍 {event.location}</span>
                                <span>🕒 {event.startTime} ({event.duration}min)</span>
                                <span>📈 +{event.impact.trafficIncrease}% traffic</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setShowEventModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

          {/* Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={runSimulation}
                  disabled={events.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>Run Simulation</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveScenario}
                  disabled={events.length === 0}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span>Save Scenario</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEvents([]);
                    setCurrentTime(0);
                    setIsPlaying(false);
                    toast.success('Scenario cleared');
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Clear All</span>
                </motion.button>
              </div>
            </div>

            {/* Scenario Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Events:</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">{simulationParams.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base Traffic:</span>
                  <span className="font-medium">{simulationParams.baseTrafficLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weather:</span>
                  <span className="font-medium capitalize">{simulationParams.weatherCondition.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center space-x-2 mb-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Simulation Tips</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Add multiple events to see complex interactions</li>
                <li>• Consider peak hours for realistic results</li>
                <li>• Weather conditions affect traffic patterns</li>
                <li>• Save scenarios for future comparison</li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}

      {/* Simulate Tab */}
      {activeTab === 'simulate' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Simulation Control</h3>
          
          {/* Control Panel */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPlaying(false)}
                className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <StopIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetSimulation}
                className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Speed:</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
              
              <div className="text-lg font-mono">
                {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                {(currentTime % 60).toString().padStart(2, '0')} / 
                {Math.floor(simulationParams.duration / 60).toString().padStart(2, '0')}:
                {(simulationParams.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / simulationParams.duration) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Simulation Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Visualization */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Live Traffic Map</h4>
              <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden">
                {/* Mock map visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive map visualization</p>
                    <p className="text-sm text-gray-400">Real-time traffic flow simulation</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Live Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Live Metrics</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Congestion</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(simulationParams.baseTrafficLevel + (currentTime / simulationParams.duration) * 20)}%
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ClockIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-600">Avg Delay</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(events.length * 8 + (currentTime / simulationParams.duration) * 10)} min
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">Active Events</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {events.filter(event => {
                      const eventStart = parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]);
                      const eventEnd = eventStart + event.duration;
                      return currentTime >= eventStart && currentTime <= eventEnd;
                    }).length}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TruckIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Traffic Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(300 + simulationParams.baseTrafficLevel * 5 + events.length * 50)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Simulation Results</h3>
            
            {simulationResults.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h4>
                <p className="text-gray-600 mb-4">Run a simulation to see detailed results and analysis</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Scenario
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Results Summary */}
                <div className="lg:col-span-2">
                  <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Results visualization chart</p>
                      <p className="text-sm text-gray-400">Traffic patterns over time</p>
                    </div>
                  </div>
                </div>
                
                {/* Key Insights */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Key Insights</h4>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Peak Impact</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Maximum congestion reached 85% during event overlap
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Critical Period</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Heavy delays between 8:30-9:15 AM due to accident
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Recommendation</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Alternative routes could reduce impact by 40%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Saved Scenarios Tab */}
      {activeTab === 'saved' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Saved Scenarios</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                  <span className="text-xs text-gray-500">{scenario.city}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Events: {scenario.events.length}</span>
                  <span>{scenario.createdAt}</span>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadScenario(scenario)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Load
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSavedScenarios(savedScenarios.filter(s => s.id !== scenario.id));
                      toast.success('Scenario deleted');
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && editingEvent && (
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
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Event Type</label>
                  <select
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="accident">Accident</option>
                    <option value="roadwork">Roadwork</option>
                    <option value="weather">Weather</option>
                    <option value="event">Event</option>
                    <option value="closure">Road Closure</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingEvent.name}
                    onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Event name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <select
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getCityRoads(selectedCity).map(road => (
                      <option key={road.id} value={road.name}>{road.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Severity</label>
                    <select
                      value={editingEvent.severity}
                      onChange={(e) => setEditingEvent({...editingEvent, severity: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Duration (min)</label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={editingEvent.duration}
                      onChange={(e) => setEditingEvent({...editingEvent, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({...editingEvent, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Event description"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Traffic Increase: {editingEvent.impact.trafficIncrease}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={editingEvent.impact.trafficIncrease}
                    onChange={(e) => setEditingEvent({
                      ...editingEvent,
                      impact: {...editingEvent.impact, trafficIncrease: parseInt(e.target.value)}
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => saveEvent(editingEvent)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Event
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScenarioSimulation;

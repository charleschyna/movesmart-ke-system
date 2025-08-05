import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  CloudIcon,
  BoltIcon,
  EyeSlashIcon,
  WindIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { City } from '../../types';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    visibility: number;
    pressure: number;
    feelsLike: number;
    uvIndex: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }>;
  alerts: Array<{
    type: string;
    severity: string;
    description: string;
    startTime: string;
    endTime: string;
  }>;
}

interface WeatherPageProps {
  selectedCity?: City;
}

const WeatherPage: React.FC<WeatherPageProps> = ({ selectedCity }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock weather data for demonstration
  const mockWeatherData: WeatherData = {
    current: {
      temperature: 24,
      condition: 'Partly Cloudy',
      humidity: 68,
      windSpeed: 12,
      windDirection: 'NE',
      visibility: 10,
      pressure: 1013,
      feelsLike: 26,
      uvIndex: 6,
      icon: 'partly-cloudy'
    },
    forecast: [
      { date: 'Today', high: 26, low: 18, condition: 'Partly Cloudy', icon: 'partly-cloudy', precipitation: 20 },
      { date: 'Tomorrow', high: 28, low: 20, condition: 'Sunny', icon: 'sunny', precipitation: 5 },
      { date: 'Wednesday', high: 23, low: 16, condition: 'Rainy', icon: 'rainy', precipitation: 80 },
      { date: 'Thursday', high: 25, low: 17, condition: 'Cloudy', icon: 'cloudy', precipitation: 30 },
      { date: 'Friday', high: 27, low: 19, condition: 'Sunny', icon: 'sunny', precipitation: 10 },
    ],
    alerts: [
      {
        type: 'Heavy Rain Warning',
        severity: 'medium',
        description: 'Heavy rainfall expected Wednesday evening. Potential for flooding in low-lying areas.',
        startTime: '2024-01-17 18:00',
        endTime: '2024-01-18 06:00'
      }
    ]
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setWeatherData(mockWeatherData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedCity]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <SunIcon className="w-8 h-8 text-yellow-500" />;
      case 'partly-cloudy':
        return <CloudIcon className="w-8 h-8 text-gray-500" />;
      case 'cloudy':
        return <CloudIcon className="w-8 h-8 text-gray-600" />;
      case 'rainy':
        return <CloudIcon className="w-8 h-8 text-blue-500" />;
      case 'thunderstorm':
        return <BoltIcon className="w-8 h-8 text-purple-600" />;
      default:
        return <SunIcon className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getTrafficImpact = (condition: string, windSpeed: number, visibility: number, precipitation: number) => {
    let impact = 'Low';
    let color = 'green';
    let description = 'Minimal impact on traffic conditions';

    if (condition.toLowerCase().includes('rain') || precipitation > 50) {
      impact = 'High';
      color = 'red';
      description = 'Wet roads may cause slower traffic and reduced visibility';
    } else if (condition.toLowerCase().includes('storm') || windSpeed > 20) {
      impact = 'Very High';
      color = 'red';
      description = 'Severe weather conditions may significantly impact traffic';
    } else if (visibility < 5 || condition.toLowerCase().includes('fog')) {
      impact = 'Medium';
      color = 'yellow';
      description = 'Reduced visibility may slow traffic';
    } else if (condition.toLowerCase().includes('cloud') || windSpeed > 15) {
      impact = 'Low';
      color = 'yellow';
      description = 'Slight impact on traffic conditions';
    }

    return { impact, color, description };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading weather data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center text-red-600">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4" />
            <p>{error || 'Failed to load weather data'}</p>
          </div>
        </div>
      </div>
    );
  }

  const trafficImpact = getTrafficImpact(
    weatherData.current.condition,
    weatherData.current.windSpeed,
    weatherData.current.visibility,
    weatherData.forecast[0]?.precipitation || 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Conditions</h1>
          <p className="text-gray-600">Current weather and forecast for {selectedCity?.name || 'Nairobi'}</p>
        </div>
        <div className="text-sm text-gray-500">
          <ClockIcon className="w-4 h-4 inline mr-1" />
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Weather Alert</h3>
              {weatherData.alerts.map((alert, index) => (
                <div key={index} className="mt-2">
                  <p className="text-sm font-medium text-amber-700">{alert.type}</p>
                  <p className="text-sm text-amber-600">{alert.description}</p>
                  <p className="text-xs text-amber-500 mt-1">
                    {alert.startTime} - {alert.endTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Conditions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Weather Display */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getWeatherIcon(weatherData.current.icon)}
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {weatherData.current.temperature}°C
                </div>
                <div className="text-lg text-gray-600">{weatherData.current.condition}</div>
                <div className="text-sm text-gray-500">
                  Feels like {weatherData.current.feelsLike}°C
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Humidity</div>
                <div className="text-lg font-semibold text-gray-900">{weatherData.current.humidity}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Wind</div>
                <div className="text-lg font-semibold text-gray-900">
                  {weatherData.current.windSpeed} km/h {weatherData.current.windDirection}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Visibility</div>
                <div className="text-lg font-semibold text-gray-900">{weatherData.current.visibility} km</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Pressure</div>
                <div className="text-lg font-semibold text-gray-900">{weatherData.current.pressure} hPa</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Traffic Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Impact</h2>
          
          <div className={`rounded-lg p-4 mb-4 ${
            trafficImpact.color === 'green' ? 'bg-green-50 border border-green-200' :
            trafficImpact.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-lg font-semibold ${
              trafficImpact.color === 'green' ? 'text-green-800' :
              trafficImpact.color === 'yellow' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {trafficImpact.impact} Impact
            </div>
            <div className={`text-sm ${
              trafficImpact.color === 'green' ? 'text-green-600' :
              trafficImpact.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {trafficImpact.description}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Road Conditions</span>
              <span className={`text-sm font-medium ${
                weatherData.current.condition.toLowerCase().includes('rain') ? 'text-red-600' : 'text-green-600'
              }`}>
                {weatherData.current.condition.toLowerCase().includes('rain') ? 'Wet' : 'Dry'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Visibility</span>
              <span className={`text-sm font-medium ${
                weatherData.current.visibility < 5 ? 'text-red-600' : 
                weatherData.current.visibility < 8 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {weatherData.current.visibility < 5 ? 'Poor' : 
                 weatherData.current.visibility < 8 ? 'Fair' : 'Good'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Wind Impact</span>
              <span className={`text-sm font-medium ${
                weatherData.current.windSpeed > 20 ? 'text-red-600' :
                weatherData.current.windSpeed > 15 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {weatherData.current.windSpeed > 20 ? 'High' :
                 weatherData.current.windSpeed > 15 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weatherData.forecast.map((day, index) => (
            <div key={index} className="text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-900 mb-2">{day.date}</div>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="text-xs text-gray-600 mb-2">{day.condition}</div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="font-semibold text-gray-900">{day.high}°</span>
                <span className="text-gray-500">{day.low}°</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {day.precipitation}% rain
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weather History Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-600">
            <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
            <p>Weather trends chart would be displayed here</p>
            <p className="text-sm text-gray-500">Integration with weather API required</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeatherPage;
